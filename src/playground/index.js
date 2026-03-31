/**
 * Exports for Challenge Arena Playground
 * Complete code execution and competition interface
 */

// Services
export { default as codeExecutionService } from './services/codeExecutionService';
export { default as leaderboardService } from './services/leaderboardService';

// Hooks
export { useCodeExecution, default } from './hooks/useCodeExecution';

// Components
export { default as ChallengeArenaPlayground } from './components/ChallengeArenaPlayground';
export { default as LiveLeaderboard } from './components/LiveLeaderboard';
export { default as TestResults } from './components/TestResults';
export { default as ChallengePlaygroundPage } from './pages/Frontoffice/ChallengePlaygroundPage';

// Core exports
export const PLAYGROUND_ROUTES = {
  LIST: '/playground/challenges',
  PLAY: (id) => `/playground/challenges/${id}`,
};

export const EXECUTION_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];
