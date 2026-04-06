import { apiClient } from './apiClient';

export const judgeService = {
  submitSolution: async (payload) => {
    return apiClient('/judge/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  requestHint: async (challengeId, elapsedTimeSeconds, attemptCount, hintsUnlocked) => {
    return apiClient('/judge/hint', {
      method: 'POST',
      body: JSON.stringify({
        challengeId,
        elapsedTimeSeconds,
        attemptCount,
        hintsUnlocked,
      }),
    });
  },

  getProgress: async () => {
    return apiClient('/judge/progress', { method: 'GET' });
  },

  getChallengeProgress: async (challengeId) => {
    return apiClient(`/judge/progress/${challengeId}`, { method: 'GET' });
  },

  startAttempt: async (challengeId) => {
    return apiClient(`/challenges/${challengeId}/attempt/start`, { method: 'POST' });
  },

  leaveAttempt: async (challengeId, reason = 'left_page', snapshot = {}) => {
    return apiClient(`/challenges/${challengeId}/attempt/leave`, {
      method: 'POST',
      body: JSON.stringify({ reason, ...snapshot }),
    });
  },

  saveAttempt: async (challengeId, payload = {}) => {
    return apiClient(`/challenges/${challengeId}/attempt/save`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  returnAttempt: async (challengeId) => {
    return apiClient(`/challenges/${challengeId}/attempt/return`, { method: 'POST' });
  },

  expireAttempt: async (challengeId) => {
    return apiClient(`/challenges/${challengeId}/attempt/expire`, { method: 'POST' });
  },

  abandonAttempt: async (challengeId, reason = 'timeout') => {
    return apiClient(`/challenges/${challengeId}/attempt/abandon`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
