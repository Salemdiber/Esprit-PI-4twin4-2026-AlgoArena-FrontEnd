/**
 * BattleListPage – main arena view
 *
 * Shows filters, battle grid, and create button.
 * Navigates to active battle or summary on card action.
 * Loading skeleton state
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBattleState } from '../hooks/useBattleState';
import { BattleStatus } from '../types/battle.types';
import BattleCard from '../components/BattleCard';
import BattleFilters from '../components/BattleFilters';
import CreateBattleModal from '../components/CreateBattleModal';
import BattlesListSkeleton from '../../../../shared/skeletons/BattlesListSkeleton';
import { settingsService } from '../../../../services/settingsService';
import UserRankStatsBar from '../../challenges/components/UserRankStatsBar';
import { useChallengeContext } from '../../challenges/context/ChallengeContext';
import '../battles.css';

const BattleListPage = () => {
    const { t } = useTranslation();
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
            if (b.status === BattleStatus.CANCELLED) return false;

            if (filters.modes.length > 0 && !filters.modes.includes(b.mode)) return false;

            if (filters.statuses.length > 0) {
                const mappedStatuses = filters.statuses.flatMap(s =>
                    s === BattleStatus.ACTIVE ? [BattleStatus.ACTIVE, BattleStatus.LIVE] : [s]
                );
                if (!mappedStatuses.includes(b.status)) return false;
            }

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

    if (isLoading) {
        return <BattlesListSkeleton />;
    }

    return (
        <div className="battle-page">
            <div className="battle-container">
                {/* Header */}
                <div className="battle-mb-xl">
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-heading)' }}>
                        {t('battles.arenaTitle')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)' }}>
                        {t('battles.arenaSubtitle')}
                    </p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <UserRankStatsBar />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {/* Sidebar Filters */}
                    <BattleFilters onFilterChange={setFilters} />

                    {/* Main Content */}
                    <main style={{ flex: 1, minWidth: 0 }}>
                        {/* Toolbar */}
                        <div className="battle-flex-between battle-mb-lg">
                            <p className="battle-text-muted">
                                {t('battles.showing')} <span className="battle-text-cyan battle-font-semibold">{filteredBattles.length}</span> {t('battles.battlesLabel')}
                            </p>
                            <button className="battle-btn battle-btn--primary" onClick={openCreateModal}>
                                {t('battles.createBattle')}
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
                                <p className="battle-text-muted">{t('battles.noBattlesFound')}</p>
                                <button
                                    className="battle-btn battle-btn--primary"
                                    style={{ marginTop: '1rem' }}
                                    onClick={openCreateModal}
                                >
                                    {t('battles.createFirstBattle')}
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
