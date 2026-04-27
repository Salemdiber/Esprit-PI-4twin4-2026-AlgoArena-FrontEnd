module.exports = {
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.mjs'],
    transform: {
        '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },
    transformIgnorePatterns: ['/node_modules/'],
    // No global setup file to avoid ESM/mock compatibility issues in this environment
    setupFilesAfterEnv: [],
};
