/**
 * TryChallenge – "Try a Challenge Instantly" landing page section.
 *
 * Self-contained: includes its own mock data, editor state, and layout.
 * Uses the shared editor toolbar/state and a lightweight textarea.
 *
 * Desktop: two-column (description left, editor right)
 * Mobile:  stacked (description → editor → output)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    Badge,
    VStack,
    HStack,
    Icon,
    Tag,
    Collapse,
    Button,
    useDisclosure,
    useColorModeValue,
} from '@chakra-ui/react';
import { m } from 'framer-motion';
import EditorToolbar from '../editor/components/EditorToolbar';
import OutputTerminal from '../editor/components/OutputTerminal';
import useEditorState from '../editor/hooks/useEditorState';

const MotionBox = m.create(Box);

/* ── Icons ──────────────────────────────────────────────────── */
const CodeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </Icon>
);

const LightbulbIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </Icon>
);

const parseErrorLocation = (error) => {
    const stack = String(error?.stack || '');
    const patterns = [
        /<anonymous>:(\d+):(\d+)/,
        /LandingPageSandbox\.js:(\d+):(\d+)/,
        /sandbox\.js:(\d+):(\d+)/,
        /:(\d+):(\d+)$/m,
    ];

    for (const pattern of patterns) {
        const match = stack.match(pattern);
        if (match) {
            return { line: Number(match[1]), column: Number(match[2]) };
        }
    }

    return null;
};

const formatFailureMessage = ({ index, testCase, actual, expected, hint, executionTime }) => (
    `LogicalError: Test ${index + 1} failed | input=${JSON.stringify(testCase.input)} | expected=${JSON.stringify(expected)} | got=${JSON.stringify(actual)}${executionTime != null ? ` | ${executionTime}ms` : ''}\nHint: ${hint}`
);

const classifyError = (error) => {
    const message = String(error?.message || 'Runtime error');
    const normalized = message.toLowerCase();

    if (error?.name === 'SyntaxError' || /unexpected token|unexpected end of input|invalid or unexpected token/i.test(message)) {
        return {
            type: 'SyntaxError',
            message,
            hint: 'Check your brackets, quotes, commas, and function signature.',
        };
    }

    if (error?.name === 'ReferenceError') {
        return {
            type: 'ReferenceError',
            message,
            hint: 'Check variable names, parameters, and whether the function is returning the right value.',
        };
    }

    if (error?.name === 'TypeError') {
        return {
            type: 'TypeError',
            message,
            hint: 'Check the type of the value you are using before calling a method or indexing it.',
        };
    }

    if (error?.name === 'RangeError') {
        return {
            type: 'RangeError',
            message,
            hint: 'Check loop bounds and recursion depth. This often comes from an infinite loop or invalid index.',
        };
    }

    if (/cannot read|cannot access|undefined/.test(normalized)) {
        return {
            type: error?.name || 'RuntimeError',
            message,
            hint: 'Check whether the variable exists and whether you are returning the expected value.',
        };
    }

    return {
        type: error?.name || 'RuntimeError',
        message,
        hint: 'Check your return values, loops, and array indexes.',
    };
};

