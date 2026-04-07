/**
 * BattleCard – single battle item in the battle list grid
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

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

    const modeLabel = battle.mode === BattleMode.ONE_VS_ONE ? t('battles.mode1vs1') : t('battles.mode1vsAI');
    const statusLabel = {
        [BattleStatus.ACTIVE]: t('battles.statusActive'),
        [BattleStatus.LIVE]: t('battles.live'),
        [BattleStatus.WAITING]: t('battles.statusWaiting'),
        [BattleStatus.COMPLETED]: t('battles.statusCompleted'),
        [BattleStatus.CANCELLED]: t('battles.cancelled'),
    }[battle.status] || statusBadge.label;

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

    const roundText = battle.currentRoundIndex >= 0
        ? t('battles.roundOf', { current: battle.currentRoundIndex + 1, total: battle.totalRounds })
        : t('battles.bestOf', { n: battle.totalRounds });

    const resultText = isCompleted
        ? playerScore > opponentScore ? t('battles.victory') : playerScore < opponentScore ? t('battles.defeat') : t('battles.draw')
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
                    <p style={{ color: 'var(--color-red-500)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>{t('battles.aiBattlesDisabled')}</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{t('battles.maintenance')}</p>
                </div>
            )}
            {/* Header: Mode + Status */}
            <div className="battle-flex-between battle-mb-md">
                <span className={`battle-badge battle-badge--${modeBadge.color}`}>
                    {modeLabel}
                </span>
                <span className={`battle-badge battle-badge--${statusBadge.color}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Opponent Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                {isWaiting ? (
                    <div className="battle-waiting-avatar">👤</div>
                ) : isAI ? (
                    <div className="battle-ai-avatar">AI</div>
                ) : (
                    <img
                        src={battle.opponent?.avatar || ''}
                        alt={battle.opponent?.name || t('battles.opponent')}
                        style={{
                            width: '3rem', height: '3rem', borderRadius: '50%',
                            border: isLive ? '2px solid var(--color-cyan-400)' : '2px solid var(--color-border-hover)',
                            objectFit: 'cover',
                        }}
                    />
                )}
                <div style={{ flex: 1 }}>
                    <p className="battle-font-semibold">
                        {isWaiting ? t('battles.waitingForOpponent') : t('battles.vsOpponent', { name: battle.opponent?.name })}
                    </p>
                    <p className="battle-text-sm battle-text-muted">{roundText}</p>
                </div>
            </div>

            {/* Progress / Waiting / Completed */}
            {isWaiting ? (
                <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <p className="battle-text-muted battle-text-sm">🔍 {t('battles.searchingOpponent')}</p>
                </div>
            ) : (
                <>
                    <div className="battle-mb-md">
                        <div className="battle-flex-between battle-text-sm battle-text-muted battle-mb-sm">
                            <span>{isCompleted ? t('battles.finalScore') : t('battles.progress')}</span>
                            <span style={{ color: resultText === t('battles.victory') ? 'var(--color-green-500)' : resultText === t('battles.defeat') ? 'var(--color-red-500)' : 'var(--color-cyan-400)', fontWeight: 600 }}>
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
                            <p className="battle-score-label">{t('battles.yourScore')}</p>
                        </div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>:</div>
                        <div className="battle-text-center">
                            <p className="battle-score-value battle-score-value--opponent">{opponentScore}</p>
                            <p className="battle-score-label">{isAI ? t('battles.aiScore') : t('battles.opponent')}</p>
                        </div>
                    </div>
                </>
            )}

            {/* Action Button */}
            {isCancelled ? (
                <button className="battle-btn battle-btn--secondary battle-btn--full" disabled>
                    {t('battles.cancelled')}
                </button>
            ) : isWaiting ? (
                <button
                    className="battle-btn battle-btn--secondary battle-btn--full"
                    onClick={() => onCancel?.(battle.id)}
                >
                    {t('battles.cancelBattle')}
                </button>
            ) : isCompleted ? (
                <button
                    className="battle-btn battle-btn--secondary battle-btn--full"
                    onClick={() => onViewSummary?.(battle.id)}
                >
                    {t('battles.viewSummary')}
                </button>
            ) : (
                <button
                    className="battle-btn battle-btn--primary battle-btn--full"
                    onClick={() => onEnter?.(battle.id)}
                >
                    {t('battles.startBattle')}
                </button>
            )}
        </div>
    );
};

export default BattleCard;
