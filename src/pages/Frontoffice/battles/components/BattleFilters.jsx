/**
 * BattleFilters – sidebar filter panel
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Checkbox, Input, VStack } from '@chakra-ui/react';
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
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        modes: [],
        statuses: [],
        search: '',
    });

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
        { key: BattleMode.ONE_VS_ONE, label: t('battles.mode1vs1') },
        { key: BattleMode.ONE_VS_AI, label: t('battles.mode1vsAI') },
    ];

    const statuses = [
        { key: BattleStatus.ACTIVE, label: t('battles.statusActive') },
        { key: BattleStatus.WAITING, label: t('battles.statusWaiting') },
        { key: BattleStatus.COMPLETED, label: t('battles.statusCompleted') },
    ];

    return (
        <Box as="aside" w={{ base: 'full', lg: '256px' }} flexShrink={0}>
            <VStack spacing={4} align="stretch">
                {/* Mode Filters */}
                <FilterSection title={t('battles.mode')}>
                    <VStack spacing={2} align="stretch">
                        {modes.map(mode => (
                            <Checkbox
                                key={mode.key}
                                isChecked={filters.modes.includes(mode.key)}
                                onChange={() => toggleFilter('modes', mode.key)}
                                colorScheme="cyan"
                                size="md"
                                borderColor="var(--color-border)"
                                sx={{ '.chakra-checkbox__label': { color: 'var(--color-text-primary)', fontSize: 'sm', fontWeight: 'medium' } }}
                            >
                                {mode.label}
                            </Checkbox>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Status Filters */}
                <FilterSection title={t('battles.status')}>
                    <VStack spacing={2} align="stretch">
                        {statuses.map(status => (
                            <Checkbox
                                key={status.key}
                                isChecked={filters.statuses.includes(status.key)}
                                onChange={() => toggleFilter('statuses', status.key)}
                                colorScheme="cyan"
                                size="md"
                                borderColor="var(--color-border)"
                                sx={{ '.chakra-checkbox__label': { color: 'var(--color-text-primary)', fontSize: 'sm', fontWeight: 'medium' } }}
                            >
                                {status.label}
                            </Checkbox>
                        ))}
                    </VStack>
                </FilterSection>

                {/* Search */}
                <Box bg="var(--color-bg-card)" border="1px solid var(--color-border)" boxShadow="var(--shadow-card)" borderRadius="12px" p={5}>
                    <Text
                        as="label"
                        htmlFor="battle-search-input"
                        fontFamily="heading"
                        fontSize="xs"
                        fontWeight="bold"
                        color="var(--color-text-secondary)"
                        mb={3}
                        textTransform="uppercase"
                        letterSpacing="wider"
                        display="block"
                    >
                        {t('battles.search')}
                    </Text>
                    <Input
                        id="battle-search-input"
                        type="search"
                        aria-label={t('battles.search')}
                        placeholder={t('battles.opponentNamePlaceholder')}
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
