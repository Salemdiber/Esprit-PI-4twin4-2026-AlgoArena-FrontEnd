import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { auditLogService } from '../../services/auditLogService';
import { settingsService } from '../../services/settingsService';

const DEFAULT_SETTINGS = {
    platformName: 'AlgoArena',
    supportEmail: 'support@algoarena.com',
    userRegistration: true,
    aiBattles: true,
    maintenanceMode: false,
    ollamaEnabled: true,
    disableCopyPaste: false,
    disableTabSwitch: false,
    disableSpeedChallenges: false,
    notificationCenterEnabled: true,
    dailyDigestEnabled: true,
    criticalAlertsEnabled: true,
    notificationDigestTime: '09:00',
    apiRateLimit: 1000,
    codeExecutionLimit: 100,
};

const Settings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('general');
    const [settings, setSettings] = useState(null);
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [platformName, setPlatformName] = useState(DEFAULT_SETTINGS.platformName);
    const [supportEmail, setSupportEmail] = useState(DEFAULT_SETTINGS.supportEmail);
    const [apiRateLimit, setApiRateLimit] = useState(DEFAULT_SETTINGS.apiRateLimit);
    const [codeExecutionLimit, setCodeExecutionLimit] = useState(DEFAULT_SETTINGS.codeExecutionLimit);
    const [notificationDigestTime, setNotificationDigestTime] = useState(DEFAULT_SETTINGS.notificationDigestTime);

    const hydrateDraft = useCallback((data) => {
        setPlatformName(data?.platformName ?? DEFAULT_SETTINGS.platformName);
        setSupportEmail(data?.supportEmail ?? DEFAULT_SETTINGS.supportEmail);
        setApiRateLimit(data?.apiRateLimit ?? DEFAULT_SETTINGS.apiRateLimit);
        setCodeExecutionLimit(data?.codeExecutionLimit ?? DEFAULT_SETTINGS.codeExecutionLimit);
        setNotificationDigestTime(data?.notificationDigestTime ?? DEFAULT_SETTINGS.notificationDigestTime);
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsService.getSettings();
            const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
            setSettings(merged);
            hydrateDraft(merged);
        } catch (err) {
            setError(err.message || t('admin.settings.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, [hydrateDraft, t]);

    const fetchNotifications = useCallback(async () => {
        try {
            setNotificationsLoading(true);
            const result = await auditLogService.getLogs({ page: 1, limit: 6 });
            setRecentNotifications(Array.isArray(result?.data) ? result.data : []);
        } catch {
            setRecentNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchNotifications();
    }, [fetchSettings, fetchNotifications]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    const persistLocalFallbacks = (data) => {
        try {
            if (typeof data?.disableCopyPaste !== 'undefined') localStorage.setItem('disableCopyPaste', JSON.stringify(!!data.disableCopyPaste));
            if (typeof data?.disableTabSwitch !== 'undefined') localStorage.setItem('disableTabSwitch', JSON.stringify(!!data.disableTabSwitch));
        } catch {
            // Local settings are a non-critical fallback.
        }
    };

    const makeSettingsPayload = (source = {}, overrides = {}) => {
        const merged = { ...DEFAULT_SETTINGS, ...(source || {}), ...overrides };
        return {
            platformName: merged.platformName,
            supportEmail: merged.supportEmail,
            userRegistration: merged.userRegistration,
            aiBattles: merged.aiBattles,
            maintenanceMode: merged.maintenanceMode,
            ollamaEnabled: merged.ollamaEnabled,
            disableCopyPaste: merged.disableCopyPaste,
            disableTabSwitch: merged.disableTabSwitch,
            disableSpeedChallenges: merged.disableSpeedChallenges,
            notificationCenterEnabled: merged.notificationCenterEnabled,
            dailyDigestEnabled: merged.dailyDigestEnabled,
            criticalAlertsEnabled: merged.criticalAlertsEnabled,
            notificationDigestTime: merged.notificationDigestTime,
            apiRateLimit: Number(merged.apiRateLimit),
            codeExecutionLimit: Number(merged.codeExecutionLimit),
        };
    };

    const handleToggle = async (field, currentValue) => {
        try {
            setError(null);
            const optimistic = { ...(settings || DEFAULT_SETTINGS), [field]: !currentValue };
            setSettings(optimistic);

            let data;
            if (field === 'userRegistration') data = await settingsService.toggleUserRegistration(!currentValue);
            else if (field === 'aiBattles') data = await settingsService.toggleAiBattles(!currentValue);
            else if (field === 'maintenanceMode') data = await settingsService.toggleMaintenanceMode(!currentValue);
            else if (field === 'ollamaEnabled') data = await settingsService.toggleOllamaEnabled(!currentValue);
            else if (field === 'disableSpeedChallenges') data = await settingsService.toggleSpeedChallenges(!currentValue);

            if (!data) data = await settingsService.updateSettings(makeSettingsPayload(settings, { [field]: !currentValue }));

            const merged = { ...(settings || DEFAULT_SETTINGS), ...(data || {}) };
            setSettings(merged);
            persistLocalFallbacks(merged);
            showSuccess(t('admin.settings.fieldUpdatedSuccess', { field }));
        } catch (err) {
            try {
                const server = await settingsService.getSettings();
                const merged = { ...DEFAULT_SETTINGS, ...(server || {}) };
                setSettings(merged);
                hydrateDraft(merged);
                persistLocalFallbacks(merged);
            } catch {
                // Keep visible error from original failure.
            }
            setError(err.message || t('admin.settings.failedToUpdateField', { field }));
        }
    };

    const buildPayload = () => makeSettingsPayload(settings, {
        platformName,
        supportEmail,
        notificationDigestTime,
        apiRateLimit: Number(apiRateLimit),
        codeExecutionLimit: Number(codeExecutionLimit),
    });

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            setError(null);
            const data = await settingsService.updateSettings(buildPayload());
            const merged = { ...(settings || DEFAULT_SETTINGS), ...(data || {}) };
            setSettings(merged);
            hydrateDraft(merged);
            persistLocalFallbacks(merged);
            showSuccess(t('admin.settings.allSettingsSaved'));
        } catch (err) {
            setError(err.message || t('admin.settings.failedToSave'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        try {
            setSaving(true);
            setError(null);
            const data = await settingsService.updateSettings(DEFAULT_SETTINGS);
            const merged = { ...DEFAULT_SETTINGS, ...(data || {}) };
            setSettings(merged);
            hydrateDraft(merged);
            persistLocalFallbacks(merged);
            showSuccess(t('admin.settings.settingsResetSuccess'));
        } catch (err) {
            setError(err.message || t('admin.settings.failedToReset'));
        } finally {
            setSaving(false);
        }
    };

    const menuItems = useMemo(() => ([
        { key: 'general', label: t('admin.settings.navGeneral'), icon: 'general' },
        { key: 'security', label: t('admin.settings.navSecurity'), icon: 'security' },
        { key: 'notifications', label: t('admin.settings.navNotifications'), icon: 'notifications' },
        { key: 'billing', label: t('admin.settings.navBilling'), icon: 'billing', onClick: () => navigate('/admin/billing') },
        { key: 'advanced', label: t('admin.settings.navAdvanced'), icon: 'advanced' },
    ]), [navigate, t]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">{t('admin.settings.pageTitle')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('admin.settings.pageSubtitle')}</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">{error}</div>}
            {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">{success}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 shadow-custom sticky top-24">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold mb-4">{t('admin.settings.settingsMenu')}</h2>
                        <nav className="space-y-2">
                            {menuItems.map((item) => (
                                <NavButton
                                    key={item.key}
                                    active={activeSection === item.key}
                                    icon={item.icon}
                                    onClick={() => (item.onClick ? item.onClick() : setActiveSection(item.key))}
                                >
                                    {item.label}
                                </NavButton>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-2xl p-6 shadow-custom">
                        {activeSection === 'general' && (
                            <GeneralSettings
                                t={t}
                                settings={settings}
                                platformName={platformName}
                                supportEmail={supportEmail}
                                setPlatformName={setPlatformName}
                                setSupportEmail={setSupportEmail}
                                handleToggle={handleToggle}
                            />
                        )}
                        {activeSection === 'security' && (
                            <SecuritySettings t={t} settings={settings} handleToggle={handleToggle} />
                        )}
                        {activeSection === 'notifications' && (
                            <NotificationSettings
                                settings={settings}
                                notificationDigestTime={notificationDigestTime}
                                setNotificationDigestTime={setNotificationDigestTime}
                                handleToggle={handleToggle}
                                notifications={recentNotifications}
                                loading={notificationsLoading}
                                onRefresh={fetchNotifications}
                            />
                        )}
                        {activeSection === 'advanced' && (
                            <AdvancedSettings
                                t={t}
                                settings={settings}
                                apiRateLimit={apiRateLimit}
                                codeExecutionLimit={codeExecutionLimit}
                                setApiRateLimit={setApiRateLimit}
                                setCodeExecutionLimit={setCodeExecutionLimit}
                                handleToggle={handleToggle}
                            />
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-6 mt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <button className="btn-primary" onClick={handleSaveAll} disabled={saving}>
                                {saving ? t('admin.settings.saving') : t('admin.settings.saveChanges')}
                            </button>
                            <button className="btn-secondary" onClick={handleReset} disabled={saving}>
                                {t('admin.settings.resetToDefaults')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GeneralSettings = ({ t, settings, platformName, supportEmail, setPlatformName, setSupportEmail, handleToggle }) => (
    <div className="space-y-6">
        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">{t('admin.settings.generalSettings')}</h2>
        <div>
            <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold mb-4">{t('admin.settings.platformInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t('admin.settings.platformName')} type="text" value={platformName} onChange={setPlatformName} />
                <Field label={t('admin.settings.supportEmail')} type="email" value={supportEmail} onChange={setSupportEmail} />
            </div>
        </div>
        <Section title={t('admin.settings.featureToggles')}>
            <ToggleItem title={t('admin.settings.toggleUserRegistration')} description={t('admin.settings.toggleUserRegistrationDesc')} checked={settings?.userRegistration ?? true} onChange={() => handleToggle('userRegistration', settings?.userRegistration)} />
            <ToggleItem title={t('admin.settings.toggleAiBattles')} description={t('admin.settings.toggleAiBattlesDesc')} checked={settings?.aiBattles ?? true} onChange={() => handleToggle('aiBattles', settings?.aiBattles)} />
            <ToggleItem title={t('admin.settings.toggleMaintenanceMode')} description={t('admin.settings.toggleMaintenanceModeDesc')} checked={settings?.maintenanceMode ?? false} onChange={() => handleToggle('maintenanceMode', settings?.maintenanceMode)} />
        </Section>
    </div>
);

const SecuritySettings = ({ t, settings, handleToggle }) => (
    <div className="space-y-6">
        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">{t('admin.settings.navSecurity')}</h2>
        <Section title="Challenge protection">
            <ToggleItem title={t('admin.settings.toggleDisableCopyPaste')} description={t('admin.settings.toggleDisableCopyPasteDesc')} checked={settings?.disableCopyPaste ?? false} onChange={() => handleToggle('disableCopyPaste', settings?.disableCopyPaste)} />
            <ToggleItem title={t('admin.settings.toggleDisableTabSwitch')} description={t('admin.settings.toggleDisableTabSwitchDesc')} checked={settings?.disableTabSwitch ?? false} onChange={() => handleToggle('disableTabSwitch', settings?.disableTabSwitch)} />
            <ToggleItem title={t('admin.settings.toggleDisableSpeedChallenges')} description={t('admin.settings.toggleDisableSpeedChallengesDesc')} checked={settings?.disableSpeedChallenges ?? false} onChange={() => handleToggle('disableSpeedChallenges', settings?.disableSpeedChallenges)} />
        </Section>
    </div>
);

const NotificationSettings = ({ settings, notificationDigestTime, setNotificationDigestTime, handleToggle, notifications, loading, onRefresh }) => (
    <div className="space-y-6">
        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">Notifications</h2>
        <Section title="Delivery settings">
            <ToggleItem title="Notification center" description="Show admin alerts in the top navigation notification center." checked={settings?.notificationCenterEnabled ?? true} onChange={() => handleToggle('notificationCenterEnabled', settings?.notificationCenterEnabled)} />
            <ToggleItem title="Daily information digest" description="Receive a daily summary of platform activity and operational alerts." checked={settings?.dailyDigestEnabled ?? true} onChange={() => handleToggle('dailyDigestEnabled', settings?.dailyDigestEnabled)} />
            <ToggleItem title="Critical alerts" description="Highlight important admin actions, failures, and security events as soon as they arrive." checked={settings?.criticalAlertsEnabled ?? true} onChange={() => handleToggle('criticalAlertsEnabled', settings?.criticalAlertsEnabled)} />
            <div>
                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Daily digest time</label>
                <input type="time" value={notificationDigestTime} onChange={(e) => setNotificationDigestTime(e.target.value)} className="form-input w-full md:w-56" />
            </div>
        </Section>
        <NotificationCenterPreview notifications={notifications} loading={loading} onRefresh={onRefresh} />
    </div>
);

const AdvancedSettings = ({ t, settings, apiRateLimit, codeExecutionLimit, setApiRateLimit, setCodeExecutionLimit, handleToggle }) => (
    <div className="space-y-6">
        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">{t('admin.settings.navAdvanced')}</h2>
        <Section title="AI services">
            <ToggleItem title={t('admin.settings.toggleAiClassification')} description={t('admin.settings.toggleAiClassificationDesc')} checked={settings?.ollamaEnabled ?? true} onChange={() => handleToggle('ollamaEnabled', settings?.ollamaEnabled)} accent="purple" />
        </Section>
        <Section title={t('admin.settings.rateLimits')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label={t('admin.settings.apiRequestsPerHour')} type="number" min="1" value={apiRateLimit} onChange={setApiRateLimit} />
                <Field label={t('admin.settings.codeExecutionsPerDay')} type="number" min="1" value={codeExecutionLimit} onChange={setCodeExecutionLimit} />
            </div>
        </Section>
    </div>
);

const Field = ({ label, value, onChange, ...props }) => (
    <div>
        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">{label}</label>
        <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="form-input w-full" />
    </div>
);

const Section = ({ title, children }) => (
    <div className="pt-6 border-t first:pt-0 first:border-t-0" style={{ borderColor: 'var(--color-border)' }}>
        <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const NotificationCenterPreview = ({ notifications, loading, onRefresh }) => (
    <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between gap-3 mb-4">
            <div>
                <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold">Notification center</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Latest unread-style operational events shown in the admin top bar.</p>
            </div>
            <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={onRefresh}>Refresh</button>
        </div>
        <div className="space-y-3">
            {loading ? (
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">No recent notifications.</p>
            ) : notifications.map((log) => (
                <div key={log._id} className="rounded-xl p-4" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                    <p className="font-semibold" style={{ color: 'var(--color-text-heading)' }}>{String(log.actionType || 'Admin event').replaceAll('_', ' ')}</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{log.description || 'A platform activity event was recorded.'}</p>
                </div>
            ))}
        </div>
    </div>
);

const NavButton = ({ active, icon, children, onClick }) => {
    const icons = {
        general: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
        security: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
        notifications: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
        billing: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
        advanced: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all spotlight-hover text-left"
            style={{
                background: active ? 'rgba(34,211,238,0.08)' : 'transparent',
                color: active ? 'var(--color-cyan-400)' : 'var(--color-text-secondary)',
                border: active ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
            }}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
            <span className="font-medium">{children}</span>
        </button>
    );
};

const ToggleItem = ({ title, description, checked, onChange, accent }) => {
    const accentClass = accent === 'purple' ? 'group-hover:text-purple-400' : 'group-hover:text-cyan-400';
    return (
        <div
            className="flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer transition-colors group"
            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
            onClick={onChange}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
        >
            <div>
                <p style={{ color: 'var(--color-text-secondary)' }} className={`font-medium ${accentClass} transition-colors`}>{title}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">{description}</p>
            </div>
            <div className={`toggle-switch ${checked ? 'active' : ''}`} />
        </div>
    );
};

export default Settings;
