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
    const difficulties = [
        { key: Difficulty.EASY, label: 'Easy' },
        { key: Difficulty.MEDIUM, label: 'Medium' },
        { key: Difficulty.HARD, label: 'Hard' },
        { key: Difficulty.EXPERT, label: 'Expert' },
    ];

    const statuses = [
        { key: ChallengeUserStatus.SOLVED, label: 'Solved' },
        { key: ChallengeUserStatus.ATTEMPTED, label: 'Attempted' },
        { key: ChallengeUserStatus.UNSOLVED, label: 'Unsolved' },
    ];

    // Show top 6 tags for compactness
    const displayTags = ALL_TAGS.slice(0, 6);

    return (
        <Box as="aside" w={{ base: 'full', lg: '256px' }} flexShrink={0}>
            <VStack spacing={4} align="stretch">

                {/* Difficulty */}
                <FilterSection title="Difficulty">
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
                <FilterSection title="Tags">
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
                <FilterSection title="Status">
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
                        <Text fontSize="sm" fontWeight="medium" color="var(--color-text-primary)">Recommended for my rank</Text>
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
                        Search
                    </Text>
                    <Input
                        placeholder="Search challenges..."
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
