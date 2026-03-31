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
};
