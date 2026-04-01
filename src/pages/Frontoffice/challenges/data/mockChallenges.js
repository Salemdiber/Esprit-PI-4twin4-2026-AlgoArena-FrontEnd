/**
 * Mock data for the Challenges feature.
 *
 * - challenges[]          – the catalogue
 * - userProgress[]        – per-challenge progress for the logged-in user
 * - currentUser           – rank, xp, streak
 * - ALL_TAGS / LANGUAGES  – constants used by filters & editor toolbar
 */

// ─── Difficulty enum ──────────────────────────────────────────────
export const Difficulty = Object.freeze({
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
    EXPERT: 'EXPERT',
});

export const DIFFICULTY_META = {
    [Difficulty.EASY]: { label: 'Easy', color: 'green', hex: '#22c55e' },
    [Difficulty.MEDIUM]: { label: 'Medium', color: 'yellow', hex: '#facc15' },
    [Difficulty.HARD]: { label: 'Hard', color: 'red', hex: '#ef4444' },
    [Difficulty.EXPERT]: { label: 'Expert', color: 'purple', hex: '#a855f7' },
};

// ─── Status enum ──────────────────────────────────────────────────
export const ChallengeUserStatus = Object.freeze({
    SOLVED: 'SOLVED',
    ATTEMPTED: 'ATTEMPTED',
    UNSOLVED: 'UNSOLVED',
});

// ─── Rank enum ────────────────────────────────────────────────────
export const Rank = Object.freeze({
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD',
    PLATINUM: 'PLATINUM',
    DIAMOND: 'DIAMOND',
});

export const RANK_META = {
    [Rank.BRONZE]: { label: 'Bronze', gradient: ['#cd7f32', '#a0522d'], xpCeil: 500 },
    [Rank.SILVER]: { label: 'Silver', gradient: ['#c0c0c0', '#a8a8a8'], xpCeil: 1500 },
    [Rank.GOLD]: { label: 'Gold', gradient: ['#facc15', '#f59e0b'], xpCeil: 3000 },
    [Rank.PLATINUM]: { label: 'Platinum', gradient: ['#22d3ee', '#06b6d4'], xpCeil: 5000 },
    [Rank.DIAMOND]: { label: 'Diamond', gradient: ['#a855f7', '#7c3aed'], xpCeil: 10000 },
};

// ─── Tags ─────────────────────────────────────────────────────────
export const ALL_TAGS = [
    'Arrays',
    'Strings',
    'Hash Table',
    'Dynamic Programming',
    'Graphs',
    'Trees',
    'Binary Search',
    'Stack',
    'Divide & Conquer',
    'Greedy',
    'Linked List',
    'Sorting',
];

// ─── Languages ────────────────────────────────────────────────────
export const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
];

