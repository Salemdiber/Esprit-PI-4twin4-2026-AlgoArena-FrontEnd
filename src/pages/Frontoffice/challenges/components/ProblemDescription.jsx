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
    keyframes,
} from '@chakra-ui/react';
import { TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useChallengeContext } from '../context/ChallengeContext';
import { DIFFICULTY_META } from '../data/mockChallenges';
import CodeEditor from '../../../../editor/components/CodeEditor';

const StarIcon = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </Icon>
);

// ---------------------------------------------------------------------------
// Complexity-source presentation
// ---------------------------------------------------------------------------
// Three sources can produce a Big-O label on a submission:
//   'ml-model' = XGBoost CodeComplex prediction served by the Python service.
//                We show a *premium* card treatment (gradient border, animated
//                top-bar, SVG confidence ring) to reflect that this came from
//                the trained model and not a generic LLM guess.
//   'ai'       = LLM-derived estimate from the judge's AIAnalysisService.
//   'unknown'  = neither path produced a value (e.g. syntax error).
// ---------------------------------------------------------------------------

// Subtle pulsing glow on the ML accent bar — runs forever but at 6s cycle so
// it reads as "alive" without being distracting.
const mlPulseAnim = keyframes`
    0%   { background-position:   0% 50%; opacity: 0.85; }
    50%  { background-position: 100% 50%; opacity: 1;    }
    100% { background-position:   0% 50%; opacity: 0.85; }
`;

// Tiny "neural node" icon used as the ML attribution glyph. Three connected
// circles -> evokes a neural net without screaming "AI".
const NeuralIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <circle cx="5" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="12" r="2" />
        <line x1="7" y1="6" x2="17" y2="11" />
        <line x1="7" y1="18" x2="17" y2="13" />
    </Icon>
);

/**
 * Circular confidence indicator. SVG ring whose stroke-dashoffset reflects
 * the model's top-class probability, with the percentage rendered at the
 * centre. Color shifts from amber (low) -> purple (high) so the user can
 * eyeball confidence at a glance.
 */
const ConfidenceRing = ({ value, size = 44, stroke = 4 }) => {
    const safe = Math.max(0, Math.min(1, Number(value) || 0));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - safe);
    const color = safe >= 0.85 ? '#9F7AEA' : safe >= 0.6 ? '#B794F4' : '#F6AD55';
    return (
        <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="rgba(159,122,234,0.18)"
                    strokeWidth={stroke}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <Box
                position="absolute"
                inset={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                lineHeight={1}
            >
                <Text fontSize="0.7rem" fontWeight="bold" color={color}>
                    {Math.round(safe * 100)}
                </Text>
                <Text fontSize="0.5rem" color="gray.500" fontWeight="semibold">
                    %
                </Text>
            </Box>
        </Box>
    );
};

/**
 * One stat card for a complexity dimension (time or space). Adapts its
 * presentation based on `source`:
 *   - ml-model: gradient frame + animated top-bar + confidence ring + footer
 *   - ai      : flat card with a small "AI estimate" tag at the bottom
 *   - unknown : flat card with a muted "No analysis" tag
 *
 * Solves the responsive overflow bug that the previous design had: the
 * source attribution is no longer crammed into the StatLabel HStack — it
 * lives in its own row, so narrow viewports stop wrapping the badge text
 * across two lines and pushing the value off-card.
 */
