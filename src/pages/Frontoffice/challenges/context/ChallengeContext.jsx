/* eslint-disable react-refresh/only-export-components */
/**
 * ChallengeContext - centralised state for the Challenges feature.
 *
 * Fetches PUBLISHED challenges from backend API.
 * No mock data fallback — only real backend data is displayed.
 */
import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    ChallengeUserStatus,
    Difficulty,
    RANK_META,
    RANK_RECOMMENDATIONS,
    LANGUAGES,
    Rank,
} from '../data/mockChallenges';
import { challengeService } from '../../../../services/challengeService';
import { fetchRankStats } from '../../../../services/userStatsService';
import { judgeService } from '../../../../services/judgeService';
import { useAuth } from '../../auth/context/AuthContext';

const EDITOR_SETTINGS_KEY = 'challenge_editor_settings';

const readEditorSettings = () => {
    try {
        const raw = localStorage.getItem(EDITOR_SETTINGS_KEY);
        if (!raw) return { fontFamily: 'monospace', fontSize: 14 };
        const parsed = JSON.parse(raw);
        return {
            fontFamily: parsed?.fontFamily || 'monospace',
            fontSize: Math.min(28, Math.max(12, Number(parsed?.fontSize) || 14)),
        };
    } catch {
        return { fontFamily: 'monospace', fontSize: 14 };
    }
};

const ActionTypes = {
    SET_CHALLENGES: 'SET_CHALLENGES',
    SET_LOADING: 'SET_LOADING',
    SET_USER_STATS: 'SET_USER_STATS',
    SET_PROGRESS: 'SET_PROGRESS',
    UPSERT_PROGRESS: 'UPSERT_PROGRESS',
    SELECT_CHALLENGE: 'SELECT_CHALLENGE',
    APPLY_CHALLENGE_DETAIL: 'APPLY_CHALLENGE_DETAIL',
    DESELECT_CHALLENGE: 'DESELECT_CHALLENGE',
    SET_CODE: 'SET_CODE',
    SET_LANGUAGE: 'SET_LANGUAGE',
    SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
    SET_TEST_RESULTS: 'SET_TEST_RESULTS',
    SET_RUNNING: 'SET_RUNNING',
    SET_SUBMITTING: 'SET_SUBMITTING',
    CLEAR_RESULTS: 'CLEAR_RESULTS',
    SET_JUDGE_ANALYSIS: 'SET_JUDGE_ANALYSIS',
    SET_INTEGRITY_NOTICE: 'SET_INTEGRITY_NOTICE',
    SET_ERROR: 'SET_ERROR',
    INCREMENT_FAILED: 'INCREMENT_FAILED',
    SET_HINTS_UNLOCKED: 'SET_HINTS_UNLOCKED',
    SET_HINT: 'SET_HINT',
    UPDATE_TIME: 'UPDATE_TIME',
    SET_TIMER_RUNNING: 'SET_TIMER_RUNNING',
    SET_PAUSED: 'SET_PAUSED',
    RESET_WORKSPACE: 'RESET_WORKSPACE',
    SET_PASTE_BLOCKED: 'SET_PASTE_BLOCKED',
    SET_EDITOR_SETTINGS: 'SET_EDITOR_SETTINGS',
    SET_EDITOR_FULLSCREEN: 'SET_EDITOR_FULLSCREEN',
    SET_CHALLENGE_SOLVED: 'SET_CHALLENGE_SOLVED',
    RESET_FEATURE_STATE: 'RESET_FEATURE_STATE',
};

const normalizeDifficulty = (d) => {
    if (!d) return Difficulty.MEDIUM;
    const upper = d.toUpperCase();
    return Difficulty[upper] || Difficulty.MEDIUM;
};

