/**
 * ChallengeCard – renders a single challenge in the list.
 *
 * Adapts UI for:
 *  - RECOMMENDED (cyan glow border)
 *  - SOLVED (dimmed + checkmark badge + score)
 *  - ATTEMPTED / UNSOLVED (default state)
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Badge,
    Button,
    Tag,
    HStack,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META, ChallengeUserStatus } from '../data/mockChallenges';

const MotionBox = motion.create(Box);

const ClockIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </Icon>
);

const StarIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </Icon>
);

const CheckIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </Icon>
);

const formatGrace = (seconds) => {
    const mins = Math.floor((seconds || 0) / 60);
    const secs = (seconds || 0) % 60;
    return `${String(mins)}:${String(secs).padStart(2, '0')}`;
};

const ChallengeCard = ({ challenge, graceInfo = null }) => {
    const navigate = useNavigate();
    const { getUserProgress, isRecommended, selectChallenge } = useChallengeContext();
    const [graceRemainingSeconds, setGraceRemainingSeconds] = React.useState(null);

    const progress = getUserProgress(challenge.id);
    const status = progress?.status || ChallengeUserStatus.UNSOLVED;
    const isSolved = status === ChallengeUserStatus.SOLVED;
    const incompleteAttempts = Number(progress?.incompleteAttemptCount || 0);
    const hasActiveGrace = graceRemainingSeconds != null && graceRemainingSeconds > 0;
    const recommended = isRecommended(challenge);
    const diffMeta = DIFFICULTY_META[challenge.difficulty];

    React.useEffect(() => {
        if (!graceInfo?.gracePeriodExpiresAt) {
            setGraceRemainingSeconds(null);
            return;
        }

        const tick = () => {
            const remaining = Math.max(0, Math.floor((new Date(graceInfo.gracePeriodExpiresAt).getTime() - Date.now()) / 1000));
            setGraceRemainingSeconds(remaining > 0 ? remaining : null);
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [graceInfo]);

    const handleStart = () => {
        selectChallenge(challenge.id);
        navigate(`/challenges/${challenge.id}`);
    };

    return (
        <MotionBox
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            p={5}
            border="1px solid"
            borderColor={recommended ? 'brand.500' : 'transparent'}
            boxShadow={recommended ? '0 0 20px rgba(34, 211, 238, 0.3)' : 'none'}
            opacity={isSolved ? 0.75 : 1}
            cursor="pointer"
            onClick={handleStart}
            whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(34, 211, 238, 0.3)' }}
            transition={{ duration: 0.3 }}
        >
            <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" gap={4}>
                {/* Left content */}
                <Box flex={1}>
                    {/* Badges row */}
                    <HStack spacing={3} mb={3}>
                        <Badge
                            bg={diffMeta.hex}
                            color={challenge.difficulty === 'HARD' || challenge.difficulty === 'EXPERT' ? 'white' : '#0f172a'}
                            fontSize="xs"
                            fontWeight="bold"
                            px={3}
                            py={1}
                            borderRadius="8px"
                        >
                            {diffMeta.label.toUpperCase()}
                        </Badge>

                        {recommended && !isSolved && (
                            <Badge
                                bg="rgba(34, 211, 238, 0.2)"
                                color="brand.500"
                                fontSize="xs"
                                fontWeight="bold"
                                px={3}
                                py={1}
                                borderRadius="8px"
                            >
                                RECOMMENDED
                            </Badge>
                        )}

                        {isSolved && (
                            <Badge
                                bg="rgba(34, 197, 94, 0.2)"
                                color="green.400"
                                fontSize="xs"
                                fontWeight="bold"
                                px={3}
                                py={1}
                                borderRadius="8px"
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <CheckIcon w={3} h={3} />
                                SOLVED
                            </Badge>
                        )}

                        {!isSolved && incompleteAttempts > 0 && (
                            <Badge
                                bg="rgba(249,115,22,0.2)"
                                color="orange.300"
                                fontSize="xs"
                                fontWeight="bold"
                                px={3}
                                py={1}
                                borderRadius="8px"
                            >
                                Incomplete
                            </Badge>
                        )}
                        {hasActiveGrace && (
                            <Badge
                                bg="rgba(245,158,11,0.22)"
                                color="orange.200"
                                fontSize="xs"
                                fontWeight="bold"
                                px={3}
                                py={1}
                                borderRadius="8px"
                                animation="pulse 1.4s ease-in-out infinite"
                            >
                                Return Now • {formatGrace(graceRemainingSeconds)}
                            </Badge>
                        )}
                    </HStack>

                    {/* Title */}
                    <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={useColorModeValue("gray.800", "gray.100")} mb={2}>
                        {challenge.title}
                    </Text>

                    {/* Description excerpt */}
                    <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mb={3} noOfLines={2}>
                        {challenge.description.split('\n')[0]}
                    </Text>

                    {/* Tags */}
                    <HStack spacing={2} flexWrap="wrap" mb={3}>
                        {challenge.tags.map(tag => (
                            <Tag
                                key={tag}
                                bg="var(--color-tag-bg)"
                                color={useColorModeValue("gray.600", "gray.300")}
                                size="sm"
                                borderRadius="8px"
                                fontSize="xs"
                            >
                                {tag}
                            </Tag>
                        ))}
                    </HStack>

                    {/* Meta row */}
                    {isSolved && progress ? (
                        <HStack spacing={6} fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                            <Text>Your time: <Text as="strong" color="green.400">{progress.bestRuntime}ms</Text></Text>
                            <Text>Score: <Text as="strong" color="green.400">{progress.earnedXp}/{challenge.xpReward}</Text></Text>
                        </HStack>
                    ) : (
                        <HStack spacing={6} fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                            <Flex align="center" gap={2}>
                                <ClockIcon w={4} h={4} />
                                <Text>~{challenge.estimatedTime} min</Text>
                            </Flex>
                            <Flex align="center" gap={2}>
                                <StarIcon w={4} h={4} color="yellow.400" />
                                <Text>+{challenge.xpReward} XP</Text>
                            </Flex>
                            <Text>
                                Acceptance: <Text as="strong" color={useColorModeValue("gray.800", "gray.100")}>{challenge.acceptanceRate}%</Text>
                            </Text>
                            {incompleteAttempts > 0 && (
                                <Text color="orange.300">
                                    {incompleteAttempts} incomplete attempt{incompleteAttempts !== 1 ? 's' : ''}
                                </Text>
                            )}
                        </HStack>
                    )}
                </Box>

                {/* Right action */}
                <Flex direction="column" gap={2} align={{ sm: 'flex-end' }}>
                    <Button
                        variant={isSolved ? 'ghost' : 'primary'}
                        bg={isSolved ? 'gray.700' : undefined}
                        color={isSolved ? 'gray.300' : undefined}
                        _hover={isSolved ? { bg: 'gray.600' } : undefined}
                        px={6}
                        fontSize="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStart();
                        }}
                        whiteSpace="nowrap"
                    >
                        {isSolved ? 'View Solution' : 'Start Challenge'}
                    </Button>
                    <Text fontSize="xs" color={isSolved ? 'green.400' : 'gray.500'}>
                        {isSolved
                            ? `Earned +${progress.earnedXp} XP`
                            : `Solved by ${(challenge.solvedCount || 0).toLocaleString()} users`}
                    </Text>
                </Flex>
            </Flex>
        </MotionBox>
    );
};

export default ChallengeCard;
