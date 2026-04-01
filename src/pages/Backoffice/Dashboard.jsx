import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import ActiveUsersChart from '../../components/Charts/ActiveUsersChart';
import GamesChart from '../../components/Charts/GamesChart';
import DifficultyChart from '../../components/Charts/DifficultyChart';
import SandboxMonitorCard from '../../components/SandboxMonitorCard';
import { adminStatsService } from '../../services/adminStatsService';

const Dashboard = () => {
    const [overview, setOverview] = useState(null);
    const [usersStats, setUsersStats] = useState(null);
    const [challengeStats, setChallengeStats] = useState(null);
    const [submissionStats, setSubmissionStats] = useState(null);
    const [sandboxStatus, setSandboxStatus] = useState(null);
    const [sandboxLoading, setSandboxLoading] = useState(true);
    const [sandboxError, setSandboxError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                setError('');
                const [overviewRes, usersRes, challengesRes, submissionsRes] = await Promise.all([
                    adminStatsService.getOverview(),
                    adminStatsService.getUsers(),
                    adminStatsService.getChallenges(),
                    adminStatsService.getSubmissions(),
                ]);
                setOverview(overviewRes);
                setUsersStats(usersRes);
                setChallengeStats(challengesRes);
                setSubmissionStats(submissionsRes);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError(err?.message || 'Failed to load dashboard analytics');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    useEffect(() => {
        let cancelled = false;
        let intervalId;

        const loadSandboxStatus = async () => {
            try {
                if (!cancelled) setSandboxLoading(true);
                const status = await adminStatsService.getSandboxStatus();
                if (!cancelled) {
                    setSandboxStatus(status);
                    setSandboxError('');
                }
            } catch (err) {
                if (!cancelled) {
                    setSandboxError(err?.message || 'Failed to load sandbox status');
                }
            } finally {
                if (!cancelled) setSandboxLoading(false);
            }
        };

        loadSandboxStatus();
        intervalId = setInterval(loadSandboxStatus, 10000);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const challengeStatusData = useMemo(() => ({
        labels: ['Draft', 'Published'],
        values: [Number(challengeStats?.draftChallenges || 0), Number(challengeStats?.publishedChallenges || 0)],
    }), [challengeStats]);

    const submissionsByDifficulty = useMemo(() => {
        const rows = submissionStats?.byDifficulty || [];
        return {
            labels: rows.map((item) => item.difficulty),
            values: rows.map((item) => Number(item.submissions || 0)),
        };
    }, [submissionStats]);

    if (loading) {
        return <div className="p-6" style={{ color: 'var(--color-text-heading)' }}>Loading dashboard analytics...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-400">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Real-time platform analytics and challenge intelligence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard
                    value={(overview?.totalUsers || 0).toLocaleString()}
                    label="Total Users"
                    color="cyan"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={(overview?.activeUsers || 0).toLocaleString()}
                    label="Active Users (7d)"
                    isLive
                    color="green"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    )}
                />
                <StatCard
                    value={(overview?.totalChallenges || 0).toLocaleString()}
                    label="Total Challenges"
                    color="yellow"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                    )}
                />
                <StatCard
                    value={Number(overview?.totalSubmissions || 0) > 0 ? `${Number(overview?.successRate || 0).toFixed(1)}%` : '-'}
                    label="Submission Success Rate"
                    color="purple"
                    icon={(
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>New Users (Last 7 Days)</h2>
                    <div className="h-64 overflow-hidden">
                        <ActiveUsersChart
                            labels={usersStats?.signupsLast7Days?.labels || []}
                            values={usersStats?.signupsLast7Days?.values || []}
                            label="New Users"
                        />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Draft vs Published Challenges</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={challengeStatusData.labels}
                            values={challengeStatusData.values}
                            datasetLabel="Challenges"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Difficulty Distribution</h2>
                    <div className="h-64 overflow-hidden">
                        <DifficultyChart distribution={challengeStats?.difficultyDistribution} />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Submissions by Difficulty</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart
                            labels={submissionsByDifficulty.labels}
                            values={submissionsByDifficulty.values}
                            datasetLabel="Submissions"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-custom">
                <h2 className="font-heading text-xl font-bold mb-5" style={{ color: 'var(--color-text-heading)' }}>Submission Quality by Difficulty</h2>
                <div className="space-y-4">
                    {(submissionStats?.byDifficulty || []).map((item) => (
                        <div key={item.difficulty} className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{item.difficulty}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.submissions} submissions</p>
                            </div>
                            <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(148,163,184,0.2)' }}>
                                <div
                                    className="h-2.5 rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.max(0, Math.min(100, item.successRate || 0))}%`,
                                        background: 'linear-gradient(90deg, #22d3ee 0%, #22c55e 100%)',
                                    }}
                                />
                            </div>
                            <p className="text-xs mt-2 font-medium text-cyan-400">
                                {Number(item.submissions || 0) === 0 ? '-' : `${Number(item.successRate || 0).toFixed(1)}% success`}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <SandboxMonitorCard
                status={sandboxStatus}
                loading={sandboxLoading}
                error={sandboxError}
            />
        </div>
    );
};

export default Dashboard;
