/**
 * UserRankStatsBar - displays current rank, XP progress, and streak.
 *
 * All values come from ChallengeContext (which fetches from GET /user/me/rank-stats).
 * Renders a loading skeleton while isLoadingStats is true.
 * Gracefully handles null rank (unranked / pre-placement users).
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Badge,
    Icon,
    Skeleton,
    HStack,
    Tooltip,
    useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiCheckCircle, FiStar, FiZap } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import { useChallengeContext } from '../context/ChallengeContext';
import { RANK_META } from '../data/mockChallenges';

const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'RUBY', 'EMERALD', 'SAPPHIRE', 'OBSIDIAN', 'ALGOARENA CHAMPION'];
const BRONZE_XP_TARGET = 500;

const FlameIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
    </Icon>
);

const RankIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H5a2 2 0 0 0 0 4h1" />
        <path d="M17 6h2a2 2 0 0 1 0 4h-1" />
    </Icon>
);

const XPIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="m12 2 2.45 4.96 5.47.8-3.96 3.86.93 5.45L12 14.7l-4.89 2.57.93-5.45L4.08 7.76l5.47-.8L12 2Z" />
    </Icon>
);

const useAnimatedProgress = (targetValue) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const clampedTarget = useMemo(() => {
        const num = Number.isFinite(targetValue) ? targetValue : 0;
        return Math.max(0, Math.min(100, num));
    }, [targetValue]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setAnimatedValue(clampedTarget);
        });
        return () => window.cancelAnimationFrame(frame);
    }, [clampedTarget]);

    return animatedValue;
};

const ProgressTrack = ({ value, accentStart, accentEnd, label }) => (
    <Box
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.max(0, Math.min(100, Math.round(value || 0)))}
        position="relative"
        h="14px"
        borderRadius="full"
        bg="rgba(148, 163, 184, 0.18)"
        border="1px solid rgba(148, 163, 184, 0.24)"
        overflow="hidden"
        boxShadow="inset 0 1px 2px rgba(15, 23, 42, 0.24)"
    >
        <Box
            h="100%"
            w={`${Math.max(0, Math.min(100, value || 0))}%`}
            minW={(value || 0) > 0 ? '10px' : '0'}
            bgGradient={`linear(to-r, ${accentStart}, ${accentEnd})`}
            borderRadius="full"
            transition="width 0.95s ease"
            boxShadow="0 0 0 1px rgba(255, 255, 255, 0.12) inset, 0 8px 18px rgba(34, 211, 238, 0.14)"
        />
    </Box>
);

const RankStatsSkeleton = () => (
    <Flex
        bg="var(--color-bg-secondary)"
        border="1px solid var(--color-border)"
        borderRadius="16px"
        p={{ base: 4, md: 5 }}
        flexDirection={{ base: 'column', lg: 'row' }}
        align={{ base: 'stretch', lg: 'center' }}
        gap={{ base: 4, lg: 6 }}
    >
        <Flex alignItems="center" gap={3}>
            <Skeleton height="52px" width="52px" borderRadius="full" />
            <Box>
                <Skeleton height="12px" width="90px" mb={2} />
                <Skeleton height="22px" width="150px" borderRadius="md" />
            </Box>
        </Flex>
        <Box flex={1}>
            <Skeleton height="12px" width="170px" mb={2} />
            <Skeleton height="12px" borderRadius="full" />
        </Box>
        <Flex alignItems="center" gap={2} justify={{ base: 'flex-start', lg: 'flex-end' }}>
            <Skeleton height="24px" width="24px" borderRadius="full" />
            <Box>
                <Skeleton height="12px" width="45px" mb={1} />
                <Skeleton height="18px" width="70px" />
            </Box>
        </Flex>
    </Flex>
);

const getStreakTheme = (streak) => {
    if (streak >= 50) return { accent: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.35)', pulse: true };
    if (streak >= 20) return { accent: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', pulse: true };
    if (streak >= 10) return { accent: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', pulse: true };
    if (streak >= 5) return { accent: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', pulse: false };
    return { accent: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.35)', pulse: false };
};
const StreakPanel = ({ streakDetails }) => {
    const currentStreak = Number(streakDetails?.currentStreak || 0);
    const longestStreak = Number(streakDetails?.longestStreak || 0);
    const recentActivity = Array.isArray(streakDetails?.recentActivity)
        ? streakDetails.recentActivity.slice(-7)
        : [false, false, false, false, false, false, false];
    const message = streakDetails?.streakMessage || 'Keep showing up daily to build your coding streak.';
    const theme = getStreakTheme(currentStreak);

    return (
        <Box
            minW={{ base: '100%', lg: '320px' }}
            maxW={{ base: '100%', lg: '360px' }}
            px={4}
            py={3}
            borderRadius='14px'
            bg={theme.bg}
            border='1px solid'
            borderColor={theme.border}
            boxShadow={theme.pulse ? `0 0 22px ${theme.border}` : 'none'}
        >
            <HStack justify='space-between' align='center' mb={1}>
                <HStack spacing={2}>
                    <Icon
                        as={currentStreak >= 10 ? FiZap : FlameIcon}
                        boxSize={5}
                        color={theme.accent}
                        opacity={theme.pulse && currentStreak > 3 ? 0.95 : 1}
                    />
                    <Text fontFamily='heading' fontWeight='black' color={theme.accent} fontSize='xl'>
                        {currentStreak} day{currentStreak !== 1 ? 's' : ''}
                    </Text>
                </HStack>
                <Badge borderRadius='full' px={2.5} py={1} colorScheme='orange' variant='subtle'>
                    <HStack spacing={1}>
                        <Icon as={FiStar} boxSize={3} />
                        <Text>Streak</Text>
                    </HStack>
                </Badge>
            </HStack>
            <Text fontSize='xs' color='var(--color-text-secondary)' mb={2} lineHeight='1.5'>
                {message}
            </Text>
            <HStack spacing={1.5} mb={1.5}>
                {recentActivity.map((active, index) => (
                    <Tooltip key={`${active}-${index}`} label={active ? 'Active day' : 'Missed day'} hasArrow>
                        <Flex
                            w={5}
                            h={5}
                            borderRadius='full'
                            bg={active ? theme.bg : 'rgba(148,163,184,0.15)'}
                            border='1px solid'
                            borderColor={active ? theme.border : 'rgba(148,163,184,0.35)'}
                            align='center'
                            justify='center'
                        >
                            <Icon as={active ? FiCheckCircle : FiCalendar} boxSize={3} color={active ? theme.accent : 'gray.400'} />
                        </Flex>
                    </Tooltip>
                ))}
            </HStack>
            <HStack spacing={1.5}>
                <Icon as={FaTrophy} boxSize={3.5} color='yellow.300' />
                <Text fontSize='xs' color='var(--color-text-muted)'>
                    Longest streak: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
                </Text>
            </HStack>
        </Box>
    );
};

const UnrankedBar = ({ xp, streakDetails }) => {
    const textSec = useColorModeValue('gray.500', 'gray.400');
    const textPrim = useColorModeValue('gray.800', 'gray.100');
    const mutedBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const iconBg = useColorModeValue('gray.200', 'whiteAlpha.200');

    const progressPercent = Math.min(100, Math.round(((xp ?? 0) / BRONZE_XP_TARGET) * 100));
    const animatedProgress = useAnimatedProgress(progressPercent);

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            border="1px solid var(--color-border)"
            borderRadius="16px"
            p={{ base: 4, md: 5 }}
            flexDirection={{ base: 'column', lg: 'row' }}
            align={{ base: 'stretch', lg: 'center' }}
            gap={{ base: 4, lg: 6 }}
            boxShadow="sm"
        >
            <Flex alignItems="center" gap={3} minW={{ lg: '260px' }}>
                <Flex w={12} h={12} borderRadius="full" bg={iconBg} align="center" justify="center">
                    <RankIcon w={6} h={6} color="var(--color-text-muted)" />
                </Flex>
                <Box>
                    <Text fontSize="xs" color={textSec} textTransform="uppercase" letterSpacing="wider">
                        Current Rank
                    </Text>
                    <Text fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="black" color={textPrim} lineHeight="1.1">
                        Unranked
                    </Text>
                    <Text fontSize="xs" color={textSec} mt={1}>Earn XP to unlock your first rank tier.</Text>
                </Box>
            </Flex>

            <Flex
                direction="column"
                bg={mutedBg}
                borderRadius="12px"
                px={3.5}
                py={3}
                minW={{ lg: '170px' }}
                border="1px solid var(--color-border)"
            >
                <Flex align="center" gap={1.5} mb={0.5}>
                    <XPIcon w={3.5} h={3.5} color="yellow.400" />
                    <Text fontSize="xs" color={textSec} textTransform="uppercase" letterSpacing="wider">Total XP</Text>
                </Flex>
                <Text fontFamily="heading" fontWeight="bold" fontSize="xl" color={textPrim}>
                    {(xp ?? 0).toLocaleString()}
                </Text>
            </Flex>

            <Box flex={1}>
                <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" color={textSec} fontWeight="medium">
                        Progress to Bronze ({BRONZE_XP_TARGET.toLocaleString()} XP)
                    </Text>
                    <Badge borderRadius="full" px={2.5} py={1} colorScheme="orange" variant="subtle">
                        {progressPercent}%
                    </Badge>
                </Flex>
                <ProgressTrack
                    value={animatedProgress}
                    accentStart="#d97706"
                    accentEnd="#f59e0b"
                    label="Progress to Bronze"
                />
                <Text fontSize="xs" color={textSec} mt={1.5}>
                    {(xp ?? 0).toLocaleString()} / {BRONZE_XP_TARGET.toLocaleString()} XP
                </Text>
            </Box>

            <StreakPanel streakDetails={streakDetails} />
        </Flex>
    );
};

const UserRankStatsBar = () => {
    const { user, streakDetails, rankMeta, xpToNextRank, progressPercent, isLoadingStats } = useChallengeContext();
    const textSec = useColorModeValue('gray.500', 'gray.400');
    const textPrim = useColorModeValue('gray.800', 'gray.100');
    const mutedBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const animatedProgress = useAnimatedProgress(progressPercent);

    if (isLoadingStats) return <RankStatsSkeleton />;
    if (!user.rank || !rankMeta) return <UnrankedBar xp={user.xp} streakDetails={streakDetails} />;

    const currentIdx = RANK_ORDER.indexOf(user.rank);
    const nextRankKey = currentIdx >= 0 && currentIdx < RANK_ORDER.length - 1
        ? RANK_ORDER[currentIdx + 1]
        : null;
    const nextRankLabel = nextRankKey
        ? `${RANK_META[nextRankKey]?.label ?? nextRankKey}${RANK_META[nextRankKey]?.title ? ` — ${RANK_META[nextRankKey]?.title}` : ''}`
        : 'Max Rank';

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            border="1px solid var(--color-border)"
            borderRadius="16px"
            p={{ base: 4, md: 5 }}
            flexDirection={{ base: 'column', lg: 'row' }}
            align={{ base: 'stretch', lg: 'center' }}
            gap={{ base: 4, lg: 6 }}
            boxShadow="sm"
        >
            <Flex alignItems="center" gap={3} minW={{ lg: '260px' }}>
                <Flex
                    w={12}
                    h={12}
                    borderRadius="full"
                    bgGradient={`linear(to-br, ${rankMeta.gradient[0]}, ${rankMeta.gradient[1]})`}
                    align="center"
                    justify="center"
                    color="#0f172a"
                    boxShadow="0 8px 20px rgba(15, 23, 42, 0.18)"
                >
                    <RankIcon w={6} h={6} />
                </Flex>
                <Box>
                    <Text fontSize="xs" color={textSec} textTransform="uppercase" letterSpacing="wider">
                        Current Rank
                    </Text>
                    <Text fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="black" color={textPrim} lineHeight="1.1">
                        {rankMeta.label}
                    </Text>
                    <Text fontSize="sm" color={rankMeta.color || textSec} mt={1} fontWeight="medium">
                        {user?.rankDetails?.title || rankMeta.title}
                    </Text>
                    <Badge mt={1.5} colorScheme="cyan" variant="subtle" borderRadius="full">Competitive Tier</Badge>
                </Box>
            </Flex>

            <Flex
                direction="column"
                bg={mutedBg}
                borderRadius="12px"
                px={3.5}
                py={3}
                minW={{ lg: '170px' }}
                border="1px solid var(--color-border)"
            >
                <Flex align="center" gap={1.5} mb={0.5}>
                    <XPIcon w={3.5} h={3.5} color="yellow.400" />
                    <Text fontSize="xs" color={textSec} textTransform="uppercase" letterSpacing="wider">Current XP</Text>
                </Flex>
                    <Text fontFamily="heading" fontWeight="bold" fontSize="xl" color={textPrim}>
                        {(user.totalXP ?? user.xp ?? 0).toLocaleString()}
                    </Text>
            </Flex>

            {!user.isMaxRank ? (
                <Box flex={1}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color={textSec} fontWeight="medium">
                            Progress to {nextRankLabel}
                        </Text>
                        <Badge borderRadius="full" px={2.5} py={1} colorScheme="cyan" variant="subtle">
                            {progressPercent}%
                        </Badge>
                    </Flex>
                    <ProgressTrack
                        value={animatedProgress}
                        accentStart={rankMeta.gradient[0]}
                        accentEnd={rankMeta.gradient[1]}
                        label={`Progress to ${nextRankLabel}`}
                    />
                    <Text fontSize="xs" color={textSec} mt={1.5}>
                        {(user.totalXP ?? user.xp ?? 0).toLocaleString()} / {(xpToNextRank ?? 0).toLocaleString()} XP
                    </Text>
                </Box>
            ) : (
                <Box flex={1}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color={textSec} fontWeight="medium">Maximum rank achieved</Text>
                        <Badge borderRadius="full" px={2.5} py={1} colorScheme="purple" variant="subtle">100%</Badge>
                    </Flex>
                    <ProgressTrack
                        value={100}
                        accentStart="#a855f7"
                        accentEnd="#7c3aed"
                        label="Maximum rank achieved"
                    />
                    <Text fontSize="xs" color={textSec} mt={1.5}>Max Rank — Champion</Text>
                </Box>
            )}

            <StreakPanel streakDetails={streakDetails} />
        </Flex>
    );
};

export default UserRankStatsBar;

