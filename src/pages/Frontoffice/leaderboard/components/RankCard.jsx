/**
 * RankCard – versatile player card
 *
 * Two variants:
 *  • "stage"   → vertical card for top 2/3 positions (ArenaStage)
 *  • "compact" → horizontal row for ranks 4–10 (Elite Contenders)
 *
 * Current-user rows get a highlighted border + glow.
 */
import React from 'react';
import { Box, Flex, Text, Image, Grid, Badge, useColorModeValue } from '@chakra-ui/react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RankBadge from './RankBadge';
import EnergyBar from './EnergyBar';
import StreakIndicator from './StreakIndicator';
import TrendIndicator from './TrendIndicator';

const MotionBox = m.create(Box);
const MotionFlex = m.create(Flex);

/* ──────── colour maps for border accents per rank / tier ──────── */
const useRankColors = () => {
    const mode = useColorModeValue('light', 'dark');
    return {
        cyan: useColorModeValue('cyan.600', '#22d3ee'),
        emerald: useColorModeValue('emerald.600', '#10b981'),
        orange: useColorModeValue('orange.600', '#f97316'),
        gray: useColorModeValue('gray.600', 'gray.400'),
    };
};

const rankBorderColors = {
    2: { solid: '#71717a', glow: 'rgba(113, 113, 122, 0.4)' },
    3: { solid: '#CD853F', glow: 'rgba(205, 133, 63, 0.4)' },
};

const tierBorderColors = {
    PLATINUM: 'rgba(34, 211, 238, 0.5)',
    DIAMOND: 'rgba(59, 130, 246, 0.5)',
    GOLD: 'rgba(245, 158, 11, 0.5)',
    SILVER: 'rgba(113, 113, 122, 0.5)',
    BRONZE: 'rgba(139, 69, 19, 0.5)',
};

const rankNumberBg = {
    2: 'linear-gradient(135deg, #71717a 0%, #a1a1aa 100%)',
    3: 'linear-gradient(135deg, #CD853F 0%, #8B4513 100%)',
};

/* shadow depth for stage cards */
const useStageBoxShadow = () => {
    const isLight = useColorModeValue(true, false);
    return {
        2: isLight ? 'var(--shadow-custom)' : '0 8px 24px rgba(0,0,0,0.4), 0 0 40px rgba(34,211,238,0.15)',
        3: isLight ? 'var(--shadow-custom)' : '0 6px 18px rgba(0,0,0,0.35), 0 0 30px rgba(34,211,238,0.1)',
    };
};

/* ──────── STAGE variant (vertical card for #2 & #3) ──────── */
const StageCard = ({ player }) => {
    const { t } = useTranslation();
    const { cyan } = useRankColors();
    const stageBoxShadow = useStageBoxShadow();
    const rank = player.rankPosition;
    const colors = rankBorderColors[rank] || rankBorderColors[2];

    return (
        <MotionBox
            position="relative"
            borderRadius="12px"
            p={6}
            bg="var(--color-bg-secondary)"
            border="1px solid"
            borderColor="var(--color-border)"
            boxShadow={stageBoxShadow[rank]}
            cursor="pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: rank === 2 ? 0.1 : 0.2 }}
            whileHover={{
                y: -4,
                scale: 1.01,
                boxShadow: `0 0 30px ${useColorModeValue('rgba(34, 211, 238, 0.15)', 'rgba(34, 211, 238, 0.2)')}, var(--shadow-xl)`,
            }}
        >
            <Flex direction="column" align="center">
                {/* Rank number circle */}
                <Box
                    position="absolute"
                    top="-24px"
                    left="50%"
                    transform="translateX(-50%)"
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontFamily="heading"
                    fontWeight="black"
                    fontSize="3xl"
                    bg={rankNumberBg[rank]}
                    color="white"
                    boxShadow={`0 4px 12px ${useColorModeValue('rgba(15, 23, 42, 0.2)', colors.glow)}`}
                    zIndex={2}
                >
                    {rank}
                </Box>

                {/* Avatar */}
                <Box position="relative" mb={6} mt={8}>
                    <Box
                        w="96px"
                        h="96px"
                        borderRadius="full"
                        overflow="hidden"
                        border={`3px solid ${colors.solid}`}
                        boxShadow={useColorModeValue('sm', `0 0 30px ${colors.glow}`)}
                    >
                        <Image src={player.avatar} alt={player.username} w="full" h="full" objectFit="cover" />
                    </Box>
                </Box>

                {/* Username */}
                <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)" mb={2}>
                    {player.username}
                </Text>

                {/* Tier badge */}
                <Box mb={4}>
                    <RankBadge tier={player.tier} size="md" />
                </Box>

                {/* Power Level */}
                <Box textAlign="center" mb={4}>
                    <Text fontFamily="body" fontSize="xs" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        {t('leaderboardPage.powerLevel')}
                    </Text>
                    <MotionFlex
                        justify="center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Text
                            fontFamily="heading"
                            fontSize="3xl"
                            fontWeight="black"
                            color={cyan}
                            textShadow={useColorModeValue('none', "0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)")}
                        >
                            {player.xp.toLocaleString()}
                        </Text>
                    </MotionFlex>
                </Box>

                {/* Energy bar */}
                <Box w="full" mb={4}>
                    <EnergyBar percentage={player.winRate} tier={player.tier} height="8px" />
                </Box>

                {/* Stats */}
                <Grid templateColumns="1fr 1fr" gap={4} w="full">
                    <Box textAlign="center" p={3} borderRadius="12px" bg="var(--color-bg-elevated)" border="1px solid var(--color-border)">
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
                            {player.wins}
                        </Text>
                        <Text fontFamily="body" fontSize="xs" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider">
                            {t('leaderboardPage.victories')}
                        </Text>
                    </Box>
                    <Box textAlign="center" p={3} borderRadius="12px" bg="var(--color-bg-elevated)" border="1px solid var(--color-border)">
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-green-500)">
                            {player.winRate}%
                        </Text>
                        <Text fontFamily="body" fontSize="xs" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider">
                            {t('leaderboardPage.winRate')}
                        </Text>
                    </Box>
                </Grid>

                {/* Streak */}
                <Box mt={4}>
                    <StreakIndicator streak={player.streak} />
                </Box>
            </Flex>
        </MotionBox>
    );
};

