import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { auditLogService } from '../../services/auditLogService';

/* ─── Action Type Metadata ────────────────────────────────────────────── */
const ACTION_META = {
    USER_REGISTERED: { icon: '👤', label: 'User Registered', color: '#22d3ee', entity: 'user' },
    USER_BANNED: { icon: '🚫', label: 'User Banned', color: '#f87171', entity: 'user' },
    USER_UNBANNED: { icon: '✅', label: 'User Unbanned', color: '#34d399', entity: 'user' },
    USER_DELETED: { icon: '🗑️', label: 'User Deleted', color: '#f87171', entity: 'user' },
    USER_ROLE_CHANGED: { icon: '🔄', label: 'Role Changed', color: '#a78bfa', entity: 'user' },
    PASSWORD_RESET: { icon: '🔑', label: 'Password Reset', color: '#fbbf24', entity: 'user' },
    ADMIN_ADDED: { icon: '🛡️', label: 'Admin Added', color: '#22d3ee', entity: 'admin' },
    ADMIN_REMOVED: { icon: '❌', label: 'Admin Removed', color: '#f87171', entity: 'admin' },
    ADMIN_ROLE_UPDATED: { icon: '⚙️', label: 'Admin Role Updated', color: '#a78bfa', entity: 'admin' },
    PERMISSION_CHANGED: { icon: '🔐', label: 'Permission Changed', color: '#fbbf24', entity: 'admin' },
    CHALLENGE_CREATED: { icon: '📝', label: 'Challenge Created', color: '#34d399', entity: 'challenge' },
    CHALLENGE_PUBLISHED: { icon: '🚀', label: 'Challenge Published', color: '#22c55e', entity: 'challenge' },
    CHALLENGE_UNPUBLISHED: { icon: '📦', label: 'Challenge Unpublished', color: '#f59e0b', entity: 'challenge' },
    CHALLENGE_EDITED: { icon: '✏️', label: 'Challenge Edited', color: '#60a5fa', entity: 'challenge' },
    CHALLENGE_DELETED: { icon: '🗑️', label: 'Challenge Deleted', color: '#f87171', entity: 'challenge' },
    DIFFICULTY_CHANGED: { icon: '📊', label: 'Difficulty Changed', color: '#fbbf24', entity: 'challenge' },
    TAGS_UPDATED: { icon: '🏷️', label: 'Tags Updated', color: '#a78bfa', entity: 'challenge' },
    SYSTEM_CONFIG_UPDATED: { icon: '⚙️', label: 'Config Updated', color: '#60a5fa', entity: 'system' },
    FEATURE_FLAG_CHANGED: { icon: '🚩', label: 'Feature Flag', color: '#fbbf24', entity: 'system' },
    SECURITY_SETTINGS_CHANGED: { icon: '🔒', label: 'Security Updated', color: '#f87171', entity: 'system' },
    '2FA_ENFORCEMENT_UPDATED': { icon: '📱', label: '2FA Updated', color: '#a78bfa', entity: 'system' },
    ACTION_CONFIRMED: { icon: '✔️', label: 'Confirmed', color: '#34d399', entity: 'audit' },
    ACTION_ROLLED_BACK: { icon: '↩️', label: 'Rolled Back', color: '#fbbf24', entity: 'audit' },
};

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

