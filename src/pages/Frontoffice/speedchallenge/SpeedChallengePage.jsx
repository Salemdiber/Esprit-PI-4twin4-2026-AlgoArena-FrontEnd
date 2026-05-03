/**
 * SpeedChallengePage â€“ /speed-challenge
 *
 * New-user placement test:
 *   â€¢ 3 problems (Easy â†’ Medium â†’ Hard)
 *   â€¢ 15-minute countdown
 *   â€¢ Automatic rank assignment on finish/timeout
 *
 * Layout: Intro â†’ [Problem panel | Editor panel] â†’ Result
 */
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, redirectBasedOnRole } from '../auth/context/AuthContext';
import { useToast } from '@chakra-ui/react';
import {
    Box, Flex, Text, Button, VStack, HStack, Image, Icon, Heading,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Spinner, Skeleton, useColorModeValue,
} from '@chakra-ui/react';
import { MdOutlineEdit, MdTimer, MdSwapHoriz, MdEmojiEvents, MdKey, MdBolt } from 'react-icons/md';
import { m, AnimatePresence } from 'framer-motion';
import * as ReactWindow from 'react-window';

import {
    SPEED_CHALLENGE_PROBLEMS,
    computePlacement,
    TOTAL_SECONDS,
} from './data/speedChallengeProblems';
import { userService } from '../../../services/userService';
import { settingsService } from '../../../services/settingsService';
import { apiClient } from '../../../services/apiClient';

import Logo from '../../../assets/logo_algoarena.png';
import { useTranslation } from 'react-i18next';

// Key used to persist the placement so the SignIn page can read it
const PLACEMENT_STORAGE_KEY = 'sc_placement';
const SPEED_CHALLENGE_RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD'];

const clampSpeedChallengeRank = (rank) => {
    const normalized = String(rank || '').toUpperCase();
    return SPEED_CHALLENGE_RANK_ORDER.includes(normalized) ? normalized : 'GOLD';
};

// â”€â”€â”€ Debounce helper for session autosave â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const MotionBox = m.create(Box);
const MotionFlex = m.create(Flex);

const VirtualGrid = ReactWindow.Grid;
const LazySpeedTimer = lazy(() => import('./components/SpeedTimer'));
const LazyProblemStepper = lazy(() => import('./components/ProblemStepper'));
const LazySpeedProblemPanel = lazy(() => import('./components/SpeedProblemPanel'));
const LazySpeedCodeEditor = lazy(() => import('./components/SpeedCodeEditor'));
const LazyPlacementResult = lazy(() => import('./components/PlacementResult'));

const scheduleIdleWork = (cb) => {
    if (typeof window === 'undefined') {
        return setTimeout(cb, 0);
    }
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(cb, { timeout: 1500 });
    }
    return setTimeout(cb, 0);
};

const useElementSize = (ref) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect) return;
            setSize({ width: rect.width, height: rect.height });
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);

    return size;
};

// â”€â”€â”€ Phase enum â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PHASE = {
    INTRO: 'INTRO',
    CHALLENGE: 'CHALLENGE',
    RESULT: 'RESULT',
};