// ─── Challenges ───────────────────────────────────────────────────
export const mockChallenges = [
    {
        id: 'ch-001',
        title: 'Two Sum',
        difficulty: Difficulty.EASY,
        tags: ['Arrays', 'Hash Table'],
        description:
            'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
                explanation: 'nums[1] + nums[2] == 6.',
            },
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9',
            'Only one valid answer exists.',
        ],
        hints: [
            'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
            'If we fix one of the numbers, say x, we have to scan the entire array to find y which is value - x. Can we change our array somehow so that this search becomes faster?',
        ],
        xpReward: 50,
        acceptanceRate: 68,
        estimatedTime: 15,
        solvedCount: 12450,
        starterCode: {
            javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n  \n}',
            python: 'def two_sum(nums, target):\n    # Write your solution here\n    pass',
            java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}',
        },
        testCases: [
            { id: 'tc-1', input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
            { id: 'tc-2', input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
            { id: 'tc-3', input: 'nums = [3,3], target = 6', expected: '[0,1]' },
        ],
    },
    {
        id: 'ch-002',
        title: 'Longest Palindromic Substring',
        difficulty: Difficulty.MEDIUM,
        tags: ['Strings', 'Dynamic Programming'],
        description:
            'Given a string `s`, return the longest palindromic substring in `s`.\n\nA palindrome is a string that reads the same forward and backward.',
        examples: [
            { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
            { input: 's = "cbbd"', output: '"bb"', explanation: '' },
        ],
        constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
        hints: [
            'How can we reuse a previously computed palindrome to compute a larger palindrome?',
            'Consider expanding around the center of a potential palindrome.',
        ],
        xpReward: 120,
        acceptanceRate: 45,
        estimatedTime: 25,
        solvedCount: 8230,
        starterCode: {
            javascript: 'function longestPalindrome(s) {\n  // Write your solution here\n  \n}',
            python: 'def longest_palindrome(s):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 's = "babad"', expected: '"bab"' },
            { id: 'tc-2', input: 's = "cbbd"', expected: '"bb"' },
        ],
    },
    {
        id: 'ch-003',
        title: 'Median of Two Sorted Arrays',
        difficulty: Difficulty.HARD,
        tags: ['Arrays', 'Binary Search', 'Divide & Conquer'],
        description:
            'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
        examples: [
            { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1,2,3] and median is 2.' },
            { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' },
        ],
        constraints: [
            'nums1.length == m',
            'nums2.length == n',
            '0 <= m <= 1000',
            '0 <= n <= 1000',
            '1 <= m + n <= 2000',
        ],
        hints: ['Use binary search on the smaller array.'],
        xpReward: 250,
        acceptanceRate: 32,
        estimatedTime: 40,
        solvedCount: 3890,
        starterCode: {
            javascript: 'function findMedianSortedArrays(nums1, nums2) {\n  // Write your solution here\n  \n}',
            python: 'def find_median_sorted_arrays(nums1, nums2):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 'nums1 = [1,3], nums2 = [2]', expected: '2.00000' },
            { id: 'tc-2', input: 'nums1 = [1,2], nums2 = [3,4]', expected: '2.50000' },
        ],
    },
    {
        id: 'ch-004',
        title: 'Valid Parentheses',
        difficulty: Difficulty.EASY,
        tags: ['Stack', 'Strings'],
        description:
            'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
        examples: [
            { input: 's = "()"', output: 'true', explanation: '' },
            { input: 's = "()[]{}"', output: 'true', explanation: '' },
            { input: 's = "(]"', output: 'false', explanation: '' },
        ],
        constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only.'],
        hints: ['Use a stack to keep track of opening brackets.'],
        xpReward: 50,
        acceptanceRate: 72,
        estimatedTime: 10,
        solvedCount: 18500,
        starterCode: {
            javascript: 'function isValid(s) {\n  // Write your solution here\n  \n}',
            python: 'def is_valid(s):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 's = "()"', expected: 'true' },
            { id: 'tc-2', input: 's = "()[]{}"', expected: 'true' },
            { id: 'tc-3', input: 's = "(]"', expected: 'false' },
        ],
    },
    {
        id: 'ch-005',
        title: 'Merge K Sorted Lists',
        difficulty: Difficulty.HARD,
        tags: ['Linked List', 'Sorting', 'Divide & Conquer'],
        description: 'You are given an array of `k` linked-lists, each sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        examples: [
            { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: '' },
        ],
        constraints: ['k == lists.length', '0 <= k <= 10^4', 'lists[i] is sorted in ascending order.'],
        hints: ['Consider using a min-heap / priority queue.'],
        xpReward: 300,
        acceptanceRate: 28,
        estimatedTime: 45,
        solvedCount: 2100,
        starterCode: {
            javascript: 'function mergeKLists(lists) {\n  // Write your solution here\n  \n}',
            python: 'def merge_k_lists(lists):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 'lists = [[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
        ],
    },
    {
        id: 'ch-006',
        title: 'Trapping Rain Water',
        difficulty: Difficulty.EXPERT,
        tags: ['Arrays', 'Dynamic Programming', 'Stack'],
        description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
        examples: [
            { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: 'The elevation map is represented by the array. In this case, 6 units of rain water are being trapped.' },
        ],
        constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
        hints: ['Think about what determines the water level at each index.', 'For each element, the water it can trap depends on the maximum left and right elevations.'],
        xpReward: 400,
        acceptanceRate: 22,
        estimatedTime: 50,
        solvedCount: 980,
        starterCode: {
            javascript: 'function trap(height) {\n  // Write your solution here\n  \n}',
            python: 'def trap(height):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
            { id: 'tc-2', input: 'height = [4,2,0,3,2,5]', expected: '9' },
        ],
    },
    {
        id: 'ch-007',
        title: 'Binary Tree Level Order Traversal',
        difficulty: Difficulty.MEDIUM,
        tags: ['Trees', 'Graphs'],
        description: 'Given the `root` of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
        examples: [
            { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: '' },
        ],
        constraints: ['The number of nodes is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
        hints: ['Use BFS with a queue.'],
        xpReward: 100,
        acceptanceRate: 55,
        estimatedTime: 20,
        solvedCount: 9500,
        starterCode: {
            javascript: 'function levelOrder(root) {\n  // Write your solution here\n  \n}',
            python: 'def level_order(root):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 'root = [3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
        ],
    },
    {
        id: 'ch-008',
        title: 'Longest Common Subsequence',
        difficulty: Difficulty.MEDIUM,
        tags: ['Strings', 'Dynamic Programming'],
        description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`.',
        examples: [
            { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The LCS is "ace" and its length is 3.' },
        ],
        constraints: ['1 <= text1.length, text2.length <= 1000', 'text1 and text2 consist of only lowercase English characters.'],
        hints: ['Try 2D DP where dp[i][j] represents the LCS for text1[0..i-1] and text2[0..j-1].'],
        xpReward: 150,
        acceptanceRate: 50,
        estimatedTime: 30,
        solvedCount: 6200,
        starterCode: {
            javascript: 'function longestCommonSubsequence(text1, text2) {\n  // Write your solution here\n  \n}',
            python: 'def longest_common_subsequence(text1, text2):\n    # Write your solution here\n    pass',
        },
        testCases: [
            { id: 'tc-1', input: 'text1 = "abcde", text2 = "ace"', expected: '3' },
            { id: 'tc-2', input: 'text1 = "abc", text2 = "def"', expected: '0' },
        ],
    },
];

// ─── User Progress ────────────────────────────────────────────────
export const mockUserProgress = [
    { challengeId: 'ch-004', status: ChallengeUserStatus.SOLVED, bestRuntime: 68, bestMemory: 42.1, earnedXp: 50 },
    { challengeId: 'ch-001', status: ChallengeUserStatus.ATTEMPTED, bestRuntime: null, bestMemory: null, earnedXp: 0 },
    { challengeId: 'ch-007', status: ChallengeUserStatus.SOLVED, bestRuntime: 84, bestMemory: 44.3, earnedXp: 100 },
    { challengeId: 'ch-002', status: ChallengeUserStatus.ATTEMPTED, bestRuntime: null, bestMemory: null, earnedXp: 0 },
];

// ─── Current User ─────────────────────────────────────────────────
export const mockCurrentUser = {
    name: 'Alex_Dev',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    rank: Rank.GOLD,
    xp: 2450,
    streak: 7,
};

// ─── Recommendation weights by rank ──────────────────────────────
export const RANK_RECOMMENDATIONS = {
    [Rank.BRONZE]: [Difficulty.EASY],
    [Rank.SILVER]: [Difficulty.EASY, Difficulty.MEDIUM],
    [Rank.GOLD]: [Difficulty.MEDIUM, Difficulty.HARD],
    [Rank.PLATINUM]: [Difficulty.HARD, Difficulty.EXPERT],
    [Rank.DIAMOND]: [Difficulty.EXPERT],
};
