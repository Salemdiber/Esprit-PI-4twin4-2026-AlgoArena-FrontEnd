import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

const Sessions = () => {
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiClient('/sessions/active');
                setSessionData(response);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch session data", err);
                setError("Failed to load active session");
                setLoading(false);
            }
        };

        fetchSession();
    }, []);

    if (loading) return <div style={{ color: 'var(--color-text-heading)' }} className=" p-6">Loading Active Session...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;
    if (!sessionData) return null;

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">Active Session Details</h1>
                    <p style={{ color: 'var(--color-text-muted)' }} className="">Security and activity telemetry for your current access token</p>
                </div>
                <div className="text-right">
                    <span
                        className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm"
                        style={{
                            backgroundColor: sessionData.riskLevel === 'Minimal' ? 'var(--color-success-bg)' : 'var(--color-info-bg)',
                            color: sessionData.riskLevel === 'Minimal' ? 'var(--color-green-500)' : 'var(--color-cyan-600)',
                            borderColor: sessionData.riskLevel === 'Minimal' ? 'var(--color-green-500)' : 'var(--color-cyan-400)'
                        }}
                    >
                        Risk Level: {sessionData.riskLevel}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Device Card */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom flex flex-col justify-between h-48 border  bg-gradient-to-br from-(--color-bg-secondary) to-(--color-bg-primary) backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
                    <div>
                        <div className="text-cyan-400 mb-3 bg-cyan-500/10 w-fit p-3 rounded-xl border border-cyan-500/20">
                            {sessionData.device === 'Mobile' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Device Target</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{sessionData.device}</p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">{sessionData.os}</p>
                    </div>
                </div>

                {/* Browser Card */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom flex flex-col justify-between h-48 border  bg-gradient-to-br from-(--color-bg-secondary) to-(--color-bg-primary) backdrop-blur-md relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div>
                        <div className="text-purple-400 mb-3 bg-purple-500/10 w-fit p-3 rounded-xl border border-purple-500/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Client App</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{sessionData.browser}</p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  truncate" title={sessionData.userAgent}>Detected via Header</p>
                    </div>
                </div>

                {/* Network / Location Card */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom flex flex-col justify-between h-48 border  bg-gradient-to-br from-(--color-bg-secondary) to-(--color-bg-primary) backdrop-blur-md relative overflow-hidden group hover:border-green-500/50 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
                    <div>
                        <div className="text-green-400 mb-3 bg-green-500/10 w-fit p-3 rounded-xl border border-green-500/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Location</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-heading)' }} className="text-xl font-bold  truncate">{sessionData.location}</p>
                        <p className="text-sm text-cyan-400 font-mono tracking-wider">{sessionData.ip}</p>
                    </div>
                </div>

                {/* Duration Card */}
                <div className="glass-panel rounded-2xl p-6 shadow-custom flex flex-col justify-between h-48 border  bg-gradient-to-br from-(--color-bg-secondary) to-(--color-bg-primary) backdrop-blur-md relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
                    <div>
                        <div className="text-orange-400 mb-3 bg-orange-500/10 w-fit p-3 rounded-xl border border-orange-500/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold ">Session Uptime</h3>
                    </div>
                    <div>
                        <p style={{ color: 'var(--color-text-heading)' }} className="text-2xl font-bold ">{sessionData.activeTime}</p>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">
                            {sessionData.refreshed ? 'Recently Transacted' : 'Stable Token'}
                        </p>
                    </div>
                </div>

            </div>

            {/* Extended Telemetry Bar */}
            <div className="mt-6 glass-panel rounded-xl p-5 shadow-custom border  flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                    <p style={{ color: 'var(--color-text-secondary)' }} className=" font-medium">Session actively streaming metrics</p>
                </div>
                <div style={{ color: 'var(--color-text-muted)' }} className="font-mono text-xs">
                    Captured at: {new Date(sessionData.timestamp).toLocaleString()}
                </div>
            </div>

        </div>
    );
};

export default Sessions;
