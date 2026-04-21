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

const STORAGE_KEY = 'algoarena_a11y_settings';
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

const loadSettings = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Only keep keys that exist in defaultSettings (strip removed features)
            const filtered = {};
            for (const key of Object.keys(defaultSettings)) {
                filtered[key] = key in parsed ? parsed[key] : defaultSettings[key];
            }
            return filtered;
        }
    } catch (e) {
        console.warn('Failed to load a11y settings:', e);
    }
    return defaultSettings;
};

const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(loadSettings);
    const navigateRef = useRef(null);

    // Allow pages to register a navigate function for voice commands
    const registerNavigate = useCallback((nav) => {
        navigateRef.current = nav;
    }, []);

    // Persist + apply overrides whenever settings change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        applyAccessibilityOverrides(settings);
        if (settings.dyslexiaFont) {
            loadDyslexiaFont().catch(() => {});
        }
    }, [settings]);

    // Apply on initial mount
    useEffect(() => {
        applyAccessibilityOverrides(settings);
        if (settings.dyslexiaFont) {
            loadDyslexiaFont().catch(() => {});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
