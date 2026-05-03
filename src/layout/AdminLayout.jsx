import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import AIAgent from '../components/AIAgent';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex h-screen font-body overflow-hidden" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
            {/* Creative Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Base */}
                <div className="absolute inset-0" style={{ background: 'var(--color-bg-primary)' }} />
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, var(--color-radial-vignette) 100%)` }} />

                {/* Animated Gradient Orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse-glow" style={{ background: 'var(--color-orb-cyan)' }} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s', background: 'var(--color-orb-purple)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] animate-blob" style={{ background: 'var(--color-orb-blue)' }} />

                {/* Cyber Grid Overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(var(--color-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)`, backgroundSize: '50px 50px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 100%)' }} />
            </div>

            {/* Mobile overlay backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 h-full overflow-hidden">
                <TopNavbar onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar scroll-smooth">
                    <Outlet />
                </main>
            </div>

            {/* AI Agent - Floating chat */}
            <AIAgent />
        </div>
    );
};

export default AdminLayout;
