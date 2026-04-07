import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Spinner,
    Button,
    Icon,
    VStack,
    Badge,
    Collapse,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
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

function sanitizeError(err) {
    if (!err) return null;
    if (typeof err === 'string') {
        if (err.toLowerCase().includes('fetch failed')) {
            return { type: 'NetworkError', message: 'Code execution service is temporarily unavailable. Please try again.' };
        }
        return { type: 'Error', message: err };
    }
    if (err.message?.toLowerCase().includes('fetch failed')) {
        return { ...err, message: 'Code execution service is temporarily unavailable. Please try again.' };
    }
    return err;
}

const TerminalPanel = () => {
    const {
        testResults,
        isRunning,
        isSubmitting,
        error: rawError,
        judgeAnalysis,
        isChallengeSolved,
        isPaused,
        code,
        currentSubmission,
    } = useChallengeContext();
    const { runCode, submitCode } = useChallengeExecution();

    const [terminalTab, setTerminalTab] = useState(0);
    const [showRemaining, setShowRemaining] = useState(false);

    const borderColor      = useColorModeValue('gray.200', 'gray.700');
    const runBtnColor      = useColorModeValue('gray.800', 'gray.100');
    const consoleTextColor = useColorModeValue('gray.500', 'gray.400');

    const isExecuting = isRunning || isSubmitting;
    const error = sanitizeError(rawError);
    const runDisabled = isExecuting || isPaused || isChallengeSolved || !code.trim();
    const submitDisabled = isExecuting || isPaused || isChallengeSolved || !code.trim();

    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount  = testResults.length;
    const allPassed   = totalCount > 0 && passedCount === totalCount;

    // Execution source badge
    const execSource = error?.source || testResults[0]?.source;
    const sourceBadge = execSource === 'ai-syntax-check'
        ? { label: 'AI Validation', color: 'purple' }
        : execSource === 'docker'
        ? { label: 'Docker Exec', color: 'blue' }
        : null;

    return (
        <Box
            bg="var(--color-bg-primary)"
            borderTop="1px solid"
            borderColor={borderColor}
            display="flex"
            flexDirection="column"
        >
            {/* Action buttons bar */}
            <Flex
                bg="var(--color-bg-secondary)"
                borderBottom="1px solid"
                borderColor={borderColor}
                px={4}
                py={3}
                gap={3}
                align="center"
            >
                <Button
                    bg="var(--color-tag-bg)"
                    color={runBtnColor}
                    _hover={{ bg: isExecuting ? undefined : 'gray.600' }}
                    size="sm"
                    fontWeight="semibold"
                    leftIcon={<PlayIcon w={4} h={4} />}
                    onClick={runCode}
                    isLoading={isRunning && !isSubmitting}
                    isDisabled={runDisabled}
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
                    isDisabled={submitDisabled}
                    loadingText="Submitting"
                >
                    {isChallengeSolved ? 'Already Solved' : 'Submit Solution'}
                </Button>

                {/* Execution source badge */}
                {sourceBadge && !isExecuting && (
                    <Badge colorScheme={sourceBadge.color} fontSize="xs" ml="auto">
                        {sourceBadge.label}
                    </Badge>
                )}
            </Flex>

            {/* Terminal tabs */}
            <Flex borderBottom="1px solid" borderColor={borderColor} px={4} py={2} gap={4}>
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
            <Box p={4} overflowY="auto" maxH="350px" minH="120px" flex={1}>
                {terminalTab === 0 ? (
                    <>
                        {/* STATE 1 — Loading */}
                        {isExecuting && (
                            <Flex direction="column" align="center" justify="center" h="100px" gap={3}>
                                <Flex align="center" gap={3}>
                                    <Spinner size="sm" color="brand.500" />
                                    <Text color="gray.400" fontSize="sm">
                                        Running your code...
                                    </Text>
                                </Flex>
                            </Flex>
                        )}

                        {!isExecuting && testResults.length === 0 && !error && (
                            <Flex align="center" justify="center" h="80px">
                                <Text color="gray.500" fontSize="sm" fontStyle="italic">
                                    {isPaused
                                        ? 'Timer is paused. Resume to continue.'
                                        : isChallengeSolved
                                            ? 'Challenge solved. Review your submission details.'
                                            : 'Click "Run Code" or "Submit Solution" to execute'}
                                </Text>
                            </Flex>
                        )}

                        <AnimatePresence>
                            {/* STATE 2 & 3 — Errors */}
                            {!isExecuting && error && (
                                <MotionBox
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    mb={4}
                                >
                                    <Alert status="error" borderRadius="md" alignItems="flex-start">
                                        <AlertIcon mt={1} />
                                        <Box>
                                            <AlertTitle>{error.type || 'Error'}</AlertTitle>
                                            <AlertDescription display="block">
                                                {error.line && <Text fontSize="sm" fontWeight="bold">Line {error.line}:</Text>}
                                                <Text fontSize="sm" fontFamily="mono" mt={1}>{error.message}</Text>
                                                {/* If SYNTAX ERROR (state 2), show AI analysis directly in alert */}
                                                {judgeAnalysis && error.type === 'SyntaxError' && (
                                                    <Box mt={3} p={2} bg="red.800" borderRadius="md">
                                                        <Text fontSize="sm" color="red.100">AI Analysis: {judgeAnalysis}</Text>
                                                    </Box>
                                                )}
                                            </AlertDescription>
                                        </Box>
                                    </Alert>
                                </MotionBox>
                            )}

                            {/* STATE 4 — Some Tests Failed */}
                            {!isExecuting && testResults.length > 0 && !allPassed && !error && (
                                <MotionBox
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Alert status="warning" borderRadius="md" mb={4}>
                                        <AlertIcon />
                                        <AlertTitle>{passedCount}/{totalCount} Tests Passed</AlertTitle>
                                    </Alert>

                                    {judgeAnalysis && (
                                        <Box mb={4} p={3} bg="orange.800" borderRadius="md">
                                            <Text fontSize="sm" color="orange.100">
                                                <strong>AI Analysis:</strong> {judgeAnalysis}
                                            </Text>
                                        </Box>
                                    )}

                                    {/* Show ALL test results so user can see passed + failed with full data */}
                                    <VStack spacing={3} align="stretch" mb={2}>
                                        {testResults.slice(0, 5).map((result, i) => (
                                            <TestResultCard key={result.id || i} result={result} index={i} />
                                        ))}
                                    </VStack>

                                    {testResults.length > 5 && (
                                        <Box mt={2} mb={2}>
                                            <Button size="xs" onClick={() => setShowRemaining(!showRemaining)}>
                                                {showRemaining ? "Hide remaining tests" : `Show ${testResults.length - 5} more tests`}
                                            </Button>
                                            <Collapse in={showRemaining} animateOpacity>
                                                <VStack spacing={3} align="stretch" mt={3}>
                                                    {testResults.slice(5).map((result, i) => (
                                                        <TestResultCard key={`rem-${i}`} result={result} index={i+5} />
                                                    ))}
                                                </VStack>
                                            </Collapse>
                                        </Box>
                                    )}
                                </MotionBox>
                            )}

                            {/* STATE 5 — All Tests Passed */}
                            {!isExecuting && testResults.length > 0 && allPassed && !error && (
                                <MotionBox
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <Alert status="success" borderRadius="md" mb={4}>
                                        <AlertIcon />
                                        <AlertTitle>All Tests Passed ({totalCount}/{totalCount})</AlertTitle>
                                    </Alert>

                                    {judgeAnalysis && (
                                        <Box mb={4} p={3} bg="green.800" borderRadius="md">
                                            <Text fontSize="sm" color="green.100">
                                                <strong>AI Tip:</strong> {judgeAnalysis}
                                            </Text>
                                        </Box>
                                    )}

                                    {isChallengeSolved && Number(currentSubmission?.xpGained || 0) > 0 && (
                                        <Box
                                            mb={4}
                                            p={3}
                                            borderRadius="md"
                                            bg={currentSubmission?.wasReduced ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.18)'}
                                            border="1px solid"
                                            borderColor={currentSubmission?.wasReduced ? 'orange.400' : 'green.400'}
                                        >
                                            <Text fontSize="sm" color={currentSubmission?.wasReduced ? 'orange.100' : 'green.100'} fontWeight="bold">
                                                {currentSubmission?.wasReduced
                                                    ? `You earned ${currentSubmission.xpGained} XP (50% rate after 1 hour). Full XP: ${Math.round(currentSubmission.xpGained * 2)} XP.`
                                                    : `You earned ${currentSubmission.xpGained} XP!`}
                                            </Text>
                                        </Box>
                                    )}
                                    
                                    <VStack spacing={3} align="stretch">
                                        {/* Show only first few tests visually for brevity, or toggle them */}
                                        {testResults.slice(0, 3).map((result, i) => (
                                            <TestResultCard key={result.id || i} result={result} index={i} />
                                        ))}
                                    </VStack>
                                </MotionBox>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <Box fontFamily="mono" fontSize="sm" color={consoleTextColor}>
                        <Text color="gray.300">{'>'} Waiting for logs...</Text>
                        {error && (
                            <Text color="red.400" mt={2}>
                                ERROR: {error.message}
                            </Text>
                        )}
                        {testResults.length > 0 && (
                             <Text color="gray.500" mt={2}>
                                Execution complete. Summary: {passedCount}/{totalCount} passed.
                             </Text>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TerminalPanel;
