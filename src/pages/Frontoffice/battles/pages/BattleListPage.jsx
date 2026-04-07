/**
 * BattleListPage – main arena view
 *
 * Shows filters, battle grid, and create button.
 * Navigates to active battle or summary on card action.
 * Loading skeleton state
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBattleState } from '../hooks/useBattleState';
import { BattleStatus } from '../types/battle.types';
import BattleCard from '../components/BattleCard';
import BattleFilters from '../components/BattleFilters';
import CreateBattleModal from '../components/CreateBattleModal';
import BattlesListSkeleton from '../../../../shared/skeletons/BattlesListSkeleton';
import { settingsService } from '../../../../services/settingsService';
import UserRankStatsBar from '../../challenges/components/UserRankStatsBar';
import { useChallengeContext } from '../../challenges/context/ChallengeContext';
import { useAuth } from '../../auth/context/AuthContext';
import '../battles.css';

const formatRelative = (isoValue) => {
    if (!isoValue) return 'recently';
    const ms = Date.now() - new Date(isoValue).getTime();
    if (!Number.isFinite(ms) || ms < 0) return 'recently';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const BattleListPage = () => {
    const navigate = useNavigate();
    const {
        battles,
        selectBattle,
        openCreateModal,
        cancelBattle,
        isLoading,
        error,
    } = useBattleState();
    const { refreshUserStats } = useChallengeContext();
    const { currentUser } = useAuth();

    const currentUserId = currentUser?.userId || currentUser?._id || currentUser?.id || currentUser?.username || null;
    const buildLeftKey = (battleId) => `battle-left:${currentUserId || 'anon'}:${battleId}`;
    const getLeftMeta = (battleId) => {
        try {
            const raw = localStorage.getItem(buildLeftKey(battleId));
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    };
    const hasLeftInProgress = (battle) => {
        if (!battle?.id) return false;
        if (![BattleStatus.ACTIVE, BattleStatus.LIVE].includes(battle.status)) return false;
        try {
            return Boolean(localStorage.getItem(buildLeftKey(battle.id)));
        } catch {
            return false;
        }
    };

    const inProgressBattles = useMemo(() => {
        return battles
            .filter((b) => [BattleStatus.ACTIVE, BattleStatus.LIVE].includes(b.status))
            .slice();
    }, [battles]);

    const mostRecentInProgress = useMemo(() => {
        if (!inProgressBattles.length) return null;
        const sortKey = (b) => {
            const leftAt = getLeftMeta(b.id)?.leftAt;
            const createdAt = b.createdAt ? new Date(b.createdAt).toISOString() : null;
            const timeValue = new Date(leftAt || createdAt || 0).getTime();
            return Number.isFinite(timeValue) ? timeValue : 0;
        };
        return inProgressBattles.slice().sort((a, b) => sortKey(b) - sortKey(a))[0] || null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inProgressBattles, currentUserId]);

    const [filters, setFilters] = useState({ modes: [], statuses: [], search: '' });
    const [aiBattlesEnabled, setAiBattlesEnabled] = useState(true);

    // Fetch AI battles setting
    useEffect(() => {
        settingsService.getSettings()
            .then((data) => setAiBattlesEnabled(data?.aiBattles ?? true))
            .catch(() => setAiBattlesEnabled(true));
    }, []);

    useEffect(() => {
        refreshUserStats?.();
    }, [refreshUserStats]);

    // Filter battles
    const filteredBattles = useMemo(() => {
        return battles.filter(b => {
            // Exclude cancelled from default view
            if (b.status === BattleStatus.CANCELLED) return false;

            // Mode filter
            if (filters.modes.length > 0 && !filters.modes.includes(b.mode)) return false;

            // Status filter (map LIVE to show under ACTIVE too)
            if (filters.statuses.length > 0) {
                const mappedStatuses = filters.statuses.flatMap(s =>
                    s === BattleStatus.ACTIVE ? [BattleStatus.ACTIVE, BattleStatus.LIVE] : [s]
                );
                if (!mappedStatuses.includes(b.status)) return false;
            }

            // Search
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const opponentName = b.opponent?.name?.toLowerCase() || '';
                if (!opponentName.includes(q)) return false;
            }

            return true;
        });
    }, [battles, filters]);

    const handleEnterBattle = (id) => {
        const battle = battles.find((b) => b.id === id);
        if (battle && hasLeftInProgress(battle)) {
            const confirmed = window.confirm('This battle is still running. Return to resume it now?');
            if (!confirmed) return;
        }
        selectBattle(id);
        navigate(`/battles/${id}`);
    };

    const handleViewSummary = (id) => {
        selectBattle(id);
        navigate(`/battles/${id}/summary`);
    };

    const handleCancel = (id) => {
        cancelBattle(id);
    };

    // Show skeleton during loading
    if (isLoading) {
        return <BattlesListSkeleton />;
    }

    return (
        <div className="battle-page">
            <div className="battle-container">
                {/* Header */}
                <div className="battle-mb-xl">
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-heading)' }}>
                        Battle Arena
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>
                        Compete. Strategize. Dominate.
                    </p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <UserRankStatsBar />
                    </div>
                </div>

                {inProgressBattles.length > 0 && mostRecentInProgress && (
                    <div
                        className="battle-card battle-mb-lg"
                        style={{
                            borderLeft: '4px solid var(--color-yellow-500)',
                        }}
                    >
                        <div className="battle-flex-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 0 }}>
                                <p className="battle-text-yellow" style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                                    {inProgressBattles.length === 1 ? 'You have a battle in progress!' : `You have ${inProgressBattles.length} battles in progress!`}
                                </p>
                                {inProgressBattles.length === 1 ? (
                                    <>
                                        <p className="battle-font-semibold" style={{ marginBottom: '0.25rem' }}>
                                            {mostRecentInProgress.mode} • vs {mostRecentInProgress.opponent?.name || 'Opponent'}
                                        </p>
                                        <p className="battle-text-muted battle-text-sm">
                                            {hasLeftInProgress(mostRecentInProgress)
                                                ? `Last active ${formatRelative(getLeftMeta(mostRecentInProgress.id)?.leftAt)}`
                                                : `Started ${formatRelative(mostRecentInProgress.createdAt)}`}
                                            {' '}• Round {Math.max(0, Number(mostRecentInProgress.currentRoundIndex || 0)) + 1} of {mostRecentInProgress.totalRounds}
                                        </p>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                                        {inProgressBattles
                                            .slice()
                                            .sort((a, b) => {
                                                const aKey = new Date((getLeftMeta(a.id)?.leftAt || a.createdAt || 0)).getTime();
                                                const bKey = new Date((getLeftMeta(b.id)?.leftAt || b.createdAt || 0)).getTime();
                                                return (Number.isFinite(bKey) ? bKey : 0) - (Number.isFinite(aKey) ? aKey : 0);
                                            })
                                            .slice(0, 3)
                                            .map((b) => (
                                                <div key={`in-progress-${b.id}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <span className="battle-text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                                        {b.mode} • vs {b.opponent?.name || 'Opponent'}
                                                    </span>
                                                    <button
                                                        className="battle-btn battle-btn--secondary"
                                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                                        onClick={() => handleEnterBattle(b.id)}
                                                    >
                                                        Continue
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <button
                                className="battle-btn battle-btn--primary"
                                onClick={() => handleEnterBattle(mostRecentInProgress.id)}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                Continue Battle
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Sidebar Filters */}
                    <BattleFilters onFilterChange={setFilters} />

                    {/* Main Content */}
                    <main style={{ flex: 1, minWidth: 0 }}>
                        {/* Toolbar */}
                        <div className="battle-flex-between battle-mb-lg">
                            <p className="battle-text-muted">
                                Showing <span className="battle-text-cyan battle-font-semibold">{filteredBattles.length}</span> battles
                            </p>
                            <button className="battle-btn battle-btn--primary" onClick={openCreateModal}>
                                + Create Battle
                            </button>
                        </div>

                        {error && (
                            <div className="battle-card" style={{ marginBottom: '1rem', borderColor: 'var(--color-red-500)' }}>
                                <p className="battle-text-muted" style={{ color: 'var(--color-red-500)' }}>{error}</p>
                            </div>
                        )}

                        {/* Battle Grid */}
                        {filteredBattles.length === 0 ? (
                            <div className="battle-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚔️</p>
                                <p className="battle-text-muted">No battles found matching your filters.</p>
                                <button
                                    className="battle-btn battle-btn--primary"
                                    style={{ marginTop: '1rem' }}
                                    onClick={openCreateModal}
                                >
                                    Create Your First Battle
                                </button>
                            </div>
                        ) : (
                            <div className="battle-grid">
                                {filteredBattles.map(battle => (
                                    <BattleCard
                                        key={battle.id}
                                        battle={battle}
                                        onEnter={handleEnterBattle}
                                        onViewSummary={handleViewSummary}
                                        onCancel={handleCancel}
                                        aiBattlesEnabled={aiBattlesEnabled}
                                        resumeAvailable={hasLeftInProgress(battle)}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Create Battle Modal */}
            <CreateBattleModal />
        </div>
    );
};

export default BattleListPage;
