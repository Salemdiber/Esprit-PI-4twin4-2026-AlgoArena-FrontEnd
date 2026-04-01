/**
 * ProblemDescription – renders the problem statement, examples,
 * constraints, and hints for the selected challenge.
 *
 * All data is derived from the ChallengeContext, never hardcoded.
 */
import React, { useState } from 'react';
import {
    Box,
    Flex,
    Text,
    Badge,
    Tag,
    HStack,
    Icon,
    VStack,
    Collapse,
    Button,
    Code,
    Divider,
    useColorModeValue,
} from '@chakra-ui/react';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META } from '../data/mockChallenges';

const StarIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </Icon>
);

const ProblemDescription = () => {
    const { selectedChallenge, activeTab } = useChallengeContext();
    const [openHints, setOpenHints] = useState({});

    if (!selectedChallenge) return null;

    const diffMeta = DIFFICULTY_META[selectedChallenge.difficulty];

    const toggleHint = (idx) => {
        setOpenHints(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    // Only show description on tab 0
    if (activeTab === 1) {
        return (
            <Box>
                <Text color={useColorModeValue("gray.500", "gray.400")} fontStyle="italic">
                    Discussion feature coming soon. Share your approach with the community!
                </Text>
            </Box>
        );
    }

    if (activeTab === 2) {
        return (
            <Box>
                <Text color={useColorModeValue("gray.500", "gray.400")} fontStyle="italic">
                    Your previous submissions will appear here after you submit solutions.
                </Text>
            </Box>
        );
    }

    const colorValues = {
        gray800_100: useColorModeValue("gray.800", "gray.100"),
        gray600_300: useColorModeValue("gray.600", "gray.300"),
        gray500_400: useColorModeValue("gray.500", "gray.400"),
        gray200_700: useColorModeValue("gray.200", "gray.700"),
        gray50_800: useColorModeValue("gray.50", "gray.800"),
    };

    return React.useMemo(() => (
        <VStack spacing={6} align="stretch">
            {/* Header badges & meta */}
            <Box>
                <HStack spacing={3} mb={4}>
                    <Badge
                        bg={diffMeta.hex}
                        color={selectedChallenge.difficulty === 'HARD' || selectedChallenge.difficulty === 'EXPERT' ? 'white' : '#0f172a'}
                        fontSize="xs"
                        fontWeight="bold"
                        px={3}
                        py={1}
                        borderRadius="8px"
                    >
                        {diffMeta.label.toUpperCase()}
                    </Badge>
                    {selectedChallenge.tags.map(tag => (
                        <Tag key={tag} bg="var(--color-tag-bg)" color={colorValues.gray600_300} size="sm" borderRadius="8px" fontSize="xs">
                            {tag}
                        </Tag>
                    ))}
                </HStack>

                <Text fontFamily="heading" fontSize="3xl" fontWeight="bold" color={colorValues.gray800_100} mb={3}>
                    {selectedChallenge.title}
                </Text>

                <HStack spacing={6} fontSize="sm" color={colorValues.gray500_400}>
                    <Flex align="center" gap={2}>
                        <StarIcon w={4} h={4} color="yellow.400" />
                        <Text>+{selectedChallenge.xpReward} XP Reward</Text>
                    </Flex>
                    <Text>
                        Acceptance: <Text as="strong" color={colorValues.gray800_100}>{selectedChallenge.acceptanceRate}%</Text>
                    </Text>
                </HStack>
            </Box>

            <Divider borderColor={colorValues.gray200_700} />

            {/* Problem statement */}
            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={colorValues.gray800_100} mb={3}>
                    Problem Statement
                </Text>
                {selectedChallenge.description.split('\n').filter(Boolean).map((para, i) => (
                    <Text key={i} color={colorValues.gray600_300} lineHeight="1.8" mb={3}>
                        {para.split('`').map((segment, j) =>
                            j % 2 === 1 ? (
                                <Code
                                    key={j}
                                    bg={colorValues.gray50_800}
                                    px={2}
                                    py={0.5}
                                    borderRadius="md"
                                    color="brand.500"
                                    fontSize="sm"
                                >
                                    {segment}
                                </Code>
                            ) : (
                                <React.Fragment key={j}>{segment}</React.Fragment>
                            )
                        )}
                    </Text>
                ))}
            </Box>

            {/* Examples */}
            {selectedChallenge.examples.map((ex, i) => (
                <Box key={i}>
                    <Text fontFamily="heading" fontWeight="bold" color={colorValues.gray800_100} mb={3}>
                        Example {i + 1}
                    </Text>
                    <Box bg="var(--color-bg-secondary)" borderRadius="12px" p={4} fontFamily="mono" fontSize="sm">
                        <Box mb={2}>
                            <Text as="span" color={colorValues.gray500_400}>Input: </Text>
                            <Text as="span" color={colorValues.gray800_100}>{ex.input}</Text>
                        </Box>
                        <Box mb={ex.explanation ? 2 : 0}>
                            <Text as="span" color={colorValues.gray500_400}>Output: </Text>
                            <Text as="span" color={colorValues.gray800_100}>{ex.output}</Text>
                        </Box>
                        {ex.explanation && (
                            <Box>
                                <Text as="span" color={colorValues.gray500_400}>Explanation: </Text>
                                <Text as="span" color={colorValues.gray600_300}>{ex.explanation}</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}

            {/* Constraints */}
            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={colorValues.gray800_100} mb={3}>
                    Constraints
                </Text>
                <VStack spacing={2} align="stretch">
                    {selectedChallenge.constraints.map((c, i) => (
                        <Flex key={i} align="flex-start" gap={2}>
                            <Text color="brand.500" mt="2px">•</Text>
                            {c.includes('<=') || c.includes('==') ? (
                                <Code bg={colorValues.gray50_800} px={2} py={1} borderRadius="md" color="brand.500" fontSize="sm">
                                    {c}
                                </Code>
                            ) : (
                                <Text color={colorValues.gray600_300}>{c}</Text>
                            )}
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {/* Hints */}
            {selectedChallenge.hints?.length > 0 && (
                <Box>
                    <Text fontFamily="heading" fontWeight="bold" color={colorValues.gray800_100} mb={3}>
                        Hints
                    </Text>
                    <VStack spacing={2} align="stretch">
                        {selectedChallenge.hints.map((hint, i) => (
                            <Box key={i} bg="var(--color-bg-secondary)" borderRadius="12px" overflow="hidden">
                                <Button
                                    w="full"
                                    justifyContent="flex-start"
                                    variant="unstyled"
                                    px={4}
                                    py={3}
                                    fontWeight="semibold"
                                    color={colorValues.gray600_300}
                                    _hover={{ color: 'brand.500' }}
                                    onClick={() => toggleHint(i)}
                                    transition="color 0.2s"
                                >
                                    Hint {i + 1}
                                </Button>
                                <Collapse in={!!openHints[i]}>
                                    <Box px={4} pb={3}>
                                        <Text color={colorValues.gray500_400} fontSize="sm" lineHeight="1.6">
                                            {hint}
                                        </Text>
                                    </Box>
                                </Collapse>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}
        </VStack>
    ), [
        selectedChallenge,
        diffMeta,
        openHints,
        colorValues.gray800_100,
        colorValues.gray600_300,
        colorValues.gray500_400,
        colorValues.gray200_700,
        colorValues.gray50_800
    ]);
};

export default ProblemDescription;
