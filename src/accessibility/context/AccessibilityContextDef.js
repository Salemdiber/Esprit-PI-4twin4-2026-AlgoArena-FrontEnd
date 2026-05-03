/**
 * AccessibilityContext – Created in a separate file to avoid
 * HMR invalidation in the provider file (Vite Fast Refresh
 * requires component-only exports in .jsx files).
 */
import { createContext } from 'react';

const defaultSettings = {
    highContrast: false,
    reducedMotion: false,
    dyslexiaFont: false,
    fontScale: 'medium',
    voiceMode: false,
    voiceCommandsEnabled: false,
};

const AccessibilityContext = createContext({
    settings: defaultSettings,
    updateSetting: () => { },
    resetSettings: () => { },
});

export { defaultSettings };
export default AccessibilityContext;
