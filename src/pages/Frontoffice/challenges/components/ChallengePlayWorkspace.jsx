/**
 * ChallengePlayWorkspace - interactive UI shell for the challenge play page.
 */
import React, { Suspense } from 'react';
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerCloseButton,
    DrawerContent,
    DrawerOverlay,
    Flex,
    HStack,
    Icon,
    IconButton,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useColorModeValue,
    useDisclosure,
    VStack,
} from '@chakra-ui/react';
import { FiBookmark, FiCheckCircle, FiClock, FiInfo, FiPlay, FiSave, FiStar, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useChallengeContext } from '../context/ChallengeContext';
import ChallengeHeader from './ChallengeHeader';
import EditorToolbar from './EditorToolbar';
import ProblemDescription from './ProblemDescription';
import ProblemTabs from './ProblemTabs';
import TerminalPanel from './TerminalPanel';
import CodeEditorContainer from './CodeEditorContainer';

const MenuIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
);

const ChallengePlayWorkspace = ({
    onAttemptLeave,
    modeAwareOverHour,
    showOverHourHint,
    setShowOverHourHint,
    showFullXpHint,
    fullXpMinutesRemaining,
    autosaveIndicator,
    leaveModal,
    handleLeaveConfirm,
    handleSubmitFromModal,
    handleLockedInteraction,
    handlePasteBlocked,
}) => {
    const { t } = useTranslation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        selectedChallenge,
        code,
        setCode,
        language,
        isChallengeSolved,
        isEditorLocked,
        editorSettings,
        pasteBlockedAfterReset,
        isEditorFullscreen,
        elapsedSeconds,
        rankUpgradeEvent,
        dismissRankUpgrade,
    } = useChallengeContext();

    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const menuIconColor = useColorModeValue('gray.600', 'gray.300');
    const drawerTextColor = useColorModeValue('gray.800', 'gray.100');
    const drawerCloseIconColor = useColorModeValue('gray.500', 'gray.400');

    if (!selectedChallenge) return null;

    return (
        <>
            <ChallengeHeader onAttemptLeave={onAttemptLeave} />

            {!isEditorFullscreen && (
                <Box
                    display={{ base: 'block', lg: 'none' }}
                    p={2}
                    bg="var(--color-bg-secondary)"
                    borderBottom="1px solid"
                    borderColor={borderColor}
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
                        borderColor="var(--color-border)"
                        overflow="hidden"
                    >
                        <Box
                            flex={1}
                            overflowY="auto"
                            p={5}
                            sx={{
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
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

                    <Suspense
                        fallback={(
                            <Flex
                                flex={1}
                                align="center"
                                justify="center"
                                bg="#0f172a"
                                color="gray.400"
                                minH={0}
                            >
                                <Spinner size="lg" thickness="3px" color="#22d3ee" />
                            </Flex>
                        )}
                    >
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
                    </Suspense>

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

            <Modal isOpen={leaveModal.isOpen} onClose={leaveModal.onClose} isCentered size={{ base: 'sm', md: 'xl' }}>
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
                <ModalContent
                    bg="var(--color-bg-card)"
                    border="1px solid"
                    borderColor="var(--color-border)"
                    boxShadow="0 32px 64px rgba(0,0,0,0.35), 0 0 0 1px rgba(148,163,184,0.08)"
                    overflow="hidden"
                    borderRadius="16px"
                    mx={4}
                >
                    <Box h="3px" bgGradient="linear(to-r, #f59e0b, #facc15, #f59e0b)" />

                    <ModalHeader pt={6} pb={2} px={6}>
                        <HStack spacing={3}>
                            <Flex
                                w={10}
                                h={10}
                                borderRadius="12px"
                                bg="rgba(245, 158, 11, 0.12)"
                                border="1px solid rgba(245, 158, 11, 0.2)"
                                align="center"
                                justify="center"
                                flexShrink={0}
                            >
                                <Icon as={FiBookmark} color="orange.400" boxSize={5} />
                            </Flex>
                            <Text fontSize="lg" fontWeight="bold" color="var(--color-text-heading)">
                                {t('challengePage.saveAndLeaveTitle')}
                            </Text>
                        </HStack>
                    </ModalHeader>

                    <ModalBody color="var(--color-text-secondary)" px={6} py={4}>
                        <VStack align="stretch" spacing={4}>
                            <Text fontSize="sm" lineHeight="1.7">
                                {t('challengePage.progressWillBeSaved')}
                            </Text>

                            <Flex
                                align="center"
                                gap={2.5}
                                px={3}
                                py={2.5}
                                borderRadius="10px"
                                bg="rgba(245, 158, 11, 0.06)"
                                border="1px solid rgba(245, 158, 11, 0.12)"
                            >
                                <Icon as={FiClock} color="orange.400" boxSize={4} flexShrink={0} />
                                <Text fontSize="sm" color="var(--color-text-muted)">
                                    {t('challengePage.workingFor', { minutes: Math.max(1, Math.floor(elapsedSeconds / 60)) })}
                                </Text>
                            </Flex>

                            <Box
                                px={3}
                                py={3}
                                borderRadius="10px"
                                bg="rgba(59, 130, 246, 0.06)"
                                border="1px solid rgba(59, 130, 246, 0.12)"
                            >
                                <HStack spacing={2} align="flex-start">
                                    <Icon as={FiInfo} color="blue.400" boxSize={4} mt={0.5} flexShrink={0} />
                                    <Text fontSize="xs" lineHeight="1.6" color="var(--color-text-muted)">
                                        {t('challengePage.xpReductionNote')}
                                    </Text>
                                </HStack>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={6} pb={6} pt={2}>
                        <VStack spacing={2} w="full">
                            <HStack spacing={2} w="full" flexWrap="wrap">
                                <Button
                                    colorScheme="blue"
                                    leftIcon={<Icon as={FiPlay} />}
                                    px={5}
                                    py={2.5}
                                    onClick={leaveModal.onClose}
                                    flex="1 1 auto"
                                    minW="140px"
                                    fontSize="sm"
                                    borderRadius="10px"
                                    whiteSpace="normal"
                                    h="auto"
                                    minH="40px"
                                >
                                    {t('challengePage.continueCoding')}
                                </Button>
                                <Button
                                    variant="outline"
                                    colorScheme="orange"
                                    leftIcon={<Icon as={FiBookmark} />}
                                    px={5}
                                    py={2.5}
                                    onClick={handleLeaveConfirm}
                                    flex="1 1 auto"
                                    minW="140px"
                                    fontSize="sm"
                                    borderRadius="10px"
                                    whiteSpace="normal"
                                    h="auto"
                                    minH="40px"
                                >
                                    {t('challengePage.saveAndLeave')}
                                </Button>
                            </HStack>
                            {code.trim().length > 0 && (
                                <Button
                                    variant="ghost"
                                    colorScheme="green"
                                    leftIcon={<Icon as={FiCheckCircle} />}
                                    px={5}
                                    py={2.5}
                                    onClick={handleSubmitFromModal}
                                    w="full"
                                    fontSize="sm"
                                    borderRadius="10px"
                                    whiteSpace="normal"
                                    h="auto"
                                    minH="40px"
                                >
                                    {t('challengePage.submitSolution')}
                                </Button>
                            )}
                        </VStack>
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

export default ChallengePlayWorkspace;