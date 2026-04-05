import React from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';

/** Renders markdown-ish description (bold backtick words, newlines) */
const RenderDescription = ({ text }) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return (
        <Text as="span" color="gray.300" fontSize="sm" lineHeight="1.8">
            {parts.map((part, i) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <Box
                            key={i}
                            as="code"
                            px="5px"
                            py="1px"
                            mx="2px"
                            bg="rgba(34,211,238,0.1)"
                            border="1px solid rgba(34,211,238,0.2)"
                            borderRadius="4px"
                            fontFamily="mono"
                            fontSize="xs"
                            color="#22d3ee"
                        >
                            {part.slice(1, -1)}
                        </Box>
                    );
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <Text key={i} as="strong" fontWeight="bold" color="white">
                            {part.slice(2, -2)}
                        </Text>
                    );
                }
                return part.split('\n').map((line, li) => (
                    <React.Fragment key={li}>
                        {li > 0 && <br />}
                        {line}
                    </React.Fragment>
                ));
            })}
        </Text>
    );
};

const SpeedProblemPanel = ({ problem }) => {
    if (!problem) return null;

    return (
        <VStack
            align="stretch"
            spacing={5}
            p={6}
            h="100%"
            overflowY="auto"
            sx={{
                '&::-webkit-scrollbar': { width: '5px' },
                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                '&::-webkit-scrollbar-thumb': { bg: '#334155', borderRadius: '3px' },
            }}
        >
            {/* Header */}
            <Box>
                <HStack spacing={3} mb={2} flexWrap="wrap">
                    <Box
                        px={3}
                        py={0.5}
                        borderRadius="6px"
                        border="1px solid"
                        borderColor={`${problem.difficultyColor}55`}
                        bg={`${problem.difficultyColor}15`}
                        fontSize="xs"
                        fontWeight="bold"
                        fontFamily="mono"
                        color={problem.difficultyColor}
                        letterSpacing="0.06em"
                    >
                        {problem.difficulty}
                    </Box>
                    <Text fontSize="xs" color="gray.500" fontFamily="mono">
                        Problem {problem.index} / 3
                    </Text>
                    <Box ml="auto">
                        <HStack spacing={1}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <Text fontSize="xs" color="yellow.400" fontWeight="semibold">
                                +{problem.xpReward} XP
                            </Text>
                        </HStack>
                    </Box>
                </HStack>
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="white"
                    fontFamily="heading"
                    lineHeight="1.3"
                >
                    {problem.title}
                </Text>
            </Box>

            {/* Description */}
            <Box>
                <RenderDescription text={problem.description} />
            </Box>

            {/* Examples */}
            <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
                    Examples
                </Text>
                <VStack align="stretch" spacing={3}>
                    {problem.examples.map((ex, i) => (
                        <Box
                            key={i}
                            borderRadius="10px"
                            border="1px solid rgba(255,255,255,0.06)"
                            bg="rgba(15,23,42,0.7)"
                            overflow="hidden"
                        >
                            <Box px={4} py={3} borderBottom="1px solid rgba(255,255,255,0.04)">
                                <Text fontSize="xs" color="gray.500" mb={1} fontFamily="mono">Input:</Text>
                                <Text fontSize="sm" fontFamily="mono" color="cyan.300">{ex.input}</Text>
                            </Box>
                            <Box px={4} py={3} borderBottom={ex.explanation ? "1px solid rgba(255,255,255,0.04)" : "none"}>
                                <Text fontSize="xs" color="gray.500" mb={1} fontFamily="mono">Output:</Text>
                                <Text fontSize="sm" fontFamily="mono" color="green.300">{ex.output}</Text>
                            </Box>
                            {ex.explanation && (
                                <Box px={4} py={3}>
                                    <Text fontSize="xs" color="gray.500" mb={1}>Explanation:</Text>
                                    <Text fontSize="xs" color="gray.400" lineHeight="1.6">{ex.explanation}</Text>
                                </Box>
                            )}
                        </Box>
                    ))}
                </VStack>
            </Box>

            {/* Constraints */}
            <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
                    Constraints
                </Text>
                <VStack align="stretch" spacing={1.5}>
                    {problem.constraints.map((c, i) => (
                        <HStack key={i} spacing={2} align="flex-start">
                            <Box
                                w="5px"
                                h="5px"
                                borderRadius="full"
                                bg="#22d3ee"
                                mt="7px"
                                flexShrink={0}
                                opacity={0.7}
                            />
                            <Text fontSize="xs" fontFamily="mono" color="gray.400" lineHeight="1.6">
                                {c}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Box>

            {/* Test cases preview */}
            <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
                    Test Cases
                </Text>
                <VStack align="stretch" spacing={2}>
                    {problem.testCases.map((tc, i) => (
                        <HStack
                            key={i}
                            spacing={3}
                            p={3}
                            borderRadius="8px"
                            bg="rgba(15,23,42,0.5)"
                            border="1px solid rgba(255,255,255,0.05)"
                        >
                            <Text fontSize="10px" fontFamily="mono" color="gray.600" minW="16px">
                                #{i + 1}
                            </Text>
                            <Text fontSize="xs" fontFamily="mono" color="gray.400" flex={1} isTruncated>
                                {tc.input}
                            </Text>
                            <Text fontSize="xs" fontFamily="mono" color="green.400">
                                → {tc.expected}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

export default SpeedProblemPanel;
