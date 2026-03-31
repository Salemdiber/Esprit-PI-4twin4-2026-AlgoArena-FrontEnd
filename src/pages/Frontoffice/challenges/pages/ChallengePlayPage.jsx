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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useChallengeContext } from '../context/ChallengeContext';
import ChallengeHeader from '../components/ChallengeHeader';
import ProblemTabs from '../components/ProblemTabs';
import ProblemDescription from '../components/ProblemDescription';
import EditorToolbar from '../components/EditorToolbar';
import CodeEditorContainer from '../components/CodeEditorContainer';
import TerminalPanel from '../components/TerminalPanel';
import ChallengePlaySkeleton from '../../../../shared/skeletons/ChallengePlaySkeleton';

const MotionBox = motion.create(Box);

const MenuIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
);

const OWNER_STALE_MS = 6000;

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
    } = useChallengeContext();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const leaveModal = useDisclosure();

    const [pendingLeaveAction, setPendingLeaveAction] = useState(null);
    const [tabBlocked, setTabBlocked] = useState(false);
    const [tabToken] = useState(() => `${crypto.randomUUID()}-${performance.now()}`);
    const tabTokenRef = useRef(tabToken);
    const lastLockedToastRef = useRef(0);

    const starterCode = selectedChallenge?.starterCode?.[language] || '// Start coding here\n';
    const hasUnsavedProgress = useMemo(() => {
        if (!selectedChallenge || isChallengeSolved) return false;
        return code.trim().length > 0 && code !== starterCode;
    }, [selectedChallenge, isChallengeSolved, code, starterCode]);

    useEffect(() => {
        if (id && !isLoadingChallenges) {
            selectChallenge(id);
        }
    }, [id, isLoadingChallenges, selectChallenge]);

    useEffect(() => {
        return () => deselectChallenge();
    }, [deselectChallenge]);

    const ownerKey = `challenge-active-owner:${id}`;
    const heartbeatKey = `challenge-active-heartbeat:${id}`;
    const takeoverKey = `challenge-active-takeover:${id}`;

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
        if (hasUnsavedProgress) {
            setPendingLeaveAction(() => action);
            leaveModal.onOpen();
            return;
        }
        action();
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!hasUnsavedProgress) return;
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedProgress]);

    useEffect(() => {
        const handleAnchorNavigation = (event) => {
            if (!hasUnsavedProgress) return;
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
    }, [hasUnsavedProgress, navigate]);

    useEffect(() => {
        const handlePopState = () => {
            if (!hasUnsavedProgress) return;
            window.history.pushState(null, '', window.location.href);
            requestLeave(() => navigate('/challenges'));
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [hasUnsavedProgress, navigate]);

    const handleLeaveConfirm = () => {
        const action = pendingLeaveAction;
        leaveModal.onClose();
        setPendingLeaveAction(null);
        if (action) action();
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
            description: 'Paste is disabled after reset. Please type your solution manually.',
            status: 'info',
            duration: 2000,
            isClosable: true,
        });
    };

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
                            readOnly={isEditorLocked}
                            pasteBlocked={pasteBlockedAfterReset}
                            editorSettings={editorSettings}
                            onLockedInteraction={handleLockedInteraction}
                            onPasteBlocked={handlePasteBlocked}
                        />

                        <TerminalPanel />
                    </Flex>
                </Flex>
            </MotionBox>

            <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                    <ModalHeader>Leave Challenge?</ModalHeader>
                    <ModalBody color="var(--color-text-secondary)">
                        You have unsaved progress. If you leave now, your code and timer progress will be lost. Are you sure you want to leave?
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={leaveModal.onClose}>Stay</Button>
                        <Button colorScheme="red" onClick={handleLeaveConfirm}>Leave</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ChallengePlayPage;
