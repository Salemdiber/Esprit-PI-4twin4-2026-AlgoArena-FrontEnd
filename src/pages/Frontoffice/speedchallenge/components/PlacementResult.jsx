import React from 'react';
import { Box, Flex, Text, VStack, Button, HStack, Icon } from '@chakra-ui/react';
import { MdMilitaryTech, MdDiamond, MdSmartToy } from 'react-icons/md';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const RANK_VISUALS = {
    BRONZE: { icon: MdMilitaryTech, glow: 'rgba(205,127,50,0.4)', ring: '#cd7f32' },
    SILVER: { icon: MdMilitaryTech, glow: 'rgba(192,192,192,0.4)', ring: '#c0c0c0' },
    GOLD: { icon: MdMilitaryTech, glow: 'rgba(250,204,21,0.5)', ring: '#facc15' },
    PLATINUM: { icon: MdDiamond, glow: 'rgba(34,211,238,0.5)', ring: '#22d3ee' },
    DIAMOND: { icon: MdDiamond, glow: 'rgba(168,85,247,0.5)', ring: '#a855f7' },
};

/** Circular score ring */
const ScoreRing = ({ solved, total = 3, color }) => {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const pct = solved / total;
    return (
        <Box position="relative" w="120px" h="120px">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                    cx="60" cy="60" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct)}
                    transform="rotate(-90 60 60)"
                    style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1.2s ease' }}
                />
            </svg>
            <Flex position="absolute" inset={0} align="center" justify="center" direction="column">
                <Text fontSize="2xl" fontWeight="black" color="white" lineHeight={1}>{solved}</Text>
                <Text fontSize="10px" color="gray.500" fontFamily="mono">/ {total}</Text>
            </Flex>
        </Box>
    );
};

/** Animated score bar */
const ScoreBar = ({ label, value, color }) => (
    <Box w="100%">
        <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" fontFamily="mono" color="gray.400" textTransform="uppercase" letterSpacing="0.08em">
                {label}
            </Text>
            <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color={color}>
                {value}<Text as="span" color="gray.600">/100</Text>
            </Text>
        </Flex>
        <Box h="6px" borderRadius="full" bg="rgba(255,255,255,0.06)" overflow="hidden">
            <MotionBox
                h="100%"
                borderRadius="full"
                bg={color}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ boxShadow: `0 0 8px ${color}88` }}
            />
        </Box>
    </Box>
);

/** Difficulty color helper */
const diffColor = (d) =>
    d === 'HARD' ? '#ef4444' : d === 'MEDIUM' ? '#facc15' : '#22c55e';

