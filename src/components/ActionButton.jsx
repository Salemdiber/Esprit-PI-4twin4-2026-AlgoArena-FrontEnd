import React, { useRef } from 'react';

/**
 * Premium ActionButton — AlgoArena Admin
 *
 * Design language: "Segmented Glow"
 *   - A small chromatic icon badge sits flush-left inside the button body,
 *     separated from the label by a 1px tinted hairline divider.
 *   - The whole pill has a very subtle gradient base that reveals itself
 *     fully on hover, along with a gentle glow bloom matching the tone.
 *   - Active/pressed state snaps the pill inward (-scale + shadow collapse)
 *     giving crisp tactile feedback.
 *   - All geometry, spacing, and typography are identical across tones —
 *     only the colour accent changes.
 */

const PALETTE = {
    blue: {
        text:        '#93c5fd',   // blue-300
        label:       '#bfdbfe',   // blue-200
        iconBg:      'rgba(59,130,246,0.18)',
        iconBorder:  'rgba(59,130,246,0.35)',
        pillBg:      'rgba(59,130,246,0.07)',
        pillBorder:  'rgba(59,130,246,0.28)',
        hoverBg:     'rgba(59,130,246,0.14)',
        hoverBorder: 'rgba(59,130,246,0.55)',
        glow:        'rgba(59,130,246,0.22)',
        divider:     'rgba(59,130,246,0.20)',
        activeBg:    'rgba(59,130,246,0.22)',
    },
    green: {
        text:        '#6ee7b7',   // emerald-300
        label:       '#a7f3d0',   // emerald-200
        iconBg:      'rgba(16,185,129,0.18)',
        iconBorder:  'rgba(16,185,129,0.35)',
        pillBg:      'rgba(16,185,129,0.07)',
        pillBorder:  'rgba(16,185,129,0.28)',
        hoverBg:     'rgba(16,185,129,0.14)',
        hoverBorder: 'rgba(16,185,129,0.55)',
        glow:        'rgba(16,185,129,0.22)',
        divider:     'rgba(16,185,129,0.20)',
        activeBg:    'rgba(16,185,129,0.22)',
    },
    red: {
        text:        '#fca5a5',   // red-300
        label:       '#fecaca',   // red-200
        iconBg:      'rgba(239,68,68,0.18)',
        iconBorder:  'rgba(239,68,68,0.35)',
        pillBg:      'rgba(239,68,68,0.07)',
        pillBorder:  'rgba(239,68,68,0.28)',
        hoverBg:     'rgba(239,68,68,0.14)',
        hoverBorder: 'rgba(239,68,68,0.55)',
        glow:        'rgba(239,68,68,0.22)',
        divider:     'rgba(239,68,68,0.20)',
        activeBg:    'rgba(239,68,68,0.22)',
    },
    amber: {
        text:        '#fcd34d',   // amber-300
        label:       '#fde68a',   // amber-200
        iconBg:      'rgba(245,158,11,0.18)',
        iconBorder:  'rgba(245,158,11,0.35)',
        pillBg:      'rgba(245,158,11,0.07)',
        pillBorder:  'rgba(245,158,11,0.28)',
        hoverBg:     'rgba(245,158,11,0.14)',
        hoverBorder: 'rgba(245,158,11,0.55)',
        glow:        'rgba(245,158,11,0.22)',
        divider:     'rgba(245,158,11,0.20)',
        activeBg:    'rgba(245,158,11,0.22)',
    },
    purple: {
        text:        '#c4b5fd',
        label:       '#ddd6fe',
        iconBg:      'rgba(139,92,246,0.18)',
        iconBorder:  'rgba(139,92,246,0.35)',
        pillBg:      'rgba(139,92,246,0.07)',
        pillBorder:  'rgba(139,92,246,0.28)',
        hoverBg:     'rgba(139,92,246,0.14)',
        hoverBorder: 'rgba(139,92,246,0.55)',
        glow:        'rgba(139,92,246,0.22)',
        divider:     'rgba(139,92,246,0.20)',
        activeBg:    'rgba(139,92,246,0.22)',
    },
    gray: {
        text:        '#94a3b8',
        label:       '#cbd5e1',
        iconBg:      'rgba(148,163,184,0.14)',
        iconBorder:  'rgba(148,163,184,0.28)',
        pillBg:      'rgba(148,163,184,0.06)',
        pillBorder:  'rgba(148,163,184,0.22)',
        hoverBg:     'rgba(148,163,184,0.12)',
        hoverBorder: 'rgba(148,163,184,0.40)',
        glow:        'rgba(148,163,184,0.14)',
        divider:     'rgba(148,163,184,0.18)',
        activeBg:    'rgba(148,163,184,0.18)',
    },
};

