/**
 * AccessibilityProvider – Global accessibility state provider
 *
 * Manages:
 *  • highContrast, reducedMotion, dyslexiaFont, fontScale
 *  • voiceMode, voiceCommandsEnabled
 *
 * Persists to localStorage.
 * Applies CSS overrides immediately via themeOverrides utility.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AccessibilityContext, { defaultSettings } from './AccessibilityContextDef';
import { applyAccessibilityOverrides } from '../utils/themeOverrides';
import { startListening, stopListening } from '../utils/speechUtils';
import { userService } from '../../services/userService';
import { getToken } from '../../services/cookieUtils';

let dyslexiaFontPromise = null;

const loadDyslexiaFont = () => {
    if (!dyslexiaFontPromise) {
        dyslexiaFontPromise = Promise.all([
            import('@fontsource/opendyslexic/400.css'),
            import('@fontsource/opendyslexic/700.css'),
        ]);
    }
    return dyslexiaFontPromise;
};

const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const navigateRef = useRef(null);
    const hasHydratedRef = useRef(false);

    // Allow pages to register a navigate function for voice commands
    const registerNavigate = useCallback((nav) => {
        navigateRef.current = nav;
    }, []);

    const loadServerSettings = useCallback(async () => {
        const token = getToken();
        const storedAuth = localStorage.getItem('fo_auth');
        if (!token && !storedAuth) {
            hasHydratedRef.current = true;
            return;
        }

        try {
            hasHydratedRef.current = false;
            const serverSettings = await userService.getAccessibilitySettings();
            if (serverSettings && typeof serverSettings === 'object') {
                setSettings({ ...defaultSettings, ...serverSettings });
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('Could not load server accessibility settings:', err);
        } finally {
            hasHydratedRef.current = true;
        }
    }, []);

    // Persist to DB + apply overrides whenever settings change
    useEffect(() => {
        applyAccessibilityOverrides(settings);
        if (settings.dyslexiaFont) {
            loadDyslexiaFont().catch(() => {});
        }

        // If user appears logged in, persist settings to server (non-fatal)
        try {
            const token = getToken();
            const stored = localStorage.getItem('fo_auth');
            const loggedIn = Boolean(token || stored);
            if (loggedIn && hasHydratedRef.current) {
                userService.updateAccessibilitySettings(settings).catch((err) => {
                    // Non-fatal: log and continue
                    // eslint-disable-next-line no-console
                    console.warn('Failed to persist accessibility settings to server:', err);
                });
            }
        } catch (e) {
            // ignore
        }
    }, [settings]);

    // Load from server on initial mount
    useEffect(() => {
        loadServerSettings();
    }, []);

    // React immediately to login/logout in the same tab.
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'fo_auth' || e.key === 'isAuthenticated') {
                loadServerSettings();
            }
        };

        window.addEventListener('storage', onStorage);
        const onAuthChange = (event) => {
            const nextUser = event?.detail?.user ?? null;
            if (!nextUser) {
                setSettings(defaultSettings);
                return;
            }

            loadServerSettings();
        };

        window.addEventListener('auth-change', onAuthChange);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('auth-change', onAuthChange);
        };
    }, [loadServerSettings]);

    // Voice commands listener
    useEffect(() => {
        if (!settings.voiceCommandsEnabled) {
            stopListening();
            return;
        }

        const handleVoiceCommand = (transcript) => {
            const nav = navigateRef.current;
            if (!nav) return;

            if (transcript.includes('go to leaderboard') || transcript.includes('open leaderboard')) {
                nav('/leaderboard');
            } else if (transcript.includes('open challenges') || transcript.includes('go to challenges')) {
                nav('/challenges');
            } else if (transcript.includes('start battle') || transcript.includes('go to battles')) {
                nav('/battles');
            } else if (transcript.includes('go home') || transcript.includes('go to home')) {
                nav('/');
            }
        };

        startListening(handleVoiceCommand);

        return () => stopListening();
    }, [settings.voiceCommandsEnabled]);

    const updateSetting = useCallback((key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    return (
        <AccessibilityContext.Provider
            value={{ settings, updateSetting, resetSettings, registerNavigate }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
};

export default AccessibilityProvider;
