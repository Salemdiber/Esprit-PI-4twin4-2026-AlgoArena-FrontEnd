/**
 * Mock Battle Data
 * =================
 * Realistic seed data used for initial rendering and demo flow.
 */
import {
    BattleStatus,
    BattleMode,
    Difficulty,
    RoundStatus,
    RoundResult,
} from '../types/battle.types';

const challenges = [
    {
        title: 'Two Sum Problem',
        description: 'Given an array of integers and a target, return indices of the two numbers that add up to the target.',
        tags: ['ARRAYS', 'HASH MAP'],
        example: {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0, 1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        maxPoints: 500,
    },
    {
        title: 'Maximum Subarray Sum',
        description: 'Given an integer array, find the contiguous subarray which has the largest sum and return its sum. Implement an efficient solution with optimal time complexity.',
        tags: ['ARRAYS', 'DYNAMIC PROGRAMMING'],
        example: {
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: '[4,-1,2,1] has the largest sum = 6.',
        },
        maxPoints: 500,
    },
    {
        title: 'Binary Tree Traversal',
        description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values efficiently.',
        tags: ['TREES', 'RECURSION'],
        example: {
            input: 'root = [1,null,2,3]',
            output: '[1,3,2]',
            explanation: 'Inorder traversal visits left, root, right.',
        },
        maxPoints: 500,
    },
    {
        title: 'Valid Parentheses',
        description: 'Given a string containing just the characters (){}[], determine if the input string is valid.',
        tags: ['STACK', 'STRINGS'],
        example: {
            input: 's = "()[]{}"',
            output: 'true',
            explanation: 'All brackets are properly closed in order.',
        },
        maxPoints: 500,
    },
    {
        title: 'Merge K Sorted Lists',
        description: 'You are given an array of k linked-lists, each sorted in ascending order. Merge all lists into one sorted linked-list.',
        tags: ['LINKED LIST', 'HEAP'],
        example: {
            input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
            output: '[1,1,2,3,4,4,5,6]',
            explanation: 'Merge all three sorted lists into a single sorted list.',
        },
        maxPoints: 500,
    },
];

/** Completed battle – 5 rounds finished */
const completedBattle = {
    id: 'battle-1',
    mode: BattleMode.ONE_VS_ONE,
    status: BattleStatus.COMPLETED,
    totalRounds: 5,
    currentRoundIndex: 4,
    player: {
        id: 'user-1',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        level: 42,
        league: 'Gold League',
    },
    opponent: {
        id: 'user-2',
        name: 'AlgoNinja',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
        level: 39,
        league: 'Gold League',
    },
    rounds: [
        {
            index: 0, status: RoundStatus.COMPLETED, result: RoundResult.WON,
            difficulty: Difficulty.MEDIUM, challenge: challenges[0],
            playerScore: 520, opponentScore: 410, timeSpent: '6:42', efficiency: 95,
        },
        {
            index: 1, status: RoundStatus.COMPLETED, result: RoundResult.WON,
            difficulty: Difficulty.HARD, challenge: challenges[1],
            playerScore: 480, opponentScore: 390, timeSpent: '8:15', efficiency: 88,
        },
        {
            index: 2, status: RoundStatus.COMPLETED, result: RoundResult.LOST,
            difficulty: Difficulty.MEDIUM, challenge: challenges[2],
            playerScore: 380, opponentScore: 460, timeSpent: '9:30', efficiency: 72,
        },
        {
            index: 3, status: RoundStatus.COMPLETED, result: RoundResult.WON,
            difficulty: Difficulty.HARD, challenge: challenges[3],
            playerScore: 510, opponentScore: 380, timeSpent: '7:50', efficiency: 91,
        },
        {
            index: 4, status: RoundStatus.COMPLETED, result: RoundResult.LOST,
            difficulty: Difficulty.MEDIUM, challenge: challenges[4],
            playerScore: 560, opponentScore: 340, timeSpent: '10:20', efficiency: 68,
        },
    ],
    createdAt: new Date('2026-02-17T10:00:00'),
    completedAt: new Date('2026-02-17T10:42:00'),
    timeLimit: 900,
    difficulty: Difficulty.MEDIUM,
};

/** Active/Live battle – currently in round 2 of 5 */
const liveBattle = {
    id: 'battle-2',
    mode: BattleMode.ONE_VS_ONE,
    status: BattleStatus.LIVE,
    totalRounds: 5,
    currentRoundIndex: 1,
    player: {
        id: 'user-1',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        level: 42,
        league: 'Gold League',
    },
    opponent: {
        id: 'user-3',
        name: 'CodeMaster_X',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop',
        level: 38,
        league: 'Gold League',
    },
    rounds: [
        {
            index: 0, status: RoundStatus.COMPLETED, result: RoundResult.WON,
            difficulty: Difficulty.MEDIUM, challenge: challenges[0],
            playerScore: 450, opponentScore: 320, timeSpent: '7:10', efficiency: 85,
        },
        {
            index: 1, status: RoundStatus.IN_PROGRESS, result: RoundResult.PENDING,
            difficulty: Difficulty.HARD, challenge: challenges[1],
            playerScore: 400, opponentScore: 400, timeSpent: '0:00', efficiency: 0,
        },
        {
            index: 2, status: RoundStatus.UPCOMING, result: RoundResult.PENDING,
            difficulty: Difficulty.MEDIUM, challenge: challenges[2],
            playerScore: 0, opponentScore: 0, timeSpent: '0:00', efficiency: 0,
        },
        {
            index: 3, status: RoundStatus.UPCOMING, result: RoundResult.PENDING,
            difficulty: Difficulty.HARD, challenge: challenges[3],
            playerScore: 0, opponentScore: 0, timeSpent: '0:00', efficiency: 0,
        },
        {
            index: 4, status: RoundStatus.UPCOMING, result: RoundResult.PENDING,
            difficulty: Difficulty.MEDIUM, challenge: challenges[4],
            playerScore: 0, opponentScore: 0, timeSpent: '0:00', efficiency: 0,
        },
    ],
    createdAt: new Date('2026-02-17T19:30:00'),
    completedAt: null,
    timeLimit: 900,
    difficulty: Difficulty.HARD,
};

/** AI battle – active, round 1 of 3 */
const aiBattle = {
    id: 'battle-3',
    mode: BattleMode.ONE_VS_AI,
    status: BattleStatus.ACTIVE,
    totalRounds: 3,
    currentRoundIndex: 0,
    player: {
        id: 'user-1',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        level: 42,
        league: 'Gold League',
    },
    opponent: {
        id: 'ai-1',
        name: 'AI Master',
        avatar: null,
        level: 50,
        league: 'AI League',
    },
    rounds: [
        {
            index: 0, status: RoundStatus.IN_PROGRESS, result: RoundResult.PENDING,
            difficulty: Difficulty.MEDIUM, challenge: challenges[0],
            playerScore: 450, opponentScore: 520, timeSpent: '0:00', efficiency: 0,
        },
        {
            index: 1, status: RoundStatus.UPCOMING, result: RoundResult.PENDING,
            difficulty: Difficulty.HARD, challenge: challenges[1],
            playerScore: 0, opponentScore: 0, timeSpent: '0:00', efficiency: 0,
        },
        {
            index: 2, status: RoundStatus.UPCOMING, result: RoundResult.PENDING,
            difficulty: Difficulty.EASY, challenge: challenges[2],
            playerScore: 0, opponentScore: 0, timeSpent: '0:00', efficiency: 0,
        },
    ],
    createdAt: new Date('2026-02-17T18:00:00'),
    completedAt: null,
    timeLimit: 900,
    difficulty: Difficulty.MEDIUM,
};

/** Waiting battle – no opponent yet */
const waitingBattle = {
    id: 'battle-4',
    mode: BattleMode.ONE_VS_ONE,
    status: BattleStatus.WAITING,
    totalRounds: 5,
    currentRoundIndex: -1,
    player: {
        id: 'user-1',
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
        level: 42,
        league: 'Gold League',
    },
    opponent: null,
    rounds: Array.from({ length: 5 }, (_, i) => ({
        index: i,
        status: RoundStatus.UPCOMING,
        result: RoundResult.PENDING,
        difficulty: Difficulty.MEDIUM,
        challenge: challenges[i] || challenges[0],
        playerScore: 0,
        opponentScore: 0,
        timeSpent: '0:00',
        efficiency: 0,
    })),
    createdAt: new Date('2026-02-17T19:50:00'),
    completedAt: null,
    timeLimit: 900,
    difficulty: Difficulty.MEDIUM,
};

export const mockBattles = [liveBattle, aiBattle, waitingBattle, completedBattle];
export const mockChallenges = challenges;
