import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import UserGrowthChart from '../../components/Charts/UserGrowthChart';
import BattleActivityChart from '../../components/Charts/BattleActivityChart';
import DifficultyChart from '../../components/Charts/DifficultyChart';
import { apiClient } from '../../services/apiClient';

const Analytics = () => {
    const { t } = useTranslation();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await apiClient('/analytics/insights');
                setAnalyticsData(response);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
                setError(t('admin.analytics.errorLoading'));
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div style={{ color: 'var(--color-text-heading)' }} className=" p-6">{t('admin.analytics.loading')}</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;
    if (!analyticsData) return null;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">{t('admin.analytics.title')}</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="">{t('admin.analytics.subtitle')}</p>
                </div>
                <div className="text-right">
                    <p style={{ color: 'var(--color-text-muted)' }} className=" text-sm">{t('admin.analytics.totalPlatformUsers')}</p>
                    <p className="font-heading text-3xl font-bold text-cyan-400">{analyticsData.users.total}</p>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel rounded-xl p-4 shadow-custom border ">
                    <p style={{ color: 'var(--color-text-muted)' }} className=" text-sm mb-1">{t('admin.analytics.newUsers30Days')}</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{analyticsData.users.newUsers30Days}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 shadow-custom border ">
                    <p style={{ color: 'var(--color-text-muted)' }} className=" text-sm mb-1">{t('admin.analytics.dailyActiveUsers')}</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{analyticsData.users.dailyActiveUsers}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 shadow-custom border ">
                    <p style={{ color: 'var(--color-text-muted)' }} className=" text-sm mb-1">{t('admin.analytics.avgSessionTime')}</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{analyticsData.engagement.averageTimeSpent}</p>
                </div>
                <div className="glass-panel rounded-xl p-4 shadow-custom border ">
                    <p style={{ color: 'var(--color-text-muted)' }} className=" text-sm mb-1">{t('admin.analytics.peakHours')}</p>
                    <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{analyticsData.engagement.peakUsageTimes[0] || '18:00'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* User Growth */}
                <div className="glass-panel rounded-xl p-6 shadow-custom border  bg-(--color-bg-card) backdrop-blur-md">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-4">{t('admin.analytics.userGrowth')}</h2>
                    <div className="h-64">
                        <UserGrowthChart />
                    </div>
                </div>

                {/* Battle Activity */}
                <div className="glass-panel rounded-xl p-6 shadow-custom border  bg-(--color-bg-card) backdrop-blur-md">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-4">{t('admin.analytics.battleActivity')}</h2>
                    <div className="h-64">
                        <BattleActivityChart />
                    </div>
                </div>

                {/* Challenge Difficulty */}
                <div className="glass-panel rounded-xl p-6 shadow-custom border  bg-(--color-bg-card) backdrop-blur-md">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-4">{t('admin.analytics.challengeDifficulty')}</h2>
                    <div className="h-64">
                        <DifficultyChart />
                    </div>
                </div>

                {/* User Engagement (Custom Bars) */}
                <div className="glass-panel rounded-xl p-6 shadow-custom border  bg-(--color-bg-card) backdrop-blur-md">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-4">{t('admin.analytics.mostAccessedSections')}</h2>
                    <div className="space-y-4">
                        {analyticsData.engagement.mostFrequentlyAccessed.map((item, idx) => {
                            // Calculate a relative percentage to highest accesses for UI purposes
                            const max = analyticsData.engagement.mostFrequentlyAccessed[0]?.accesses || 1;
                            const pct = Math.round((item.accesses / max) * 100);
                            return (
                                <EngagementBar key={idx} label={item.section} value={t('admin.analytics.hits', { count: item.accesses })} percentage={pct} />
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

const EngagementBar = ({ label, value, percentage }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm ">{label}</span>
            <span className="text-sm font-medium text-cyan-400">{value}</span>
        </div>
        <div className="w-full bg-(--color-bg-input) rounded-full h-2">
            <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    </div>
);

export default Analytics;
