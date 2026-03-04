/**
 * ChallengeContext – centralised state for the Challenges feature.
 *
 * Fetches PUBLISHED challenges from backend API.
 * No mock data fallback — only real backend data is displayed.
 */
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import {
    ChallengeUserStatus,
    Difficulty,
    RANK_META,
    RANK_RECOMMENDATIONS,
    LANGUAGES,
    DIFFICULTY_META,
    ALL_TAGS,
    Rank,
} from '../data/mockChallenges';
import { challengeService } from '../../../../services/challengeService';
import { fetchRankStats } from '../../../../services/userStatsService';

// ─── Action types ─────────────────────────────────────────────────
const ActionTypes = {
    SET_CHALLENGES: 'SET_CHALLENGES',
    SET_LOADING: 'SET_LOADING',
    SET_USER_STATS: 'SET_USER_STATS',
    SELECT_CHALLENGE: 'SELECT_CHALLENGE',
    DESELECT_CHALLENGE: 'DESELECT_CHALLENGE',
    SET_CODE: 'SET_CODE',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_TEST_RESULTS: 'SET_TEST_RESULTS',
    SET_RUNNING: 'SET_RUNNING',
    SET_SUBMITTING: 'SET_SUBMITTING',
    CLEAR_RESULTS: 'CLEAR_RESULTS',
    MARK_SOLVED: 'MARK_SOLVED',
    ADD_XP: 'ADD_XP',
    RESET_CODE: 'RESET_CODE',
};

// Map backend difficulty values to our enum
const normalizeDifficulty = (d) => {
    if (!d) return Difficulty.MEDIUM;
    const upper = d.toUpperCase();
    return Difficulty[upper] || Difficulty.MEDIUM;
};

// Transform backend challenge to frontend format
const transformChallenge = (ch) => ({
    id: ch._id || ch.id,
    title: ch.title,
    difficulty: normalizeDifficulty(ch.difficulty),
    tags: ch.tags || [],
    description: ch.description || '',
    examples: (ch.examples || []).map(e => ({
        input: e.input || '',
        output: e.output || '',
        explanation: e.explanation || '',
    })),
    constraints: ch.constraints || [],
    hints: ch.hints || [],
    xpReward: ch.xpReward || 50,
    acceptanceRate: ch.acceptanceRate || 0,
    estimatedTime: ch.estimatedTime || 15,
    solvedCount: ch.solvedCount || 0,
    starterCode: ch.starterCode || {
        javascript: `// Solution for: ${ch.title}\nfunction solution() {\n  // Write your code here\n}\n`,
    },
    testCases: (ch.testCases || []).map((tc, i) => ({
        id: `tc-${i + 1}`,
        input: tc.input || '',
        expected: tc.output || tc.expected || '',
    })),
    aiGenerated: ch.aiGenerated || false,
    status: ch.status || 'published',
    createdAt: ch.createdAt,
});

// ─── Initial state ────────────────────────────────────────────────
const initialState = {
    challenges: [],
    userProgress: [],
    // user stats — populated from API, null until loaded
    user: { rank: null, xp: 0, streak: 0 },
    isLoadingChallenges: true,
    isLoadingStats: true,

    selectedChallengeId: null,
    code: '',
    language: LANGUAGES[0].value,
    activeTab: 0,
    testResults: [],
    isRunning: false,
    isSubmitting: false,
    executionState: 'idle',
};

