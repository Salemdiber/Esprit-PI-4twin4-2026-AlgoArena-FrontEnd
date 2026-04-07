/**
 * BattleTimeline – dynamic round progress visualization
 *
 * Renders N steps based on totalRounds (not hardcoded).
 * Highlights completed, active, and upcoming rounds.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RoundStatus } from '../types/battle.types';

const BattleTimeline = ({ rounds, currentRoundIndex }) => {
    const { t } = useTranslation();

    return (
        <div className="battle-timeline">
            {rounds.map((round, i) => {
                const isCompleted = round.status === RoundStatus.COMPLETED;
                const isActive = round.status === RoundStatus.IN_PROGRESS;
                const isUpcoming = round.status === RoundStatus.UPCOMING;

                const circleClass = [
                    'battle-timeline__circle',
                    isCompleted ? 'battle-timeline__circle--completed' : '',
                    isActive ? 'battle-timeline__circle--active' : '',
                    isUpcoming ? 'battle-timeline__circle--upcoming' : '',
                ].filter(Boolean).join(' ');

                const statusText = isCompleted
                    ? t('battles.statusCompleted')
                    : isActive
                        ? t('battles.inProgressStatus')
                        : t('battles.upcoming');

                const statusColor = isCompleted
                    ? '#22c55e'
                    : isActive
                        ? '#22d3ee'
                        : '#64748b';

                const labelColor = isActive ? '#22d3ee' : isCompleted ? '#f1f5f9' : '#64748b';

                return (
                    <React.Fragment key={i}>
                        <div className="battle-timeline__step">
                            <div className={circleClass}>
                                {isCompleted ? '✓' : i + 1}
                            </div>
                            <p style={{ fontWeight: 700, color: labelColor, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                {t('battles.roundN', { n: i + 1 })}
                            </p>
                            <p className="battle-text-xs" style={{ color: statusColor }}>
                                {statusText}
                            </p>
                        </div>

                        {/* Connector line (not after last) */}
                        {i < rounds.length - 1 && (
                            <div
                                className={[
                                    'battle-timeline__line',
                                    isCompleted && rounds[i + 1]?.status !== RoundStatus.UPCOMING
                                        ? 'battle-timeline__line--completed'
                                        : '',
                                    isCompleted && rounds[i + 1]?.status === RoundStatus.IN_PROGRESS
                                        ? 'battle-timeline__line--active'
                                        : '',
                                    !isCompleted ? 'battle-timeline__line--upcoming' : '',
                                ].filter(Boolean).join(' ')}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default BattleTimeline;