const ComplexityStat = ({ label, value, icon, source, confidence, modelVersion, reasoning, t }) => {
    const isMl = source === 'ml-model';
    const isAi = source === 'ai';
    const valueColor = useColorModeValue('gray.800', 'white');
    const labelColor = useColorModeValue('gray.500', 'gray.400');
    const footerColor = useColorModeValue('purple.600', 'purple.200');

    const tooltip = isMl
        ? t(
              'challengePage.complexitySourceMlModelTooltip',
              `Predicted by ${modelVersion || 'XGBoost CodeComplex'} model. Confidence reflects the probability assigned to the chosen Big-O class.`,
          )
        : isAi
            ? t(
                  'challengePage.complexitySourceAiTooltip',
                  'Estimated by the LLM judge from the submitted code and test results.',
              )
            : '';

    return (
        <Box
            position="relative"
            bg={isMl ? 'var(--color-bg-card)' : 'var(--color-bg-secondary)'}
            borderRadius="lg"
            border="1px solid"
            borderColor={isMl ? 'rgba(159,122,234,0.45)' : 'var(--color-border)'}
            overflow="hidden"
            p={3}
            pt={isMl ? 4 : 3}
            transition="transform 0.18s ease, box-shadow 0.18s ease"
            boxShadow={isMl ? '0 0 0 1px rgba(159,122,234,0.15), 0 6px 18px -8px rgba(159,122,234,0.35)' : 'none'}
            _hover={{
                transform: 'translateY(-2px)',
                boxShadow: isMl
                    ? '0 0 0 1px rgba(159,122,234,0.35), 0 14px 28px -10px rgba(159,122,234,0.55)'
                    : 'md',
            }}
        >
            {isMl && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="3px"
                    backgroundImage="linear-gradient(90deg, #9F7AEA, #ED64A6, #4FD1C5, #9F7AEA)"
                    backgroundSize="300% 100%"
                    animation={`${mlPulseAnim} 6s ease-in-out infinite`}
                />
            )}

            {/* Header row: label on the left, optional ML glyph on the right. */}
            <HStack justify="space-between" align="flex-start" spacing={2} mb={1} minW={0}>
                <HStack spacing={1.5} minW={0}>
                    {icon}
                    <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={labelColor}
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        noOfLines={1}
                    >
                        {label}
                    </Text>
                </HStack>
                {isMl && (
                    <Tooltip label={tooltip} hasArrow placement="top">
                        <Box>
                            <NeuralIcon boxSize={4} color="purple.300" />
                        </Box>
                    </Tooltip>
                )}
            </HStack>

            {/* Value + (for ML) confidence ring sit on the same row so the */}
            {/* big-O number stays the visual anchor regardless of source.   */}
            <HStack justify="space-between" align="center" spacing={3} minW={0}>
                <Text
                    fontFamily="mono"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="bold"
                    color={valueColor}
                    noOfLines={1}
                    minW={0}
                    flex="1"
                >
                    {value}
                </Text>
                {isMl && Number.isFinite(confidence) && (
                    <Tooltip
                        label={t(
                            'challengePage.complexitySourceMlModelConfidence',
                            `${Math.round(confidence * 100)}% confidence in this prediction`,
                        )}
                        hasArrow
                        placement="top"
                    >
                        <Box>
                            <ConfidenceRing value={confidence} />
                        </Box>
                    </Tooltip>
                )}
            </HStack>

            {/* Footer / attribution. Always rendered so cards stay the same */}
            {/* height across the grid — easier on the eye than jagged rows.  */}
            <Box mt={2}>
                {isMl ? (
                    <VStack spacing={1} align="stretch">
                        <HStack spacing={1.5} fontSize="0.65rem" color={footerColor} fontWeight="semibold">
                            <NeuralIcon boxSize={3} />
                            <Text noOfLines={1} letterSpacing="0.03em">
                                {t('challengePage.complexitySourceMlFooter', 'Predicted by AlgoArena · CodeAnalyser')}
                            </Text>
                        </HStack>
                        {/* Inline justification when the deterministic
                            pattern-rule layer of the analyser fired
                            (e.g. expand-around-centers palindrome).
                            Empty for plain XGBoost predictions, in
                            which case the footer stands alone. */}
                        {reasoning ? (
                            <Tooltip label={reasoning} hasArrow placement="top">
                                <Text
                                    fontSize="0.6rem"
                                    color={footerColor}
                                    fontStyle="italic"
                                    noOfLines={2}
                                    lineHeight="1.25"
                                >
                                    {reasoning}
                                </Text>
                            </Tooltip>
                        ) : null}
                    </VStack>
                ) : isAi ? (
                    <Tag size="sm" colorScheme="blue" borderRadius="full" fontSize="0.65rem">
                        {t('challengePage.complexitySourceAi', 'AI estimate')}
                    </Tag>
                ) : (
                    <Tag size="sm" colorScheme="gray" borderRadius="full" fontSize="0.65rem" variant="subtle">
                        {t('challengePage.complexitySourceUnknown', 'No analysis')}
                    </Tag>
                )}
            </Box>
        </Box>
    );
};

