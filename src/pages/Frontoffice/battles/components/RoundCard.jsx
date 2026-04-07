/**
 * RoundCard – single round in the summary breakdown
 */
import React from 'react';
import { RoundResult, difficultyBadgeMap } from '../types/battle.types';

const resultBadge = {
    [RoundResult.WON]: { label: 'WON', cls: 'battle-badge--green' },
    [RoundResult.LOST]: { label: 'LOST', cls: 'battle-badge--red' },
    [RoundResult.DRAW]: { label: 'DRAW', cls: 'battle-badge--yellow' },
    [RoundResult.PENDING]: { label: 'PENDING', cls: 'battle-badge--gray' },
};

const RoundCard = ({ round }) => {
    const badge = resultBadge[round.result];
    const diffBadge = difficultyBadgeMap[round.difficulty];

    const cardClass = [
        'battle-card battle-round-card',
        round.result === RoundResult.WON ? 'battle-round-card--won' : '',
        round.result === RoundResult.LOST ? 'battle-round-card--lost' : '',
        round.result === RoundResult.DRAW ? 'battle-round-card--draw' : '',
    ].filter(Boolean).join(' ');

    // Efficiency color
    const effColor = round.efficiency >= 85 ? '#22c55e' : round.efficiency >= 70 ? '#facc15' : '#ef4444';

    return (
        <div className={cardClass}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Left: Round info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <span className="battle-font-bold">Round {round.index + 1}</span>
                        <span className={`battle-badge ${badge.cls}`}>{badge.label}</span>
                        <span className={`battle-badge battle-badge--${diffBadge.color}`}>{diffBadge.label}</span>
                    </div>
                    <p className="battle-text-sm battle-text-muted">{round.challenge?.title || '—'}</p>
                </div>

                {/* Right: Stats */}
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                    <div>
                        <p className="battle-text-muted" style={{ marginBottom: '0.25rem' }}>Time</p>
                        <p className="battle-font-semibold">{round.timeSpent}</p>
                    </div>
                    <div>
                        <p className="battle-text-muted" style={{ marginBottom: '0.25rem' }}>Efficiency</p>
                        <p className="battle-font-semibold" style={{ color: effColor }}>{round.efficiency}%</p>
                    </div>
                    <div>
                        <p className="battle-text-muted" style={{ marginBottom: '0.25rem' }}>Score</p>
                        <p className="battle-font-semibold battle-text-cyan">+{round.playerScore}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundCard;
