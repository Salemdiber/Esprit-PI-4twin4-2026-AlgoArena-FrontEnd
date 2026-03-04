/**
 * UserRankStatsBar – displays current rank, XP progress, and streak.
 *
 * All values come from ChallengeContext (which fetches from GET /user/me/rank-stats).
 * Renders a loading skeleton while isLoadingStats is true.
 * Gracefully handles null rank (unranked / pre-placement users).
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Badge,
    Progress,
    Icon,
    Skeleton,
    useColorModeValue,
} from '@chakra-ui/react';
import { useChallengeContext } from '../context/ChallengeContext';
import { RANK_META, Rank } from '../data/mockChallenges';

// ── Rank order for next-rank label ──────────────────────────────────────────
const RANK_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

const FlameIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
    </Icon>
);

// ── Loading skeleton ─────────────────────────────────────────────────────────
const RankStatsSkeleton = () => (
    <Flex
        bg="var(--color-bg-secondary)"
        borderRadius="12px"
        p={4}
        flexWrap="wrap"
        alignItems="center"
        gap={6}
    >
        <Flex alignItems="center" gap={3}>
            <Skeleton height="36px" width="100px" borderRadius="8px" />
            <Box>
                <Skeleton height="12px" width="60px" mb={2} />
                <Skeleton height="18px" width="120px" />
            </Box>
        </Flex>
        <Box flex={1} minW="200px">
            <Skeleton height="12px" width="140px" mb={2} />
            <Skeleton height="8px" borderRadius="full" />
        </Box>
        <Flex alignItems="center" gap={2}>
            <Skeleton height="20px" width="20px" borderRadius="full" />
            <Box>
                <Skeleton height="12px" width="40px" mb={1} />
                <Skeleton height="18px" width="60px" />
            </Box>
        </Flex>
    </Flex>
);

// ── "Unranked" state when user has no rank yet ───────────────────────────────
const UnrankedBar = ({ xp, streak }) => {
    const textSec = useColorModeValue('gray.500', 'gray.400');
    const textPrim = useColorModeValue('gray.800', 'gray.100');

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            p={4}
            flexWrap="wrap"
            alignItems="center"
            gap={6}
        >
            {/* Unranked badge */}
            <Flex alignItems="center" gap={3}>
                <Badge
                    bg="var(--color-tag-bg)"
                    color="var(--color-text-muted)"
                    fontWeight="bold"
                    px={4}
                    py={2}
                    borderRadius="8px"
                    fontSize="sm"
                    textTransform="uppercase"
                >
                    Unranked
                </Badge>
                <Box>
                    <Text fontSize="xs" color={textSec}>Total XP</Text>
                    <Text fontFamily="heading" fontWeight="bold" color={textPrim}>
                        {(xp ?? 0).toLocaleString()}
                    </Text>
                </Box>
            </Flex>

            {/* Progress toward first rank */}
            <Box flex={1} minW="200px">
                <Flex justify="space-between" fontSize="xs" color={textSec} mb={1}>
                    <Text>Progress to Bronze (500 XP)</Text>
                    <Text>{Math.min(100, Math.round(((xp ?? 0) / 500) * 100))}%</Text>
                </Flex>
                <Progress
                    value={Math.min(100, Math.round(((xp ?? 0) / 500) * 100))}
                    size="sm"
                    borderRadius="full"
                    bg="var(--color-tag-bg)"
                    sx={{
                        '& > div': {
                            bgGradient: 'linear(to-r, #cd7f32, #a0522d)',
                            borderRadius: 'full',
                        },
                    }}
                />
            </Box>

            {/* Streak */}
            {streak > 0 && (
                <Flex alignItems="center" gap={2}>
                    <FlameIcon w={5} h={5} color="red.500" />
                    <Box>
                        <Text fontSize="xs" color={textSec}>Streak</Text>
                        <Text fontFamily="heading" fontWeight="bold" color="red.500">
                            {streak} day{streak !== 1 ? 's' : ''}
                        </Text>
                    </Box>
                </Flex>
            )}
        </Flex>
    );
};