const SubmissionMetrics = ({ submission, t }) => {
    const detectColor = submission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green';
    const complexitySource = submission.complexitySource || 'unknown';
    return (
        <VStack align="stretch" spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><TimeIcon /><Text>{t('challengePage.executionTime')}</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.executionTime || '0ms'}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><InfoIcon /><Text>{t('challengePage.memory')}</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.memoryAllocated || t('challengePage.notAvailable')}</StatNumber>
                </Stat>
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel><HStack spacing={1}><TimeIcon /><Text>{t('challengePage.loadTime')}</Text></HStack></StatLabel>
                    <StatNumber fontSize="lg">{submission.loadTime || '0ms'}</StatNumber>
                </Stat>
                <ComplexityStat
                    label={t('challengePage.timeComplexity')}
                    value={submission.timeComplexity || t('challengePage.unknown')}
                    source={complexitySource}
                    confidence={submission.complexityConfidence}
                    modelVersion={submission.complexityModelVersion}
                    reasoning={submission.complexityReasoning}
                    t={t}
                />
                <ComplexityStat
                    label={t('challengePage.spaceComplexity')}
                    value={submission.spaceComplexity || t('challengePage.unknown')}
                    source={complexitySource}
                    confidence={submission.complexityConfidence}
                    modelVersion={submission.complexityModelVersion}
                    reasoning={submission.complexityReasoning}
                    t={t}
                />
                <Stat bg="var(--color-bg-secondary)" p={3} borderRadius="lg" border="1px solid" borderColor="var(--color-border)">
                    <StatLabel>{t('challengePage.solveTime')}</StatLabel>
                    <StatNumber fontSize="lg">{submission.solveTimeSeconds != null ? `${submission.solveTimeSeconds}s` : t('challengePage.na')}</StatNumber>
                </Stat>
            </SimpleGrid>

            <HStack spacing={2}>
                <Badge colorScheme={submission.passed ? 'green' : 'red'} px={2} py={1} borderRadius="md">
                    {submission.passed ? t('challengePage.accepted') : t('challengePage.failed')}
                </Badge>
                <Badge colorScheme={detectColor} px={2} py={1} borderRadius="md">
                    {submission.aiDetection === 'AI_SUSPECTED' ? t('challengePage.aiSuspected') : t('challengePage.manual')}
                </Badge>
                <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                    {t('challengePage.testsCountBadge', { passed: submission.passedCount, total: submission.total })}
                </Badge>
            </HStack>
        </VStack>
    );
};

