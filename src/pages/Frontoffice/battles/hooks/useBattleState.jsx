/**
 * useBattleState — Context-based battle state management
 * =======================================================
 * Centralised store for the entire battle lifecycle.
 *
 * Exported:
 *   • BattleProvider  – wrap around routes that need battle state
 *   • useBattleState  – hook to consume state + dispatch actions
 */
import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    BattleStatus,
    BattleMode,
    RoundStatus,
    RoundResult,
    Difficulty,
    createBattle,
    createRound,
    getTotalPlayerScore,
    getTotalOpponentScore,
    getProgressPercent,
} from '../types/battle.types';
import { battlesService } from '../../../../services/battlesService';
import { challengeService } from '../../../../services/challengeService';
import { useAuth } from '../../auth/context/AuthContext';

// ─── Initial State ──────────────────────────────────────

const initialState = {
    battles: [],
    selectedBattleId: null,

    isLoading: false,
    error: '',
    challenges: [],

    // Create-battle modal flow
    createModal: {
        isOpen: false,
        step: 1,         // 1 = mode, 2 = configure, 3 = confirm
        mode: null,
        totalRounds: 5,
        difficulty: Difficulty.MEDIUM,
        timeLimit: 900,
        challengeType: '',
    },

    // Timer (for active battle simulation)
    timer: {
        remaining: 0,     // seconds
        isRunning: false,
    },
};

// ─── Action Types ───────────────────────────────────────

const ActionTypes = {
    SELECT_BATTLE: 'SELECT_BATTLE',
    DESELECT_BATTLE: 'DESELECT_BATTLE',

    // Create modal
    OPEN_CREATE_MODAL: 'OPEN_CREATE_MODAL',
    CLOSE_CREATE_MODAL: 'CLOSE_CREATE_MODAL',
    SET_CREATE_STEP: 'SET_CREATE_STEP',
    SET_CREATE_MODE: 'SET_CREATE_MODE',
    SET_CREATE_CONFIG: 'SET_CREATE_CONFIG',
    CONFIRM_CREATE_BATTLE: 'CONFIRM_CREATE_BATTLE',

    // Battle lifecycle
    CANCEL_BATTLE: 'CANCEL_BATTLE',
    ACTIVATE_BATTLE: 'ACTIVATE_BATTLE',     // WAITING → ACTIVE
    START_ROUND: 'START_ROUND',             // mark round IN_PROGRESS
    COMPLETE_ROUND: 'COMPLETE_ROUND',       // finish current round
    COMPLETE_BATTLE: 'COMPLETE_BATTLE',     // mark battle COMPLETED

    // Timer
    SET_TIMER: 'SET_TIMER',
    TICK_TIMER: 'TICK_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_BATTLES: 'SET_BATTLES',
    SET_CHALLENGES: 'SET_CHALLENGES',
};

// ─── Reducer ────────────────────────────────────────────

function battleReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case ActionTypes.SET_ERROR:
            return { ...state, error: action.payload };

        case ActionTypes.SET_BATTLES:
            return { ...state, battles: action.payload };

        case ActionTypes.SET_CHALLENGES:
            return { ...state, challenges: action.payload };

        // ── Selection ────────────────────────────────────
        case ActionTypes.SELECT_BATTLE:
            return { ...state, selectedBattleId: action.payload };

        case ActionTypes.DESELECT_BATTLE:
            return { ...state, selectedBattleId: null };

        // ── Create Modal ─────────────────────────────────
        case ActionTypes.OPEN_CREATE_MODAL:
            return {
                ...state,
                createModal: { ...initialState.createModal, isOpen: true },
            };

        case ActionTypes.CLOSE_CREATE_MODAL:
            return {
                ...state,
                createModal: { ...initialState.createModal, isOpen: false },
            };

        case ActionTypes.SET_CREATE_STEP:
            return {
                ...state,
                createModal: { ...state.createModal, step: action.payload },
            };

        case ActionTypes.SET_CREATE_MODE:
            return {
                ...state,
                createModal: { ...state.createModal, mode: action.payload },
            };

        case ActionTypes.SET_CREATE_CONFIG:
            return {
                ...state,
                createModal: { ...state.createModal, ...action.payload },
            };

        case ActionTypes.CONFIRM_CREATE_BATTLE: {
            const { mode, totalRounds, difficulty, timeLimit } = state.createModal;
            const newBattle = createBattle({ mode, totalRounds, difficulty, timeLimit });

            // If AI mode, immediately assign AI opponent and set ACTIVE
            if (mode === BattleMode.ONE_VS_AI) {
                newBattle.status = BattleStatus.ACTIVE;
                newBattle.opponent = {
                    id: 'ai-auto',
                    name: 'AI Master',
                    avatar: null,
                    level: difficulty === Difficulty.HARD ? 60 : difficulty === Difficulty.EASY ? 30 : 50,
                    league: 'AI League',
                };
                newBattle.currentRoundIndex = 0;
                newBattle.rounds[0].status = RoundStatus.IN_PROGRESS;
            }

            // Assign random challenges from the pool if available
            if (state.challenges.length > 0) {
                newBattle.rounds = newBattle.rounds.map((round, i) => ({
                    ...round,
                    challenge: state.challenges[i % state.challenges.length],
                    difficulty,
                }));
            }

            return {
                ...state,
                battles: [newBattle, ...state.battles],
                createModal: { ...initialState.createModal, isOpen: false },
            };
        }

        // ── Battle Lifecycle ─────────────────────────────
        case ActionTypes.CANCEL_BATTLE:
            return {
                ...state,
                battles: state.battles.map(b =>
                    b.id === action.payload
                        ? { ...b, status: BattleStatus.CANCELLED }
                        : b
                ),
            };

        case ActionTypes.ACTIVATE_BATTLE: {
            return {
                ...state,
                battles: state.battles.map(b => {
                    if (b.id !== action.payload) return b;
                    const updated = { ...b, status: BattleStatus.ACTIVE, currentRoundIndex: 0 };
                    updated.opponent = {
                        id: 'user-rand',
                        name: 'Challenger_' + Math.floor(Math.random() * 999),
                        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
                        level: 30 + Math.floor(Math.random() * 20),
                        league: 'Silver League',
                    };
                    updated.rounds = updated.rounds.map((r, i) =>
                        i === 0 ? { ...r, status: RoundStatus.IN_PROGRESS } : r
                    );
                    return updated;
                }),
            };
        }

        case ActionTypes.START_ROUND: {
            const { battleId, roundIndex } = action.payload;
            return {
                ...state,
                battles: state.battles.map(b => {
                    if (b.id !== battleId) return b;
                    return {
                        ...b,
                        status: BattleStatus.LIVE,
                        currentRoundIndex: roundIndex,
                        rounds: b.rounds.map((r, i) =>
                            i === roundIndex ? { ...r, status: RoundStatus.IN_PROGRESS } : r
                        ),
                    };
                }),
            };
        }

        case ActionTypes.COMPLETE_ROUND: {
            const { battleId, roundIndex, playerScore, opponentScore, timeSpent, efficiency } = action.payload;
            const result = playerScore >= opponentScore ? RoundResult.WON : RoundResult.LOST;

            return {
                ...state,
                battles: state.battles.map(b => {
                    if (b.id !== battleId) return b;
                    const updatedRounds = b.rounds.map((r, i) => {
                        if (i !== roundIndex) return r;
                        return {
                            ...r,
                            status: RoundStatus.COMPLETED,
                            result,
                            playerScore,
                            opponentScore,
                            timeSpent,
                            efficiency,
                        };
                    });

                    // Check if next round exists
                    const nextIndex = roundIndex + 1;
                    const isLastRound = nextIndex >= b.totalRounds;

                    if (!isLastRound) {
                        updatedRounds[nextIndex] = {
                            ...updatedRounds[nextIndex],
                            status: RoundStatus.IN_PROGRESS,
                        };
                    }

                    return {
                        ...b,
                        rounds: updatedRounds,
                        currentRoundIndex: isLastRound ? roundIndex : nextIndex,
                        status: isLastRound ? BattleStatus.COMPLETED : BattleStatus.LIVE,
                        completedAt: isLastRound ? new Date() : null,
                    };
                }),
            };
        }

        case ActionTypes.COMPLETE_BATTLE:
            return {
                ...state,
                battles: state.battles.map(b =>
                    b.id === action.payload
                        ? { ...b, status: BattleStatus.COMPLETED, completedAt: new Date() }
                        : b
                ),
            };

        // ── Timer ────────────────────────────────────────
        case ActionTypes.SET_TIMER:
            return {
                ...state,
                timer: { remaining: action.payload, isRunning: true },
            };

        case ActionTypes.TICK_TIMER:
            return {
                ...state,
                timer: {
                    ...state.timer,
                    remaining: Math.max(0, state.timer.remaining - 1),
                    isRunning: state.timer.remaining > 1,
                },
            };

        case ActionTypes.STOP_TIMER:
            return {
                ...state,
                timer: { remaining: 0, isRunning: false },
            };

        default:
            return state;
    }
}

