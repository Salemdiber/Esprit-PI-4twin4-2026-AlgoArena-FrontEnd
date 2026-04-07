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
import { Box, Flex, Text, Image, Grid, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import RankBadge from './RankBadge';
import EnergyBar from './EnergyBar';
import StreakIndicator from './StreakIndicator';
import TrendIndicator from './TrendIndicator';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

/* ──────── colour maps for border accents per rank / tier ──────── */
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
const stageBoxShadow = {
    2: '0 8px 24px rgba(0,0,0,0.4), 0 0 40px rgba(34,211,238,0.15)',
    3: '0 6px 18px rgba(0,0,0,0.35), 0 0 30px rgba(34,211,238,0.1)',
};

/* ──────── STAGE variant (vertical card for #2 & #3) ──────── */
const StageCard = ({ player }) => {
    const rank = player.rankPosition;
    const colors = rankBorderColors[rank] || rankBorderColors[2];

    return (
        <MotionBox
            position="relative"
            borderRadius="12px"
            p={6}
            bg="linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)"
            border={`1px solid ${colors.solid}30`}
            boxShadow={stageBoxShadow[rank]}
            cursor="pointer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: rank === 2 ? 0.1 : 0.2 }}
            whileHover={{
                y: -4,
                scale: 1.01,
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.2), 0px 12px 32px rgba(0, 0, 0, 0.5)',
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
                    color="#0f172a"
                    boxShadow={`0 4px 12px ${colors.glow}`}
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
                        boxShadow={`0 0 30px ${colors.glow}`}
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
                    <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                        Power Level
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
                            color="#22d3ee"
                            textShadow="0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)"
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
                    <Box textAlign="center" p={3} borderRadius="6px" bg="var(--color-bg-elevated)">
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
                            {player.wins}
                        </Text>
                        <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                            Victories
                        </Text>
                    </Box>
                    <Box textAlign="center" p={3} borderRadius="6px" bg="var(--color-bg-elevated)">
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-green-500)">
                            {player.winRate}%
                        </Text>
                        <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                            Win Rate
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
    const isUser = player.isCurrentUser;

    return (
        <MotionBox
            borderRadius="12px"
            p={5}
            bg={
                isUser
                    ? 'linear-gradient(135deg, var(--color-info-bg) 0%, var(--color-bg-secondary) 100%)'
                    : 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)'
            }
            border={isUser ? '2px solid var(--color-cyan-400)' : '1px solid var(--color-border)'}
            boxShadow={
                isUser
                    ? '0 0 30px rgba(34, 211, 238, 0.3), 0 4px 16px rgba(0, 0, 0, 0.1)'
                    : 'var(--shadow-custom)'
            }
            cursor="pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 * player.rankPosition }}
            whileHover={{
                y: -4,
                scale: 1.01,
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.2), 0px 12px 32px rgba(0, 0, 0, 0.5)',
            }}
        >
            <Flex align="center" gap={4}>
                {/* Rank number */}
                <Box
                    flexShrink={0}
                    w="48px"
                    h="48px"
                    borderRadius="6px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontFamily="heading"
                    fontWeight="black"
                    fontSize="2xl"
                    bg={isUser ? 'var(--color-cyan-400)' : 'var(--color-info-bg)'}
                    color={isUser ? '#ffffff' : 'var(--color-cyan-400)'}
                >
                    {player.rankPosition}
                </Box>

                {/* Avatar */}
                <Box
                    flexShrink={0}
                    w="56px"
                    h="56px"
                    borderRadius="full"
                    overflow="hidden"
                    border={
                        isUser
                            ? '3px solid #22d3ee'
                            : `2px solid ${tierBorderColors[player.tier] || 'rgba(113,113,122,0.5)'}`
                    }
                    boxShadow={isUser ? '0 0 20px rgba(34, 211, 238, 0.5)' : 'none'}
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
                                fontSize="xs"
                                fontFamily="body"
                                fontWeight="bold"
                                bg="var(--color-cyan-400)"
                                color="#ffffff"
                            >
                                YOUR RANK
                            </Badge>
                        )}
                        <RankBadge tier={player.tier} size="sm" />
                        {player.tag === 'RISING' && (
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="xs"
                                fontFamily="body"
                                fontWeight="bold"
                                color="var(--color-text-primary)"
                                bg="linear-gradient(135deg, #10b981 0%, #22d3ee 100%)"
                            >
                                RISING
                            </Badge>
                        )}
                        {player.tag === 'HOT' && (
                            <Badge
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                                fontSize="xs"
                                fontFamily="body"
                                fontWeight="bold"
                                color="var(--color-text-primary)"
                                bg="linear-gradient(135deg, #ef4444 0%, #f97316 100%)"
                            >
                                HOT
                            </Badge>
                        )}
                    </Flex>
                    <EnergyBar
                        percentage={player.winRate}
                        tier={isUser ? 'PLATINUM' : player.tier}
                        height="6px"
                        maxW="200px"
                        glow={isUser}
                    />
                </Box>

                {/* Stats (hidden on mobile) */}
                <Flex
                    display={{ base: 'none', md: 'flex' }}
                    align="center"
                    gap={6}
                >
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                            Power
                        </Text>
                        <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color="#22d3ee">
                            {player.xp.toLocaleString()}
                        </Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                            Wins
                        </Text>
                        <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color="var(--color-text-primary)">
                            {player.wins}
                        </Text>
                    </Box>
                    <Box textAlign="center">
                        <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider" mb={1}>
                            Rate
                        </Text>
                        <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color="#10b981">
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
