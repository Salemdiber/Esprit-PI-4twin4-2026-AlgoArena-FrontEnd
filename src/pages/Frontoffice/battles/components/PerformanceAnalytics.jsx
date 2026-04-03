/**
 * PerformanceAnalytics – comparative performance cards
 *
 * Computes metrics dynamically from round data.
 */
import React from 'react';

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value || 0)));

const computeAverage = (values) => {
    if (!values.length) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
};

const formatMsAsTime = (ms) => {
    const totalSeconds = Math.max(0, Math.round((ms || 0) / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PerformanceAnalytics = ({ battle }) => {
    const roundsWithResults = battle.rounds.filter((round) =>
        round.playerResult || round.opponentResult
    );

    const maxPoints = roundsWithResults.map((round) => round.challenge?.maxPoints || 500);

    const playerTimes = roundsWithResults
        .map((round) => round.playerResult?.executionTimeMs)
        .filter((value) => Number.isFinite(value));
    const opponentTimes = roundsWithResults
        .map((round) => round.opponentResult?.executionTimeMs)
        .filter((value) => Number.isFinite(value));

    const playerScores = roundsWithResults.map((round) => round.playerResult?.score || 0);
    const opponentScores = roundsWithResults.map((round) => round.opponentResult?.score || 0);

    const playerPassRates = roundsWithResults.map((round) => {
        const passed = Number(round.playerResult?.passedCount || 0);
        const total = Number(round.playerResult?.total || 0);
        return total > 0 ? (passed / total) * 100 : 0;
    });

    const opponentPassRates = roundsWithResults.map((round) => {
        const passed = Number(round.opponentResult?.passedCount || 0);
        const total = Number(round.opponentResult?.total || 0);
        return total > 0 ? (passed / total) * 100 : 0;
    });

    const playerAvgTimeMs = computeAverage(playerTimes);
    const opponentAvgTimeMs = computeAverage(opponentTimes);
    const playerAvgTime = formatMsAsTime(playerAvgTimeMs);
    const opponentAvgTime = formatMsAsTime(opponentAvgTimeMs);

    const playerEfficiency = clampPercent(
        computeAverage(playerScores.map((score, idx) => (score / Math.max(1, maxPoints[idx])) * 100))
    );
    const oppEfficiency = clampPercent(
        computeAverage(opponentScores.map((score, idx) => (score / Math.max(1, maxPoints[idx])) * 100))
    );

    const playerQuality = clampPercent(computeAverage(playerPassRates));
    const oppQuality = clampPercent(computeAverage(opponentPassRates));

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
