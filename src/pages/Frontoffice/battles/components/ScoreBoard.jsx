/**
 * ScoreBoard – player vs opponent scoreboard
 *
 * Used in both ActiveBattlePage and BattleSummaryPage.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BattleMode } from '../types/battle.types';

const ScoreBoard = ({ battle, playerScore, opponentScore, isResult = false, winner = null }) => {
    const { t } = useTranslation();
    const isAI = battle.mode === BattleMode.ONE_VS_AI;

    return (
        <div className="battle-scoreboard">
            {/* Player */}
            <div className="battle-scoreboard__player">
                <img
                    src={battle.player.avatar}
                    alt={battle.player.name}
                    className={`battle-scoreboard__avatar ${isResult && winner === 'player'
                            ? 'battle-scoreboard__avatar--winner'
                            : 'battle-scoreboard__avatar--player'
                        }`}
                />
                <h3 className="battle-text-lg battle-font-bold" style={{ marginBottom: '0.25rem' }}>
                    {battle.player.name}
                </h3>
                {isResult && winner === 'player' && (
                    <span className="battle-badge battle-badge--green" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                        {t('battles.winner')}
                    </span>
                )}
                {!isResult && (
                    <p className="battle-text-sm battle-text-muted" style={{ marginBottom: '0.75rem' }}>
                        {t('battles.levelLeague', { level: battle.player.level, league: battle.player.league })}
                    </p>
                )}
                <p className={`battle-font-bold ${isResult ? 'battle-text-5xl' : 'battle-text-3xl'} ${isResult && winner === 'player' ? 'battle-text-green' : 'battle-text-cyan'
                    }`} style={{ marginBottom: '0.25rem' }}>
                    {playerScore}
                </p>
                <p className="battle-text-xs battle-text-muted battle-text-uppercase">
                    {isResult ? t('battles.finalScore') : t('battles.currentScore')}
                </p>
            </div>

            {/* VS */}
            <div className="battle-scoreboard__vs">
                <div className="battle-scoreboard__vs-circle">
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{t('battles.vs')}</span>
                </div>
                {!isResult && battle.rounds && (
                    <>
                        <p className="battle-text-muted battle-text-sm" style={{ marginBottom: '0.5rem' }}>{t('battles.roundProgress')}</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {battle.rounds.map((r, i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '0.75rem',
                                        height: '0.75rem',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            r.status === 'COMPLETED' ? '#22c55e' :
                                                r.status === 'IN_PROGRESS' ? '#22d3ee' : 'var(--color-border)',
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Opponent */}
            <div className="battle-scoreboard__player">
                {isAI ? (
                    <div className="battle-ai-avatar battle-ai-avatar--lg" style={{
                        margin: '0 auto 1rem',
                        border: isResult && winner === 'opponent' ? '4px solid #22c55e' : '4px solid #475569',
                    }}>
                        AI
                    </div>
                ) : (
                    <img
                        src={battle.opponent?.avatar || ''}
                        alt={battle.opponent?.name || t('battles.opponent')}
                        className={`battle-scoreboard__avatar ${isResult && winner === 'opponent'
                                ? 'battle-scoreboard__avatar--winner'
                                : 'battle-scoreboard__avatar--opponent'
                            }`}
                    />
                )}
                <h3 className="battle-text-lg battle-font-bold" style={{ marginBottom: '0.25rem' }}>
                    {battle.opponent?.name || t('battles.unknown')}
                </h3>
                {isResult && winner === 'opponent' && (
                    <span className="battle-badge battle-badge--green" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                        {t('battles.winner')}
                    </span>
                )}
                {isResult && winner !== 'opponent' && (
                    <span className="battle-badge battle-badge--gray" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                        {t('battles.defeated')}
                    </span>
                )}
                {!isResult && (
                    <p className="battle-text-sm battle-text-muted" style={{ marginBottom: '0.75rem' }}>
                        {t('battles.levelLeague', { level: battle.opponent?.level, league: battle.opponent?.league })}
                    </p>
                )}
                <p className={`battle-font-bold ${isResult ? 'battle-text-5xl' : 'battle-text-3xl'}`}
                    style={{ color: isResult && winner === 'opponent' ? '#22c55e' : '#cbd5e1', marginBottom: '0.25rem' }}>
                    {opponentScore}
                </p>
                <p className="battle-text-xs battle-text-muted battle-text-uppercase">
                    {isResult ? t('battles.finalScore') : t('battles.currentScore')}
                </p>
            </div>
        </div>
    );
};

export default ScoreBoard;
