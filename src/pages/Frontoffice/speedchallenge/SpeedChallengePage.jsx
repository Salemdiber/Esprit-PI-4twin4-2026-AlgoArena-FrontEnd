/**
 * SpeedChallengePage – /speed-challenge
 *
 * New-user placement test:
 *   • 3 problems (Easy → Medium → Hard)
 *   • 15-minute countdown
 *   • Automatic rank assignment on finish/timeout
 *
 * Layout: Intro → [Problem panel | Editor panel] → Result
 */
import React, { useState, useEffect, useRef, useCallback, useParams } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { Toast, useToast } from '@chakra-ui/react';
import {
    Box, Flex, Text, Button, VStack, HStack, Image, Icon, Heading,
} from '@chakra-ui/react';
import { MdOutlineEdit, MdTimer, MdSwapHoriz, MdEmojiEvents, MdKey, MdBolt } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

import {
    SPEED_CHALLENGE_PROBLEMS,
    computePlacement,
    TOTAL_SECONDS,
} from './data/speedChallengeProblems';
import SpeedTimer from './components/SpeedTimer';
import ProblemStepper from './components/ProblemStepper';
import SpeedProblemPanel from './components/SpeedProblemPanel';
import SpeedCodeEditor from './components/SpeedCodeEditor';
import PlacementResult from './components/PlacementResult';
import { userService } from '../../../services/userService';
import { settingsService } from '../../../services/settingsService';

import Logo from '../../../assets/logo_algoarena.png';

// Key used to persist the placement so the SignIn page can read it
const PLACEMENT_STORAGE_KEY = 'sc_placement';

// ─── Debounce helper for session autosave ─────────────────────
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

// ─── Phase enum ──────────────────────────────────────────────────
const PHASE = {
    INTRO: 'INTRO',
    CHALLENGE: 'CHALLENGE',
    RESULT: 'RESULT',
};

