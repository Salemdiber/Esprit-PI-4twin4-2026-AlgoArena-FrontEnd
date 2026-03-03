/**
 * ThemeSwitcher — Premium dropdown for Light / Dark / Auto mode.
 *
 * Uses Chakra UI Menu + Framer Motion for smooth micro-interactions.
 * Follows the project's design language: cyan accents, glass-panel
 * styling, 8 px spacing, Montserrat headings, Inter body.
 */
import React, { useMemo } from 'react';
import {
    Box,
    Flex,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    Text,
    useColorModeValue,
    Tooltip,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemePreference } from '../shared/context/ThemeContext';

/* ─── Motion wrapper ─── */
const MotionBox = motion.create(Box);

/* ─── SVG Icons (inline, no external deps) ─── */

const SunIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Icon>
);

const MoonIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Icon>
);

const MonitorIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </Icon>
);

const CheckIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12" />
    </Icon>
);

/* ─── Theme option definitions ─── */
const THEME_OPTIONS = [
    {
        key: 'light',
        label: 'Light',
        description: 'Always use light theme',
        icon: SunIcon,
        preview: { bg: '#f9fafb', accent: '#e0f7fa' },
    },
    {
        key: 'dark',
        label: 'Dark',
        description: 'Always use dark theme',
        icon: MoonIcon,
        preview: { bg: '#111827', accent: '#006064' },
    },
    {
        key: 'auto',
        label: 'Auto',
        description: 'Follow system preference',
        icon: MonitorIcon,
        preview: { bg: 'linear-gradient(135deg, #f9fafb 50%, #111827 50%)', accent: null },
    },
];

/* ─── Individual Option Row ─── */
const ThemeOption = ({ option, isActive, resolvedColorMode, onClick }) => {
    /* Semantic colors that adapt to current mode — all hooks at the top */
    const hoverBg = useColorModeValue('gray.100', 'rgba(34, 211, 238, 0.08)');
    const textColor = useColorModeValue('gray.700', 'gray.200');
    const descColor = useColorModeValue('gray.500', 'gray.400');
    const iconBgInactive = useColorModeValue('gray.100', 'gray.800');
    const iconColorInactive = useColorModeValue('gray.500', 'gray.400');
    const swatchBorder = useColorModeValue('gray.300', 'gray.600');
    const activeBorder = 'brand.500';
    const OptionIcon = option.icon;

    return (
        <MotionBox
            as="button"
            type="button"
            role="menuitem"
            aria-checked={isActive}
            onClick={onClick}
            w="100%"
            display="flex"
            alignItems="center"
            gap={3}
            px={4}
            py={3}
            bg="transparent"
            border="none"
            borderLeft="3px solid"
            borderColor={isActive ? activeBorder : 'transparent'}
            borderRadius="0"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: hoverBg }}
            _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '-2px' }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Icon */}
            <Flex
                align="center"
                justify="center"
                w="36px"
                h="36px"
                borderRadius="10px"
                bg={isActive ? 'rgba(34, 211, 238, 0.12)' : iconBgInactive}
                color={isActive ? 'brand.500' : iconColorInactive}
                transition="all 0.25s"
                flexShrink={0}
            >
                <OptionIcon w={5} h={5} />
            </Flex>

            {/* Label + Description */}
            <Box flex="1" textAlign="left">
                <Text
                    fontSize="sm"
                    fontWeight={isActive ? '600' : '500'}
                    color={isActive ? 'brand.500' : textColor}
                    lineHeight="1.3"
                    transition="color 0.2s"
                >
                    {option.label}
                </Text>
                <Text fontSize="xs" color={descColor} lineHeight="1.3" mt="1px">
                    {option.description}
                    {option.key === 'auto' && isActive && (
                        <Text as="span" color="brand.500" fontWeight="500">
                            {' '}· Currently: {resolvedColorMode === 'dark' ? 'Dark' : 'Light'}
                        </Text>
                    )}
                </Text>
            </Box>

            {/* Color preview swatch */}
            <Box
                w="20px"
                h="20px"
                borderRadius="6px"
                border="1.5px solid"
                borderColor={swatchBorder}
                overflow="hidden"
                flexShrink={0}
                bg={option.preview.bg}
                background={option.key === 'auto' ? option.preview.bg : undefined}
                transition="all 0.2s"
            />

            {/* Active check */}
            <AnimatePresence>
                {isActive && (
                    <MotionBox
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                        <CheckIcon w={4} h={4} color="brand.500" />
                    </MotionBox>
                )}
            </AnimatePresence>
        </MotionBox>
    );
};

