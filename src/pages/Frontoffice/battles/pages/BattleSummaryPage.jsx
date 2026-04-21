/**
 * BattleSummaryPage – completed battle results
 *
 * Victory/Defeat banner, scoreboard, round breakdown,
 * and performance analytics — all dynamically derived.
 */
import React, { useEffect, useRef, useState } from 'react';
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
    const [shareCopied, setShareCopied] = useState(false);

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
    const resultTone = winner === 'player' ? 'victory' : winner === 'opponent' ? 'defeat' : 'draw';

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
    const heroBigWord = winner === 'player'
        ? 'WINNER'
        : winner === 'opponent'
            ? 'REMATCH'
            : 'BALANCED';

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
    const playerAvatar = typeof battle.player?.avatar === 'string' && battle.player.avatar.trim() !== ''
        ? battle.player.avatar
        : null;
    const opponentAvatar = typeof battle.opponent?.avatar === 'string' && battle.opponent.avatar.trim() !== ''
        ? battle.opponent.avatar
        : null;

    const getInitials = (name) => {
        if (!name) return 'PL';
        const cleaned = String(name).trim();
        if (!cleaned) return 'PL';
        const parts = cleaned.split(/\s+/).slice(0, 2);
        return parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'PL';
    };

    const handleShareResults = async () => {
        const shareText = `${t('battles.battleResults')} - ${battle.player.name} ${playerScore} : ${opponentScore} ${battle.opponent?.name || t('battles.opponent')}`;
        const shareUrl = window.location.href;
        const payload = `${shareText}\n${shareUrl}`;

        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(payload);
                setShareCopied(true);
                window.setTimeout(() => setShareCopied(false), 1800);
            }
        } catch {
            // silently ignore clipboard permission errors
        }
    };

    return (
        <div className="battle-page battle-summary-page">
            <div className="battle-summary-shell">
                <div className="battle-summary-topbar battle-mb-lg battle-summary-animate battle-summary-animate--1">
                    <button
                        className="battle-btn battle-btn--secondary"
                        onClick={() => navigate('/battles')}
                    >
                        {t('battles.backToArenaArrow')}
                    </button>
                    <span className={`battle-summary-chip battle-summary-chip--${resultTone}`}>
                        {bannerTitle}
                    </span>
                </div>

                <section className={`${bannerClass} battle-summary-hero battle-mb-xl battle-summary-animate battle-summary-animate--2`}>
                    <div className="battle-summary-watermark" aria-hidden="true">{heroBigWord}</div>
                    <div className="battle-summary-hero__content">
                        <p className="battle-summary-overline">{t('battles.statusCompleted')}</p>
                        <h1 className="battle-summary-title">
                            {t('battles.battleResults')}
                        </h1>
                        <p className="battle-summary-subtitle">{bannerSubtitle}</p>
                        <div className="battle-summary-meta">
                            <span className="battle-summary-meta-pill">{t('battles.roundsCompleted', { count: battle.totalRounds })}</span>
                            <span className="battle-summary-meta-pill">{durationMins > 0 ? t('battles.nMinutes', { n: durationMins }) : t('battles.justNow')}</span>
                            <span className="battle-summary-meta-pill">{t('battles.winnerLabel')} {winnerName}</span>
                        </div>
                    </div>
                    <div className="battle-summary-stats-grid">
                        <div className="battle-summary-stat-card">
                            <p className="battle-summary-stat-label">{t('battles.roundsWon')}</p>
                            <p className="battle-summary-stat-value">{playerWins} - {opponentWins}</p>
                        </div>
                        <div className="battle-summary-stat-card">
                            <p className="battle-summary-stat-label">{t('battles.xpEarned')}</p>
                            <p className="battle-summary-stat-value">+{xpEarned}</p>
                        </div>
                        <div className="battle-summary-stat-card">
                            <p className="battle-summary-stat-label">{t('battles.rankProgress')}</p>
                            <p className="battle-summary-stat-value">{rankProgress > 0 ? '+' : ''}{rankProgress} {t('battles.points')}</p>
                        </div>
                    </div>
                </section>

                <section className={`battle-summary-duel battle-summary-duel--${resultTone} battle-mb-xl battle-summary-animate battle-summary-animate--3`}>
                    <article className="battle-summary-combatant">
                        {playerAvatar ? (
                            <img
                                src={playerAvatar}
                                alt={battle.player.name}
                                className={`battle-scoreboard__avatar ${winner === 'player' ? 'battle-scoreboard__avatar--winner' : 'battle-scoreboard__avatar--player'}`}
                            />
                        ) : (
                            <div className="battle-summary-initials battle-summary-initials--player">{getInitials(battle.player?.name)}</div>
                        )}
                        <p className="battle-summary-combatant-name">{battle.player.name}</p>
                        <p className="battle-summary-combatant-score">{playerScore}</p>
                        <p className="battle-summary-combatant-caption">{t('battles.finalScore')}</p>
                    </article>

                    <div className="battle-summary-versus">
                        <div className="battle-summary-versus-core">VS</div>
                        <div className="battle-summary-versus-line" />
                        <p className="battle-summary-versus-caption">{t('battles.winnerLabel')} {winnerName}</p>
                    </div>

                    <article className="battle-summary-combatant">
                        {opponentAvatar ? (
                            <img
                                src={opponentAvatar}
                                alt={battle.opponent?.name || t('battles.opponent')}
                                className={`battle-scoreboard__avatar ${winner === 'opponent' ? 'battle-scoreboard__avatar--winner' : 'battle-scoreboard__avatar--opponent'}`}
                            />
                        ) : (
                            <div className="battle-summary-initials battle-summary-initials--opponent">
                                {getInitials(battle.opponent?.name || t('battles.opponent'))}
                            </div>
                        )}
                        <p className="battle-summary-combatant-name">{battle.opponent?.name || t('battles.unknown')}</p>
                        <p className="battle-summary-combatant-score">{opponentScore}</p>
                        <p className="battle-summary-combatant-caption">{t('battles.finalScore')}</p>
                    </article>
                </section>

                {/* Detailed Results */}
                <div className="battle-mb-xl battle-summary-animate battle-summary-animate--4">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">
                        {t('battles.battleResults')}
                    </h2>
                    <div className="battle-results-grid">
                        <div className="battle-result-card battle-summary-result-card">
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

                        <div className="battle-result-card battle-summary-result-card">
                            <div className="battle-result-title">
                                {winner === 'opponent' && isAiBattle ? t('battles.iGotYou') : battle.opponent?.name || t('battles.opponent')}
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
                </div>

                {/* Round Breakdown */}
                <div className="battle-mb-xl battle-summary-animate battle-summary-animate--5">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.roundBreakdown')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {battle.rounds.map(round => (
                            <RoundCard key={round.index} round={round} />
                        ))}
                    </div>
                </div>

                {/* Performance Analytics */}
                <div className="battle-mb-xl battle-summary-animate battle-summary-animate--6">
                    <h2 className="battle-text-xl battle-font-bold battle-mb-md">{t('battles.performanceAnalytics')}</h2>
                    <PerformanceAnalytics battle={battle} />
                </div>

                {/* Action Buttons */}
                <div className="battle-summary-actions battle-summary-animate battle-summary-animate--7">
                    <button className="battle-btn battle-btn--primary" onClick={() => navigate('/battles')}>
                        {t('battles.challengeAgain')}
                    </button>
                    <button className="battle-btn battle-btn--secondary" onClick={() => navigate('/battles')}>
                        {t('battles.backToArena')}
                    </button>
                </div>

                <div className="battle-summary-share-card battle-summary-animate battle-summary-animate--8">
                    <div>
                        <p className="battle-summary-share-label">{t('battles.shareResults')}</p>
                        <h3 className="battle-summary-share-title">{battle.player.name} {playerScore} : {opponentScore} {battle.opponent?.name || t('battles.opponent')}</h3>
                        <p className="battle-summary-share-caption">{t('battles.winnerLabel')} {winnerName}</p>
                    </div>
                    <button className="battle-btn battle-btn--secondary" onClick={handleShareResults}>
                        {shareCopied ? 'Copied' : t('battles.shareResults')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BattleSummaryPage;
