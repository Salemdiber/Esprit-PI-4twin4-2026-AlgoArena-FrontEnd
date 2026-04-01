import React from 'react';
import StatCard from '../../components/StatCard';
import ActiveUsersChart from '../../components/Charts/ActiveUsersChart';
import GamesChart from '../../components/Charts/GamesChart';

const Dashboard = () => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Monitor platform performance and activity in real-time</p>
            </div>

            {/* Stats Grid - 4 columns on xl, responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard
                    value="24,567"
                    label="Total Users"
                    trend="↑ 12.5%"
                    trendUp={true}
                    color="cyan"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
                <StatCard
                    value="1,847"
                    label="Active Users (Live)"
                    isLive={true}
                    color="green"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    }
                />
                <StatCard
                    value="342"
                    label="Ongoing Battles"
                    trend="↑ 8.2%"
                    trendUp={true}
                    color="yellow"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    }
                />
                <StatCard
                    value="8,924"
                    label="AI Evaluations Today"
                    trend="↑ 15.7%"
                    trendUp={true}
                    color="purple"
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    }
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Active Users (7 Days)</h2>
                    <div className="h-64 overflow-hidden">
                        <ActiveUsersChart />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl shadow-custom">
                    <h2 className="font-heading text-xl font-bold mb-4" style={{ color: 'var(--color-text-heading)' }}>Most Played Games</h2>
                    <div className="h-64 overflow-hidden">
                        <GamesChart />
                    </div>
                </div>
            </div>

            {/* AI Activity Monitor */}
            <div className="glass-panel p-6 rounded-2xl shadow-custom">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>AI Activity Monitor</h2>
                    <button className="btn-primary text-sm">
                        View All Logs
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Success Item */}
                    <div className="flex items-center gap-4 p-4 rounded-lg spotlight-hover table-row-hover group" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <div className="shrink-0 relative z-10">
                            <span className="badge badge-success">
                                Success
                            </span>
                        </div>
                        <div className="flex-1 relative z-10">
                            <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                Two Sum - Array Manipulation
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                Evaluated by user @coder_pro • Runtime: 142ms
                            </p>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Complexity</p>
                                <p className="text-sm font-mono text-cyan-400">O(n)</p>
                            </div>
                            <div className="w-24 h-8 hidden sm:block">
                                <svg viewBox="0 0 100 30" className="w-full h-full">
                                    <polyline
                                        points="0,25 20,20 40,15 60,12 80,10 100,8"
                                        fill="none"
                                        stroke="#22d3ee"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Failed Item */}
                    <div className="flex items-center gap-4 p-4 bg-(--color-bg-input) rounded-lg border  spotlight-hover table-row-hover group">
                        <div className="shrink-0 relative z-10">
                            <span className="badge badge-error">
                                Failed
                            </span>
                        </div>
                        <div className="flex-1 relative z-10">
                            <p className="text-sm font-medium group-hover:text-red-400 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                Binary Search Tree - Traversal
                            </p>
                            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mt-1">
                                Evaluated by user @dev_master • Runtime: Timeout
                            </p>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="text-right hidden sm:block">
                                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">Complexity</p>
                                <p className="text-sm font-mono text-red-400">O(n²)</p>
                            </div>
                            <div className="w-24 h-8 hidden sm:block">
                                <svg viewBox="0 0 100 30" className="w-full h-full">
                                    <polyline
                                        points="0,28 20,26 40,22 60,15 80,8 100,2"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Warning Item */}
                    <div className="flex items-center gap-4 p-4 bg-(--color-bg-input) rounded-lg border  spotlight-hover table-row-hover group">
                        <div className="shrink-0 relative z-10">
                            <span className="badge badge-warning">
                                Warning
                            </span>
                        </div>
                        <div className="flex-1 relative z-10">
                            <p className="text-sm font-medium group-hover:text-yellow-400 transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                                Merge Sort - Performance Issue
                            </p>
                            <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mt-1">
                                Evaluated by user @algo_ninja • Runtime: 892ms
                            </p>
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="text-right hidden sm:block">
                                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">Complexity</p>
                                <p className="text-sm font-mono text-yellow-400">O(n log n)</p>
                            </div>
                            <div className="w-24 h-8 hidden sm:block">
                                <svg viewBox="0 0 100 30" className="w-full h-full">
                                    <polyline
                                        points="0,15 20,18 40,14 60,20 80,16 100,12"
                                        fill="none"
                                        stroke="#eab308"
                                        strokeWidth="2"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
