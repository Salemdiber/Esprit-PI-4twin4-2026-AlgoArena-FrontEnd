import { apiClient } from './apiClient';

export const adminStatsService = {
    getOverview: async () => apiClient('/admin/stats/overview', { method: 'GET' }),
    getUsers: async () => apiClient('/admin/stats/users', { method: 'GET' }),
    getChallenges: async () => apiClient('/admin/stats/challenges', { method: 'GET' }),
    getSubmissions: async () => apiClient('/admin/stats/submissions', { method: 'GET' }),
    getSandboxStatus: async () => apiClient('/admin/sandbox/status', { method: 'GET' }),
};
