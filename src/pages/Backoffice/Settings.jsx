import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../../services/settingsService';

const Settings = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Draft values for all editable fields
    const [platformName, setPlatformName] = useState('AlgoArena');
    const [supportEmail, setSupportEmail] = useState('support@algoarena.com');
    const [apiRateLimit, setApiRateLimit] = useState(1000);
    const [codeExecutionLimit, setCodeExecutionLimit] = useState(100);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await settingsService.getSettings();
            setSettings(data);
            setPlatformName(data.platformName ?? 'AlgoArena');
            setSupportEmail(data.supportEmail ?? 'support@algoarena.com');
            setApiRateLimit(data.apiRateLimit ?? 1000);
            setCodeExecutionLimit(data.codeExecutionLimit ?? 100);
        } catch (err) {
            setError(err.message || t('admin.settings.failedToLoad'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    // Toggle handlers — instant PATCH per field
    const handleToggle = async (field, currentValue) => {
        try {
            setError(null);
            // Optimistic update so the toggle UI responds immediately
            const prev = settings;
            const optimistic = { ...(settings || {}), [field]: !currentValue };
            setSettings(optimistic);

            // Persist optimistic flags to localStorage as a client-side fallback
            try {
                if (field === 'disableCopyPaste' || field === 'disableTabSwitch') {
                    localStorage.setItem(field, JSON.stringify(!currentValue));
                }
            } catch (_) {}

            let data;
            if (field === 'userRegistration') data = await settingsService.toggleUserRegistration(!currentValue);
            else if (field === 'aiBattles') data = await settingsService.toggleAiBattles(!currentValue);
            else if (field === 'maintenanceMode') data = await settingsService.toggleMaintenanceMode(!currentValue);
            else if (field === 'ollamaEnabled') data = await settingsService.toggleOllamaEnabled(!currentValue);
            else if (field === 'disableSpeedChallenges') data = await settingsService.toggleSpeedChallenges(!currentValue);

            // For new fields (disableCopyPaste / disableTabSwitch) the backend may not expose a PATCH
            // endpoint; fall back to PUT update if specific toggles are not available.
            if (!data && (field === 'disableCopyPaste' || field === 'disableTabSwitch')) {
                const payload = { ...(settings || {}), [field]: !currentValue };
                data = await settingsService.updateSettings(payload);
            }

            // Merge server response with local state to avoid wiping other fields
            setSettings((prev) => ({ ...(prev || {}), ...(data || {}) }));
            // Update localStorage fallback after successful server response
            try {
                if (data) {
                    if (typeof data.disableCopyPaste !== 'undefined') localStorage.setItem('disableCopyPaste', JSON.stringify(!!data.disableCopyPaste));
                    if (typeof data.disableTabSwitch !== 'undefined') localStorage.setItem('disableTabSwitch', JSON.stringify(!!data.disableTabSwitch));
                }
            } catch (_) {}
            showSuccess(t('admin.settings.fieldUpdatedSuccess', { field }));
        } catch (err) {
            // Revert optimistic update on error
            try {
                const server = await settingsService.getSettings();
                setSettings(server);
                // Revert localStorage fallback
                if (field === 'disableCopyPaste' || field === 'disableTabSwitch') {
                    localStorage.setItem(field, JSON.stringify(server[field] || false));
                }
            } catch (_) { /* ignore */ }
            setError(err.message || t('admin.settings.failedToUpdateField', { field }));
        }
    };

    // Save all (platform info + rate limits + toggles)
    const handleSaveAll = async () => {
        try {
            setSaving(true);
            setError(null);
            const data = await settingsService.updateSettings({
                platformName,
                supportEmail,
                userRegistration: settings.userRegistration,
                aiBattles: settings.aiBattles,
                maintenanceMode: settings.maintenanceMode,
                ollamaEnabled: settings.ollamaEnabled,
                disableCopyPaste: settings.disableCopyPaste,
                disableTabSwitch: settings.disableTabSwitch,
                disableSpeedChallenges: settings.disableSpeedChallenges,
                apiRateLimit: Number(apiRateLimit),
                codeExecutionLimit: Number(codeExecutionLimit),
            });
            setSettings((prev) => ({ ...(prev || {}), ...(data || {}) }));
            try {
                if (data) {
                    if (typeof data.disableCopyPaste !== 'undefined') localStorage.setItem('disableCopyPaste', JSON.stringify(!!data.disableCopyPaste));
                    if (typeof data.disableTabSwitch !== 'undefined') localStorage.setItem('disableTabSwitch', JSON.stringify(!!data.disableTabSwitch));
                }
            } catch (_) {}
            showSuccess(t('admin.settings.allSettingsSaved'));
        } catch (err) {
            setError(err.message || t('admin.settings.failedToSave'));
        } finally {
            setSaving(false);
        }
    };

    // Reset to defaults
    const handleReset = async () => {
        try {
            setSaving(true);
            setError(null);
            const data = await settingsService.updateSettings({
                platformName: 'AlgoArena',
                supportEmail: 'support@algoarena.com',
                userRegistration: true,
                aiBattles: true,
                maintenanceMode: false,
                ollamaEnabled: true,
                disableCopyPaste: false,
                disableTabSwitch: false,
                disableSpeedChallenges: false,
                apiRateLimit: 1000,
                codeExecutionLimit: 100,
            });
            setSettings((prev) => ({ ...(prev || {}), ...(data || {}) }));
            try {
                if (data) {
                    if (typeof data.disableCopyPaste !== 'undefined') localStorage.setItem('disableCopyPaste', JSON.stringify(!!data.disableCopyPaste));
                    if (typeof data.disableTabSwitch !== 'undefined') localStorage.setItem('disableTabSwitch', JSON.stringify(!!data.disableTabSwitch));
                }
            } catch (_) {}
            setPlatformName('AlgoArena');
            setSupportEmail('support@algoarena.com');
            setApiRateLimit(1000);
            setCodeExecutionLimit(100);
            showSuccess(t('admin.settings.settingsResetSuccess'));
        } catch (err) {
            setError(err.message || t('admin.settings.failedToReset'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">{t('admin.settings.pageTitle')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">{t('admin.settings.pageSubtitle')}</p>
            </div>

            {/* Feedback banners */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Settings Nav */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 shadow-custom sticky top-24">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-4">{t('admin.settings.settingsMenu')}</h2>
                        <nav className="space-y-2">
                            <NavButton active icon="general">{t('admin.settings.navGeneral')}</NavButton>
                            <NavButton icon="security">{t('admin.settings.navSecurity')}</NavButton>
                            <NavButton icon="notifications">{t('admin.settings.navNotifications')}</NavButton>
                            <NavButton icon="billing">{t('admin.settings.navBilling')}</NavButton>
                            <NavButton icon="advanced">{t('admin.settings.navAdvanced')}</NavButton>
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-2xl p-6 shadow-custom">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-6">{t('admin.settings.generalSettings')}</h2>

                        <div className="space-y-6">

                            {/* Platform Info */}
                            <div>
                                <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold  mb-4">{t('admin.settings.platformInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.settings.platformName')}</label>
                                        <input
                                            type="text"
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                            className="form-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.settings.supportEmail')}</label>
                                        <input
                                            type="email"
                                            value={supportEmail}
                                            onChange={(e) => setSupportEmail(e.target.value)}
                                            className="form-input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="pt-6 border-t " style={{ borderColor: 'var(--color-border)' }}>
                                <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold  mb-4">{t('admin.settings.featureToggles')}</h3>
                                <div className="space-y-4">
                                    <ToggleItem
                                        title={t('admin.settings.toggleUserRegistration')}
                                        description={t('admin.settings.toggleUserRegistrationDesc')}
                                        checked={settings?.userRegistration ?? true}
                                        onChange={() => handleToggle('userRegistration', settings?.userRegistration)}
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleAiBattles')}
                                        description={t('admin.settings.toggleAiBattlesDesc')}
                                        checked={settings?.aiBattles ?? true}
                                        onChange={() => handleToggle('aiBattles', settings?.aiBattles)}
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleMaintenanceMode')}
                                        description={t('admin.settings.toggleMaintenanceModeDesc')}
                                        checked={settings?.maintenanceMode ?? false}
                                        onChange={() => handleToggle('maintenanceMode', settings?.maintenanceMode)}
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleAiClassification')}
                                        description={t('admin.settings.toggleAiClassificationDesc')}
                                        checked={settings?.ollamaEnabled ?? true}
                                        onChange={() => handleToggle('ollamaEnabled', settings?.ollamaEnabled)}
                                        accent="purple"
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleDisableCopyPaste')}
                                        description={t('admin.settings.toggleDisableCopyPasteDesc')}
                                        checked={settings?.disableCopyPaste ?? false}
                                        onChange={() => handleToggle('disableCopyPaste', settings?.disableCopyPaste)}
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleDisableTabSwitch')}
                                        description={t('admin.settings.toggleDisableTabSwitchDesc')}
                                        checked={settings?.disableTabSwitch ?? false}
                                        onChange={() => handleToggle('disableTabSwitch', settings?.disableTabSwitch)}
                                    />
                                    <ToggleItem
                                        title={t('admin.settings.toggleDisableSpeedChallenges')}
                                        description={t('admin.settings.toggleDisableSpeedChallengesDesc')}
                                        checked={settings?.disableSpeedChallenges ?? false}
                                        onChange={() => handleToggle('disableSpeedChallenges', settings?.disableSpeedChallenges)}
                                    />
                                </div>
                            </div>

                            {/* Rate Limits */}
                            <div className="pt-6 border-t " style={{ borderColor: 'var(--color-border)' }}>
                                <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-lg font-semibold  mb-4">{t('admin.settings.rateLimits')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.settings.apiRequestsPerHour')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={apiRateLimit}
                                            onChange={(e) => setApiRateLimit(e.target.value)}
                                            className="form-input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.settings.codeExecutionsPerDay')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={codeExecutionLimit}
                                            onChange={(e) => setCodeExecutionLimit(e.target.value)}
                                            className="form-input w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 mt-6 border-t " style={{ borderColor: 'var(--color-border)' }}>
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
        </div>
    );
};

const NavButton = ({ active, icon, children }) => {
    const icons = {
        general: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>,
        security: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>,
        notifications: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>,
        billing: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>,
        advanced: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    };

    return (
        <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all spotlight-hover ${active ? 'text-cyan-400' : ''}`}
            style={{
                background: active ? 'rgba(34,211,238,0.08)' : 'transparent',
                color: active ? 'var(--color-cyan-400)' : 'var(--color-text-secondary)',
                border: active ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
            }}
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icons[icon]}
            </svg>
            <span className="font-medium">{children}</span>
        </a>
    );
};

const ToggleItem = ({ title, description, checked, onChange, accent }) => {
    const accentClass = accent === 'purple'
        ? 'group-hover:text-purple-400'
        : 'group-hover:text-cyan-400';
    return (
        <div
            className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors group"
            style={{
                background: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
            }}
            onClick={onChange}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
        >
            <div>
                <p style={{ color: 'var(--color-text-secondary)' }} className={`font-medium  ${accentClass} transition-colors`}>{title}</p>
                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">{description}</p>
            </div>
            <div
                className={`toggle-switch ${checked ? 'active' : ''}`}
            />
        </div>
    );
};

export default Settings;