// ─── Reducer ──────────────────────────────────────────────────────
function challengeReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_CHALLENGES:
            return { ...state, challenges: action.payload, isLoadingChallenges: false };
        case ActionTypes.SET_LOADING:
            return { ...state, isLoadingChallenges: action.payload };
        case ActionTypes.SET_USER_STATS:
            return {
                ...state,
                user: {
                    ...state.user,
                    rank: action.payload.rank,
                    xp: action.payload.xp,
                    streak: action.payload.streak,
                    nextRankXp: action.payload.nextRankXp,
                    progressPercentage: action.payload.progressPercentage,
                    isMaxRank: action.payload.isMaxRank,
                },
                isLoadingStats: false,
            };
        case ActionTypes.SELECT_CHALLENGE: {
            const ch = state.challenges.find(c => c.id === action.payload);
            if (!ch) return state;
            const starterCode = ch.starterCode?.[state.language] || '// Start coding here\n';
            return { ...state, selectedChallengeId: action.payload, code: starterCode, testResults: [], executionState: 'idle', activeTab: 0 };
        }
        case ActionTypes.DESELECT_CHALLENGE:
            return { ...state, selectedChallengeId: null, code: '', testResults: [], executionState: 'idle', activeTab: 0 };
        case ActionTypes.SET_CODE:
            return { ...state, code: action.payload };
        case ActionTypes.SET_LANGUAGE: {
            const ch = state.challenges.find(c => c.id === state.selectedChallengeId);
            const starterCode = ch?.starterCode?.[action.payload] || '// Start coding here\n';
            return { ...state, language: action.payload, code: starterCode };
        }
        case ActionTypes.SET_ACTIVE_TAB:
            return { ...state, activeTab: action.payload };
        case ActionTypes.SET_TEST_RESULTS:
            return { ...state, testResults: action.payload.results, executionState: action.payload.allPassed ? 'success' : 'failure' };
        case ActionTypes.SET_RUNNING:
            return { ...state, isRunning: action.payload, executionState: action.payload ? 'running' : state.executionState };
        case ActionTypes.SET_SUBMITTING:
            return { ...state, isSubmitting: action.payload };
        case ActionTypes.CLEAR_RESULTS:
            return { ...state, testResults: [], executionState: 'idle' };
        case ActionTypes.MARK_SOLVED: {
            const existing = state.userProgress.find(p => p.challengeId === action.payload.challengeId);
            const { avgRuntime, avgMemory, xp } = action.payload;
            if (existing) {
                return {
                    ...state,
                    userProgress: state.userProgress.map(p =>
                        p.challengeId === action.payload.challengeId
                            ? { ...p, status: ChallengeUserStatus.SOLVED, bestRuntime: avgRuntime, bestMemory: avgMemory, earnedXp: xp }
                            : p
                    ),
                };
            }
            return {
                ...state,
                userProgress: [...state.userProgress, { challengeId: action.payload.challengeId, status: ChallengeUserStatus.SOLVED, bestRuntime: avgRuntime, bestMemory: avgMemory, earnedXp: xp }],
            };
        }
        case ActionTypes.ADD_XP:
            return { ...state, user: { ...state.user, xp: state.user.xp + action.payload } };
        case ActionTypes.RESET_CODE: {
            const ch = state.challenges.find(c => c.id === state.selectedChallengeId);
            const starterCode = ch?.starterCode?.[state.language] || '// Start coding here\n';
            return { ...state, code: starterCode, testResults: [], executionState: 'idle' };
        }
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────
const ChallengeContext = createContext(null);

