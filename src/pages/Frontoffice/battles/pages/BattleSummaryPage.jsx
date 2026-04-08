/**
 * BattleSummaryPage – completed battle results
 *
 * Victory/Defeat banner, scoreboard, round breakdown,
 * and performance analytics — all dynamically derived.
 */
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBattleState } from '../hooks/useBattleState';
import { useChallengeContext } from '../../challenges/context/ChallengeContext';
import { useAuth } from '../../auth/context/AuthContext';
import { userService } from '../../../../services/userService';
import {
    getTotalPlayerScore,
    getTotalOpponentScore,
    getWinner,
    getRoundsWon,
    getXPEarned,
    getRankProgress,
    BattleMode,
    BattleStatus,
} from '../types/battle.types';
import ScoreBoard from '../components/ScoreBoard';
import RoundCard from '../components/RoundCard';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import '../battles.css';

const BattleSummaryPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { battles, selectBattle, deselectBattle } = useBattleState();
    const { refreshUserStats } = useChallengeContext();
    const { currentUser } = useAuth();
    const xpAwardInFlightRef = useRef(false);

    const battle = battles.find(b => b.id === id);

    useEffect(() => {
        if (id) selectBattle(id);
        return () => deselectBattle();
    }, [id, selectBattle, deselectBattle]);

    useEffect(() => {
        refreshUserStats?.();
    }, [refreshUserStats]);

    useEffect(() => {
        const awardXpIfNeeded = async () => {
            if (!battle) return;
            if (battle.status !== BattleStatus.COMPLETED) return;

            const currentUserId = currentUser?.userId || currentUser?._id || currentUser?.id || currentUser?.username || null;
            if (!currentUserId) return;

            const xpEarned = Number(getXPEarned(battle) ?? 0);
            if (!Number.isFinite(xpEarned) || xpEarned <= 0) return;

            const awardedKey = `battle-xp-awarded:${currentUserId}:${battle.id}`;
            if (localStorage.getItem(awardedKey)) return;
            if (xpAwardInFlightRef.current) return;

            xpAwardInFlightRef.current = true;
            try {
                await userService.updateMyXp(xpEarned);
                localStorage.setItem(awardedKey, JSON.stringify({ xpEarned, awardedAt: new Date().toISOString() }));
                await refreshUserStats?.();
            } catch (err) {
                console.error('Failed to award battle XP:', err);
            } finally {
                xpAwardInFlightRef.current = false;
            }
        };

        awardXpIfNeeded();
    }, [battle, currentUser, refreshUserStats]);

    if (!battle) {
        return (
            <div className="battle-page">
                <div className="battle-container battle-text-center" style={{ paddingTop: '4rem' }}>
                    <h2 className="battle-text-2xl battle-font-bold battle-mb-md">{t('battles.notFound')}</h2>
                    <p className="battle-text-muted battle-mb-lg">{t('battles.notFoundDesc')}</p>
                    <button className="battle-btn battle-btn--primary" onClick={() => navigate('/battles')}>
                        {t('battles.backToArena')}
                    </button>
                </div>
            </div>
        );
    }

    const playerScore = getTotalPlayerScore(battle);
    const opponentScore = getTotalOpponentScore(battle);
    const winner = getWinner(battle);
    const playerWins = getRoundsWon(battle, 'player');
    const opponentWins = getRoundsWon(battle, 'opponent');
    const xpEarned = getXPEarned(battle);
    const rankProgress = getRankProgress(battle);

    const isAiBattle = battle.mode === BattleMode.ONE_VS_AI;
    const winnerName = winner === 'player'
        ? battle.player.name
        : winner === 'opponent'
            ? (isAiBattle ? t('battles.iGotYou') : battle.opponent?.name || t('battles.opponent'))
            : t('battles.drawResult');

    const durationMins = battle.completedAt && battle.createdAt
        ? Math.round((new Date(battle.completedAt) - new Date(battle.createdAt)) / 60000)
        : 0;

    const bannerClass = winner === 'player'
        ? 'battle-victory-banner'
        : winner === 'opponent'
            ? 'battle-defeat-banner'
            : 'battle-draw-banner';

    const bannerEmoji = winner === 'player' ? '🏆' : winner === 'opponent' ? (isAiBattle ? '🤖' : '😔') : '🤝';
    const bannerTitle = winner === 'player'
        ? t('battles.playerWinsTitle', { name: battle.player.name })
        : winner === 'opponent'
            ? (isAiBattle ? t('battles.iGotYou') : t('battles.defeat'))
            : t('battles.draw');
    const bannerSubtitle = winner === 'player'
        ? t('battles.outpaced', { player: battle.player.name, opponent: battle.opponent?.name || t('battles.opponent') })
        : winner === 'opponent'
            ? (isAiBattle ? t('battles.botEdged') : t('battles.opponentWon', { name: battle.opponent?.name }))
            : t('battles.tieWith', { name: battle.opponent?.name });

    const aggregateResults = (side) => {
        const results = battle.rounds
            .map((round) => (side === 'player' ? round.playerResult : round.opponentResult))
            .filter(Boolean);

        if (!results.length) return null;

        const avgExecutionMs = Math.round(results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length);
        const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
        const mostCommon = (values) => {
            const freq = values.reduce((acc, val) => {
                if (!val) return acc;
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {});
            return Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || 'Unknown';
        };

        const timeComplexity = mostCommon(results.map((r) => r.timeComplexity));
        const spaceComplexity = mostCommon(results.map((r) => r.spaceComplexity));

        return {
            avgExecutionMs,
            totalScore,
            timeComplexity,
            spaceComplexity,
            criteria: [
                t('battles.roundsWonCriteria', { count: side === 'player' ? playerWins : opponentWins }),
                t('battles.totalScoreCriteria', { score: totalScore }),
                t('battles.avgExecutionCriteria', { ms: avgExecutionMs }),
                t('battles.complexityCriteria', { time: timeComplexity, space: spaceComplexity }),
            ],
        };
    };

    const playerAggregate = aggregateResults('player');
    const opponentAggregate = aggregateResults('opponent');

    return (
        <div className="battle-page">
            <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
                {/* Header */}
                <div className="battle-text-center battle-mb-xl">
                    <button
                        className="battle-btn battle-btn--secondary"
                        onClick={() => navigate('/battles')}
                        style={{ marginBottom: '1.5rem' }}
                    >
                        {t('battles.backToArenaArrow')}
                    </button>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        {t('battles.battleResults')}
                    </h1>
                    <p className="battle-text-muted" style={{ fontSize: '1.125rem' }}>
                        {t('battles.roundsCompleted', { count: battle.totalRounds })} • {durationMins > 0 ? t('battles.nMinutes', { n: durationMins }) : t('battles.justNow')}
                    </p>
                </div>

                {/* Victory/Defeat Banner */}
                <div className={bannerClass}>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{bannerEmoji}</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                        {bannerTitle}
                    </h2>
                    <p style={{ color: 'white', fontSize: '1.125rem' }}>{bannerSubtitle}</p>
                </div>

                {/* Scoreboard */}
                <div className="battle-card battle-mb-xl" style={{ border: `1px solid ${winner === 'player' ? '#22c55e' : '#ef4444'}` }}>
                    <div className="battle-scoreboard">
                        {/* Player */}
                        <div className="battle-scoreboard__player">
                            <img
                                src={battle.player.avatar}
                                alt={battle.player.name}
                                className={`battle-scoreboard__avatar ${winner === 'player' ? 'battle-scoreboard__avatar--winner' : 'battle-scoreboard__avatar--player'}`}
                            />
                            <h3 className="battle-text-lg battle-font-bold" style={{ marginBottom: '0.5rem' }}>
                                {battle.player.name}
                            </h3>
                            {winner === 'player' && (
                                <span className="battle-badge battle-badge--green" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{t('battles.winner')}</span>
                            )}
                            <p className={`battle-font-bold battle-text-5xl ${winner === 'player' ? 'battle-text-green' : ''}`} style={{ marginBottom: '0.25rem' }}>
                                {playerScore}
                            </p>
                            <p className="battle-text-xs battle-text-muted battle-text-uppercase">{t('battles.finalScore')}</p>
                        </div>

                        {/* Center Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                            <div className="battle-text-center">
                                <p className="battle-text-muted battle-text-sm" style={{ marginBottom: '0.25rem' }}>{t('battles.roundsWon')}</p>
                                <p className="battle-text-xl battle-font-bold battle-text-green">{playerWins} - {opponentWins}</p>
                            </div>
                            <div className="battle-text-center">
                                <p className="battle-text-muted battle-text-sm" style={{ marginBottom: '0.25rem' }}>{t('battles.xpEarned')}</p>
                                <p className="battle-text-xl battle-font-bold battle-text-yellow">+{xpEarned} XP</p>
                            </div>
                            <div className="battle-text-center">
                                <p className="battle-text-muted battle-text-sm" style={{ marginBottom: '0.25rem' }}>{t('battles.rankProgress')}</p>
                                <p className="battle-text-xl battle-font-bold battle-text-cyan">
                                    {rankProgress > 0 ? '+' : ''}{rankProgress} {t('battles.points')}
                                </p>
                            </div>
                        </div>

                        {/* Opponent */}
                        <div className="battle-scoreboard__player">
                            {battle.opponent?.avatar ? (
                                <img
                                    src={battle.opponent.avatar}
                                    alt={battle.opponent.name}
                                    className={`battle-scoreboard__avatar ${winner === 'opponent' ? 'battle-scoreboard__avatar--winner' : 'battle-scoreboard__avatar--opponent'}`}
                                />
                            ) : (
                                <div className="battle-ai-avatar battle-ai-avatar--lg" style={{ margin: '0 auto 1rem', border: '4px solid #475569' }}>AI</div>
                            )}
                            <h3 className="battle-text-lg battle-font-bold" style={{ marginBottom: '0.5rem' }}>
                                {battle.opponent?.name || t('battles.unknown')}
                            </h3>
                            {winner !== 'player' && winner !== 'draw' ? (
                                <span className="battle-badge battle-badge--green" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{t('battles.winner')}</span>
                            ) : (
                                <span className="battle-badge battle-badge--gray" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{t('battles.defeated')}</span>
                            )}
                            <p className="battle-font-bold battle-text-5xl" style={{ color: winner === 'opponent' ? '#22c55e' : '#cbd5e1', marginBottom: '0.25rem' }}>
                                {opponentScore}
                            </p>
                            <p className="battle-text-xs battle-text-muted battle-text-uppercase">{t('battles.finalScore')}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.detailedResults')}</h2>
                    <div className="battle-results-grid">
                        <div className="battle-result-card">
                            <div className="battle-result-title">{battle.player.name}</div>
                            {playerAggregate ? (
                                <>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.executionTimeLabel')}</span>
                                        <strong>{playerAggregate.avgExecutionMs}ms</strong>
                                    </div>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.timeSpace')}</span>
                                        <strong>{playerAggregate.timeComplexity} / {playerAggregate.spaceComplexity}</strong>
                                    </div>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.score')}</span>
                                        <strong>{playerAggregate.totalScore}</strong>
                                    </div>
                                    <div className="battle-result-criteria">
                                        {playerAggregate.criteria.map((item, idx) => (
                                            <div key={`player-crit-${idx}`}>{item}</div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="battle-empty">{t('battles.noPerformanceData')}</div>
                            )}
                        </div>

                        <div className="battle-result-card">
                            <div className="battle-result-title">
                                {winner === 'opponent' && isAiBattle ? `🤖 ${t('battles.iGotYou')}` : battle.opponent?.name || t('battles.opponent')}
                            </div>
                            {opponentAggregate ? (
                                <>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.executionTimeLabel')}</span>
                                        <strong>{opponentAggregate.avgExecutionMs}ms</strong>
                                    </div>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.timeSpace')}</span>
                                        <strong>{opponentAggregate.timeComplexity} / {opponentAggregate.spaceComplexity}</strong>
                                    </div>
                                    <div className="battle-result-metric">
                                        <span>{t('battles.score')}</span>
                                        <strong>{opponentAggregate.totalScore}</strong>
                                    </div>
                                    <div className="battle-result-criteria">
                                        {opponentAggregate.criteria.map((item, idx) => (
                                            <div key={`opp-crit-${idx}`}>{item}</div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="battle-empty">{t('battles.noPerformanceData')}</div>
                            )}
                        </div>
                    </div>
                    <div className="battle-result-winner">
                        {t('battles.winnerLabel')} <strong>{winnerName}</strong>
                    </div>
                </div>

                {/* Round Breakdown */}
                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.roundBreakdown')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {battle.rounds.map(round => (
                            <RoundCard key={round.index} round={round} />
                        ))}
                    </div>
                </div>

                {/* Performance Analytics */}
                <div className="battle-mb-xl">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.performanceAnalytics')}</h2>
                    <PerformanceAnalytics battle={battle} />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                    <button className="battle-btn battle-btn--primary" onClick={() => navigate('/battles')}>
                        {t('battles.challengeAgain')}
                    </button>
                    <button className="battle-btn battle-btn--secondary" onClick={() => navigate('/battles')}>
                        {t('battles.backToArena')}
                    </button>
                    <button className="battle-btn battle-btn--secondary">
                        {t('battles.shareResults')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BattleSummaryPage;