// ─── Intro screen ────────────────────────────────────────────────
const IntroScreen = ({ onStart, loading = false }) => (
    <Box
        minH="100vh"
        pt={["80px", "80px", "96px"]}
        pb={["96px", "96px", "120px"]}
        bg="#0f172a"
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
                backgroundImage="linear-gradient(to right, rgba(30,41,59,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.6) 1px, transparent 1px)"
            />
            <Box
                position="absolute"
                top="10%"
                left="15%"
                w="360px"
                h="360px"
                bg="blue.800"
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
                bg="cyan.700"
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
                className="float-animation"
            >
                O(n log n) → Platinum
            </Text>
            <Text
                position="absolute"
                bottom="25%"
                right="10%"
                fontFamily="mono"
                fontSize="xs"
                color="green.400"
                opacity={0.2}
                className="float-animation"
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
                    bg="rgba(15,23,42,0.95)"
                    backdropFilter="blur(20px)"
                    borderRadius={['16px', '20px', '24px']}
                    border="1px solid rgba(34,211,238,0.15)"
                    boxShadow={['0 6px 20px rgba(0,0,0,0.5)', '0 12px 30px rgba(0,0,0,0.5)', '0 24px 48px rgba(0,0,0,0.5)']}
                    overflow="hidden"
                >
                {/* Top gradient bar */}
                <Box h="3px" bgGradient="linear(to-r, #22d3ee, #a855f7, #22d3ee)" />

                    <VStack spacing={6} p={[4,6,8]} align="center">
                    {/* Logo */}
                    <Image src={Logo} alt="AlgoArena" h={['48px','56px','64px']} objectFit="contain" />

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
                            NEW USER PLACEMENT TEST
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
                                color="white"
                                lineHeight={1.1}
                            >
                                Speed Challenge
                            </Text>
                        </Flex>
                        <Text fontSize="sm" color="gray.400" maxW="380px" lineHeight="1.8">
                            Complete 3 coding problems in <strong style={{ color: '#22d3ee' }}>15 minutes</strong> to discover your true level. Your rank will be <strong style={{ color: 'white' }}>automatically assigned</strong> and applied to your new account.
                        </Text>
                    </VStack>

                    {/* Rules */}
                    <Box
                        w="100%"
                        p={5}
                        borderRadius="14px"
                        bg="rgba(255,255,255,0.03)"
                        border="1px solid rgba(255,255,255,0.07)"
                    >
                        <Text
                            fontSize="xs"
                            fontFamily="mono"
                            color="gray.500"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            mb={4}
                        >
                            Rules
                        </Text>
                        <VStack spacing={3} align="stretch">
                            {[
                                    { icon: MdOutlineEdit, text: '3 algorithmic problems — Easy, Medium, Hard' },
                                    { icon: MdTimer, text: '15 minutes total — the clock is always ticking' },
                                    { icon: MdSwapHoriz, text: 'Solve in any order — skip and come back' },
                                    { icon: MdEmojiEvents, text: 'Your rank is computed from speed + problems solved' },
                                    { icon: MdKey, text: 'Sign in after the test — your rank will be waiting!' },
                                ].map((rule, i) => (
                                    <HStack key={i} spacing={3} align="flex-start">
                                        <Icon as={rule.icon} boxSize={6} color="brand.500" mt="2px" />
                                        <Text fontSize="sm" color="gray.300" lineHeight="1.6">
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
                            color="gray.500"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            mb={3}
                        >
                            Possible ranks
                        </Text>
                        <Flex gap={2} flexWrap="wrap" justify="center">
                            {[
                                { label: 'Bronze', color: '#cd7f32' },
                                { label: 'Silver', color: '#c0c0c0' },
                                { label: 'Gold', color: '#facc15' },
                                { label: 'Platinum', color: '#22d3ee' },
                                { label: 'Diamond', color: '#a855f7' },
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
                            <Text>Start the Challenge</Text>
                            <Icon as={MdBolt} boxSize={6} color="#ffffff" />
                        </HStack>
                    </Button>
                </VStack>
            </Box>
        </MotionBox>
    </Box>
);

// ─── Main Challenge Arena ─────────────────────────────────────────
const ChallengeArena = ({
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
    const [disableCopyPaste, setDisableCopyPaste] = useState(false);
    const [disableTabSwitch, setDisableTabSwitch] = useState(false);

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
    const problem = problems[currentIndex];
    const [submitState, setSubmitState] = useState('idle'); // idle | running | success | error
    const [feedback, setFeedback] = useState('');

    const handleSubmit = useCallback(() => {
        if (!codes[problem.id]?.trim()) {
            setFeedback('⚠️ Please write some code before submitting.');
            setSubmitState('error');
            return;
        }
        setSubmitState('running');
        setFeedback('');
        // Simulate test run (1.5s)
        setTimeout(() => {
            const isCorrect = Math.random() > 0.25; // 75% success for demo
            if (isCorrect) {
                setSubmitState('success');
                setFeedback('All test cases passed!');
                onMarkSolved(problem.id);
                // Auto-advance after 1.5s
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
            } else {
                setSubmitState('error');
                setFeedback('Some test cases failed. Review your solution.');
            }
        }, 1500);
    }, [codes, problem, currentIndex, problems, onMarkSolved, onFinish, setCurrentIndex]);

    const isExpired = secondsLeft <= 0;
    const isSolved = solvedIds.includes(problem?.id);

    return (
        <Flex direction="column" minH="100vh" maxH="100vh" bg="#0f172a" overflow="hidden">
            {/* ── Top Navigation Bar ── */}
            <Flex
                as="header"
                align="center"
                justify="space-between"
                px={4}
                py={2.5}
                bg="#0b1220"
                borderBottom="1px solid rgba(255,255,255,0.06)"
                flexShrink={0}
                gap={2}
                flexWrap="wrap"
            >
                {/* Left: logo + challenge name */}
                <HStack spacing={3}>
                    <Image src={Logo} alt="AlgoArena" h="28px" objectFit="contain" />
                    <Box w="1px" h="20px" bg="rgba(255,255,255,0.08)" />
                    <HStack spacing={2}>
                        <Icon as={MdBolt} boxSize={4} color="brand.500" />
                        <Text fontSize="sm" fontWeight="semibold" color="white">
                            Speed Challenge
                        </Text>
                    </HStack>
                </HStack>

                {/* Center: stepper */}
                <ProblemStepper
                    currentIndex={currentIndex + 1}
                    solvedIds={solvedIds}
                    problems={problems}
                />

                {/* Right: timer + finish */}
                <HStack spacing={3}>
                    <SpeedTimer
                        secondsLeft={secondsLeft}
                        elapsedSeconds={elapsedSeconds}
                        isExpired={isExpired}
                        disableCopyPaste={disableCopyPaste}
                        disableTabSwitch={disableTabSwitch}
                    />
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
                        Finish
                    </Button>
                </HStack>
            </Flex>

            {/* ── Problem tabs (mobile: top, desktop: inside panel) ── */}
            <Flex
                px={3}
                py={1.5}
                bg="rgba(11,18,32,0.9)"
                borderBottom="1px solid rgba(255,255,255,0.04)"
                gap={1}
                flexShrink={0}
            >
                {problems.map((p, i) => {
                    const active = i === currentIndex;
                    const solved = solvedIds.includes(p.id);
                    return (
                        <Button
                            key={p.id}
                            size="xs"
                            onClick={() => setCurrentIndex(i)}
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
                    );
                })}
            </Flex>

            {/* ── Split layout ── */}
            <Flex flex={1} overflow="hidden" minH={0}>
                {/* LEFT: Problem panel */}
                <Box
                    w={{ base: '100%', lg: '42%' }}
                    display={{ base: 'none', lg: 'flex' }}
                    flexDirection="column"
                    bg="#0f172a"
                    borderRight="1px solid rgba(255,255,255,0.06)"
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
                            <SpeedProblemPanel problem={problem} />
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
                            <SpeedCodeEditor
                                code={codes[problem?.id] || ''}
                                onChange={(val) => onCodeChange(problem?.id, val)}
                                language={languages[problem?.id] || 'javascript'}
                                onLanguageChange={(lang) => onLanguageChange(problem?.id, lang)}
                            />
                        </MotionFlex>
                    </AnimatePresence>

                    {/* Bottom action bar */}
                    <Box
                        px={4}
                        py={3}
                        bg="#0b1220"
                        borderTop="1px solid rgba(255,255,255,0.06)"
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
                                            Solved!
                                        </Text>
                                    </HStack>
                                )}
                            </Box>

                            <HStack spacing={2}>
                                {/* Skip to next */}
                                {currentIndex < problems.length - 1 && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        color="gray.500"
                                        _hover={{ color: 'gray.300' }}
                                        fontSize="xs"
                                        fontFamily="mono"
                                        onClick={() => {
                                            setFeedback('');
                                            setSubmitState('idle');
                                            setCurrentIndex(currentIndex + 1);
                                        }}
                                    >
                                        Skip →
                                    </Button>
                                )}

                                {/* Submit */}
                                <Button
                                    size="sm"
                                    h="36px"
                                    px={5}
                                    onClick={handleSubmit}
                                    isLoading={submitState === 'running'}
                                    loadingText="Running..."
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
                                    {isSolved ? 'Solved' : 'Submit →'}
                                </Button>
                            </HStack>
                        </Flex>
                    </Box>
                </Flex>
            </Flex>
        </Flex>
    );
};

// ─── SpeedChallengePage ───────────────────────────────────────────
const SpeedChallengePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { updateCurrentUser, currentUser } = useAuth();
    const [phase, setPhase] = useState(PHASE.INTRO);
    const [isDisabled, setIsDisabled] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [solvedIds, setSolvedIds] = useState([]);
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

    const activeProblems = generatedProblems || SPEED_CHALLENGE_PROBLEMS;

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

    // ── Block navigation when test is in progress ────────────────────────────
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
                    '⚠️ You have an ongoing speed challenge! All progress will be saved and you can resume later. Are you sure you want to leave?'
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

    // ── Auto-save session every 10 seconds or on code/language change ────────
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

    // ── Start timer on challenge phase ──────────────────────────────────────
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
                    '📝 You have an ongoing speed challenge session! Would you like to resume where you left off?'
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

    const mapServerToProblem = (item, idx) => {
        const id = `gen-${idx + 1}`;
        const samples = item.samples || item.tests || item.examples || [];
        const examples = samples.map((s) => ({ input: s.input || '', output: s.output || '', explanation: s.explanation || '' }));
        const testCases = samples.map((s) => ({ input: s.input || '', expected: s.output || '' }));
        return {
            id,
            index: idx + 1,
            difficulty: (item.difficulty || 'Easy').toUpperCase(),
            difficultyColor: item.difficulty === 'Hard' ? '#ef4444' : item.difficulty === 'Medium' ? '#facc15' : '#22c55e',
            title: item.title || `Generated Problem ${idx + 1}`,
            description: item.statement || item.description || '',
            examples,
            constraints: Array.isArray(item.constraints) ? item.constraints : (item.constraints ? [String(item.constraints)] : []),
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
                    title: 'Session Restored',
                    description: 'Your progress has been restored. Continue solving!',
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
                mapped = userProblems.slice(0, 3).map((it, i) => mapServerToProblem(it, i));
                console.debug('Using placementProblems from user, mapped count=', mapped.length);
            } else {
                const resp = await fetch('/api/onboarding-test');
                const json = await resp.json();
                const items = json?.problems || [];
                console.debug('/api/onboarding-test returned', items.length, 'items, encoding=', json?.encoding);
                mapped = items.slice(0, 3).map((it, i) => mapServerToProblem(it, i));
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
        (timeout = false) => {
            clearInterval(timerRef.current);
            const used = TOTAL_SECONDS - (timeout ? 0 : secondsLeft);

            // Immediate fallback placement (shown while AI analyses)
            const fallback = computePlacement(solvedIds, used);
            setPlacement(fallback);
            setElapsedSeconds(used);
            setAiAnalysis(false); // false = loading
            setPhase(PHASE.RESULT);

            // ── AI classification (async, non-blocking) ──────────────────────
            const solutions = activeProblems.map((p) => ({
                problemId: p.id,
                title: p.title,
                difficulty: p.difficulty,
                code: codes[p.id] || '',
                language: languages[p.id] || 'javascript',
                solved: solvedIds.includes(p.id),
            }));

            fetch('/api/classify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ solutions, totalSeconds: used }),
            })
                .then((r) => r.json())
                .then((aiResult) => {
                    setAiAnalysis(aiResult);
                    // Use AI rank as the authoritative placement
                    const authoritative = {
                        rank: aiResult.rank,
                        label: aiResult.label,
                        color: aiResult.color,
                        gradient: aiResult.gradient,
                        xp: aiResult.xp,
                        message: aiResult.message,
                    };
                    setPlacement(authoritative);

                    // Persist AI-derived rank to backend
                    userService.updatePlacement({
                        rank: aiResult.rank,
                        xp: aiResult.xp,
                        level: aiResult.rank,
                    }).then(() => {
                        updateCurrentUser({ rank: aiResult.rank, xp: aiResult.xp, level: aiResult.rank });
                        // Mark speed challenge as completed
                        return userService.completeSpeedChallenge().then(() => {
                            updateCurrentUser({ speedChallengeCompleted: true });
                        }).catch(() => { });
                    }).catch(() => { });

                    try {
                        localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(authoritative));
                    } catch (_) { }
                })
                .catch(() => {
                    // AI failed — keep fallback placement, mark analysis as unavailable
                    setAiAnalysis(null);
                    userService.updatePlacement({
                        rank: fallback.rank,
                        xp: fallback.xp,
                        level: fallback.rank,
                    }).then(() => {
                        updateCurrentUser({ rank: fallback.rank, xp: fallback.xp, level: fallback.rank });
                        // Mark speed challenge as completed even if AI failed
                        return userService.completeSpeedChallenge().then(() => {
                            updateCurrentUser({ speedChallengeCompleted: true });
                        }).catch(() => { });
                    }).catch(() => { });
                    try {
                        localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify({
                            rank: fallback.rank, label: fallback.label,
                            color: fallback.color, xp: fallback.xp, message: fallback.message,
                        }));
                    } catch (_) { }
                });
        },
        [secondsLeft, solvedIds, activeProblems, codes, languages]
    );

    // Update handleFinishRef whenever handleFinish changes
    useEffect(() => {
        handleFinishRef.current = handleFinish;
    }, [handleFinish]);

    const handleMarkSolved = useCallback((id) => {
        setSolvedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

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

    const handleDone = () => navigate('/', { replace: true });

    // ── If checking status, show loading ──
    if (checkingStatus) {
        return (
            <Box minH="100vh" bg="#0f172a" display="flex" alignItems="center" justifyContent="center">
                <Text color="white">Loading...</Text>
            </Box>
        );
    }

    // ── If speed challenges are disabled, show maintenance message ──
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
                            Speed Challenges Unavailable
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                            The Speed Challenge placement test is currently disabled by administrators.
                        </Text>
                    </VStack>
                    <Button
                        onClick={() => navigate('/', { replace: true })}
                        bgGradient="linear(to-r, brand.500, cyan.400)"
                        color="#0f172a"
                        _hover={{ opacity: 0.9 }}
                    >
                        Return to Home
                    </Button>
                </VStack>
            </Box>
        );
    }

    // ── Render ──
    if (phase === PHASE.INTRO) return <IntroScreen onStart={handleStart} loading={loadingProblems} />;

    if (phase === PHASE.RESULT) {
        return (
            <PlacementResult
                placement={placement}
                solvedIds={solvedIds}
                totalSeconds={elapsedSeconds}
                problems={activeProblems}
                aiAnalysis={aiAnalysis}
                onDone={handleDone}
            />
        );
    }

    return (
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
    );
};

export default SpeedChallengePage;