const formatValueForDisplay = (value) => {
    if (value === null || value === undefined) return String(value);
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const normalizeJudgeResult = (result, index) => {
    const expected = result.expected ?? result.expectedOutput ?? null;
    const output = result.output ?? result.got ?? result.actualOutput ?? null;
    return {
        id: `tc-${result.testCase || index + 1}`,
        source: result.source || 'docker',
        testCase: result.testCase || index + 1,
        input: formatValueForDisplay(result.input),
        expected: formatValueForDisplay(expected),
        got: formatValueForDisplay(output),
        output,
        expectedOutput: expected,
        actualOutput: output,
        passed: Boolean(result.passed),
        timedOut: result.error?.toLowerCase?.().includes('timeout') || false,
        error: result.error || null,
        executionTime: result.executionTime || (result.executionTimeMs != null ? `${result.executionTimeMs}ms` : null),
        executionTimeMs: result.executionTimeMs ?? null,
    };
};

const mapProgressStatus = (status) => {
    if (status === 'SOLVED') return ChallengeUserStatus.SOLVED;
    if (status === 'ATTEMPTED') return ChallengeUserStatus.ATTEMPTED;
    return ChallengeUserStatus.UNSOLVED;
};

const normalizeSubmission = (submission) => ({
    submittedAt: submission?.submittedAt || null,
    language: submission?.language || LANGUAGES[0].value,
    code: submission?.code || '',
    passed: Boolean(submission?.passed),
    passedCount: Number(submission?.passedCount || 0),
    total: Number(submission?.total || 0),
    executionTime: submission?.executionTime || '0ms',
    executionTimeMs: submission?.executionTimeMs ?? null,
    memoryAllocated: submission?.memoryAllocated || 'Not available',
    loadTime: submission?.loadTime || '0ms',
    timeComplexity: submission?.timeComplexity || 'Unknown',
    spaceComplexity: submission?.spaceComplexity || 'Unknown',
    aiDetection: submission?.aiDetection || 'MANUAL',
    recommendations: Array.isArray(submission?.recommendations) ? submission.recommendations : [],
    aiAnalysis: submission?.aiAnalysis || null,
    results: Array.isArray(submission?.results) ? submission.results.map(normalizeJudgeResult) : [],
    error: submission?.error || null,
    source: submission?.source || 'docker',
    solveTimeSeconds: Number.isFinite(submission?.solveTimeSeconds) ? Number(submission.solveTimeSeconds) : null,
});

const normalizeProgressEntry = (entry) => {
    const latestSuccessfulSubmission = entry?.latestSuccessfulSubmission ? normalizeSubmission(entry.latestSuccessfulSubmission) : null;
    const latestSubmission = entry?.latestSubmission ? normalizeSubmission(entry.latestSubmission) : null;
    return {
        challengeId: entry.challengeId,
        status: mapProgressStatus(entry.status),
        bestRuntime: latestSuccessfulSubmission?.executionTimeMs ?? null,
        bestMemory: latestSuccessfulSubmission?.memoryAllocated || null,
        earnedXp: Number(entry.xpAwarded || 0),
        failedAttempts: Number(entry.failedAttempts || 0),
        solveTimeSeconds: entry.solveTimeSeconds ?? latestSuccessfulSubmission?.solveTimeSeconds ?? null,
        solvedAt: entry.solvedAt || null,
        latestSubmission,
        latestSuccessfulSubmission,
    };
};

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

const initialState = {
    challenges: [],
    userProgress: [],
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
    judgeAnalysis: null,
    integrityNotice: null,
    elapsedSeconds: 0,
    isTimerRunning: false,
    isPaused: false,
    failedCount: 0,
    hintsUnlocked: 0,
    hint: null,
    error: null,
    isChallengeSolved: false,
    currentSubmission: null,
    submissionHistoryByChallenge: {},
    pasteBlockedAfterReset: false,
    editorSettings: readEditorSettings(),
    isEditorFullscreen: false,
};

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
        case ActionTypes.SET_PROGRESS:
            return { ...state, userProgress: action.payload };
        case ActionTypes.UPSERT_PROGRESS: {
            const index = state.userProgress.findIndex((item) => item.challengeId === action.payload.challengeId);
            if (index < 0) {
                return { ...state, userProgress: [...state.userProgress, action.payload] };
            }
            const next = [...state.userProgress];
            next[index] = { ...next[index], ...action.payload };
            return { ...state, userProgress: next };
        }
        case ActionTypes.SELECT_CHALLENGE: {
            const ch = state.challenges.find((item) => item.id === action.payload);
            if (!ch) return state;
            const progress = state.userProgress.find((item) => item.challengeId === action.payload);
            const solvedSubmission = progress?.latestSuccessfulSubmission || null;
            const starterCode = solvedSubmission?.code || ch.starterCode?.[state.language] || '// Start coding here\n';
            const solved = progress?.status === ChallengeUserStatus.SOLVED;
            return {
                ...state,
                selectedChallengeId: action.payload,
                code: starterCode,
                testResults: solvedSubmission?.results || [],
                executionState: solved ? 'success' : 'idle',
                activeTab: solved ? 1 : 0,
                elapsedSeconds: solved ? Number(progress?.solveTimeSeconds || 0) : 0,
                failedCount: Number(progress?.failedAttempts || 0),
                hintsUnlocked: 0,
                judgeAnalysis: solvedSubmission?.aiAnalysis || null,
                integrityNotice: null,
                hint: null,
                error: null,
                isTimerRunning: !solved,
                isPaused: false,
                isChallengeSolved: solved,
                currentSubmission: solvedSubmission,
                pasteBlockedAfterReset: false,
                isEditorFullscreen: false,
            };
        }
        case ActionTypes.APPLY_CHALLENGE_DETAIL: {
            const entry = action.payload;
            const submissions = Array.isArray(entry?.submissions) ? entry.submissions.map(normalizeSubmission) : [];
            const latestSuccessfulSubmission = [...submissions].reverse().find((item) => item.passed) || null;
            const latestSubmission = submissions.length ? submissions[submissions.length - 1] : null;
            const isSolved = entry?.status === 'SOLVED';
            const progressPayload = normalizeProgressEntry({
                challengeId: entry.challengeId,
                status: entry.status,
                failedAttempts: entry.failedAttempts,
                solveTimeSeconds: entry.solveTimeSeconds,
                xpAwarded: entry.xpAwarded,
                solvedAt: entry.solvedAt,
                latestSubmission,
                latestSuccessfulSubmission,
            });
            const withProgress = challengeReducer(state, { type: ActionTypes.UPSERT_PROGRESS, payload: progressPayload });
            const isCurrentChallenge = state.selectedChallengeId === entry.challengeId;
            if (!isCurrentChallenge) {
                return {
                    ...withProgress,
                    submissionHistoryByChallenge: {
                        ...withProgress.submissionHistoryByChallenge,
                        [entry.challengeId]: submissions,
                    },
                };
            }
            return {
                ...withProgress,
                submissionHistoryByChallenge: {
                    ...withProgress.submissionHistoryByChallenge,
                    [entry.challengeId]: submissions,
                },
                currentSubmission: latestSuccessfulSubmission || latestSubmission,
                isChallengeSolved: isSolved,
                testResults: latestSuccessfulSubmission?.results || withProgress.testResults,
                judgeAnalysis: latestSuccessfulSubmission?.aiAnalysis || withProgress.judgeAnalysis,
                elapsedSeconds: isSolved
                    ? Number((entry.solveTimeSeconds ?? latestSuccessfulSubmission?.solveTimeSeconds ?? withProgress.elapsedSeconds) || 0)
                    : withProgress.elapsedSeconds,
                isTimerRunning: isSolved ? false : withProgress.isTimerRunning,
                executionState: isSolved ? 'success' : withProgress.executionState,
            };
        }
        case ActionTypes.DESELECT_CHALLENGE:
            return {
                ...state,
                selectedChallengeId: null,
                code: '',
                testResults: [],
                executionState: 'idle',
                activeTab: 0,
                elapsedSeconds: 0,
                isTimerRunning: false,
                isPaused: false,
                failedCount: 0,
                hintsUnlocked: 0,
                judgeAnalysis: null,
                integrityNotice: null,
                hint: null,
                error: null,
                isChallengeSolved: false,
                currentSubmission: null,
                pasteBlockedAfterReset: false,
                isEditorFullscreen: false,
            };
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
            return {
                ...state,
                testResults: action.payload.results,
                executionState: action.payload.allPassed ? 'success' : 'failure',
            };
        case ActionTypes.SET_RUNNING:
            return { ...state, isRunning: action.payload, executionState: action.payload ? 'running' : state.executionState };
        case ActionTypes.SET_SUBMITTING:
            return { ...state, isSubmitting: action.payload };
        case ActionTypes.CLEAR_RESULTS:
            return { ...state, testResults: [], executionState: 'idle' };
        case ActionTypes.SET_JUDGE_ANALYSIS:
            return { ...state, judgeAnalysis: action.payload };
        case ActionTypes.SET_INTEGRITY_NOTICE:
            return { ...state, integrityNotice: action.payload };
        case ActionTypes.SET_ERROR:
            return { ...state, error: action.payload };
        case ActionTypes.INCREMENT_FAILED:
            return { ...state, failedCount: state.failedCount + 1 };
        case ActionTypes.SET_HINTS_UNLOCKED:
            return { ...state, hintsUnlocked: action.payload };
        case ActionTypes.SET_HINT:
            return { ...state, hint: action.payload };
        case ActionTypes.UPDATE_TIME:
            return { ...state, elapsedSeconds: action.payload };
        case ActionTypes.SET_TIMER_RUNNING:
            return { ...state, isTimerRunning: action.payload };
        case ActionTypes.SET_PAUSED:
            return { ...state, isPaused: action.payload };
        case ActionTypes.RESET_WORKSPACE: {
            const ch = state.challenges.find(c => c.id === state.selectedChallengeId);
            const starterCode = ch?.starterCode?.[state.language] || '// Start coding here\n';
            return {
                ...state,
                code: starterCode,
                testResults: [],
                executionState: 'idle',
                elapsedSeconds: 0,
                isTimerRunning: !state.isChallengeSolved,
                isPaused: false,
                failedCount: 0,
                hint: null,
                error: null,
                judgeAnalysis: null,
                integrityNotice: null,
            };
        }
        case ActionTypes.SET_PASTE_BLOCKED:
            return { ...state, pasteBlockedAfterReset: action.payload };
        case ActionTypes.SET_EDITOR_SETTINGS:
            return { ...state, editorSettings: { ...state.editorSettings, ...action.payload } };
        case ActionTypes.SET_EDITOR_FULLSCREEN:
            return { ...state, isEditorFullscreen: action.payload };
        case ActionTypes.SET_CHALLENGE_SOLVED:
            return {
                ...state,
                isChallengeSolved: true,
                isTimerRunning: false,
                isPaused: false,
                currentSubmission: action.payload,
                activeTab: 1,
                executionState: 'success',
            };
        case ActionTypes.RESET_FEATURE_STATE:
            return {
                ...initialState,
                isLoadingChallenges: false,
                isLoadingStats: false,
                editorSettings: state.editorSettings,
            };
        default:
            return state;
    }
}

