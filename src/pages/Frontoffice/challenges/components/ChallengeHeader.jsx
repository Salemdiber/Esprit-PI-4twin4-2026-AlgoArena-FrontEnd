/**
 * ChallengeHeader – top navigation bar for the play page.
 *
 * Shows back arrow, challenge title + meta, stopwatch, reset & submit buttons.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    Flex,
    Box,
    Text,
    Button,
    Icon,
    IconButton,
    Tooltip,
    HStack,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META } from '../data/mockChallenges';
import useChallengeExecution from '../hooks/useChallengeExecution';

const ArrowLeftIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
);

/* ── tiny SVG icons ── */
const PauseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
);
const PlayIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
const ResetIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const pad = (n) => String(n).padStart(2, '0');
const fmtElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/* Colour shifts: cyan (0-15min) → yellow (15-30min) → orange (30min+) */
const getChronoColor = (secs) => {
    if (secs < 900) return { color: '#22d3ee', glow: 'rgba(34,211,238,0.25)', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)' };
    if (secs < 1800) return { color: '#facc15', glow: 'rgba(250,204,21,0.22)', bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.2)' };
    return { color: '#f97316', glow: 'rgba(249,115,22,0.22)', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' };
};

/* ── Stopwatch Widget ─────────────────────────────────────────────── */
const Stopwatch = ({ challengeId }) => {
    const [elapsed, setElapsed] = useState(0);
    const [running, setRunning] = useState(true);
    const timerRef = useRef(null);

    // Reset & restart whenever the challenge changes
    useEffect(() => {
        setElapsed(0);
        setRunning(true);
    }, [challengeId]);

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [running]);

    const { color, glow, bg, border } = getChronoColor(elapsed);

    return (
        <HStack spacing={1.5}>
            {/* Main display */}
            <Flex
                align="center"
                gap={2}
                px={3}
                py={1.5}
                borderRadius="10px"
                bg={bg}
                border="1px solid"
                borderColor={border}
                transition="all 0.5s ease"
                minW="110px"
            >
                {/* Stopwatch SVG icon */}
                <Box color={color} flexShrink={0} opacity={0.85}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 15" />
                        <path d="M9.5 3.5h5" />
                        {!running && <line x1="12" y1="1" x2="12" y2="3" strokeOpacity="0.4" />}
                    </svg>
                </Box>

                <VStack spacing={0} align="flex-start">
                    <Text
                        fontSize="8px"
                        fontFamily="mono"
                        color={color}
                        letterSpacing="0.1em"
                        lineHeight={1}
                        textTransform="uppercase"
                        opacity={0.65}
                    >
                        {running ? 'elapsed' : 'paused'}
                    </Text>
                    <Text
                        fontFamily="mono"
                        fontSize="sm"
                        fontWeight="bold"
                        color={color}
                        letterSpacing="0.1em"
                        lineHeight={1.2}
                        style={{
                            textShadow: running ? `0 0 10px ${glow}` : 'none',
                            opacity: running ? 1 : 0.6,
                        }}
                    >
                        {fmtElapsed(elapsed)}
                    </Text>
                </VStack>
            </Flex>

            {/* Pause / Resume */}
            <Tooltip label={running ? 'Pause' : 'Resume'} placement="bottom" hasArrow openDelay={400}>
                <Box
                    as="button"
                    onClick={() => setRunning(r => !r)}
                    w="26px"
                    h="26px"
                    borderRadius="6px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color={running ? 'gray.400' : 'green.400'}
                    bg={running ? 'rgba(255,255,255,0.05)' : 'rgba(34,197,94,0.08)'}
                    border="1px solid"
                    borderColor={running ? 'rgba(255,255,255,0.08)' : 'rgba(34,197,94,0.25)'}
                    _hover={{ bg: running ? 'rgba(255,255,255,0.1)' : 'rgba(34,197,94,0.15)' }}
                    transition="all 0.2s"
                >
                    {running ? <PauseIcon /> : <PlayIcon />}
                </Box>
            </Tooltip>

            {/* Reset */}
            <Tooltip label="Reset timer" placement="bottom" hasArrow openDelay={400}>
                <Box
                    as="button"
                    onClick={() => { setElapsed(0); setRunning(true); }}
                    w="26px"
                    h="26px"
                    borderRadius="6px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.500"
                    bg="rgba(255,255,255,0.03)"
                    border="1px solid rgba(255,255,255,0.07)"
                    _hover={{ color: 'gray.300', bg: 'rgba(255,255,255,0.08)' }}
                    transition="all 0.2s"
                >
                    <ResetIcon />
                </Box>
            </Tooltip>
        </HStack>
    );
};

