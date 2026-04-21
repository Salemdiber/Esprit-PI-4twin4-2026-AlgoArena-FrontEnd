/**
 * Shared module exports
 * Centralized exports for loading components, context, and skeletons
 */

// Loading components
export { default as AppLoader } from './components/AppLoader';
export { default as RouteLoader } from './components/RouteLoader';

// Loading context & hook
export { LoadingProvider } from './context/LoadingContext';
export { default as LoadingContext } from './context/LoadingContext';
export { default as useLoading } from './hooks/useLoading';

// Theme context & hook
export { ThemeProvider, useThemePreference } from './context/ThemeContext';
export { default as ThemeContext } from './context/ThemeContext';

// Skeleton components
export { default as LeaderboardSkeleton } from './skeletons/LeaderboardSkeleton';
export { default as ChallengeCardSkeleton } from './skeletons/ChallengeCardSkeleton';
export { default as ChallengesListSkeleton } from './skeletons/ChallengesListSkeleton';
export { default as ChallengePlaySkeleton } from './skeletons/ChallengePlaySkeleton';
export { default as BattleCardSkeleton } from './skeletons/BattleCardSkeleton';
export { default as BattlesListSkeleton } from './skeletons/BattlesListSkeleton';
export { default as ActiveBattleSkeleton } from './skeletons/ActiveBattleSkeleton';
export { default as BattleSummarySkeleton } from './skeletons/BattleSummarySkeleton';
