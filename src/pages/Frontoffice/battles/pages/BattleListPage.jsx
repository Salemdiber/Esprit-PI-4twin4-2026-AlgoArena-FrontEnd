/**
 * BattleListPage – main arena view
 *
 * Shows filters, battle grid, and create button.
 * Navigates to active battle or summary on card action.
 * Loading skeleton state
 */
import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBattleState } from '../hooks/useBattleState';
import { BattleStatus } from '../types/battle.types';
import BattleCard from '../components/BattleCard';
import BattlesListSkeleton from '../../../../shared/skeletons/BattlesListSkeleton';
import { settingsService } from '../../../../services/settingsService';
import { useColorModeValue } from '@chakra-ui/react';
import '../battles.css';

const BattleFilters = React.lazy(() => import('../components/BattleFilters'));
const UserRankStatsBar = React.lazy(() => import('../../challenges/components/UserRankStatsBar'));
const CreateBattleModal = React.lazy(() => import('../components/CreateBattleModal'));

const DeferredBattleCard = React.memo(({
    battle,
    shouldRenderImmediately,
    ...cardProps
}) => {
    const [shouldRender, setShouldRender] = useState(shouldRenderImmediately);
    const hostRef = React.useRef(null);

    useEffect(() => {
        if (shouldRender || shouldRenderImmediately) return undefined;
        const node = hostRef.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            setShouldRender(true);
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;
                setShouldRender(true);
                observer.disconnect();
            },
            { rootMargin: '420px 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [shouldRender, shouldRenderImmediately]);

    if (!shouldRender && !shouldRenderImmediately) {
        return (
            <div
                ref={hostRef}
                className="battle-card"
                aria-hidden="true"
                style={{ minHeight: 280, visibility: 'hidden' }}
            />
        );
    }

    return <BattleCard battle={battle} {...cardProps} />;
});

const BattleListPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        battles,
        selectBattle,
        openCreateModal,
        joinBattle,
        cancelBattle,
        isLoading,
        error,
        createModal,
    } = useBattleState();

    const [filters, setFilters] = useState({ modes: [], statuses: [], search: '' });
    const [aiBattlesEnabled, setAiBattlesEnabled] = useState(true);
    const [showRankStats, setShowRankStats] = useState(false);
    const titleColor = useColorModeValue('gray.800', 'var(--color-text-heading)');
    const subtitleColor = useColorModeValue('gray.600', 'var(--color-text-secondary)');
    const handleFilterChange = useCallback((next) => setFilters(next), []);

    // Fetch AI battles setting
    useEffect(() => {
        let cancelled = false;
        const loadSettings = () => {
            settingsService.getSettings()
                .then((data) => {
                    if (!cancelled) setAiBattlesEnabled(data?.aiBattles ?? true);
                })
                .catch(() => {
                    if (!cancelled) setAiBattlesEnabled(true);
                });
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(loadSettings, { timeout: 2500 });
            return () => {
                cancelled = true;
                window.cancelIdleCallback(idleId);
            };
        }

        const timeoutId = window.setTimeout(loadSettings, 1200);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const mountStats = () => {
            if (!cancelled) setShowRankStats(true);
        };
        const idleId = window.setTimeout(mountStats, 4000);

        return () => {
            cancelled = true;
            window.clearTimeout(idleId);
        };
    }, []);

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

    const handleEnterBattle = useCallback((id) => {
        selectBattle(id);
        navigate(`/battles/${id}`);
    }, [navigate, selectBattle]);

    const handleViewSummary = useCallback((id) => {
        selectBattle(id);
        navigate(`/battles/${id}/summary`);
    }, [navigate, selectBattle]);

    const handleCancel = useCallback((id) => {
        cancelBattle(id);
    }, [cancelBattle]);

    const handleJoin = useCallback(async (id) => {
        const ok = await joinBattle(id);
        if (!ok) return;
        selectBattle(id);
        navigate(`/battles/${id}`);
    }, [joinBattle, navigate, selectBattle]);

    return (
        <div className="battle-page">
            <div className="battle-container">
                {/* Header */}
                <div className="battle-mb-xl">
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.75rem', color: titleColor }}>
                        {t('battles.arenaTitle')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: subtitleColor }}>
                        {t('battles.arenaSubtitle')}
                    </p>
                    <div style={{ marginTop: '1.5rem', minHeight: '108px' }}>
                        {showRankStats && (
                            <Suspense fallback={<div style={{ height: '108px' }} aria-busy="true" />}>
                                <UserRankStatsBar />
                            </Suspense>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Sidebar Filters */}
                        <Suspense fallback={<div style={{ width: '256px', flexShrink: 0 }} aria-busy="true" />}>
                            <BattleFilters onFilterChange={handleFilterChange} />
                        </Suspense>

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
                            <div style={{ minHeight: '320px' }}>
                            {isLoading ? (
                                <BattlesListSkeleton showHeader={false} />
                            ) : filteredBattles.length === 0 ? (
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
                                    {filteredBattles.map((battle, index) => (
                                        <DeferredBattleCard
                                            key={battle.id}
                                            battle={battle}
                                            shouldRenderImmediately={index < 4}
                                            onEnter={handleEnterBattle}
                                            onJoin={handleJoin}
                                            onViewSummary={handleViewSummary}
                                            onCancel={handleCancel}
                                            aiBattlesEnabled={aiBattlesEnabled}
                                        />
                                    ))}
                                </div>
                            )}
                            </div>
                        </main>
                    </div>
            </div>

            {/* Create Battle Modal */}
            {createModal?.isOpen && (
                <Suspense fallback={null}>
                    <CreateBattleModal />
                </Suspense>
            )}
        </div>
    );
};

export default BattleListPage;