// ── Main component ────────────────────────────────────────────────────────────
const UserRankStatsBar = () => {
    const { user, rankMeta, xpToNextRank, progressPercent, isLoadingStats } = useChallengeContext();
    const textSec = useColorModeValue('gray.500', 'gray.400');
    const textPrim = useColorModeValue('gray.800', 'gray.100');

    // Loading state
    if (isLoadingStats) return <RankStatsSkeleton />;

    // Unranked / pre-placement state
    if (!user.rank || !rankMeta) {
        return <UnrankedBar xp={user.xp} streak={user.streak} />;
    }

    // Next rank label
    const currentIdx = RANK_ORDER.indexOf(user.rank);
    const nextRankKey = currentIdx >= 0 && currentIdx < RANK_ORDER.length - 1
        ? RANK_ORDER[currentIdx + 1]
        : null;
    const nextRankLabel = nextRankKey
        ? (RANK_META[nextRankKey]?.label ?? nextRankKey)
        : 'Max Rank';

    return (
        <Flex
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            p={4}
            flexWrap="wrap"
            alignItems="center"
            gap={6}
        >
            {/* Rank badge + XP */}
            <Flex alignItems="center" gap={3}>
                <Badge
                    bgGradient={`linear(to-r, ${rankMeta.gradient[0]}, ${rankMeta.gradient[1]})`}
                    color="#0f172a"
                    fontWeight="bold"
                    px={4}
                    py={2}
                    borderRadius="8px"
                    fontSize="sm"
                    textTransform="uppercase"
                >
                    {rankMeta.label} Rank
                </Badge>
                <Box>
                    <Text fontSize="xs" color={textSec}>Current XP</Text>
                    <Text fontFamily="heading" fontWeight="bold" color={textPrim}>
                        {(user.xp ?? 0).toLocaleString()}
                        {!user.isMaxRank && (
                            <Text as="span" fontWeight="normal" color={textSec}>
                                {' '}/ {(xpToNextRank ?? 0).toLocaleString()}
                            </Text>
                        )}
                    </Text>
                </Box>
            </Flex>

            {/* Progress bar */}
            {!user.isMaxRank && (
                <Box flex={1} minW="200px">
                    <Flex justify="space-between" fontSize="xs" color={textSec} mb={1}>
                        <Text>Progress to {nextRankLabel}</Text>
                        <Text>{progressPercent}%</Text>
                    </Flex>
                    <Progress
                        value={progressPercent}
                        size="sm"
                        borderRadius="full"
                        bg="var(--color-tag-bg)"
                        sx={{
                            '& > div': {
                                bgGradient: `linear(to-r, ${rankMeta.gradient[0]}, ${rankMeta.gradient[1]})`,
                                borderRadius: 'full',
                            },
                        }}
                    />
                </Box>
            )}

            {user.isMaxRank && (
                <Box flex={1} minW="200px">
                    <Text fontSize="xs" color={textSec} mb={1}>Maximum rank achieved 🏆</Text>
                    <Progress value={100} size="sm" borderRadius="full" bg="var(--color-tag-bg)"
                        sx={{ '& > div': { bgGradient: 'linear(to-r, #a855f7, #7c3aed)', borderRadius: 'full' } }} />
                </Box>
            )}

            {/* Streak */}
            <Flex alignItems="center" gap={2}>
                <FlameIcon w={5} h={5} color="red.500" />
                <Box>
                    <Text fontSize="xs" color={textSec}>Streak</Text>
                    <Text fontFamily="heading" fontWeight="bold" color="red.500">
                        {(user.streak ?? 0)} day{(user.streak ?? 0) !== 1 ? 's' : ''}
                    </Text>
                </Box>
            </Flex>
        </Flex>
    );
};

export default UserRankStatsBar;
