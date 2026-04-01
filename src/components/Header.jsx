import {
    Box,
    Container,
    Flex,
    HStack,
    Button,
    Link,
    IconButton,
    Icon,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    VStack,
    useDisclosure,
    useColorModeValue,
    Image,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Text,
    Tooltip,
} from '@chakra-ui/react';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Logo from '../assets/logo_algoarena.png';
import AccessibilityDrawer from '../accessibility/components/AccessibilityDrawer';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

/* ─── Rank colour palette ─────────────────────────────────────────── */
const RANK_META = {
    BRONZE: { emoji: '', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' },
    SILVER: { emoji: '', color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.25)' },
    GOLD: { emoji: '', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
    PLATINUM: { emoji: '', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
    DIAMOND: { emoji: '', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
};

const fmtXp = (xp) => {
    if (xp === null || xp === undefined) return null;
    return xp >= 1000 ? `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(xp);
};

/** Compact rank + XP badge displayed in the navbar */
const RankBadge = ({ rank, xp }) => {
    const key = String(rank || '').toUpperCase();
    const meta = RANK_META[key];
    if (!meta) return null;
    const xpStr = fmtXp(xp);
    return (
        <Tooltip
            label={`${key} · ${xp ?? 0} XP`}
            placement="bottom"
            hasArrow
            bg="#1e293b"
            color="gray.200"
            fontSize="xs"
            borderRadius="8px"
            px={3}
            py={1.5}
        >
            <HStack
                spacing={1.5}
                px={2.5}
                py={1}
                borderRadius="8px"
                border="1px solid"
                borderColor={meta.border}
                bg={meta.bg}
                cursor="default"
                transition="all 0.2s"
                _hover={{ boxShadow: `0 0 12px ${meta.color}30` }}
                flexShrink={0}
                display={{ base: 'none', md: 'flex' }}
            >
                <Text fontSize="13px" lineHeight={1}>{meta.emoji}</Text>
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    fontFamily="mono"
                    color={meta.color}
                    letterSpacing="0.04em"
                >
                    {key}
                </Text>
                {xpStr !== null && (
                    <>
                        <Box w="1px" h="10px" bg={meta.border} />
                        <Text fontSize="10px" fontFamily="mono" color={meta.color} opacity={0.85}>
                            {xpStr} XP
                        </Text>
                    </>
                )}
            </HStack>
        </Tooltip>
    );
};



/* Inline accessibility icon (universal figure) */
const AccessibilityIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" />
        <path d="M5 8l7 1 7-1" />
        <path d="M12 9v5" />
        <path d="M9 21l3-7 3 7" />
    </Icon>
);

/* Inline icons for profile menu */
const UserIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </Icon>
);

const SettingsIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Icon>
);

const LogoutIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
);

const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Battles', to: '/battles' },
    { label: 'Challenges', to: '/challenges' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Community', to: '/#community' },
    { label: 'Dashboard', to: '/admin' },
];

const Header = () => {
    const [headerSpotlight, setHeaderSpotlight] = useState({ left: 0 });
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isA11yOpen,
        onOpen: onA11yOpen,
        onClose: onA11yClose,
    } = useDisclosure();
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, isLoggedIn, logout } = useAuth();

    // Filter out Dashboard for Player role or when not authenticated
    const filteredNavItems = navItems.filter(
        item => !(item.label === 'Dashboard' && (!isLoggedIn || currentUser?.role === 'Player'))
    );

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        setHeaderSpotlight({ left: x - 150 });
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path) && !path.startsWith('/#');
    };

    /* Color-mode-aware tokens */
    const headerBg = useColorModeValue('rgba(255, 255, 255, 0.92)', 'rgba(17, 24, 39, 0.9)');
    const headerBorder = useColorModeValue('gray.200', 'gray.800');
    const spotlightGradient = useColorModeValue(
        'linear(to-r, transparent, rgba(34, 211, 238, 0.04), transparent)',
        'linear(to-r, transparent, rgba(34, 211, 238, 0.05), transparent)',
    );
    const navLinkColor = useColorModeValue('gray.600', 'gray.300');
    const drawerBg = useColorModeValue('white', '#0f172a');
    const drawerBorder = useColorModeValue('gray.200', 'gray.800');
    const mobileCtaBorder = useColorModeValue('gray.200', 'gray.800');

    return (
        <Box
            as="header"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={50}
            backdropFilter="blur(16px)"
            bg={headerBg}
            borderBottom="1px solid"
            borderColor={headerBorder}
            onMouseMove={handleMouseMove}
            transition="background-color 0.3s ease"
        >
            {/* Header Spotlight Effect */}
            <Box
                position="absolute"
                top={0}
                left={`${headerSpotlight.left}px`}
                width="300px"
                height="100%"
                bgGradient={spotlightGradient}
                pointerEvents="none"
                transition="left 0.1s ease-out"
            />

            <Container maxW="7xl" position="relative" zIndex={10}>
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    {/* Logo */}
                    <Box display="flex" alignItems="center">
                        <Image src={Logo} alt="AlgoArena Logo" h="60px" objectFit="contain" />
                    </Box>

                    {/* Desktop Navigation */}
                    <HStack
                        as="nav"
                        spacing={8}
                        display={{ base: 'none', md: 'flex' }}
                    >
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.to}
                                as={NavLink}
                                to={item.to}
                                color={isActive(item.to) ? 'brand.500' : navLinkColor}
                                fontWeight={isActive(item.to) ? 'semibold' : 'normal'}
                                _hover={{ color: 'brand.500' }}
                                transition="all 0.3s"
                                position="relative"
                                _after={isActive(item.to) ? {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: '0',
                                    right: '0',
                                    height: '2px',
                                    bg: 'brand.500',
                                    borderRadius: 'full',
                                } : {}}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </HStack>

                    {/* CTA Buttons / Profile Avatar – conditional */}
                    <HStack spacing={3}>

                        {/* Theme Switcher */}
                        <ThemeSwitcher size="md" />

                        {!isLoggedIn ? (
                            /* ─── Logged OUT: show Login + Create Account ─── */
                            <>
                                <Button
                                    as={RouterLink}
                                    to="/signin"
                                    display={{ base: 'none', sm: 'inline-flex' }}
                                    variant="ghost"
                                    size="md"
                                >
                                    Login
                                </Button>
                                <Button
                                    as={RouterLink}
                                    to="/signup"
                                    variant="primary"
                                    size="md"
                                    boxShadow="custom"
                                    display={{ base: 'none', sm: 'inline-flex' }}
                                >
                                    Create Account
                                </Button>
                            </>
                        ) : (
                            /* ─── Logged IN: show rank badge + username + avatar dropdown ─── */
                            <HStack spacing={2} display={{ base: 'none', sm: 'flex' }}>
                                {/* Rank + XP badge */}
                                <RankBadge
                                    rank={currentUser?.rank}
                                    xp={currentUser?.xp}
                                />

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="var(--color-text-primary)"
                                    display={{ base: 'none', md: 'block' }}
                                >
                                    {currentUser?.username}
                                </Text>

                                <Menu placement="bottom-end" isLazy>
                                    <MenuButton
                                        as={IconButton}
                                        aria-label="User menu"
                                        variant="unstyled"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        minW="auto"
                                        _focus={{ boxShadow: 'none' }}
                                    >
                                        <Avatar
                                            size="sm"
                                            name={currentUser?.username}
                                            src={currentUser?.avatar}
                                            border="2px solid"
                                            borderColor="var(--color-border)"
                                            cursor="pointer"
                                            _hover={{ borderColor: '#22d3ee', boxShadow: '0 0 12px rgba(34, 211, 238, 0.3)' }}
                                            transition="all 0.2s"
                                        />
                                    </MenuButton>
                                    <MenuList
                                        bg="var(--color-bg-secondary)"
                                        borderColor="var(--color-border)"
                                        boxShadow="var(--shadow-card)"
                                        borderRadius="12px"
                                        py={2}
                                        minW="220px"
                                    >
                                        {/* User info header */}
                                        <Box px={4} py={3} mb={1} borderBottom="1px solid" borderColor="var(--color-border)">
                                            <Text fontSize="sm" fontWeight="bold" color="var(--color-text-primary)" mb={0.5}>
                                                {currentUser?.username}
                                            </Text>
                                            {currentUser?.rank && (
                                                <HStack spacing={2} mt={1}>
                                                    <Text
                                                        fontSize="xs"
                                                        fontWeight="semibold"
                                                        fontFamily="mono"
                                                        color={RANK_META[currentUser.rank?.toUpperCase()]?.color || 'var(--color-text-muted)'}
                                                    >
                                                        {RANK_META[currentUser.rank?.toUpperCase()]?.emoji} {currentUser.rank?.toUpperCase()}
                                                    </Text>
                                                    <Box w="1px" h="10px" bg="var(--color-border)" />
                                                    <Text fontSize="xs" fontFamily="mono" color="yellow.400">
                                                        {fmtXp(currentUser?.xp) ?? '0'} XP
                                                    </Text>
                                                </HStack>
                                            )}
                                        </Box>

                                        <MenuItem
                                            bg="transparent"
                                            color="var(--color-text-primary)"
                                            _hover={{ bg: 'rgba(34, 211, 238, 0.08)', color: '#22d3ee' }}
                                            icon={<UserIcon w={4} h={4} />}
                                            fontSize="sm"
                                            borderRadius="8px"
                                            mx={2}
                                            onClick={() => navigate('/profile')}
                                        >
                                            View Profile
                                        </MenuItem>
                                        {/* <MenuItem
                                            bg="transparent"
                                            color="var(--color-text-primary)"
                                            _hover={{ bg: 'rgba(34, 211, 238, 0.08)', color: '#22d3ee' }}
                                            icon={<SettingsIcon w={4} h={4} />}
                                            fontSize="sm"
                                            borderRadius="8px"
                                            mx={2}
                                            onClick={() => navigate('/profile')}
                                        >
                                            Account Settings
                                        </MenuItem> */}
                                        <MenuDivider borderColor="var(--color-border)" mx={2} />
                                        <MenuItem
                                            bg="transparent"
                                            color="#ef4444"
                                            _hover={{ bg: 'rgba(239, 68, 68, 0.08)' }}
                                            icon={<LogoutIcon w={4} h={4} />}
                                            fontSize="sm"
                                            borderRadius="8px"
                                            mx={2}
                                            onClick={() => {
                                                logout();
                                                navigate('/');
                                            }}
                                        >
                                            Logout
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </HStack>
                        )}

                        {/* Mobile: show avatar if logged in */}
                        {isLoggedIn && (
                            <Avatar
                                size="sm"
                                name={currentUser?.username}
                                src={currentUser?.avatar}
                                display={{ base: 'flex', sm: 'none' }}
                                border="2px solid"
                                borderColor="var(--color-border)"
                                cursor="pointer"
                                onClick={() => { navigate('/profile'); onClose(); }}
                                _hover={{ borderColor: '#22d3ee' }}
                                transition="all 0.2s"
                            />
                        )}

                        {/* Hamburger – mobile only */}
                        <IconButton
                            aria-label="Open menu"
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            color="var(--color-text-secondary)"
                            fontSize="24px"
                            display={{ base: 'flex', md: 'none' }}
                            onClick={onOpen}
                            _hover={{ color: 'brand.500' }}
                        />
                    </HStack>
                </Flex>
            </Container>

            {/* Mobile Nav Drawer */}
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
                <DrawerOverlay bg="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
                <DrawerContent bg={drawerBg} borderLeft="1px solid" borderColor={drawerBorder}>
                    <DrawerCloseButton color="var(--color-text-muted)" _hover={{ color: 'brand.500' }} mt={2} />
                    <DrawerBody pt={16}>
                        <VStack spacing={6} align="stretch">
                            {filteredNavItems.map((item) => (
                                <Link
                                    key={item.to}
                                    as={NavLink}
                                    to={item.to}
                                    color={isActive(item.to) ? 'brand.500' : navLinkColor}
                                    fontWeight={isActive(item.to) ? 'bold' : 'medium'}
                                    fontSize="lg"
                                    fontFamily="heading"
                                    _hover={{ color: 'brand.500' }}
                                    onClick={onClose}
                                    borderLeft={isActive(item.to) ? '3px solid' : '3px solid transparent'}
                                    borderColor={isActive(item.to) ? 'brand.500' : 'transparent'}
                                    pl={4}
                                    transition="all 0.3s"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* Profile link in mobile drawer (logged in only) */}
                            {isLoggedIn && (
                                <Link
                                    as={NavLink}
                                    to="/profile"
                                    color={isActive('/profile') ? 'brand.500' : 'gray.300'}
                                    fontWeight={isActive('/profile') ? 'bold' : 'medium'}
                                    fontSize="lg"
                                    fontFamily="heading"
                                    _hover={{ color: 'brand.500' }}
                                    onClick={onClose}
                                    borderLeft={isActive('/profile') ? '3px solid' : '3px solid transparent'}
                                    borderColor={isActive('/profile') ? 'brand.500' : 'transparent'}
                                    pl={4}
                                    transition="all 0.3s"
                                    display="flex"
                                    alignItems="center"
                                    gap={3}
                                >
                                    <UserIcon w={5} h={5} />
                                    My Profile
                                </Link>
                            )}

                            {/* Accessibility link in mobile drawer */}
                            <Box
                                as="button"
                                display="flex"
                                alignItems="center"
                                gap={3}
                                color="var(--color-text-muted)"
                                fontSize="lg"
                                fontFamily="heading"
                                fontWeight="medium"
                                pl={4}
                                _hover={{ color: 'brand.500' }}
                                onClick={() => { onClose(); onA11yOpen(); }}
                                borderLeft="3px solid transparent"
                                transition="all 0.3s"
                                textAlign="left"
                            >
                                <AccessibilityIcon w={5} h={5} />
                                Accessibility
                            </Box>

                            {/* Mobile CTA – conditional */}
                            <Box pt={4} borderTop="1px solid" borderColor={mobileCtaBorder}>
                                <VStack spacing={3}>
                                    {!isLoggedIn ? (
                                        <>
                                            <Button
                                                as={RouterLink}
                                                to="/signin"
                                                variant="ghost"
                                                size="md"
                                                w="full"
                                                onClick={onClose}
                                            >
                                                Login
                                            </Button>
                                            <Button
                                                as={RouterLink}
                                                to="/signup"
                                                variant="primary"
                                                size="md"
                                                w="full"
                                                onClick={onClose}
                                            >
                                                Create Account
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            w="full"
                                            color="#ef4444"
                                            borderColor="rgba(239, 68, 68, 0.3)"
                                            border="1px solid"
                                            _hover={{ bg: 'rgba(239, 68, 68, 0.08)' }}
                                            leftIcon={<LogoutIcon w={4} h={4} />}
                                            onClick={() => {
                                                logout();
                                                onClose();
                                                navigate('/');
                                            }}
                                        >
                                            Logout
                                        </Button>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Accessibility Settings Drawer */}
            <AccessibilityDrawer isOpen={isA11yOpen} onClose={onA11yClose} />


        </Box>
    );
};

export default Header;
