import React from 'react';
import { Box, Flex, Text, Image, Circle } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import mockLeaderboard from '../data/mockLeaderboard';

const MotionBox = motion.create(Box);

const glowColors = {
    1: 'var(--color-cyan-400)',
    2: '#22d3ee',
    3: 'var(--color-purple-500)',
};

const rankBadges = {
    1: { bg: 'linear-gradient(135deg, var(--color-cyan-400) 0%, #60a5fa 100%)', color: '#0f172a' },
    2: { bg: 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)', color: '#0f172a' },
    3: { bg: 'linear-gradient(135deg, var(--color-purple-500) 0%, #a855f7 100%)', color: '#0f172a' },
};

const podiumHeights = {
    1: { base: '112px', md: '148px' },
    2: { base: '84px', md: '112px' },
    3: { base: '72px', md: '96px' },
};

const podiumColors = {
    1: 'linear-gradient(180deg, rgba(34, 211, 238, 0.95) 0%, rgba(96, 165, 250, 0.9) 100%)',
    2: 'linear-gradient(180deg, rgba(103, 232, 249, 0.92) 0%, rgba(34, 211, 238, 0.84) 100%)',
    3: 'linear-gradient(180deg, rgba(168, 85, 247, 0.9) 0%, rgba(59, 130, 246, 0.82) 100%)',
};

const PodiumBase = ({ rankPosition }) => (
    <Box
        w={{ base: '92px', md: '120px' }}
        h={podiumHeights[rankPosition] || podiumHeights[2]}
        borderRadius="18px 18px 8px 8px"
        bg={podiumColors[rankPosition] || podiumColors[2]}
        border="1px solid rgba(255,255,255,0.14)"
        boxShadow="0 18px 30px rgba(0, 0, 0, 0.35)"
        position="relative"
        _before={{
            content: '""',
            position: 'absolute',
            inset: '10px 10px auto 10px',
            height: '18px',
            borderRadius: '999px',
            bg: 'rgba(255,255,255,0.16)',
            filter: 'blur(2px)',
        }}
    >
        <Text
            position="absolute"
            bottom={3}
            left="50%"
            transform="translateX(-50%)"
            fontFamily="heading"
            fontWeight="black"
            fontSize={{ base: '2xl', md: '3xl' }}
            color="rgba(255,255,255,0.92)"
            textShadow="0 2px 10px rgba(0,0,0,0.35)"
        >
            {rankPosition}
        </Text>
    </Box>
);

const PodiumPlayer = ({ player, size, rankSize, avatarSize, translateY, glow, subtitle, label, onMouseEnter, onMouseLeave }) => {
    const badge = rankBadges[player.rankPosition] || rankBadges[2];

    return (
        <Flex
            direction="column"
            align="center"
            justify="flex-end"
            gap={3}
            transform={translateY ? `translateY(${translateY})` : 'none'}
            minW={0}
            cursor="pointer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onMouseEnter}
            onBlur={onMouseLeave}
            tabIndex={0}
        >
            <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                <Box
                    position="absolute"
                    inset={-6}
                    borderRadius="full"
                    bg={`radial-gradient(circle, ${glow}55 0%, transparent 70%)`}
                    filter="blur(10px)"
                />

                <Circle
                    size={avatarSize}
                    bg="rgba(255,255,255,0.04)"
                    border={`3px solid ${glow}`}
                    boxShadow={`0 0 0 4px rgba(255,255,255,0.04), 0 0 24px ${glow}66`}
                    overflow="hidden"
                    position="relative"
                >
                    <Image src={player.avatar} alt={player.username} w="full" h="full" objectFit="cover" />
                </Circle>

                {player.rankPosition === 1 && (
                    <Box
                        position="absolute"
                        top={-8}
                        left="50%"
                        transform="translateX(-50%)"
                        fontSize="2xl"
                        color="#f59e0b"
                        textShadow="0 0 12px rgba(245, 158, 11, 0.8)"
                    >
                        👑
                    </Box>
                )}

                <Circle
                    size={rankSize}
                    position="absolute"
                    bottom={-2}
                    left="50%"
                    transform="translateX(-50%)"
                    bg={badge.bg}
                    color={badge.color}
                    fontFamily="heading"
                    fontWeight="black"
                    fontSize={size}
                    boxShadow={`0 0 18px ${glow}88`}
                    border="2px solid rgba(255,255,255,0.15)"
                >
                    {player.rankPosition}
                </Circle>
            </Box>

            <Box textAlign="center" mt={2}>
                <Text fontFamily="body" color="rgba(255,255,255,0.92)" fontSize={subtitle} fontWeight="medium">
                    {player.username}
                </Text>
                {label && (
                    <Text fontSize="xs" color="rgba(255,255,255,0.55)" mt={1}>
                        {label}
                    </Text>
                )}
            </Box>

            <Box mt={3}>
                <PodiumBase rankPosition={player.rankPosition} />
            </Box>
        </Flex>
    );
};

