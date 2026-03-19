import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Activity,
    ArrowRight,
    BadgeCheck,
    BarChart3,
    CalendarDays,
    ChevronDown,
    CircleAlert,
    ClipboardList,
    Clock,
    FilePlus,
    Flag,
    KeyRound,
    LockKeyhole,
    Pencil,
    Rocket,
    RotateCcw,
    Search,
    Settings2,
    Shield,
    ShieldCheck,
    ShieldMinus,
    ShieldPlus,
    Smartphone,
    Tags,
    Trash2,
    Undo2,
    User,
    UserCheck,
    UserCog,
    UserPlus,
    UserX,
} from 'lucide-react';
import { auditLogService } from '../../services/auditLogService';

const ICON_TONES = {
    blue: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.28)' },
    green: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.28)' },
    amber: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.28)' },
    red: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.28)' },
    purple: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.28)' },
    gray: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.22)' },
};

const createActionMeta = (icon, label, tone, entity) => ({
    icon,
    label,
    tone,
    color: ICON_TONES[tone].color,
    entity,
});

const ACTION_META = {
    USER_REGISTERED: createActionMeta(UserPlus, 'User Registered', 'blue', 'user'),
    USER_BANNED: createActionMeta(UserX, 'User Banned', 'red', 'user'),
    USER_UNBANNED: createActionMeta(UserCheck, 'User Unbanned', 'green', 'user'),
    USER_DELETED: createActionMeta(Trash2, 'User Deleted', 'red', 'user'),
    USER_ROLE_CHANGED: createActionMeta(UserCog, 'Role Changed', 'purple', 'user'),
    PASSWORD_RESET: createActionMeta(KeyRound, 'Password Reset', 'amber', 'user'),
    ADMIN_ADDED: createActionMeta(ShieldPlus, 'Admin Added', 'blue', 'admin'),
    ADMIN_REMOVED: createActionMeta(ShieldMinus, 'Admin Removed', 'red', 'admin'),
    ADMIN_ROLE_UPDATED: createActionMeta(Shield, 'Admin Role Updated', 'purple', 'admin'),
    PERMISSION_CHANGED: createActionMeta(LockKeyhole, 'Permission Changed', 'amber', 'admin'),
    CHALLENGE_CREATED: createActionMeta(FilePlus, 'Challenge Created', 'blue', 'challenge'),
    CHALLENGE_PUBLISHED: createActionMeta(Rocket, 'Challenge Published', 'green', 'challenge'),
    CHALLENGE_UNPUBLISHED: createActionMeta(Undo2, 'Challenge Unpublished', 'amber', 'challenge'),
    CHALLENGE_EDITED: createActionMeta(Pencil, 'Challenge Edited', 'blue', 'challenge'),
    CHALLENGE_DELETED: createActionMeta(Trash2, 'Challenge Deleted', 'red', 'challenge'),
    DIFFICULTY_CHANGED: createActionMeta(BarChart3, 'Difficulty Changed', 'amber', 'challenge'),
    TAGS_UPDATED: createActionMeta(Tags, 'Tags Updated', 'purple', 'challenge'),
    SYSTEM_CONFIG_UPDATED: createActionMeta(Settings2, 'Config Updated', 'blue', 'system'),
    FEATURE_FLAG_CHANGED: createActionMeta(Flag, 'Feature Flag', 'amber', 'system'),
    SECURITY_SETTINGS_CHANGED: createActionMeta(ShieldCheck, 'Security Updated', 'red', 'system'),
    '2FA_ENFORCEMENT_UPDATED': createActionMeta(Smartphone, '2FA Updated', 'purple', 'system'),
    ACTION_CONFIRMED: createActionMeta(BadgeCheck, 'Confirmed', 'green', 'audit'),
    ACTION_ROLLED_BACK: createActionMeta(RotateCcw, 'Rolled Back', 'amber', 'audit'),
};

const DEFAULT_ACTION_META = createActionMeta(ClipboardList, 'Activity Event', 'gray', 'audit');

const STATUS_STYLES = {
    active: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)', label: 'Active' },
    confirmed: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.3)', label: 'Confirmed' },
    rolled_back: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)', label: 'Rolled Back' },
    pending: { bg: 'rgba(168,139,250,0.12)', color: '#a78bfa', border: 'rgba(168,139,250,0.3)', label: 'Pending' },
};

const ENTITY_FILTERS = [
    { value: '', label: 'All Entities' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'challenge', label: 'Challenge' },
    { value: 'system', label: 'System' },
    { value: 'audit', label: 'Audit' },
];

const STATUS_FILTERS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'rolled_back', label: 'Rolled Back' },
    { value: 'pending', label: 'Pending' },
];