const ChallengeContext = createContext(null);

export const ChallengeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(challengeReducer, initialState);
    const location = useLocation();
    const { isLoggedIn, isAuthLoading, updateCurrentUser } = useAuth();
    const isChallengesRoute = location.pathname === '/challenges' || location.pathname.startsWith('/challenges/');

    useEffect(() => {
        const shouldLoadData = isChallengesRoute && isLoggedIn && !isAuthLoading;
        if (!shouldLoadData) {
            dispatch({ type: ActionTypes.RESET_FEATURE_STATE });
            return;
        }

        let cancelled = false;
        const loadData = async () => {
            dispatch({ type: ActionTypes.SET_LOADING, payload: true });
            try {
                const [apiChallenges, stats, progressRes] = await Promise.all([
                    challengeService.getPublished(),
                    fetchRankStats(),
                    judgeService.getProgress(),
                ]);

                if (cancelled) return;

                dispatch({
                    type: ActionTypes.SET_CHALLENGES,
                    payload: Array.isArray(apiChallenges) ? apiChallenges.map(transformChallenge) : [],
                });

                dispatch({
                    type: ActionTypes.SET_USER_STATS,
                    payload: stats || { rank: null, xp: 0, nextRankXp: 500, progressPercentage: 0, streak: 0, isMaxRank: false },
                });

                const normalizedProgress = Array.isArray(progressRes?.progress)
                    ? progressRes.progress.map(normalizeProgressEntry)
                    : [];
                dispatch({ type: ActionTypes.SET_PROGRESS, payload: normalizedProgress });
            } catch (error) {
                console.error('Failed to load challenge feature data:', error);
                if (!cancelled) {
                    dispatch({ type: ActionTypes.SET_CHALLENGES, payload: [] });
                    dispatch({
                        type: ActionTypes.SET_USER_STATS,
                        payload: { rank: null, xp: 0, nextRankXp: 500, progressPercentage: 0, streak: 0, isMaxRank: false },
                    });
                    dispatch({ type: ActionTypes.SET_PROGRESS, payload: [] });
                }
            }
        };

        loadData();
        return () => { cancelled = true; };
    }, [isChallengesRoute, isLoggedIn, isAuthLoading]);

    const selectedChallenge = useMemo(
        () => state.challenges.find(c => c.id === state.selectedChallengeId) || null,
        [state.challenges, state.selectedChallengeId],
    );

    const getUserProgress = useCallback(
        (challengeId) => state.userProgress.find(p => p.challengeId === challengeId) || null,
        [state.userProgress],
    );

    const syncChallengeDetail = useCallback(async (challengeId) => {
        try {
            const detail = await judgeService.getChallengeProgress(challengeId);
            dispatch({ type: ActionTypes.APPLY_CHALLENGE_DETAIL, payload: detail });
        } catch (error) {
            console.error('Failed to fetch challenge progress detail:', error);
        }
    }, []);

    const selectChallenge = useCallback((id) => {
        dispatch({ type: ActionTypes.SELECT_CHALLENGE, payload: id });
        syncChallengeDetail(id);
    }, [syncChallengeDetail]);

    const deselectChallenge = useCallback(() => dispatch({ type: ActionTypes.DESELECT_CHALLENGE }), []);
    const setCode = useCallback((code) => dispatch({ type: ActionTypes.SET_CODE, payload: code }), []);
    const setLanguage = useCallback((lang) => dispatch({ type: ActionTypes.SET_LANGUAGE, payload: lang }), []);
    const setActiveTab = useCallback((idx) => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: idx }), []);
    const clearResults = useCallback(() => dispatch({ type: ActionTypes.CLEAR_RESULTS }), []);
    const setRunning = useCallback((value) => dispatch({ type: ActionTypes.SET_RUNNING, payload: value }), []);
    const setSubmitting = useCallback((value) => dispatch({ type: ActionTypes.SET_SUBMITTING, payload: value }), []);

    const pauseSession = useCallback(() => dispatch({ type: ActionTypes.SET_PAUSED, payload: true }), []);
    const resumeSession = useCallback(() => dispatch({ type: ActionTypes.SET_PAUSED, payload: false }), []);

    const setEditorSettings = useCallback((settingsPatch) => {
        const merged = {
            ...state.editorSettings,
            ...settingsPatch,
            fontSize: Math.min(28, Math.max(12, Number(settingsPatch?.fontSize ?? state.editorSettings.fontSize))),
        };
        localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(merged));
        dispatch({ type: ActionTypes.SET_EDITOR_SETTINGS, payload: merged });
    }, [state.editorSettings]);

    const setEditorFullscreen = useCallback((value) => {
        dispatch({ type: ActionTypes.SET_EDITOR_FULLSCREEN, payload: value });
    }, []);

    const resetWorkspace = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_WORKSPACE });
        dispatch({ type: ActionTypes.SET_PASTE_BLOCKED, payload: true });
    }, []);

    const submitSolution = useCallback(async (mode = 'submit') => {
        if (!state.selectedChallengeId || state.isSubmitting || state.isRunning) {
            return { blocked: true };
        }

        if (!state.code.trim()) {
            return { blocked: true, reason: 'empty' };
        }

        if (state.isPaused) {
            return { blocked: true, reason: 'paused' };
        }

        if (mode === 'submit' && state.isChallengeSolved) {
            return { blocked: true, reason: 'solved' };
        }

        dispatch({ type: ActionTypes.SET_ERROR, payload: null });
        dispatch({ type: mode === 'run' ? ActionTypes.SET_RUNNING : ActionTypes.SET_SUBMITTING, payload: true });

        try {
            const res = await judgeService.submitSolution({
                challengeId: state.selectedChallengeId,
                userCode: state.code,
                language: state.language,
                solveTimeSeconds: state.elapsedSeconds,
                elapsedMinutes: Math.floor(state.elapsedSeconds / 60),
                failedCount: state.failedCount,
                hintsUnlocked: state.hintsUnlocked,
                mode,
            });

            if (res?.alreadySolved) {
                const previousSubmission = res?.previousSubmission ? normalizeSubmission(res.previousSubmission) : null;
                if (previousSubmission) {
                    dispatch({ type: ActionTypes.SET_CHALLENGE_SOLVED, payload: previousSubmission });
                    dispatch({ type: ActionTypes.SET_TEST_RESULTS, payload: { results: previousSubmission.results || [], allPassed: true } });
                    dispatch({ type: ActionTypes.SET_JUDGE_ANALYSIS, payload: previousSubmission.aiAnalysis || null });
                }
                dispatch({ type: ActionTypes.SET_TIMER_RUNNING, payload: false });
                return { success: true, alreadySolved: true };
            }

            const normalizedResults = Array.isArray(res?.results)
                ? res.results.map((result, index) => normalizeJudgeResult(result, index))
                : [];
            const executionSucceeded = Boolean(res?.success);
            const allPassed = Boolean(res?.passed);

            dispatch({ type: ActionTypes.SET_TEST_RESULTS, payload: { results: normalizedResults, allPassed } });
            dispatch({ type: ActionTypes.SET_JUDGE_ANALYSIS, payload: res?.submissionDetails?.aiAnalysis || res?.aiAnalysis || null });
            dispatch({ type: ActionTypes.SET_INTEGRITY_NOTICE, payload: res?.integrityNotice || null });

            if (!executionSucceeded && res?.error) {
                dispatch({ type: ActionTypes.SET_ERROR, payload: { ...res.error, source: res.source || 'docker' } });
            } else if (!allPassed) {
                dispatch({ type: ActionTypes.INCREMENT_FAILED });
            }

            if (mode === 'submit') {
                await syncChallengeDetail(state.selectedChallengeId);
            }

            if (mode === 'submit' && allPassed) {
                const submission = res?.submissionDetails ? normalizeSubmission(res.submissionDetails) : null;
                if (submission) {
                    dispatch({ type: ActionTypes.SET_CHALLENGE_SOLVED, payload: submission });
                }
                dispatch({ type: ActionTypes.SET_TIMER_RUNNING, payload: false });

                try {
                    const stats = await fetchRankStats();
                    if (stats) {
                        dispatch({ type: ActionTypes.SET_USER_STATS, payload: stats });
                        updateCurrentUser?.({ rank: stats.rank, xp: stats.xp });
                    }
                } catch (statsError) {
                    console.error('Failed to refresh rank stats after solve:', statsError);
                }
            }

            return { success: allPassed, result: res };
        } catch (err) {
            console.error('Submission failed:', err);
            dispatch({ type: ActionTypes.SET_ERROR, payload: { message: 'Submission failed. Check console or backend logs.', type: 'NetworkError' } });
            return { success: false, error: err };
        } finally {
            dispatch({ type: mode === 'run' ? ActionTypes.SET_RUNNING : ActionTypes.SET_SUBMITTING, payload: false });
        }
    }, [
        state.selectedChallengeId,
        state.isSubmitting,
        state.isRunning,
        state.code,
        state.isPaused,
        state.isChallengeSolved,
        state.language,
        state.elapsedSeconds,
        state.failedCount,
        state.hintsUnlocked,
        syncChallengeDetail,
        updateCurrentUser,
    ]);

    const requestHint = useCallback(async () => {
        if (!state.selectedChallengeId) return;
        try {
            const res = await judgeService.requestHint(
                state.selectedChallengeId,
                state.elapsedSeconds,
                state.failedCount,
                state.hintsUnlocked,
            );
            if (res && res.unlocked) {
                dispatch({ type: ActionTypes.SET_HINT, payload: res.hint });
                dispatch({ type: ActionTypes.SET_HINTS_UNLOCKED, payload: state.hintsUnlocked + 1 });
            }
        } catch (err) {
            console.error('Hint request failed:', err);
        }
    }, [state.selectedChallengeId, state.elapsedSeconds, state.failedCount, state.hintsUnlocked]);

    useEffect(() => {
        if (!state.selectedChallengeId) return;
        if (!state.isTimerRunning || state.isPaused || state.isChallengeSolved) return;
        const interval = setInterval(() => {
            dispatch({ type: ActionTypes.UPDATE_TIME, payload: state.elapsedSeconds + 1 });
        }, 1000);
        return () => clearInterval(interval);
    }, [state.selectedChallengeId, state.isTimerRunning, state.isPaused, state.isChallengeSolved, state.elapsedSeconds]);

    useEffect(() => {
        if (!state.selectedChallengeId) return;
        const solved = getUserProgress(state.selectedChallengeId)?.status === ChallengeUserStatus.SOLVED;
        dispatch({ type: ActionTypes.SET_TIMER_RUNNING, payload: !solved });
    }, [state.selectedChallengeId, state.userProgress, getUserProgress]);

    const rankMeta = useMemo(() => {
        const r = state.user.rank;
        return r ? (RANK_META[r] ?? RANK_META[Rank.BRONZE]) : null;
    }, [state.user.rank]);

    const xpToNextRank = useMemo(() => state.user.nextRankXp ?? rankMeta?.xpCeil ?? 500, [state.user.nextRankXp, rankMeta]);
    const progressPercent = useMemo(
        () => state.user.progressPercentage ?? Math.min(100, Math.round((state.user.xp / xpToNextRank) * 100)),
        [state.user.progressPercentage, state.user.xp, xpToNextRank],
    );
    const recommendedDifficulties = useMemo(() => state.user.rank ? (RANK_RECOMMENDATIONS[state.user.rank] || []) : [], [state.user.rank]);
    const isRecommended = useCallback((challenge) => recommendedDifficulties.includes(challenge.difficulty), [recommendedDifficulties]);

    const hintAvailable = useMemo(() => {
        if (!state.selectedChallengeId) return false;
        return state.failedCount >= 3 || Math.floor(state.elapsedSeconds / 60) >= 5;
    }, [state.selectedChallengeId, state.elapsedSeconds, state.failedCount]);

    const value = useMemo(() => ({
        ...state,
        selectedChallenge,
        elapsedMinutes: Math.floor(state.elapsedSeconds / 60),
        getUserProgress,
        rankMeta,
        xpToNextRank,
        progressPercent,
        recommendedDifficulties,
        isRecommended,
        isEditorLocked: state.isPaused || state.isChallengeSolved,
        selectChallenge,
        deselectChallenge,
        setCode,
        setLanguage,
        setActiveTab,
        clearResults,
        setRunning,
        setSubmitting,
        submitSolution,
        requestHint,
        hintAvailable,
        pauseSession,
        resumeSession,
        resetWorkspace,
        setEditorSettings,
        setEditorFullscreen,
        syncChallengeDetail,
    }), [
        state,
        selectedChallenge,
        getUserProgress,
        rankMeta,
        xpToNextRank,
        progressPercent,
        recommendedDifficulties,
        isRecommended,
        selectChallenge,
        deselectChallenge,
        setCode,
        setLanguage,
        setActiveTab,
        clearResults,
        setRunning,
        setSubmitting,
        submitSolution,
        requestHint,
        hintAvailable,
        pauseSession,
        resumeSession,
        resetWorkspace,
        setEditorSettings,
        setEditorFullscreen,
        syncChallengeDetail,
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


