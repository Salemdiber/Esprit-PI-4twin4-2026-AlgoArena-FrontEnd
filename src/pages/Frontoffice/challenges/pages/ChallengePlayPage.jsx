/**
 * ChallengePlayPage - /challenges/:id
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    ModalCloseButton,
    HStack,
    VStack,
    Stack,
    Spinner,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    IconButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiBookmark, FiCheckCircle, FiClock, FiPlay, FiSave, FiStar, FiX } from 'react-icons/fi';
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
const AUTOSAVE_INTERVAL_MS = 30000;
const AUTOSAVE_DEBOUNCE_MS = 5000;
const XP_REDUCTION_THRESHOLD_SECONDS = 3600;

const ChallengePlayPage = () => {
    const { t } = useTranslation();
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
        isPaused,
        submitSolution,
        rankUpgradeEvent,
        dismissRankUpgrade,
    } = useChallengeContext();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const leaveModal = useDisclosure();
    const [pendingLeaveAction, setPendingLeaveAction] = useState(null);
    const [tabBlocked, setTabBlocked] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [showOverHourHint, setShowOverHourHint] = useState(true);
    const [showFullXpHint, setShowFullXpHint] = useState(true);
    const [saveState, setSaveState] = useState({ status: 'idle', savedAt: null });
    const [tabToken] = useState(() => `${crypto.randomUUID()}-${performance.now()}`);
    const tabTokenRef = useRef(tabToken);
    const lastLockedToastRef = useRef(0);
    const saveInFlightRef = useRef(false);
    const resumeToastShownRef = useRef(false);

    const starterCode = selectedChallenge?.starterCode?.[language] || '// Start coding here\n';
    const ownerKey = `challenge-active-owner:${id}`;
    const heartbeatKey = `challenge-active-heartbeat:${id}`;
    const takeoverKey = `challenge-active-takeover:${id}`;
    const attemptStorageKey = `challenge-attempt:${id}`;

    const hasUnsavedProgress = useMemo(() => {
        if (!selectedChallenge || isChallengeSolved) return false;
        return code.trim().length > 0 && code !== starterCode;
    }, [selectedChallenge, isChallengeSolved, code, starterCode]);

    const shouldProtectAttempt = useMemo(
        () => Boolean(selectedChallenge && !isChallengeSolved),
        [selectedChallenge, isChallengeSolved],
    );

    const modeAwareOverHour = elapsedSeconds > XP_REDUCTION_THRESHOLD_SECONDS;
    const fullXpMinutesRemaining = Math.max(0, Math.floor((XP_REDUCTION_THRESHOLD_SECONDS - elapsedSeconds) / 60));

    const saveAttemptSnapshot = useCallback(async (reason = 'manual_save') => {
        if (!id || !selectedChallenge || isChallengeSolved) return null;
        if (saveInFlightRef.current) return null;
        saveInFlightRef.current = true;
        setSaveState((prev) => ({ ...prev, status: 'saving' }));
        try {
            const response = await judgeService.saveAttempt(id, {
                attemptId,
                savedCode: code,
                elapsedTime: elapsedSeconds,
                mode: 'challenge',
                reason,
            });
            if (response?.attemptId) {
                setAttemptId(response.attemptId);
            }
            const savedAt = response?.savedAt || new Date().toISOString();
            setSaveState({ status: 'saved', savedAt });
            localStorage.setItem(attemptStorageKey, JSON.stringify({
                challengeId: id,
                attemptId: response?.attemptId || attemptId || null,
                startedAt: response?.startedAt || new Date().toISOString(),
                savedCode: code,
                elapsedTime: elapsedSeconds,
            }));
            return response;
        } catch (error) {
            console.error('Failed to save challenge attempt snapshot:', error);
            setSaveState({ status: 'error', savedAt: null });
            return null;
        } finally {
            saveInFlightRef.current = false;
        }
    }, [id, selectedChallenge, isChallengeSolved, attemptId, code, elapsedSeconds, attemptStorageKey]);

    useEffect(() => {
        if (id && !isLoadingChallenges) {
            selectChallenge(id);
        }
    }, [id, isLoadingChallenges, selectChallenge]);

    useEffect(() => {
        if (!id || !selectedChallenge || isChallengeSolved) return;
        let cancelled = false;

        const initializeAttempt = async () => {
            const started = await judgeService.startAttempt(id);
            if (cancelled) return;
            setAttemptId(started?.attemptId || null);

            const hasSavedCode = typeof started?.savedCode === 'string' && started.savedCode.length > 0;
            if (hasSavedCode) setCode(started.savedCode);
            if (Number.isFinite(started?.elapsedTime)) setElapsedSeconds(Number(started.elapsedTime));

            localStorage.setItem(attemptStorageKey, JSON.stringify({
                challengeId: id,
                attemptId: started?.attemptId || null,
                startedAt: started?.startedAt || new Date().toISOString(),
                savedCode: started?.savedCode || '',
                elapsedTime: Number(started?.elapsedTime || 0),
            }));

            if (started?.resumed && !resumeToastShownRef.current) {
                resumeToastShownRef.current = true;
                toast({
                    title: t('challengePage.welcomeBack'),
                    description: t('challengePage.progressSaved'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right',
                    icon: <Icon as={FiPlay} />,
                });
            }
        };

        initializeAttempt().catch((error) => {
            console.error('Failed to initialize challenge attempt:', error);
        });

        return () => {
            cancelled = true;
        };
    }, [id, selectedChallenge, isChallengeSolved, attemptStorageKey, setCode, setElapsedSeconds, toast]);

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
        if (shouldProtectAttempt && hasUnsavedProgress) {
            setPendingLeaveAction(() => action);
            leaveModal.onOpen();
            return;
        }
        action();
    };

    useEffect(() => {
        if (!shouldProtectAttempt) return undefined;
        const timer = setInterval(() => {
            saveAttemptSnapshot('manual_save');
        }, AUTOSAVE_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [shouldProtectAttempt, saveAttemptSnapshot]);

    useEffect(() => {
        if (!shouldProtectAttempt) return undefined;
        const timer = setTimeout(() => {
            saveAttemptSnapshot('manual_save');
        }, AUTOSAVE_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [code, shouldProtectAttempt, saveAttemptSnapshot]);

    useEffect(() => {
        if (!shouldProtectAttempt || !isPaused || isChallengeSolved) return;
        saveAttemptSnapshot('manual_save');
    }, [isPaused, shouldProtectAttempt, saveAttemptSnapshot, isChallengeSolved]);

    useEffect(() => {
        if (saveState.status !== 'saved') return undefined;
        const timer = setTimeout(() => {
            setSaveState((prev) => (prev.status === 'saved' ? { ...prev, status: 'idle' } : prev));
        }, 3000);
        return () => clearTimeout(timer);
    }, [saveState.status]);

    useEffect(() => {
        if (!shouldProtectAttempt) return undefined;
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        const handleBeforeUnload = (event) => {
            if (!hasUnsavedProgress || isChallengeSolved) return;
            try {
                const token = getToken();
                const payload = JSON.stringify({
                    attemptId,
                    reason: 'tab_closed',
                    savedCode: code,
                    elapsedTime: elapsedSeconds,
                    mode: 'challenge',
                });
                const url = `${apiBase}/challenges/${id}/attempt/save`;
                if (token) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', url, false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(payload);
                } else if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
                }
            } catch {
                // do not block unload
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [shouldProtectAttempt, hasUnsavedProgress, isChallengeSolved, attemptId, code, elapsedSeconds, id]);

    useEffect(() => {
        const handleAnchorNavigation = (event) => {
            if (!shouldProtectAttempt || !hasUnsavedProgress) return;
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
    }, [shouldProtectAttempt, hasUnsavedProgress, navigate]);

    useEffect(() => {
        const handlePopState = () => {
            if (!shouldProtectAttempt || !hasUnsavedProgress) return;
            window.history.pushState(null, '', window.location.href);
            requestLeave(() => navigate('/challenges'));
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [shouldProtectAttempt, hasUnsavedProgress, navigate]);

    useEffect(() => {
        if (!showFullXpHint || modeAwareOverHour || isChallengeSolved) return undefined;
        const timer = setTimeout(() => setShowFullXpHint(false), 10000);
        return () => clearTimeout(timer);
    }, [showFullXpHint, modeAwareOverHour, isChallengeSolved]);

    const handleLeaveConfirm = async () => {
        const action = pendingLeaveAction;
        leaveModal.onClose();
        setPendingLeaveAction(null);
        await saveAttemptSnapshot('left_page');
        if (action) action();
    };

    const handleSubmitFromModal = async () => {
        leaveModal.onClose();
        setPendingLeaveAction(null);
        await submitSolution('submit');
    };

    const handleLockedInteraction = () => {
        if (!isEditorLocked) return;
        const now = Date.now();
        if (now - lastLockedToastRef.current < 2000) return;
        lastLockedToastRef.current = now;
        if (isChallengeSolved) return;
        toast({
            title: t('challengePage.timerPaused'),
            description: t('challengePage.resumeToContinue'),
            status: 'warning',
            duration: 2200,
            isClosable: true,
        });
    };

    const handlePasteBlocked = () => {
        toast({
            title: t('challengePage.pasteDisabledTitle'),
            description: t('challengePage.pasteDisabledDesc'),
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

    const autosaveIndicator = useMemo(() => {
        if (saveState.status === 'saving') {
            return {
                icon: <Spinner size="xs" color="blue.300" />,
                label: t('challengePage.saving'),
                color: 'blue.300',
            };
        }
        if (saveState.status === 'saved') {
            return {
                icon: <Icon as={FiCheckCircle} color="green.300" boxSize={3.5} />,
                label: saveState.savedAt ? t('challengePage.savedAt', { time: new Date(saveState.savedAt).toLocaleTimeString() }) : t('challengePage.saved'),
                color: 'green.300',
            };
        }
        if (saveState.status === 'error') {
            return {
                icon: <Icon as={FiSave} color="orange.300" boxSize={3.5} />,
                label: t('challengePage.saveFailed'),
                color: 'orange.300',
            };
        }
        return null;
    }, [saveState]);

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
                        {t('challengePage.challengeAlreadyOpen')}
                    </Text>
                    <Text color="var(--color-text-secondary)" mb={6}>
                        {t('challengePage.challengeAlreadyOpenDesc')}
                    </Text>
                    <Button colorScheme="cyan" onClick={useThisTabInstead}>
                        {t('challengePage.useThisTab')}
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
                        {t('challengePage.challengeNotFound')}
                    </Text>
                    <Text color={notFoundTextColor} mb={6}>{t('challengePage.challengeNotFoundDesc')}</Text>
                    <Button variant="primary" onClick={() => navigate('/challenges')}>
                        {t('challengePage.backToChallenges')}
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
                            {t('challengePage.viewProblem')}
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

                        {modeAwareOverHour && !isChallengeSolved && showOverHourHint && (
                            <Alert
                                status="warning"
                                borderRadius="none"
                                bg="rgba(245, 158, 11, 0.16)"
                                borderBottom="1px solid rgba(245, 158, 11, 0.32)"
                            >
                                <AlertIcon as={FiClock} color="orange.300" />
                                <Box flex="1">
                                    <AlertTitle color="orange.100" fontSize="sm">{t('challengePage.xpUpdate')}</AlertTitle>
                                    <AlertDescription color="orange.200" fontSize="sm">
                                        {t('challengePage.xpReducedAlert', { reduced: Math.floor(Number(selectedChallenge?.xpReward || 0) * 0.5), full: Number(selectedChallenge?.xpReward || 0) })}
                                    </AlertDescription>
                                </Box>
                                <IconButton
                                    aria-label={t('challengePage.dismissXpInfo')}
                                    icon={<FiX />}
                                    size="sm"
                                    variant="ghost"
                                    color="orange.200"
                                    onClick={() => setShowOverHourHint(false)}
                                />
                            </Alert>
                        )}

                        {!modeAwareOverHour && !isChallengeSolved && showFullXpHint && (
                            <Box px={3} py={2} bg="rgba(34, 211, 238, 0.1)" borderBottom="1px solid rgba(34, 211, 238, 0.24)">
                                <Text fontSize="sm" color="cyan.200">
                                    {t('challengePage.fullXpAvailable', { minutes: fullXpMinutesRemaining })}
                                </Text>
                            </Box>
                        )}

                        <CodeEditorContainer
                            code={code}
                            setCode={setCode}
                            language={language}
                            readOnly={isEditorLocked}
                            pasteBlocked={pasteBlockedAfterReset}
                            editorSettings={editorSettings}
                            onLockedInteraction={handleLockedInteraction}
                            onPasteBlocked={handlePasteBlocked}
                        />

                        {autosaveIndicator && (
                            <Flex
                                align="center"
                                justify="flex-end"
                                gap={2}
                                px={3}
                                py={1.5}
                                bg="rgba(15, 23, 42, 0.55)"
                                borderTop="1px solid rgba(148, 163, 184, 0.22)"
                            >
                                {autosaveIndicator.icon}
                                <Text fontSize="xs" color={autosaveIndicator.color}>
                                    {autosaveIndicator.label}
                                </Text>
                            </Flex>
                        )}

                        <TerminalPanel />
                    </Flex>
                </Flex>
            </MotionBox>

            <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose} isCentered size="lg">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)" boxShadow="0 24px 50px rgba(15,23,42,0.45)" overflow="hidden">
                    <Box h="3px" bg="linear-gradient(90deg, #f59e0b, #facc15)" />
                    <ModalCloseButton />
                    <ModalHeader>
                        <HStack spacing={2}>
                            <Icon as={FiBookmark} color="amber.300" boxSize={6} />
                            <Text>{t('challengePage.saveAndLeave')}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalBody color="var(--color-text-secondary)">
                        <VStack align="stretch" spacing={4}>
                            <Text>
                                {t('challengePage.progressWillBeSaved')}
                            </Text>
                            <Flex align="center" gap={2.5} color="var(--color-text-muted)">
                                <Icon as={FiClock} color="orange.300" />
                                <Text>{t('challengePage.workingFor', { minutes: Math.max(1, Math.floor(elapsedSeconds / 60)) })}</Text>
                            </Flex>
                            <Alert status="info" variant="subtle" borderRadius="md">
                                <AlertIcon />
                                <Text fontSize="sm">
                                    {t('challengePage.xpReductionNote')}
                                </Text>
                            </Alert>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={3} w="full">
                            <Button colorScheme="blue" leftIcon={<Icon as={FiPlay} />} px={6} py={3} onClick={leaveModal.onClose} w={{ base: 'full', md: 'auto' }}>
                                {t('challengePage.continueCoding')}
                            </Button>
                            <Button variant="outline" colorScheme="orange" leftIcon={<Icon as={FiBookmark} />} px={6} py={3} onClick={handleLeaveConfirm} w={{ base: 'full', md: 'auto' }}>
                                {t('challengePage.saveAndLeave')}
                            </Button>
                            {code.trim().length > 0 && (
                                <Button variant="ghost" colorScheme="green" leftIcon={<Icon as={FiCheckCircle} />} px={6} py={3} onClick={handleSubmitFromModal} w={{ base: 'full', md: 'auto' }}>
                                    {t('challengePage.submitSolution')}
                                </Button>
                            )}
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={Boolean(rankUpgradeEvent)} onClose={dismissRankUpgrade} isCentered size="lg" closeOnOverlayClick={false}>
                <ModalOverlay bg="blackAlpha.700" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid var(--color-border)" textAlign="center" py={4}>
                    <ModalHeader>
                        <VStack spacing={2}>
                            <Icon as={FiStar} boxSize={10} color={rankUpgradeEvent?.newRank?.badgeColor || '#facc15'} />
                            <Text fontSize="3xl" fontWeight="black">{t('challengePage.rankUp')}</Text>
                            <Text fontSize="md" color="var(--color-text-secondary)">
                                {t('challengePage.youAreNow', { rank: rankUpgradeEvent?.newRank?.name || '', title: rankUpgradeEvent?.newRank?.title || '' })}
                            </Text>
                        </VStack>
                    </ModalHeader>
                    <ModalBody>
                        <Text color="var(--color-text-muted)">
                            {t('challengePage.rankTransition', { prevRank: rankUpgradeEvent?.previousRank?.name || t('challengePage.previous'), prevTitle: rankUpgradeEvent?.previousRank?.title || '', newRank: rankUpgradeEvent?.newRank?.name || t('challengePage.new'), newTitle: rankUpgradeEvent?.newRank?.title || '' })}
                        </Text>
                    </ModalBody>
                    <ModalFooter justifyContent="center">
                        <Button colorScheme="yellow" onClick={dismissRankUpgrade}>{t('challengePage.continue')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ChallengePlayPage;
