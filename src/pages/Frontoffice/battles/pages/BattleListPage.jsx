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
import '../battles.css';

const BattleListPage = () => {
    const navigate = useNavigate();
    const {
        battles,
        selectBattle,
        openCreateModal,
        cancelBattle,
    } = useBattleState();

    // Loading state (simulated – will be replaced with real API call)
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ modes: [], statuses: [], search: '' });
    const [aiBattlesEnabled, setAiBattlesEnabled] = useState(true);

    // Fetch AI battles setting
    useEffect(() => {
        settingsService.getSettings()
            .then((data) => setAiBattlesEnabled(data?.aiBattles ?? true))
            .catch(() => setAiBattlesEnabled(true));
    }, []);

    // Simulate data fetching
    useEffect(() => {
        // In production: replace with actual API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [filters]);

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
                </div>

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
