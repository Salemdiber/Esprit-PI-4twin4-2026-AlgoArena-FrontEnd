import { apiClient } from './apiClient';

export const auditLogService = {
    getLogs: async (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, String(value));
            }
        });
        const qs = query.toString();
        return apiClient(`/audit-logs${qs ? `?${qs}` : ''}`, { method: 'GET' });
    },

    getLogById: async (id) => {
        return apiClient(`/audit-logs/${id}`, { method: 'GET' });
    },

    getStats: async () => {
        return apiClient('/audit-logs/stats', { method: 'GET' });
    },

    confirmAction: async (id) => {
        return apiClient(`/audit-logs/confirm/${id}`, { method: 'POST' });
    },

    rollbackAction: async (id) => {
        return apiClient(`/audit-logs/rollback/${id}`, { method: 'POST' });
    },
};
