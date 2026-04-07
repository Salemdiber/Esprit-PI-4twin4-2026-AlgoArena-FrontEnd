import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { auditLogService } from '../services/auditLogService';

const NOTIFICATION_STORAGE_KEY = 'algoarena-admin-read-notifications';
const NOTIFICATION_LIMIT = 5;

const getRelativeTime = (dateValue) => {
    if (!dateValue) return 'Just now';

    const createdAt = new Date(dateValue);
    if (Number.isNaN(createdAt.getTime())) return 'Just now';

    const diffMs = Date.now() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return createdAt.toLocaleDateString();
};

const getNotificationTone = (log) => {
    const actionType = String(log?.actionType || '').toUpperCase();
    const status = String(log?.status || '').toLowerCase();

    if (status === 'rolled_back' || actionType.includes('DELETED') || actionType.includes('REMOVED') || actionType.includes('BANNED')) {
        return 'red';
    }

    if (status === 'confirmed' || actionType.includes('PUBLISHED') || actionType.includes('SOLVED') || actionType.includes('APPROVED')) {
        return 'green';
    }

    if (actionType.includes('UPDATED') || actionType.includes('EDITED') || actionType.includes('CHANGED') || actionType.includes('ROLLED_BACK')) {
        return 'amber';
    }

    return 'cyan';
};

const formatNotificationTitle = (log) => {
    const actionType = String(log?.actionType || 'Activity Event').replaceAll('_', ' ').toLowerCase();
    return actionType.charAt(0).toUpperCase() + actionType.slice(1);
};

const formatNotificationMessage = (log) => {
    if (log?.description) return log.description;

    const parts = [];
    if (log?.actor) parts.push(`by ${log.actor}`);
    if (log?.targetLabel) parts.push(`on ${log.targetLabel}`);

    return parts.length > 0 ? parts.join(' ') : 'A new admin event was recorded.';
};

const mapNotification = (log, readIds) => ({
    id: log?._id,
    title: formatNotificationTitle(log),
    message: formatNotificationMessage(log),
    time: getRelativeTime(log?.createdAt),
    tone: getNotificationTone(log),
    unread: !readIds.has(log?._id),
});