const STAT_CARDS = [
    { key: 'total', label: 'Total Events', icon: Activity, tone: 'blue', getValue: (stats) => stats.total || 0 },
    { key: 'last24h', label: 'Last 24h', icon: Clock, tone: 'gray', getValue: (stats) => stats.last24h || 0 },
    { key: 'lastWeek', label: 'Last 7 Days', icon: CalendarDays, tone: 'blue', getValue: (stats) => stats.lastWeek || 0 },
    {
        key: 'rolledBack',
        label: 'Rolled Back',
        icon: RotateCcw,
        tone: 'amber',
        getValue: (stats) => (stats.byStatus || []).find((item) => item._id === 'rolled_back')?.count || 0,
    },
];

const getTone = (tone = 'gray') => ICON_TONES[tone] || ICON_TONES.gray;

const IconBadge = ({ icon: Icon, tone = 'gray', size = 18, className = 'h-10 w-10 rounded-xl' }) => {
    const palette = getTone(tone);

    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center border ${className}`}
            style={{ background: palette.bg, borderColor: palette.border, color: palette.color }}
        >
            <Icon size={size} strokeWidth={2} />
        </span>
    );
};

const ActionButton = ({ icon: Icon, label, tone, onClick, title }) => {
    const palette = getTone(tone);
    const isSuccess = tone === 'green';
    const glow = isSuccess ? '0 10px 24px rgba(52,211,153,0.16)' : '0 10px 24px rgba(251,191,36,0.18)';
    const hoverBorder = isSuccess ? 'rgba(52,211,153,0.42)' : 'rgba(251,191,36,0.42)';

    return (
        <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold tracking-[0.01em] transition-all duration-200 hover:-translate-y-0.5"
            style={{
                background: `linear-gradient(180deg, ${palette.bg} 0%, rgba(15,23,42,0.02) 100%)`,
                color: palette.color,
                border: `1px solid ${palette.border}`,
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(15,23,42,0.08)`,
            }}
            onClick={onClick}
            title={title || label}
            type="button"
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = hoverBorder;
                e.currentTarget.style.boxShadow = `${glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = palette.border;
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 2px rgba(15,23,42,0.08)';
            }}
        >
            <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-md"
                style={{
                    background: isSuccess ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.18)',
                    border: `1px solid ${palette.border}`,
                }}
            >
                <Icon size={12} strokeWidth={2.3} />
            </span>
            <span>{label}</span>
        </button>
    );
};

function getTimeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

const ITEMS_PER_PAGE = 15;

const TimelineEntry = ({ log, onConfirm, onRollback, isExpanded, onToggle }) => {
    const meta = ACTION_META[log.actionType] || { ...DEFAULT_ACTION_META, label: log.actionType };
    const sts = STATUS_STYLES[log.status] || STATUS_STYLES.active;
    const timeAgo = getTimeAgo(log.createdAt);
    const hasPrevState = log.previousState && Object.keys(log.previousState).length > 0;
    const hasNewState = log.newState && Object.keys(log.newState).length > 0;
    const canConfirm = log.status === 'active' || log.status === 'pending';
    const canRollback = log.status === 'active' && hasPrevState;

    return (
        <div className="group relative flex gap-3 pb-8 sm:gap-4" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            <div className="flex flex-col items-center">
                <IconBadge icon={meta.icon} tone={meta.tone} size={18} className="h-10 w-10 rounded-xl sm:h-11 sm:w-11" />
                <div className="mt-2 w-px flex-1" style={{ background: 'var(--color-border)' }} />
            </div>

            <div
                className="glass-panel flex-1 cursor-pointer rounded-xl p-4 transition-all duration-200 group-hover:shadow-lg sm:p-5"
                style={{ borderLeft: `3px solid ${meta.color}` }}
                onClick={onToggle}
            >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                                className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
                                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
                            >
                                <meta.icon size={13} strokeWidth={2.1} />
                                {meta.label}
                            </span>
                            <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium"
                                style={{ background: sts.bg, color: sts.color, border: `1px solid ${sts.border}` }}
                            >
                                {sts.label}
                            </span>
                        </div>

                        <p className="text-sm leading-relaxed sm:text-[15px]" style={{ color: 'var(--color-text-primary)' }}>
                            {log.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--color-cyan-400)' }}>
                                <User size={13} strokeWidth={2.1} />
                                @{log.actor}
                            </span>
                            {log.targetLabel && (
                                <span className="inline-flex min-w-0 items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    <ArrowRight size={13} strokeWidth={2.1} style={{ color: 'var(--color-text-muted)' }} />
                                    <span className="truncate font-mono">{log.targetLabel}</span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                <Clock size={13} strokeWidth={2.1} />
                                {timeAgo}
                            </span>
                        </div>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
                        {canConfirm && (
                            <ActionButton
                                icon={BadgeCheck}
                                label="Confirm"
                                tone="green"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm(log._id);
                                }}
                            />
                        )}
                        {canRollback && (
                            <ActionButton
                                icon={Undo2}
                                label="Rollback"
                                tone="amber"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRollback(log._id);
                                }}
                            />
                        )}
                        <button
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
                            style={{
                                color: 'var(--color-text-muted)',
                                borderColor: 'var(--color-border)',
                                background: 'var(--color-bg-input)',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            type="button"
                            title={isExpanded ? 'Collapse details' : 'Expand details'}
                        >
                            <ChevronDown size={16} strokeWidth={2.2} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {isExpanded && (hasPrevState || hasNewState) && (
                    <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                            State Changes
                        </p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {hasPrevState && (
                                <div className="rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                                    <p className="mb-2 text-xs font-semibold" style={{ color: '#f87171' }}>Previous State</p>
                                    {Object.entries(log.previousState).map(([key, val]) => (
                                        <div key={key} className="flex justify-between gap-4 py-0.5 text-xs">
                                            <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                                            <span className="break-all text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {hasNewState && (
                                <div className="rounded-lg p-3" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                                    <p className="mb-2 text-xs font-semibold" style={{ color: '#34d399' }}>New State</p>
                                    {Object.entries(log.newState).map(([key, val]) => (
                                        <div key={key} className="flex justify-between gap-4 py-0.5 text-xs">
                                            <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                                            <span className="break-all text-right font-mono" style={{ color: 'var(--color-text-secondary)' }}>{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConfirmModal = ({ title, message, onConfirm, onClose, variant = 'confirm' }) => {
    const isWarning = variant === 'rollback';
    const palette = getTone(isWarning ? 'amber' : 'green');
    const ModalIcon = isWarning ? CircleAlert : BadgeCheck;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            style={{ margin: 0, padding: 0, top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
            <div
                className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center shadow-custom animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative', margin: 'auto' }}
            >
                <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border"
                    style={{ background: palette.bg, borderColor: palette.border, color: palette.color }}
                >
                    <ModalIcon size={22} strokeWidth={2.1} />
                </div>
                <h2 className="mb-2 text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>{title}</h2>
                <p className="mb-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm" type="button">Cancel</button>
                    <ActionButton
                        icon={isWarning ? Undo2 : BadgeCheck}
                        label={isWarning ? 'Rollback' : 'Confirm'}
                        tone={isWarning ? 'amber' : 'green'}
                        onClick={onConfirm}
                    />
                </div>
            </div>
        </div>
    );
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [viewMode, setViewMode] = useState('timeline');
    const [expandedId, setExpandedId] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const result = await auditLogService.getLogs({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: search || undefined,
                entityType: entityFilter || undefined,
                status: statusFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setLogs(result.data || []);
            setTotal(result.total || 0);
            setTotalPages(result.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, entityFilter, statusFilter, startDate, endDate]);

    const fetchStats = useCallback(async () => {
        try {
            const result = await auditLogService.getStats();
            setStats(result);
        } catch {
            // Stats are non-critical
        }
    }, []);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);
    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { setCurrentPage(1); }, [search, entityFilter, statusFilter, startDate, endDate]);

    const handleConfirm = (id) => {
        setConfirmModal({
            title: 'Confirm Action',
            message: 'Are you sure you want to confirm this action? This marks it as reviewed and approved.',
            variant: 'confirm',
            onConfirm: async () => {
                try {
                    await auditLogService.confirmAction(id);
                    fetchLogs();
                    fetchStats();
                } catch (err) {
                    alert(err.message || 'Failed to confirm');
                }
                setConfirmModal(null);
            },
        });
    };

    const handleRollback = (id) => {
        setConfirmModal({
            title: 'Rollback Action',
            message: 'Warning: This will revert the entity to its previous state. This action itself will be logged. Are you sure?',
            variant: 'rollback',
            onConfirm: async () => {
                try {
                    await auditLogService.rollbackAction(id);
                    fetchLogs();
                    fetchStats();
                } catch (err) {
                    alert(err.message || 'Failed to rollback');
                }
                setConfirmModal(null);
            },
        });
    };

    const pageNumbers = useMemo(() => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i += 1) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="mb-2 font-heading text-3xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                    Activity Logs
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Track, review, and audit all platform actions
                </p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {STAT_CARDS.map((stat) => {
                        const palette = getTone(stat.tone);

                        return (
                            <div key={stat.key} className="glass-panel rounded-xl p-4 shadow-custom transition-transform hover:scale-[1.02]">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                            {stat.label}
                                        </span>
                                        <p className="mt-2 text-2xl font-bold font-mono" style={{ color: palette.color }}>
                                            {stat.getValue(stats).toLocaleString()}
                                        </p>
                                    </div>
                                    <IconBadge icon={stat.icon} tone={stat.tone} size={18} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="glass-panel sticky top-0 z-20 rounded-2xl p-4 shadow-custom">
                <div className="flex flex-col items-center gap-3 lg:flex-row">
                    <div className="search-wrapper relative w-full flex-1">
                        <input
                            type="text"
                            placeholder="Search by actor, description, target..."
                            className="search-input w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="search-icon h-5 w-5" strokeWidth={2.1} />
                    </div>

                    <select className="form-select w-full lg:w-36" style={{ background: 'var(--color-bg-input)' }} value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
                        {ENTITY_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                    </select>

                    <select className="form-select w-full lg:w-36" style={{ background: 'var(--color-bg-input)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {STATUS_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                    </select>

                    <input type="date" className="form-select w-full lg:w-40" style={{ background: 'var(--color-bg-input)' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="form-select w-full lg:w-40" style={{ background: 'var(--color-bg-input)' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    <div className="flex w-full overflow-hidden rounded-lg lg:w-auto" style={{ border: '1px solid var(--color-border)' }}>
                        <button
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors lg:flex-none ${viewMode === 'timeline' ? 'text-cyan-400' : ''}`}
                            style={{ background: viewMode === 'timeline' ? 'rgba(34,211,238,0.12)' : 'var(--color-bg-input)' }}
                            onClick={() => setViewMode('timeline')}
                            type="button"
                        >
                            Timeline
                        </button>
                        <button
                            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors lg:flex-none ${viewMode === 'table' ? 'text-cyan-400' : ''}`}
                            style={{ background: viewMode === 'table' ? 'rgba(34,211,238,0.12)' : 'var(--color-bg-input)' }}
                            onClick={() => setViewMode('table')}
                            type="button"
                        >
                            Table
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--color-cyan-400)', borderTopColor: 'transparent' }} />
                </div>
            ) : logs.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center shadow-custom">
                    <div className="mb-4 flex justify-center">
                        <IconBadge icon={ClipboardList} tone="gray" size={24} className="h-14 w-14 rounded-2xl" />
                    </div>
                    <p className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-text-heading)' }}>No Activity Logs</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No audit events match your filters. Actions will appear here as they occur.</p>
                </div>
            ) : viewMode === 'timeline' ? (
                <div className="pl-1">
                    {logs.map((log) => (
                        <TimelineEntry
                            key={log._id}
                            log={log}
                            isExpanded={expandedId === log._id}
                            onToggle={() => setExpandedId(expandedId === log._id ? null : log._id)}
                            onConfirm={handleConfirm}
                            onRollback={handleRollback}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-panel overflow-hidden rounded-2xl shadow-custom">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px]">
                            <thead style={{ background: 'var(--color-bg-sidebar)' }}>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Actor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Target</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {logs.map((log) => {
                                    const meta = ACTION_META[log.actionType] || { ...DEFAULT_ACTION_META, label: log.actionType };
                                    const sts = STATUS_STYLES[log.status] || STATUS_STYLES.active;
                                    const hasPrevState = log.previousState && Object.keys(log.previousState).length > 0;
                                    const canConfirm = log.status === 'active' || log.status === 'pending';
                                    const canRollback = log.status === 'active' && hasPrevState;

                                    return (
                                        <tr key={log._id} className="table-row-hover transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <IconBadge icon={meta.icon} tone={meta.tone} size={16} className="h-9 w-9 rounded-lg" />
                                                    <div className="min-w-0">
                                                        <span className="block text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                                                        <span className="block truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-cyan-400)' }}>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <User size={14} strokeWidth={2.1} />
                                                    @{log.actor}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>{log.targetLabel || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: sts.bg, color: sts.color, border: `1px solid ${sts.border}` }}>
                                                    {sts.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{getTimeAgo(log.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {canConfirm && (
                                                        <ActionButton
                                                            icon={BadgeCheck}
                                                            label="Confirm"
                                                            tone="green"
                                                            onClick={() => handleConfirm(log._id)}
                                                        />
                                                    )}
                                                    {canRollback && (
                                                        <ActionButton
                                                            icon={Undo2}
                                                            label="Rollback"
                                                            tone="amber"
                                                            onClick={() => handleRollback(log._id)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} events
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} type="button">
                            Previous
                        </button>
                        {pageNumbers.map((page) => (
                            <button key={page} className={`${page === currentPage ? 'btn-primary' : 'btn-secondary hover:text-cyan-400'} px-3 py-1.5 text-sm`} onClick={() => setCurrentPage(page)} type="button">
                                {page}
                            </button>
                        ))}
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} type="button">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {confirmModal && (
                <ConfirmModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    variant={confirmModal.variant}
                    onConfirm={confirmModal.onConfirm}
                    onClose={() => setConfirmModal(null)}
                />
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ActivityLogs;
