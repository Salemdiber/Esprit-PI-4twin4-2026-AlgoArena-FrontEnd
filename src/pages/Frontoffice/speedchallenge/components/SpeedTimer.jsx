import React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { TOTAL_SECONDS } from '../data/speedChallengeProblems';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${pad(m)}:${pad(s)}`;
};

/**
 * SpeedTimer
 *
 * Props:
 *   secondsLeft  – remaining seconds (countdown)
 *   elapsedSeconds – seconds since challenge start (stopwatch)
 *   isExpired    – force red state
 */
const SpeedTimer = ({ secondsLeft = TOTAL_SECONDS, elapsedSeconds = 0, isExpired }) => {
    const ratio = secondsLeft / TOTAL_SECONDS;
    const isWarning = ratio <= 0.33 && !isExpired;
    const isDanger = ratio <= 0.1 || isExpired;

    const timerColor = isDanger ? '#ef4444' : isWarning ? '#facc15' : '#22d3ee';
    const glowColor = isDanger ? 'rgba(239,68,68,0.35)' : isWarning ? 'rgba(250,204,21,0.25)' : 'rgba(34,211,238,0.25)';

    const circumference = 2 * Math.PI * 11;

    return (
        <>
            <Flex align="center" gap={3}>
            {/* ── Elapsed / Stopwatch ──────────────────────────────── */}
            <Flex
                align="center"
                gap={2}
                px={3}
                py={1.5}
                borderRadius="10px"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.08)"
            >
                {/* Stopwatch icon */}
                <Box color="gray.500" flexShrink={0}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 15" />
                        <path d="M9.5 3.5h5" />
                    </svg>
                </Box>
                <VStack spacing={0} align="flex-start">
                    <Text fontSize="8px" fontFamily="mono" color="gray.600" letterSpacing="0.1em" lineHeight={1} textTransform="uppercase">
                        elapsed
                    </Text>
                    <Text
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="bold"
                        color="gray.400"
                        letterSpacing="0.1em"
                        lineHeight={1.2}
                    >
                        {fmt(elapsedSeconds)}
                    </Text>
                </VStack>
            </Flex>

            {/* ── Countdown ────────────────────────────────────────── */}
            <Flex
                align="center"
                gap={2.5}
                px={3}
                py={1.5}
                borderRadius="10px"
                bg={isDanger ? 'rgba(239,68,68,0.08)' : isWarning ? 'rgba(250,204,21,0.06)' : 'rgba(34,211,238,0.06)'}
                border="1px solid"
                borderColor={isDanger ? 'rgba(239,68,68,0.3)' : isWarning ? 'rgba(250,204,21,0.2)' : 'rgba(34,211,238,0.15)'}
                transition="all 0.4s ease"
            >
                {/* Progress arc */}
                <Box position="relative" w="26px" h="26px" flexShrink={0}>
                    <svg width="26" height="26" viewBox="0 0 26 26">
                        <circle cx="13" cy="13" r="11" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
                        <circle
                            cx="13" cy="13" r="11"
                            fill="none"
                            stroke={timerColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - ratio)}
                            transform="rotate(-90 13 13)"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
                        />
                    </svg>
                </Box>

                <VStack spacing={0} align="flex-start">
                    <Text fontSize="8px" fontFamily="mono" color={timerColor} letterSpacing="0.1em" lineHeight={1} textTransform="uppercase" opacity={0.75}>
                        remaining
                    </Text>
                    <Text
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="bold"
                        color={timerColor}
                        letterSpacing="0.1em"
                        lineHeight={1.2}
                        style={{ textShadow: `0 0 10px ${glowColor}` }}
                        animation={isDanger && !isExpired ? 'timerPulse 0.8s ease-in-out infinite' : 'none'}
                    >
                        {isExpired ? '00:00' : fmt(secondsLeft)}
                    </Text>
                </VStack>
            </Flex>

            </Flex>

            {/* Floating timer panel (large, visible) */}
            <Box
                position="fixed"
                right={{ base: '12px', md: '24px' }}
                top={{ base: 'auto', md: '12px' }}
                bottom={{ base: '12px', md: 'auto' }}
                zIndex={9999}
                bg="rgba(2,6,23,0.85)"
                color="white"
                px={4}
                py={3}
                borderRadius="12px"
                boxShadow="0 8px 30px rgba(0,0,0,0.6)"
                display="flex"
                alignItems="center"
                gap={3}
                minW="180px"
            >
                {/* Circular progress (larger) */}
                <Box position="relative" w="36px" h="36px" flexShrink={0}>
                    {(() => {
                        const r = 14;
                        const c = 2 * Math.PI * r;
                        const dash = c * (1 - Math.max(0, Math.min(1, ratio)));
                        return (
                            <svg width="36" height="36" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r={r}
                                    fill="none"
                                    stroke={timerColor}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeDasharray={c}
                                    strokeDashoffset={dash}
                                    transform="rotate(-90 18 18)"
                                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
                                />
                            </svg>
                        );
                    })()}
                </Box>

                <VStack spacing={0} align="flex-start">
                    <Text fontSize={{ base: '12px', md: '12px' }} fontFamily="mono" color={timerColor} letterSpacing="0.08em" textTransform="uppercase" opacity={0.9}>
                        remaining
                    </Text>
                    <Text
                        fontFamily="mono"
                        fontSize={{ base: '18px', md: '24px' }}
                        fontWeight="bold"
                        color={timerColor}
                        style={{ textShadow: isDanger ? `0 0 12px ${glowColor}` : `0 0 8px ${glowColor}` }}
                    >
                        {isExpired ? '00:00' : fmt(secondsLeft)}
                    </Text>
                    <Text fontSize={{ base: '11px', md: '12px' }} fontFamily="mono" color="gray.300">
                        elapsed: {fmt(elapsedSeconds)}
                    </Text>
                </VStack>

            </Box>

            <style>{`
                @keyframes timerPulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.45; }
                }
            `}</style>
        </>
    );
};

export default SpeedTimer;