// â”€â”€â”€ Intro screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IntroScreen = React.memo(({ onStart, loading = false }) => {
    const { t } = useTranslation();
    const [enableFloat, setEnableFloat] = useState(false);
    const introBg = useColorModeValue('linear-gradient(135deg, #f8fafc 0%, #ecfeff 42%, #eef2ff 100%)', '#0f172a');
    const gridImage = useColorModeValue(
        'linear-gradient(to right, rgba(14,116,144,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(79,70,229,0.1) 1px, transparent 1px)',
        'linear-gradient(to right, rgba(30,41,59,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.6) 1px, transparent 1px)'
    );
    const blueOrb = useColorModeValue('cyan.200', 'blue.800');
    const cyanOrb = useColorModeValue('violet.200', 'cyan.700');
    const cardBg = useColorModeValue('rgba(255,255,255,0.88)', 'rgba(15,23,42,0.95)');
    const cardBorder = useColorModeValue('rgba(14,116,144,0.2)', 'rgba(34,211,238,0.15)');
    const cardShadow = useColorModeValue('0 28px 70px -38px rgba(14,116,144,0.58), 0 12px 40px -28px rgba(79,70,229,0.45)', '0 24px 48px rgba(0,0,0,0.5)');
    const panelBg = useColorModeValue('rgba(248,250,252,0.82)', 'rgba(255,255,255,0.03)');
    const panelBorder = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.07)');
    const titleColor = useColorModeValue('var(--color-text-heading)', 'white');
    const bodyColor = useColorModeValue('var(--color-text-secondary)', 'gray.400');
    const labelColor = useColorModeValue('var(--color-text-muted)', 'gray.500');
    const ruleColor = useColorModeValue('var(--color-text-secondary)', 'gray.300');
    const rules = useMemo(
        () => ([
            { icon: MdOutlineEdit, text: t('speedChallenge.rule1') },
            { icon: MdTimer, text: t('speedChallenge.rule2') },
            { icon: MdSwapHoriz, text: t('speedChallenge.rule3') },
            { icon: MdEmojiEvents, text: t('speedChallenge.rule4') },
            { icon: MdKey, text: t('speedChallenge.rule5') },
        ]),
        [t]
    );

    useEffect(() => {
        let rafId = null;
        rafId = requestAnimationFrame(() => setEnableFloat(true));
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);
    return (
    <Box
        minH="100vh"
        pt={["80px", "80px", "96px"]}
        pb={["96px", "96px", "120px"]}
        bg={introBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
    >
        {/* Background decoration */}
        <Box position="absolute" inset={0} pointerEvents="none" zIndex={0}>
            <Box
                position="absolute"
                inset={0}
                opacity={0.25}
                backgroundSize="40px 40px"
                backgroundImage={gridImage}
            />
            <Box
                position="absolute"
                top="10%"
                left="15%"
                w="360px"
                h="360px"
                bg={blueOrb}
                borderRadius="full"
                filter="blur(120px)"
                opacity={0.15}
            />
            <Box
                position="absolute"
                bottom="10%"
                right="15%"
                w="360px"
                h="360px"
                bg={cyanOrb}
                borderRadius="full"
                filter="blur(120px)"
                opacity={0.15}
                className="animate-pulse-glow"
                style={{ animationDelay: '1.5s' }}
            />
            {/* Floating code snippets */}
            <Text
                position="absolute"
                top="18%"
                left="8%"
                fontFamily="mono"
                fontSize="xs"
                color="brand.500"
                opacity={0.2}
                className={enableFloat ? 'float-animation' : undefined}
            >
                O(n log n) â†’ Gold
            </Text>
            <Text
                position="absolute"
                bottom="25%"
                right="10%"
                fontFamily="mono"
                fontSize="xs"
                color="green.400"
                opacity={0.2}
                className={enableFloat ? 'float-animation' : undefined}
                style={{ animationDelay: '2s' }}
            >
                {'// 15 minutes. 3 problems.'}
            </Text>
        </Box>

        <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                maxW={['95vw', '480px', '520px']}
                w="100%"
                mx={4}
                position="relative"
                zIndex={10}
            >
                <Box
                    bg={cardBg}
                    backdropFilter="blur(20px)"
                    borderRadius={['16px', '20px', '24px']}
                    border="1px solid"
                    borderColor={cardBorder}
                    boxShadow={cardShadow}
                    overflow="hidden"
                >
                {/* Top gradient bar */}
                <Box h="3px" bgGradient="linear(to-r, #22d3ee, #a855f7, #22d3ee)" />

                    <VStack spacing={6} p={[4,6,8]} align="center">
                    {/* Logo */}
                    <Image
                        src={Logo}
                        alt="AlgoArena"
                        h={['48px','56px','64px']}
                        width={128}
                        height={64}
                        loading="lazy"
                        objectFit="contain"
                    />

                    {/* Badge */}
                    <HStack
                        spacing={2}
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        bg="rgba(34,211,238,0.08)"
                        border="1px solid rgba(34,211,238,0.2)"
                    >
                        <Box w="8px" h="8px" borderRadius="full" bg="brand.500" className="animate-pulse-glow" />
                        <Text fontSize="xs" fontFamily="mono" color="brand.500" letterSpacing="0.1em">
                            {t('speedChallenge.newUserPlacementTest')}
                        </Text>
                    </HStack>

                    {/* Title */}
                    <VStack spacing={3} textAlign="center">
                        <Flex align="center">
                            <Icon as={MdBolt} boxSize={8} color="brand.500" mr={3} />
                            <Text
                                fontSize={{ base: '3xl', md: '4xl' }}
                                fontWeight="black"
                                fontFamily="heading"
                                color={titleColor}
                                lineHeight={1.1}
                            >
                                {t('speedChallenge.speedChallenge')}
                            </Text>
                        </Flex>
                        <Text fontSize="sm" color={bodyColor} maxW="380px" lineHeight="1.8">
                            {t('speedChallenge.introDescPart1')} <strong style={{ color: '#0891b2' }}>{t('speedChallenge.fifteenMinutes')}</strong> {t('speedChallenge.introDescPart2')} <strong style={{ color: 'var(--color-text-heading)' }}>{t('speedChallenge.autoAssigned')}</strong> {t('speedChallenge.appliedToAccount')}
                        </Text>
                    </VStack>

                    {/* Rules */}
                    <Box
                        w="100%"
                        p={5}
                        borderRadius="14px"
                        bg={panelBg}
                        border="1px solid"
                        borderColor={panelBorder}
                    >
                        <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color={labelColor}
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            mb={4}
                        >
                            {t('speedChallenge.rules')}
                        </Text>
                        <VStack spacing={3} align="stretch">
                            {rules.map((rule, i) => (
                                    <HStack key={i} spacing={3} align="flex-start">
                                        <Icon as={rule.icon} boxSize={6} color="brand.500" mt="2px" />
                                        <Text fontSize="sm" color={ruleColor} lineHeight="1.6">
                                            {rule.text}
                                        </Text>
                                    </HStack>
                                ))}
                        </VStack>
                    </Box>

                    {/* Rank preview */}
                    <Box w="100%">
                        <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color={labelColor}
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            mb={3}
                        >
                            {t('speedChallenge.possibleRanks')}
                        </Text>
                        <Flex gap={2} flexWrap="wrap" justify="center">
                            {[
                                { label: t('speedChallenge.bronze'), color: '#cd7f32' },
                                { label: t('speedChallenge.silver'), color: '#c0c0c0' },
                                { label: t('speedChallenge.gold'), color: '#facc15' },
                            ].map((r) => (
                                <Box
                                    key={r.label}
                                    px={3}
                                    py={1}
                                    borderRadius="8px"
                                    border="1px solid"
                                    borderColor={`${r.color}40`}
                                    bg={`${r.color}10`}
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={r.color}
                                >
                                    <HStack spacing={2} align="center">
                                        <Box w="10px" h="10px" borderRadius="full" bg={r.color} />
                                        <Text>{r.label}</Text>
                                    </HStack>
                                </Box>
                            ))}
                        </Flex>
                    </Box>

                    {/* CTA */}
                    <Button
                        w="100%"
                        h="52px"
                        onClick={onStart}
                        isDisabled={loading}
                        isLoading={loading}
                        bgGradient="linear(to-r, brand.500, cyan.400)"
                        color="#0f172a"
                        fontWeight="bold"
                        fontSize="md"
                        borderRadius="12px"
                        boxShadow="0 4px 30px rgba(34,211,238,0.45)"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 40px rgba(34,211,238,0.6)' }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.3s ease"
                        role="group"
                        position="relative"
                        overflow="hidden"
                    >
                        <Box
                            position="absolute"
                            inset={0}
                            bg="whiteAlpha.200"
                            transform="translateX(-100%) skewX(-12deg)"
                            _groupHover={{ transform: 'translateX(100%) skewX(-12deg)' }}
                            transition="transform 0.5s"
                        />
                        <HStack spacing={2} position="relative">
                            <Text>{t('speedChallenge.startChallenge')}</Text>
                            <Icon as={MdBolt} boxSize={6} color="#ffffff" />
                        </HStack>
                    </Button>
                    {loading && (
                        <VStack w="100%" spacing={3} pt={2} align="stretch">
                            <Skeleton height="18px" borderRadius="8px" />
                            <Skeleton height="18px" borderRadius="8px" />
                            <Skeleton height="18px" borderRadius="8px" />
                        </VStack>
                    )}
                </VStack>
            </Box>
        </MotionBox>
    </Box>
    );
});