export const ChallengeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(challengeReducer, initialState);

    // ── Fetch published challenges from API only ──────────────
    useEffect(() => {
        let cancelled = false;
        const loadChallenges = async () => {
            dispatch({ type: ActionTypes.SET_LOADING, payload: true });
            try {
                const apiChallenges = await challengeService.getPublished();
                if (!cancelled && Array.isArray(apiChallenges)) {
                    dispatch({ type: ActionTypes.SET_CHALLENGES, payload: apiChallenges.map(transformChallenge) });
                } else if (!cancelled) {
                    dispatch({ type: ActionTypes.SET_CHALLENGES, payload: [] });
                }
            } catch {
                if (!cancelled) dispatch({ type: ActionTypes.SET_CHALLENGES, payload: [] });
            }
        };

        const loadRankStats = async () => {
            const stats = await fetchRankStats();
            if (!cancelled) {
                if (stats) {
                    dispatch({ type: ActionTypes.SET_USER_STATS, payload: stats });
                } else {
                    // API unavailable or not authenticated — mark done with defaults
                    dispatch({ type: ActionTypes.SET_USER_STATS, payload: { rank: null, xp: 0, nextRankXp: 500, progressPercentage: 0, streak: 0, isMaxRank: false } });
                }
            }
        };

        loadChallenges();
        loadRankStats();
        return () => { cancelled = true; };
    }, []);

    // ── Actions ──────────────────────────────────────────────
    const selectChallenge = useCallback((id) => dispatch({ type: ActionTypes.SELECT_CHALLENGE, payload: id }), []);
    const deselectChallenge = useCallback(() => dispatch({ type: ActionTypes.DESELECT_CHALLENGE }), []);
    const setCode = useCallback((code) => dispatch({ type: ActionTypes.SET_CODE, payload: code }), []);
    const setLanguage = useCallback((lang) => dispatch({ type: ActionTypes.SET_LANGUAGE, payload: lang }), []);
    const setActiveTab = useCallback((idx) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: idx }), []);
    const clearResults = useCallback(() => dispatch({ type: ActionTypes.CLEAR_RESULTS }), []);
    const resetCode = useCallback(() => dispatch({ type: ActionTypes.RESET_CODE }), []);
    const setTestResults = useCallback((results, allPassed) => dispatch({ type: ActionTypes.SET_TEST_RESULTS, payload: { results, allPassed } }), []);
    const markSolved = useCallback((challengeId, avgRuntime, avgMemory, xp) => {
        dispatch({ type: ActionTypes.MARK_SOLVED, payload: { challengeId, avgRuntime, avgMemory, xp } });
        dispatch({ type: ActionTypes.ADD_XP, payload: xp });
    }, []);
    const setRunning = useCallback((v) => dispatch({ type: ActionTypes.SET_RUNNING, payload: v }), []);
    const setSubmitting = useCallback((v) => dispatch({ type: ActionTypes.SET_SUBMITTING, payload: v }), []);

    // ── Derived ──────────────────────────────────────────────
    const selectedChallenge = useMemo(() => state.challenges.find(c => c.id === state.selectedChallengeId) || null, [state.challenges, state.selectedChallengeId]);
    const getUserProgress = useCallback((challengeId) => state.userProgress.find(p => p.challengeId === challengeId) || null, [state.userProgress]);

    // rankMeta is derived from the live user.rank (from API)
    const rankMeta = useMemo(() => {
        const r = state.user.rank;
        return r ? (RANK_META[r] ?? RANK_META[Rank.BRONZE]) : null;
    }, [state.user.rank]);

    // Use API-provided values when available; fall back to local computation
    const xpToNextRank = useMemo(() => state.user.nextRankXp ?? rankMeta?.xpCeil ?? 500, [state.user.nextRankXp, rankMeta]);
    const progressPercent = useMemo(
        () => state.user.progressPercentage ?? Math.min(100, Math.round((state.user.xp / xpToNextRank) * 100)),
        [state.user.progressPercentage, state.user.xp, xpToNextRank]
    );
    const recommendedDifficulties = useMemo(() => state.user.rank ? (RANK_RECOMMENDATIONS[state.user.rank] || []) : [], [state.user.rank]);
    const isRecommended = useCallback((challenge) => recommendedDifficulties.includes(challenge.difficulty), [recommendedDifficulties]);

    const value = useMemo(() => ({
        ...state,
        selectedChallenge,
        getUserProgress,
        rankMeta,
        xpToNextRank,
        progressPercent,
        recommendedDifficulties,
        isRecommended,
        selectChallenge, deselectChallenge, setCode, setLanguage, setActiveTab,
        setTestResults, markSolved, clearResults, resetCode, setRunning, setSubmitting,
    }), [
        state, selectedChallenge, getUserProgress, rankMeta, xpToNextRank, progressPercent,
        recommendedDifficulties, isRecommended, selectChallenge, deselectChallenge, setCode,
        setLanguage, setActiveTab, setTestResults, markSolved, clearResults, resetCode, setRunning, setSubmitting,
    ]);

    return (
        <ChallengeContext.Provider value={value}>
            {children}
        </ChallengeContext.Provider>
    );
};

export const useChallengeContext = () => {
    const ctx = useContext(ChallengeContext);
    if (!ctx) throw new Error('useChallengeContext must be used inside ChallengeProvider');
    return ctx;
};
