import { apiClient } from './apiClient';

export const aiService = {
    generateChallenge: async ({ description, difficulty, topic, testCases }) => {
        const result = await apiClient('/admin/challenges/generate-ai', {
            method: 'POST',
            body: JSON.stringify({ description, difficulty, topic, testCases }),
        });
        return result.data;
    },
};
