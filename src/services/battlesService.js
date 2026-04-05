import { apiClient } from './apiClient';

export const battlesService = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const qs = query.toString();
    return apiClient(`/battles${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  getById: async (id) => {
    return apiClient(`/battles/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return apiClient('/battles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiClient(`/battles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  remove: async (id) => {
    return apiClient(`/battles/${id}`, { method: 'DELETE' });
  },

  submitAiSolution: async (id, data = {}) => {
    return apiClient(`/battles/${id}/ai-submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
