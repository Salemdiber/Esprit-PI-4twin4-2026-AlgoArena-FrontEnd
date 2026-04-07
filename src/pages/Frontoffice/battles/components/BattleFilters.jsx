/**
 * BattleFilters – sidebar filter panel
 */
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Checkbox, Input, VStack } from '@chakra-ui/react';
import { BattleMode, BattleStatus } from '../types/battle.types';

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

const BattleFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        modes: [],
        statuses: [],
        search: '',
    });

    // Notify parent via useEffect (avoids setState-during-render)
    useEffect(() => {
        onFilterChange?.(filters);
    }, [filters, onFilterChange]);

    const toggleFilter = (key, value) => {
        setFilters(prev => {
            const arr = prev[key];
            const updated = arr.includes(value)
                ? arr.filter(v => v !== value)
                : [...arr, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const modes = [
        { key: BattleMode.ONE_VS_ONE, label: '1vs1' },
        { key: BattleMode.ONE_VS_AI, label: '1vsAI' },
    ];

    const statuses = [
        { key: BattleStatus.ACTIVE, label: 'Active' },
        { key: BattleStatus.WAITING, label: 'Waiting' },
        { key: BattleStatus.COMPLETED, label: 'Completed' },
    ];

    return (
        <Box as="aside" w={{ base: 'full', lg: '256px' }} flexShrink={0}>
            <VStack spacing={4} align="stretch">
                {/* Mode Filters */}
                <FilterSection title="Mode">
                    <VStack spacing={2} align="stretch">
                        {modes.map(mode => (
                            <Flex
                                key={mode.key}
                                as="label"
                                align="center"
                                gap={3}
                                cursor="pointer"
                                _hover={{ '& > span:first-of-type': { color: 'brand.500' } }}
                            >
                                <Checkbox
                                    isChecked={filters.modes.includes(mode.key)}
                                    onChange={() => toggleFilter('modes', mode.key)}
                                    colorScheme="cyan"
                                    size="md"
                                    borderColor="var(--color-border)"
                                />
                                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight="medium" transition="colors 0.2s">{mode.label}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Status Filters */}
                <FilterSection title="Status">
                    <VStack spacing={2} align="stretch">
                        {statuses.map(status => (
                            <Flex
                                key={status.key}
                                as="label"
                                align="center"
                                gap={3}
                                cursor="pointer"
                                _hover={{ '& > span:first-of-type': { color: 'brand.500' } }}
                            >
                                <Checkbox
                                    isChecked={filters.statuses.includes(status.key)}
                                    onChange={() => toggleFilter('statuses', status.key)}
                                    colorScheme="cyan"
                                    size="md"
                                    borderColor="var(--color-border)"
                                />
                                <Text color="var(--color-text-primary)" fontSize="sm" fontWeight="medium" transition="colors 0.2s">{status.label}</Text>
                            </Flex>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Search */}
                <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" boxShadow="var(--shadow-card)" borderRadius="12px" p={5}>
                    <Text fontFamily="heading" fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)" mb={3} textTransform="uppercase" letterSpacing="wider">
                        Search
                    </Text>
                    <Input
                        placeholder="Opponent name..."
                        value={filters.search}
                        onChange={handleSearch}
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

export default BattleFilters;
