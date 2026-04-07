/**
 * AppLoader – Cinematic "Arena System Boot Sequence"
 * 
 * Premium full-screen loader with:
 * - Animated grid background
 * - Glowing rotating energy ring
 * - Pulsing logo
 * - Dynamic status messages
 * - Spring-animated progress bar
 * - Smooth exit animation
 */
import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const BOOT_MESSAGES = [
    'Initializing Arena Engine...',
    'Loading Challenges...',
    'Synchronizing Leaderboard...',
    'Preparing Battle Systems...',
];

const AppLoader = ({ isLoading = true }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const { settings } = useAccessibility();
    const reducedMotion = settings?.reducedMotion || false;

    // Cycle through boot messages
    useEffect(() => {
        if (!isLoading) return;
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % BOOT_MESSAGES.length);
        }, 1200);
        return () => clearInterval(interval);
    }, [isLoading]);

    // Smooth progress simulation
    useEffect(() => {
        if (!isLoading) {
            setProgress(100);
            return;
        }
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) return prev;
                return prev + Math.random() * 8;
            });
        }, 250);
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <MotionBox
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="var(--color-bg-primary)"
                    zIndex={10000}
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        transition: { duration: 0.6, ease: 'easeInOut' }
                    }}
                >
                    {/* Animated grid background */}
                    <Box
                        position="absolute"
                        inset={0}
                        bgImage="linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)"
                        bgSize="60px 60px"
                        opacity={0.6}
                        style={{
                            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 80%)',
                        }}
                    />

                    {/* Radial glow effect */}
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        w="600px"
                        h="600px"
                        bg="radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)"
                        pointerEvents="none"
                    />

                    {/* Main content */}
                    <MotionFlex
                        direction="column"
                        align="center"
                        justify="center"
                        h="100vh"
                        position="relative"
                        zIndex={1}
                    >
                        {/* Logo + Energy Ring */}
                        <Box position="relative" mb={12}>
                            {/* Outer rotating energy ring */}
                            {!reducedMotion && (
                                <MotionBox
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    w="180px"
                                    h="180px"
                                    borderRadius="full"
                                    border="3px solid transparent"
                                    borderTopColor="#22d3ee"
                                    borderRightColor="rgba(34,211,238,0.4)"
                                    transform="translate(-50%, -50%)"
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    style={{
                                        filter: 'drop-shadow(0 0 20px rgba(34,211,238,0.6))',
                                    }}
                                />
                            )}

                            {/* Inner pulsing glow ring */}
                            {!reducedMotion && (
                                <MotionBox
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    w="150px"
                                    h="150px"
                                    borderRadius="full"
                                    border="2px solid #22d3ee"
                                    transform="translate(-50%, -50%)"
                                    animate={{
                                        scale: [1, 1.15, 1],
                                        opacity: [0.4, 0.7, 0.4],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                />
                            )}

                            {/* Static ring for reduced motion */}
                            {reducedMotion && (
                                <Box
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    w="150px"
                                    h="150px"
                                    borderRadius="full"
                                    border="2px solid #22d3ee"
                                    transform="translate(-50%, -50%)"
                                    opacity={0.6}
                                />
                            )}

                            {/* Logo */}
                            <MotionBox
                                w="100px"
                                h="100px"
                                bg="linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)"
                                borderRadius="20px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="3xl"
                                fontWeight="bold"
                                color="var(--color-text-primary)"
                                position="relative"
                                boxShadow="0 0 60px rgba(34,211,238,0.5), inset 0 0 40px rgba(255,255,255,0.1)"
                                animate={reducedMotion ? {} : {
                                    scale: [1, 1.08, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                ⚔️
                            </MotionBox>
                        </Box>

                        {/* AlgoArena title */}
                        <MotionBox
                            mb={8}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <Text
                                fontSize="3xl"
                                fontWeight="bold"
                                bgGradient="linear(to-r, #22d3ee, #3b82f6)"
                                bgClip="text"
                                letterSpacing="wider"
                                fontFamily="'Inter', sans-serif"
                            >
                                ALGO ARENA
                            </Text>
                        </MotionBox>

                        {/* Cycling status messages */}
                        <Box h="28px" mb={10} position="relative" w="320px">
                            <AnimatePresence mode="wait">
                                <MotionBox
                                    key={messageIndex}
                                    position="absolute"
                                    w="100%"
                                    textAlign="center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Text
                                        fontSize="sm"
                                        color="#22d3ee"
                                        fontWeight="500"
                                        fontFamily="'Inter', sans-serif"
                                        letterSpacing="wide"
                                    >
                                        {BOOT_MESSAGES[messageIndex]}
                                    </Text>
                                </MotionBox>
                            </AnimatePresence>
                        </Box>

                        {/* Progress bar */}
                        <Box w="400px" maxW="90vw">
                            {/* Track */}
                            <Box
                                h="4px"
                                bg="rgba(34,211,238,0.15)"
                                borderRadius="full"
                                overflow="hidden"
                                position="relative"
                            >
                                {/* Fill */}
                                <MotionBox
                                    h="100%"
                                    bg="linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)"
                                    borderRadius="full"
                                    position="relative"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{
                                        type: reducedMotion ? 'tween' : 'spring',
                                        stiffness: 40,
                                        damping: 15,
                                    }}
                                    style={{
                                        boxShadow: '0 0 20px rgba(34,211,238,0.8)',
                                    }}
                                />

                                {/* Shimmer effect */}
                                {!reducedMotion && (
                                    <MotionBox
                                        position="absolute"
                                        top={0}
                                        left="-100%"
                                        w="100%"
                                        h="100%"
                                        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
                                        animate={{ left: ['100%', '200%'] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Progress percentage */}
                            <Text
                                mt={3}
                                fontSize="xs"
                                color="rgba(34,211,238,0.6)"
                                textAlign="center"
                                fontFamily="'Inter', monospace"
                                fontWeight="medium"
                            >
                                {Math.round(progress)}%
                            </Text>
                        </Box>
                    </MotionFlex>
                </MotionBox>
            )}
        </AnimatePresence>
    );
};

export default AppLoader;
