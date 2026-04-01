import React from 'react';

const BattleCard = ({ id, status, mode, participants, challenge, category, progress, time, isWinner = false }) => {
    const statusStyles = {
        Active: 'badge-warning animate-pulse-glow',
        Completed: 'badge-success',
        Cancelled: 'badge-error'
    };

    const modeStyles = {
        'AI Battle': 'badge-purple',
        'PvP': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Tournament': 'badge-info'
    };

    return (
        <div className="glass-panel rounded-2xl p-6 shadow-custom spotlight-hover transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className={`badge ${statusStyles[status]}`}>{status}</span>
                    <span style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Battle ID: #{id}</span>
                    <span className={`badge ${modeStyles[mode]}`}>{mode}</span>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all btn-glow ${status === 'Completed'
                    ? 'bg-(--color-bg-secondary) hover:bg-gray-700 text-gray-300'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }`}>
                    {status === 'Completed' ? 'View Results' : 'View Details'}
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Participants */}
                <div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs  mb-2">
                        {isWinner ? 'Winner' : (participants.length > 1 ? 'Participants' : 'Participant')}
                    </p>
                    {participants.map((p, idx) => (
                        <div key={idx} className={`flex items-center gap-3 ${idx > 0 ? 'mt-2' : ''}`}>
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
};

const Battles = () => {
    const battles = [
        {
            id: 'BT-2847',
            status: 'Active',
            mode: 'AI Battle',
            participants: [{ username: 'coder_pro', score: '847', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }],
            challenge: 'Two Sum Problem',
            category: 'Array Manipulation',
            progress: 65,
            time: '2m 34s'
        },
        {
            id: 'BT-2846',
            status: 'Active',
            mode: 'PvP',
            participants: [
                { username: 'dev_master', score: '923', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
                { username: 'algo_ninja', score: '891', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' }
            ],
            challenge: 'Binary Search Tree',
            category: 'Tree Traversal',
            progress: 82,
            time: '5m 12s'
        },
        {
            id: 'BT-2845',
            status: 'Completed',
            mode: 'AI Battle',
            participants: [{ username: 'code_queen', score: '1,000', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' }],
            challenge: 'Merge Sort Algorithm',
            category: 'Sorting',
            progress: 100,
            time: '3m 47s',
            isWinner: true
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page Header */}
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">Battle Monitor</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">Track live battles and competition activity</p>
            </div>

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
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">342</h3>
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
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">1,847</h3>
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
                    <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">4.2m</h3>
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
                        />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="form-select w-full md:w-40 bg-(--color-bg-input)">
                        <option>All Modes</option>
                        <option>AI Battle</option>
                        <option>PvP</option>
                        <option>Tournament</option>
                    </select>
                    <select className="form-select w-full md:w-40 bg-(--color-bg-input)">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Battle List */}
            <div className="space-y-4">
                {battles.map((battle, index) => (
                    <BattleCard key={index} {...battle} />
                ))}
            </div>
        </div>
    );
};

export default Battles;
