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
    HStack,
    Button,
    Badge,
    Icon,
    useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiClock, FiZap } from 'react-icons/fi';
import UserRankStatsBar from '../components/UserRankStatsBar';
import ChallengesFilters from '../components/ChallengesFilters';
import ChallengeCard from '../components/ChallengeCard';
import useChallenges from '../hooks/useChallenges';
import ChallengesListSkeleton from '../../../../shared/skeletons/ChallengesListSkeleton';
import { useChallengeContext } from '../context/ChallengeContext';

const MotionBox = motion.create(Box);

const ChallengesListPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { streakDetails, userProgress, challenges } = useChallengeContext();
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

    // Show skeleton during loading
    if (isLoadingChallenges) {
        return <ChallengesListSkeleton />;
    }

    const inProgressItems = (Array.isArray(userProgress) ? userProgress : [])
        .filter((item) => item?.userStatus === 'in_progress')
        .map((item) => ({
            ...item,
            challenge: (Array.isArray(challenges) ? challenges : []).find((challenge) => challenge.id === item.challengeId),
        }))
        .filter((item) => Boolean(item.challenge));

    const mostRecentInProgress = inProgressItems
        .slice()
        .sort((a, b) => new Date(b.lastActiveAt || b.lastAttemptAt || 0).getTime() - new Date(a.lastActiveAt || a.lastAttemptAt || 0).getTime())[0] || null;

    const getRelative = (iso) => {
        if (!iso) return 'recently';
        const diff = Date.now() - new Date(iso).getTime();
        const minutes = Math.max(1, Math.floor(diff / 60000));
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    };

    const fullXpRemainingPercent = (elapsedSeconds) => {
        const threshold = 3600;
        if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return 100;
        const remaining = Math.max(0, threshold - Number(elapsedSeconds));
        return Math.round((remaining / threshold) * 100);
    };

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

                {inProgressItems.length > 0 && (
                    <Box
                        mb={6}
                        p={{ base: 4, md: 6 }}
                        borderRadius="16px"
                        borderLeft="4px solid #f59e0b"
                        border="1px solid rgba(245,158,11,0.22)"
                        bg="var(--color-bg-secondary)"
                        boxShadow="0 12px 30px rgba(15,23,42,0.24)"
                    >
                        <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={4}>
                            <HStack align="flex-start" spacing={4}>
                                <Icon as={FiZap} boxSize={6} color="orange.300" mt={0.5} />
                                <Box>
                                    <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="orange.300">
                                        {inProgressItems.length === 1 ? 'You have a challenge in progress!' : `You have ${inProgressItems.length} challenges in progress!`}
                                    </Text>
                                    {inProgressItems.length === 1 && mostRecentInProgress && (
                                        <>
                                            <HStack mt={1.5} spacing={2} flexWrap="wrap">
                                                <Text color="var(--color-text-primary)" fontSize="md" fontWeight="medium">
                                                    {mostRecentInProgress.challenge?.title}
                                                </Text>
                                                <Badge colorScheme="orange" variant="subtle">
                                                    {mostRecentInProgress.challenge?.difficulty}
                                                </Badge>
                                            </HStack>
                                            <HStack mt={1.5} spacing={2} color="var(--color-text-muted)">
                                                <Icon as={FiClock} boxSize={3.5} />
                                                <Text fontSize="sm">
                                                    Started {getRelative(mostRecentInProgress.lastActiveAt || mostRecentInProgress.lastAttemptAt)} • {fullXpRemainingPercent(mostRecentInProgress.totalElapsedTime)}% of time remaining for full XP
                                                </Text>
                                            </HStack>
                                        </>
                                    )}
                                    {inProgressItems.length > 1 && (
                                        <VStack mt={2.5} align="stretch" spacing={1.5}>
                                            {inProgressItems.slice(0, 3).map((item) => (
                                                <HStack key={item.challengeId} spacing={2}>
                                                    <Text fontSize="sm" color="var(--color-text-primary)">{item.challenge?.title}</Text>
                                                    <Button variant="link" size="sm" colorScheme="orange" onClick={() => navigate(`/challenges/${item.challengeId}`)}>
                                                        Continue
                                                    </Button>
                                                </HStack>
                                            ))}
                                        </VStack>
                                    )}
                                </Box>
                            </HStack>
                            <Button
                                leftIcon={<Icon as={FiArrowRight} />}
                                bg="orange.400"
                                color="white"
                                _hover={{ bg: 'orange.300' }}
                                borderRadius="12px"
                                onClick={() => navigate(`/challenges/${(mostRecentInProgress || inProgressItems[0]).challengeId}`)}
                                w={{ base: 'full', md: 'auto' }}
                            >
                                Continue Solving
                            </Button>
                        </Flex>
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