/** AI analysis section */
const AIAnalysisSection = ({ aiAnalysis }) => {
    // aiAnalysis: false = loading, null = failed/unavailable, object = done
    if (aiAnalysis === null) return null;

    if (aiAnalysis === false) {
        return (
            <Box w="100%" p={4} borderRadius="12px" bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)">
                <HStack spacing={2} mb={3}>
                    <Box w="8px" h="8px" borderRadius="full" bg="cyan.400"
                        className="animate-pulse-glow" />
                    <Text fontSize="xs" fontFamily="mono" color="cyan.400" letterSpacing="0.1em" textTransform="uppercase">
                        AI Analysis — analysing your code…
                    </Text>
                </HStack>
                <VStack spacing={2}>
                    {['Exactitude', 'Complexity', 'Style'].map((label) => (
                        <Box key={label} w="100%">
                            <Flex justify="space-between" mb={1}>
                                <Text fontSize="xs" fontFamily="mono" color="gray.600" textTransform="uppercase">{label}</Text>
                                <Text fontSize="xs" fontFamily="mono" color="gray.700">—</Text>
                            </Flex>
                            <Box h="6px" borderRadius="full" bg="rgba(255,255,255,0.04)" overflow="hidden" position="relative">
                                <Box
                                    position="absolute"
                                    top={0} left={0}
                                    h="100%" w="40%"
                                    borderRadius="full"
                                    bg="rgba(34,211,238,0.18)"
                                    className="shimmer-bar"
                                />
                            </Box>
                        </Box>
                    ))}
                </VStack>
            </Box>
        );
    }

    const { aiScores, breakdown, totalScore } = aiAnalysis;

    return (
        <Box w="100%">
            {/* Section header */}
            <HStack spacing={2} mb={3}>
                <Icon as={MdSmartToy} w={4} h={4} color="gray.500" />
                <Text fontSize="xs" fontFamily="mono" color="gray.500"
                    textTransform="uppercase" letterSpacing="0.1em">
                    AI Analysis
                </Text>
                <Box flex={1} h="1px" bg="rgba(255,255,255,0.06)" />
                <Text fontSize="xs" fontFamily="mono" color="gray.500">
                    Score{' '}
                    <Text as="span" fontWeight="bold" color="white">{totalScore}</Text>
                    /100
                </Text>
            </HStack>

            {/* Aggregate score bars */}
            <Box p={4} borderRadius="12px" bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)" mb={3}>
                <VStack spacing={3} align="stretch">
                    <ScoreBar label="Exactitude" value={aiScores.exactitude} color="#22c55e" />
                    <ScoreBar label="Complexity" value={aiScores.complexity} color="#22d3ee" />
                    <ScoreBar label="Style" value={aiScores.style} color="#a855f7" />
                </VStack>
            </Box>

            {/* Per-problem breakdown */}
            {breakdown?.length > 0 && (
                <VStack spacing={2} align="stretch">
                    {breakdown.map((b) => (
                        <Box
                            key={b.problemId}
                            p={3}
                            borderRadius="10px"
                            bg={
                                b.composite > 0
                                    ? 'rgba(34,211,238,0.04)'
                                    : 'rgba(255,255,255,0.02)'
                            }
                            border="1px solid"
                            borderColor={
                                b.composite > 0
                                    ? 'rgba(34,211,238,0.12)'
                                    : 'rgba(255,255,255,0.05)'
                            }
                        >
                            <Flex align="center" justify="space-between" mb={b.composite > 0 ? 2 : 0}>
                                <HStack spacing={2}>
                                    <Text fontSize="xs" fontWeight="semibold" color="white">
                                        {b.title}
                                    </Text>
                                    <Text fontSize="9px" fontFamily="mono" color={diffColor(b.difficulty)}
                                        textTransform="uppercase" letterSpacing="0.06em">
                                        {b.difficulty}
                                    </Text>
                                </HStack>
                                {b.composite > 0 ? (
                                    <Text fontSize="xs" fontFamily="mono" fontWeight="bold" color="white">
                                        {b.composite}<Text as="span" color="gray.600">/100</Text>
                                    </Text>
                                ) : (
                                    <Text fontSize="xs" fontFamily="mono" color="gray.600">skipped</Text>
                                )}
                            </Flex>

                            {b.composite > 0 && (
                                <>
                                    <Flex gap={2} mb={2}>
                                        {(() => {
                                            const items = [
                                                { label: 'Exact.', val: b.exactitude, color: '#22c55e' },
                                                { label: 'Cmplx.', val: b.complexity, color: '#22d3ee' },
                                                { label: 'O', val: b.complexite || b.timeComplexity || 'O(?)', color: '#60a5fa' },
                                                { label: 'Style', val: b.style, color: '#a855f7' },
                                            ];
                                            return items.map(({ label, val, color }) => (
                                                <Box key={label} flex={1} textAlign="center"
                                                    px={1} py={1} borderRadius="6px" bg="rgba(255,255,255,0.04)">
                                                    <Text fontSize="9px" color="gray.500" fontFamily="mono">{label}</Text>
                                                    {typeof val === 'number' ? (
                                                        <Text fontSize="xs" fontWeight="bold" color={color}>{val}</Text>
                                                    ) : (
                                                        <Text fontSize="xs" fontWeight="bold" color={color} fontFamily="mono">{String(val)}</Text>
                                                    )}
                                                </Box>
                                            ));
                                        })()}
                                    </Flex>
                                    {b.notes && (
                                        <Text fontSize="10px" color="gray.500" fontStyle="italic" lineHeight="1.5">
                                            {b.notes}
                                        </Text>
                                    )}
                                </>
                            )}
                        </Box>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

const PlacementResult = ({ placement, solvedIds, totalSeconds, problems, aiAnalysis, onDone }) => {
    const visual = RANK_VISUALS[placement.rank] || RANK_VISUALS.BRONZE;
    const minutesUsed = Math.floor(totalSeconds / 60);
    const secsUsed = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${pad(minutesUsed)}:${pad(secsUsed)}`;

    return (
        <Box
            minH="100vh"
            bg="#0f172a"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
            py={{ base: 20, md: 24 }}
        >
            {/* Ambient glow */}
            <Box
                position="absolute"
                top="30%"
                left="50%"
                transform="translateX(-50%)"
                w="500px"
                h="300px"
                borderRadius="full"
                bg={visual.glow}
                filter="blur(100px)"
                opacity={0.4}
                pointerEvents="none"
            />

            <MotionBox
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                maxW="560px"
                w="100%"
                mx={4}
                position="relative"
                zIndex={10}
            >
                <Box
                    bg="rgba(15,23,42,0.95)"
                    backdropFilter="blur(20px)"
                    borderRadius="24px"
                    border="1px solid"
                    borderColor={`${visual.ring}40`}
                    boxShadow={`0 0 60px ${visual.glow}, 0 24px 48px rgba(0,0,0,0.5)`}
                    overflow="hidden"
                >
                    {/* Top gradient bar */}
                    <Box
                        h="4px"
                        bgGradient={`linear(to-r, ${placement.gradient[0]}, ${placement.gradient[1]})`}
                    />

                    <VStack spacing={8} p={{ base: 6, md: 12 }} align="center">
                        {/* Title */}
                        <Box textAlign="center">
                            <Text
                                fontSize="xs"
                                fontFamily="mono"
                                color="gray.500"
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                                mb={1}
                            >
                                Placement Result
                            </Text>
                            <Text
                                fontSize="3xl"
                                fontWeight="black"
                                color="white"
                                fontFamily="heading"
                                lineHeight={1.2}
                            >
                                Your Level
                            </Text>
                        </Box>

                        {/* Rank badge */}
                        <MotionBox
                            animate={{ rotate: [0, -3, 3, -2, 2, 0] }}
                            transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                        >
                            <Box
                                px={8}
                                py={4}
                                borderRadius="16px"
                                border="2px solid"
                                borderColor={visual.ring}
                                bg={`${visual.ring}15`}
                                boxShadow={`0 0 30px ${visual.glow}`}
                                textAlign="center"
                            >
                                <Icon
                                    as={visual.icon}
                                    boxSize={24}
                                    mb={2}
                                    color={placement.color}
                                    style={{ filter: `drop-shadow(0 0 12px ${visual.glow})` }}
                                />
                                <Text
                                    fontSize="2xl"
                                    fontWeight="black"
                                    color={placement.color}
                                    fontFamily="heading"
                                    letterSpacing="0.05em"
                                    style={{ textShadow: `0 0 20px ${visual.glow}` }}
                                >
                                    {placement.label}
                                </Text>
                            </Box>
                        </MotionBox>

                        {/* Stats row */}
                        <Flex gap={6} w="100%" justify="center">
                            {/* Problems solved */}
                            <VStack spacing={1} align="center">
                                <ScoreRing solved={solvedIds.length} color={placement.color} />
                                <Text fontSize="xs" color="gray.500" fontFamily="mono" mt={1}>
                                    Problems Solved
                                </Text>
                            </VStack>

                            {/* Stats cards */}
                            <VStack spacing={3} flex={1} justify="center">
                                <Flex
                                    w="100%"
                                    justify="space-between"
                                    align="center"
                                    p={3}
                                    borderRadius="10px"
                                    bg="rgba(255,255,255,0.04)"
                                    border="1px solid rgba(255,255,255,0.06)"
                                >
                                    <Text fontSize="xs" color="gray.500" fontFamily="mono">Time used</Text>
                                    <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color="white">
                                        {timeStr}
                                    </Text>
                                </Flex>
                                <Flex
                                    w="100%"
                                    justify="space-between"
                                    align="center"
                                    p={3}
                                    borderRadius="10px"
                                    bg="rgba(255,255,255,0.04)"
                                    border="1px solid rgba(255,255,255,0.06)"
                                >
                                    <Text fontSize="xs" color="gray.500" fontFamily="mono">XP earned</Text>
                                    <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color="yellow.400">
                                        +{placement.xp} XP
                                    </Text>
                                </Flex>
                                <Flex
                                    w="100%"
                                    justify="space-between"
                                    align="center"
                                    p={3}
                                    borderRadius="10px"
                                    bg="rgba(255,255,255,0.04)"
                                    border="1px solid rgba(255,255,255,0.06)"
                                >
                                    <Text fontSize="xs" color="gray.500" fontFamily="mono">Rank assigned</Text>
                                    <Text fontSize="sm" fontWeight="bold" fontFamily="mono" color={placement.color}>
                                        {placement.rank}
                                    </Text>
                                </Flex>
                            </VStack>
                        </Flex>

                        {/* Message */}
                        <Box
                            p={4}
                            borderRadius="12px"
                            bg="rgba(255,255,255,0.03)"
                            border="1px solid rgba(255,255,255,0.06)"
                            w="100%"
                            textAlign="center"
                        >
                            <Text fontSize="sm" color="gray.300" lineHeight="1.7">
                                {placement.message}
                            </Text>
                        </Box>

                        {/* AI Analysis */}
                        <AIAnalysisSection aiAnalysis={aiAnalysis} />

                        {/* Solved problems */}
                        {solvedIds.length > 0 && (
                            <Box w="100%">
                                <Text fontSize="xs" color="gray.500" fontFamily="mono" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                                    Solved
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {problems
                                        .filter((p) => solvedIds.includes(p.id))
                                        .map((p) => (
                                            <Flex
                                                key={p.id}
                                                align="center"
                                                gap={3}
                                                p={3}
                                                borderRadius="8px"
                                                bg="rgba(34,197,94,0.06)"
                                                border="1px solid rgba(34,197,94,0.15)"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                                                    <path d="M20 6 9 17l-5-5" />
                                                </svg>
                                                <Text fontSize="sm" color="white" fontWeight="medium">{p.title}</Text>
                                                <Box ml="auto">
                                                    <Text fontSize="xs" color={p.difficultyColor} fontFamily="mono">
                                                        {p.difficulty}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        ))}
                                </VStack>
                            </Box>
                        )}

                        {/* CTA */}
                        <Button
                            w="100%"
                            h="48px"
                            onClick={onDone}
                            bgGradient={`linear(to-r, ${placement.gradient[0]}, ${placement.gradient[1]})`}
                            color="#0f172a"
                            fontWeight="bold"
                            fontSize="sm"
                            borderRadius="10px"
                            boxShadow={`0 4px 20px ${visual.glow}`}
                            _hover={{
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 30px ${visual.glow}`,
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.3s ease"
                        >
                            Enter the Arena as {placement.rank} 🚀
                        </Button>
                    </VStack>
                </Box>
            </MotionBox>
        </Box>
    );
};

export default PlacementResult;
