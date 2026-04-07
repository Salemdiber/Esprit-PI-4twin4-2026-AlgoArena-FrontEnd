/**
 * ChallengesFilters – sidebar filter panel.
 *
 * Difficulty checkboxes, tag checkboxes, status checkboxes,
 * recommended toggle, and search input.
 * All using Chakra components.
 */
import React from 'react';
import {
    Box,
    Text,
    Checkbox,
    Flex,
    Switch,
    Input,
    VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Difficulty, ALL_TAGS, ChallengeUserStatus } from '../data/mockChallenges';

const FilterSection = ({ title, children }) => (
    <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" boxShadow="var(--shadow-card)" borderRadius="12px" p={5}>
        <Text
            fontFamily="heading"
            fontSize="xs"
            fontWeight="bold"
            color="var(--color-text-secondary)"
            mb={4}
            textTransform="uppercase"
            letterSpacing="wider"
        >
            {title}
        </Text>
        {children}
    </Box>
);

const ChallengesFilters = ({
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
    difficultyCounts,
    tagCounts,
}) => {
    const { t } = useTranslation();
    const difficulties = [
        { key: Difficulty.EASY, label: t('challengePage.easy') },
        { key: Difficulty.MEDIUM, label: t('challengePage.medium') },
        { key: Difficulty.HARD, label: t('challengePage.hard') },
        { key: Difficulty.EXPERT, label: t('challengePage.expert') },
    ];

    const statuses = [
        { key: ChallengeUserStatus.SOLVED, label: t('challengePage.filterSolved') },
        { key: ChallengeUserStatus.ATTEMPTED, label: t('challengePage.filterAttempted') },
        { key: ChallengeUserStatus.UNSOLVED, label: t('challengePage.filterUnsolved') },
    ];

    // Show top 6 tags for compactness
    const displayTags = ALL_TAGS.slice(0, 6);

    return (
        <Box as="aside" w={{ base: 'full', lg: '256px' }} flexShrink={0}>
            <VStack spacing={4} align="stretch">

                {/* Difficulty */}
                <FilterSection title={t('challengePage.difficultyFilter')}>
                    <VStack spacing={2} align="stretch">
                        {difficulties.map(d => (
                            <Flex
                                key={d.key}
                                as="label"
                                align="center"
                                gap={3}
                                cursor="pointer"
                                _hover={{ '& > span:first-of-type': { color: 'brand.500' } }}
                            >
                                <Checkbox
                                    isChecked={selectedDifficulties.includes(d.key)}
                                    onChange={() => toggleDifficulty(d.key)}
                                    colorScheme="cyan"
                                    size="md"
                                    borderColor="var(--color-border)"
                                />
                                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight="medium" transition="colors 0.2s">{d.label}</Text>
                                <Box ml="auto">
                                    <Text fontSize="xs" fontWeight="semibold" color="var(--color-text-muted)" bg="var(--color-bg-primary)" px={2} py={0.5} borderRadius="full" border="1px solid var(--color-border)">
                                        {difficultyCounts[d.key] || 0}
                                    </Text>
                                </Box>
                            </Flex>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Tags */}
                <FilterSection title={t('challengePage.tagsFilter')}>
                    <VStack spacing={2} align="stretch">
                        {displayTags.map(tag => (
                            <Flex
                                key={tag}
                                as="label"
                                align="center"
                                gap={3}
                                cursor="pointer"
                                _hover={{ '& > span:first-of-type': { color: 'brand.500' } }}
                            >
                                <Checkbox
                                    isChecked={selectedTags.includes(tag)}
                                    onChange={() => toggleTag(tag)}
                                    colorScheme="cyan"
                                    size="md"
                                    borderColor="var(--color-border)"
                                />
                                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight="medium" transition="colors 0.2s">{tag}</Text>
                                {tagCounts[tag] && (
                                    <Box ml="auto">
                                        <Text fontSize="xs" fontWeight="semibold" color="var(--color-text-muted)" bg="var(--color-bg-primary)" px={2} py={0.5} borderRadius="full" border="1px solid var(--color-border)">
                                            {tagCounts[tag]}
                                        </Text>
                                    </Box>
                                )}
                            </Flex>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Status */}
                <FilterSection title={t('challengePage.statusFilter')}>
                    <VStack spacing={2} align="stretch">
                        {statuses.map(s => (
                            <Flex
                                key={s.key}
                                as="label"
                                align="center"
                                gap={3}
                                cursor="pointer"
                                _hover={{ '& > span:first-of-type': { color: 'brand.500' } }}
                            >
                                <Checkbox
                                    isChecked={selectedStatuses.includes(s.key)}
                                    onChange={() => toggleStatus(s.key)}
                                    colorScheme="cyan"
                                    size="md"
                                    borderColor="var(--color-border)"
                                />
                                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight="medium" transition="colors 0.2s">{s.label}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Recommended toggle */}
                <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" boxShadow="var(--shadow-card)" borderRadius="12px" p={5}>
                    <Flex as="label" align="center" justify="space-between" cursor="pointer">
                        <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)">{t('challengePage.recommendedForRank')}</Text>
                        <Switch
                            isChecked={recommendedOnly}
                            onChange={(e) => setRecommendedOnly(e.target.checked)}
                            colorScheme="cyan"
                            size="md"
                        />
                    </Flex>
                </Box>

                {/* Search */}
                <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" boxShadow="var(--shadow-card)" borderRadius="12px" p={5}>
                    <Text fontFamily="heading" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" mb={3} textTransform="uppercase" letterSpacing="wider">
                        {t('challengePage.searchFilter')}
                    </Text>
                    <Input
                        placeholder={t('challengePage.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-normalized"
                        w="100%"
                        h="44px"
                        px={4}
                        borderRadius="md"
                    />
                </Box>
            </VStack>
        </Box>
    );
};

export default ChallengesFilters;
