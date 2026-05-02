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
import { lazy, Suspense, useState, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HamburgerIcon } from '@chakra-ui/icons';
import { MessageCircle, LifeBuoy } from 'lucide-react';
import Logo from '../assets/logo_algoarena.png';
import { useAuth } from '../pages/Frontoffice/auth/context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useChat } from '../features/chat/ChatProvider';
import { useSupport } from '../features/support/SupportProvider';
import { prefetchRoute } from '../routes/prefetchRoutes';
import { startNavigationProgress } from '../shared/navigation/progress';

const AccessibilityDrawer = lazy(() => import('../accessibility/components/AccessibilityDrawer'));
const WalletModal = lazy(() => import('./WalletModal'));

/* ─── Rank colour palette ─────────────────────────────────────────── */
/* ─── Rank colour palette ─────────────────────────────────────────── */
const RANK_META = {
    BRONZE: { 
        color: '#92400E', 
        darkColor: '#F59E0B',
        bg: 'rgba(146,64,14,0.1)', 
        darkBg: 'rgba(245,158,11,0.12)',
        border: 'rgba(146,64,14,0.2)', 
        darkBorder: 'rgba(245,158,11,0.3)',
        glow: 'rgba(146,64,14,0.15)' 
    },
    SILVER: { 
        color: '#475569', 
        darkColor: '#CBD5E1',
        bg: 'rgba(71,85,105,0.08)', 
        darkBg: 'rgba(203,213,225,0.1)',
        border: 'rgba(71,85,105,0.25)', 
        darkBorder: 'rgba(203,213,225,0.3)',
        glow: 'rgba(148,163,184,0.2)' 
    },
    GOLD: { 
        color: '#854D0E', 
        darkColor: '#FACC15',
        bg: 'rgba(133,77,14,0.08)', 
        darkBg: 'rgba(250,204,21,0.1)',
        border: 'rgba(133,77,14,0.25)', 
        darkBorder: 'rgba(250,204,21,0.3)',
        glow: 'rgba(250,204,21,0.25)' 
    },
    PLATINUM: { 
        color: '#0891B2', 
        darkColor: '#22D3EE',
        bg: 'rgba(8,145,178,0.08)', 
        darkBg: 'rgba(34,211,238,0.1)',
        border: 'rgba(8,145,178,0.25)', 
        darkBorder: 'rgba(34,211,238,0.3)',
        glow: 'rgba(34,211,238,0.3)' 
    },
    DIAMOND: { 
        color: '#7E22CE', 
        darkColor: '#A855F7',
        bg: 'rgba(126,34,206,0.08)', 
        darkBg: 'rgba(168,85,247,0.12)',
        border: 'rgba(126,34,206,0.25)', 
        darkBorder: 'rgba(168,85,247,0.3)',
        glow: 'rgba(168,85,247,0.3)' 
    },
    RUBY: { 
        color: '#BE123C', 
        darkColor: '#FB7185',
        bg: 'rgba(190,18,60,0.08)', 
        darkBg: 'rgba(251,113,133,0.12)',
        border: 'rgba(190,18,60,0.25)', 
        darkBorder: 'rgba(251,113,133,0.3)',
        glow: 'rgba(225,29,72,0.3)' 
    },
    EMERALD: { 
        color: '#059669', 
        darkColor: '#34D399',
        bg: 'rgba(5,150,105,0.08)', 
        darkBg: 'rgba(52,211,153,0.12)',
        border: 'rgba(5,150,105,0.25)', 
        darkBorder: 'rgba(52,211,153,0.3)',
        glow: 'rgba(16,185,129,0.3)' 
    },
    SAPPHIRE: { 
        color: '#1D4ED8', 
        darkColor: '#60A5FA',
        bg: 'rgba(29,78,216,0.08)', 
        darkBg: 'rgba(96,165,250,0.12)',
        border: 'rgba(29,78,216,0.25)', 
        darkBorder: 'rgba(96,165,250,0.3)',
        glow: 'rgba(59,130,246,0.3)' 
    },
    OBSIDIAN: { 
        color: '#1E293B', 
        darkColor: '#94A3B8',
        bg: 'rgba(30,41,59,0.1)', 
        darkBg: 'rgba(148,163,184,0.18)',
        border: 'rgba(30,41,59,0.3)', 
        darkBorder: 'rgba(148,163,184,0.35)',
        glow: 'rgba(71,85,105,0.4)' 
    },
    'ALGOARENA CHAMPION': { 
        color: '#92400E', 
        darkColor: '#FBBF24',
        bg: 'rgba(146,64,14,0.1)', 
        darkBg: 'rgba(251,191,36,0.18)',
        border: 'rgba(146,64,14,0.3)', 
        darkBorder: 'rgba(251,191,36,0.35)',
        glow: 'rgba(245,158,11,0.4)' 
    },
};