// ─── Context ────────────────────────────────────────────

const BattleContext = createContext(null);

export function BattleProvider({ children }) {
    const [state, dispatch] = useReducer(battleReducer, initialState);
    const { currentUser } = useAuth();
    const timerRef = useRef(null);

    const challengesById = useMemo(() => {
        return state.challenges.reduce((acc, ch) => {
            if (ch?._id) acc[ch._id] = ch;
            return acc;
        }, {});
    }, [state.challenges]);

    const resolveChallengeType = useCallback((challenge) => {
        if (!challenge) return '';
        if (challenge?.type) return challenge.type;
        if (Array.isArray(challenge?.tags) && challenge.tags.length > 0) return challenge.tags[0];
        if (challenge?.difficulty) return challenge.difficulty;
        return '';
    }, []);

    const filterChallengesByType = useCallback((type) => {
        if (!type) return state.challenges;
        return state.challenges.filter((challenge) => {
            const matchesType = challenge?.type === type;
            const matchesTag = Array.isArray(challenge?.tags) && challenge.tags.includes(type);
            const matchesDifficulty = challenge?.difficulty === type;
            return matchesType || matchesTag || matchesDifficulty;
        });
    }, [state.challenges]);

    const mapStatus = (status) => {
        if (status === 'FINISHED') return BattleStatus.COMPLETED;
        if (status === 'PENDING') return BattleStatus.WAITING;
        if (status === 'CANCELLED') return BattleStatus.CANCELLED;
        return BattleStatus.ACTIVE;
    };

    const mapMode = (battleType) => (battleType === '1VSBOT' ? BattleMode.ONE_VS_AI : BattleMode.ONE_VS_ONE);

    const mapChallenge = (challengeId) => {
        const challenge = challengesById[challengeId];
        if (!challenge) return null;
        return {
            title: challenge.title,
            description: challenge.description,
            tags: Array.isArray(challenge.tags) ? challenge.tags : [],
            example: challenge.examples?.[0] || { input: '', output: '', explanation: '' },
            maxPoints: challenge.xpReward || 500,
        };
    };

    const mapBattleFromApi = (battle) => {
        const mode = mapMode(battle?.battleType);
        const status = mapStatus(battle?.battleStatus);
        const totalRounds = Math.max(1, Number(battle?.roundNumber) || 1);
        const baseChallenge = mapChallenge(battle?.challengeId);
        const typePool = filterChallengesByType(battle?.selectChallengeType || '');
        const rounds = Array.from({ length: totalRounds }, (_, i) => {
            const fallback = baseChallenge || mapChallenge(typePool[i % Math.max(1, typePool.length)]?._id);
            const round = createRound(i, fallback || undefined);
            if (status === BattleStatus.COMPLETED) {
                round.status = RoundStatus.COMPLETED;
                round.result = RoundResult.DRAW;
            } else if (status === BattleStatus.ACTIVE && i === 0) {
                round.status = RoundStatus.IN_PROGRESS;
            }
            return round;
        });

        const opponentName = battle?.opponentId || (mode === BattleMode.ONE_VS_AI ? 'AI Master' : 'Opponent');
        const opponent = battle?.opponentId || mode === BattleMode.ONE_VS_AI
            ? {
                id: battle?.opponentId || 'ai-auto',
                name: opponentName,
                avatar: null,
                level: 50,
                league: mode === BattleMode.ONE_VS_AI ? 'AI League' : 'Silver League',
            }
            : null;

        return {
            id: battle?._id || battle?.idBattle || battle?.id,
            mode,
            status,
            totalRounds,
            currentRoundIndex: status === BattleStatus.ACTIVE ? 0 : status === BattleStatus.COMPLETED ? totalRounds - 1 : -1,
            rounds,
            player: {
                id: currentUser?.userId || currentUser?._id || currentUser?.id || 'me',
                name: currentUser?.username || currentUser?.email || 'You',
                avatar: currentUser?.avatar || null,
                level: currentUser?.level || 42,
                league: 'Gold League',
            },
            opponent,
            createdAt: battle?.createdAt ? new Date(battle.createdAt) : new Date(),
            completedAt: battle?.endedAt ? new Date(battle.endedAt) : null,
            timeLimit: 900,
            difficulty: Difficulty.MEDIUM,
        };
    };

    // Timer tick effect
    useEffect(() => {
        if (state.timer.isRunning) {
            timerRef.current = setInterval(() => {
                dispatch({ type: ActionTypes.TICK_TIMER });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [state.timer.isRunning]);

    const refreshChallenges = useCallback(async () => {
        try {
            const resp = await challengeService.getPublished({ sort: 'newest' });
            const list = Array.isArray(resp) ? resp : Array.isArray(resp?.data) ? resp.data : [];
            dispatch({ type: ActionTypes.SET_CHALLENGES, payload: list });
        } catch (err) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: err?.message || 'Failed to load challenges' });
        }
    }, []);

    const refreshBattles = useCallback(async () => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.SET_ERROR, payload: '' });
        try {
            const resp = await battlesService.getAll();
            const list = Array.isArray(resp?.battles) ? resp.battles : Array.isArray(resp) ? resp : [];
            const mapped = list.map(mapBattleFromApi);
            dispatch({ type: ActionTypes.SET_BATTLES, payload: mapped });
        } catch (err) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: err?.message || 'Failed to load battles' });
        } finally {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
    }, [currentUser, challengesById]);

    useEffect(() => {
        refreshChallenges();
    }, [refreshChallenges]);

    useEffect(() => {
        refreshBattles();
    }, [refreshBattles, state.challenges.length]);

    // ── Action creators ────────────────────────────────

    const selectBattle = useCallback((id) => {
        dispatch({ type: ActionTypes.SELECT_BATTLE, payload: id });
    }, []);

    const deselectBattle = useCallback(() => {
        dispatch({ type: ActionTypes.DESELECT_BATTLE });
    }, []);

    const openCreateModal = useCallback(() => {
        dispatch({ type: ActionTypes.OPEN_CREATE_MODAL });
    }, []);

    const closeCreateModal = useCallback(() => {
        dispatch({ type: ActionTypes.CLOSE_CREATE_MODAL });
    }, []);

    const setCreateStep = useCallback((step) => {
        dispatch({ type: ActionTypes.SET_CREATE_STEP, payload: step });
    }, []);

    const setCreateMode = useCallback((mode) => {
        dispatch({ type: ActionTypes.SET_CREATE_MODE, payload: mode });
    }, []);

    const setCreateConfig = useCallback((config) => {
        dispatch({ type: ActionTypes.SET_CREATE_CONFIG, payload: config });
    }, []);

    const confirmCreateBattle = useCallback(async () => {
        const { mode, totalRounds, difficulty, challengeType } = state.createModal;
        const pool = filterChallengesByType(challengeType);
        const assigned = Array.from({ length: totalRounds }, (_, idx) => pool[idx % Math.max(1, pool.length)]);
        const primary = assigned[0];

        if (!primary?._id) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: 'No challenges available for the selected type.' });
            return;
        }

        const payload = {
            userId: currentUser?.userId || currentUser?._id || currentUser?.id || currentUser?.username,
            opponentId: mode === BattleMode.ONE_VS_AI ? 'AI-1' : null,
            roundNumber: totalRounds,
            battleStatus: 'ACTIVE',
            challengeId: primary?._id,
            selectChallengeType: challengeType || resolveChallengeType(primary) || difficulty,
            battleType: mode === BattleMode.ONE_VS_AI ? '1VSBOT' : '1VS1',
        };

        try {
            await battlesService.create(payload);
            dispatch({ type: ActionTypes.CLOSE_CREATE_MODAL });
            await refreshBattles();
        } catch (err) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: err?.message || 'Failed to create battle' });
        }
    }, [state.createModal, currentUser, refreshBattles, filterChallengesByType, resolveChallengeType]);

    const cancelBattle = useCallback(async (id) => {
        try {
            await battlesService.update(id, { battleStatus: 'CANCELLED' });
            await refreshBattles();
        } catch (err) {
            dispatch({ type: ActionTypes.SET_ERROR, payload: err?.message || 'Failed to cancel battle' });
        }
    }, [refreshBattles]);

    const activateBattle = useCallback((id) => {
        dispatch({ type: ActionTypes.ACTIVATE_BATTLE, payload: id });
    }, []);

    const startRound = useCallback((battleId, roundIndex) => {
        dispatch({ type: ActionTypes.START_ROUND, payload: { battleId, roundIndex } });
    }, []);

    const completeRound = useCallback((payload) => {
        dispatch({ type: ActionTypes.COMPLETE_ROUND, payload });
    }, []);

    const completeBattle = useCallback((id) => {
        dispatch({ type: ActionTypes.COMPLETE_BATTLE, payload: id });
    }, []);

    const startTimer = useCallback((seconds) => {
        dispatch({ type: ActionTypes.SET_TIMER, payload: seconds });
    }, []);

    const stopTimer = useCallback(() => {
        dispatch({ type: ActionTypes.STOP_TIMER });
    }, []);

    // ── Simulate completing a round (demo purposes) ───

    const simulateCompleteRound = useCallback((battleId) => {
        const battle = state.battles.find(b => b.id === battleId);
        if (!battle) return;
        const roundIndex = battle.currentRoundIndex;
        if (roundIndex < 0 || roundIndex >= battle.totalRounds) return;

        const playerScore = 300 + Math.floor(Math.random() * 250);
        const opponentScore = 250 + Math.floor(Math.random() * 250);
        const mins = 5 + Math.floor(Math.random() * 8);
        const secs = Math.floor(Math.random() * 60);
        const timeSpent = `${mins}:${secs.toString().padStart(2, '0')}`;
        const efficiency = 60 + Math.floor(Math.random() * 35);

        completeRound({
            battleId,
            roundIndex,
            playerScore,
            opponentScore,
            timeSpent,
            efficiency,
        });
    }, [state.battles, completeRound]);

    // ── Derived: selected battle ──────────────────────

    const currentBattle = state.battles.find(b => b.id === state.selectedBattleId) || null;

    const value = {
        ...state,
        currentBattle,

        // Actions
        selectBattle,
        deselectBattle,
        openCreateModal,
        closeCreateModal,
        setCreateStep,
        setCreateMode,
        setCreateConfig,
        confirmCreateBattle,
        cancelBattle,
        activateBattle,
        startRound,
        completeRound,
        completeBattle,
        startTimer,
        stopTimer,
        simulateCompleteRound,
        refreshBattles,
        refreshChallenges,
    };

    return (
        <BattleContext.Provider value={value}>
            {children}
        </BattleContext.Provider>
    );
}

export function useBattleState() {
    const ctx = useContext(BattleContext);
    if (!ctx) {
        throw new Error('useBattleState must be used within a BattleProvider');
    }
    return ctx;
}

export default useBattleState;