const SpeedChallengeSkeleton = React.memo(() => {
    const shellBg = useColorModeValue('#f8fafc', '#0f172a');
    const headerBg = useColorModeValue('rgba(255,255,255,0.9)', '#0b1220');
    const borderColor = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.06)');
    const tabBg = useColorModeValue('rgba(236,254,255,0.75)', 'rgba(11,18,32,0.9)');

    return (
    <Flex direction="column" minH="100vh" bg={shellBg} overflow="hidden">
        <Flex
            align="center"
            justify="space-between"
            px={4}
            py={2.5}
            bg={headerBg}
            borderBottom="1px solid"
            borderColor={borderColor}
            gap={2}
        >
            <HStack spacing={3}>
                <Skeleton width="110px" height="24px" borderRadius="6px" />
                <Skeleton width="140px" height="16px" borderRadius="6px" />
            </HStack>
            <Skeleton width="200px" height="20px" borderRadius="6px" />
            <Skeleton width="120px" height="20px" borderRadius="6px" />
        </Flex>
        <Box px={3} py={2} bg={tabBg}>
            <Skeleton height="28px" borderRadius="8px" />
        </Box>
        <Flex flex={1} overflow="hidden" minH={0}>
            <Box w={{ base: '100%', lg: '42%' }} display={{ base: 'none', lg: 'block' }} px={4} py={4}>
                <Skeleton height="100%" borderRadius="14px" />
            </Box>
            <Box w={{ base: '100%', lg: '58%' }} px={4} py={4}>
                <Skeleton height="70%" borderRadius="14px" mb={4} />
                <Skeleton height="56px" borderRadius="12px" />
            </Box>
        </Flex>
    </Flex>
    );
});

const ProblemTabItem = React.memo(({ columnIndex, style, problems, currentIndex, setCurrentIndex, solvedIds, onInterrupt }) => {
    const p = problems[columnIndex];
    if (!p) return null;
    const active = columnIndex === currentIndex;
    const solved = solvedIds.includes(p.id);
    return (
        <Box style={style} px={1}>
            <Button
                size="xs"
                onClick={() => {
                    onInterrupt();
                    setCurrentIndex(columnIndex);
                }}
                px={3}
                py={1}
                h="auto"
                borderRadius="6px"
                bg={active ? `${p.difficultyColor}18` : 'transparent'}
                border="1px solid"
                borderColor={active ? `${p.difficultyColor}50` : 'transparent'}
                color={solved ? '#22c55e' : active ? p.difficultyColor : 'gray.500'}
                fontFamily="mono"
                fontSize="xs"
                fontWeight={active ? 'bold' : 'normal'}
                _hover={{ bg: `${p.difficultyColor}10`, color: p.difficultyColor }}
                transition="all 0.2s"
                leftIcon={
                    solved ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    ) : undefined
                }
            >
                {p.index}. {p.title}
            </Button>
        </Box>
    );
});

const ProblemTabs = React.memo(({ problems, currentIndex, setCurrentIndex, solvedIds, onInterrupt }) => {
    const containerRef = useRef(null);
    const { width } = useElementSize(containerRef);
    const tabsBg = useColorModeValue('rgba(236,254,255,0.78)', 'rgba(11,18,32,0.9)');
    const tabsBorder = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.04)');
    const itemSize = useMemo(() => (width < 520 ? 200 : 240), [width]);
    const cellProps = useMemo(
        () => ({ problems, currentIndex, setCurrentIndex, solvedIds, onInterrupt }),
        [problems, currentIndex, setCurrentIndex, solvedIds, onInterrupt]
    );

    return (
        <Box
            ref={containerRef}
            px={3}
            py={1.5}
            bg={tabsBg}
            borderBottom="1px solid"
            borderColor={tabsBorder}
            gap={1}
            flexShrink={0}
        >
            {width > 0 && VirtualGrid ? (
                <VirtualGrid
                    rowCount={1}
                    columnCount={problems.length}
                    rowHeight={36}
                    columnWidth={itemSize}
                    defaultHeight={36}
                    defaultWidth={width}
                    cellComponent={ProblemTabItem}
                    cellProps={cellProps}
                    style={{ height: 36, width }}
                />
            ) : (
                <Skeleton height="28px" borderRadius="8px" />
            )}
        </Box>
    );
});