const TryChallenge = () => {
    const { t } = useTranslation();
    const { code, setCode, language, setLanguage, output, setOutput } = useEditorState();
    const { isOpen: showExamples, onToggle: toggleExamples } = useDisclosure({ defaultIsOpen: true });
    const { isOpen: showChallengeList, onToggle: toggleChallengeList } = useDisclosure({ defaultIsOpen: false });
    const [selectedChallengeId, setSelectedChallengeId] = useState('two-sum');
    const [isRunning, setIsRunning] = useState(false);
    const lineCount = useMemo(() => Math.max(1, code.split('\n').length), [code]);

    const challengeCatalog = useMemo(() => ([
        {
            id: 'two-sum',
            title: 'Two Sum',
            difficulty: 'EASY',
            difficultyColor: '#22c55e',
            tags: [t('landing.tryChallenge.tagArrays'), t('landing.tryChallenge.tagHashTable')],
            description: t('landing.tryChallenge.demoDescription'),
            hint: 'Use a hash map to remember seen values and their indices.',
            starterCode: {
                javascript: 'function solution(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i += 1) {\n    const needed = target - nums[i];\n    if (seen.has(needed)) return [seen.get(needed), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n',
                python: 'def solution(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        needed = target - num\n        if needed in seen:\n            return [seen[needed], i]\n        seen[num] = i\n    return []\n',
                cpp: '#include <bits/stdc++.h>\nusing namespace std;\nvector<int> solution(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int needed = target - nums[i];\n        if (seen.count(needed)) return {seen[needed], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n',
            },
            examples: [
                {
                    input: 'nums = [2, 7, 11, 15], target = 9',
                    output: '[0, 1]',
                    explanation: t('landing.tryChallenge.explanation1'),
                },
                {
                    input: 'nums = [3, 2, 4], target = 6',
                    output: '[1, 2]',
                    explanation: t('landing.tryChallenge.explanation2'),
                },
            ],
            testCases: [
                { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
                { input: [[3, 2, 4], 6], expected: [1, 2] },
                { input: [[3, 3], 6], expected: [0, 1] },
            ],
        },
        {
            id: 'palindrome-number',
            title: 'Palindrome Number',
            difficulty: 'EASY',
            difficultyColor: '#22c55e',
            tags: ['Math', 'Strings'],
            description: 'Determine whether an integer reads the same backward as forward.',
            hint: 'Convert to a string or reverse half the digits without using extra space.',
            starterCode: {
                javascript: 'function solution(x) {\n  // return true or false\n}\n',
                python: 'def solution(x):\n    # return true or false\n    pass\n',
                cpp: '#include <bits/stdc++.h>\nusing namespace std;\nbool solution(int x) {\n    return false;\n}\n',
            },
            examples: [
                {
                    input: 'x = 121',
                    output: 'true',
                    explanation: '121 reads the same from both directions.',
                },
                {
                    input: 'x = -121',
                    output: 'false',
                    explanation: 'Negative numbers are not palindromes.',
                },
            ],
            testCases: [
                { input: [121], expected: true },
                { input: [-121], expected: false },
                { input: [10], expected: false },
            ],
        },
        {
            id: 'longest-substring',
            title: 'Longest Substring Without Repeating Characters',
            difficulty: 'MEDIUM',
            difficultyColor: '#f59e0b',
            tags: ['Sliding Window', 'Strings'],
            description: 'Return the length of the longest substring without repeating characters.',
            hint: 'Expand the window while characters are unique, then shrink from the left when duplicates appear.',
            starterCode: {
                javascript: 'function solution(s) {\n  // return the longest length\n}\n',
                python: 'def solution(s):\n    # return the longest length\n    pass\n',
                cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint solution(string s) {\n    return 0;\n}\n',
            },
            examples: [
                {
                    input: 's = "abcabcbb"',
                    output: '3',
                    explanation: 'The answer is "abc", with length 3.',
                },
                {
                    input: 's = "bbbbb"',
                    output: '1',
                    explanation: 'The answer is "b", with length 1.',
                },
            ],
            testCases: [
                { input: ['abcabcbb'], expected: 3 },
                { input: ['bbbbb'], expected: 1 },
                { input: ['pwwkew'], expected: 3 },
            ],
        },
        {
            id: 'valid-parentheses',
            title: 'Valid Parentheses',
            difficulty: 'EASY',
            difficultyColor: '#22c55e',
            tags: ['Stack', 'Strings'],
            description: 'Check whether every opening bracket has a matching closing bracket in the correct order.',
            hint: 'Use a stack and match each closing bracket against the most recent opening one.',
            starterCode: {
                javascript: 'function solution(s) {\n  const stack = [];\n  const pairs = { ")": "(", "]": "[", "}": "{" };\n  for (const ch of s) {\n    if (pairs[ch]) {\n      if (stack.pop() !== pairs[ch]) return false;\n    } else {\n      stack.push(ch);\n    }\n  }\n  return stack.length === 0;\n}\n',
                python: 'def solution(s):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return len(stack) == 0\n',
                cpp: `#include <bits/stdc++.h>
using namespace std;
bool solution(string s) {
    stack<char> st;
    unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
    for (char ch : s) {
        if (pairs.count(ch)) {
            if (st.empty() || st.top() != pairs[ch]) return false;
            st.pop();
        } else {
            st.push(ch);
        }
    }
    return st.empty();
}
`,
            },
            examples: [
                { input: 's = "()[]{}"', output: 'true', explanation: 'Every opening bracket is closed by the same type.' },
                { input: 's = "(]"', output: 'false', explanation: 'The brackets are out of order.' },
            ],
            testCases: [
                { input: ['()[]{}'], expected: true },
                { input: ['(]'], expected: false },
                { input: ['{[]}'], expected: true },
            ],
        },
        {
            id: 'binary-search',
            title: 'Binary Search',
            difficulty: 'MEDIUM',
            difficultyColor: '#f59e0b',
            tags: ['Arrays', 'Search'],
            description: 'Find the index of a target value in a sorted array or return -1.',
            hint: 'Split the search space in half on each step.',
            starterCode: {
                javascript: 'function solution(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n',
                python: 'def solution(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n',
                cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint solution(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = (left + right) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n',
            },
            examples: [
                { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 is found at index 4.' },
                { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in the array.' },
            ],
            testCases: [
                { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
                { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
                { input: [[1], 1], expected: 0 },
            ],
        },
        {
            id: 'coin-change',
            title: 'Coin Change',
            difficulty: 'HARD',
            difficultyColor: '#ef4444',
            tags: ['Dynamic Programming', 'Optimization'],
            description: 'Return the minimum number of coins needed to make up a given amount.',
            hint: 'Build solutions bottom-up from smaller amounts to larger ones.',
            starterCode: {
                javascript: 'function solution(coins, amount) {\n  const dp = Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i += 1) {\n    for (const coin of coins) {\n      if (i - coin >= 0) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n',
                python: 'def solution(coins, amount):\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for coin in coins:\n            if i - coin >= 0:\n                dp[i] = min(dp[i], dp[i - coin] + 1)\n    return -1 if dp[amount] == float("inf") else dp[amount]\n',
                cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint solution(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, amount + 1);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; ++i) {\n        for (int coin : coins) {\n            if (i - coin >= 0) dp[i] = min(dp[i], dp[i - coin] + 1);\n        }\n    }\n    return dp[amount] > amount ? -1 : dp[amount];\n}\n',
            },
            examples: [
                { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1.' },
                { input: 'coins = [2], amount = 3', output: '-1', explanation: 'It is impossible to make 3 with coin 2.' },
            ],
            testCases: [
                { input: [[1, 2, 5], 11], expected: 3 },
                { input: [[2], 3], expected: -1 },
                { input: [[1], 0], expected: 0 },
            ],
        },
    ]), [t]);

    const currentChallenge = useMemo(
        () => challengeCatalog.find((challenge) => challenge.id === selectedChallengeId) || challengeCatalog[0],
        [challengeCatalog, selectedChallengeId],
    );

    useEffect(() => {
        if (!currentChallenge?.starterCode) return;
        setCode(currentChallenge.starterCode[language] || currentChallenge.starterCode.javascript);
        setOutput([]);
    }, [currentChallenge, language, setCode, setOutput]);

    const handleSelectChallenge = useCallback((challengeId) => {
        setSelectedChallengeId(challengeId);
        toggleChallengeList();
    }, []);

    const handleResetCode = useCallback(() => {
        if (!currentChallenge?.starterCode) return;
        setCode(currentChallenge.starterCode[language] || currentChallenge.starterCode.javascript);
        setOutput([]);
    }, [currentChallenge, language, setCode, setOutput]);

    const runChallengeCode = useCallback(async () => {
        if (!currentChallenge || isRunning) return;

        setIsRunning(true);
        setOutput([
            { type: 'info', text: `$ run ${currentChallenge.title}` },
            { type: 'info', text: language === 'javascript' ? 'Status: executing locally' : 'Status: demo mode' },
        ]);

        try {
            if (language !== 'javascript') {
                setOutput([
                    { type: 'info', text: `$ run ${currentChallenge.title}` },
                    { type: 'error', text: 'Execution not supported (demo mode)' },
                ]);
                return;
            }

            const solution = new Function(`${code}\n//# sourceURL=LandingPageSandbox.js\nreturn typeof solution === 'function' ? solution : null;`)();

            if (typeof solution !== 'function') {
                throw new Error('Define a function named solution()');
            }

            const lines = [
                { type: 'info', text: `$ run ${currentChallenge.title}` },
                { type: 'info', text: `Language: ${language}` },
            ];

            let passedCount = 0;
            for (let index = 0; index < currentChallenge.testCases.length; index += 1) {
                const testCase = currentChallenge.testCases[index];
                const startedAt = performance.now();
                const actual = await Promise.resolve(solution(...testCase.input));
                const executionTime = Math.round(performance.now() - startedAt);
                const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
                if (passed) passedCount += 1;

                lines.push({
                    type: passed ? 'success' : 'error',
                    text: `Test ${index + 1}: Input ${JSON.stringify(testCase.input)} | Output ${JSON.stringify(actual)} | Expected ${JSON.stringify(testCase.expected)} | ${passed ? 'Passed' : 'Failed'} (${executionTime}ms)`,
                });

                if (!passed) {
                    const expectedType = Array.isArray(testCase.expected) ? 'array' : typeof testCase.expected;
                    const actualType = Array.isArray(actual) ? 'array' : typeof actual;
                    const mismatchHint = actual === undefined
                        ? 'Your function returned nothing. Make sure you return a value.'
                        : expectedType !== actualType
                            ? `Type mismatch: expected a ${expectedType} but got a ${actualType}. Check your return type.`
                            : 'Check the algorithm logic, edge cases, and loop conditions.';
                    lines.push({
                        type: 'error',
                        text: formatFailureMessage({
                            index,
                            testCase,
                            actual,
                            expected: testCase.expected,
                            hint: currentChallenge.hint,
                            executionTime,
                        }),
                    });
                    lines.push({ type: 'info', text: mismatchHint });
                }
            }

            lines.push(
                passedCount === currentChallenge.testCases.length
                    ? { type: 'success', text: `All ${passedCount} tests passed.` }
                    : { type: 'error', text: `${passedCount}/${currentChallenge.testCases.length} tests passed.` },
            );

            setOutput(lines);
        } catch (error) {
            const location = parseErrorLocation(error);
            const classification = classifyError(error);
            setOutput([
                { type: 'info', text: `$ run ${currentChallenge.title}` },
                { type: 'error', text: `${classification.type}: ${classification.message}` },
                ...(location ? [{ type: 'error', text: `at line ${location.line}, column ${location.column}` }] : []),
                { type: 'info', text: `Hint: ${classification.hint}` },
            ]);
        } finally {
            setIsRunning(false);
        }
    }, [code, currentChallenge, isRunning, language, setOutput]);
    const handleEditorKeyDown = useCallback((event) => {
        if (event.key !== 'Tab') return;
        event.preventDefault();
        const textarea = event.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        setCode(`${code.slice(0, start)}  ${code.slice(end)}`);
        requestAnimationFrame(() => {
            textarea.selectionStart = start + 2;
            textarea.selectionEnd = start + 2;
        });
    }, [code, setCode]);

    return (
        <Box
            id="try-challenge"
            as="section"
            py={{ base: 16, lg: 24 }}
            bg="var(--color-bg-primary)"
            position="relative"
            overflow="hidden"
        >
            {/* Subtle gradient glow */}
            <Box
                position="absolute"
                top="-200px"
                right="-100px"
                w="500px"
                h="500px"
                bg="#22d3ee"
                borderRadius="full"
                filter="blur(180px)"
                opacity={0.06}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                bottom="-150px"
                left="-80px"
                w="400px"
                h="400px"
                bg="#a855f7"
                borderRadius="full"
                filter="blur(160px)"
                opacity={0.04}
                pointerEvents="none"
            />

            <Container maxW="7xl" position="relative" zIndex={1}>
                {/* Section header */}
                <MotionBox
                    textAlign="center"
                    mb={{ base: 10, lg: 14 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <HStack justify="center" mb={4}>
                        <CodeIcon w={5} h={5} color="#22d3ee" />
                        <Text
                            fontSize="sm"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="widest"
                            color="#22d3ee"
                        >
                            {t('landing.tryChallenge.badge')}
                        </Text>
                    </HStack>
                    <Heading
                        as="h2"
                        fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
                        fontFamily="heading"
                        fontWeight="bold"
                        color={useColorModeValue("gray.800", "gray.100")}
                        mb={4}
                    >
                        {t('landing.tryChallenge.titleBefore')}{' '}
                        <Text as="span" bgGradient="linear(to-r, #22d3ee, #a855f7)" bgClip="text">
                            {t('landing.tryChallenge.titleAccent')}
                        </Text>
                    </Heading>
                    <Text fontSize={{ base: 'lg', lg: 'xl' }} color={useColorModeValue("gray.500", "gray.400")} maxW="2xl" mx="auto">
                        {t('landing.tryChallenge.subtitle')}
                    </Text>
                </MotionBox>

                {/* Main content: description + editor */}
                <MotionBox
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: 6, lg: 0 }}
                        bg="var(--color-editor-toolbar)"
                        borderRadius="16px"
                        border="1px solid"
                        borderColor="var(--color-editor-border)"
                        overflow="hidden"
                        boxShadow="0 8px 40px rgba(0, 0, 0, 0.4)"
                    >
                        {/* LEFT – Challenge description */}
                        <Box
                            w={{ base: '100%', lg: '40%' }}
                            p={{ base: 6, lg: 8 }}
                            borderRight={{ lg: '1px solid' }}
                            borderColor={{ lg: 'var(--color-editor-border)' }}
                            overflowY="auto"
                            maxH={{ lg: '520px' }}
                            sx={{
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { bg: 'var(--color-border)', borderRadius: '3px' },
                                overscrollBehavior: 'contain',
                            }}
                        >
                            <Flex justify="space-between" align="center" mb={4} gap={3} flexWrap="wrap">
                                <Button size="xs" variant="outline" colorScheme="cyan" onClick={toggleChallengeList}>
                                    {showChallengeList ? 'Hide Challenges' : 'Show Challenges'}
                                </Button>
                                <Badge bg={`${currentChallenge.difficultyColor}20`} color={currentChallenge.difficultyColor} fontSize="xs" px={2} py={0.5} borderRadius="6px" fontWeight="semibold">
                                    {currentChallenge.difficulty}
                                </Badge>
                            </Flex>

                            <Collapse in={showChallengeList} animateOpacity>
                                <VStack spacing={3} align="stretch" mb={5}>
                                    {challengeCatalog.map((challenge) => (
                                        <Button
                                            key={challenge.id}
                                            onClick={() => handleSelectChallenge(challenge.id)}
                                            variant={selectedChallengeId === challenge.id ? 'solid' : 'outline'}
                                            colorScheme={selectedChallengeId === challenge.id ? 'cyan' : 'gray'}
                                            whiteSpace="normal"
                                            h="auto"
                                            py={3}
                                            px={4}
                                            textAlign="left"
                                            justifyContent="flex-start"
                                        >
                                            <Flex w="full" justify="space-between" align="center" gap={3}>
                                                <Box>
                                                    <Text fontWeight="bold">{challenge.title}</Text>
                                                    <Text fontSize="xs" opacity={0.8}>{challenge.description}</Text>
                                                </Box>
                                                <Badge bg={`${challenge.difficultyColor}20`} color={challenge.difficultyColor} borderRadius="full" px={2} py={0.5} fontSize="xs">
                                                    {challenge.difficulty}
                                                </Badge>
                                            </Flex>
                                        </Button>
                                    ))}
                                </VStack>
                            </Collapse>

                            {/* Title + difficulty */}
                            <HStack mb={4} spacing={3}>
                                <Heading fontSize="xl" fontFamily="heading" fontWeight="bold" color={useColorModeValue("gray.800", "gray.100")}>
                                    {currentChallenge.title}
                                </Heading>
                            </HStack>

                            {/* Tags */}
                            <HStack spacing={2} mb={5} flexWrap="wrap">
                                {currentChallenge.tags.map((tag) => (
                                    <Tag
                                        key={tag}
                                        size="sm"
                                        bg="var(--color-bg-secondary)"
                                        color={useColorModeValue("gray.600", "gray.300")}
                                        borderRadius="6px"
                                        fontSize="xs"
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                            </HStack>

                            {/* Description */}
                            <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm" lineHeight="1.8" mb={5}>
                                {currentChallenge.description}
                            </Text>

                            <Box mb={5} p={3} borderRadius="10px" border="1px solid" borderColor="var(--color-editor-border)" bg="rgba(15, 23, 42, 0.58)">
                                <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={1} textTransform="uppercase" letterSpacing="widest">
                                    Hint
                                </Text>
                                <Text color="var(--color-text-secondary)" fontSize="sm" lineHeight="1.7">
                                    {currentChallenge.hint}
                                </Text>
                            </Box>

                            {/* Rules */}
                            <VStack align="start" spacing={2} mb={6}>
                                {[
                                    t('landing.tryChallenge.rule1'),
                                    t('landing.tryChallenge.rule2'),
                                    t('landing.tryChallenge.rule3'),
                                ].map((rule, i) => (
                                    <HStack key={i} align="start" spacing={2}>
                                        <Text color="#22d3ee" fontSize="sm" mt="2px">•</Text>
                                        <Text color={useColorModeValue("gray.500", "gray.400")} fontSize="sm">{rule}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            {/* Examples (collapsible) */}
                            <Button
                                variant="unstyled"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                color={useColorModeValue("gray.500", "gray.400")}
                                fontSize="sm"
                                fontWeight="semibold"
                                mb={3}
                                _hover={{ color: '#22d3ee' }}
                                onClick={toggleExamples}
                            >
                                <LightbulbIcon w={4} h={4} />
                                {showExamples ? t('landing.tryChallenge.hideExamples') : t('landing.tryChallenge.showExamples')}
                            </Button>

                            <Collapse in={showExamples} animateOpacity>
                                <VStack spacing={4} align="stretch">
                                    {currentChallenge.examples.map((ex, i) => (
                                        <Box
                                            key={i}
                                            bg="var(--color-bg-primary)"
                                            borderRadius="10px"
                                            p={4}
                                            border="1px solid"
                                            borderColor="var(--color-editor-border)"
                                        >
                                            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                                                {t('landing.tryChallenge.exampleN', { n: i + 1 })}
                                            </Text>
                                            <Box fontFamily="mono" fontSize="13px" lineHeight="1.8">
                                                <Text color={useColorModeValue("gray.500", "gray.400")}>
                                                    <Text as="span" color="var(--color-text-muted)" fontWeight="semibold">{t('landing.tryChallenge.inputLabel')} </Text>
                                                    {ex.input}
                                                </Text>
                                                <Text color="#22c55e">
                                                    <Text as="span" color="var(--color-text-muted)" fontWeight="semibold">{t('landing.tryChallenge.outputLabel')} </Text>
                                                    {ex.output}
                                                </Text>
                                                {ex.explanation && (
                                                    <Text color="gray.500" fontStyle="italic" mt={1}>
                                                        {ex.explanation}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* RIGHT – Editor + terminal */}
                        <Flex
                            w={{ base: '100%', lg: '60%' }}
                            direction="column"
                            bg="var(--color-bg-primary)"
                        >
                            {/* Toolbar */}
                            <EditorToolbar
                                language={language}
                                setLanguage={setLanguage}
                                isRunning={isRunning}
                                onRun={runChallengeCode}
                                onReset={handleResetCode}
                            />

                            <Flex h="300px" minH="300px" bg="#0f172a" overflow="hidden">
                                <Box
                                    as="pre"
                                    px={3}
                                    py={4}
                                    minW="44px"
                                    bg="#0b1220"
                                    color="rgba(255,255,255,0.24)"
                                    borderRight="1px solid rgba(255,255,255,0.06)"
                                    fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                                    fontSize="13px"
                                    lineHeight="1.6"
                                    textAlign="right"
                                    userSelect="none"
                                    aria-hidden="true"
                                >
                                    {Array.from({ length: lineCount }, (_, i) => (
                                        <div key={i}>{i + 1}</div>
                                    ))}
                                </Box>
                                <Box
                                    as="textarea"
                                    value={code}
                                    onChange={(event) => setCode(event.target.value)}
                                    onKeyDown={handleEditorKeyDown}
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    flex={1}
                                    p={4}
                                    bg="transparent"
                                    color="#e2e8f0"
                                    fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                                    fontSize="13px"
                                    lineHeight="1.6"
                                    border="0"
                                    outline="0"
                                    resize="none"
                                    overflowY="auto"
                                    sx={{
                                        caretColor: '#22d3ee',
                                        whiteSpace: 'pre',
                                        '&::selection': { background: 'rgba(34,211,238,0.2)' },
                                    }}
                                />
                            </Flex>

                            {/* Output terminal */}
                            <OutputTerminal output={output} isRunning={isRunning} />
                        </Flex>
                    </Flex>
                </MotionBox>
            </Container>
        </Box>
    );
};

export default TryChallenge;
