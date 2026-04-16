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
    Badge,
    Divider,
} from '@chakra-ui/react';
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HamburgerIcon } from '@chakra-ui/icons';
import { MessageCircle, LifeBuoy } from 'lucide-react';
import Logo from '../assets/logo_algoarena.png';
import AccessibilityDrawer from '../accessibility/components/AccessibilityDrawer';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useChat } from '../features/chat/ChatProvider';
import { useSupport } from '../features/support/SupportProvider';

/* ─── Rank colour palette ─────────────────────────────────────────── */
const RANK_META = {
    BRONZE: { color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' },
    SILVER: { color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.25)' },
    GOLD: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
    PLATINUM: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
    DIAMOND: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
    RUBY: { color: '#E0115F', bg: 'rgba(224,17,95,0.12)', border: 'rgba(224,17,95,0.3)' },
    EMERALD: { color: '#50C878', bg: 'rgba(80,200,120,0.12)', border: 'rgba(80,200,120,0.3)' },
    SAPPHIRE: { color: '#0F52BA', bg: 'rgba(15,82,186,0.12)', border: 'rgba(15,82,186,0.3)' },
    OBSIDIAN: { color: '#3D3635', bg: 'rgba(61,54,53,0.18)', border: 'rgba(61,54,53,0.35)' },
    'ALGOARENA CHAMPION': { color: '#D4AF37', bg: 'rgba(212,175,55,0.18)', border: 'rgba(212,175,55,0.35)' },
};

const rankI18nKey = (rank) => String(rank || '').toUpperCase().replace(/\s+/g, '_');

const fmtXp = (xp) => {
    if (xp === null || xp === undefined) return null;
    return xp >= 1000 ? `${(xp / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(xp);
};

/** Compact rank + XP badge displayed in the navbar */
const RankBadge = ({ rank, xp, rankDetails, nextRank, progressPercent }) => {
    const { t } = useTranslation();
    const key = String(rank || "").toUpperCase();
    const meta = RANK_META[key];
    if (!meta) return null;

    const rk = rankI18nKey(key);
    const title = rankDetails?.title || t(`rankTitles.${rk}`);
    const nextXp = nextRank?.xpRequired ?? null;
    const xpPart = nextXp ? `${xp ?? 0} / ${nextXp}` : `${xp ?? 0}`;
    const nextPart = nextRank
        ? t('header.rankTooltipNext', { name: nextRank.name, title: nextRank.title })
        : t('header.rankTooltipNextMax');
    const tooltipLabel = t('header.rankTooltip', {
        rank: key,
        title,
        xpPart,
        progress: Number(progressPercent || 0),
        nextPart,
    });

    return (
        <Tooltip
            label={tooltipLabel}
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
            >
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    fontFamily="mono"
                    color={meta.color}
                    letterSpacing="0.04em"
                >
                    {key}
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={meta.color}>
                    {title}
                </Text>
                {xp !== null && xp !== undefined && (
                    <>
                        <Box w="1px" h="10px" bg={meta.border} display={{ base: "none", lg: "block" }} />
                        <Text fontSize="10px" fontFamily="mono" color={meta.color} opacity={0.85} display={{ base: "none", lg: "block" }}>
                            {nextXp ? t('header.xpSlash', { current: fmtXp(xp), next: fmtXp(nextXp) }) : t('header.xpOnly', { xp: fmtXp(xp) })}
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

const LogoutIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
);

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
    const { t } = useTranslation();
    const { currentUser, isLoggedIn, logout } = useAuth();
    const { toggleChat, unreadCount, isChatOpen } = useChat();
    const { openHub } = useSupport();

    /* Primary navigation — the main pages users visit */
    const primaryNav = useMemo(
        () => [
            { label: t('navigation.home'), to: '/' },
            { label: t('navigation.challenges'), to: '/challenges' },
            { label: t('navigation.battles'), to: '/battles' },
            { label: t('navigation.leaderboard'), to: '/leaderboard' },
        ],
        [t],
    );

    /* Secondary navigation — contextual */
    const secondaryNav = useMemo(
        () => {
            const items = [{ label: t('navigation.community'), to: '/community' }];
            if (isLoggedIn && currentUser?.role !== 'Player') {
                items.push({ label: t('navigation.dashboard'), to: '/admin' });
            }
            return items;
        },
        [t, isLoggedIn, currentUser?.role],
    );

    const allNavItems = useMemo(() => [...primaryNav, ...secondaryNav], [primaryNav, secondaryNav]);

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
    const headerBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(15, 23, 42, 0.92)');
    const headerBorder = useColorModeValue('gray.200', 'gray.800');
    const spotlightGradient = useColorModeValue(
        'linear(to-r, transparent, rgba(34, 211, 238, 0.04), transparent)',
        'linear(to-r, transparent, rgba(34, 211, 238, 0.05), transparent)',
    );
    const navLinkColor = useColorModeValue('gray.600', 'gray.400');
    const activeNavColor = useColorModeValue('cyan.600', 'cyan.300');
    const drawerBg = useColorModeValue('white', '#0f172a');
    const drawerBorder = useColorModeValue('gray.200', 'gray.800');
    const mobileCtaBorder = useColorModeValue('gray.200', 'gray.800');
    const separatorColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box
            as="header"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={50}
            backdropFilter="blur(20px)"
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
                    {/* ──── LEFT: Logo ──── */}
                    <Box display="flex" alignItems="center" flexShrink={0}>
                        <Image src={Logo} alt={t('header.logoAlt')} h="52px" objectFit="contain" />
                    </Box>

                    {/* ──── CENTER: Desktop Navigation ──── */}
                    <HStack
                        as="nav"
                        spacing={1}
                        display={{ base: 'none', lg: 'flex' }}
                        mx={6}
                        flex={1}
                        justifyContent="center"
                    >
                        {/* Primary Nav Items */}
                        {primaryNav.map((item) => (
                            <Link
                                key={item.to}
                                as={NavLink}
                                to={item.to}
                                color={isActive(item.to) ? activeNavColor : navLinkColor}
                                fontWeight={isActive(item.to) ? '600' : '500'}
                                fontSize="sm"
                                px={3}
                                py={1.5}
                                borderRadius="8px"
                                bg={isActive(item.to) ? useColorModeValue('rgba(34,211,238,0.08)', 'rgba(34,211,238,0.1)') : 'transparent'}
                                _hover={{
                                    color: activeNavColor,
                                    bg: useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)'),
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.2s ease"
                                position="relative"
                                _after={isActive(item.to) ? {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-2px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '2px',
                                    bg: 'brand.500',
                                    borderRadius: 'full',
                                } : {}}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Visual separator */}
                        {secondaryNav.length > 0 && (
                            <Box
                                w="1px"
                                h="20px"
                                bg={separatorColor}
                                mx={1}
                            />
                        )}

                        {/* Secondary Nav Items */}
                        {secondaryNav.map((item) => (
                            <Link
                                key={item.to}
                                as={NavLink}
                                to={item.to}
                                color={isActive(item.to) ? activeNavColor : navLinkColor}
                                fontWeight={isActive(item.to) ? '600' : '500'}
                                fontSize="sm"
                                px={3}
                                py={1.5}
                                borderRadius="8px"
                                bg={isActive(item.to) ? useColorModeValue('rgba(34,211,238,0.08)', 'rgba(34,211,238,0.1)') : 'transparent'}
                                _hover={{
                                    color: activeNavColor,
                                    bg: useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)'),
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.2s ease"
                                position="relative"
                                _after={isActive(item.to) ? {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-2px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '20px',
                                    height: '2px',
                                    bg: 'brand.500',
                                    borderRadius: 'full',
                                } : {}}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </HStack>

                    {/* ──── RIGHT: Utility Controls + Profile ──── */}
                    <HStack spacing={2} flexShrink={0}>

                        {/* Utility cluster: Language + Theme */}
                        <HStack
                            spacing={1}
                            display={{ base: 'none', md: 'flex' }}
                        >
                            <LanguageSwitcher size="sm" compact />
                            <ThemeSwitcher size="sm" />
                        </HStack>

                        {!isLoggedIn ? (
                            /* ─── Logged OUT: show Login + Create Account ─── */
                            <>
                                <Button
                                    as={RouterLink}
                                    to="/signin"
                                    display={{ base: 'none', sm: 'inline-flex' }}
                                    variant="ghost"
                                    size="sm"
                                    fontWeight="500"
                                >
                                    {t('header.login')}
                                </Button>
                                <Button
                                    as={RouterLink}
                                    to="/signup"
                                    variant="primary"
                                    size="sm"
                                    boxShadow="custom"
                                    display={{ base: 'none', sm: 'inline-flex' }}
                                >
                                    {t('header.createAccount')}
                                </Button>
                            </>
                        ) : (
                            /* ─── Logged IN: utility icons + rank + profile ─── */
                            <HStack spacing={1.5} display={{ base: 'none', sm: 'flex' }}>

                                {/* ── Action icons cluster ── */}
                                <HStack
                                    spacing={0.5}
                                    px={1}
                                    py={0.5}
                                    borderRadius="10px"
                                    bg={useColorModeValue('rgba(0,0,0,0.03)', 'rgba(255,255,255,0.04)')}
                                >
                                    <Tooltip label={t('support.title')} hasArrow placement="bottom">
                                        <IconButton
                                            aria-label={t('support.title')}
                                            variant="ghost"
                                            size="sm"
                                            icon={<LifeBuoy size={15} />}
                                            onClick={openHub}
                                            color="var(--color-text-secondary)"
                                            borderRadius="8px"
                                            minW="32px"
                                            h="32px"
                                            _hover={{ color: 'brand.400', bg: useColorModeValue('rgba(34,211,238,0.08)', 'rgba(34,211,238,0.12)') }}
                                        />
                                    </Tooltip>
                                    <Box position="relative">
                                        <Tooltip label={t('chat.title')} hasArrow placement="bottom">
                                            <IconButton
                                                aria-label={t('chat.title')}
                                                variant="ghost"
                                                size="sm"
                                                icon={<MessageCircle size={15} />}
                                                onClick={toggleChat}
                                                color={isChatOpen ? 'brand.400' : 'var(--color-text-secondary)'}
                                                borderRadius="8px"
                                                minW="32px"
                                                h="32px"
                                                _hover={{ color: 'brand.400', bg: useColorModeValue('rgba(34,211,238,0.08)', 'rgba(34,211,238,0.12)') }}
                                            />
                                        </Tooltip>
                                        {!isChatOpen && unreadCount > 0 && (
                                            <Badge
                                                colorScheme="cyan"
                                                position="absolute"
                                                top="-1"
                                                right="-1"
                                                borderRadius="full"
                                                px={1.5}
                                                fontSize="9px"
                                                minH="16px"
                                                display="flex"
                                                alignItems="center"
                                            >
                                                {unreadCount > 10 ? '10+' : unreadCount}
                                            </Badge>
                                        )}
                                    </Box>
                                </HStack>

                                {/* ── Rank badge ── */}
                                <RankBadge
                                    rank={currentUser?.rank}
                                    xp={currentUser?.xp}
                                    rankDetails={currentUser?.rankDetails}
                                    nextRank={currentUser?.nextRank}
                                    progressPercent={currentUser?.progressPercent}
                                />

                                {/* ── Profile avatar menu ── */}
                                <Menu placement="bottom-end" isLazy>
                                    <MenuButton
                                        as={Box}
                                        cursor="pointer"
                                        display="flex"
                                        alignItems="center"
                                        gap={2}
                                        pl={2}
                                        pr={1}
                                        py={1}
                                        borderRadius="10px"
                                        transition="all 0.2s"
                                        _hover={{ bg: useColorModeValue('rgba(0,0,0,0.04)', 'rgba(255,255,255,0.06)') }}
                                    >
                                        <HStack spacing={2}>
                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="var(--color-text-primary)"
                                                display={{ base: 'none', lg: 'block' }}
                                                maxW="120px"
                                                isTruncated
                                            >
                                                {currentUser?.username}
                                            </Text>
                                            <Avatar
                                                size="sm"
                                                name={currentUser?.username}
                                                src={currentUser?.avatar}
                                                border="2px solid"
                                                borderColor="var(--color-border)"
                                                _hover={{ borderColor: '#22d3ee', boxShadow: '0 0 12px rgba(34, 211, 238, 0.3)' }}
                                                transition="all 0.2s"
                                            />
                                        </HStack>
                                    </MenuButton>
                                    <MenuList
                                        bg="var(--color-bg-secondary)"
                                        borderColor="var(--color-border)"
                                        boxShadow="0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(148,163,184,0.08)"
                                        borderRadius="14px"
                                        py={2}
                                        minW="240px"
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
                                                        {currentUser.rank?.toUpperCase()}
                                                    </Text>
                                                    <Text fontSize="xs" color={RANK_META[currentUser.rank?.toUpperCase()]?.color || 'var(--color-text-muted)'}>
                                                        {currentUser?.rankDetails?.title || t(`rankTitles.${rankI18nKey(currentUser.rank)}`)}
                                                    </Text>
                                                    <Box w="1px" h="10px" bg="var(--color-border)" />
                                                    <Text fontSize="xs" fontFamily="mono" color="yellow.400">
                                                        {currentUser?.nextRank?.xpRequired
                                                            ? t('header.xpSlash', { current: fmtXp(currentUser?.xp) ?? '0', next: fmtXp(currentUser?.nextRank?.xpRequired) })
                                                            : t('header.xpOnly', { xp: fmtXp(currentUser?.xp) ?? '0' })}
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
                                            {t('header.viewProfile')}
                                        </MenuItem>
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
                                            {t('header.logout')}
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
                            aria-label={t('header.openMenu')}
                            icon={<HamburgerIcon />}
                            variant="ghost"
                            color="var(--color-text-secondary)"
                            fontSize="22px"
                            display={{ base: 'flex', lg: 'none' }}
                            onClick={onOpen}
                            _hover={{ color: 'brand.500', bg: useColorModeValue('rgba(34,211,238,0.08)', 'rgba(34,211,238,0.12)') }}
                            borderRadius="10px"
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
                        <VStack spacing={1} align="stretch">
                            {/* Mobile utility controls */}
                            <HStack spacing={2} px={4} pb={4} justify="center">
                                <LanguageSwitcher size="sm" compact />
                                <ThemeSwitcher size="sm" />
                            </HStack>

                            <Divider borderColor={mobileCtaBorder} mb={2} />

                            {/* Primary nav */}
                            <Text
                                fontSize="11px"
                                fontWeight="bold"
                                textTransform="uppercase"
                                letterSpacing="0.08em"
                                color="var(--color-text-muted)"
                                px={4}
                                py={2}
                            >
                                {t('navigation.home')}
                            </Text>
                            {allNavItems.map((item) => (
                                <Link
                                    key={item.to}
                                    as={NavLink}
                                    to={item.to}
                                    color={isActive(item.to) ? activeNavColor : navLinkColor}
                                    fontWeight={isActive(item.to) ? 'bold' : 'medium'}
                                    fontSize="md"
                                    fontFamily="heading"
                                    _hover={{ color: 'brand.500', bg: useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)') }}
                                    onClick={onClose}
                                    borderLeft={isActive(item.to) ? '3px solid' : '3px solid transparent'}
                                    borderColor={isActive(item.to) ? 'brand.500' : 'transparent'}
                                    bg={isActive(item.to) ? useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)') : 'transparent'}
                                    pl={4}
                                    py={2.5}
                                    borderRadius="0 8px 8px 0"
                                    transition="all 0.2s"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            {/* Profile link in mobile drawer (logged in only) */}
                            {isLoggedIn && (
                                <>
                                    <Divider borderColor={mobileCtaBorder} my={2} />
                                    <Link
                                        as={NavLink}
                                        to="/profile"
                                        color={isActive('/profile') ? activeNavColor : navLinkColor}
                                        fontWeight={isActive('/profile') ? 'bold' : 'medium'}
                                        fontSize="md"
                                        fontFamily="heading"
                                        _hover={{ color: 'brand.500' }}
                                        onClick={onClose}
                                        borderLeft={isActive('/profile') ? '3px solid' : '3px solid transparent'}
                                        borderColor={isActive('/profile') ? 'brand.500' : 'transparent'}
                                        bg={isActive('/profile') ? useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)') : 'transparent'}
                                        pl={4}
                                        py={2.5}
                                        borderRadius="0 8px 8px 0"
                                        transition="all 0.2s"
                                        display="flex"
                                        alignItems="center"
                                        gap={3}
                                    >
                                        <UserIcon w={5} h={5} />
                                        {t('header.myProfile')}
                                    </Link>
                                </>
                            )}

                            {/* Accessibility link in mobile drawer */}
                            <Box
                                as="button"
                                display="flex"
                                alignItems="center"
                                gap={3}
                                color="var(--color-text-muted)"
                                fontSize="md"
                                fontFamily="heading"
                                fontWeight="medium"
                                pl={4}
                                py={2.5}
                                _hover={{ color: 'brand.500', bg: useColorModeValue('rgba(34,211,238,0.06)', 'rgba(34,211,238,0.08)') }}
                                onClick={() => { onClose(); onA11yOpen(); }}
                                borderLeft="3px solid transparent"
                                borderRadius="0 8px 8px 0"
                                transition="all 0.2s"
                                textAlign="left"
                                w="full"
                            >
                                <AccessibilityIcon w={5} h={5} />
                                {t('header.accessibility')}
                            </Box>

                            {/* Mobile CTA – conditional */}
                            <Box pt={4} borderTop="1px solid" borderColor={mobileCtaBorder} mt={2}>
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
                                                {t('header.login')}
                                            </Button>
                                            <Button
                                                as={RouterLink}
                                                to="/signup"
                                                variant="primary"
                                                size="md"
                                                w="full"
                                                onClick={onClose}
                                            >
                                                {t('header.createAccount')}
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
                                            {t('header.logout')}
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
