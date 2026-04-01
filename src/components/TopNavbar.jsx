import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const TopNavbar = ({ onToggleSidebar }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    // Extract first letter of username for avatar fallback
    const firstLetter = currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'A';

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/signin');
    };

    return (
        <header style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }} className="sticky top-0 z-20 shadow-custom">
            <div className="flex items-center justify-between px-6 py-4">

                {/* Mobile Toggle */}
                <button className="lg:hidden p-2 rounded-lg transition-all spotlight-hover" style={{ color: 'var(--color-text-secondary)' }} onClick={onToggleSidebar}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Search Bar - Fixed and Enhanced */}
                <div className="flex-1 max-w-xl mx-4">
                    <div className="relative search-wrapper">
                        <input
                            type="text"
                            placeholder="Search users, battles, challenges..."
                            className="search-input w-full"
                        />
                        <svg
                            className="w-5 h-5 search-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">

                    {/* System Status Indicator */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg glass-panel">
                        <span className="status-dot status-online" />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>All Systems Operational</span>
                    </div>

                    {/* Theme Switcher */}
                    <ThemeSwitcher size="sm" />

                    {/* Notifications Dropdown Container */}
                    <div className="relative" ref={notifRef}>
                        <button
                            className="relative flex items-center justify-center w-10 h-10 shrink-0 rounded-lg hover:text-cyan-400 transition-all spotlight-hover"
                            style={{ color: 'var(--color-text-secondary)', backgroundColor: isNotifOpen ? 'var(--color-bg-elevated)' : 'transparent' }}
                            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'var(--color-bg-secondary)' }} />
                        </button>

                        {/* Dropdown Menu */}
                        <div
                            className={`profile-dropdown ${isNotifOpen ? 'active' : ''}`}
                            style={{
                                right: '0',
                                width: '320px',
                                maxHeight: '400px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div className="profile-dropdown-header" style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notifications</h3>
                                    <span style={{ fontSize: '10px', color: 'var(--color-cyan-500)', fontWeight: 'bold', background: 'var(--color-info-bg)', padding: '2px 6px', borderRadius: '4px' }}>2 NEW</span>
                                </div>
                            </div>

                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {/* Example Notification 1 */}
                                <div className="profile-dropdown-item" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', alignItems: 'flex-start', cursor: 'pointer' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-cyan-400)', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div className="ml-3">
                                        <p style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '500' }}>System Update</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>Security patch deployed successfully for AI agent modules.</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '4px' }}>Just now</p>
                                    </div>
                                </div>

                                {/* Example Notification 2 */}
                                <div className="profile-dropdown-item" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)', alignItems: 'flex-start', cursor: 'pointer' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-red-500)', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div className="ml-3">
                                        <p style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '500' }}>Server Alert</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>High CPU usage detected on Node workers in cluster 2.</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '4px' }}>42 mins ago</p>
                                    </div>
                                </div>

                                {/* Read Notification */}
                                <div className="profile-dropdown-item" style={{ padding: '12px 16px', alignItems: 'flex-start', cursor: 'pointer', opacity: 0.7 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-border)', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div className="ml-3">
                                        <p style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '500' }}>New User Signup</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>CodeMaster99 just registered an account.</p>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '4px' }}>2 hrs ago</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '12px', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
                                <button style={{ color: 'var(--color-cyan-500)', fontSize: '13px', fontWeight: '600', width: '100%' }} className="hover:text-cyan-400 transition-colors">
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                            className="flex items-center gap-2 h-10 px-2 rounded-lg shrink-0 transition-all spotlight-hover"
                            style={{ background: isProfileOpen ? 'var(--color-bg-elevated)' : 'transparent' }}
                        >
                            {currentUser?.avatar ? (
                                <img
                                    src={currentUser.avatar.startsWith('uploads/') ? `/${currentUser.avatar}` : currentUser.avatar}
                                    alt="Admin"
                                    className="w-9 h-9 rounded-full border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)] object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full border-2 border-cyan-400 bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                    {firstLetter}
                                </div>
                            )}
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                                style={{ color: 'var(--color-text-muted)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`profile-dropdown ${isProfileOpen ? 'active' : ''}`}>
                            {/* Header with Avatar */}
                            <div className="profile-dropdown-header">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {currentUser?.avatar ? (
                                        <img
                                            src={currentUser.avatar.startsWith('uploads/') ? `/${currentUser.avatar}` : currentUser.avatar}
                                            alt="Admin"
                                            className="w-12 h-12 rounded-full border-2 border-cyan-400 object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-lg">
                                            {firstLetter}
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{currentUser?.username || 'Admin User'}</p>
                                        <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{currentUser?.email || 'admin@algoarena.com'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <Link
                                    to="/admin/profile"
                                    className="profile-dropdown-item"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>My Profile</span>
                                </Link>
                                <Link
                                    to="/admin/settings"
                                    className="profile-dropdown-item"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Settings</span>
                                </Link>

                                <Link to="/admin/add-admin" className="profile-dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Add New Admin</span>
                                </Link>

                                <a
                                    href="/api/docs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="profile-dropdown-item"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span>Review APIS</span>
                                </a>

                                <Link to="/" className="profile-dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>Go To Landing Page</span>
                                </Link>
                            </div>

                            {/* Logout */}
                            <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                                <button
                                    className="profile-dropdown-item profile-dropdown-danger"
                                    onClick={handleLogout}
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