// â”€â”€â”€ Main Challenge Arena â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ChallengeArena = React.memo(({
    problems,
    currentIndex,
    setCurrentIndex,
    codes,
    onCodeChange,
    languages,
    onLanguageChange,
    secondsLeft,
    elapsedSeconds,
    solvedIds,
    onMarkSolved,
    onFinish,
}) => {
    const { t } = useTranslation();
    const shellBg = useColorModeValue('#f8fafc', '#0f172a');
    const headerBg = useColorModeValue('rgba(255,255,255,0.94)', '#0b1220');
    const panelBg = useColorModeValue('#f8fafc', '#0f172a');
    const footerBg = useColorModeValue('rgba(255,255,255,0.94)', '#0b1220');
    const borderColor = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.06)');
    const titleColor = useColorModeValue('var(--color-text-heading)', 'white');
    const dividerColor = useColorModeValue('rgba(14,116,144,0.18)', 'rgba(255,255,255,0.08)');
    const hintModalBg = useColorModeValue('white', '#0f172a');
    const hintModalText = useColorModeValue('var(--color-text-heading)', 'white');
    const hintBoxBg = useColorModeValue('rgba(236,254,255,0.8)', 'rgba(255,255,255,0.03)');
    const hintBoxBorder = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.06)');
    const hintBodyColor = useColorModeValue('var(--color-text-secondary)', 'gray.200');
    const [disableCopyPaste, setDisableCopyPaste] = useState(false);
    const [disableTabSwitch, setDisableTabSwitch] = useState(false);
    const activeSubmissionRef = useRef(0);
    const currentIndexRef = useRef(currentIndex);

    useEffect(() => {
        let cancelled = false;
        settingsService.getSettings()
            .then((s) => {
                if (!cancelled) {
                    const dcp = (s && typeof s.disableCopyPaste !== 'undefined') ? !!s.disableCopyPaste : null;
                    const dts = (s && typeof s.disableTabSwitch !== 'undefined') ? !!s.disableTabSwitch : null;
                    // If server doesn't provide these flags, fallback to localStorage
                    try {
                        const localDcp = dcp === null ? JSON.parse(localStorage.getItem('disableCopyPaste')) : dcp;
                        const localDts = dts === null ? JSON.parse(localStorage.getItem('disableTabSwitch')) : dts;
                        setDisableCopyPaste(!!localDcp);
                        setDisableTabSwitch(!!localDts);
                    } catch (_) {
                        setDisableCopyPaste(!!dcp);
                        setDisableTabSwitch(!!dts);
                    }
                }
            })
            .catch(() => {
                try {
                    setDisableCopyPaste(!!JSON.parse(localStorage.getItem('disableCopyPaste')));
                    setDisableTabSwitch(!!JSON.parse(localStorage.getItem('disableTabSwitch')));
                } catch (_) {}
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const problem = useMemo(() => problems[currentIndex], [problems, currentIndex]);
    const [submitState, setSubmitState] = useState('idle'); // idle | running | success | error
    const [feedback, setFeedback] = useState('');
    const [hintOpen, setHintOpen] = useState(false);
    const [hintLoading, setHintLoading] = useState(false);
    const [hintText, setHintText] = useState('');
    const [hintError, setHintError] = useState('');
    const [hintCache, setHintCache] = useState({});
    const [hintProblem, setHintProblem] = useState(null);

    const handleSubmit = useCallback(() => {
        if (submitState === 'running') return;
        if (!codes[problem.id]?.trim()) {
            setFeedback(t('speedChallenge.writeCodeFirst'));
            setSubmitState('error');
            return;
        }
        setSubmitState('running');
        setFeedback('');
        const submissionToken = activeSubmissionRef.current + 1;
        activeSubmissionRef.current = submissionToken;
        const submittedProblemId = problem.id;
        // Simulate test run (1.5s)
        setTimeout(() => {
            const currentProblem = problems[currentIndexRef.current];
            if (
                activeSubmissionRef.current !== submissionToken ||
                !currentProblem ||
                currentProblem.id !== submittedProblemId
            ) {
                return;
            }

            setSubmitState('success');
            setFeedback(t('speedChallenge.submissionAccepted'));
            onMarkSolved(problem.id);
            setTimeout(() => {
                setSubmitState('idle');
                setFeedback('');
                const next = currentIndex + 1;
                if (next < problems.length) {
                    setCurrentIndex(next);
                } else {
                    onFinish();
                }
            }, 1500);
        }, 1500);
    }, [codes, problem, currentIndex, problems, onMarkSolved, onFinish, setCurrentIndex, t]);

    const handleRequestHint = useCallback(async () => {
        if (!problem) return;

        setHintProblem(problem);
        setHintOpen(true);

        if (hintCache[problem.id]) {
            setHintText(hintCache[problem.id]);
            setHintError('');
            setHintLoading(false);
            return;
        }

        setHintLoading(true);
        setHintText('');
        setHintError('');

        try {
            const response = await apiClient('/speed-challenge/hint', {
                method: 'POST',
                body: JSON.stringify({
                    title: problem.title,
                    description: problem.description,
                    hintLevel: 1,
                }),
            });

            const text = String(response?.hint || 'Hint temporarily unavailable.');
            setHintCache((prev) => ({ ...prev, [problem.id]: text }));
            setHintText(text);
        } catch (err) {
            setHintError(err?.message || 'Failed to load hint.');
        } finally {
            setHintLoading(false);
        }
    }, [hintCache, problem]);

    const isExpired = secondsLeft <= 0;
    const isSolved = solvedIds.includes(problem?.id);

    return (
        <Flex direction="column" minH="100vh" maxH="100vh" bg={shellBg} overflow="hidden">
            {/* â”€â”€ Top Navigation Bar â”€â”€ */}
            <Flex
                as="header"
                align="center"
                justify="space-between"
                px={4}
                py={2.5}
                bg={headerBg}
                borderBottom="1px solid"
                borderColor={borderColor}
                flexShrink={0}
                gap={2}
                flexWrap="wrap"
            >
                {/* Left: logo + challenge name */}
                <HStack spacing={3}>
                    <Image
                        src={Logo}
                        alt="AlgoArena"
                        h="28px"
                        width={96}
                        height={28}
                        loading="lazy"
                        objectFit="contain"
                    />
                    <Box w="1px" h="20px" bg={dividerColor} />
                    <HStack spacing={2}>
                        <Icon as={MdBolt} boxSize={4} color="brand.500" />
                        <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                            {t('speedChallenge.speedChallenge')}
                        </Text>
                    </HStack>
                </HStack>

                {/* Center: stepper */}
                <Suspense fallback={<Skeleton width="220px" height="20px" borderRadius="6px" />}>
                    <LazyProblemStepper
                        currentIndex={currentIndex + 1}
                        solvedIds={solvedIds}
                        problems={problems}
                    />
                </Suspense>

                {/* Right: timer + finish */}
                <HStack spacing={3}>
                    <Suspense fallback={<Skeleton width="120px" height="20px" borderRadius="6px" />}>
                        <LazySpeedTimer
                            secondsLeft={secondsLeft}
                            elapsedSeconds={elapsedSeconds}
                            isExpired={isExpired}
                            disableCopyPaste={disableCopyPaste}
                            disableTabSwitch={disableTabSwitch}
                        />
                    </Suspense>
                    <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        borderColor="rgba(239,68,68,0.3)"
                        color="red.400"
                        _hover={{ bg: 'rgba(239,68,68,0.08)', borderColor: 'red.400' }}
                        onClick={onFinish}
                        fontSize="xs"
                        fontFamily="mono"
                    >
                        {t('speedChallenge.finish')}
                    </Button>
                </HStack>
            </Flex>

            {/* â”€â”€ Problem tabs (mobile: top, desktop: inside panel) â”€â”€ */}
            <ProblemTabs
                problems={problems}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                solvedIds={solvedIds}
                onInterrupt={() => {
                    activeSubmissionRef.current += 1;
                }}
            />

            {/* â”€â”€ Split layout â”€â”€ */}
            <Flex flex={1} overflow="hidden" minH={0}>
                {/* LEFT: Problem panel */}
                <Box
                    w={{ base: '100%', lg: '42%' }}
                    display={{ base: 'none', lg: 'flex' }}
                    flexDirection="column"
                    bg={panelBg}
                    borderRight="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                >
                    <AnimatePresence mode="wait">
                        <MotionBox
                            key={problem?.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.25 }}
                            flex={1}
                            overflow="hidden"
                            display="flex"
                            flexDirection="column"
                        >
                            <Suspense fallback={<Skeleton height="100%" borderRadius="12px" />}>
                                <LazySpeedProblemPanel problem={problem} />
                            </Suspense>
                        </MotionBox>
                    </AnimatePresence>
                </Box>

                {/* RIGHT: Editor & submit */}
                <Flex
                    w={{ base: '100%', lg: '58%' }}
                    direction="column"
                    overflow="hidden"
                    minH={0}
                >
                    {/* Code editor */}
                    <AnimatePresence mode="wait">
                        <MotionFlex
                            key={problem?.id + '-editor'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            flex={1}
                            overflow="hidden"
                            minH={0}
                        >
                            <Suspense fallback={<Skeleton height="100%" borderRadius="12px" />}>
                                <LazySpeedCodeEditor
                                    code={codes[problem?.id] || ''}
                                    onChange={(val) => onCodeChange(problem?.id, val)}
                                    language={languages[problem?.id] || 'javascript'}
                                    onLanguageChange={(lang) => onLanguageChange(problem?.id, lang)}
                                />
                            </Suspense>
                        </MotionFlex>
                    </AnimatePresence>

                    {/* Bottom action bar */}
                    <Box
                        px={4}
                        py={3}
                        bg={footerBg}
                        borderTop="1px solid"
                        borderColor={borderColor}
                        flexShrink={0}
                    >
                        <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                            {/* Feedback message */}
                            <Box flex={1}>
                                <AnimatePresence>
                                    {feedback && (
                                        <MotionBox
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Text
                                                fontSize="sm"
                                                fontFamily="mono"
                                                color={submitState === 'success' ? 'green.400' : 'red.400'}
                                            >
                                                {feedback}
                                            </Text>
                                        </MotionBox>
                                    )}
                                </AnimatePresence>

                                {isSolved && !feedback && (
                                    <HStack spacing={2}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                        <Text fontSize="xs" color="green.400" fontFamily="mono">
                                            {t('speedChallenge.solved')}
                                        </Text>
                                    </HStack>
                                )}
                            </Box>

                            <HStack spacing={2}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="cyan.300"
                                    _hover={{ bg: 'rgba(34,211,238,0.08)' }}
                                    fontSize="xs"
                                    fontFamily="mono"
                                    onClick={handleRequestHint}
                                    isDisabled={!problem}
                                >
                                    AI Hint
                                </Button>
                                {/* Skip to next */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    color="gray.500"
                                    _hover={{ color: 'gray.300' }}
                                    fontSize="xs"
                                    fontFamily="mono"
                                    onClick={() => {
                                        activeSubmissionRef.current += 1;
                                        setFeedback('');
                                        setSubmitState('idle');

                                        if (currentIndex < problems.length - 1) {
                                            setCurrentIndex(currentIndex + 1);
                                        } else {
                                            onFinish();
                                        }
                                    }}
                                >
                                    {currentIndex < problems.length - 1 ? t('speedChallenge.skip') : t('speedChallenge.skipAndFinish')}
                                </Button>

                                {/* Submit */}
                                <Button
                                    size="sm"
                                    h="36px"
                                    px={5}
                                    onClick={handleSubmit}
                                    isLoading={submitState === 'running'}
                                    loadingText={t('speedChallenge.running')}
                                    isDisabled={isExpired || isSolved}
                                    bgGradient={isSolved ? undefined : 'linear(to-r, brand.500, cyan.400)'}
                                    bg={isSolved ? 'rgba(34,197,94,0.15)' : undefined}
                                    border={isSolved ? '1px solid rgba(34,197,94,0.3)' : 'none'}
                                    color={isSolved ? 'green.400' : '#0f172a'}
                                    fontWeight="bold"
                                    fontSize="xs"
                                    borderRadius="8px"
                                    boxShadow={isSolved ? 'none' : '0 0 20px rgba(34,211,238,0.3)'}
                                    _hover={isSolved ? {} : { transform: 'translateY(-1px)', boxShadow: '0 4px 20px rgba(34,211,238,0.5)' }}
                                    transition="all 0.2s"
                                >
                                    {isSolved ? t('speedChallenge.solvedBtn') : t('speedChallenge.submit')}
                                </Button>
                            </HStack>
                        </Flex>
                    </Box>
                </Flex>

                <Modal isOpen={hintOpen} onClose={() => setHintOpen(false)} isCentered size="lg">
                    <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
                    <ModalContent bg={hintModalBg} border="1px solid rgba(34,211,238,0.18)" color={hintModalText}>
                        <ModalCloseButton color="gray.400" />
                        <ModalHeader>
                            <Text fontSize="xs" fontFamily="mono" color="cyan.300" letterSpacing="0.1em" textTransform="uppercase">
                                AI Hint
                            </Text>
                            <Text fontSize="xl" fontWeight="bold" mt={1}>
                                {hintProblem?.title || 'Problem Hint'}
                            </Text>
                        </ModalHeader>
                        <ModalBody pb={6}>
                            {hintLoading ? (
                                <HStack spacing={3} py={4}>
                                    <Spinner size="sm" color="cyan.300" />
                                    <Text color="gray.300">Generating a hint...</Text>
                                </HStack>
                            ) : hintError ? (
                                <Text color="red.300" whiteSpace="pre-wrap">
                                    {hintError}
                                </Text>
                            ) : (
                                <Box
                                    p={4}
                                    borderRadius="12px"
                                    bg={hintBoxBg}
                                    border="1px solid"
                                    borderColor={hintBoxBorder}
                                >
                                    <Text color={hintBodyColor} lineHeight="1.8" whiteSpace="pre-wrap">
                                        {hintText || 'No hint loaded yet.'}
                                    </Text>
                                </Box>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="outline" colorScheme="cyan" onClick={() => setHintOpen(false)}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
        </Flex>
    );
});

// â”€â”€â”€ SpeedChallengePage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SpeedChallengePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { updateCurrentUser, currentUser, reload } = useAuth();
    const [phase, setPhase] = useState(PHASE.INTRO);
    const [isDisabled, setIsDisabled] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [solvedIds, setSolvedIds] = useState([]);
    const solvedIdsRef = useRef([]);
    const [placement, setPlacement] = useState(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef(null);
    const saveSessionRef = useRef(null);
    const handleFinishRef = useRef(null);

    const [generatedProblems, setGeneratedProblems] = useState(null);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null); // null = not started, false = loading, object = done

    // Codes per problem
    const [codes, setCodes] = useState(() =>
        Object.fromEntries(
            SPEED_CHALLENGE_PROBLEMS.map((p) => [p.id, p.starterCode.javascript])
        )
    );

    // Language per problem
    const [languages, setLanguages] = useState(() =>
        Object.fromEntries(SPEED_CHALLENGE_PROBLEMS.map((p) => [p.id, 'javascript']))
    );

    const activeProblems = useMemo(
        () => generatedProblems || SPEED_CHALLENGE_PROBLEMS,
        [generatedProblems]
    );

    // When generated problems are loaded initialize codes/languages
    useEffect(() => {
        if (!generatedProblems) return;
        setCodes(Object.fromEntries(generatedProblems.map((p) => [p.id, (p.starterCode && p.starterCode.javascript) || '// start here'])));
        setLanguages(Object.fromEntries(generatedProblems.map((p) => [p.id, 'javascript'])));
    }, [generatedProblems]);

    // Check if speed challenges are disabled
    useEffect(() => {
        const checkIfDisabled = async () => {
            try {
                const settings = await settingsService.getSettings();
                if (settings?.disableSpeedChallenges) {
                    setIsDisabled(true);
                }
            } catch (err) {
                console.warn('Failed to check speed challenge status', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        
        checkIfDisabled();
    }, []);

    // â”€â”€ Block navigation when test is in progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (phase !== PHASE.CHALLENGE) return;

        // Block navigation attempts
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        // Block React Router navigation attempts
        const handleNavigateAttempt = (e) => {
            if (phase === PHASE.CHALLENGE) {
                // Save current session before blocking
                saveSessionToBackend();
                const confirmed = window.confirm(
                    'âš ï¸ You have an ongoing speed challenge! All progress will be saved and you can resume later. Are you sure you want to leave?'
                );
                if (!confirmed) {
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        // Custom navigation handler (if needed)
        const unsubscribe = location => {
            if (phase === PHASE.CHALLENGE && location.pathname !== '/speed-challenge') {
                handleNavigateAttempt({ preventDefault: () => {} });
            }
        };

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [phase]);

    // â”€â”€ Auto-save session every 10 seconds or on code/language change â”€â”€â”€â”€â”€â”€â”€â”€
    const saveSessionToBackend = useCallback(async () => {
        if (phase !== PHASE.CHALLENGE || !currentUser?.userId) return;
        
        try {
            const sessionData = {
                phase: PHASE.CHALLENGE,
                secondsLeft,
                currentIndex,
                solvedIds,
                codes,
                languages,
                elapsedSeconds,
            };

            await userService.saveSpeedTestSession(sessionData);

            console.debug('Speed challenge session saved');
        } catch (e) {
            console.warn('Failed to save speed challenge session', e);
        }
    }, [phase, secondsLeft, currentIndex, solvedIds, codes, languages, elapsedSeconds, currentUser?.userId]);

    // Create debounced version for auto-save
    useEffect(() => {
        saveSessionRef.current = debounce(saveSessionToBackend, 3000); // Save every 3 seconds
    }, [saveSessionToBackend]);

    // Auto-save when code, language, or progress changes (debounced)
    useEffect(() => {
        if (phase !== PHASE.CHALLENGE || !currentUser?.userId) return;
        if (saveSessionRef.current) {
            saveSessionRef.current();
        }
    }, [codes, languages, solvedIds, phase, currentUser?.userId]);

    // â”€â”€ Start timer on challenge phase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (phase !== PHASE.CHALLENGE) return;
        timerRef.current = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    clearInterval(timerRef.current);
                    // handleFinish will be called through the finish function
                    return 0;
                }
                return s - 1;
            });
            setElapsedSeconds((e) => e + 1);
        }, 1000);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [phase]);
    const restoreSessionFromBackend = useCallback(async () => {
        if (!currentUser?.userId) return null;
        
        try {
            const session = await userService.getSpeedTestSession();
            
            if (session && session.phase === PHASE.CHALLENGE && session.phase !== 'No ongoing session') {
                // Ask user if they want to resume
                const shouldResume = window.confirm(
                    'ðŸ“ You have an ongoing speed challenge session! Would you like to resume where you left off?'
                );

                if (shouldResume) {
                    return session; // Return session data to restore
                } else {
                    // Clear the session if user declines
                    await userService.clearSpeedTestSession();
                }
            }
        } catch (e) {
            console.warn('Failed to restore speed challenge session', e);
        }
        return null;
    }, [currentUser?.userId]);

    // The AI generator (`/api/onboarding-test`) sometimes emits structured
    // objects in places the renderer expects plain strings (e.g. graph
    // problems with `{S: 0, T: 5}` source/target shapes). Coerce here so
    // every downstream consumer — panel, editor, classifier — sees strings.
    const safeStr = (v) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            return String(v);
        }
        try { return JSON.stringify(v); } catch { return String(v); }
    };

    const mapServerToProblem = (item, idx) => {
        const id = `gen-${idx + 1}`;
        const samples = item.samples || item.tests || item.examples || [];
        const examples = samples.map((s) => ({
            input: safeStr(s?.input),
            output: safeStr(s?.output),
            explanation: safeStr(s?.explanation),
        }));
        const testCases = samples.map((s) => ({
            input: safeStr(s?.input),
            expected: safeStr(s?.output),
        }));
        const rawConstraints = Array.isArray(item.constraints)
            ? item.constraints
            : item.constraints
                ? [item.constraints]
                : [];
        return {
            id,
            index: idx + 1,
            difficulty: (item.difficulty || 'Easy').toUpperCase(),
            difficultyColor: item.difficulty === 'Hard' ? '#ef4444' : item.difficulty === 'Medium' ? '#facc15' : '#22c55e',
            title: safeStr(item.title) || `Generated Problem ${idx + 1}`,
            description: safeStr(item.statement || item.description),
            examples,
            constraints: rawConstraints.map(safeStr).filter(Boolean),
            starterCode: { javascript: '// write your solution here' },
            testCases,
            xpReward: item.difficulty === 'Hard' ? 250 : item.difficulty === 'Medium' ? 120 : 50,
        };
    };

    const handleStart = async () => {
        setLoadingProblems(true);
        try {
            // Check if there's an ongoing session to restore
            const restoredSession = await restoreSessionFromBackend();
            
            if (restoredSession) {
                // Restore the session state
                setGeneratedProblems(generatedProblems); // Keep existing problems
                setPhase(PHASE.CHALLENGE);
                setSecondsLeft(restoredSession.secondsLeft || TOTAL_SECONDS);
                setElapsedSeconds(restoredSession.elapsedSeconds || 0);
                setSolvedIds(restoredSession.solvedIds || []);
                setCurrentIndex(restoredSession.currentIndex || 0);
                setCodes(restoredSession.codes || codes);
                setLanguages(restoredSession.languages || languages);
                
                toast({
                    title: t('speedChallenge.sessionRestored'),
                    description: t('speedChallenge.sessionRestoredDesc'),
                    status: 'success',
                    duration: 3,
                });
                setLoadingProblems(false);
                return;
            }

            // If the logged-in user has placementProblems saved, use them
            const userProblems = currentUser?.placementProblems;
            console.debug('SpeedChallenge: currentUser placementProblems:', Array.isArray(userProblems) ? userProblems.length : userProblems);
            let mapped = [];
            if (userProblems && Array.isArray(userProblems) && userProblems.length) {
                await new Promise((resolve) => {
                    scheduleIdleWork(() => {
                        mapped = userProblems.slice(0, 3).map((it, i) => mapServerToProblem(it, i));
                        resolve();
                    });
                });
                console.debug('Using placementProblems from user, mapped count=', mapped.length);
            } else {
                const resp = await fetch('/api/onboarding-test');
                const json = await resp.json();
                const items = json?.problems || [];
                console.debug('/api/onboarding-test returned', items.length, 'items, encoding=', json?.encoding);
                await new Promise((resolve) => {
                    scheduleIdleWork(() => {
                        mapped = items.slice(0, 3).map((it, i) => mapServerToProblem(it, i));
                        resolve();
                    });
                });
                console.debug('Mapped server problems count=', mapped.length);
            }

            // If mapping produced no problems, fallback to static set
            if (!mapped || !mapped.length) {
                console.warn('No generated problems available, falling back to static problems');
                setGeneratedProblems(null);
            } else {
                setGeneratedProblems(mapped);
            }

            // reset timers and progress
            setPhase(PHASE.CHALLENGE);
            setSecondsLeft(TOTAL_SECONDS);
            setElapsedSeconds(0);
            setSolvedIds([]);
            setCurrentIndex(0);
        } catch (e) {
            console.error('Failed to load generated problems', e);
            // fallback to static problems
            setGeneratedProblems(null);
            setPhase(PHASE.CHALLENGE);
        } finally {
            setLoadingProblems(false);
        }
    };

    const handleFinish = useCallback(
        async (timeout = false) => {
            clearInterval(timerRef.current);
            const used = TOTAL_SECONDS - (timeout ? 0 : secondsLeft);
            const finalSolvedIds = solvedIdsRef.current;

            // Immediate fallback placement (shown while AI analyses)
            const fallback = computePlacement(finalSolvedIds, used);
            setPlacement(fallback);
            setElapsedSeconds(used);
            setAiAnalysis(false); // false = loading

            try {
                localStorage.setItem('speedChallengeResultPending', JSON.stringify({
                    pending: true,
                    userId: currentUser?.userId ?? currentUser?._id ?? currentUser?.id ?? null,
                }));
            } catch (_) { }

            // Mark speed challenge as completed BEFORE showing results.
            // This ensures page refresh shows the user as already-completed.
            let completionConfirmed = false;
            try {
                await userService.completeSpeedChallenge();
                completionConfirmed = true;
                // Clear the saved session so it can't be resumed
                try {
                    await userService.clearSpeedTestSession();
                } catch (_) { }
                // Reload entire auth context to sync completion flag
                await reload();
            } catch (err) {
                console.warn('Failed to mark speed challenge as completed:', err);
                // Fallback: at least update locally
                updateCurrentUser?.({ speedChallengeCompleted: true });
            }

            // Debug log
            console.debug('Speed challenge completion confirmed:', completionConfirmed);

            // Now safe to show results; backend has confirmed completion
            setPhase(PHASE.RESULT);

            // â”€â”€ AI classification (async, non-blocking) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            scheduleIdleWork(() => {
                const solutions = activeProblems.map((p) => ({
                    problemId: p.id,
                    title: p.title,
                    difficulty: p.difficulty,
                    code: codes[p.id] || '',
                    language: languages[p.id] || 'javascript',
                    solved: finalSolvedIds.includes(p.id),
                }));

                fetch('/api/classify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ solutions, totalSeconds: used }),
                })
                    .then((r) => r.json())
                    .then((aiResult) => {
                        setAiAnalysis(aiResult);
                        const authoritative = fallback;
                        setPlacement(authoritative);

                        // Persist the solved-count-based rank to backend (completion already done above)
                        userService.updatePlacement({
                            rank: authoritative.rank,
                            xp: authoritative.xp,
                            level: authoritative.rank,
                        }).then(() => {
                            updateCurrentUser({ rank: authoritative.rank, xp: authoritative.xp, level: authoritative.rank });
                        }).catch(() => { });

                        try {
                            localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(authoritative));
                        } catch (_) { }
                    })
                    .catch(() => {
                        // AI failed â€” keep fallback placement, mark analysis as unavailable
                        setAiAnalysis(null);
                        const cappedFallbackRank = clampSpeedChallengeRank(fallback.rank);
                        const cappedFallback = cappedFallbackRank === fallback.rank
                            ? fallback
                            : {
                                ...fallback,
                                rank: cappedFallbackRank,
                                label: cappedFallbackRank === 'BRONZE' ? 'Bronze' : cappedFallbackRank === 'SILVER' ? 'Silver' : 'Gold',
                                color: cappedFallbackRank === 'BRONZE' ? '#cd7f32' : cappedFallbackRank === 'SILVER' ? '#c0c0c0' : '#facc15',
                                gradient: cappedFallbackRank === 'BRONZE'
                                    ? ['#cd7f32', '#a0522d']
                                    : cappedFallbackRank === 'SILVER'
                                        ? ['#c0c0c0', '#a8a8a8']
                                        : ['#facc15', '#f59e0b'],
                            };
                        // Speed challenge already marked as completed above, just update rank
                        userService.updatePlacement({
                            rank: cappedFallback.rank,
                            xp: cappedFallback.xp,
                            level: cappedFallback.rank,
                        }).then(() => {
                            updateCurrentUser({ rank: cappedFallback.rank, xp: cappedFallback.xp, level: cappedFallback.rank });
                        }).catch(() => { });
                        try {
                            localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify({
                                rank: cappedFallback.rank, label: cappedFallback.label,
                                color: cappedFallback.color, xp: cappedFallback.xp, message: cappedFallback.message,
                            }));
                        } catch (_) { }
                    });
            });
        },
        [secondsLeft, activeProblems, codes, languages, updateCurrentUser]
    );

    // Update handleFinishRef whenever handleFinish changes
    useEffect(() => {
        handleFinishRef.current = handleFinish;
    }, [handleFinish]);

    const handleMarkSolved = useCallback((id) => {
        solvedIdsRef.current = solvedIdsRef.current.includes(id)
            ? solvedIdsRef.current
            : [...solvedIdsRef.current, id];
        setSolvedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    useEffect(() => {
        solvedIdsRef.current = solvedIds;
    }, [solvedIds]);

    const handleCodeChange = useCallback((id, val) => {
        setCodes((prev) => ({ ...prev, [id]: val }));
    }, []);

    const handleLanguageChange = useCallback((id, lang) => {
        setLanguages((prev) => ({ ...prev, [id]: lang }));
        setCodes((prev) => ({
            ...prev,
            [id]: activeProblems.find((p) => p.id === id)?.starterCode?.[lang] || '',
        }));
    }, [activeProblems]);

    const handleDone = useCallback(async () => {
        const fromPath = location.state?.from?.pathname
            ? `${location.state.from.pathname}${location.state.from.search || ''}${location.state.from.hash || ''}`
            : null;
        const userIdentifier = currentUser?.userId ?? currentUser?._id ?? currentUser?.id ?? null;

        const markJustCompleted = (identifier) => {
            try {
                localStorage.setItem('speedChallengeJustCompleted', JSON.stringify({
                    completedAt: Date.now(),
                    userId: identifier,
                }));
            } catch (_) { }
        };

        try {
            // Final verification: ensure profile has speedChallengeCompleted: true
            const profile = await userService.getProfile('me');
            console.debug('Profile after completion:', { 
                speedChallengeCompleted: profile?.speedChallengeCompleted,
                userId: profile?.userId ?? profile?._id ?? profile?.id
            });

            const profileUserId = profile?.userId ?? profile?._id ?? profile?.id ?? userIdentifier;
            
            if (!profile?.speedChallengeCompleted) {
                // If somehow not marked, manually mark it now
                console.warn('Profile missing speedChallengeCompleted flag, re-marking...');
                await userService.completeSpeedChallenge();
                const freshProfile = await userService.getProfile('me');
                updateCurrentUser?.({ ...freshProfile, speedChallengeCompleted: true });
            } else {
                updateCurrentUser?.({ ...profile, speedChallengeCompleted: true });
            }
            
            // Mark in localStorage that we just completed speed challenge.
            // This prevents immediate re-redirect if profile sync is slow.
            markJustCompleted(profileUserId);
            
        } catch (err) {
            console.error('Failed to verify completion status:', err);
            // Fallback: update locally and proceed anyway
            updateCurrentUser?.({ speedChallengeCompleted: true });
            markJustCompleted(userIdentifier);
        }

        // Ensure the local auth state is already marked before leaving the page.
        updateCurrentUser?.({ speedChallengeCompleted: true });
        markJustCompleted(userIdentifier);
        try {
            localStorage.removeItem('sc_pending');
            localStorage.removeItem('speedChallengeResultPending');
        } catch (_) { }
        
        const fallbackTarget = redirectBasedOnRole(currentUser || { role: 'USER' });
        const target = fromPath || fallbackTarget;

        // Return to the page the user came from, or the normal platform entry point.
        navigate(target, { replace: true });
    }, [currentUser, location.state, navigate, updateCurrentUser]);

    // â”€â”€ If checking status, show loading â”€â”€
    if (checkingStatus) {
        return (
            <Box minH="100vh" bg="#0f172a" display="flex" alignItems="center" justifyContent="center">
                <Text color="white">{t('speedChallenge.loading')}</Text>
            </Box>
        );
    }

    // â”€â”€ If speed challenges are disabled, show maintenance message â”€â”€
    if (isDisabled) {
        return (
            <Box
                minH="100vh"
                bg="#0f172a"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={4}
            >
                <VStack spacing={6} textAlign="center" maxW="500px">
                    <Box w="80px" h="80px" bg="rgba(239,68,68,0.1)" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" color="#ef4444">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </Box>
                    <VStack spacing={2}>
                        <Heading as="h1" size="lg" color="white">
                            {t('speedChallenge.unavailable')}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                            {t('speedChallenge.unavailableDesc')}
                        </Text>
                    </VStack>
                    <Button
                        onClick={() => navigate('/', { replace: true })}
                        bgGradient="linear(to-r, brand.500, cyan.400)"
                        color="#0f172a"
                        _hover={{ opacity: 0.9 }}
                    >
                        {t('speedChallenge.returnHome')}
                    </Button>
                </VStack>
            </Box>
        );
    }

    // â”€â”€ Render â”€â”€
    if (phase === PHASE.INTRO) return <IntroScreen onStart={handleStart} loading={loadingProblems} />;

    if (phase === PHASE.RESULT) {
        return (
            <Suspense fallback={<SpeedChallengeSkeleton />}>
                <LazyPlacementResult
                    placement={placement}
                    solvedIds={solvedIds}
                    totalSeconds={elapsedSeconds}
                    problems={activeProblems}
                    aiAnalysis={aiAnalysis}
                    onDone={handleDone}
                />
            </Suspense>
        );
    }

    return (
        loadingProblems ? (
            <SpeedChallengeSkeleton />
        ) : (
            <ChallengeArena
                problems={activeProblems}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                codes={codes}
                onCodeChange={handleCodeChange}
                languages={languages}
                onLanguageChange={handleLanguageChange}
                secondsLeft={secondsLeft}
                elapsedSeconds={elapsedSeconds}
                solvedIds={solvedIds}
                onMarkSolved={handleMarkSolved}
                onFinish={() => handleFinish(false)}
            />
        )
    );
};

export default SpeedChallengePage;
