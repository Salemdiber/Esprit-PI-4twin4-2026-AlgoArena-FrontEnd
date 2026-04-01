/**
 * TestResultCard – single test case result row.
 *
 * Shows PASSED / FAILED status, input, expected, output, and runtime.
 * Animated entrance via Framer Motion.
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

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

const TestResultCard = ({ result, index }) => {
    const passed = result.status === 'PASSED';

    return (
        <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            p={3}
            borderLeft="4px solid"
            borderLeftColor={passed ? 'green.500' : 'red.500'}
        >
            <Flex align="center" justify="space-between" mb={2}>
                <Flex align="center" gap={2}>
                    {passed ? (
                        <CheckCircle w={5} h={5} color="green.500" />
                    ) : (
                        <XCircle w={5} h={5} color="red.500" />
                    )}
                    <Text fontWeight="semibold" color={passed ? 'green.400' : 'red.400'} fontSize="sm">
                        Test Case {index + 1}: {passed ? 'Passed' : 'Failed'}
                    </Text>
                </Flex>
                <Text fontSize="xs" color="gray.400">
                    Runtime: {result.runtime}ms
                </Text>
            </Flex>

            <Box fontSize="sm" fontFamily="mono" color="gray.400">
                <Text>Input: {result.input}</Text>
                <Text>Expected: {result.expected}</Text>
                <Text color={passed ? 'green.400' : 'red.400'}>
                    Output: {result.output}
                </Text>
            </Box>
        </MotionBox>
    );
};

export default TestResultCard;