const ProblemDescription = () => {
    const { t } = useTranslation();
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

    const gray800_100 = useColorModeValue('gray.800', 'white');
    const gray600_300 = useColorModeValue('gray.600', 'gray.300');
    const gray500_400 = useColorModeValue('gray.500', 'gray.400');
    const gray200_700 = useColorModeValue('gray.200', 'gray.700');
    const gray50_800 = useColorModeValue('gray.50', 'gray.800');
    const xpBadgeBg = useColorModeValue('rgba(250, 204, 21, 0.12)', 'rgba(250, 204, 21, 0.08)');
    const xpBadgeColor = useColorModeValue('yellow.600', 'yellow.400');
    const solvedBadgeColor = useColorModeValue('green.600', 'green.300');

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
                        {t('challengePage.submissionPlaceholder')}
                    </Text>
                ) : (
                    <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                        <CardBody>
                            <VStack align="stretch" spacing={5}>
                                <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
                                    <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={gray800_100}>
                                        {t('challengePage.latestSubmission')}
                                    </Text>
                                    <HStack spacing={2}>
                                        <Tag colorScheme="cyan" size="sm">{latestSubmission.language}</Tag>
                                        <Tooltip label="AI-generated detection verdict from judge">
                                            <Tag colorScheme={latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green'} size="sm">
                                                {latestSubmission.aiDetection === 'AI_SUSPECTED' ? t('challengePage.aiSuspected') : t('challengePage.manual')}
                                            </Tag>
                                        </Tooltip>
                                    </HStack>
                                </Flex>

                                <SubmissionMetrics submission={latestSubmission} t={t} />

                                <Divider borderColor={gray200_700} />

                                <Box>
                                    <Text mb={2} fontWeight="semibold" color={gray800_100}>{t('challengePage.submittedCode')}</Text>
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
                                        <Text fontWeight="semibold" mb={2} color={gray800_100}>{t('challengePage.aiRecommendations')}</Text>
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
                            {t('challengePage.aiJudgeAnalysis')}
                        </Text>
                        {latestSubmission?.aiAnalysis || judgeAnalysis ? (
                            <Text whiteSpace="pre-wrap" fontSize="sm" lineHeight="1.8" color={gray600_300}>
                                {latestSubmission?.aiAnalysis || judgeAnalysis}
                            </Text>
                        ) : (
                            <Text color={gray500_400} fontStyle="italic">
                                {t('challengePage.aiAnalysisPlaceholder')}
                            </Text>
                        )}
                    </CardBody>
                </Card>

                {latestSubmission && (
                    <Card bg="var(--color-bg-card)" border="1px solid" borderColor="var(--color-border)">
                        <CardBody>
                            <Text fontWeight="semibold" mb={3} color={gray800_100}>{t('challengePage.aiDetectionComplexity')}</Text>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                                <Tag colorScheme={latestSubmission.aiDetection === 'AI_SUSPECTED' ? 'orange' : 'green'} w="fit-content">
                                    {latestSubmission.aiDetection === 'AI_SUSPECTED' ? t('challengePage.aiSuspected') : t('challengePage.manual')}
                                </Tag>
                                <Tag colorScheme="blue" w="fit-content">{t('challengePage.timeLabel', { value: latestSubmission.timeComplexity || t('challengePage.unknown') })}</Tag>
                                <Tag colorScheme="purple" w="fit-content">{t('challengePage.spaceLabel', { value: latestSubmission.spaceComplexity || t('challengePage.unknown') })}</Tag>
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
                            {t('challengePage.aiHints')}
                        </Text>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="brand"
                            isDisabled={!hintAvailable}
                            onClick={requestHint}
                        >
                            {t('challengePage.requestAiHint')}
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
                                ? t('challengePage.hintAvailableNow')
                                : t('challengePage.hintLockedDesc')}
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
                        bg={diffMeta.hex || diffMeta.color}
                        color={selectedChallenge.difficulty === 'HARD' || selectedChallenge.difficulty === 'EXPERT' ? 'white' : useColorModeValue('gray.800', 'gray.900')}
                        fontSize="xs"
                        fontWeight="bold"
                        px={3}
                        py={1}
                        borderRadius="8px"
                    >
                        {diffMeta.label.toUpperCase()}
                    </Badge>
                    {selectedChallenge.tags.map((tag) => (
                        <Tag 
                            key={tag} 
                            bg={useColorModeValue('gray.100', 'rgba(255,255,255,0.06)')} 
                            color={gray600_300} 
                            size="sm" 
                            borderRadius="8px" 
                            fontSize="xs"
                            border="1px solid"
                            borderColor={useColorModeValue('gray.200', 'transparent')}
                        >
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
                        <Text>{t('challengePage.xpRewardLabel', { xp: selectedChallenge.xpReward })}</Text>
                    </Flex>
                    <Text>
                        {t('challengePage.acceptanceLabel')} <Text as="strong" color={gray800_100}>{selectedChallenge.acceptanceRate}%</Text>
                    </Text>
                </HStack>
            </Box>

            <Divider borderColor={gray200_700} />

            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                    {t('challengePage.problemStatement')}
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
                                    color={useColorModeValue('brand.600', 'cyan.400')}
                                    fontSize="sm"
                                    fontWeight="600"
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
                        {t('challengePage.exampleN', { n: i + 1 })}
                    </Text>
                    <Box bg="var(--color-bg-secondary)" borderRadius="12px" p={4} fontFamily="mono" fontSize="sm">
                        <Box mb={2}>
                            <Text as="span" color={gray500_400}>{t('challengePage.inputLabel')} </Text>
                            <Text as="span" color={gray800_100}>{ex.input}</Text>
                        </Box>
                        <Box mb={ex.explanation ? 2 : 0}>
                            <Text as="span" color={gray500_400}>{t('challengePage.outputLabel')} </Text>
                            <Text as="span" color={gray800_100}>{ex.output}</Text>
                        </Box>
                        {ex.explanation && (
                            <Box>
                                <Text as="span" color={gray500_400}>{t('challengePage.explanationLabel')} </Text>
                                <Text as="span" color={gray600_300}>{ex.explanation}</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}

            <Box>
                <Text fontFamily="heading" fontWeight="bold" color={gray800_100} mb={3}>
                    {t('challengePage.constraints')}
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
                        {t('challengePage.hints')}
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
                                    {t('challengePage.hintN', { n: i + 1 })}
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
