import { apiClient } from '../../services/apiClient';

export const supportService = {
  scheduleMeeting: (data) => apiClient('/support/schedule-meeting', { method: 'POST', body: JSON.stringify(data) }),
  contactSupport: (data) => apiClient('/support/contact', { method: 'POST', body: JSON.stringify(data) }),
  reportBug: (data) => apiClient('/support/report-bug', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: (page = 1, limit = 10, category = '') =>
    apiClient(`/support/my-requests?page=${page}&limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ''}`, { method: 'GET' }),
  getRequestById: (id) => apiClient(`/support/my-requests/${id}`, { method: 'GET' }),
  getAdminRequests: ({ page = 1, limit = 20, status = '', category = '' } = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set('status', status);
    if (category) query.set('category', category);
    return apiClient(`/support/admin/requests?${query.toString()}`, { method: 'GET' });
  },
  getAdminRequestById: (id) => apiClient(`/support/admin/requests/${id}`, { method: 'GET' }),
  updateAdminRequestStatus: (id, status) =>
    apiClient(`/support/admin/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

