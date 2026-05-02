/**
 * ChampionCard – Rank #1 showcase card
 *
 * Features:
 *  • Spotlight radial gradient behind the card
 *  • Animated cyan glow via Framer m (replaces CSS championGlow keyframe)
 *  • Slightly larger scale
 *  • "Champion" floating badge above rank number
 *  • Aura ring around avatar
 */
import React from 'react';
import { Box, Flex, Text, Image, Grid } from '@chakra-ui/react';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RankBadge from './RankBadge';
import EnergyBar from './EnergyBar';
import StreakIndicator from './StreakIndicator';

const MotionBox = m.create(Box);
const MotionFlex = m.create(Flex);

const glowAnimation = {
    animate: {
        boxShadow: [
            '0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2), var(--shadow-card)',
            '0 0 60px rgba(34, 211, 238, 0.6), 0 0 100px rgba(34, 211, 238, 0.3), var(--shadow-card)',
            '0 0 40px rgba(34, 211, 238, 0.4), 0 0 80px rgba(34, 211, 238, 0.2), var(--shadow-card)',
        ],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const ChampionCard = ({ player, animationsReady = false }) => {
    const { t } = useTranslation();

    return (
        <Box position="relative">
            {/* Spotlight effect */}
            <Box
                position="absolute"
                top="-100px"
                left="50%"
                transform="translateX(-50%)"
                w="300px"
                h="300px"
                bgGradient="radial(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)"
                pointerEvents="none"
                zIndex={0}
            />

            <MotionBox
                position="relative"
                zIndex={10}
                borderRadius="12px"
                p={8}
                pt={16}
                mt={20}
                bg="linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)"
                border="2px solid #22d3ee"
                transform="scale(1.05)"
                cursor="pointer"
                variants={glowAnimation}
                animate={animationsReady ? 'animate' : undefined}
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.3 }}
            >
                <Flex direction="column" align="center">
                    {/* Champion badge + Rank number stacked above card */}
                    <Flex
                        direction="column"
                        align="center"
                        position="absolute"
                        top="-80px"
                        left="50%"
                        transform="translateX(-50%)"
                        zIndex={20}
                        gap={2}
                    >
                        {/* Champion tag */}
                        <Box
                            px={4}
                            py={1.5}
                            borderRadius="6px"
                            fontFamily="body"
                            fontSize="xs"
                            fontWeight="extrabold"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            bg="linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)"
                            color="#0f172a"
                            boxShadow="0 4px 12px rgba(251, 191, 36, 0.4)"
                            whiteSpace="nowrap"
                        >
                            {t('leaderboardPage.champion')}
                        </Box>

                        {/* Rank number */}
                        <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontFamily="heading"
                            fontWeight="black"
                            fontSize="4xl"
                            bg="linear-gradient(135deg, #22d3ee 0%, #60a5fa 100%)"
                            color="#0f172a"
                            boxShadow="0 0 40px rgba(34, 211, 238, 0.6), var(--shadow-card)"
                        >
                            1
                        </Box>
                    </Flex>

                    {/* Avatar with aura ring */}
                    <Box position="relative" mb={6} mt={10}>
                        <Box
                            w={{ base: '96px', md: '128px' }}
                            h={{ base: '96px', md: '128px' }}
                            borderRadius="full"
                            overflow="hidden"
                            border="4px solid #22d3ee"
                            boxShadow="0 0 50px rgba(34, 211, 238, 0.6), 0 0 100px rgba(34, 211, 238, 0.3)"
                        >
                            <Image
                                src={player.avatar}
                                alt={player.username}
                                htmlWidth="128"
                                htmlHeight="128"
                                w="full"
                                h="full"
                                objectFit="cover"
                                loading="eager"
                                decoding="async"
                                fetchPriority="high"
                            />
                        </Box>
                        {/* Aura ring */}
                        <MotionBox
                            position="absolute"
                            inset={0}
                            borderRadius="full"
                            border="2px solid rgba(34, 211, 238, 0.3)"
                            animate={animationsReady ? {
                                boxShadow: [
                                    '0 0 20px rgba(34, 211, 238, 0.2)',
                                    '0 0 40px rgba(34, 211, 238, 0.4)',
                                    '0 0 20px rgba(34, 211, 238, 0.2)',
                                ],
                            } : undefined}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </Box>

                    {/* Username */}
                    <Text
                        fontFamily="heading"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="black"
                        color="var(--color-text-primary)"
                        letterSpacing="tight"
                        mb={2}
                    >
                        {player.username}
                    </Text>

                    {/* Tier badge */}
                    <Box mb={5}>
                        <RankBadge tier={player.tier} size="lg" />
                    </Box>

                    {/* Power Level */}
                    <Box textAlign="center" mb={5}>
                        <Text fontFamily="body" fontSize="xs" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider" mb={2}>
                            {t('leaderboardPage.powerLevel')}
                        </Text>
                        <MotionFlex
                            justify="center"
                            initial={false}
                            animate={animationsReady ? { opacity: 1, y: 0 } : undefined}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Text
                                fontFamily="heading"
                                fontSize={{ base: '4xl', md: '5xl' }}
                                fontWeight="black"
                                color="#22d3ee"
                                textShadow="0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)"
                            >
                                {player.xp.toLocaleString()}
                            </Text>
                        </MotionFlex>
                    </Box>

                    {/* Energy bar */}
                    <Box w="full" mb={5}>
                        <EnergyBar
                            percentage={player.winRate}
                            tier={player.tier}
                            height="12px"
                            glow
                        />
                    </Box>

                    {/* Stats grid */}
                    <Grid templateColumns="1fr 1fr" gap={4} w="full" mb={4}>
                        <Box
                            textAlign="center"
                            p={4}
                            borderRadius="6px"
                            bg="var(--color-bg-elevated)"
                            border="1px solid var(--color-glass-border-strong)"
                        >
                            <Text fontFamily="heading" fontSize="3xl" fontWeight="black" color="var(--color-text-primary)">
                                {player.wins}
                            </Text>
                            <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                {t('leaderboardPage.victories')}
                            </Text>
                        </Box>
                        <Box
                            textAlign="center"
                            p={4}
                            borderRadius="6px"
                            bg="var(--color-bg-elevated)"
                            border="1px solid var(--color-glass-border-strong)"
                        >
                            <Text fontFamily="heading" fontSize="3xl" fontWeight="black" color="var(--color-green-500)">
                                {player.winRate}%
                            </Text>
                            <Text fontFamily="body" fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                                {t('leaderboardPage.winRate')}
                            </Text>
                        </Box>
                    </Grid>

                    {/* Streak */}
                    <StreakIndicator streak={player.streak} />
                </Flex>
            </MotionBox>
        </Box>
    );
};

export default React.memo(ChampionCard);
