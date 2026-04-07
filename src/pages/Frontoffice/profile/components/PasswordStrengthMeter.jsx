/**
 * PasswordStrengthMeter – visual bar showing password strength.
 *
 * Props:
 *  • score   (0–4)
 *  • label   string
 *  • color   CSS colour
 *  • glowColor   CSS colour for box-shadow
 *  • percent 0–100
 */
import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';

const MotionBox = motion.create(Box);

const PasswordStrengthMeter = ({ score, label, color, glowColor, percent }) => {
    const prefersReducedMotion = useReducedMotion();

    if (score === 0) return null;

    return (
        <Box mt={3}>
            <Flex justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.400">
                    Password Strength
                </Text>
                <Text fontSize="xs" fontWeight="600" color={color}>
                    {label}
                </Text>
            </Flex>
            <Box h="6px" w="100%" bg="var(--color-border)" borderRadius="full" overflow="hidden">
                <MotionBox
                    h="100%"
                    borderRadius="full"
                    bg={color}
                    boxShadow={`0 0 10px ${glowColor}`}
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
                />
            </Box>
        </Box>
    );
};

export default PasswordStrengthMeter;