/* ── ChallengeHeader ──────────────────────────────────────────────── */
const ChallengeHeader = () => {
    const navigate = useNavigate();
    const { selectedChallenge, resetCode, isSubmitting } = useChallengeContext();
    const { submitCode } = useChallengeExecution();

    if (!selectedChallenge) return null;

    const diffMeta = DIFFICULTY_META[selectedChallenge.difficulty];

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            borderBottom="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.700")}
            backdropFilter="blur(12px)"
            px={4}
            py={2.5}
            align="center"
            justify="space-between"
            gap={2}
        >
            {/* Left: Back + title */}
            <Flex align="center" gap={3} minW={0}>
                <IconButton
                    icon={<ArrowLeftIcon w={5} h={5} />}
                    variant="ghost"
                    color={useColorModeValue("gray.500", "gray.400")}
                    _hover={{ color: useColorModeValue("gray.800", "gray.100"), bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50") }}
                    onClick={() => navigate('/challenges')}
                    aria-label="Back to challenges"
                    size="sm"
                    flexShrink={0}
                />
                <Box minW={0}>
                    <Text fontFamily="heading" fontWeight="bold" color={useColorModeValue("gray.800", "gray.100")} fontSize="sm" noOfLines={1}>
                        {selectedChallenge.title}
                    </Text>
                    <HStack spacing={2} mt={0.5}>
                        <Box
                            px={1.5}
                            py={0.5}
                            borderRadius="4px"
                            bg={`${diffMeta.color}15`}
                            border={`1px solid ${diffMeta.color}40`}
                            fontSize="10px"
                            fontWeight="bold"
                            color={diffMeta.color}
                            fontFamily="mono"
                        >
                            {diffMeta.label}
                        </Box>
                        {selectedChallenge.tags?.slice(0, 2).map(tag => (
                            <Text key={tag} fontSize="10px" color={useColorModeValue("gray.500", "gray.400")} fontFamily="mono">
                                #{tag}
                            </Text>
                        ))}
                    </HStack>
                </Box>
            </Flex>

            {/* Centre / Right: Stopwatch + actions */}
            <HStack spacing={3} flexShrink={0}>
                <Stopwatch challengeId={selectedChallenge.id} />

                <Box w="1px" h="28px" bg={useColorModeValue("gray.300", "rgba(255,255,255,0.07)")} />

                <Button
                    size="sm"
                    bg={useColorModeValue("gray.100", "rgba(255,255,255,0.05)")}
                    color={useColorModeValue("gray.600", "gray.400")}
                    border="1px solid"
                    borderColor={useColorModeValue("transparent", "rgba(255,255,255,0.1)")}
                    _hover={{ bg: useColorModeValue("gray.200", "rgba(255,255,255,0.1)"), color: useColorModeValue("gray.800", "gray.200") }}
                    fontWeight="semibold"
                    fontSize="xs"
                    onClick={resetCode}
                    h="30px"
                >
                    Reset
                </Button>

                <Button
                    size="sm"
                    variant="primary"
                    fontWeight="bold"
                    fontSize="xs"
                    onClick={submitCode}
                    isLoading={isSubmitting}
                    loadingText="Submitting..."
                    h="30px"
                    boxShadow="0 0 16px rgba(34,211,238,0.25)"
                >
                    Submit
                </Button>
            </HStack>
        </Flex>
    );
};

export default ChallengeHeader;


