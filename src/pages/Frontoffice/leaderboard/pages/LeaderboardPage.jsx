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
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
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

const MotionBox = motion.create(Box);

const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const RANK_THRESHOLDS = {
    BRONZE: 500,
    SILVER: 1500,
    GOLD: 3000,
    PLATINUM: 5000,
    DIAMOND: 10000,
};

const normalizeString = (value) => String(value || '').trim().toLowerCase();

const isAdminUser = (user) => normalizeString(user?.role) === 'admin';

const isSameUser = (candidate, currentUser) => {
    if (!candidate || !currentUser) return false;

    const candidateId = String(candidate._id || candidate.id || '').trim();
    const currentId = String(currentUser._id || currentUser.id || currentUser.userId || '').trim();
    if (candidateId && currentId && candidateId === currentId) return true;

    const candidateName = normalizeString(candidate.username);
    const currentName = normalizeString(currentUser.username);
    const candidateEmail = normalizeString(candidate.email);
    const currentEmail = normalizeString(currentUser.email);

    return Boolean(candidateName && currentName && candidateName === currentName)
        || Boolean(candidateEmail && currentEmail && candidateEmail === currentEmail);
};

const getTierFromXp = (xp) => {
    let tier = 'BRONZE';
    const numericXp = Number(xp || 0);

    RANK_ORDER.forEach((rank) => {
        if (numericXp >= RANK_THRESHOLDS[rank]) {
            tier = rank;
        }
    });

    return tier;
};

const getAvatarUrl = (user) => {
    if (user?.avatar) {
        if (String(user.avatar).startsWith('http')) return user.avatar;
        if (String(user.avatar).startsWith('/')) return user.avatar;
        return `/${String(user.avatar).replace(/^\//, '')}`;
    }

    const label = encodeURIComponent(user?.username || 'Player');
    return `https://ui-avatars.com/api/?name=${label}&background=0f172a&color=22d3ee&bold=true`;
};

const toDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const daysAgo = (date, days) => {
    if (!date) return false;
    const ms = Date.now() - date.getTime();
    return ms <= days * 24 * 60 * 60 * 1000;
};

const getChallengeProgress = (user) => (Array.isArray(user?.challengeProgress) ? user.challengeProgress : []);

const countSolved = (user) => getChallengeProgress(user).filter((entry) => String(entry?.status || '').toUpperCase() === 'SOLVED').length;

const countAttempts = (user) => getChallengeProgress(user).length;

const getRecentActivityDate = (user) => {
    const candidates = [
        toDate(user?.lastLoginDate),
        toDate(user?.streakUpdatedAt),
        ...getChallengeProgress(user).map((entry) => toDate(entry?.solvedAt)).filter(Boolean),
    ].filter(Boolean);

    if (!candidates.length) return null;
    return candidates.reduce((latest, current) => (current > latest ? current : latest));
};

const getTrend = (user) => {
    const recentActivity = getRecentActivityDate(user);
    const streak = Number(user?.currentStreak ?? user?.streak ?? 0);

    if (!recentActivity) return 'STABLE';
    if (daysAgo(recentActivity, 1) && streak >= 3) return 'UP';
    if (daysAgo(recentActivity, 7)) return streak >= 2 ? 'UP' : 'STABLE';
    return 'DOWN';
};

const buildLeaderboardRow = (user, currentUser) => {
    const xp = Number(user?.xp ?? 0);
    const currentStreak = Number(user?.currentStreak ?? user?.streak ?? 0);
    const longestStreak = Number(user?.longestStreak ?? currentStreak ?? 0);
    const solvedChallenges = countSolved(user);
    const attempts = countAttempts(user);
    const lastActivity = getRecentActivityDate(user);
    const tier = String(user?.rank || user?.level || getTierFromXp(xp)).toUpperCase();
    const wins = solvedChallenges || Number(user?.wins ?? 0);
    const winRate = attempts > 0 ? Math.round((solvedChallenges / attempts) * 100) : Math.min(99, Math.max(40, Math.round((xp / 120) + currentStreak)));
    const score = (xp * 100) + (solvedChallenges * 420) + (currentStreak * 120) + (longestStreak * 24) + (lastActivity ? 180 : 0);
    const isCurrentUser = isSameUser(user, currentUser);

    return {
        id: user?._id || user?.id || user?.username,
        username: user?.username || 'Anonymous',
        avatar: getAvatarUrl(user),
        rankPosition: 0,
        tier,
        xp,
        winRate,
        wins,
        streak: currentStreak,
        trend: getTrend(user),
        isCurrentUser,
        tag: isCurrentUser ? 'YOU' : (currentStreak >= 10 ? 'HOT' : null),
        solvedChallenges,
        attempts,
        lastActivity,
        score,
    };
};

