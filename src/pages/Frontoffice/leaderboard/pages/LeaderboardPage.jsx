/**
 * LeaderboardPage – /leaderboard
 *
 * Public leaderboard rendered with the same competitive visual language as
 * the rest of the frontoffice:
 *  • live users fetched from /user
 *  • podium for the top 3
 *  • contender list for the remaining ranks
 *  • graceful fallback when live data is unavailable
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Box,
    Flex,
    Icon,
    IconButton,
    SimpleGrid,
    Text,
    Tooltip,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import LeaderboardHeader from '../components/LeaderboardHeader';
import ArenaStage from '../components/ArenaStage';
import RankCard from '../components/RankCard';
import mockLeaderboard from '../data/mockLeaderboard';
import useAccessibility from '../../../../accessibility/hooks/useAccessibility';
import { readAloud, stopSpeaking, getPageText } from '../../../../accessibility/utils/speechUtils';
import LeaderboardSkeleton from '../../../../shared/skeletons/LeaderboardSkeleton';
import { userService } from '../../../../services/userService';
import { useAuth } from '../../auth/context/AuthContext';
import { buildLeaderboardRows } from '../utils/leaderboardUtils';

const MotionBox = m.create(Box);


const StatCard = ({ label, value, tone, hint }) => {
    const defaultTone = useColorModeValue('gray.800', 'white');
    const actualTone = tone === 'var(--color-text-primary)' ? defaultTone : tone;
    
    return (
        <Box
            p={{ base: 4, md: 5 }}
            borderRadius="22px"
            border="1px solid"
            borderColor="var(--color-border)"
            bg="var(--color-bg-secondary)"
            boxShadow="var(--shadow-custom)"
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-2px)' }}
        >
            <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="var(--color-text-muted)" mb={2}>
                {label}
            </Text>
            <Text fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={actualTone} lineHeight="1">
                {value}
            </Text>
            {hint ? (
                <Text mt={2} fontSize="sm" color="var(--color-text-secondary)">
                    {hint}
                </Text>
            ) : null}
        </Box>
    );
};

/* Inline speaker icon */
const SpeakerIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
    </Icon>
);

const LeaderboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [isFallbackData, setIsFallbackData] = useState(false);
    const [loadError, setLoadError] = useState('');
    const { settings } = useAccessibility();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const mode = useColorModeValue('light', 'dark');

    const noMotion = settings.reducedMotion;

    useEffect(() => {
        let cancelled = false;

        const loadLeaderboard = async () => {
            setIsLoading(true);
            setLoadError('');
            setIsFallbackData(false);

            try {
                const response = await userService.getUsers();
                if (cancelled) return;

                setUsers(Array.isArray(response) ? response : []);
            } catch (error) {
                if (cancelled) return;

                setUsers(mockLeaderboard);
                setIsFallbackData(true);
                setLoadError(error?.message || t('leaderboardPage.liveUnavailable'));
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadLeaderboard();

        return () => {
            cancelled = true;
        };
    }, [t]);

    const leaderboardRows = useMemo(
        () => buildLeaderboardRows(users, currentUser),
        [users, currentUser],
    );

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    const top3 = leaderboardRows.slice(0, 3);
    const contenders = leaderboardRows.slice(3, 10);
    const totalCompetitors = leaderboardRows.length;
    const averageXp = totalCompetitors > 0
        ? Math.round(leaderboardRows.reduce((sum, user) => sum + user.xp, 0) / totalCompetitors)
        : 0;
    const currentUserRow = leaderboardRows.find((row) => row.isCurrentUser) || null;

    const handleReadPage = () => {
        stopSpeaking();
        const text = getPageText('#main-content');
        if (text) readAloud(text);
        else readAloud(t('leaderboardPage.noReadableContent'));
    };

    const cyanColor = useColorModeValue('cyan.600', '#22d3ee');
    const amberColor = useColorModeValue('orange.600', '#fbbf24');
    const blueColor = useColorModeValue('blue.600', '#60a5fa');

    return (
        <MotionBox
            initial={noMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={noMotion ? { duration: 0 } : { duration: 0.4 }}
            minH="100vh"
            pt={{ base: 24, md: 28 }}
            pb={{ base: 10, md: 16 }}
            px={{ base: 4, sm: 6, lg: 8 }}
            bg="var(--color-bg-primary)"
            bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
            bgSize="50px 50px"
            position="relative"
            overflow="hidden"
        >
            <Box maxW="7xl" mx="auto" position="relative" zIndex={10}>
                <LeaderboardHeader
                    eyebrow={t('leaderboardPage.liveRanking')}
                    title={t('leaderboardPage.leaderboardArena')}
                    subtitle={t('leaderboardPage.subtitle')}
                />

                <MotionBox
                    initial={noMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={noMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
                    mb={10}
                >
                    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
                        <StatCard
                            label={t('leaderboardPage.competitors')}
                            value={totalCompetitors.toLocaleString()}
                            tone={cyanColor}
                            hint={isFallbackData ? t('leaderboardPage.demoHint') : t('leaderboardPage.liveHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.mode')}
                            value={t('leaderboardPage.allPlayers')}
                            tone="var(--color-text-primary)"
                            hint={t('leaderboardPage.publicHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.topCutoff')}
                            value="#10"
                            tone={blueColor}
                            hint={t('leaderboardPage.topCutoffHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.averageXp')}
                            value={averageXp.toLocaleString()}
                            tone={amberColor}
                            hint={currentUserRow ? t('leaderboardPage.yourCurrentRank', { position: currentUserRow.rankPosition }) : t('leaderboardPage.signInHint')}
                        />
                    </SimpleGrid>
                </MotionBox>

                {loadError ? (
                    <Box
                        mb={8}
                        p={4}
                        borderRadius="18px"
                        border="1px solid"
                        borderColor="orange.200"
                        bg={useColorModeValue('orange.50', 'rgba(245, 158, 11, 0.08)')}
                        color={useColorModeValue('orange.800', 'orange.100')}
                    >
                        <Text fontWeight="700">{t('leaderboardPage.liveDataUnavailable')}</Text>
                        <Text mt={1} fontSize="sm" color={useColorModeValue('orange.700', 'rgba(255, 237, 213, 0.92)')}>
                            {loadError} {t('leaderboardPage.demoFallback')}
                        </Text>
                    </Box>
                ) : null}

                <ArenaStage players={top3} />

                <MotionBox
                    initial={noMotion ? false : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={noMotion ? { duration: 0 } : { duration: 0.6, delay: 0.35 }}
                >
                    <Flex align="center" justify="space-between" mb={6} gap={3} flexWrap="wrap">
                        <Box>
                            <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
                                {t('leaderboardPage.eliteContenders')}
                            </Text>
                            <Text fontFamily="body" fontSize="sm" color="var(--color-text-muted)">
                                {t('leaderboardPage.showingRanks')}
                            </Text>
                        </Box>

                        <Text fontFamily="body" fontSize="sm" color="var(--color-text-muted)">
                            <Text as="span" fontWeight="semibold" color={cyanColor}>
                                {Math.min(leaderboardRows.length, 10)}
                            </Text>{' '}
                            {t('leaderboardPage.of')}{' '}
                            <Text as="span" fontWeight="semibold" color={cyanColor}>
                                {totalCompetitors.toLocaleString()}
                            </Text>{' '}
                            {t('leaderboardPage.competitorsVisible')}
                        </Text>
                    </Flex>

                    {contenders.length > 0 ? (
                        <VStack spacing={4} align="stretch">
                            {contenders.map((player) => (
                                <RankCard key={player.id} player={player} variant="compact" />
                            ))}
                        </VStack>
                    ) : (
                        <Box
                            p={8}
                            borderRadius="24px"
                            border="1px solid"
                            borderColor="var(--color-border)"
                            bg="var(--color-bg-secondary)"
                            textAlign="center"
                        >
                            <Text fontFamily="heading" fontSize="xl" fontWeight="700" color="var(--color-text-primary)">
                                {t('leaderboardPage.noContenders')}
                            </Text>
                            <Text mt={2} color="var(--color-text-secondary)">
                                {t('leaderboardPage.switchBackHint')}
                            </Text>
                        </Box>
                    )}
                </MotionBox>

                {currentUserRow ? (
                    <Box
                        mt={10}
                        p={5}
                        borderRadius="24px"
                        border="2px solid"
                        borderColor={useColorModeValue('cyan.200', 'rgba(34, 211, 238, 0.2)')}
                        bg={useColorModeValue('cyan.50', 'rgba(15, 23, 42, 0.72)')}
                        boxShadow="var(--shadow-custom)"
                    >
                        <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                            <Box>
                                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color={useColorModeValue('cyan.700', '#22d3ee')} fontWeight="700">
                                    {t('leaderboardPage.yourPosition')}
                                </Text>
                                <Text mt={1} fontFamily="heading" fontSize="2xl" fontWeight="800" color={useColorModeValue('gray.900', 'white')}>
                                    #{currentUserRow.rankPosition} · {currentUserRow.username}
                                </Text>
                            </Box>
                            <Flex align="center" gap={3} flexWrap="wrap">
                                <Badge px={3} py={1.5} borderRadius="999px" colorScheme="cyan" variant="subtle" border="1px solid" borderColor="cyan.200">
                                    {currentUserRow.tier}
                                </Badge>
                                <Badge px={3} py={1.5} borderRadius="999px" colorScheme="gray" variant="solid">
                                    {currentUserRow.xp.toLocaleString()} XP
                                </Badge>
                                <Badge px={3} py={1.5} borderRadius="999px" colorScheme="orange" variant="subtle">
                                    {t('leaderboardPage.streakCount', { count: currentUserRow.streak })}
                                </Badge>
                            </Flex>
                        </Flex>
                    </Box>
                ) : null}
            </Box>

            {settings.voiceMode && (
                <Tooltip label={t('leaderboardPage.readAloud')} hasArrow placement="left">
                    <IconButton
                        aria-label={t('leaderboardPage.readPageAloud')}
                        icon={<SpeakerIcon w={5} h={5} />}
                        position="fixed"
                        bottom={6}
                        right={6}
                        zIndex={100}
                        size="lg"
                        borderRadius="full"
                        bg={useColorModeValue('cyan.100', 'rgba(34, 211, 238, 0.15)')}
                        color={useColorModeValue('cyan.700', '#22d3ee')}
                        border="1px solid"
                        borderColor={useColorModeValue('cyan.300', 'rgba(34, 211, 238, 0.4)')}
                        _hover={{ bg: useColorModeValue('cyan.200', 'rgba(34, 211, 238, 0.3)'), transform: 'scale(1.1)' }}
                        _active={{ transform: 'scale(0.95)' }}
                        boxShadow="0 0 20px rgba(34, 211, 238, 0.3)"
                        onClick={handleReadPage}
                    />
                </Tooltip>
            )}
        </MotionBox>
    );
};

export default LeaderboardPage;
