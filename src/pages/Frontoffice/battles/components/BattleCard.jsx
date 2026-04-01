/**
 * BattleCard – single battle item in the battle list grid
 */
import React from 'react';
import {
    BattleStatus,
    BattleMode,
    statusBadgeMap,
    modeBadgeMap,
    getTotalPlayerScore,
    getTotalOpponentScore,
    getProgressPercent,
} from '../types/battle.types';

const BattleCard = ({ battle, onEnter, onViewSummary, onCancel, aiBattlesEnabled = true }) => {
    const isLive = battle.status === BattleStatus.LIVE;
    const isActive = battle.status === BattleStatus.ACTIVE;
    const isWaiting = battle.status === BattleStatus.WAITING;
    const isCompleted = battle.status === BattleStatus.COMPLETED;
    const isCancelled = battle.status === BattleStatus.CANCELLED;

    const modeBadge = modeBadgeMap[battle.mode];
    const statusBadge = statusBadgeMap[battle.status];
    const progress = getProgressPercent(battle);
    const playerScore = getTotalPlayerScore(battle);
    const opponentScore = getTotalOpponentScore(battle);
    const isAI = battle.mode === BattleMode.ONE_VS_AI;
    const isAIDisabled = isAI && !aiBattlesEnabled;

    const cardClass = [
        'battle-card',
        isLive ? 'battle-card--live' : '',
        isCompleted ? 'battle-card--completed' : '',
    ].filter(Boolean).join(' ');

    const progressFillClass = [
        'battle-progress__fill',
        isAI ? 'battle-progress__fill--purple' : '',
        isCompleted ? 'battle-progress__fill--green' : '',
    ].filter(Boolean).join(' ');

    // Determine current round text
    const roundText = battle.currentRoundIndex >= 0
        ? `Round ${battle.currentRoundIndex + 1} of ${battle.totalRounds}`
        : `Best of ${battle.totalRounds}`;

    // Result text for completed
    const resultText = isCompleted
        ? playerScore > opponentScore ? 'Victory' : playerScore < opponentScore ? 'Defeat' : 'Draw'
        : null;

    return (
        <div className={cardClass} id={`battle-card-${battle.id}`} style={isAIDisabled ? { opacity: 0.5, pointerEvents: 'none', position: 'relative' } : {}}>
            {/* AI Disabled Overlay Badge */}
            {isAIDisabled && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 10, background: 'var(--color-bg-card)', borderRadius: '12px',
                    padding: '0.75rem 1.25rem', textAlign: 'center', border: '1px solid var(--color-error-bg)',
                    pointerEvents: 'auto',
                }}>
                    <p style={{ color: 'var(--color-red-500)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>AI Battles Disabled</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Maintenance</p>
                </div>
            )}
            {/* Header: Mode + Status */}
            <div className="battle-flex-between battle-mb-md">
                <span className={`battle-badge battle-badge--${modeBadge.color}`}>
                    {modeBadge.label}
                </span>
                <span className={`battle-badge battle-badge--${statusBadge.color}`}>
                    {statusBadge.label}
                </span>
            </div>

            {/* Opponent Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {isWaiting ? (
                    <div className="battle-waiting-avatar">👤</div>
                ) : isAI ? (
                    <div className="battle-ai-avatar">🤖</div>
                ) : (
                    <img
                        src={battle.opponent?.avatar || ''}
                        alt={battle.opponent?.name || 'Opponent'}
                        style={{
                            width: '3rem', height: '3rem', borderRadius: '50%',
                            border: isLive ? '2px solid var(--color-cyan-400)' : '2px solid var(--color-border-hover)',
                            objectFit: 'cover',
                        }}
                    />
                )}
                <div style={{ flex: 1 }}>
                    <p className="battle-font-semibold">
                        {isWaiting ? 'Waiting for opponent...' : `vs ${battle.opponent?.name}`}
                    </p>
                    <p className="battle-text-sm battle-text-muted">{roundText}</p>
                </div>
            </div>

            {/* Progress / Waiting / Completed */}
            {isWaiting ? (
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <p className="battle-text-muted battle-text-sm">🔍 Searching for opponent...</p>
                </div>
            ) : (
                <>
                    <div className="battle-mb-md">
                        <div className="battle-flex-between battle-text-sm battle-text-muted battle-mb-sm">
                            <span>{isCompleted ? 'Final Score' : 'Progress'}</span>
                            <span style={{ color: resultText === 'Victory' ? 'var(--color-green-500)' : resultText === 'Defeat' ? 'var(--color-red-500)' : 'var(--color-cyan-400)', fontWeight: 600 }}>
                                {resultText || `${progress}%`}
                            </span>
                        </div>
                        <div className="battle-progress">
                            <div
                                className={progressFillClass}
                                style={{ width: `${isCompleted ? 100 : progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Scores */}
                    <div className="battle-score-display battle-mb-md">
                        <div className="battle-text-center">
                            <p className={`battle-score-value ${isCompleted && playerScore > opponentScore ? 'battle-score-value--winner' : 'battle-score-value--player'}`}>
                                {playerScore}
                            </p>
                            <p className="battle-score-label">Your Score</p>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>:</div>
                        <div className="battle-text-center">
                            <p className="battle-score-value battle-score-value--opponent">{opponentScore}</p>
                            <p className="battle-score-label">{isAI ? 'AI Score' : 'Opponent'}</p>
                        </div>
                    </div>
                </>
            )}

            {/* Action Button */}
            {isCancelled ? (
                <button className="battle-btn battle-btn--secondary battle-btn--full" disabled>
                    Cancelled
                </button>
            ) : isWaiting ? (
                <button
                    className="battle-btn battle-btn--secondary battle-btn--full"
                    onClick={() => onCancel?.(battle.id)}
                >
                    Cancel Battle
                </button>
            ) : isCompleted ? (
                <button
                    className="battle-btn battle-btn--secondary battle-btn--full"
                    onClick={() => onViewSummary?.(battle.id)}
                >
                    View Summary
                </button>
            ) : (
                <button
                    className="battle-btn battle-btn--primary battle-btn--full"
                    onClick={() => onEnter?.(battle.id)}
                >
                    Enter Battle
                </button>
            )}
        </div>
    );
};

export default BattleCard;
