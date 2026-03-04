import { apiClient } from './apiClient';

export const challengeService = {
    // ── Admin endpoints ──────────────────────────────────────────
    getAll: async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '')
                query.append(key, String(value));
        });
        const qs = query.toString();
        return apiClient(`/challenges${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    getById: async (id) => {
        return apiClient(`/challenges/${id}`, { method: 'GET' });
    },

    create: async (data) => {
        return apiClient('/challenges', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id, data) => {
        return apiClient(`/challenges/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    publish: async (id) => {
        return apiClient(`/challenges/${id}/publish`, { method: 'PATCH' });
    },

    unpublish: async (id) => {
        return apiClient(`/challenges/${id}/unpublish`, { method: 'PATCH' });
    },

    remove: async (id) => {
        return apiClient(`/challenges/${id}`, { method: 'DELETE' });
    },

    // ── Public endpoints (frontoffice) ───────────────────────────
    getPublished: async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '')
                query.append(key, String(value));
        });
        const qs = query.toString();
        return apiClient(`/challenges/public${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    getPublishedById: async (id) => {
        return apiClient(`/challenges/public/${id}`, { method: 'GET' });
    },
};
