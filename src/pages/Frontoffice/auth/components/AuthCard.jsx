/**
 * AuthCard – reusable dark card wrapper for all auth flow pages.
 *
 * Matches the HTML reference design:
 *  - bg: #1e293b
 *  - border-top: 2px cyan accent
 *  - rounded-lg shadow
 *  - breathing background glow
 *  - Framer m fade-in
 *
 * Props:
 *   children   – page content
 *   maxW       – optional max width (default "md")
 */
import React from 'react';
import { Box, keyframes } from '@chakra-ui/react';
import { m, useReducedMotion } from 'framer-motion';

const breathe = keyframes`
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.5; }
`;

const MotionBox = m.create(Box);

const AuthCard = ({ children, maxW = 'md' }) => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <Box
            minH="100vh"
            bg="var(--color-bg-primary)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={12}
            px={4}
            position="relative"
            overflow="hidden"
        >
            {/* Breathing glow background */}
            <Box
                position="fixed"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="600px"
                h="600px"
                bg="rgba(34, 211, 238, 0.05)"
                borderRadius="full"
                filter="blur(80px)"
                pointerEvents="none"
                animation={prefersReducedMotion ? undefined : `${breathe} 3s ease-in-out infinite`}
            />

            {/* Card */}
            <MotionBox
                position="relative"
                zIndex={10}
                w="100%"
                maxW={maxW}
                bg="var(--color-bg-secondary)"
                borderRadius="12px"
                borderTop="2px solid"
                borderColor="#22d3ee"
                boxShadow="var(--shadow-card)"
                p={{ base: 8, md: 12 }}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
            >
                {children}
            </MotionBox>
        </Box>
    );
};

export default AuthCard;
