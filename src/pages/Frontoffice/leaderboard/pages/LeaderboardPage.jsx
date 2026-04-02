/**
 * LeaderboardPage – /leaderboard
 *
 * Full-page leaderboard experience with:
 *  • Live user data fetched from the API
 *  • LeaderboardHeader (title + filters)
 *  • ArenaStage (Top 3 podium)
 *  • Elite Contenders list (ranks 4–10)
 *  • Responsive layout
 *  • Accessibility integration (reduced motion, voice read page)
 *  • Loading and error states
 */
import React, { useEffect, useState } from 'react';
import { Box, Flex, Text, IconButton, Icon, Tooltip, Button, Badge, Image, Grid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import LeaderboardHeader from '../components/LeaderboardHeader';
import ArenaStage from '../components/ArenaStage';
import mockLeaderboard from '../data/mockLeaderboard';
import { useAuth } from '../../auth/context/AuthContext';
import { userService } from '../../../../services/userService';
import useAccessibility from '../../../../accessibility/hooks/useAccessibility';
import { readAloud, getPageText } from '../../../../accessibility/utils/speechUtils';
import LeaderboardSkeleton from '../../../../shared/skeletons/LeaderboardSkeleton';

const MotionBox = motion.create(Box);

const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

const SpeakerIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
    </Icon>
);

const normalizeAvatar = (avatar) => {
    if (!avatar) return DEFAULT_AVATAR;
    return String(avatar).startsWith('uploads/') ? `/${avatar}` : avatar;
};

const normalizeRank = (user) => {
    const rawRank = String(user?.rank || user?.level || '').trim().toUpperCase();
    if (RANK_ORDER.includes(rawRank)) return rawRank;

    const xp = Number(user?.xp || 0);
    if (xp >= 10000) return 'DIAMOND';
    if (xp >= 5000) return 'PLATINUM';
    if (xp >= 3000) return 'GOLD';
    if (xp >= 1500) return 'SILVER';
    return 'BRONZE';
};

const getComparableId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value.userId || value._id || value.id || null;
};

const getChallengeProgress = (user) => (Array.isArray(user?.challengeProgress) ? user.challengeProgress : []);

const getSolvedChallenges = (user) => (
    getChallengeProgress(user).filter((entry) => String(entry?.status || '').toUpperCase() === 'SOLVED').length
);

const getAttemptedChallenges = (user) => (
    getChallengeProgress(user).filter((entry) => {
        const status = String(entry?.status || '').toUpperCase();
        return status !== 'UNSOLVED' || (entry?.submissions?.length || 0) > 0;
    }).length
);

const getLatestActivityDate = (user) => {
    const timestamps = [];

    for (const entry of getChallengeProgress(user)) {
        if (entry?.solvedAt) timestamps.push(new Date(entry.solvedAt).getTime());
        if (Array.isArray(entry?.submissions)) {
            for (const submission of entry.submissions) {
                if (submission?.submittedAt) timestamps.push(new Date(submission.submittedAt).getTime());
            }
        }
    }

    if (user?.updatedAt) timestamps.push(new Date(user.updatedAt).getTime());
    if (user?.createdAt) timestamps.push(new Date(user.createdAt).getTime());

    const validTimestamps = timestamps.filter((value) => Number.isFinite(value));
    if (!validTimestamps.length) return null;

    return new Date(Math.max(...validTimestamps));
};