const StatCard = ({ label, value, tone, hint }) => (
    <Box
        p={{ base: 4, md: 5 }}
        borderRadius="22px"
        border="1px solid rgba(148, 163, 184, 0.16)"
        bg="rgba(15, 23, 42, 0.62)"
        boxShadow="0 18px 40px rgba(2, 6, 23, 0.18)"
    >
        <Text fontSize="xs" letterSpacing="0.18em" textTransform="uppercase" color="gray.400" mb={2}>
            {label}
        </Text>
        <Text fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={tone} lineHeight="1">
            {value}
        </Text>
        {hint ? (
            <Text mt={2} fontSize="sm" color="var(--color-text-secondary)">
                {hint}
            </Text>
        ) : null}
    </Box>
);

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
    }, []);

    const leaderboardRows = useMemo(() => {
        return users
            .filter((user) => !isAdminUser(user))
            .map((user) => buildLeaderboardRow(user, currentUser))
            .sort((left, right) => {
                if (right.score !== left.score) return right.score - left.score;
                if (right.xp !== left.xp) return right.xp - left.xp;
                if (right.streak !== left.streak) return right.streak - left.streak;
                if (right.wins !== left.wins) return right.wins - left.wins;
                return left.username.localeCompare(right.username);
            })
            .map((row, index) => ({
                ...row,
                rankPosition: index + 1,
            }));
    }, [users, currentUser]);

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
                            tone="#22d3ee"
                            hint={isFallbackData ? t('leaderboardPage.demoHint') : t('leaderboardPage.liveHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.mode')}
                            value={t('leaderboardPage.allPlayers')}
                            tone="white"
                            hint={t('leaderboardPage.publicHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.topCutoff')}
                            value="#10"
                            tone="#60a5fa"
                            hint={t('leaderboardPage.topCutoffHint')}
                        />
                        <StatCard
                            label={t('leaderboardPage.averageXp')}
                            value={averageXp.toLocaleString()}
                            tone="#fbbf24"
                            hint={currentUserRow ? t('leaderboardPage.yourCurrentRank', { position: currentUserRow.rankPosition }) : t('leaderboardPage.signInHint')}
                        />
                    </SimpleGrid>
                </MotionBox>

                {loadError ? (
                    <Box
                        mb={8}
                        p={4}
                        borderRadius="18px"
                        border="1px solid rgba(245, 158, 11, 0.28)"
                        bg="rgba(245, 158, 11, 0.08)"
                        color="orange.100"
                    >
                        <Text fontWeight="700">{t('leaderboardPage.liveDataUnavailable')}</Text>
                        <Text mt={1} fontSize="sm" color="rgba(255, 237, 213, 0.92)">
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
                            <Text fontFamily="body" fontSize="sm" color="gray.400">
                                {t('leaderboardPage.showingRanks')}
                            </Text>
                        </Box>

                        <Text fontFamily="body" fontSize="sm" color="gray.400">
                            <Text as="span" fontWeight="semibold" color="#22d3ee">
                                {Math.min(leaderboardRows.length, 10)}
                            </Text>{' '}
                            {t('leaderboardPage.of')}{' '}
                            <Text as="span" fontWeight="semibold" color="#22d3ee">
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
                            border="1px solid rgba(148, 163, 184, 0.16)"
                            bg="rgba(15, 23, 42, 0.6)"
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
                        border="1px solid rgba(34, 211, 238, 0.2)"
                        bg="rgba(15, 23, 42, 0.72)"
                        boxShadow="0 20px 50px rgba(2, 6, 23, 0.25)"
                    >
                        <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                            <Box>
                                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="#22d3ee" fontWeight="700">
                                    {t('leaderboardPage.yourPosition')}
                                </Text>
                                <Text mt={1} fontFamily="heading" fontSize="2xl" fontWeight="800" color="white">
                                    #{currentUserRow.rankPosition} · {currentUserRow.username}
                                </Text>
                            </Box>
                            <Flex align="center" gap={3} flexWrap="wrap">
                                <Badge px={3} py={1.5} borderRadius="999px" bg="rgba(34, 211, 238, 0.12)" color="#22d3ee" border="1px solid rgba(34, 211, 238, 0.22)">
                                    {currentUserRow.tier}
                                </Badge>
                                <Badge px={3} py={1.5} borderRadius="999px" bg="rgba(255, 255, 255, 0.06)" color="white">
                                    {currentUserRow.xp.toLocaleString()} XP
                                </Badge>
                                <Badge px={3} py={1.5} borderRadius="999px" bg="rgba(245, 158, 11, 0.12)" color="#fbbf24">
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
                        bg="rgba(34, 211, 238, 0.15)"
                        color="#22d3ee"
                        border="1px solid rgba(34, 211, 238, 0.4)"
                        _hover={{ bg: 'rgba(34, 211, 238, 0.3)', transform: 'scale(1.1)' }}
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
