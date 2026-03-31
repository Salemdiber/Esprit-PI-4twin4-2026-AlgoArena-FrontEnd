/**
 * ProblemDescription - renders description, submissions and AI judge panels.
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
    Alert,
    AlertIcon,
    useColorModeValue,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    SimpleGrid,
    Tooltip,
    List,
    ListItem,
} from '@chakra-ui/react';
import { TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META } from '../data/mockChallenges';
import { CodeEditor } from '../../../../editor';

const StarIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </Icon>
);

const SubmissionMetrics = ({ submission }) => {
    const detectColor = submission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green';
    return (
        <VStack align="stretch" spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><TimeIcon /><Text>Execution Time</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.executionTime || '0ms'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><InfoIcon /><Text>Memory</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.memoryAllocated || 'Not available'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><TimeIcon /><Text>Load Time</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.loadTime || '0ms'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel>Time Complexity</StatLabel>
                    <StatNumber fontSize="lg">{submission.timeComplexity || 'Unknown'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel>Space Complexity</StatLabel>
                    <StatNumber fontSize="lg">{submission.spaceComplexity || 'Unknown'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel>Solve Time</StatLabel>
                    <StatNumber fontSize="lg">{submission.solveTimeSeconds != null ? `${submission.solveTimeSeconds}s` : 'N/A'}</StatNumber>
                </Stat>
            </SimpleGrid>

            <HStack spacing={2}>
                <Badge colorScheme={submission.passed ? 'green' : 'red'} px={2} py={1} borderRadius="md">
                    {submission.passed ? 'Accepted' : 'Failed'}
                </Badge>
                <Badge colorScheme={detectColor} px={2} py={1} borderRadius="md">
                    {submission.aiDetection === 'AI_SUSPECTED' ? 'AI Suspected' : 'Manual'}
                </Badge>
                <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                    {submission.passedCount}/{submission.total} Tests
                </Badge>
            </HStack>
        </VStack>
    );
};

const ProblemDescription = () => {
    const {
        selectedChallenge,
        selectedChallengeId,
        activeTab,
        judgeAnalysis,
        integrityNotice,
        hint,
        requestHint,
        hintAvailable,
        currentSubmission,
        submissionHistoryByChallenge,
    } = useChallengeContext();

    const [openHints, setOpenHints] = useState({});

    const gray800_100 = useColorModeValue('gray.800', 'gray.100');
    const gray600_300 = useColorModeValue('gray.600', 'gray.300');
    const gray500_400 = useColorModeValue('gray.500', 'gray.400');
    const gray200_700 = useColorModeValue('gray.200', 'gray.700');
    const gray50_800 = useColorModeValue('gray.50', 'gray.800');

    if (!selectedChallenge) return null;

    const diffMeta = DIFFICULTY_META[selectedChallenge.difficulty];
    const challengeSubmissions = submissionHistoryByChallenge[selectedChallengeId] || [];
    const latestSubmission = currentSubmission || (challengeSubmissions.length ? challengeSubmissions[challengeSubmissions.length - 1] : null);

    const toggleHint = (idx) => {
        setOpenHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (activeTab === 1) {
        return (
            <VStack align="stretch" spacing={4}>
                {!latestSubmission ? (
                    <Text color={gray500_400} fontStyle="italic">
                        Your submission details will appear here after you submit a solution.
                    </Text>
                ) : (
                    <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                        <CardBody>
                            <VStack align="stretch" spacing={5}>
                                <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
                                    <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={gray800_100}>
                                        Latest Submission
                                    </Text>
                                    <HStack spacing={2}>
                                        <Tag colorScheme="cyan" size="sm">{latestSubmission.language}</Tag>
                                        <Tooltip label="AI-generated detection verdict from judge">
                                            <Tag colorScheme={latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green'} size="sm">
                                                {latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'AI Suspected' : 'Manual'}
                                            </Tag>
                                        </Tooltip>
                                    </HStack>
                                </Flex>

                                <SubmissionMetrics submission={latestSubmission} />

                                <Divider borderColor={gray200_700} />

                                <Box>
                                    <Text mb={2} fontWeight="semibold" color={gray800_100}>Submitted Code</Text>
                                    <Box border="1px solid" borderColor="var(--color-border)" borderRadius="lg" overflow="hidden" h="320px">
                                        <CodeEditor
                                            code={latestSubmission.code || ''}
                                            language={latestSubmission.language || 'javascript'}
                                            readOnly
                                            height="100%"
                                            options={{ minimap: { enabled: false }, fontSize: 13, wordWrap: 'on' }}
                                        />
                                    </Box>
                                </Box>

                                {Array.isArray(latestSubmission.recommendations) && latestSubmission.recommendations.length > 0 && (
                                    <Box>
                                        <Text fontWeight="semibold" mb={2} color={gray800_100}>AI Recommendations</Text>
                                        <List spacing={2}>
                                            {latestSubmission.recommendations.map((item, index) => (
                                                <ListItem key={`${item}-${index}`} fontSize="sm" color={gray600_300}>
                                                    • {item}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                )}
            </VStack>
        );
    }

    if (activeTab === 2) {
        return (
            <VStack spacing={6} align="stretch">
                <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                    <CardBody>
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color={gray800_100} mb={4}>
                            AI Judge Analysis
                        </Text>
                        {latestSubmission?.aiAnalysis || judgeAnalysis ? (
                            <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="1.8" color={gray600_300}>
                                {latestSubmission?.aiAnalysis || judgeAnalysis}
                            </Text>
                        ) : (
                            <Text color={gray500_400} fontStyle="italic">
                                AI analysis will appear here after submission.
                            </Text>
                        )}
                    </CardBody>
                </Card>

                {latestSubmission && (
                    <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                        <CardBody>
                            <Text fontWeight="semibold" mb={3} color={gray800_100}>AI Detection & Complexity</Text>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                <Tag colorScheme={latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green'} w="fit-content">
                                    {latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'AI Suspected' : 'Manual'}
                                </Tag>
                                <Tag colorScheme="blue" w="fit-content">Time: {latestSubmission.timeComplexity || 'Unknown'}</Tag>
                                <Tag colorScheme="purple" w="fit-content">Space: {latestSubmission.spaceComplexity || 'Unknown'}</Tag>
                            </SimpleGrid>
                        </CardBody>
                    </Card>
                )}

                {integrityNotice && (
                    <Alert status="warning" borderRadius="lg">
                        <AlertIcon />
                        {integrityNotice}
                    </Alert>
                )}

                <Divider borderColor={gray200_700} />

                <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontFamily="heading" fontWeight="bold" color={gray800_100}>
                            AI Hints
                        </Text>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="brand"
                            isDisabled={!hintAvailable}
                            onClick={requestHint}
                        >
                            Request AI Hint
                        </Button>
                    </Flex>
                    {hint ? (
                        <Alert status="info" borderRadius="12px" mt={2}>
                            <AlertIcon />
                            <Box fontSize="sm" color={gray800_100}>{hint}</Box>
                        </Alert>
                    ) : (
                        <Text color={gray500_400} fontSize="xs">
                            {hintAvailable
                                ? 'You can request a hint now.'
                                : 'Hints unlock after enough time or failed attempts.'}
                        </Text>
                    )}
                </Box>
            </VStack>
        );
    }

    return (
        <VStack spacing={6} align="stretch">
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
                    {selectedChallenge.tags.map((tag) => (
                        <Tag key={tag} bg="var(--color-tag-bg)" color={gray600_300} size="sm" borderRadius="8px" fontSize="xs">
                            {tag}
                        </Tag>
                    ))}
                </HStack>

                <Text fontFamily="heading" fontSize="3xl" fontWeight="bold" color={gray800_100} mb={3}>
                    {selectedChallenge.title}
                </Text>

                <HStack spacing={6} fontSize="sm" color={gray500_400}>
                    <Flex align="center" gap={2}>
                        <StarIcon w={4} h={4} color="yellow.400" />
                        <Text>+{selectedChallenge.xpReward} XP Reward</Text>
                    </Flex>
                    <Text>
                        Acceptance: <Text as="strong" color={gray800_100}>{selectedChallenge.acceptanceRate}%</Text>
                    </Text>
                </HStack>
            </Box>

            <Divider borderColor={gray200_700} />

            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                    Problem Statement
                </Text>
                {selectedChallenge.description.split('\n').filter(Boolean).map((para, i) => (
                    <Text key={i} color={gray600_300} lineHeight="1.8" mb={3}>
                        {para.split('`').map((segment, j) =>
                            j % 2 === 1 ? (
                                <Code
                                    key={j}
                                    bg={gray50_800}
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
                            ))}
                    </Text>
                ))}
            </Box>

            {selectedChallenge.examples.map((ex, i) => (
                <Box key={i}>
                    <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                        Example {i + 1}
                    </Text>
                    <Box bg="var(--color-bg-secondary)" borderRadius="12px" p={4} fontFamily="mono" fontSize="sm">
                        <Box mb={2}>
                            <Text as="span" color={gray500_400}>Input: </Text>
                            <Text as="span" color={gray800_100}>{ex.input}</Text>
                        </Box>
                        <Box mb={ex.explanation ? 2 : 0}>
                            <Text as="span" color={gray500_400}>Output: </Text>
                            <Text as="span" color={gray800_100}>{ex.output}</Text>
                        </Box>
                        {ex.explanation && (
                            <Box>
                                <Text as="span" color={gray500_400}>Explanation: </Text>
                                <Text as="span" color={gray600_300}>{ex.explanation}</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}

            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                    Constraints
                </Text>
                <VStack spacing={2} align="stretch">
                    {selectedChallenge.constraints.map((c, i) => (
                        <Flex key={i} align="flex-start" gap={2}>
                            <Text color="brand.500" mt="2px">•</Text>
                            {c.includes('<=') || c.includes('==') ? (
                                <Code bg={gray50_800} px={2} py={1} borderRadius="md" color="brand.500" fontSize="sm">
                                    {c}
                                </Code>
                            ) : (
                                <Text color={gray600_300}>{c}</Text>
                            )}
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {selectedChallenge.hints?.length > 0 && (
                <Box>
                    <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                        Hints
                    </Text>
                    <VStack spacing={2} align="stretch">
                        {selectedChallenge.hints.map((h, i) => (
                            <Box key={i} bg="var(--color-bg-secondary)" borderRadius="12px" overflow="hidden">
                                <Button
                                    w="full"
                                    justifyContent="flex-start"
                                    variant="unstyled"
                                    px={4}
                                    py={3}
                                    fontWeight="semibold"
                                    color={gray600_300}
                                    _hover={{ color: 'brand.500' }}
                                    onClick={() => toggleHint(i)}
                                    transition="color 0.2s"
                                >
                                    Hint {i + 1}
                                </Button>
                                <Collapse in={!!openHints[i]}>
                                    <Box px={4} pb={3}>
                                        <Text color={gray500_400} fontSize="sm" lineHeight="1.6">
                                            {h}
                                        </Text>
                                    </Box>
                                </Collapse>
                            </Box>
                        ))}
                    </VStack>
                </Box>
            )}
        </VStack>
    );
};

export default ProblemDescription;
