/**
 * ChallengeHeader - top navigation bar for the play page.
 */
import React from 'react';
import {
    Flex,
    Box,
    Text,
    Button,
    Icon,
    IconButton,
    Tooltip,
    HStack,
    useColorModeValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META } from '../data/mockChallenges';
import useChallengeExecution from '../hooks/useChallengeExecution';

const ArrowLeftIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </Icon>
);

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

const getChronoColor = (secs) => {
    if (secs < 900) return { color: '#22d3ee', glow: 'rgba(34,211,238,0.25)', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.2)' };
    if (secs < 1800) return { color: '#facc15', glow: 'rgba(250,204,21,0.22)', bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.2)' };
    return { color: '#f97316', glow: 'rgba(249,115,22,0.22)', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)' };
};

const ChallengeHeader = ({ onAttemptLeave }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        selectedChallenge,
        isSubmitting,
        isRunning,
        isPaused,
        isChallengeSolved,
        code,
        elapsedSeconds,
        pauseSession,
        resumeSession,
        resetWorkspace,
    } = useChallengeContext();
    const { submitCode } = useChallengeExecution();
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const iconColor = useColorModeValue('gray.500', 'gray.400');
    const iconHoverColor = useColorModeValue('gray.800', 'gray.100');
    const iconHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');
    const titleColor = useColorModeValue('gray.800', 'gray.100');

    if (!selectedChallenge) return null;

    const diffMeta = DIFFICULTY_META[selectedChallenge.difficulty];
    const { color, glow, bg, border } = getChronoColor(elapsedSeconds);

    const handleBack = () => {
        if (onAttemptLeave) {
            onAttemptLeave(() => navigate('/challenges'));
            return;
        }
        navigate('/challenges');
    };

    const handlePauseToggle = () => {
        if (isChallengeSolved) return;
        if (isPaused) resumeSession();
        else pauseSession();
    };

    const handleResetConfirmed = () => {
        resetWorkspace();
        toast({
            title: t('challengePage.workspaceResetToast'),
            description: t('challengePage.workspaceResetToastDesc'),
            status: 'info',
            duration: 3000,
            isClosable: true,
        });
        onClose();
    };

    const submitDisabled = isChallengeSolved || !code.trim() || isRunning || isPaused;

    return (
        <>
            <Flex
                backdropFilter="blur(12px)"
                bg="var(--color-bg-secondary)"
                borderBottom="1px solid"
                borderColor={borderColor}
                px={4}
                py={2.5}
                align="center"
                justify="space-between"
                gap={2}
            >
                <Flex align="center" gap={3} minW={0}>
                    <IconButton
                        icon={<ArrowLeftIcon w={5} h={5} />}
                        variant="ghost"
                        color={iconColor}
                        _hover={{ color: iconHoverColor, bg: iconHoverBg }}
                        onClick={handleBack}
                        aria-label={t('challengePage.backToChallengesAria')}
                        size="sm"
                        flexShrink={0}
                    />
                    <Box minW={0}>
                        <Text fontFamily="heading" fontWeight="bold" color={titleColor} fontSize="sm" noOfLines={1}>
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
                            {isChallengeSolved && (
                                <Box
                                    px={1.5}
                                    py={0.5}
                                    borderRadius="4px"
                                    bg="rgba(34, 197, 94, 0.12)"
                                    border="1px solid rgba(34, 197, 94, 0.4)"
                                    fontSize="10px"
                                    fontWeight="bold"
                                    color="green.300"
                                    fontFamily="mono"
                                >
                                    {t('challengePage.solved')}
                                </Box>
                            )}
                        </HStack>
                    </Box>
                </Flex>

                <HStack spacing={3} flexShrink={0}>
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
                        <Box color={color} flexShrink={0} opacity={0.85}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="9" />
                                <polyline points="12 7 12 12 15 15" />
                                <path d="M9.5 3.5h5" />
                            </svg>
                        </Box>
                        <Box>
                            <Text fontSize="8px" fontFamily="mono" color={color} letterSpacing="0.1em" lineHeight={1} textTransform="uppercase" opacity={0.65}>
                                {isPaused ? t('challengePage.timerPausedLabel') : isChallengeSolved ? t('challengePage.timerSolvedLabel') : t('challengePage.timerElapsedLabel')}
                            </Text>
                            <Text
                                fontFamily="mono"
                                fontSize="sm"
                                fontWeight="bold"
                                color={color}
                                letterSpacing="0.1em"
                                lineHeight={1.2}
                                style={{ textShadow: !isPaused && !isChallengeSolved ? `0 0 10px ${glow}` : 'none' }}
                            >
                                {fmtElapsed(elapsedSeconds)}
                            </Text>
                        </Box>
                    </Flex>

                    <Tooltip label={isPaused ? t('challengePage.resumeTooltip') : t('challengePage.pauseTooltip')} placement="bottom" hasArrow>
                        <Box
                            as="button"
                            onClick={handlePauseToggle}
                            w="26px"
                            h="26px"
                            borderRadius="6px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color={isPaused ? 'green.400' : 'gray.400'}
                            bg={isPaused ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)'}
                            border="1px solid"
                            borderColor={isPaused ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}
                            _hover={{ bg: isPaused ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)' }}
                            transition="all 0.2s"
                            opacity={isChallengeSolved ? 0.5 : 1}
                            pointerEvents={isChallengeSolved ? 'none' : 'auto'}
                        >
                            {isPaused ? <PlayIcon /> : <PauseIcon />}
                        </Box>
                    </Tooltip>

                    <Tooltip label={t('challengePage.resetTimerAndCode')} placement="bottom" hasArrow>
                        <Box
                            as="button"
                            onClick={onOpen}
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
                            opacity={isChallengeSolved ? 0.5 : 1}
                            pointerEvents={isChallengeSolved ? 'none' : 'auto'}
                        >
                            <ResetIcon />
                        </Box>
                    </Tooltip>

                    <Button
                        size="sm"
                        variant="primary"
                        fontWeight="bold"
                        fontSize="xs"
                        onClick={submitCode}
                        isLoading={isSubmitting}
                        isDisabled={submitDisabled}
                        loadingText={t('challengePage.submitting')}
                        h="30px"
                        boxShadow={submitDisabled ? 'none' : '0 0 16px rgba(34,211,238,0.25)'}
                    >
                        {isChallengeSolved ? t('challengePage.alreadySolved') : t('challengePage.submitSolution')}
                    </Button>
                </HStack>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
                <ModalContent bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                    <ModalHeader>{t('challengePage.resetWorkspaceTitle')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody color="var(--color-text-secondary)">
                        {t('challengePage.resetWorkspaceDesc')}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>{t('challengePage.cancel')}</Button>
                        <Button colorScheme="red" onClick={handleResetConfirmed}>{t('challengePage.reset')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ChallengeHeader;