const ArenaStage = ({ players, onPlayerHoverStart, onPlayerHoverEnd }) => {
    const fallbackPlayers = mockLeaderboard.slice(0, 3).map((player) => ({
        ...player,
        avatar: player.avatar,
        username: player.username,
        rankPosition: player.rankPosition,
    }));

    const displayPlayers = [0, 1, 2].map((index) => players[index] || fallbackPlayers[index]);
    const champion = displayPlayers[0]; // rank 1
    const second = displayPlayers[1];   // rank 2
    const third = displayPlayers[2];    // rank 3

    return (
        <MotionBox
            mb={16}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            position="relative"
            borderRadius="28px"
            px={{ base: 4, md: 8 }}
            py={{ base: 10, md: 14 }}
            overflow="hidden"
            bg="linear-gradient(180deg, rgba(6, 10, 24, 0.98) 0%, rgba(9, 8, 31, 0.98) 52%, rgba(4, 8, 22, 0.99) 100%)"
            border="1px solid rgba(34, 211, 238, 0.22)"
            boxShadow="0 0 0 1px rgba(34, 211, 238, 0.08), 0 30px 90px rgba(0, 0, 0, 0.55)"
        >
            <Box position="absolute" inset={0} opacity={0.65} pointerEvents="none">
                <Box
                    position="absolute"
                    inset="-20%"
                    bg="radial-gradient(circle at center, rgba(34, 211, 238, 0.22) 0%, rgba(96, 165, 250, 0.14) 25%, transparent 62%)"
                    filter="blur(8px)"
                />
                <Box
                    position="absolute"
                    left="50%"
                    top="10%"
                    transform="translateX(-50%)"
                    w="140%"
                    h="140%"
                    bg="repeating-conic-gradient(from 180deg, rgba(34, 211, 238, 0.18) 0deg 6deg, rgba(96, 165, 250, 0.1) 6deg 10deg, transparent 10deg 16deg)"
                    clipPath="circle(34% at 50% 34%)"
                    filter="blur(0.5px)"
                />
                <Box position="absolute" top="0" left="50%" transform="translateX(-50%)" w="2px" h="100%" bg="linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.4) 18%, rgba(96, 165, 250, 0.55) 52%, rgba(34, 211, 238, 0.32) 82%, transparent 100%)" opacity={0.4} />
                <Box position="absolute" top="0" left="28%" w="1px" h="100%" bg="linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.18) 20%, transparent 100%)" opacity={0.9} />
                <Box position="absolute" top="0" right="26%" w="1px" h="100%" bg="linear-gradient(180deg, transparent 0%, rgba(96, 165, 250, 0.2) 18%, transparent 100%)" opacity={0.9} />
                <Box position="absolute" top="16%" left="10%" w="12px" h="12px" bg="#22d3ee" transform="rotate(45deg)" opacity={0.7} boxShadow="0 0 18px rgba(34, 211, 238, 0.65)" />
                <Box position="absolute" top="22%" right="12%" w="16px" h="16px" bg="var(--color-cyan-400)" transform="rotate(45deg)" opacity={0.65} boxShadow="0 0 18px rgba(34, 211, 238, 0.65)" />
                <Box position="absolute" bottom="18%" left="16%" w="10px" h="10px" bg="#60a5fa" transform="rotate(45deg)" opacity={0.78} boxShadow="0 0 14px rgba(96, 165, 250, 0.65)" />
                <Box position="absolute" bottom="20%" right="18%" w="10px" h="10px" bg="var(--color-purple-500)" transform="rotate(45deg)" opacity={0.68} boxShadow="0 0 14px rgba(139, 92, 246, 0.65)" />
                <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px)" bgSize="100% 26px" opacity={0.09} />
                <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(34, 211, 238, 0.07) 1px, transparent 1px)" bgSize="52px 100%" opacity={0.16} />
                <Box position="absolute" inset={0} bg="radial-gradient(circle at 50% 35%, transparent 0 18%, rgba(34, 211, 238, 0.06) 18% 19%, transparent 19% 100%)" opacity={0.8} />
            </Box>

            <Flex
                position="relative"
                zIndex={1}
                justify="center"
                align="end"
                gap={{ base: 5, md: 10 }}
                direction={{ base: 'column', md: 'row' }}
            >
                <Box order={{ base: 2, md: 1 }} mt={{ base: 2, md: 14 }}>
                    <PodiumPlayer
                        player={second}
                        size={{ base: 'xl', md: '2xl' }}
                        rankSize={{ base: '12', md: '14' }}
                        avatarSize={{ base: '84px', md: '96px' }}
                        translateY="0"
                        glow={glowColors[2]}
                        subtitle={{ base: 'sm', md: 'md' }}
                        onMouseEnter={(event) => onPlayerHoverStart?.(second, event)}
                        onMouseLeave={onPlayerHoverEnd}
                    />
                </Box>

                <Box order={{ base: 1, md: 2 }} mt={{ base: 0, md: 2 }}>
                    <PodiumPlayer
                        player={champion}
                        size={{ base: '2xl', md: '3xl' }}
                        rankSize={{ base: '14', md: '16' }}
                        avatarSize={{ base: '128px', md: '156px' }}
                        translateY="-10px"
                        glow={glowColors[1]}
                        subtitle={{ base: 'md', md: 'lg' }}
                        label="Top of the board"
                        onMouseEnter={(event) => onPlayerHoverStart?.(champion, event)}
                        onMouseLeave={onPlayerHoverEnd}
                    />
                </Box>

                <Box order={{ base: 3, md: 3 }} mt={{ base: 2, md: 14 }}>
                    <PodiumPlayer
                        player={third}
                        size={{ base: 'xl', md: '2xl' }}
                        rankSize={{ base: '12', md: '14' }}
                        avatarSize={{ base: '84px', md: '96px' }}
                        translateY="0"
                        glow={glowColors[3]}
                        subtitle={{ base: 'sm', md: 'md' }}
                        onMouseEnter={(event) => onPlayerHoverStart?.(third, event)}
                        onMouseLeave={onPlayerHoverEnd}
                    />
                </Box>
            </Flex>
        </MotionBox>
    );
};

export default ArenaStage;
