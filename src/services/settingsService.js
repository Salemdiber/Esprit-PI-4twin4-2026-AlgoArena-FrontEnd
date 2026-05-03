import { apiClient } from './apiClient';

const SETTINGS_CACHE_TTL_MS = 60 * 1000;
let settingsCache = null;
let settingsCacheExpiresAt = 0;
let settingsRequestPromise = null;

const invalidateSettingsCache = () => {
    settingsCache = null;
    settingsCacheExpiresAt = 0;
    settingsRequestPromise = null;
};

const loadSettings = async () => {
    const now = Date.now();
    if (settingsCache && now < settingsCacheExpiresAt) {
        return settingsCache;
    }

    if (settingsRequestPromise) {
        return settingsRequestPromise;
    }

    settingsRequestPromise = apiClient('/settings', {
        method: 'GET',
    }).then((data) => {
        settingsCache = data;
        settingsCacheExpiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
        return data;
    }).finally(() => {
        settingsRequestPromise = null;
    });

    return settingsRequestPromise;
};

export const settingsService = {
    getSettings: async () => {
        return loadSettings();
    },

    updateSettings: async (data) => {
        const result = await apiClient('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        invalidateSettingsCache();
        return result;
    },

    toggleUserRegistration: async (value) => {
        const result = await apiClient('/settings/user-registration', {
            method: 'PATCH',
            body: JSON.stringify({ userRegistration: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    toggleAiBattles: async (value) => {
        const result = await apiClient('/settings/ai-battles', {
            method: 'PATCH',
            body: JSON.stringify({ aiBattles: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    toggleMaintenanceMode: async (value) => {
        const result = await apiClient('/settings/maintenance-mode', {
            method: 'PATCH',
            body: JSON.stringify({ maintenanceMode: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    updateApiRateLimit: async (value) => {
        const result = await apiClient('/settings/api-rate-limit', {
            method: 'PATCH',
            body: JSON.stringify({ apiRateLimit: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    toggleOllamaEnabled: async (value) => {
        const result = await apiClient('/settings/ollama-enabled', {
            method: 'PATCH',
            body: JSON.stringify({ ollamaEnabled: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    updateCodeExecutionLimit: async (value) => {
        const result = await apiClient('/settings/code-execution-limit', {
            method: 'PATCH',
            body: JSON.stringify({ codeExecutionLimit: value }),
        });
        invalidateSettingsCache();
        return result;
    },

    toggleSpeedChallenges: async (value) => {
        const result = await apiClient('/settings/disable-speed-challenges', {
            method: 'PATCH',
            body: JSON.stringify({ disableSpeedChallenges: value }),
        });
        invalidateSettingsCache();
        return result;
    },
};
