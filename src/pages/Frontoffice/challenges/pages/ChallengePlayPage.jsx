/**
 * ChallengePlayPage - /challenges/:id
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    Text,
    Button,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    useDisclosure,
    Icon,
    useColorModeValue,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    HStack,
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiClock } from 'react-icons/fi';
import { FaHourglassHalf } from 'react-icons/fa';
import { useChallengeContext } from '../context/ChallengeContext';
import ChallengeHeader from '../components/ChallengeHeader';
import ProblemTabs from '../components/ProblemTabs';
import ProblemDescription from '../components/ProblemDescription';
import EditorToolbar from '../components/EditorToolbar';
import CodeEditorContainer from '../components/CodeEditorContainer';
import TerminalPanel from '../components/TerminalPanel';
import ChallengePlaySkeleton from '../../../../shared/skeletons/ChallengePlaySkeleton';
import { judgeService } from '../../../../services/judgeService';
import { getToken } from '../../../../services/cookieUtils';

const MotionBox = motion.create(Box);

const MenuIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
);

const OWNER_STALE_MS = 6000;
const GRACE_PERIOD_SECONDS = 120;

const ChallengePlayPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const {
        selectedChallenge,
        selectChallenge,
        deselectChallenge,
        isLoadingChallenges,
        code,
        setCode,
        language,
        isChallengeSolved,
        isEditorLocked,
        editorSettings,
        pasteBlockedAfterReset,
        isEditorFullscreen,
        elapsedSeconds,
        setElapsedSeconds,
    } = useChallengeContext();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const leaveModal = useDisclosure();

    const [pendingLeaveAction, setPendingLeaveAction] = useState(null);
    const [tabBlocked, setTabBlocked] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [graceRemainingSeconds, setGraceRemainingSeconds] = useState(null);
    const [returnedFromGrace, setReturnedFromGrace] = useState(false);
    const [graceExpired, setGraceExpired] = useState(false);
    const [graceExpiryIso, setGraceExpiryIso] = useState(null);
    const [tabToken] = useState(() => `${crypto.randomUUID()}-${performance.now()}`);
    const tabTokenRef = useRef(tabToken);
    const lastLockedToastRef = useRef(0);
    const graceExpiredModal = useDisclosure();

    const starterCode = selectedChallenge?.starterCode?.[language] || '// Start coding here\n';
    const ownerKey = `challenge-active-owner:${id}`;
    const heartbeatKey = `challenge-active-heartbeat:${id}`;
    const takeoverKey = `challenge-active-takeover:${id}`;
    const graceStorageKey = `challenge-grace:${id}`;
    const attemptStorageKey = `challenge-attempt:${id}`;
    const hasUnsavedProgress = useMemo(() => {
        if (!selectedChallenge || isChallengeSolved) return false;
        return code.trim().length > 0 && code !== starterCode;
    }, [selectedChallenge, isChallengeSolved, code, starterCode]);
    const shouldProtectAttempt = useMemo(
        () => Boolean(selectedChallenge && attemptId && !isChallengeSolved && !graceExpired),
        [selectedChallenge, attemptId, isChallengeSolved, graceExpired],
    );

    useEffect(() => {
        if (id && !isLoadingChallenges) {
            selectChallenge(id);
        }
    }, [id, isLoadingChallenges, selectChallenge]);

    useEffect(() => {
        if (!id || !selectedChallenge || isChallengeSolved) return;
        let cancelled = false;

        const initializeAttempt = async () => {
            const progressDetail = await judgeService.getChallengeProgress(id).catch(() => null);
            if (progressDetail?.status === 'SOLVED') {
                return;
            }

            if (progressDetail?.attemptStatus === 'grace_period' && progressDetail?.gracePeriodExpiresAt) {
                const expiresAtMs = new Date(progressDetail.gracePeriodExpiresAt).getTime();
                const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
                if (remaining > 0) {
                    const resume = await judgeService.returnAttempt(id);
                    if (cancelled) return;
                    if (resume?.allowed) {
                        const snapshotRaw = localStorage.getItem(graceStorageKey);
                        const snapshot = snapshotRaw ? JSON.parse(snapshotRaw) : null;
                        setAttemptId(progressDetail?.attemptId || snapshot?.attemptId || null);
                        setReturnedFromGrace(true);
                        setGraceRemainingSeconds(Number(resume.remainingSeconds ?? resume.remainingTime ?? remaining));
                        setGraceExpiryIso(progressDetail.gracePeriodExpiresAt);
                        if (snapshot?.editorContent) setCode(snapshot.editorContent);
                        if (Number.isFinite(snapshot?.elapsedSeconds)) setElapsedSeconds(snapshot.elapsedSeconds);
                        localStorage.removeItem(graceStorageKey);
                        return;
                    }
                } else {
                    setGraceExpired(true);
                    await judgeService.abandonAttempt(id, 'timeout').catch(() => null);
                    if (!cancelled) graceExpiredModal.onOpen();
                    localStorage.removeItem(graceStorageKey);
                    return;
                }
            }

            const stored = localStorage.getItem(graceStorageKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    const expiresAtMs = new Date(parsed.gracePeriodExpiresAt).getTime();
                    const remaining = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
                    if (remaining > 0) {
                        const resume = await judgeService.returnAttempt(id);
                        if (cancelled) return;
                        if (resume?.allowed) {
                            setAttemptId(parsed.attemptId || null);
                            setReturnedFromGrace(true);
                            setGraceRemainingSeconds(Number(resume.remainingSeconds ?? resume.remainingTime ?? remaining));
                            setGraceExpiryIso(parsed.gracePeriodExpiresAt || null);
                            if (parsed.editorContent) setCode(parsed.editorContent);
                            if (Number.isFinite(parsed.elapsedSeconds)) setElapsedSeconds(parsed.elapsedSeconds);
                            localStorage.removeItem(graceStorageKey);
                            return;
                        }
                    }
                } catch {
                    // ignore malformed grace payload
                }

                localStorage.removeItem(graceStorageKey);
                setGraceExpired(true);
                await judgeService.abandonAttempt(id, 'timeout').catch(() => null);
                if (!cancelled) {
                    graceExpiredModal.onOpen();
                }
                return;
            }

            const started = await judgeService.startAttempt(id);
            if (cancelled) return;
            setAttemptId(started?.attemptId || null);
            setReturnedFromGrace(false);
            setGraceRemainingSeconds(null);
            setGraceExpiryIso(null);
            localStorage.setItem(attemptStorageKey, JSON.stringify({
                challengeId: id,
                attemptId: started?.attemptId || null,
                startedAt: started?.startedAt || new Date().toISOString(),
            }));
        };

        initializeAttempt().catch((error) => {
            console.error('Failed to initialize challenge attempt:', error);
        });

        return () => {
            cancelled = true;
        };
    }, [id, selectedChallenge, isChallengeSolved, graceStorageKey, attemptStorageKey, graceExpiredModal.onOpen, setCode, setElapsedSeconds]);

    useEffect(() => {
        if (!returnedFromGrace || !graceExpiryIso) return undefined;
        const expiryMs = new Date(graceExpiryIso).getTime();
        const tick = async () => {
            const next = Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
            setGraceRemainingSeconds(next);
            if (next > 0) return;
            setGraceExpired(true);
            await judgeService.abandonAttempt(id, 'timeout').catch(() => null);
            localStorage.removeItem(graceStorageKey);
            graceExpiredModal.onOpen();
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [returnedFromGrace, graceExpiryIso, id, graceExpiredModal.onOpen, graceStorageKey]);

    useEffect(() => {
        return () => deselectChallenge();
    }, [deselectChallenge]);

    const claimOwnership = useCallback(() => {
        localStorage.setItem(ownerKey, tabTokenRef.current);
        localStorage.setItem(heartbeatKey, JSON.stringify({ token: tabTokenRef.current, ts: Date.now() }));
    }, [ownerKey, heartbeatKey]);

    useEffect(() => {
        if (!id) return undefined;

        const owner = localStorage.getItem(ownerKey);
        const heartbeatRaw = localStorage.getItem(heartbeatKey);
        let stale = true;
        if (heartbeatRaw) {
            try {
                const heartbeat = JSON.parse(heartbeatRaw);
                stale = !heartbeat?.ts || Date.now() - heartbeat.ts > OWNER_STALE_MS;
            } catch {
                stale = true;
            }
        }

        if (!owner || owner === tabTokenRef.current || stale) {
            claimOwnership();
            queueMicrotask(() => setTabBlocked(false));
        } else {
            queueMicrotask(() => setTabBlocked(true));
        }

        const heartbeatInterval = setInterval(() => {
            if (localStorage.getItem(ownerKey) === tabTokenRef.current) {
                localStorage.setItem(heartbeatKey, JSON.stringify({ token: tabTokenRef.current, ts: Date.now() }));
            }
        }, 2000);

        const handleStorage = (event) => {
            if (event.key === takeoverKey && event.newValue) {
                try {
                    const payload = JSON.parse(event.newValue);
                    if (payload?.token && payload.token !== tabTokenRef.current) {
                        if (localStorage.getItem(ownerKey) === tabTokenRef.current) {
                            setTabBlocked(true);
                        }
                    }
                } catch {
                    // ignore malformed payload
                }
            }

            if (event.key === ownerKey && event.newValue && event.newValue !== tabTokenRef.current) {
                setTabBlocked(true);
            }
        };

        window.addEventListener('storage', handleStorage);

        const cleanup = () => {
            if (localStorage.getItem(ownerKey) === tabTokenRef.current) {
                localStorage.removeItem(ownerKey);
                localStorage.removeItem(heartbeatKey);
            }
        };

        window.addEventListener('beforeunload', cleanup);

        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('beforeunload', cleanup);
            cleanup();
        };
    }, [id, ownerKey, heartbeatKey, takeoverKey, claimOwnership]);

    const useThisTabInstead = () => {
        claimOwnership();
        localStorage.setItem(takeoverKey, JSON.stringify({ token: tabTokenRef.current, ts: Date.now() }));
        setTabBlocked(false);
    };

    const requestLeave = (action) => {
        if (shouldProtectAttempt) {
            setPendingLeaveAction(() => action);
            leaveModal.onOpen();
            return;
        }
        action();
    };

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        const handleBeforeUnload = (event) => {
            if (!shouldProtectAttempt) return;
            try {
                const token = getToken();
                const payload = JSON.stringify({ reason: 'tab_closed' });
                const url = `${apiBase}/challenges/${id}/attempt/leave`;
                if (token) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', url, false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(payload);
                } else if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                }

                localStorage.setItem(graceStorageKey, JSON.stringify({
                    challengeId: id,
                    attemptId,
                    leftAt: new Date().toISOString(),
                    gracePeriodExpiresAt: graceExpiryIso || new Date(Date.now() + GRACE_PERIOD_SECONDS * 1000).toISOString(),
                    editorContent: code,
                    elapsedSeconds,
                }));
            } catch {
                // do not block unload
            }
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [shouldProtectAttempt, id, attemptId, code, elapsedSeconds, graceExpiryIso, graceStorageKey]);

    useEffect(() => {
        const handleAnchorNavigation = (event) => {
            if (!shouldProtectAttempt) return;
            const anchor = event.target?.closest?.('a[href]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            if (anchor.target === '_blank') return;

            const url = new URL(href, window.location.origin);
            const nextPath = `${url.pathname}${url.search}${url.hash}`;
            const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            if (nextPath === currentPath) return;

            event.preventDefault();
            requestLeave(() => navigate(nextPath));
        };

        document.addEventListener('click', handleAnchorNavigation, true);
        return () => document.removeEventListener('click', handleAnchorNavigation, true);
    }, [shouldProtectAttempt, navigate]);

    useEffect(() => {
        const handlePopState = () => {
            if (!shouldProtectAttempt) return;
            window.history.pushState(null, '', window.location.href);
            requestLeave(() => navigate('/challenges'));
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [shouldProtectAttempt, navigate]);

    const handleLeaveConfirm = () => {
        const action = pendingLeaveAction;
        leaveModal.onClose();
        setPendingLeaveAction(null);
        if (action) {
            judgeService.leaveAttempt(id, 'left_page')
                .then((res) => {
                    const nextExpiry = res?.gracePeriodExpiresAt
                        || graceExpiryIso
                        || new Date(Date.now() + GRACE_PERIOD_SECONDS * 1000).toISOString();
                    setGraceExpiryIso(nextExpiry);
                    localStorage.setItem(graceStorageKey, JSON.stringify({
                        challengeId: id,
                        attemptId,
                        leftAt: new Date().toISOString(),
                        gracePeriodExpiresAt: nextExpiry,
                        editorContent: code,
                        elapsedSeconds,
                    }));
                })
                .catch((error) => {
                    console.error('Failed to set challenge grace period:', error);
                })
                .finally(() => action());
        }
    };

    const handleLockedInteraction = () => {
        if (!isEditorLocked) return;
        const now = Date.now();
        if (now - lastLockedToastRef.current < 2000) return;
        lastLockedToastRef.current = now;
        if (isChallengeSolved) return;
        toast({
            title: 'Timer is paused',
            description: 'Please resume to continue working on your solution.',
            status: 'warning',
            duration: 2200,
            isClosable: true,
        });
    };

    const handlePasteBlocked = () => {
        toast({
            title: 'Paste disabled',
            description: returnedFromGrace
                ? 'Paste is disabled after return. Please type your solution manually.'
                : 'Paste is disabled after reset. Please type your solution manually.',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

    const formatGrace = (seconds) => {
        const mins = Math.floor((seconds || 0) / 60);
        const secs = (seconds || 0) % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    const graceBannerTone = useMemo(() => {
        if (!returnedFromGrace || graceRemainingSeconds == null) return 'warning';
        if (graceRemainingSeconds <= 10) return 'critical';
        if (graceRemainingSeconds <= 30) return 'danger';
        return 'warning';
    }, [returnedFromGrace, graceRemainingSeconds]);

    useEffect(() => {
        if (!id || !attemptId || isChallengeSolved) return;
        localStorage.setItem(attemptStorageKey, JSON.stringify({
            challengeId: id,
            attemptId,
            startedAt: new Date().toISOString(),
            elapsedSeconds,
            editorContent: code,
        }));
    }, [id, attemptId, code, elapsedSeconds, isChallengeSolved, attemptStorageKey]);

    useEffect(() => {
        if (!isChallengeSolved) return;
        localStorage.removeItem(graceStorageKey);
        localStorage.removeItem(attemptStorageKey);
        setReturnedFromGrace(false);
        setGraceRemainingSeconds(null);
        setGraceExpiryIso(null);
    }, [isChallengeSolved, graceStorageKey, attemptStorageKey]);

    const notFoundHeadingColor = useColorModeValue('gray.800', 'gray.100');
    const notFoundTextColor = useColorModeValue('gray.500', 'gray.400');
    const headerBorderColor = useColorModeValue('gray.200', 'gray.700');
    const menuIconColor = useColorModeValue('gray.600', 'gray.300');
    const drawerTextColor = useColorModeValue('gray.800', 'gray.100');
    const drawerCloseIconColor = useColorModeValue('gray.500', 'gray.400');

    if (isLoadingChallenges) {
        return <ChallengePlaySkeleton />;
    }

    if (tabBlocked) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={6} bg="var(--color-bg-primary)">
                <Box
                    maxW="lg"
                    w="full"
                    p={8}
                    borderRadius="2xl"
                    bg="var(--color-bg-card)"
                    border="1px solid"
                    borderColor="var(--color-border)"
                    textAlign="center"
                >
                    <Text fontFamily="heading" fontWeight="bold" fontSize="2xl" mb={3} color="var(--color-text-heading)">
                        Challenge Already Open
                    </Text>
                    <Text color="var(--color-text-secondary)" mb={6}>
                        This challenge is already open in another tab. Please return to your existing session to continue.
                    </Text>
                    <Button colorScheme="cyan" onClick={useThisTabInstead}>
                        Use This Tab Instead
                    </Button>
                </Box>
            </Box>
        );
    }

    if (graceExpired) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={6} bg="var(--color-bg-primary)">
                <Box
                    maxW="xl"
                    w="full"
                    p={8}
                    borderRadius="2xl"
                    bg="var(--color-bg-card)"
                    border="1px solid"
                    borderColor="var(--color-border)"
                    textAlign="center"
                >
                    <Text fontFamily="heading" fontWeight="bold" fontSize="3xl" mb={3} color="var(--color-text-heading)">
                        ❌ Time&apos;s Up
                    </Text>
                    <Text color="var(--color-text-secondary)" mb={6}>
                        Your 120-second grace period has expired. This challenge attempt has been marked as abandoned.
                    </Text>
                    <Button colorScheme="orange" onClick={() => navigate('/challenges')}>
                        Back to Challenges
                    </Button>
                </Box>
            </Box>
        );
    }

    if (!selectedChallenge) {
        return (
            <Box
                minH="100vh"
                bg="var(--color-bg-primary)"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color={notFoundHeadingColor} mb={4}>
                        Challenge Not Found
                    </Text>
                    <Text color={notFoundTextColor} mb={6}>The requested challenge doesn't exist.</Text>
                    <Button variant="primary" onClick={() => navigate('/challenges')}>
                        Back to Challenges
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <>
            <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                h="100vh"
                minH="100vh"
                maxH="100vh"
                bg="var(--color-bg-primary)"
                display="flex"
                flexDirection="column"
                overflow="hidden"
            >
                <ChallengeHeader onAttemptLeave={requestLeave} />

                {returnedFromGrace && graceRemainingSeconds != null && (
                    <Flex
                        align="center"
                        justify="space-between"
                        px={{ base: 3, md: 5 }}
                        py={2.5}
                        borderBottom="1px solid"
                        borderColor={
                            graceBannerTone === 'critical'
                                ? 'red.400'
                                : graceBannerTone === 'danger'
                                    ? 'orange.400'
                                    : 'orange.300'
                        }
                        bg={
                            graceBannerTone === 'critical'
                                ? 'rgba(239,68,68,0.2)'
                                : graceBannerTone === 'danger'
                                    ? 'rgba(249,115,22,0.18)'
                                    : 'rgba(245,158,11,0.16)'
                        }
                        animation={graceBannerTone === 'critical' ? 'pulse 0.9s ease-in-out infinite' : undefined}
                    >
                        <HStack spacing={2.5}>
                            <Icon
                                as={FiClock}
                                color={graceBannerTone === 'critical' ? 'red.200' : 'orange.200'}
                                boxSize={4.5}
                            />
                            <Text
                                color={graceBannerTone === 'critical' ? 'red.100' : 'orange.100'}
                                fontWeight="semibold"
                                fontSize={{ base: 'sm', md: 'md' }}
                            >
                                Return Window: {formatGrace(graceRemainingSeconds)} remaining
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color="orange.100" display={{ base: 'none', md: 'block' }}>
                            Complete and submit before time runs out
                        </Text>
                    </Flex>
                )}

                {!isEditorFullscreen && (
                    <Box
                        display={{ base: 'block', lg: 'none' }}
                        p={2}
                        bg="var(--color-bg-secondary)"
                        borderBottom="1px solid"
                        borderColor={headerBorderColor}
                    >
                        <Button
                            size="sm"
                            variant="ghost"
                            color={menuIconColor}
                            leftIcon={<MenuIcon w={4} h={4} />}
                            onClick={onOpen}
                        >
                            View Problem
                        </Button>
                    </Box>
                )}

                <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="full">
                    <DrawerOverlay />
                    <DrawerContent bg="var(--color-bg-primary)" color={drawerTextColor}>
                        <DrawerCloseButton color={drawerCloseIconColor} />
                        <DrawerBody pt={12} px={6} overflowY="auto">
                            <ProblemTabs />
                            <ProblemDescription />
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                <Flex flex={1} direction={{ base: 'column', lg: 'row' }} overflow="hidden" minH={0}>
                    {!isEditorFullscreen && (
                        <Box
                            display={{ base: 'none', lg: 'flex' }}
                            flexDirection="column"
                            w={{ lg: '40%' }}
                            bg="var(--color-bg-primary)"
                            borderRight="1px solid"
                            borderColor={headerBorderColor}
                            overflow="hidden"
                        >
                            <Box
                                flex={1}
                                overflowY="auto"
                                p={5}
                                sx={{
                                    '&::-webkit-scrollbar': { width: '5px' },
                                    '&::-webkit-scrollbar-track': { bg: 'var(--color-bg-primary)' },
                                    '&::-webkit-scrollbar-thumb': { bg: 'var(--color-border)', borderRadius: '3px' },
                                    overscrollBehavior: 'contain',
                                }}
                            >
                                <ProblemTabs />
                                <ProblemDescription />
                            </Box>
                        </Box>
                    )}

                    <Flex
                        w={{ base: '100%', lg: isEditorFullscreen ? '100%' : '60%' }}
                        direction="column"
                        bg="var(--color-bg-primary)"
                        overflow="hidden"
                        minH={0}
                    >
                        <EditorToolbar />

                        <CodeEditorContainer
                            code={code}
                            setCode={setCode}
                            language={language}
                            readOnly={isEditorLocked || graceExpired}
                            pasteBlocked={pasteBlockedAfterReset || returnedFromGrace}
                            editorSettings={editorSettings}
                            onLockedInteraction={handleLockedInteraction}
                            onPasteBlocked={handlePasteBlocked}
                        />
                        {returnedFromGrace && graceRemainingSeconds != null && graceRemainingSeconds > 0 && !isChallengeSolved && (
                            <Flex
                                align="center"
                                gap={2}
                                px={3}
                                py={2}
                                bg="rgba(245, 158, 11, 0.12)"
                                borderTop="1px solid rgba(245, 158, 11, 0.35)"
                                borderBottom="1px solid rgba(245, 158, 11, 0.2)"
                            >
                                <Icon as={FiAlertTriangle} color="orange.300" />
                                <Text fontSize="sm" color="orange.200">
                                    Paste disabled during return window
                                </Text>
                            </Flex>
                        )}

                        <TerminalPanel />
                    </Flex>
                </Flex>
            </MotionBox>

            <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                    <ModalHeader>Leaving Challenge?</ModalHeader>
                    <ModalBody color="var(--color-text-secondary)">
                        <VStack align="stretch" spacing={4}>
                            <HStack spacing={3} align="center">
                                <Icon as={FiClock} color="orange.300" boxSize={5} />
                                <Text>
                                    If you leave now, you will have 2 minutes to return and complete this challenge.
                                </Text>
                            </HStack>
                            <Text>After 2 minutes, this attempt will be marked as abandoned.</Text>
                            <Box
                                px={4}
                                py={3}
                                borderRadius="xl"
                                border="1px solid rgba(245,158,11,0.35)"
                                bg="rgba(245,158,11,0.12)"
                                textAlign="center"
                            >
                                <Text fontFamily="mono" fontSize="3xl" fontWeight="bold" color="orange.300">
                                    2:00
                                </Text>
                            </Box>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={leaveModal.onClose}>Stay and Continue</Button>
                        <Button variant="outline" colorScheme="orange" onClick={handleLeaveConfirm}>Leave Challenge</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={graceExpiredModal.isOpen} onClose={() => {}} isCentered closeOnOverlayClick={false}>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                    <ModalHeader>
                        <HStack spacing={2}>
                            <Icon as={FaHourglassHalf} color="red.300" />
                            <Text>Time&apos;s Up</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalBody color="var(--color-text-secondary)">
                        <Text mb={2}>
                            Your 2-minute return window has expired. This attempt has been marked as incomplete.
                        </Text>
                        <Text>You can start a new attempt from the challenges page.</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="orange" onClick={() => navigate('/challenges')}>
                            Back to Challenges
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ChallengePlayPage;
