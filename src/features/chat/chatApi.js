import { apiClient } from '../../services/apiClient';

export const chatApi = {
  getRooms: () => apiClient('/chat/rooms', { method: 'GET' }),
  getHistory: (roomId, page = 1, limit = 50) =>
    apiClient(`/chat/history/${roomId}?page=${page}&limit=${limit}`, { method: 'GET' }),
};

