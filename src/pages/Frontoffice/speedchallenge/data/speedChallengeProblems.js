/**
 * Speed Challenge Placement Test – 3 problems × 15 minutes
 *
 * One EASY, one MEDIUM, one HARD.
 * The level assigned at the end is based on how many problems were solved
 * and how much time was spent.
 */

export const SPEED_CHALLENGE_PROBLEMS = [
    {
        id: 'sc-001',
        index: 1,
        difficulty: 'EASY',
        difficultyColor: '#22c55e',
        title: 'Two Sum',
        description:
            'Given an array of integers `nums` and an integer `target`, return **indices** of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'nums[0] + nums[1] == 9, so we return [0, 1].',
            },
            {
                input: 'nums = [3,2,4], target = 6',
                output: '[1,2]',
            },
        ],
        constraints: [
            '2 ≤ nums.length ≤ 10⁴',
            '-10⁹ ≤ nums[i] ≤ 10⁹',
            '-10⁹ ≤ target ≤ 10⁹',
            'Only one valid answer exists.',
        ],
        starterCode: {
            javascript: 'function twoSum(nums, target) {\n  // Your solution here\n  \n}',
            python: 'def two_sum(nums, target):\n    # Your solution here\n    pass',
            java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}',
            cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n    }\n};',
        },
        testCases: [
            { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
            { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' },
            { input: 'nums = [3,3], target = 6', expected: '[0,1]' },
        ],
        xpReward: 50,
    },
    {
        id: 'sc-002',
        index: 2,
        difficulty: 'MEDIUM',
        difficultyColor: '#facc15',
        title: 'Longest Palindromic Substring',
        description:
            'Given a string `s`, return the **longest palindromic substring** in `s`.\n\nA palindrome reads the same forward and backward.',
        examples: [
            {
                input: 's = "babad"',
                output: '"bab"',
                explanation: '"aba" is also a valid answer.',
            },
            {
                input: 's = "cbbd"',
                output: '"bb"',
            },
        ],
        constraints: [
            '1 ≤ s.length ≤ 1000',
            's consists of only digits and English letters.',
        ],
        starterCode: {
            javascript: 'function longestPalindrome(s) {\n  // Your solution here\n  \n}',
            python: 'def longest_palindrome(s):\n    # Your solution here\n    pass',
            java: 'class Solution {\n    public String longestPalindrome(String s) {\n        // Your solution here\n        return "";\n    }\n}',
            cpp: '#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Your solution here\n    }\n};',
        },
        testCases: [
            { input: 's = "babad"', expected: '"bab"' },
            { input: 's = "cbbd"', expected: '"bb"' },
            { input: 's = "a"', expected: '"a"' },
        ],
        xpReward: 120,
    },
    {
        id: 'sc-003',
        index: 3,
        difficulty: 'HARD',
        difficultyColor: '#ef4444',
        title: 'Median of Two Sorted Arrays',
        description:
            'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the **median** of the two sorted arrays.\n\nThe overall run time complexity should be O(log(m+n)).',
        examples: [
            {
                input: 'nums1 = [1,3], nums2 = [2]',
                output: '2.00000',
                explanation: 'Merged array = [1,2,3], median is 2.',
            },
            {
                input: 'nums1 = [1,2], nums2 = [3,4]',
                output: '2.50000',
                explanation: 'Merged = [1,2,3,4], median = (2+3)/2 = 2.5.',
            },
        ],
        constraints: [
            'nums1.length == m, nums2.length == n',
            '0 ≤ m, n ≤ 1000',
            '1 ≤ m + n ≤ 2000',
            '-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶',
        ],
        starterCode: {
            javascript: 'function findMedianSortedArrays(nums1, nums2) {\n  // Your solution here\n  \n}',
            python: 'def find_median_sorted_arrays(nums1, nums2):\n    # Your solution here\n    pass',
            java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Your solution here\n        return 0.0;\n    }\n}',
            cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Your solution here\n    }\n};',
        },
        testCases: [
            { input: 'nums1 = [1,3], nums2 = [2]', expected: '2.00000' },
            { input: 'nums1 = [1,2], nums2 = [3,4]', expected: '2.50000' },
        ],
        xpReward: 250,
    },
];

/**
 * Placement logic:
 *  solved 0 / time out      → BRONZE
 *  solved 1 (easy only)     → BRONZE (fast) / SILVER
 *  solved 2 (easy+medium)   → SILVER (fast) / GOLD
 *  solved 3                 → GOLD (slow) / PLATINUM (fast) / DIAMOND (very fast)
 */
export const computePlacement = (solvedIds, totalSeconds) => {
    const solved = solvedIds.length;
    const minutesUsed = totalSeconds / 60;

    if (solved === 0) return { rank: 'BRONZE', label: '🥉 Bronze', color: '#cd7f32', gradient: ['#cd7f32', '#a0522d'], xp: 0, message: 'Keep practicing — every expert was once a beginner!' };
    if (solved === 1) {
        if (minutesUsed <= 5) return { rank: 'SILVER', label: '🥈 Silver', color: '#c0c0c0', gradient: ['#c0c0c0', '#a8a8a8'], xp: 50, message: 'Good start! You cracked the easy problem fast.' };
        return { rank: 'BRONZE', label: '🥉 Bronze', color: '#cd7f32', gradient: ['#cd7f32', '#a0522d'], xp: 50, message: 'Solid start — you solved the easy problem!' };
    }
    if (solved === 2) {
        if (minutesUsed <= 8) return { rank: 'GOLD', label: '🥇 Gold', color: '#facc15', gradient: ['#facc15', '#f59e0b'], xp: 170, message: 'Impressive! Easy + Medium solved quickly.' };
        return { rank: 'SILVER', label: '🥈 Silver', color: '#c0c0c0', gradient: ['#c0c0c0', '#a8a8a8'], xp: 170, message: 'Great work! You handled Easy and Medium well.' };
    }
    // solved all 3
    if (minutesUsed <= 7) return { rank: 'DIAMOND', label: '💎 Diamond', color: '#a855f7', gradient: ['#a855f7', '#7c3aed'], xp: 420, message: 'Exceptional! All 3 problems solved at lightning speed!' };
    if (minutesUsed <= 11) return { rank: 'PLATINUM', label: '🔷 Platinum', color: '#22d3ee', gradient: ['#22d3ee', '#06b6d4'], xp: 420, message: 'Outstanding! All 3 problems solved!' };
    return { rank: 'GOLD', label: '🥇 Gold', color: '#facc15', gradient: ['#facc15', '#f59e0b'], xp: 420, message: 'All 3 solved — solid performance!' };
};

export const TOTAL_SECONDS = 15 * 60; // 15 minutes
