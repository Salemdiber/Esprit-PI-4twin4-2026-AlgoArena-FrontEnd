import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import Logo from '../assets/logo_algoarena.png';

const IconWrapper = ({ children }) => (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {children}
    </svg>
);

const SidebarLink = ({ to, icon, label, onClick }) => (
    <NavLink
        to={to}
        end={to === '/admin'}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 mb-2 spotlight-hover ${isActive
                ? 'active-nav text-cyan-400'
                : 'hover:text-cyan-400'
            }`
        }
        style={({ isActive }) => ({
            color: isActive ? 'var(--color-cyan-400)' : 'var(--color-text-secondary)',
        })}
        onClick={onClick}
    >
        <span className="relative z-10">{icon}</span>
        <span className="font-medium relative z-10">{label}</span>
    </NavLink>
);

const Sidebar = ({ isOpen = false, onClose }) => {
    const { currentUser } = useAuth();
    const firstLetter = currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'A';

    return (
        <aside
            className={`
                w-64 flex flex-col h-full z-40 transition-all duration-300
                fixed top-0 left-0
                lg:relative lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            style={{
                background: 'var(--color-bg-sidebar)',
                borderRight: '1px solid var(--color-border)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
            }}
        >
            {/* Close button – mobile only */}
            <button
                className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:text-cyan-400 transition-all z-50"
                style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
                onClick={onClose}
                aria-label="Close sidebar"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Logo Section */}
            <div className="p-6 flex justify-center" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <img src={Logo} alt="AlgoArena" className="h-8 w-auto" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                <SidebarLink to="/admin" label="Dashboard" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></IconWrapper>} />
                <SidebarLink to="/admin/users" label="Users" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></IconWrapper>} />
                <SidebarLink to="/admin/battles" label="Battles" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></IconWrapper>} />
                <SidebarLink to="/admin/challenges" label="Challenges" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></IconWrapper>} />
                <SidebarLink to="/admin/ai-logs" label="AI Logs" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></IconWrapper>} />
                <SidebarLink to="/admin/leaderboards" label="Leaderboards" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></IconWrapper>} />
                <SidebarLink to="/admin/analytics" label="Analytics" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></IconWrapper>} />
                <SidebarLink to="/admin/system-health" label="System Health" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></IconWrapper>} />
                <SidebarLink to="/admin/sessions" label="Sessions" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></IconWrapper>} />
                <SidebarLink to="/admin/activity-logs" label="Activity Logs" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></IconWrapper>} />
                <SidebarLink to="/admin/settings" label="Settings" onClick={onClose}
                    icon={<IconWrapper><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></IconWrapper>} />
            </nav>

            {/* User Profile Section */}
            <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg glass-panel spotlight-hover cursor-pointer group">
                    {currentUser?.avatar ? (
                        <img
                            src={currentUser.avatar.startsWith('uploads/') ? `/${currentUser.avatar}` : currentUser.avatar}
                            alt="Admin"
                            className="w-10 h-10 rounded-full border-2 border-cyan-400 object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-lg">
                            {firstLetter}
                        </div>
                    )}
                    <div className="flex-1 relative z-10 overflow-hidden">
                        <p className="font-medium text-sm group-hover:text-cyan-400 transition-colors truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {currentUser?.username || 'Admin User'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {currentUser?.email || 'System Admin'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