/* ─── Main ThemeSwitcher Component ─── */
const ThemeSwitcher = ({ size = 'md', ...rest }) => {
    const { themePreference, resolvedColorMode, setThemePreference } = useThemePreference();

    /* Icon shown in the header button */
    const ActiveIcon = useMemo(() => {
        if (themePreference === 'auto') return MonitorIcon;
        return resolvedColorMode === 'dark' ? MoonIcon : SunIcon;
    }, [themePreference, resolvedColorMode]);

    /* Semantic colors — all hooks at the top */
    const menuBg = useColorModeValue('white', 'var(--color-bg-secondary)');
    const menuBorderColor = useColorModeValue('gray.200', 'var(--color-border)');
    const menuShadow = useColorModeValue(
        '0 8px 30px rgba(0,0,0,0.12)',
        '0 8px 30px rgba(0,0,0,0.5)',
    );
    const headerBg = useColorModeValue(
        'linear-gradient(180deg, rgba(34, 211, 238, 0.06) 0%, transparent 100%)',
        'linear-gradient(180deg, rgba(34, 211, 238, 0.05) 0%, transparent 100%)',
    );
    const dividerColor = useColorModeValue('gray.200', 'gray.700');
    const btnColor = useColorModeValue('gray.600', 'gray.300');
    const btnHoverBg = useColorModeValue('gray.100', 'rgba(34, 211, 238, 0.08)');
    const btnActiveBg = useColorModeValue('gray.200', 'rgba(34, 211, 238, 0.12)');
    const headerLabelColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Menu placement="bottom-end" isLazy {...rest}>
            <Tooltip label="Theme" aria-label="Switch theme" hasArrow placement="bottom" openDelay={300}>
                <MenuButton
                    as={IconButton}
                    aria-label="Switch theme"
                    variant="ghost"
                    size={size}
                    color={btnColor}
                    _hover={{
                        color: 'brand.500',
                        bg: btnHoverBg,
                    }}
                    _active={{
                        bg: btnActiveBg,
                    }}
                    transition="all 0.25s"
                    icon={
                        <Box
                            as={motion.div}
                            key={themePreference}
                            initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <ActiveIcon w={5} h={5} />
                        </Box>
                    }
                />
            </Tooltip>

            <MenuList
                bg={menuBg}
                borderColor={menuBorderColor}
                boxShadow={menuShadow}
                borderRadius="14px"
                py={0}
                minW="280px"
                overflow="hidden"
                border="1px solid"
            >
                {/* Dropdown Header */}
                <Box
                    px={4}
                    py={3}
                    borderBottom="1px solid"
                    borderColor={dividerColor}
                    background={headerBg}
                >
                    <Text
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                        color={headerLabelColor}
                    >
                        Appearance
                    </Text>
                </Box>

                {/* Options */}
                <Box py={1}>
                    {THEME_OPTIONS.map((opt) => (
                        <ThemeOption
                            key={opt.key}
                            option={opt}
                            isActive={themePreference === opt.key}
                            resolvedColorMode={resolvedColorMode}
                            onClick={() => setThemePreference(opt.key)}
                        />
                    ))}
                </Box>
            </MenuList>
        </Menu>
    );
};

export default ThemeSwitcher;
