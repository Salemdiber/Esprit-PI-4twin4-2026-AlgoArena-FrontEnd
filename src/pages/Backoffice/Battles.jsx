import React, { useEffect, useMemo, useRef, useState } from 'react';
import { battlesService } from '../../services/battlesService';
import { challengeService } from '../../services/challengeService';
import { getDiceBearUrl } from '../../services/dicebear';
import { useAuth } from '../Frontoffice/auth/context/AuthContext';
import '../Frontoffice/battles/battles.css';

const statusStyles = {
    Active: 'badge-warning animate-pulse-glow',
    Completed: 'badge-success',
    Cancelled: 'badge-error',
    Pending: 'badge-info',
};

const modeStyles = {
    'AI Battle': 'badge-purple',
    PvP: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Tournament: 'badge-info',
};

const statusLabels = {
    PENDING: 'Pending',
    ACTIVE: 'Active',
    FINISHED: 'Completed',
    CANCELLED: 'Cancelled',
};

const progressByStatus = {
    PENDING: 10,
    ACTIVE: 60,
    FINISHED: 100,
    CANCELLED: 0,
};

const formatDuration = (startedAt, endedAt, status) => {
    if (!startedAt || status === 'PENDING') return '—';
    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : Date.now();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';
    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const toLocalInputValue = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const BattleCard = ({
    id,
    status,
    mode,
    participants,
    challenge,
    category,
    progress,
    time,
    isWinner = false,
    onEdit,
    onDelete,
    onView,
    isBusy,
}) => (
    <div className="glass-panel rounded-2xl p-6 shadow-custom spotlight-hover transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
            <div className="flex items-center gap-4 flex-wrap">
                <span className={`badge ${statusStyles[status]}`}>{status}</span>
                <span style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Battle ID: #{id}</span>
                <span className={`badge ${modeStyles[mode]}`}>{mode}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={onView}
                    title={status === 'Completed' ? 'View Results' : 'View Details'}
                    className="action-btn action-btn-view"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                <button
                    onClick={onEdit}
                    disabled={isBusy}
                    title="Edit Battle"
                    className="action-btn action-btn-edit"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    disabled={isBusy}
                    title="Delete Battle"
                    className="action-btn action-btn-delete"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1m-4 0h4" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Participants */}
            <div>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mb-2">
                    {isWinner ? 'Winner' : (participants.length > 1 ? 'Participants' : 'Participant')}
                </p>
                {participants.map((p, idx) => (
                    <div key={`${p.username}-${idx}`} className={`flex items-center gap-3 ${idx > 0 ? 'mt-2' : ''}`}>
                        <img
                            src={p.avatar}
                            alt={p.username}
                            className={`${participants.length > 1 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 ${isWinner ? 'border-yellow-400' : 'border-cyan-400'
                                }`}
                        />
                        <div>
                            <p className={`${participants.length > 1 ? 'text-xs' : 'text-sm'} font-medium text-gray-200`}>
                                @{p.username}
                            </p>
                            <p className={`text-xs ${isWinner ? 'text-yellow-400' : 'text-gray-400'}`}>
                                Score: {p.score}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Challenge */}
            <div>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mb-2">Challenge</p>
                <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium ">{challenge}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">{category}</p>
            </div>

            {/* Progress */}
            <div>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mb-2">{status === 'Completed' ? 'Completion' : 'Progress'}</p>
                <div className="flex items-center gap-3">
                    <div className="flex-1 progress-bar h-2">
                        <div
                            className={`progress-bar-fill ${progress === 100 ? 'progress-green' : 'progress-cyan'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className={`text-sm font-medium ${progress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>
                        {progress}%
                    </span>
                </div>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mt-1">
                    {status === 'Completed' ? 'Duration' : 'Time'}: {time}
                </p>
            </div>
        </div>
    </div>
);

const StepMode = ({ mode, onSelect }) => (
    <div>
        <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Choose Battle Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div
                className={`battle-mode-card ${mode === '1VS1' ? 'battle-mode-card--selected' : ''}`}
                onClick={() => onSelect('1VS1')}
            >
                <div className="battle-mode-icon battle-mode-icon--pvp">👥</div>
                <h4 className="battle-font-bold battle-mb-sm" style={{ fontSize: '1.1rem' }}>1vs1 Battle</h4>
                <p className="battle-text-sm battle-text-muted">Create a battle waiting for a real opponent</p>
            </div>

            <div
                className={`battle-mode-card ${mode === '1VSBOT' ? 'battle-mode-card--selected' : ''}`}
                onClick={() => onSelect('1VSBOT')}
            >
                <div className="battle-mode-icon battle-mode-icon--ai">🤖</div>
                <h4 className="battle-font-bold battle-mb-sm" style={{ fontSize: '1.1rem' }}>1vsAI Battle</h4>
                <p className="battle-text-sm battle-text-muted">Auto-assign an AI opponent</p>
            </div>
        </div>
    </div>
);

const StepConfigure = ({
    totalRounds,
    onTotalRoundsChange,
    roundChallenges,
    onRoundChallengeChange,
    challenges,
    battleStatus,
    onBattleStatusChange,
    challengeType,
    winnerUserId,
    showWinnerField,
    onWinnerUserIdChange,
    startedAt,
    endedAt,
    onStartedAtChange,
    onEndedAtChange,
}) => (
    <div>
        <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Configure Battle</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Number of Rounds
                </label>
                <select
                    className="battle-select"
                    value={totalRounds}
                    onChange={(e) => onTotalRoundsChange(parseInt(e.target.value, 10))}
                >
                    {[1, 3, 5, 7, 10].map((n) => (
                        <option key={n} value={n}>Best of {n}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Battle Status
                </label>
                <select
                    className="battle-select"
                    value={battleStatus}
                    onChange={(e) => onBattleStatusChange(e.target.value)}
                >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="FINISHED">Finished</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Challenge Type (auto)
                </label>
                <input
                    className="battle-select"
                    value={challengeType || '—'}
                    readOnly
                />
            </div>

            {showWinnerField && (
                <div>
                    <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Winner User ID
                    </label>
                    <input
                        className="battle-select"
                        value={winnerUserId}
                        onChange={(e) => onWinnerUserIdChange(e.target.value)}
                        placeholder="Winner User ID"
                    />
                </div>
            )}

            <div>
                <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Challenge per Round
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {roundChallenges.map((value, idx) => (
                        <select
                            key={`round-${idx}`}
                            className="battle-select"
                            value={value}
                            onChange={(e) => onRoundChallengeChange(idx, e.target.value)}
                        >
                            <option value="">Round {idx + 1} - Select Challenge</option>
                            {challenges.map((challenge) => (
                                <option key={challenge._id} value={challenge._id}>
                                    {challenge.title}
                                </option>
                            ))}
                        </select>
                    ))}
                </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                    <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Start Time
                    </label>
                    <input
                        type="datetime-local"
                        className="battle-select"
                        value={startedAt}
                        onChange={(e) => onStartedAtChange(e.target.value)}
                    />
                </div>
                <div>
                    <label className="battle-text-sm battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        End Time
                    </label>
                    <input
                        type="datetime-local"
                        className="battle-select"
                        value={endedAt}
                        onChange={(e) => onEndedAtChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>
);

const StepConfirm = ({
    battleType,
    rounds,
    challengeLabels,
    challengeType,
    userId,
    opponentId,
    battleStatus,
    battleIdLabel,
}) => {
    const modeLabel = battleType === '1VSBOT' ? '1vsAI Battle' : '1vs1 Battle';

    return (
        <div>
            <h3 className="battle-text-lg battle-font-semibold battle-mb-md">Confirm Battle</h3>
            <div className="battle-card" style={{ border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Battle ID</span>
                        <span className="battle-font-semibold">{battleIdLabel}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Mode</span>
                        <span className="battle-font-semibold">{modeLabel}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Rounds</span>
                        <span className="battle-font-semibold">Best of {rounds}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Status</span>
                        <span className="battle-font-semibold">{statusLabels[battleStatus] || 'Pending'}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">User</span>
                        <span className="battle-font-semibold">{userId || '—'}</span>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Opponent</span>
                        <span className="battle-font-semibold">{opponentId || '—'}</span>
                    </div>
                    <div>
                        <span className="battle-text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Round Challenges</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {challengeLabels.map((label, idx) => (
                                <span key={`confirm-${idx}`} className="battle-text-sm">Round {idx + 1}: {label || '—'}</span>
                            ))}
                        </div>
                    </div>
                    <div className="battle-flex-between">
                        <span className="battle-text-muted">Challenge Type</span>
                        <span className="battle-font-semibold">{challengeType || '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Battles = () => {
    const { currentUser } = useAuth();
    const aiCounterRef = useRef(0);
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [challenges, setChallenges] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingLabel, setEditingLabel] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [roundChallenges, setRoundChallenges] = useState(['']);
    const [filters, setFilters] = useState({ search: '', mode: 'All Modes', status: 'All Status' });
    const [form, setForm] = useState({
        userId: '',
        opponentId: '',
        roundNumber: 1,
        battleStatus: 'PENDING',
        challengeId: '',
        selectChallengeType: '',
        winnerUserId: '',
        startedAt: '',
        endedAt: '',
        battleType: '1VS1',
    });

    const currentUserId = useMemo(() => (
        currentUser?.userId || currentUser?._id || currentUser?.id || currentUser?.username || ''
    ), [currentUser]);

    const loadBattles = async () => {
        setLoading(true);
        setError('');
        try {
            const resp = await battlesService.getAll();
            const list = Array.isArray(resp?.battles) ? resp.battles : Array.isArray(resp) ? resp : [];
            setBattles(list);
        } catch (err) {
            setError(err?.message || 'Failed to load battles');
        } finally {
            setLoading(false);
        }
    };

    const loadChallenges = async () => {
        setError('');
        try {
            const resp = await challengeService.getAll({ status: 'published', limit: 200 });
            const list = Array.isArray(resp?.challenges)
                ? resp.challenges
                : Array.isArray(resp?.data)
                    ? resp.data
                    : Array.isArray(resp)
                        ? resp
                        : [];
            setChallenges(list);
        } catch (err) {
            setError(err?.message || 'Failed to load challenges');
        } finally {
        }
    };

    useEffect(() => {
        loadBattles();
        loadChallenges();
    }, []);

    useEffect(() => {
        if (!formOpen || editingId) return;
        if (currentUserId) {
            setForm((prev) => ({ ...prev, userId: currentUserId }));
        }
    }, [currentUserId, formOpen, editingId]);

    const challengesById = useMemo(() => {
        return challenges.reduce((acc, challenge) => {
            if (challenge?._id) acc[challenge._id] = challenge;
            return acc;
        }, {});
    }, [challenges]);

    const stats = useMemo(() => {
        const activeCount = battles.filter((b) => b?.battleStatus === 'ACTIVE').length;
        const today = new Date().toDateString();
        const completedToday = battles.filter((b) =>
            b?.battleStatus === 'FINISHED' && b?.endedAt && new Date(b.endedAt).toDateString() === today
        ).length;
        const durations = battles
            .filter((b) => b?.battleStatus === 'FINISHED' && b?.startedAt && b?.endedAt)
            .map((b) => Math.max(0, new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()))
            .filter((ms) => Number.isFinite(ms) && ms > 0);
        const avgMs = durations.length ? durations.reduce((sum, ms) => sum + ms, 0) / durations.length : 0;
        const avgMinutes = avgMs ? Math.round(avgMs / 60000) : 0;
        return {
            activeCount,
            completedToday,
            avgDurationLabel: avgMinutes ? `${avgMinutes}m` : '—',
        };
    }, [battles]);

    const filteredBattles = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        return battles.filter((battle) => {
            const matchesSearch = !search || [
                battle?.idBattle,
                battle?._id,
                battle?.userId,
                battle?.opponentId,
            ].some((value) => value && value.toLowerCase().includes(search));

            const modeLabel = battle?.battleType === '1VSBOT' ? 'AI Battle' : 'PvP';
            const statusLabel = statusLabels[battle?.battleStatus] || 'Pending';

            const matchesMode = filters.mode === 'All Modes' || filters.mode === modeLabel;
            const matchesStatus = filters.status === 'All Status' || filters.status === statusLabel;

            return matchesSearch && matchesMode && matchesStatus;
        });
    }, [battles, filters]);

    const buildDefaultForm = (userId) => ({
        userId: userId || '',
        opponentId: '',
        roundNumber: 1,
        battleStatus: 'PENDING',
        challengeId: '',
        selectChallengeType: '',
        winnerUserId: '',
        startedAt: '',
        endedAt: '',
        battleType: '1VS1',
    });

    const resetForm = () => {
        setForm(buildDefaultForm(currentUserId));
        setRoundChallenges(['']);
        setEditingId(null);
        setEditingLabel('');
        setCreateStep(1);
    };

    const resolveChallengeType = (challenge) => {
        if (!challenge) return '';
        if (challenge?.type) return challenge.type;
        if (Array.isArray(challenge?.tags) && challenge.tags.length > 0) return challenge.tags[0];
        if (challenge?.difficulty) return challenge.difficulty;
        return '';
    };

    const syncChallengeType = (challengeId) => {
        const selected = challengesById[challengeId];
        const type = resolveChallengeType(selected);
        setForm((prev) => ({
            ...prev,
            challengeId: challengeId || '',
            selectChallengeType: type,
        }));
    };

    const handleRoundChallengeChange = (index, value) => {
        setRoundChallenges((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        if (index === 0) {
            syncChallengeType(value);
        }
    };

    const handleTotalRoundsChange = (value) => {
        const total = Math.max(1, Number(value) || 1);
        setForm((prev) => ({ ...prev, roundNumber: total }));
        setRoundChallenges((prev) => {
            const next = [...prev];
            if (next.length < total) {
                while (next.length < total) next.push('');
            } else if (next.length > total) {
                next.length = total;
            }
            return next;
        });
    };

    const handleEdit = (battle) => {
        const challenge = battle?.challengeId ? challengesById[battle.challengeId] : null;
        const autoType = resolveChallengeType(challenge);
        const totalRounds = Math.max(1, Number(battle?.roundNumber) || 1);
        setForm({
            userId: battle?.userId || '',
            opponentId: battle?.opponentId || '',
            roundNumber: totalRounds,
            battleStatus: battle?.battleStatus || 'PENDING',
            challengeId: battle?.challengeId || '',
            selectChallengeType: battle?.selectChallengeType || autoType || '',
            winnerUserId: battle?.winnerUserId || '',
            startedAt: toLocalInputValue(battle?.startedAt),
            endedAt: toLocalInputValue(battle?.endedAt),
            battleType: battle?.battleType || '1VS1',
        });
        setRoundChallenges(() => {
            const next = Array.from({ length: totalRounds }, (_, idx) => (idx === 0 ? battle?.challengeId || '' : ''));
            return next.length ? next : [''];
        });
        setEditingId(battle?._id || battle?.id);
        setEditingLabel(battle?.idBattle || battle?._id || battle?.id || '');
        setCreateStep(2);
        setFormOpen(true);
    };

    const applyBattleMode = (mode) => {
        let opponent = '';
        if (mode === '1VSBOT') {
            aiCounterRef.current += 1;
            opponent = `AI-${aiCounterRef.current}`;
        }
        setForm((prev) => ({
            ...prev,
            battleType: mode,
            opponentId: opponent,
        }));
    };

    const openCreateModal = () => {
        setForm(buildDefaultForm(currentUserId));
        setRoundChallenges(['']);
        setEditingId(null);
        setEditingLabel('');
        setCreateStep(1);
        setFormOpen(true);
    };

    const closeModal = () => {
        setFormOpen(false);
        resetForm();
    };

    useEffect(() => {
        if (!roundChallenges[0]) return;
        syncChallengeType(roundChallenges[0]);
    }, [roundChallenges, challengesById]);

    const handleDelete = async (battle) => {
        const battleId = battle?._id || battle?.id;
        if (!battleId) return;
        const ok = window.confirm(`Delete battle ${battle?.idBattle || battleId}?`);
        if (!ok) return;
        try {
            await battlesService.remove(battleId);
            await loadBattles();
        } catch (err) {
            setError(err?.message || 'Failed to delete battle');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setError('');

        const primaryChallengeId = roundChallenges[0] || form.challengeId;
        const primaryChallenge = primaryChallengeId ? challengesById[primaryChallengeId] : null;
        const primaryType = form.selectChallengeType || resolveChallengeType(primaryChallenge);
        const userId = form.userId || currentUserId;

        const payload = {
            userId: userId || undefined,
            opponentId: form.battleType === '1VSBOT' ? (form.opponentId || 'AI-1') : null,
            roundNumber: Number(form.roundNumber) || 0,
            battleStatus: form.battleStatus || undefined,
            challengeId: primaryChallengeId || undefined,
            selectChallengeType: primaryType || undefined,
            startedAt: form.startedAt ? new Date(form.startedAt).toISOString() : undefined,
            endedAt: form.endedAt ? new Date(form.endedAt).toISOString() : undefined,
            battleType: form.battleType || undefined,
        };

        if (form.battleStatus === 'FINISHED' && form.winnerUserId) {
            payload.winnerUserId = form.winnerUserId;
        }

        try {
            if (editingId) {
                await battlesService.update(editingId, payload);
            } else {
                await battlesService.create(payload);
            }
            resetForm();
            setFormOpen(false);
            await loadBattles();
        } catch (err) {
            setError(err?.message || 'Failed to save battle');
        } finally {
            setIsSaving(false);
        }
    };

    const battleCards = filteredBattles.map((battle) => {
        const linkedChallenge = battle?.challengeId ? challengesById[battle.challengeId] : null;
        const statusLabel = statusLabels[battle?.battleStatus] || 'Pending';
        const modeLabel = battle?.battleType === '1VSBOT' ? 'AI Battle' : 'PvP';
        const participants = [battle?.userId, battle?.opponentId]
            .filter(Boolean)
            .map((username) => ({
                username,
                score: '—',
                avatar: getDiceBearUrl(username, battle?.battleType === '1VSBOT' ? 'bottts' : 'adventurer'),
            }));
        const challengeLabel = linkedChallenge?.title || battle?.challengeId || '—';
        const typeLabel = battle?.selectChallengeType || resolveChallengeType(linkedChallenge) || '—';

        return {
            id: battle?.idBattle || battle?._id || battle?.id || '—',
            status: statusLabel,
            mode: modeLabel,
            participants: participants.length ? participants : [{ username: 'unknown', score: '—', avatar: getDiceBearUrl('unknown') }],
            challenge: challengeLabel,
            category: typeLabel,
            progress: progressByStatus[battle?.battleStatus] ?? 0,
            time: formatDuration(battle?.startedAt, battle?.endedAt, battle?.battleStatus),
            isWinner: Boolean(battle?.winnerUserId && battle?.winnerUserId === battle?.userId),
            raw: battle,
        };
    });

    const nextBattleLabel = useMemo(() => {
        const nextIndex = battles.length + 1;
        return `BT-${String(nextIndex).padStart(4, '0')}`;
    }, [battles.length]);

    const roundChallengeLabels = useMemo(() => {
        return roundChallenges.map((id) => challengesById[id]?.title || '');
    }, [roundChallenges, challengesById]);

    const canGoNext = () => {
        if (createStep === 1) return Boolean(form.battleType);
        if (createStep === 2) return Boolean(roundChallenges[0]);
        return true;
    };

    const handleNext = () => {
        if (createStep < 3) setCreateStep((prev) => prev + 1);
    };

    const handleBack = () => {
        if (createStep > 1) setCreateStep((prev) => prev - 1);
    };

    const handleConfirm = () => {
        handleSubmit({ preventDefault: () => {} });
    };

    const stepCircleClass = (step) => {
        if (step < createStep) return 'battle-step-circle battle-step-circle--done';
        if (step === createStep) return 'battle-step-circle battle-step-circle--active';
        return 'battle-step-circle battle-step-circle--inactive';
    };

    const stepLineClass = (step) => (
        step < createStep ? 'battle-step-line battle-step-line--active' : 'battle-step-line'
    );

    const stepLabels = ['Mode', 'Configure', 'Confirm'];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">Battle Monitor</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="">Track live battles and competition activity</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => (formOpen ? closeModal() : openCreateModal())}
                        className="battle-btn battle-btn--primary"
                    >
                        {formOpen ? 'Close Form' : 'New Battle'}
                    </button>
                    <button
                        onClick={loadBattles}
                        title="Refresh"
                        className="action-btn action-btn-view"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-2.64-6.36" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3v6h-6" />
                        </svg>
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-panel rounded-xl p-4 border border-red-500/30 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {formOpen && (
                <div className="battle-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="battle-modal">
                        <div className="battle-flex-between battle-mb-lg">
                            <h2 className="battle-text-2xl battle-font-bold">{editingId ? 'Update Battle' : 'Create New Battle'}</h2>
                            <button
                                onClick={closeModal}
                                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="battle-step-indicator">
                            {stepLabels.map((label, idx) => (
                                <React.Fragment key={label}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className={stepCircleClass(idx + 1)}>
                                            {idx + 1 < createStep ? '✓' : idx + 1}
                                        </div>
                                        <span
                                            className="battle-text-xs"
                                            style={{
                                                color: idx + 1 === createStep ? 'var(--color-cyan-400)' : 'var(--color-text-muted)',
                                                fontWeight: idx + 1 === createStep ? 600 : 400,
                                                marginTop: '0.5rem',
                                            }}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {idx < stepLabels.length - 1 && <div className={stepLineClass(idx + 1)} />}
                                </React.Fragment>
                            ))}
                        </div>

                        {createStep === 1 && (
                            <StepMode
                                mode={form.battleType}
                                onSelect={applyBattleMode}
                            />
                        )}
                        {createStep === 2 && (
                            <StepConfigure
                                totalRounds={form.roundNumber}
                                onTotalRoundsChange={handleTotalRoundsChange}
                                roundChallenges={roundChallenges}
                                onRoundChallengeChange={handleRoundChallengeChange}
                                challenges={challenges}
                                battleStatus={form.battleStatus}
                                onBattleStatusChange={(value) => setForm((prev) => ({ ...prev, battleStatus: value }))}
                                challengeType={form.selectChallengeType}
                                winnerUserId={form.winnerUserId}
                                showWinnerField={form.battleStatus === 'FINISHED'}
                                onWinnerUserIdChange={(value) => setForm((prev) => ({ ...prev, winnerUserId: value }))}
                                startedAt={form.startedAt}
                                endedAt={form.endedAt}
                                onStartedAtChange={(value) => setForm((prev) => ({ ...prev, startedAt: value }))}
                                onEndedAtChange={(value) => setForm((prev) => ({ ...prev, endedAt: value }))}
                            />
                        )}
                        {createStep === 3 && (
                            <StepConfirm
                                battleType={form.battleType}
                                rounds={form.roundNumber}
                                challengeLabels={roundChallengeLabels}
                                challengeType={form.selectChallengeType}
                                userId={form.userId}
                                opponentId={form.opponentId}
                                battleStatus={form.battleStatus}
                                battleIdLabel={editingLabel || nextBattleLabel}
                            />
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', marginTop: '1.5rem' }}>
                            {createStep > 1 ? (
                                <button className="battle-btn battle-btn--secondary" onClick={handleBack}>← Back</button>
                            ) : (
                                <button className="battle-btn battle-btn--secondary" onClick={closeModal}>Cancel</button>
                            )}

                            {createStep < 3 ? (
                                <button
                                    className="battle-btn battle-btn--primary"
                                    onClick={handleNext}
                                    disabled={!canGoNext()}
                                    style={{ opacity: canGoNext() ? 1 : 0.5 }}
                                >
                                    Next Step →
                                </button>
                            ) : (
                                <button
                                    className="battle-btn battle-btn--primary"
                                    onClick={handleConfirm}
                                    disabled={isSaving}
                                    style={{ opacity: isSaving ? 0.6 : 1 }}
                                >
                                    {isSaving ? 'Saving...' : editingId ? 'Update Battle' : 'Create Battle'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">{stats.activeCount}</h3>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Active Battles</p>
                </div>

                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">{stats.completedToday}</h3>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Completed Today</p>
                </div>

                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-cyan-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">{stats.avgDurationLabel}</h3>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Avg Duration</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel rounded-2xl p-4 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative search-wrapper">
                        <input
                            type="text"
                            placeholder="Search battles by ID or participants..."
                            className="search-input w-full"
                            value={filters.search}
                            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select
                        className="form-select w-full md:w-40 bg-(--color-bg-input)"
                        value={filters.mode}
                        onChange={(e) => setFilters((prev) => ({ ...prev, mode: e.target.value }))}
                    >
                        <option>All Modes</option>
                        <option>AI Battle</option>
                        <option>PvP</option>
                    </select>
                    <select
                        className="form-select w-full md:w-40 bg-(--color-bg-input)"
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Battle List */}
            <div className="space-y-4">
                {loading && (
                    <div className="glass-panel rounded-xl p-4 text-sm text-gray-300">
                        Loading battles...
                    </div>
                )}
                {!loading && battleCards.length === 0 && (
                    <div className="glass-panel rounded-xl p-4 text-sm text-gray-300">
                        No battles found.
                    </div>
                )}
                {battleCards.map((battle) => (
                    <BattleCard
                        key={battle.id}
                        {...battle}
                        onView={() => handleEdit(battle.raw)}
                        onEdit={() => handleEdit(battle.raw)}
                        onDelete={() => handleDelete(battle.raw)}
                        isBusy={isSaving}
                    />
                ))}
            </div>
        </div>
    );
};

export default Battles;