/* ──────── COMPACT variant (horizontal row for ranks 4–10) ──────── */
const CompactCard = ({ player }) => {
    const { t } = useTranslation();
    const { cyan, emerald } = useRankColors();
    const mode = useColorModeValue('light', 'dark');
    const isUser = player.isCurrentUser;

    return (
        <MotionBox
            borderRadius="12px"
            p={5}
            bg={
                isUser
                    ? (mode === 'light' ? 'cyan.50' : 'linear-gradient(135deg, var(--color-info-bg) 0%, var(--color-bg-secondary) 100%)')
                    : 'var(--color-bg-secondary)'
            }
            border={isUser ? '2px solid' : '1px solid'}
            borderColor={isUser ? cyan : 'var(--color-border)'}
            boxShadow={
                isUser
                    ? (mode === 'light' ? 'var(--shadow-custom)' : '0 0 30px rgba(34, 211, 238, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)')
                    : 'var(--shadow-sm)'
            }
            cursor="pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 * player.rankPosition }}
            whileHover={{
                y: -2,
                boxShadow: `0 8px 24px ${useColorModeValue('rgba(0,0,0,0.08)', 'rgba(0,0,0,0.2)')}, var(--shadow-md)`,
            }}
        >
            <Flex align="center" gap={4}>
                {/* Rank number */}
                <Box
                    flexShrink={0}
                    w="44px"
                    h="44px"
                    borderRadius="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontFamily="heading"
                    fontWeight="black"
                    fontSize="xl"
                    bg={isUser ? cyan : (mode === 'light' ? 'gray.100' : 'var(--color-info-bg)')}
                    color={isUser ? 'white' : (mode === 'light' ? 'gray.700' : 'var(--color-cyan-400)')}
                >
                    {player.rankPosition}
                </Box>

                {/* Avatar */}
                <Box
                    flexShrink={0}
                    w="52px"
                    h="52px"
                    borderRadius="full"
                    overflow="hidden"
                    border={
                        isUser
                            ? `3px solid ${cyan}`
                            : `2px solid ${tierBorderColors[player.tier] || 'rgba(113,113,122,0.5)'}`
                    }
                >
                    <Image src={player.avatar} alt={player.username} w="full" h="full" objectFit="cover" />
                </Box>

                {/* Info */}
                <Box flex={1} minW={0}>
                    <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="var(--color-text-primary)">
                            {player.username}
                        </Text>
                        {isUser && (
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="9px"
                                fontFamily="body"
                                fontWeight="black"
                                bg={cyan}
                                color="#ffffff"
                            >
                                {t('leaderboardPage.yourRankBadge')}
                            </Badge>
                        )}
                        <RankBadge tier={player.tier} size="xs" />
                        {player.tag === 'RISING' && (
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="9px"
                                fontFamily="body"
                                fontWeight="black"
                                color="white"
                                bg="linear-gradient(135deg, #10b981 0%, #22d3ee 100%)"
                            >
                                {t('leaderboardPage.rising')}
                            </Badge>
                        )}
                        {player.tag === 'HOT' && (
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="9px"
                                fontFamily="body"
                                fontWeight="black"
                                color="white"
                                bg="linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
                            >
                                {t('leaderboardPage.hot')}
                            </Badge>
                        )}
                    </Flex>
                    <EnergyBar
                        percentage={player.winRate}
                        tier={isUser ? 'PLATINUM' : player.tier}
                        height="6px"
                        maxW="200px"
                        glow={isUser && mode === 'dark'}
                    />
                </Box>

                {/* Stats (hidden on mobile) */}
                <Flex
                    display={{ base: 'none', md: 'flex' }}
                    align="center"
                    gap={6}
                >
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="10px" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                            {t('leaderboardPage.power')}
                        </Text>
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color={cyan}>
                            {player.xp.toLocaleString()}
                        </Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="10px" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                            {t('leaderboardPage.wins')}
                        </Text>
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color="var(--color-text-primary)">
                            {player.wins}
                        </Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="10px" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider" mb={0.5}>
                            {t('leaderboardPage.rate')}
                        </Text>
                        <Text fontFamily="heading" fontSize="lg" fontWeight="bold" color={mode === 'light' ? 'green.600' : '#10b981'}>
                            {player.winRate}%
                        </Text>
                    </Box>
                    <StreakIndicator streak={player.streak} variant="compact" />
                </Flex>

                {/* Trend */}
                <TrendIndicator trend={player.trend} />
            </Flex>
        </MotionBox>
    );
};

/* ──────── Master export ──────── */
const RankCard = ({ player, variant = 'compact' }) => {
    if (variant === 'stage') {
        return <StageCard player={player} />;
    }
    return <CompactCard player={player} />;
};

export default RankCard;