const getTrend = (user) => {
    const solvedChallenges = getSolvedChallenges(user);
    const streak = Number(user?.streak || 0);
    const latestActivity = getLatestActivityDate(user);
    const now = Date.now();

    if (latestActivity && (now - latestActivity.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
        return 'UP';
    }

    if (streak >= 10 || solvedChallenges >= 15) {
        return 'UP';
    }

    if ((solvedChallenges === 0 && Number(user?.xp || 0) < 1000) || (latestActivity && (now - latestActivity.getTime()) > 45 * 24 * 60 * 60 * 1000)) {
        return 'DOWN';
    }

    return 'STABLE';
};

const getWinRate = (user) => {
    const solvedChallenges = getSolvedChallenges(user);
    const attemptedChallenges = getAttemptedChallenges(user);

    if (attemptedChallenges > 0) {
        return Math.max(0, Math.min(100, Math.round((solvedChallenges / attemptedChallenges) * 100)));
    }

    const xp = Number(user?.xp || 0);
    return Math.max(35, Math.min(95, Math.round(40 + (xp / 250))));
};

const getScopeIds = (currentUser) => {
    const friendSources = [currentUser?.friendIds, currentUser?.friends, currentUser?.friendList];
    const ids = [];

    for (const source of friendSources) {
        if (!Array.isArray(source)) continue;
        for (const item of source) {
            const resolved = getComparableId(item);
            if (resolved) ids.push(resolved);
        }
    }

    return ids;
};

const getScopeLabel = (scope, currentUser) => {
    if (scope === 'Friends') {
        const friendIds = getScopeIds(currentUser);
        return friendIds.length > 0 ? 'Friends' : 'Personal';
    }

    return scope;
};

const filterByScope = (players, scope, currentUser) => {
    if (scope === 'Global') return players;

    const currentUserId = getComparableId(currentUser);

    if (scope === 'Friends') {
        const friendIds = new Set(getScopeIds(currentUser));

        if (friendIds.size > 0) {
            if (currentUserId) friendIds.add(currentUserId);
            return players.filter((player) => friendIds.has(player.id));
        }

        if (currentUserId) {
            return players.filter((player) => player.id === currentUserId);
        }

        return players;
    }

    if (scope === 'Country') {
        const currentCountry = currentUser?.country || currentUser?.location?.country || currentUser?.profile?.country || null;
        if (!currentCountry) return players;

        return players.filter((player) => String(player.country || '').toLowerCase() === String(currentCountry).toLowerCase());
    }

    return players;
};

const filterByPeriod = (players, period) => {
    if (period === 'All-Time') return players;

    const days = period === 'Weekly' ? 7 : 30;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    return players.filter((player) => {
        const latestActivity = getLatestActivityDate(player.sourceUser);
        if (!latestActivity) return true;
        return latestActivity.getTime() >= cutoff;
    });
};

const comparePlayers = (left, right) => {
    if (right.xp !== left.xp) return right.xp - left.xp;
    if (right.wins !== left.wins) return right.wins - left.wins;
    if (right.streak !== left.streak) return right.streak - left.streak;
    return left.username.localeCompare(right.username);
};

const mapUserToPlayer = (user, currentUserId) => {
    const id = getComparableId(user) || String(user?.username || Math.random());
    const xp = Number(user?.xp || 0);
    const wins = getSolvedChallenges(user);
    const winRate = getWinRate(user);
    const streak = Number(user?.streak || 0);

    return {
        id,
        username: user?.username || 'Anonymous',
        avatar: normalizeAvatar(user?.avatar),
        rankPosition: 0,
        tier: normalizeRank(user),
        xp,
        winRate,
        wins,
        streak,
        trend: getTrend(user),
        isCurrentUser: currentUserId ? id === currentUserId : false,
        country: user?.country || user?.location?.country || null,
        sourceUser: user,
    };
};

const getLeaderboardStateLabel = (error) => {
    if (!error) return null;
    return error?.message || 'Unable to load leaderboard data';
};

const buildFallbackPlayers = () => mockLeaderboard.map((player) => ({
    ...player,
    id: `mock-${player.id}`,
    sourceUser: null,
}));

const LeaderboardListItem = ({ player, rankPosition, onMouseEnter, onMouseMove, onMouseLeave }) => (
    <Box
        as="li"
        display="flex"
        alignItems="center"
        gap={4}
        px={4}
        py={4}
        borderRadius="14px"
        bg={player.isCurrentUser ? 'rgba(34, 211, 238, 0.08)' : 'rgba(15, 23, 42, 0.72)'}
        border={player.isCurrentUser ? '1px solid rgba(34, 211, 238, 0.6)' : '1px solid rgba(148, 163, 184, 0.14)'}
        boxShadow={player.isCurrentUser ? '0 0 28px rgba(34, 211, 238, 0.16)' : 'none'}
        cursor="pointer"
        transition="transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease"
        _hover={{
            transform: 'translateY(-2px)',
            borderColor: 'rgba(34, 211, 238, 0.38)',
            boxShadow: '0 0 24px rgba(34, 211, 238, 0.12)',
        }}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
        tabIndex={0}
    >
        <Box
            flexShrink={0}
            w="52px"
            h="52px"
            borderRadius="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontFamily="heading"
            fontWeight="black"
            fontSize="xl"
            bg={player.isCurrentUser ? 'var(--color-cyan-400)' : 'rgba(255, 255, 255, 0.06)'}
            color={player.isCurrentUser ? '#0f172a' : 'var(--color-text-primary)'}
        >
            #{rankPosition}
        </Box>

        <Image
            src={player.avatar}
            alt={player.username}
            w="54px"
            h="54px"
            borderRadius="full"
            objectFit="cover"
            border={player.isCurrentUser ? '2px solid #22d3ee' : '2px solid rgba(148, 163, 184, 0.3)'}
        />

        <Box flex={1} minW={0}>
            <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="var(--color-text-primary)">
                    {player.username}
                </Text>
                {player.isCurrentUser && (
                    <Badge px={2} py={0.5} borderRadius="6px" fontSize="xs" bg="var(--color-cyan-400)" color="#ffffff">
                        YOU
                    </Badge>
                )}
                <Badge px={2} py={0.5} borderRadius="6px" fontSize="xs" bg="rgba(96, 165, 250, 0.14)" color="#60a5fa">
                    {player.tier}
                </Badge>
            </Flex>
            <Text fontSize="sm" color="gray.400">
                {player.xp.toLocaleString()} XP · {player.wins} wins · {player.streak} streak
            </Text>
        </Box>

        <Box textAlign="right" flexShrink={0}>
            <Text fontFamily="heading" fontSize="xl" fontWeight="black" color="#22d3ee">
                {player.winRate}%
            </Text>
            <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                win rate
            </Text>
        </Box>
    </Box>
);

const HoverProfilePopup = ({ player, position }) => {
    if (!player) return null;

    const left = Math.min(position.x + 18, window.innerWidth - 300);
    const top = Math.min(position.y + 18, window.innerHeight - 260);

    return (
        <Box
            position="fixed"
            left={left}
            top={top}
            zIndex={220}
            w="280px"
            borderRadius="18px"
            p={4}
            bg="rgba(6, 10, 24, 0.96)"
            border="1px solid rgba(34, 211, 238, 0.28)"
            boxShadow="0 18px 40px rgba(0, 0, 0, 0.45), 0 0 26px rgba(34, 211, 238, 0.14)"
            backdropFilter="blur(18px)"
            pointerEvents="none"
        >
            <Flex align="center" gap={3} mb={3}>
                <Image
                    src={player.avatar}
                    alt={player.username}
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    objectFit="cover"
                    border="2px solid rgba(34, 211, 238, 0.8)"
                />
                <Box minW={0}>
                    <Text fontFamily="heading" fontSize="md" fontWeight="bold" color="var(--color-text-primary)" noOfLines={1}>
                        {player.username}
                    </Text>
                    <Flex align="center" gap={2} wrap="wrap" mt={1}>
                        <Badge px={2} py={0.5} borderRadius="6px" fontSize="10px" bg="rgba(96, 165, 250, 0.14)" color="#60a5fa">
                            #{player.rankPosition}
                        </Badge>
                        <Badge px={2} py={0.5} borderRadius="6px" fontSize="10px" bg="rgba(34, 211, 238, 0.14)" color="#22d3ee">
                            {player.tier}
                        </Badge>
                        {player.isCurrentUser && (
                            <Badge px={2} py={0.5} borderRadius="6px" fontSize="10px" bg="rgba(16, 185, 129, 0.14)" color="#10b981">
                                YOU
                            </Badge>
                        )}
                    </Flex>
                </Box>
            </Flex>

            <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2}>
                <Box p={2.5} borderRadius="12px" bg="rgba(255, 255, 255, 0.03)">
                    <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        XP
                    </Text>
                    <Text fontFamily="heading" fontSize="md" fontWeight="black" color="#22d3ee">
                        {player.xp.toLocaleString()}
                    </Text>
                </Box>
                <Box p={2.5} borderRadius="12px" bg="rgba(255, 255, 255, 0.03)">
                    <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Win rate
                    </Text>
                    <Text fontFamily="heading" fontSize="md" fontWeight="black" color="#10b981">
                        {player.winRate}%
                    </Text>
                </Box>
                <Box p={2.5} borderRadius="12px" bg="rgba(255, 255, 255, 0.03)">
                    <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Wins
                    </Text>
                    <Text fontFamily="heading" fontSize="md" fontWeight="black" color="var(--color-text-primary)">
                        {player.wins}
                    </Text>
                </Box>
                <Box p={2.5} borderRadius="12px" bg="rgba(255, 255, 255, 0.03)">
                    <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Streak
                    </Text>
                    <Text fontFamily="heading" fontSize="md" fontWeight="black" color="#f59e0b">
                        {player.streak}
                    </Text>
                </Box>
            </Grid>
        </Box>
    );
};

const LeaderboardPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scope, setScope] = useState('Global');
    const [period, setPeriod] = useState('Monthly');
    const [hoveredPlayer, setHoveredPlayer] = useState(null);
    const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

    const { currentUser } = useAuth();
    const { settings } = useAccessibility();
    const noMotion = settings.reducedMotion;
    const currentUserId = getComparableId(currentUser);

    useEffect(() => {
        let isMounted = true;

        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const response = await userService.getUsers();
                if (!isMounted) return;
                setUsers(Array.isArray(response) ? response : []);
                setError(null);
            } catch (err) {
                if (!isMounted) return;
                setUsers([]);
                setError(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchLeaderboard();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleReadPage = () => {
        const text = getPageText('#main-content');
        if (text) readAloud(text);
        else readAloud('No readable content found.');
    };

    const refreshLeaderboard = async () => {
        setIsLoading(true);
        try {
            const response = await userService.getUsers();
            setUsers(Array.isArray(response) ? response : []);
            setError(null);
        } catch (err) {
            setUsers([]);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    if (error) {
        const errorLabel = getLeaderboardStateLabel(error);

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
                <Box maxW="3xl" mx="auto" textAlign="center" py={20}>
                    <Text fontFamily="heading" fontSize={{ base: '3xl', md: '5xl' }} fontWeight="black" color="var(--color-text-primary)" mb={4}>
                        Leaderboard unavailable
                    </Text>
                    <Text color="gray.400" mb={6}>
                        {errorLabel}
                    </Text>
                    <Button onClick={refreshLeaderboard} colorScheme="cyan" variant="solid">
                        Retry
                    </Button>
                </Box>
            </MotionBox>
        );
    }

    const normalizedPlayers = users
        .filter((user) => String(user?.role || 'Player').toUpperCase() !== 'ADMIN')
        .filter((user) => user?.status !== false)
        .map((user) => mapUserToPlayer(user, currentUserId))
        .sort(comparePlayers);

    const basePlayers = normalizedPlayers.length > 0 ? normalizedPlayers : buildFallbackPlayers();

    const scopedPlayers = filterByScope(basePlayers, scope, currentUser);
    const periodFilteredPlayers = filterByPeriod(scopedPlayers, period);
    const visiblePlayers = periodFilteredPlayers.length > 0
        ? periodFilteredPlayers
        : scopedPlayers.length > 0
            ? scopedPlayers
            : basePlayers;

    const leaderboardPlayers = visiblePlayers
        .sort(comparePlayers)
        .map((player, index) => ({
            ...player,
            rankPosition: index + 1,
            isCurrentUser: currentUserId ? player.id === currentUserId : player.isCurrentUser,
        }));

    const top3 = leaderboardPlayers.slice(0, 3);
    const contenders = leaderboardPlayers.slice(3, 10);
    const currentPlayer = leaderboardPlayers.find((player) => player.isCurrentUser);
    const displayedCount = leaderboardPlayers.length;

    const filteredScopeLabel = getScopeLabel(scope, currentUser);

    const handlePlayerHoverStart = (player, event) => {
        setHoveredPlayer(player);
        setHoverPosition({
            x: event?.clientX ?? 0,
            y: event?.clientY ?? 0,
        });
    };

    const handlePlayerHoverEnd = () => {
        setHoveredPlayer(null);
    };

    const handlePlayerHoverMove = (event) => {
        setHoverPosition({
            x: event?.clientX ?? 0,
            y: event?.clientY ?? 0,
        });
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
                    scope={scope}
                    setScope={setScope}
                    period={period}
                    setPeriod={setPeriod}
                />

                <Box mb={10}>
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align={{ base: 'stretch', md: 'center' }}
                        justify="space-between"
                        gap={4}
                        p={5}
                        borderRadius="16px"
                        bg="rgba(15, 23, 42, 0.72)"
                        border="1px solid rgba(148, 163, 184, 0.14)"
                        backdropFilter="blur(16px)"
                    >
                        <Box>
                            <Text fontSize="xs" letterSpacing="wider" textTransform="uppercase" color="gray.400" mb={1}>
                                Live ranking
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="var(--color-text-primary)">
                                {displayedCount} visible players in {filteredScopeLabel.toLowerCase()}
                            </Text>
                            <Text fontSize="sm" color="gray.400">
                                Sorted by XP, then solved challenges and streak.
                            </Text>
                        </Box>

                        <Flex gap={3} wrap="wrap" justify={{ base: 'flex-start', md: 'flex-end' }}>
                            <Badge px={3} py={1.5} borderRadius="full" bg="rgba(34, 211, 238, 0.12)" color="#22d3ee" fontSize="xs" textTransform="none">
                                Scope: {filteredScopeLabel}
                            </Badge>
                            <Badge px={3} py={1.5} borderRadius="full" bg="rgba(96, 165, 250, 0.12)" color="#60a5fa" fontSize="xs" textTransform="none">
                                Period: {period}
                            </Badge>
                            {currentPlayer && (
                                <Badge px={3} py={1.5} borderRadius="full" bg="rgba(16, 185, 129, 0.12)" color="#10b981" fontSize="xs" textTransform="none">
                                    Your rank: #{currentPlayer.rankPosition}
                                </Badge>
                            )}
                        </Flex>
                    </Flex>
                </Box>

                {leaderboardPlayers.length === 0 ? (
                    <Box
                        textAlign="center"
                        py={20}
                        borderRadius="20px"
                        bg="rgba(15, 23, 42, 0.72)"
                        border="1px solid rgba(148, 163, 184, 0.14)"
                    >
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)" mb={2}>
                            No players match the current filters
                        </Text>
                        <Text color="gray.400">
                            Try switching back to Global or All-Time to see the full leaderboard.
                        </Text>
                    </Box>
                ) : (
                    <>
                        <ArenaStage
                            players={top3}
                            onPlayerHoverStart={handlePlayerHoverStart}
                            onPlayerHoverEnd={handlePlayerHoverEnd}
                        />

                        <MotionBox
                            initial={noMotion ? false : { opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={noMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
                        >
                            <Flex align="center" justify="space-between" mb={6} gap={4} wrap="wrap">
                                <Box>
                                    <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
                                        Full Leaderboard
                                    </Text>
                                    <Text fontFamily="body" fontSize="sm" color="gray.400">
                                        Showing {' '}
                                        <Text as="span" fontWeight="semibold" color="#22d3ee">
                                            {displayedCount}
                                        </Text>{' '}
                                        players on the board, sorted by score.
                                    </Text>
                                </Box>

                                {currentPlayer && (
                                    <Text fontFamily="body" fontSize="sm" color="gray.400">
                                        You are #{currentPlayer.rankPosition} with {currentPlayer.xp.toLocaleString()} XP
                                    </Text>
                                )}
                            </Flex>

                            <Box
                                as="ol"
                                listStyleType="none"
                                m={0}
                                p={0}
                                display="grid"
                                gap={3}
                            >
                                {leaderboardPlayers.map((player) => (
                                    <LeaderboardListItem
                                        key={player.id}
                                        player={player}
                                        rankPosition={player.rankPosition}
                                        onMouseEnter={(event) => handlePlayerHoverStart(player, event)}
                                        onMouseMove={handlePlayerHoverMove}
                                        onMouseLeave={handlePlayerHoverEnd}
                                    />
                                ))}
                            </Box>
                        </MotionBox>
                    </>
                )}
            </Box>

            <HoverProfilePopup player={hoveredPlayer} position={hoverPosition} />

            {settings.voiceMode && (
                <Tooltip label="Read this page aloud" hasArrow placement="left">
                    <IconButton
                        aria-label="Read page content aloud"
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
