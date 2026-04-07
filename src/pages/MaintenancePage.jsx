import React, { useState, useEffect } from 'react';

const MaintenancePage = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-(--color-bg-primary) flex flex-col items-center justify-center relative overflow-hidden font-body select-none">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Animated glow orbs */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
            </div>

            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
                {/* Animated gear icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-500/5 backdrop-blur-sm shadow-[0_0_40px_rgba(34,211,238,0.15)]">
                            <svg
                                className="w-12 h-12 text-cyan-400 animate-[spin_8s_linear_infinite]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                            </svg>
                        </div>
                        {/* Pulsing ring */}
                        <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500 mb-4 drop-shadow-2xl">
                    Under Maintenance
                </h1>

                {/* Glass card */}
                <div className="glass-panel p-8 rounded-2xl border border-gray-700/50 backdrop-blur-xl mb-8 shadow-2xl">
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-sm font-medium text-amber-400 uppercase tracking-wider">Scheduled Maintenance</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                        We&apos;ll be back shortly
                    </h2>

                    <p className="text-gray-400 leading-relaxed mb-6">
                        AlgoArena is currently undergoing scheduled maintenance to improve your experience.
                        We&apos;re upgrading our systems and will be back online soon. Thank you for your patience!
                    </p>

                    {/* Progress bar animation */}
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-[maintenance-progress_2.5s_ease-in-out_infinite]" />
                    </div>

                    <p className="text-gray-500 text-sm font-mono">
                        Performing system upgrades{dots}
                    </p>
                </div>

                {/* Status info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <StatusCard icon="server" label="Servers" status="Updating" />
                    <StatusCard icon="database" label="Database" status="Migrating" />
                    <StatusCard icon="shield" label="Security" status="Patching" />
                </div>

                {/* Contact */}
                <p className="text-gray-500 text-sm">
                    Need help? Contact us at{' '}
                    <a href="mailto:support@algoarena.com" className="text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-2">
                        support@algoarena.com
                    </a>
                </p>
            </div>

            {/* Inline animation keyframes */}
            <style>{`
                @keyframes maintenance-progress {
                    0%   { width: 0%; }
                    50%  { width: 80%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

const StatusCard = ({ icon, label, status }) => {
    const icons = {
        server: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        ),
        database: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        ),
        shield: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        ),
    };

    return (
        <div className="bg-(--color-bg-primary)/80 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icons[icon]}
                </svg>
            </div>
            <p className="text-gray-300 text-sm font-medium">{label}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400">{status}</span>
            </div>
        </div>
    );
};

export default MaintenancePage;