/* ─── Timeline Entry ──────────────────────────────────────────────────── */
const TimelineEntry = ({ log, onConfirm, onRollback, isExpanded, onToggle }) => {
    const meta = ACTION_META[log.actionType] || { icon: '📋', label: log.actionType, color: '#94a3b8' };
    const sts = STATUS_STYLES[log.status] || STATUS_STYLES.active;
    const timeAgo = getTimeAgo(log.createdAt);
    const hasPrevState = log.previousState && Object.keys(log.previousState).length > 0;
    const hasNewState = log.newState && Object.keys(log.newState).length > 0;
    const canConfirm = log.status === 'active' || log.status === 'pending';
    const canRollback = log.status === 'active' && hasPrevState;

    return (
        <div className="relative flex gap-4 pb-8 group" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110"
                    style={{ background: `${meta.color}18`, border: `1.5px solid ${meta.color}40` }}
                >
                    {meta.icon}
                </div>
                <div className="flex-1 w-px mt-2" style={{ background: 'var(--color-border)' }} />
            </div>

            {/* Content card */}
            <div
                className="flex-1 glass-panel rounded-xl p-4 transition-all cursor-pointer group-hover:shadow-lg"
                style={{ borderLeft: `3px solid ${meta.color}`, transition: 'box-shadow 0.3s ease, transform 0.2s ease' }}
                onClick={onToggle}
            >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                                className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
                            >
                                {meta.label}
                            </span>
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ background: sts.bg, color: sts.color, border: `1px solid ${sts.border}` }}
                            >
                                {sts.label}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                            {log.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-xs font-medium" style={{ color: 'var(--color-cyan-400)' }}>
                                @{log.actor}
                            </span>
                            {log.targetLabel && (
                                <>
                                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                                    <span className="text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                                        {log.targetLabel}
                                    </span>
                                </>
                            )}
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {timeAgo}
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {canConfirm && (
                            <button
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                                style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
                                onClick={(e) => { e.stopPropagation(); onConfirm(log._id); }}
                            >
                                ✓ Confirm
                            </button>
                        )}
                        {canRollback && (
                            <button
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105"
                                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                                onClick={(e) => { e.stopPropagation(); onRollback(log._id); }}
                            >
                                ↩ Rollback
                            </button>
                        )}
                        <button className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Expanded: State Diff viewer */}
                {isExpanded && (hasPrevState || hasNewState) && (
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                            State Changes
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {hasPrevState && (
                                <div className="rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>Previous State</p>
                                    {Object.entries(log.previousState).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-xs py-0.5">
                                            <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                                            <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{String(val)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {hasNewState && (
                                <div className="rounded-lg p-3" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>New State</p>
                                    {Object.entries(log.newState).map(([key, val]) => (
                                        <div key={key} className="flex justify-between text-xs py-0.5">
                                            <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                                            <span className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{String(val)}</span>
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

/* ─── Confirm Modal ───────────────────────────────────────────────────── */
const ConfirmModal = ({ title, message, onConfirm, onClose, variant = 'confirm' }) => {
    const isWarning = variant === 'rollback';
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}
            style={{ margin: 0, padding: 0, top: 0, left: 0, width: '100vw', height: '100vh' }}>
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-custom animate-scale-in text-center" onClick={(e) => e.stopPropagation()}
                style={{ position: 'relative', margin: 'auto' }}>
                <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isWarning ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                    <span className="text-xl">{isWarning ? '⚠️' : '✅'}</span>
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>{title}</h2>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded-lg font-semibold transition-colors"
                        style={{
                            background: isWarning ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)',
                            color: isWarning ? '#fbbf24' : '#34d399',
                            border: `1px solid ${isWarning ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}`,
                        }}
                    >
                        {isWarning ? 'Rollback' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Utility ────────────────────────────────────────────────────────── */
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

/* ─── Main Page ──────────────────────────────────────────────────────── */
const ITEMS_PER_PAGE = 15;

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // View mode
    const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'
    const [expandedId, setExpandedId] = useState(null);

    // Modals
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

    // Page numbers
    const pageNumbers = useMemo(() => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                    Activity Logs
                </h1>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    Track, review, and audit all platform actions
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Events', value: stats.total || 0, icon: '📊', color: '#22d3ee' },
                        { label: 'Last 24h', value: stats.last24h || 0, icon: '🕐', color: '#34d399' },
                        { label: 'Last 7 Days', value: stats.lastWeek || 0, icon: '📅', color: '#60a5fa' },
                        { label: 'Rolled Back', value: (stats.byStatus || []).find(s => s._id === 'rolled_back')?.count || 0, icon: '↩️', color: '#fbbf24' },
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel rounded-xl p-4 shadow-custom transition-transform hover:scale-[1.02]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                    {stat.label}
                                </span>
                                <span className="text-lg">{stat.icon}</span>
                            </div>
                            <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="glass-panel rounded-2xl p-4 shadow-custom sticky top-0 z-20">
                <div className="flex flex-col lg:flex-row gap-3 items-center">
                    {/* Search */}
                    <div className="flex-1 relative search-wrapper w-full">
                        <input
                            type="text"
                            placeholder="Search by actor, description, target..."
                            className="search-input w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Entity filter */}
                    <select className="form-select w-full lg:w-36" style={{ background: 'var(--color-bg-input)' }} value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
                        {ENTITY_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>

                    {/* Status filter */}
                    <select className="form-select w-full lg:w-36" style={{ background: 'var(--color-bg-input)' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>

                    {/* Date range */}
                    <input type="date" className="form-select w-full lg:w-40" style={{ background: 'var(--color-bg-input)' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" className="form-select w-full lg:w-40" style={{ background: 'var(--color-bg-input)' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                    {/* View toggle */}
                    <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                        <button
                            className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'timeline' ? 'text-cyan-400' : ''}`}
                            style={{ background: viewMode === 'timeline' ? 'rgba(34,211,238,0.12)' : 'var(--color-bg-input)' }}
                            onClick={() => setViewMode('timeline')}
                        >
                            Timeline
                        </button>
                        <button
                            className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'table' ? 'text-cyan-400' : ''}`}
                            style={{ background: viewMode === 'table' ? 'rgba(34,211,238,0.12)' : 'var(--color-bg-input)' }}
                            onClick={() => setViewMode('table')}
                        >
                            Table
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-cyan-400)', borderTopColor: 'transparent' }} />
                </div>
            ) : logs.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center shadow-custom">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-heading)' }}>No Activity Logs</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No audit events match your filters. Actions will appear here as they occur.</p>
                </div>
            ) : viewMode === 'timeline' ? (
                /* ── Timeline View ── */
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
                /* ── Table View ── */
                <div className="glass-panel rounded-2xl shadow-custom overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
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
                                    const meta = ACTION_META[log.actionType] || { icon: '📋', label: log.actionType, color: '#94a3b8' };
                                    const sts = STATUS_STYLES[log.status] || STATUS_STYLES.active;
                                    const canConfirm = log.status === 'active' || log.status === 'pending';
                                    const canRollback = log.status === 'active' && log.previousState;
                                    return (
                                        <tr key={log._id} className="table-row-hover transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span>{meta.icon}</span>
                                                    <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-cyan-400)' }}>@{log.actor}</td>
                                            <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>{log.targetLabel || '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: sts.bg, color: sts.color, border: `1px solid ${sts.border}` }}>
                                                    {sts.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{getTimeAgo(log.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {canConfirm && (
                                                        <button className="text-xs px-2 py-1 rounded" style={{ color: '#34d399' }} onClick={() => handleConfirm(log._id)} title="Confirm">✓</button>
                                                    )}
                                                    {canRollback && (
                                                        <button className="text-xs px-2 py-1 rounded" style={{ color: '#fbbf24' }} onClick={() => handleRollback(log._id)} title="Rollback">↩</button>
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

            {/* Pagination */}
            {!loading && logs.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} events
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                            Previous
                        </button>
                        {pageNumbers.map(n => (
                            <button key={n} className={`${n === currentPage ? 'btn-primary' : 'btn-secondary hover:text-cyan-400'} px-3 py-1.5 text-sm`} onClick={() => setCurrentPage(n)}>
                                {n}
                            </button>
                        ))}
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm/Rollback Modal */}
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
