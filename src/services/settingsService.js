import { apiClient } from './apiClient';

export const settingsService = {
    // ------------------------------------
    // GET /settings → Returns current settings
    // ------------------------------------
    getSettings: async () => {
        return apiClient('/settings', {
            method: 'GET',
        });
    },

    // ------------------------------------
    // PUT /settings → Update all settings (admin only)
    // ------------------------------------
    updateSettings: async (data) => {
        return apiClient('/settings', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // ------------------------------------
    // PATCH /settings/user-registration → Toggle user registration (admin only)
    // ------------------------------------
    toggleUserRegistration: async (value) => {
        return apiClient('/settings/user-registration', {
            method: 'PATCH',
            body: JSON.stringify({ userRegistration: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/ai-battles → Toggle AI battles (admin only)
    // ------------------------------------
    toggleAiBattles: async (value) => {
        return apiClient('/settings/ai-battles', {
            method: 'PATCH',
            body: JSON.stringify({ aiBattles: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/maintenance-mode → Toggle maintenance mode (admin only)
    // ------------------------------------
    toggleMaintenanceMode: async (value) => {
        return apiClient('/settings/maintenance-mode', {
            method: 'PATCH',
            body: JSON.stringify({ maintenanceMode: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/api-rate-limit → Update API rate limit (admin only)
    // ------------------------------------
    updateApiRateLimit: async (value) => {
        return apiClient('/settings/api-rate-limit', {
            method: 'PATCH',
            body: JSON.stringify({ apiRateLimit: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/ollama-enabled → Toggle AI classification (admin only)
    // (keeps route name for backward compatibility)
    // ------------------------------------
    toggleOllamaEnabled: async (value) => {
        return apiClient('/settings/ollama-enabled', {
            method: 'PATCH',
            body: JSON.stringify({ ollamaEnabled: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/code-execution-limit → Update code execution limit (admin only)
    // ------------------------------------
    updateCodeExecutionLimit: async (value) => {
        return apiClient('/settings/code-execution-limit', {
            method: 'PATCH',
            body: JSON.stringify({ codeExecutionLimit: value }),
        });
    },

    // ------------------------------------
    // PATCH /settings/disable-speed-challenges → Toggle speed challenges (admin only)
    // ------------------------------------
    toggleSpeedChallenges: async (value) => {
        return apiClient('/settings/disable-speed-challenges', {
            method: 'PATCH',
            body: JSON.stringify({ disableSpeedChallenges: value }),
        });
    },
};
