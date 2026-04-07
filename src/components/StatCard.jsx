import React from 'react';

const StatCard = ({ title, value, label, trend, trendUp, icon, color = 'cyan', isLive = false }) => {
    const colors = {
        cyan: {
            text: 'text-cyan-400',
            bg: 'bg-cyan-500/20',
            trend: 'text-cyan-400',
            glow: 'hover:shadow-[0_0_24px_rgba(34,211,238,0.2)]'
        },
        green: {
            text: 'text-green-400',
            bg: 'bg-green-500/20',
            trend: 'text-green-400',
            glow: 'hover:shadow-[0_0_24px_rgba(34,197,94,0.2)]'
        },
        yellow: {
            text: 'text-yellow-400',
            bg: 'bg-yellow-500/20',
            trend: 'text-yellow-400',
            glow: 'hover:shadow-[0_0_24px_rgba(234,179,8,0.2)]'
        },
        purple: {
            text: 'text-purple-400',
            bg: 'bg-purple-500/20',
            trend: 'text-purple-400',
            glow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.2)]'
        }
    };

    const current = colors[color] || colors.cyan;

    return (
        <div
            className={`
                glass-panel rounded-2xl p-6 spotlight-hover metric-card shadow-custom
                transition-all duration-300 hover:-translate-y-1 
                ${current.glow}
                ${isLive ? 'animate-pulse-glow' : ''}
            `}
        >
            {/* Icon Container */}
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${current.bg}`}>
                    <div className={current.text}>
                        {icon}
                    </div>
                </div>
            </div>

            {/* Value */}
            <h3 className="font-heading text-3xl font-bold mb-1" style={{ color: 'var(--color-text-heading)' }}>
                {value}
            </h3>

            {/* Label */}
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</p>

            {/* Trend / Live Indicator */}
            <div className="mt-3 flex items-center gap-2">
                {isLive ? (
                    <>
                        <span className="status-dot status-online" />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Real-time</span>
                    </>
                ) : trend ? (
                    <>
                        <span className={`text-xs font-medium ${trendUp ? current.trend : 'text-red-400'}`}>
                            {trend}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>vs last month</span>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default StatCard;
