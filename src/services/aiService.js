import { apiClient } from './apiClient';

export const aiService = {
    generateChallenge: async ({ description, difficulty, topic, testCases }) => {
        const result = await apiClient('/admin/challenges/generate-ai', {
            method: 'POST',
            body: JSON.stringify({ description, difficulty, topic, testCases }),
        });
        return result.data;
    },

    /** Generate a single section using AI based on challenge context */
    generateSection: async ({ title, description, difficulty, topic, section, existingData }) => {
        const result = await apiClient('/admin/challenges/generate-ai', {
            method: 'POST',
            body: JSON.stringify({
                description: `Given this challenge context:
Title: ${title}
Description: ${description}
Difficulty: ${difficulty}
Topic: ${topic}

Generate ONLY the "${section}" section. Return valid JSON with just the "${section}" key.
${existingData ? `Existing data for reference: ${JSON.stringify(existingData)}` : ''}`,
                difficulty,
                topic,
                testCases: 5,
            }),
        });
        return result.data;
    },
};
