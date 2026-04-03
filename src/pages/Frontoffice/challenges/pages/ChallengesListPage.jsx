/**
 * ChallengesListPage – /challenges
 *
 * Shows:
 *  • UserRankStatsBar
 *  • ChallengesFilters (sidebar)
 *  • Filtered challenge cards (main)
 *  • Sort dropdown & count
 *  • Loading skeleton state
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Select,
    VStack,
    useToast,
    HStack,
    Button,
    Icon,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import UserRankStatsBar from '../components/UserRankStatsBar';
import ChallengesFilters from '../components/ChallengesFilters';
import ChallengeCard from '../components/ChallengeCard';
import useChallenges from '../hooks/useChallenges';
import ChallengesListSkeleton from '../../../../shared/skeletons/ChallengesListSkeleton';
import { useChallengeContext } from '../context/ChallengeContext';
import { fetchUserAttempts } from '../../../../services/userStatsService';
import { judgeService } from '../../../../services/judgeService';

const MotionBox = motion.create(Box);
const GRACE_PREFIX = 'challenge-grace:';

const ChallengesListPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { streakDetails } = useChallengeContext();
    const {
        filteredChallenges,
        filteredCount,
        isLoadingChallenges,
        selectedDifficulties,
        toggleDifficulty,
        selectedTags,
        toggleTag,
        selectedStatuses,
        toggleStatus,
        recommendedOnly,
        setRecommendedOnly,
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        SORT_OPTIONS,
        difficultyCounts,
        tagCounts,
    } = useChallenges();
    const [graceMap, setGraceMap] = React.useState({});
    const [activeGrace, setActiveGrace] = React.useState(null);
    const [expiredMessage, setExpiredMessage] = React.useState('');

    React.useEffect(() => {
        const currentStreak = Number(streakDetails?.currentStreak || 0);
        const message = streakDetails?.streakMessage || '';
        if (!message) return;
        const sessionKey = `streak-toast-shown:${new Date().toISOString().slice(0, 10)}`;
        if (sessionStorage.getItem(sessionKey)) return;

        toast({
            title: `\u{1F525} ${currentStreak} day${currentStreak !== 1 ? 's' : ''} streak`,
            description: message,
            status: currentStreak > 1 ? 'success' : 'info',
            duration: 6000,
            isClosable: true,
            position: 'top-right',
        });
        sessionStorage.setItem(sessionKey, '1');
    }, [streakDetails, toast]);

    React.useEffect(() => {
        let cancelled = false;

        const syncGrace = async () => {
            const attempts = await fetchUserAttempts();
            if (cancelled) return;
            const next = {};
            const nowMs = Date.now();

            attempts.forEach((entry) => {
                const challengeId = entry?.challengeId;
                if (!challengeId) return;
                if (entry?.attemptStatus === 'grace_period' && entry?.gracePeriodExpiresAt) {
                    const expiresMs = new Date(entry.gracePeriodExpiresAt).getTime();
                    if (Number.isFinite(expiresMs) && expiresMs > nowMs) {
                        next[challengeId] = {
                            attemptId: entry.attemptId || null,
                            gracePeriodExpiresAt: entry.gracePeriodExpiresAt,
                        };
                        localStorage.setItem(`${GRACE_PREFIX}${challengeId}`, JSON.stringify({
                            challengeId,
                            attemptId: entry.attemptId || null,
                            gracePeriodExpiresAt: entry.gracePeriodExpiresAt,
                            leftAt: entry.leftAt || null,
                        }));
                    }
                }
            });

            Object.keys(localStorage).forEach((key) => {
                if (!key.startsWith(GRACE_PREFIX)) return;
                try {
                    const payload = JSON.parse(localStorage.getItem(key) || '{}');
                    if (!payload?.challengeId || !payload?.gracePeriodExpiresAt) {
                        localStorage.removeItem(key);
                        return;
                    }
                    const expiresMs = new Date(payload.gracePeriodExpiresAt).getTime();
                    if (!Number.isFinite(expiresMs) || expiresMs <= nowMs) {
                        localStorage.removeItem(key);
                        return;
                    }
                    if (!next[payload.challengeId]) {
                        next[payload.challengeId] = {
                            attemptId: payload.attemptId || null,
                            gracePeriodExpiresAt: payload.gracePeriodExpiresAt,
                        };
                    }
                } catch {
                    localStorage.removeItem(key);
                }
            });

            setGraceMap(next);
        };

        syncGrace();
        const poller = setInterval(syncGrace, 15000);
        return () => {
            cancelled = true;
            clearInterval(poller);
        };
    }, []);

    React.useEffect(() => {
        const tick = async () => {
            const now = Date.now();
            let nextActive = null;
            let minRemaining = Number.POSITIVE_INFINITY;
            const updates = { ...graceMap };

            for (const [challengeId, data] of Object.entries(graceMap)) {
                const expiresMs = new Date(data.gracePeriodExpiresAt).getTime();
                const remaining = Math.max(0, Math.floor((expiresMs - now) / 1000));

                if (remaining <= 0) {
                    delete updates[challengeId];
                    localStorage.removeItem(`${GRACE_PREFIX}${challengeId}`);
                    await judgeService.abandonAttempt(challengeId, 'timeout').catch(() => null);
                    setExpiredMessage('Grace period expired. Your attempt has been marked as abandoned.');
                    continue;
                }

                if (remaining < minRemaining) {
                    minRemaining = remaining;
                    nextActive = {
                        challengeId,
                        remainingSeconds: remaining,
                    };
                }
            }

            if (Object.keys(updates).length !== Object.keys(graceMap).length) {
                setGraceMap(updates);
            }
            setActiveGrace(nextActive);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [graceMap]);

    const formatGrace = React.useCallback((seconds) => {
        const mins = Math.floor((seconds || 0) / 60);
        const secs = (seconds || 0) % 60;
        return `${String(mins)}:${String(secs).padStart(2, '0')}`;
    }, []);

    const activeGraceChallenge = React.useMemo(
        () => filteredChallenges.find((challenge) => challenge.id === activeGrace?.challengeId) || null,
        [filteredChallenges, activeGrace],
    );

    // Show skeleton during loading
    if (isLoadingChallenges) {
        return <ChallengesListSkeleton />;
    }

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            minH="100vh"
            pt={{ base: 24, md: 28 }}
            pb={6}
            px={{ base: 4, sm: 6, lg: 8 }}
            bg="var(--color-bg-primary)"
            bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
            bgSize="50px 50px"
        >
            <Box maxW="7xl" mx="auto">
                {/* Header */}
                <Box mb={8}>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontSize={{ base: '4xl', sm: '5xl' }}
                        fontWeight="bold"
                        color="var(--color-text-heading)"
                        mb={2}
                    >
                        Challenges
                    </Text>
                    <Text fontSize="lg" color="var(--color-text-secondary)" mb={6}>
                        Sharpen your skills. Climb your rank.
                    </Text>

                    <UserRankStatsBar />
                </Box>
                {activeGrace && (
                    <Box
                        mb={6}
                        p={4}
                        borderRadius="12px"
                        bg="rgba(245,158,11,0.13)"
                        border="1px solid rgba(245,158,11,0.35)"
                    >
                        <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                            <HStack spacing={2.5}>
                                <Icon as={FiClock} color="orange.300" />
                                <Box>
                                    <Text fontWeight="semibold" color="orange.100">
                                        You have an incomplete challenge: {activeGraceChallenge?.title || activeGrace.challengeId}
                                    </Text>
                                    <Text color="orange.200" fontSize="sm">
                                        Time remaining to return: {formatGrace(activeGrace.remainingSeconds)}
                                    </Text>
                                </Box>
                            </HStack>
                            <Button
                                size="sm"
                                colorScheme="orange"
                                onClick={() => navigate(`/challenges/${activeGrace.challengeId}`)}
                            >
                                Return to Challenge
                            </Button>
                        </Flex>
                    </Box>
                )}
                {!activeGrace && expiredMessage && (
                    <Box
                        mb={6}
                        p={4}
                        borderRadius="12px"
                        bg="rgba(239,68,68,0.12)"
                        border="1px solid rgba(239,68,68,0.35)"
                    >
                        <Text color="red.200" fontWeight="semibold">{expiredMessage}</Text>
                    </Box>
                )}

                {/* Main layout */}
                <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
                    {/* Sidebar */}
                    <ChallengesFilters
                        selectedDifficulties={selectedDifficulties}
                        toggleDifficulty={toggleDifficulty}
                        selectedTags={selectedTags}
                        toggleTag={toggleTag}
                        selectedStatuses={selectedStatuses}
                        toggleStatus={toggleStatus}
                        recommendedOnly={recommendedOnly}
                        setRecommendedOnly={setRecommendedOnly}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        difficultyCounts={difficultyCounts}
                        tagCounts={tagCounts}
                    />

                    {/* Main content */}
                    <Box flex={1}>
                        {/* Toolbar */}
                        <Flex justify="space-between" align="center" mb={6}>
                            <Text color="var(--color-text-secondary)">
                                Showing{' '}
                                <Text as="span" color="brand.500" fontWeight="semibold">
                                    {filteredCount}
                                </Text>{' '}
                                challenges
                            </Text>
                            <Select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                w="220px"
                                size="md"
                                borderRadius="lg"
                                borderColor="var(--color-border)"
                                bg="var(--color-bg-input)"
                                color="var(--color-text-primary)"
                                _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                                _hover={{ borderColor: 'var(--color-border)' }}
                                iconColor="var(--color-text-muted)"
                                cursor="pointer"
                                fontWeight="medium"
                                fontSize="sm"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        Sort by: {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </Flex>

                        {/* Challenge cards */}
                        <VStack spacing={4} align="stretch">
                            {filteredChallenges.length === 0 ? (
                                <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" borderRadius="12px" p={10} textAlign="center">
                                    <Text fontSize="2xl" mb={2}>🔍</Text>
                                    <Text color="var(--color-text-secondary)" fontWeight="medium">No challenges match your current filters.</Text>
                                    <Text color="var(--color-text-muted)" fontSize="sm" mt={1}>
                                        Try adjusting your filters or search query.
                                    </Text>
                                </Box>
                            ) : (
                                filteredChallenges.map(challenge => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        graceInfo={graceMap[challenge.id] || null}
                                    />
                                ))
                            )}
                        </VStack>
                    </Box>
                </Flex>
            </Box>
        </MotionBox>
    );
};

export default ChallengesListPage;
