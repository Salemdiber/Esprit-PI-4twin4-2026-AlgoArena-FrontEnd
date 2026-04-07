import React from 'react';

const AILogs = () => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">AI Evaluation Logs</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">Monitor AI code evaluation activity and performance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <StatBox label="Total Evaluations" value="8,924" color="purple" />
                <StatBox label="Successful" value="7,234" color="green" icon="check" />
                <StatBox label="Failed" value="1,690" color="red" icon="x" />
                <StatBox label="Avg Runtime" value="247ms" color="cyan" icon="clock" />
            </div>

            {/* Filter Bar */}
            <div className="glass-panel rounded-2xl p-4 mb-6 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative search-wrapper w-full">
                        <input type="text" placeholder="Search by user, challenge, or evaluation ID..." className="search-input w-full" />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="form-select w-full md:w-48 bg-(--color-bg-input)">
                        <option>All Status</option>
                        <option>Success</option>
                        <option>Failed</option>
                        <option>Timeout</option>
                    </select>
                    <select className="form-select w-full md:w-48 bg-(--color-bg-input)">
                        <option>All Complexity</option>
                        <option>O(1)</option>
                        <option>O(n)</option>
                        <option>O(n log n)</option>
                        <option>O(n²)</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div className="glass-panel rounded-2xl shadow-custom overflow-hidden">
                <div className="divide-y divide-gray-800">

                    <LogItem
                        status="Success"
                        title="Two Sum - Array Manipulation"
                        user="@coder_pro"
                        time="2 minutes ago"
                        runtime="142ms"
                        complexity="O(n)"
                        complexityColor="cyan"
                    />

                    <LogItem
                        status="Failed"
                        title="Binary Search Tree - Traversal"
                        user="@dev_master"
                        time="5 minutes ago"
                        runtime="Timeout"
                        complexity="O(n²)"
                        complexityColor="red"
                        runtimeColor="red"
                    />

                    <LogItem
                        status="Success"
                        title="Merge Sort Algorithm"
                        user="@code_queen"
                        time="8 minutes ago"
                        runtime="89ms"
                        complexity="O(n log n)"
                        complexityColor="cyan"
                    />

                    <LogItem
                        status="Warning"
                        title="Graph DFS Traversal"
                        user="@algo_ninja"
                        time="12 minutes ago"
                        runtime="456ms"
                        complexity="O(n)"
                        complexityColor="yellow"
                        runtimeColor="yellow"
                    />

                    <LogItem
                        status="Success"
                        title="Dynamic Programming - Fibonacci"
                        user="@tech_wizard"
                        time="15 minutes ago"
                        runtime="34ms"
                        complexity="O(n)"
                        complexityColor="cyan"
                    />

                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color, icon }) => {
    const colorClasses = {
        purple: "bg-purple-500/20 text-purple-400",
        green: "bg-green-500/20 text-green-400",
        red: "bg-red-500/20 text-red-400",
        cyan: "bg-cyan-500/20 text-cyan-400"
    };

    return (
        <div className="glass-panel rounded-2xl p-6 border  bg-(--color-bg-card) backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
                        {icon === 'x' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>}
                        {icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
                        {!icon && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>}
                    </svg>
                </div>
            </div>
            <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">{value}</h3>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">{label}</p>
        </div>
    );
};

const LogItem = ({ status, title, user, time, runtime, complexity, complexityColor, runtimeColor = "cyan" }) => {
    const statusColors = {
        Success: "bg-green-500/10 text-green-400 border-green-500/20",
        Failed: "bg-red-500/10 text-red-400 border-red-500/20",
        Warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    };

    const textColors = {
        cyan: "text-cyan-400",
        red: "text-red-400",
        yellow: "text-yellow-400"
    };

    const strokeColors = {
        cyan: "#22d3ee",
        red: "#ef4444",
        yellow: "#facc15"
    };

    return (
        <div className="flex items-center gap-4 p-4 spotlight-hover transition-all group table-row-hover">
            <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium  truncate group-hover:text-cyan-400 transition-colors">{title}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mt-1">Evaluated by {user} • {time}</p>
            </div>

            <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">Runtime</p>
                    <p className={`text-sm font-mono ${textColors[runtimeColor]}`}>{runtime}</p>
                </div>
                <div className="text-right">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">Complexity</p>
                    <p className={`text-sm font-mono ${textColors[complexityColor]}`}>{complexity}</p>
                </div>
                <div className="w-24 h-8">
                    <svg viewBox="0 0 100 30" className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity">
                        <polyline
                            points="0,25 20,20 40,15 60,12 80,10 100,8"
                            fill="none"
                            stroke={strokeColors[complexityColor]}
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </div>

            <button title="View Details" className="action-btn action-btn-view opacity-0 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
            </button>
        </div>
    );
};

export default AILogs;
