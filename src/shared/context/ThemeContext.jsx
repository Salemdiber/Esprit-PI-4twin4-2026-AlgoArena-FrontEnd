/**
 * ThemeContext — Manages Light / Dark / Auto theme preference.
 *
 * Delegates actual color-mode switching to Chakra UI's useColorMode().
 * The "auto" mode listens to window.matchMedia('prefers-color-scheme: dark')
 * and forwards the resolved value to Chakra.
 *
 * Persists the user's choice (light | dark | auto) in localStorage.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useColorMode } from '@chakra-ui/react';

const STORAGE_KEY = 'algoarena-theme-preference';

const ThemeContext = createContext({
    themePreference: 'dark',          // 'light' | 'dark' | 'auto'
    resolvedColorMode: 'dark',        // 'light' | 'dark'  (what's actually rendered)
    setThemePreference: () => { },
});

/** Utility — read system preference */
const getSystemPreference = () => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
    const { colorMode, setColorMode } = useColorMode();

    // Initialise from localStorage (default: 'dark' to match existing behaviour)
    const [themePreference, setThemePreferenceState] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
        } catch { /* ignore */ }
        return 'dark';
    });

    // Resolved color mode (what Chakra is actually showing)
    const [resolvedColorMode, setResolvedColorMode] = useState(() => {
        if (themePreference === 'auto') return getSystemPreference();
        return themePreference;
    });

    // Apply Chakra colorMode whenever resolvedColorMode changes
    useEffect(() => {
        if (colorMode !== resolvedColorMode) {
            setColorMode(resolvedColorMode);
        }
    }, [resolvedColorMode, colorMode, setColorMode]);

    // Sync data-theme attribute for CSS custom-property overrides
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', resolvedColorMode);
        document.documentElement.style.colorScheme = resolvedColorMode;
    }, [resolvedColorMode]);

    // Listen for system theme changes when preference === 'auto'
    useEffect(() => {
        if (themePreference !== 'auto') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            setResolvedColorMode(e.matches ? 'dark' : 'light');
        };

        // Set initial
        setResolvedColorMode(mq.matches ? 'dark' : 'light');

        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [themePreference]);

    // Public setter — persists + resolves
    const setThemePreference = useCallback((pref) => {
        setThemePreferenceState(pref);
        try {
            localStorage.setItem(STORAGE_KEY, pref);
        } catch { /* ignore */ }

        if (pref === 'auto') {
            setResolvedColorMode(getSystemPreference());
        } else {
            setResolvedColorMode(pref);
        }
    }, []);

    const value = useMemo(() => ({
        themePreference,
        resolvedColorMode,
        setThemePreference,
    }), [themePreference, resolvedColorMode, setThemePreference]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemePreference = () => useContext(ThemeContext);

export default ThemeContext;