const TopNavbar = ({ onToggleSidebar }) => {
    const { t } = useTranslation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readNotificationIds, setReadNotificationIds] = useState(() => new Set());
    const [notifLoading, setNotifLoading] = useState(true);
    const [notifError, setNotifError] = useState('');
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

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setReadNotificationIds(new Set(parsed.filter(Boolean)));
                }
            }
        } catch {
            setReadNotificationIds(new Set());
        }
    }, []);

    useEffect(() => {
        const loadNotifications = async () => {
            setNotifLoading(true);
            try {
                const result = await auditLogService.getLogs({ page: 1, limit: NOTIFICATION_LIMIT });
                const rows = Array.isArray(result?.data) ? result.data : [];
                setNotifications(rows.map((log) => mapNotification(log, readNotificationIds)).filter((item) => item.id));
                setNotifError('');
            } catch (error) {
                console.error('Failed to load admin notifications', error);
                setNotifications([]);
                setNotifError(error?.message || t('topNav.unableToLoadNotifications'));
            } finally {
                setNotifLoading(false);
            }
        };

        loadNotifications();
        const intervalId = window.setInterval(loadNotifications, 30000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [readNotificationIds, t]);

    const unreadNotificationCount = notifications.filter((notification) => notification.unread).length;

    const markNotificationsAsRead = (ids) => {
        if (!ids.length) return;

        setReadNotificationIds((current) => {
            const next = new Set(current);
            ids.forEach((id) => next.add(id));
            try {
                window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(Array.from(next)));
            } catch {
                // Ignore storage failures.
            }
            return next;
        });

        setNotifications((current) => current.map((notification) => (
            ids.includes(notification.id)
                ? { ...notification, unread: false }
                : notification
        )));
    };

    const handleMarkAllAsRead = () => {
        markNotificationsAsRead(notifications.map((notification) => notification.id));
    };

    const handleNotificationClick = (notification) => {
        markNotificationsAsRead([notification.id]);
    };

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/signin');
    };

    return (
        <header style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }} className="sticky top-0 z-20 shadow-custom">
            <div className="flex w-full h-16 items-center justify-between flex-nowrap px-3 md:px-4 lg:px-6 gap-2 md:gap-3">

                {/* Mobile Toggle */}
                <button type="button" aria-label={t('topNav.toggleMenu')} className="lg:hidden shrink-0 p-2 rounded-lg transition-all spotlight-hover" style={{ color: 'var(--color-text-secondary)' }} onClick={onToggleSidebar}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Search Bar - Fixed and Enhanced */}
                <div className="hidden md:block flex-1 min-w-0 max-w-xl mx-2 lg:mx-4">
                    <div className="relative search-wrapper">
                        <input
                            type="text"
                            placeholder={t('topNav.searchPlaceholder')}
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
                <div className="flex items-center flex-nowrap shrink-0 gap-2 md:gap-3 lg:gap-4">

                    {/* System Status Indicator */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg glass-panel">
                        <span className="status-dot status-online" />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t('topNav.systemsOperational')}</span>
                    </div>

                    <LanguageSwitcher size="sm" compact />
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
                            {unreadNotificationCount > 0 && (
                                <span
                                    className="absolute top-1 right-1 min-w-5 h-5 px-1 flex items-center justify-center bg-red-500 rounded-full text-[10px] font-bold text-white"
                                    style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'var(--color-bg-secondary)' }}
                                >
                                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                                </span>
                            )}
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
                                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t('topNav.notifications')}</h3>
                                    <span style={{ fontSize: '10px', color: 'var(--color-cyan-500)', fontWeight: 'bold', background: 'var(--color-info-bg)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {unreadNotificationCount > 0 ? t('topNav.newBadge', { count: unreadNotificationCount }) : t('topNav.allRead')}
                                    </span>
                                </div>
                            </div>

                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                {notifLoading ? (
                                    <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {t('topNav.loadingNotifications')}
                                    </div>
                                ) : notifError ? (
                                    <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {notifError}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                        {t('topNav.noRecentActivity')}
                                    </div>
                                ) : notifications.map((notification) => {
                                    const toneMap = {
                                        cyan: 'var(--color-cyan-400)',
                                        green: 'var(--color-green-400)',
                                        amber: 'var(--color-amber-400)',
                                        red: 'var(--color-red-500)',
                                    };

                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            className="profile-dropdown-item w-full text-left"
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid var(--color-border-subtle)',
                                                alignItems: 'flex-start',
                                                cursor: 'pointer',
                                                opacity: notification.unread ? 1 : 0.72,
                                            }}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: toneMap[notification.tone] || 'var(--color-cyan-400)',
                                                    marginTop: '6px',
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <div className="ml-3">
                                                <p style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: '500' }}>{notification.title}</p>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>{notification.message}</p>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '4px' }}>{notification.time}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '12px', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
                                <button
                                    style={{ color: 'var(--color-cyan-500)', fontSize: '13px', fontWeight: '600', width: '100%' }}
                                    className="hover:text-cyan-400 transition-colors disabled:opacity-50"
                                    onClick={handleMarkAllAsRead}
                                    disabled={notifications.length === 0 || unreadNotificationCount === 0}
                                    type="button"
                                >
                                    {t('topNav.markAllRead')}
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
                                    alt={t('topNav.adminAlt')}
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
                                            alt={t('topNav.adminAlt')}
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
                                    <span>{t('topNav.myProfile')}</span>
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
                                    <span>{t('topNav.settings')}</span>
                                </Link>

                                <Link to="/admin/add-admin" className="profile-dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>{t('topNav.addAdmin')}</span>
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
                                    <span>{t('topNav.reviewApis')}</span>
                                </a>

                                <Link to="/" className="profile-dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span>{t('topNav.goLanding')}</span>
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
                                    <span>{t('topNav.logout')}</span>
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
