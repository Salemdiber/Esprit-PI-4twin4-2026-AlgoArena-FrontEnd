/**
 * PerformanceAnalytics – comparative performance cards
 *
 * Computes metrics dynamically from round data.
 */
import React from 'react';
import { getAvgEfficiency, getAvgTime } from '../types/battle.types';

const PerformanceAnalytics = ({ battle }) => {
    // Compute averages from rounds
    const playerAvgTime = getAvgTime(battle);
    const playerEfficiency = getAvgEfficiency(battle, 'player');

    // Compute opponent avg time (mocked but consistent)
    const completedRounds = battle.rounds.filter(r => r.status === 'COMPLETED');
    const opponentAvgTimeSecs = completedRounds.length > 0
        ? Math.round(
            completedRounds.reduce((sum, r) => {
                const parts = r.timeSpent.split(':');
                return sum + parseInt(parts[0]) * 60 + parseInt(parts[1]) + 45; // offset for opponent
            }, 0) / completedRounds.length
        )
        : 0;
    const oppMins = Math.floor(opponentAvgTimeSecs / 60);
    const oppSecs = opponentAvgTimeSecs % 60;
    const opponentAvgTime = `${oppMins}:${oppSecs.toString().padStart(2, '0')}`;

    // Opponent efficiency (derived, slightly lower)
    const oppEfficiency = Math.max(0, playerEfficiency - 6 - Math.floor(Math.random() * 5));

    // Code quality (derived from efficiency with small variance)
    const playerQuality = Math.min(100, playerEfficiency + 4);
    const oppQuality = Math.min(100, oppEfficiency + 3);

    // Convert time string to percentage (higher is worse, so invert for display)
    const timeToPercent = (timeStr) => {
        const parts = timeStr.split(':');
        const secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        return Math.min(100, Math.round((secs / (battle.timeLimit || 900)) * 100));
    };

    const metrics = [
        {
            title: 'Time Comparison',
            bars: [
                { label: 'Your Avg', value: playerAvgTime, percent: timeToPercent(playerAvgTime), color: '#22d3ee', gradient: true },
                { label: 'Opponent Avg', value: opponentAvgTime, percent: timeToPercent(opponentAvgTime), color: '#64748b', gradient: false },
            ],
        },
        {
            title: 'Code Quality',
            bars: [
                { label: 'Your Quality', value: `${playerQuality}%`, percent: playerQuality, color: '#22c55e', gradient: true },
                { label: 'Opponent Quality', value: `${oppQuality}%`, percent: oppQuality, color: '#64748b', gradient: false },
            ],
        },
        {
            title: 'Efficiency Score',
            bars: [
                { label: 'Your Efficiency', value: `${playerEfficiency}%`, percent: playerEfficiency, color: '#22d3ee', gradient: true },
                { label: 'Opponent Efficiency', value: `${oppEfficiency}%`, percent: oppEfficiency, color: '#64748b', gradient: false },
            ],
        },
    ];

    return (
        <div className="battle-analytics-grid">
            {metrics.map((metric) => (
                <div key={metric.title} className="battle-card">
                    <h3 className="battle-font-semibold battle-mb-md">{metric.title}</h3>
                    {metric.bars.map((bar, i) => (
                        <div key={i} style={{ marginBottom: i === 0 ? '0.75rem' : 0 }}>
                            <div className="battle-flex-between battle-text-sm battle-mb-sm">
                                <span className="battle-text-muted">{bar.label}</span>
                                <span style={{ color: bar.color, fontWeight: 600 }}>{bar.value}</span>
                            </div>
                            <div className="battle-progress">
                                <div
                                    className={bar.gradient ? 'battle-progress__fill' : ''}
                                    style={{
                                        width: `${bar.percent}%`,
                                        height: '100%',
                                        borderRadius: '4px',
                                        background: bar.gradient
                                            ? (bar.color === '#22c55e' ? 'linear-gradient(to right, #22c55e, #16a34a)' : undefined)
                                            : bar.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default PerformanceAnalytics;