const colorToTone = (color) => {
    if (!color) return 'gray';
    const c = String(color).toLowerCase();
    if (c.includes('blue') || c.includes('3b82f6') || c.includes('60a5fa')) return 'blue';
    if (c.includes('green') || c.includes('22c55e') || c.includes('34d399') || c.includes('10b981')) return 'green';
    if (c.includes('red') || c.includes('ef4444') || c.includes('f87171')) return 'red';
    if (c.includes('amber') || c.includes('yellow') || c.includes('fbbf24') || c.includes('f59e0b') || c.includes('facc15')) return 'amber';
    if (c.includes('purple') || c.includes('violet') || c.includes('a78bfa') || c.includes('8b5cf6')) return 'purple';
    return 'gray';
};

const ActionButton = ({
    label,
    icon,
    tone,
    color,
    onClick,
    disabled = false,
    title,
    type = 'button',
    className = '',
}) => {
    const btnRef = useRef(null);
    const resolvedTone = tone || colorToTone(color);
    const p = PALETTE[resolvedTone] || PALETTE.gray;
    const Icon = icon;

    const base = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0',
        height: '30px',
        borderRadius: '8px',
        border: `1px solid ${p.pillBorder}`,
        background: p.pillBg,
        padding: '0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        overflow: 'hidden',
        outline: 'none',
        position: 'relative',
        flexShrink: 0,
        /* Transition everything except glow (handled via pseudo-element simulation with boxShadow) */
        transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease',
        boxShadow: 'none',
    };

    const iconWrap = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '100%',
        background: p.iconBg,
        borderRight: `1px solid ${p.divider}`,
        color: p.text,
        flexShrink: 0,
        transition: 'background 200ms ease',
    };

    const labelWrap = {
        paddingLeft: '9px',
        paddingRight: '11px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: p.label,
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
    };

    /* ── Hover / Active wiring via inline event handlers ── */
    const handleMouseEnter = (e) => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.background = p.hoverBg;
        el.style.borderColor = p.hoverBorder;
        el.style.boxShadow = `0 0 0 3px ${p.glow}, 0 2px 8px ${p.glow}`;
        el.style.transform = 'translateY(-1px)';
        const iconEl = el.querySelector('[data-icon-wrap]');
        if (iconEl) iconEl.style.background = p.activeBg;
    };

    const handleMouseLeave = (e) => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.background = p.pillBg;
        el.style.borderColor = p.pillBorder;
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
        const iconEl = el.querySelector('[data-icon-wrap]');
        if (iconEl) iconEl.style.background = p.iconBg;
    };

    const handleMouseDown = (e) => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.transform = 'translateY(0) scale(0.97)';
        el.style.boxShadow = `0 0 0 2px ${p.glow}`;
    };

    const handleMouseUp = (e) => {
        if (disabled) return;
        const el = e.currentTarget;
        el.style.transform = 'translateY(-1px) scale(1)';
        el.style.boxShadow = `0 0 0 3px ${p.glow}, 0 2px 8px ${p.glow}`;
    };

    return (
        <button
            ref={btnRef}
            type={type}
            style={base}
            className={className}
            onClick={onClick}
            disabled={disabled}
            title={title || label}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {/* Icon badge */}
            <span data-icon-wrap="1" style={iconWrap}>
                {Icon && <Icon size={13} strokeWidth={2.4} />}
            </span>

            {/* Label */}
            <span style={labelWrap}>{label}</span>
        </button>
    );
};

export default ActionButton;