const rankI18nKey = (rank) => String(rank || '').toUpperCase().replace(/\s+/g, '_');

const fmtXp = (xp) => {
    if (xp === null || xp === undefined) return '0';
    return Number(xp) >= 1000 ? `${(Number(xp) / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(xp);
};

/** Compact rank + XP badge displayed in the navbar */
const RankBadge = ({ rank, xp, rankDetails, nextRank, progressPercent }) => {
    const { t } = useTranslation();
    const mode = useColorModeValue('light', 'dark');
    const key = String(rank || "").toUpperCase();
    const meta = RANK_META[key] || RANK_META.BRONZE;

    const rankColor = mode === 'light' ? meta.color : meta.darkColor;
    const rankBg = mode === 'light' ? meta.bg : meta.darkBg;
    const rankBorder = mode === 'light' ? meta.border : meta.darkBorder;

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
            bg={useColorModeValue('gray.800', 'slate.900')}
            color="white"
            fontSize="xs"
            borderRadius="8px"
            px={3}
            py={1.5}
            zIndex={100}
        >
            <Box
                display="flex"
                alignItems="center"
                h="36px"
                bg={useColorModeValue('white', 'rgba(15, 23, 42, 0.6)')}
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor={rankBorder}
                borderRadius="12px"
                pl={1}
                pr={3}
                cursor="default"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow={mode === 'light' ? 'sm' : `0 0 15px ${meta.glow}`}
                _hover={{ 
                    transform: 'translateY(-1px)',
                    boxShadow: `0 8px 20px ${meta.glow}, var(--shadow-md)`,
                    borderColor: rankColor
                }}
            >
                <HStack spacing={2.5}>
                    <Box 
                        bg={rankColor}
                        color={mode === 'light' ? 'white' : 'gray.900'}
                        px={2.5}
                        h="28px"
                        borderRadius="9px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="lg"
                    >
                        <Text
                            fontSize="10px"
                            fontWeight="900"
                            fontFamily="heading"
                            letterSpacing="0.05em"
                            textTransform="uppercase"
                        >
                            {key}
                        </Text>
                    </Box>

                    <VStack spacing={0} align="flex-start" justify="center">
                        <Text 
                            fontSize="11px" 
                            fontWeight="800" 
                            lineHeight="1"
                            color={useColorModeValue('gray.800', 'white')}
                            letterSpacing="0.02em"
                            textTransform="capitalize"
                        >
                            {title}
                        </Text>
                        <Text 
                            fontSize="9px" 
                            fontWeight="bold" 
                            fontFamily="mono"
                            color={rankColor}
                            opacity={0.9}
                            lineHeight="1.5"
                        >
                            {nextXp ? (
                                <Text as="span">
                                    {fmtXp(xp)} / {fmtXp(nextXp)} XP
                                </Text>
                            ) : `${fmtXp(xp)} XP`}
                        </Text>
                    </VStack>
                </HStack>
            </Box>
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

const WalletIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 7h14a4 4 0 0 1 4 4v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        <path d="M17 11h4" />
        <circle cx="17" cy="15" r="1" />
    </Icon>
);

const Header = () => {
    const [headerSpotlight, setHeaderSpotlight] = useState({ left: 0 });
    const spotlightRafRef = useRef(0);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isWalletOpen, onOpen: onWalletOpen, onClose: onWalletClose } = useDisclosure();
    const {
        isOpen: isA11yOpen,
        onOpen: onA11yOpen,
        onClose: onA11yClose,
    } = useDisclosure();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentUser, isLoggedIn, logout, coinBalance } = useAuth();
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
        // rAF-throttle the spotlight update to avoid forced reflow warnings.
        // Previously every mousemove synchronously read getBoundingClientRect
        // and triggered a state change + re-layout in the same frame, which
        // Lighthouse flagged as a ~429ms reflow hotspot.
        if (spotlightRafRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.clientX;
        spotlightRafRef.current = requestAnimationFrame(() => {
            spotlightRafRef.current = 0;
            setHeaderSpotlight({ left: clientX - rect.left - 150 });
        });
    };

    const warmRoute = useCallback((path) => {
        prefetchRoute(path);
    }, []);

    const handleNavStart = useCallback((path) => {
        warmRoute(path);
        if (path !== location.pathname) {
            startNavigationProgress();
        }
    }, [location.pathname, warmRoute]);

    const handleDrawerNav = useCallback((path) => {
        handleNavStart(path);
        onClose();
    }, [handleNavStart, onClose]);

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
                        <Image src={Logo} alt={t('header.logoAlt')} h="52px" width="65px" height="52px" objectFit="contain" loading="eager" decoding="async" fetchPriority="high" />
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
                                onMouseEnter={() => warmRoute(item.to)}
                                onFocus={() => warmRoute(item.to)}
                                onPointerDown={() => handleNavStart(item.to)}
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
                                onMouseEnter={() => warmRoute(item.to)}
                                onFocus={() => warmRoute(item.to)}
                                onPointerDown={() => handleNavStart(item.to)}
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
                                    onMouseEnter={() => warmRoute('/signin')}
                                    onFocus={() => warmRoute('/signin')}
                                    onPointerDown={() => handleNavStart('/signin')}
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
                                    onMouseEnter={() => warmRoute('/signup')}
                                    onFocus={() => warmRoute('/signup')}
                                    onPointerDown={() => handleNavStart('/signup')}
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

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<WalletIcon w={4} h={4} />}
                                    color="cyan.300"
                                    border="1px solid"
                                    borderColor="rgba(34, 211, 238, 0.22)"
                                    bg="rgba(34, 211, 238, 0.06)"
                                    _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                                    onClick={onWalletOpen}
                                >
                                    Wallet · {coinBalance} Arena Coins
                                </Button>

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
                                            onClick={() => {
                                                handleNavStart('/profile');
                                                navigate('/profile');
                                            }}
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
                                onMouseEnter={() => warmRoute('/profile')}
                                onFocus={() => warmRoute('/profile')}
                                onClick={() => { handleDrawerNav('/profile'); navigate('/profile'); }}
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
                                    onMouseEnter={() => warmRoute(item.to)}
                                    onFocus={() => warmRoute(item.to)}
                                    onClick={() => handleDrawerNav(item.to)}
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
                                    <Button
                                        variant="ghost"
                                        size="md"
                                        w="full"
                                        leftIcon={<WalletIcon w={4} h={4} />}
                                        color="cyan.300"
                                        border="1px solid"
                                        borderColor="rgba(34, 211, 238, 0.22)"
                                        bg="rgba(34, 211, 238, 0.06)"
                                        _hover={{ bg: 'rgba(34, 211, 238, 0.12)' }}
                                        onClick={() => {
                                            onWalletOpen();
                                            onClose();
                                        }}
                                    >
                                        Wallet · {coinBalance} Arena Coins
                                    </Button>
                                    <Link
                                        as={NavLink}
                                        to="/profile"
                                        color={isActive('/profile') ? activeNavColor : navLinkColor}
                                        fontWeight={isActive('/profile') ? 'bold' : 'medium'}
                                        fontSize="md"
                                        fontFamily="heading"
                                        _hover={{ color: 'brand.500' }}
                                        onMouseEnter={() => warmRoute('/profile')}
                                        onFocus={() => warmRoute('/profile')}
                                        onClick={() => handleDrawerNav('/profile')}
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
                                                onMouseEnter={() => warmRoute('/signin')}
                                                onFocus={() => warmRoute('/signin')}
                                                onClick={() => handleDrawerNav('/signin')}
                                            >
                                                {t('header.login')}
                                            </Button>
                                            <Button
                                                as={RouterLink}
                                                to="/signup"
                                                variant="primary"
                                                size="md"
                                                w="full"
                                                onMouseEnter={() => warmRoute('/signup')}
                                                onFocus={() => warmRoute('/signup')}
                                                onClick={() => handleDrawerNav('/signup')}
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
                                                handleDrawerNav('/');
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

            {isWalletOpen && (
                <Suspense fallback={null}>
                    <WalletModal
                        isOpen={isWalletOpen}
                        onClose={onWalletClose}
                        currentUser={currentUser}
                        coinBalance={coinBalance}
                    />
                </Suspense>
            )}

            {isA11yOpen && (
                <Suspense fallback={null}>
                    <AccessibilityDrawer isOpen={isA11yOpen} onClose={onA11yClose} />
                </Suspense>
            )}

        </Box>
    );
};

export default Header;
