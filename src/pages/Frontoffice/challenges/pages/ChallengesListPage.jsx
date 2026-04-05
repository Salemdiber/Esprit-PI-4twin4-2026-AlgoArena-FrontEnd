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
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import UserRankStatsBar from '../components/UserRankStatsBar';
import ChallengesFilters from '../components/ChallengesFilters';
import ChallengeCard from '../components/ChallengeCard';
import useChallenges from '../hooks/useChallenges';
import ChallengesListSkeleton from '../../../../shared/skeletons/ChallengesListSkeleton';

const MotionBox = motion.create(Box);

const ChallengesListPage = () => {
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
                                    <ChallengeCard key={challenge.id} challenge={challenge} />
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
