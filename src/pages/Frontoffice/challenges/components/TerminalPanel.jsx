/**
 * TerminalPanel – bottom panel showing test results, console, and submissions.
 *
 * Renders TestResultCards with animated entrance and a summary bar
 * when all tests pass / fail.
 */
import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Spinner,
    Button,
    Icon,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChallengeContext } from '../context/ChallengeContext';
import useChallengeExecution from '../hooks/useChallengeExecution';
import TestResultCard from './TestResultCard';

const MotionBox = motion.create(Box);

const PlayIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="5 3 19 12 5 21 5 3" />
    </Icon>
);

const CheckCircle = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
);

const TerminalPanel = () => {
    const {
        testResults,
        isRunning,
        isSubmitting,
        executionState,
    } = useChallengeContext();
    const { runCode, submitCode } = useChallengeExecution();

    const [terminalTab, setTerminalTab] = useState(0); // 0 = Test Results, 1 = Console

    const allPassed = testResults.length > 0 && testResults.every(r => r.status === 'PASSED');
    const anyFailed = testResults.some(r => r.status === 'FAILED');

    const avgRuntime = testResults.length > 0
        ? Math.round(testResults.reduce((s, r) => s + r.runtime, 0) / testResults.length)
        : 0;
    const avgMemory = testResults.length > 0
        ? +(testResults.reduce((s, r) => s + r.memory, 0) / testResults.length).toFixed(1)
        : 0;

    return (
        <Box bg="var(--color-bg-primary)" borderTop="1px solid" borderColor={useColorModeValue("gray.200","gray.700")} display="flex" flexDirection="column">
            {/* Action buttons bar */}
            <Flex bg="var(--color-bg-secondary)" borderBottom="1px solid" borderColor={useColorModeValue("gray.200","gray.700")} px={4} py={3} gap={3}>
                <Button
                    bg="var(--color-tag-bg)"
                    color={useColorModeValue("gray.800","gray.100")}
                    _hover={{ bg: 'gray.600' }}
                    size="sm"
                    fontWeight="semibold"
                    leftIcon={<PlayIcon w={4} h={4} />}
                    onClick={runCode}
                    isLoading={isRunning && !isSubmitting}
                    loadingText="Running"
                >
                    Run Code
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    fontWeight="bold"
                    leftIcon={<CheckCircle w={4} h={4} />}
                    onClick={submitCode}
                    isLoading={isSubmitting}
                    loadingText="Submitting"
                >
                    Submit Solution
                </Button>
            </Flex>

            {/* Terminal tabs */}
            <Flex borderBottom="1px solid" borderColor={useColorModeValue("gray.200","gray.700")} px={4} py={2} gap={4}>
                {['Test Results', 'Console'].map((label, i) => (
                    <Button
                        key={label}
                        variant="unstyled"
                        fontSize="sm"
                        fontWeight="semibold"
                        color={terminalTab === i ? 'brand.500' : 'gray.400'}
                        borderBottom="2px solid"
                        borderColor={terminalTab === i ? 'brand.500' : 'transparent'}
                        borderRadius={0}
                        pb={2}
                        _hover={{ color: terminalTab === i ? 'brand.500' : 'gray.100' }}
                        onClick={() => setTerminalTab(i)}
                        minW="auto"
                        h="auto"
                        px={0}
                    >
                        {label}
                    </Button>
                ))}
            </Flex>

            {/* Content area */}
            <Box
                p={4}
                overflowY="auto"
                maxH="250px"
                minH="120px"
                flex={1}
            >
                {terminalTab === 0 ? (
                    <>
                        {isRunning && testResults.length === 0 && (
                            <Flex align="center" justify="center" h="80px" gap={3}>
                                <Spinner size="sm" color="brand.500" />
                                <Text color={useColorModeValue("gray.500","gray.400")} fontSize="sm">Running test cases...</Text>
                            </Flex>
                        )}

                        {!isRunning && testResults.length === 0 && (
                            <Flex align="center" justify="center" h="80px">
                                <Text color="gray.500" fontSize="sm" fontStyle="italic">
                                    Click "Run Code" to execute test cases
                                </Text>
                            </Flex>
                        )}

                        <AnimatePresence>
                            {testResults.length > 0 && (
                                <VStack spacing={3} align="stretch">
                                    {testResults.map((result, i) => (
                                        <TestResultCard key={result.id} result={result} index={i} />
                                    ))}

                                    {/* Summary bar */}
                                    {!isRunning && (
                                        <MotionBox
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: testResults.length * 0.1 }}
                                            bg={allPassed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                                            borderRadius="12px"
                                            p={3}
                                            border="1px solid"
                                            borderColor={allPassed ? 'green.500' : 'red.500'}
                                        >
                                            <Flex align="center" justify="space-between">
                                                <Text fontWeight="semibold" color={allPassed ? 'green.400' : 'red.400'}>
                                                    {allPassed
                                                        ? 'All test cases passed!'
                                                        : `${testResults.filter(r => r.status === 'FAILED').length} test case(s) failed`}
                                                </Text>
                                                <Flex fontSize="sm" color={useColorModeValue("gray.600","gray.300")} gap={2}>
                                                    <Text>
                                                        Runtime: <Text as="strong" color={allPassed ? 'green.400' : 'red.400'}>{avgRuntime}ms</Text>
                                                    </Text>
                                                    <Text>•</Text>
                                                    <Text>
                                                        Memory: <Text as="strong" color={allPassed ? 'green.400' : 'red.400'}>{avgMemory} MB</Text>
                                                    </Text>
                                                </Flex>
                                            </Flex>
                                        </MotionBox>
                                    )}
                                </VStack>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <Box fontFamily="mono" fontSize="sm" color={useColorModeValue("gray.500","gray.400")}>
                        <Text>{'>'} Console output will appear here...</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TerminalPanel;
