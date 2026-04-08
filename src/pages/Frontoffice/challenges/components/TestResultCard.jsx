/**
 * TestResultCard – single test case result row.
 *
 * Shows PASSED / FAILED status, input, expected vs actual output, and runtime.
 * Animated entrance via Framer Motion.
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    Code,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = motion.create(Box);

const CheckCircle = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </Icon>
);

const XCircle = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </Icon>
);

function formatValue(val) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'string') return val;
    try { return JSON.stringify(val); } catch { return String(val); }
}

const TestResultCard = ({ result, index }) => {
    const { t } = useTranslation();
    const passed = result.passed;
    const hasError = !passed && result.error;
    const hasOutputMismatch = !passed && !result.error && result.expected != null && result.got != null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            p={4}
            borderLeft="4px solid"
            borderLeftColor={passed ? 'green.500' : 'red.500'}
        >
            {/* Header row */}
            <Flex align="center" justify="space-between" mb={passed && !result.input ? 0 : 2}>
                <Flex align="center" gap={2}>
                    {passed ? (
                        <CheckCircle w={5} h={5} color="green.500" />
                    ) : (
                        <XCircle w={5} h={5} color="red.500" />
                    )}
                    <Text fontWeight="semibold" color={passed ? 'green.400' : 'red.400'} fontSize="sm">
                        {passed ? t('challengePage.testCasePassed', { n: result.testCase || index + 1 }) : result.timedOut ? t('challengePage.testCaseTimedOut', { n: result.testCase || index + 1 }) : t('challengePage.testCaseFailed', { n: result.testCase || index + 1 })}
                    </Text>
                </Flex>
                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                    {result.executionTime || t('challengePage.na')}
                </Text>
            </Flex>

            {/* Detail rows */}
            <Box fontSize="sm" fontFamily="mono" color="gray.400" pl={7}>
                {/* Input */}
                {result.input != null && result.input !== '' && (
                    <Flex gap={2} mb={1}>
                        <Text color="gray.500" flexShrink={0}>{t('challengePage.inputTestLabel')}</Text>
                        <Code
                            fontSize="xs"
                            bg="transparent"
                            color="gray.300"
                            wordBreak="break-all"
                            whiteSpace="pre-wrap"
                        >
                            {formatValue(result.input)}
                        </Code>
                    </Flex>
                )}

                {/* Expected */}
                {result.expected != null && (
                    <Flex gap={2} mb={1}>
                        <Text color="gray.500" flexShrink={0}>{t('challengePage.expectedTestLabel')}</Text>
                        <Code
                            fontSize="xs"
                            bg="transparent"
                            color={passed ? 'green.300' : 'yellow.300'}
                            wordBreak="break-all"
                            whiteSpace="pre-wrap"
                        >
                            {formatValue(result.expected)}
                        </Code>
                    </Flex>
                )}

                {/* Actual output */}
                {!passed && result.got != null && (
                    <Flex gap={2} mb={1}>
                        <Text color="gray.500" flexShrink={0}>{t('challengePage.gotTestLabel')}</Text>
                        <Code
                            fontSize="xs"
                            bg="transparent"
                            color="red.300"
                            wordBreak="break-all"
                            whiteSpace="pre-wrap"
                        >
                            {formatValue(result.got)}
                        </Code>
                    </Flex>
                )}

                {/* Runtime error */}
                {hasError && (
                    <Flex gap={2} mt={1}>
                        <Text color="red.400" flexShrink={0}>{t('challengePage.errorTestLabel')}</Text>
                        <Text color="red.300" wordBreak="break-all" whiteSpace="pre-wrap">
                            {result.error}
                        </Text>
                    </Flex>
                )}
            </Box>
        </MotionBox>
    );
};

export default TestResultCard;
