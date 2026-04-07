import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

const SystemHealth = () => {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const response = await apiClient('/system-health');
                setHealthData(response);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch system health data", err);
                setError("Failed to monitor system health");
                setLoading(false);
            }
        };

        fetchHealth();
        // Optional: poll every 10 seconds
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="mb-6">
                    <div className="h-8 bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-panel rounded-2xl p-6 shadow-custom h-48 border ">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                                <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                            </div>
                            <div className="flex justify-center mb-4">
                                <div className="w-24 h-24 rounded-full bg-gray-700/50"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <div className="text-red-500 p-6 glass-panel border border-red-500/30 rounded-xl">{error}</div>;
    if (!healthData) return null;

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">System Health Monitor</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="">Real-time infrastructure and service monitoring</p>
                </div>
                <StatusBadge status={healthData.overall.status} color={healthData.overall.color} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

                {/* CPU Usage */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">CPU Usage</h3>
                        <StatusBadge status={healthData.cpu.status} color={healthData.cpu.status === 'Healthy' ? 'green' : healthData.cpu.status === 'Warning' ? 'yellow' : 'red'} />
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <CircularProgress percentage={healthData.cpu.usage} color={healthData.cpu.status === 'Healthy' ? '#22d3ee' : healthData.cpu.status === 'Warning' ? '#facc15' : '#ef4444'} />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  text-center">{healthData.cpu.cores} cores available</p>
                </div>

                {/* Memory Usage */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Memory Usage</h3>
                        <StatusBadge status={healthData.memory.status} color={healthData.memory.status === 'Healthy' ? 'green' : healthData.memory.status === 'Warning' ? 'yellow' : 'red'} />
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <CircularProgress percentage={healthData.memory.usage} color={healthData.memory.status === 'Healthy' ? '#22d3ee' : healthData.memory.status === 'Warning' ? '#facc15' : '#ef4444'} />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  text-center">{healthData.memory.used} GB / {healthData.memory.total} GB</p>
                </div>

                {/* Disk Usage */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Disk Usage</h3>
                        <StatusBadge status={healthData.disk.status} color={healthData.disk.status === 'Healthy' ? 'green' : healthData.disk.status === 'Warning' ? 'yellow' : 'red'} />
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <CircularProgress percentage={healthData.disk.usage} color={healthData.disk.status === 'Healthy' ? '#22d3ee' : healthData.disk.status === 'Warning' ? '#facc15' : '#ef4444'} />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  text-center">{healthData.disk.used} GB / {healthData.disk.total} GB</p>
                </div>

                {/* API Latency */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">API Latency</h3>
                        <StatusBadge status={healthData.apiLatency.status} color="green" />
                    </div>
                    <div className="text-center mb-4">
                        <p className="font-heading text-4xl font-bold text-cyan-400 mb-2">{healthData.apiLatency.ms}ms</p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">Average response time</p>
                    </div>
                    <div className="h-16 w-full flex items-end justify-center space-x-1">
                        {[40, 60, 45, 70, 55, 30, 40, 50, 45, 60, 40, Math.min(100, healthData.apiLatency.ms * 2)].map((h, i) => (
                            <div key={i} className="w-2 bg-cyan-500/50 rounded-t" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Docker Containers */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Background Services</h3>
                        <StatusBadge status="Running" color="green" />
                    </div>
                    <div className="space-y-3">
                        {healthData.services.map((service, idx) => (
                            <ServiceRow key={idx} name={service.name} status={service.status} />
                        ))}
                    </div>
                </div>

                {/* Service Status */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Service Status</h3>
                        <StatusBadge status="All Online" color="green" />
                    </div>
                    <div className="space-y-3">
                        <ServiceMetrix name="Authentication" uptime="99.9%" />
                        <ServiceMetrix name="Code Execution" uptime="99.7%" />
                        <ServiceMetrix name="AI Evaluation" uptime="99.8%" />
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatusBadge = ({ status, color }) => {
    const colors = {
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        red: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
            {status}
        </span>
    );
};

// SVG Circle with percentage
const CircularProgress = ({ percentage, color }) => {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * ((100 - percentage) / 100);

    return (
        <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-in-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-2xl font-bold" style={{ color }}>{percentage}%</span>
            </div>
        </div>
    );
};

const ServiceRow = ({ name, status }) => (
    <div className="flex items-center justify-between p-3 bg-(--color-bg-input) rounded-lg">
        <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm ">{name}</span>
        <span className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
    </div>
);

const ServiceMetrix = ({ name, uptime }) => (
    <div className="flex items-center justify-between p-3 bg-(--color-bg-input) rounded-lg">
        <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm ">{name}</span>
        <span className="text-xs text-green-400">{uptime}</span>
    </div>
);

export default SystemHealth;
