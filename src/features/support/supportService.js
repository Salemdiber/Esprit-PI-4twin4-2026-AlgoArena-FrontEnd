import { apiClient } from '../../services/apiClient';

export const supportService = {
  scheduleMeeting: (data) => apiClient('/support/schedule-meeting', { method: 'POST', body: JSON.stringify(data) }),
  contactSupport: (data) => apiClient('/support/contact', { method: 'POST', body: JSON.stringify(data) }),
  reportBug: (data) => apiClient('/support/report-bug', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: (page = 1, limit = 10, category = '') =>
    apiClient(`/support/my-requests?page=${page}&limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ''}`, { method: 'GET' }),
  getRequestById: (id) => apiClient(`/support/my-requests/${id}`, { method: 'GET' }),
};

