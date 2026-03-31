import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Grid,
    GridItem,
    VStack,
    HStack,
    Select,
    Tag,
    Code,
    Badge,
    Avatar,
    Divider,
    useColorModeValue,
    Spinner,
} from '@chakra-ui/react';
import { CodeEditor, useEditorState } from '../editor';
import playgroundChallengesService from '../services/playgroundChallengesService';
import { apiClient } from '../services/apiClient';
import useLanguage from '../hooks/useLanguage';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const Arena = () => {
    const { t } = useLanguage();
    // ===== ALL HOOKS AT THE TOP (RULES OF HOOKS) =====
    const [mode, setMode] = useState('ai');
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState([]);

    const { code, setCode, language, setLanguage } = useEditorState();

    // ===== COLOR MODE VALUES (ALL AT ONCE) =====
    const bgPrimary = useColorModeValue("white", "gray.900");
    const bgSecondary = useColorModeValue("gray.50", "gray.800");
    const textPrimary = useColorModeValue("gray.800", "gray.100");
    const textSecondary = useColorModeValue("gray.600", "gray.300");
    const textTertiary = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const activeBg = useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.1)');
    const inactiveBg = useColorModeValue('white', 'gray.800');
    const inactiveBorder = useColorModeValue('gray.200', 'transparent');
    const inactiveBoxShadow = useColorModeValue('0 2px 4px rgba(0,0,0,0.05)', 'none');
    const hoverBoxShadow = useColorModeValue('md', 'lg');
    const badgeBgInactive = useColorModeValue('gray.200', 'gray.700');
    const textInactiveLeaderboard = useColorModeValue('gray.700', 'gray.300');
    const usernameColor = useColorModeValue('gray.900', 'gray.100');

    const fetchLeaderboard = () => {
        setLoadingLeaderboard(true);
        apiClient('/leaderboard', { method: 'GET' })
            .then(users => {
                if (!users || users.length === 0) {
                    setLeaderboard([
                        { _id: 'dem1', username: 'CodeMaster', xp: 2450, streak: 12 },
                        { _id: 'dem2', username: 'AlgoNinja', xp: 2180, streak: 8 },
                        { _id: 'dem3', username: 'DevQueen', xp: 1750, streak: 4 },
                    ]);
                } else {
                    setLeaderboard(users);
                }
                setLoadingLeaderboard(false);
            })
            .catch(err => {
                console.error("Failed to fetch leaderboard:", err);
                setLoadingLeaderboard(false);
            });
    };

    useEffect(() => {
        playgroundChallengesService.getRandomChallenge()
            .then(ch => {
                if (ch) {
                    setChallenge(ch);
                    setTimeLeft((ch.timeLimit || 15) * 60);
                } else {
                    // Fallback if DB is empty
                    setChallenge({
                        _id: '507f1f77bcf86cd799439011',
                        title: 'Two Sum (Fallback)',
                        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                        difficulty: 'EASY',
                        timeLimit: 15,
                        xp: 100,
                        examples: [
                            { input: '[2,7,11,15], 9', output: '[0,1]' },
                            { input: '[3,2,4], 6', output: '[1,2]' }
                        ]
                    });
                    setTimeLeft(15 * 60);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch challenge:", err);
                // Fallback on error
                setChallenge({
                    _id: '507f1f77bcf86cd799439011',
                    title: 'Two Sum (Fallback)',
                    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                    difficulty: 'EASY',
                    timeLimit: 15,
                    xp: 100,
                    examples: [
                        { input: '[2,7,11,15], 9', output: '[0,1]' },
                        { input: '[3,2,4], 6', output: '[1,2]' }
                    ]
                });
                setTimeLeft(15 * 60);
                setLoading(false);
            });

        fetchLeaderboard();
    }, []);

    // Timer effect
    useEffect(() => {
        if (!challenge || timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleSubmitCode(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [challenge, timeLeft]);

    const handleRunCode = async () => {
        if (!challenge) return;
        setExecuting(true);
        setConsoleOutput([{ type: 'info', text: t('arena.running') }]);

        try {
            const result = await apiClient('/submissions/run', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    language,
                    challengeId: challenge._id || challenge.id,
                }),
            });

            const newOutput = [];
            newOutput.push({ type: result.success ? 'success' : 'error', text: result.output || t('arena.execute') + ' ' + (result.success ? 'complete' : 'failed') });
            newOutput.push({ type: 'info', text: `Tests: ${result.passedTests} / ${result.totalTests} passed.` });
            newOutput.push({ type: 'info', text: `Time: ${result.executionTime}ms` });
            
            if (result.testResults) {
                result.testResults.forEach(tr => {
                    newOutput.push({ type: tr.passed ? 'success' : 'error', text: `Test ${tr.testCase}: ${tr.passed ? 'PASSED' : 'FAILED - Expected ' + tr.expectedOutput + ', Got ' + tr.actualOutput}` });
                    if (tr.error) newOutput.push({ type: 'error', text: `  Error: ${tr.error}` });
                });
            }

            setConsoleOutput(newOutput);
        } catch (error) {
            setConsoleOutput([{ type: 'error', text: error.message || 'Execution failed.' }]);
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmitCode = async () => {
        if (!challenge) return;
        setSubmitting(true);
        setConsoleOutput([{ type: 'info', text: t('arena.running') }]);

        try {
            // Get user info if available from localStorage or token
            const authStr = localStorage.getItem('user_profile') || localStorage.getItem('fo_auth');
            let userId = undefined;
            if (authStr) {
                try {
                    const parsed = JSON.parse(authStr);
                    userId = parsed._id || parsed.id;
                } catch { }
            }

            const result = await apiClient('/submissions/submit', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    language,
                    challengeId: challenge._id || challenge.id,
                    userId
                }),
            });

            const newOutput = [];
            if (result.success) {
                newOutput.push({ type: 'success', text: t('arena.success_all') });
                newOutput.push({ type: 'info', text: t('arena.points_updated') });
                fetchLeaderboard(); // Refresh leaderboard on success
            } else {
                newOutput.push({ type: 'error', text: t('arena.failed_some') });
            }
            newOutput.push({ type: 'info', text: `Tests: ${result.passedTests} / ${result.totalTests} passed.` });
            newOutput.push({ type: 'info', text: `Execution Time: ${result.executionTime}ms` });

            setConsoleOutput(newOutput);
        } catch (error) {
            setConsoleOutput([{ type: 'error', text: error.message || 'Submission failed.' }]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box as="section" py={32} bg={bgPrimary} position="relative" overflow="hidden">
            {/* Background Glow */}
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="120%"
                height="120%"
                bgGradient="radial(circle, rgba(34, 211, 238, 0.15) 0%, transparent 60%)"
                pointerEvents="none"
                zIndex={0}
            />

            <Container maxW="7xl" position="relative" zIndex={10}>
                <VStack spacing={16}>
                    {/* Header */}
                    <VStack spacing={8} textAlign="center">
                        <Heading
                            as="h2"
                            fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
                            fontFamily="heading"
                            fontWeight="bold"
                            color={textPrimary}
                        >
                            {t('arena.title')}
                        </Heading>
                        <Text fontSize={{ base: 'xl', sm: '2xl' }} color={textSecondary}>
                            {t('arena.subtitle')}
                        </Text>

                        {/* Mode Toggle */}
                        <HStack spacing={4}>
                            <Button
                                variant={mode === 'ai' ? 'primary' : 'secondary'}
                                size="lg"
                                onClick={() => setMode('ai')}
                                px={8}
                                py={4}
                            >
                                {t('arena.vs_ai')}
                            </Button>
                            <Button
                                variant={mode === 'pvp' ? 'primary' : 'secondary'}
                                size="lg"
                                onClick={() => setMode('pvp')}
                                px={8}
                                py={4}
                            >
                                {t('arena.vs_player')}
                            </Button>
                        </HStack>
                    </VStack>

                    {/* Arena Layout */}
                    <Box
                        bg="rgba(31, 41, 55, 0.5)"
                        backdropFilter="blur(4px)"
                        borderRadius="16px"
                        border="2px solid"
                        borderColor="rgba(34, 211, 238, 0.3)"
                        boxShadow="customHover"
                        overflow="hidden"
                        width="100%"
                    >
                        <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={0}>
                            {/* Challenge Panel */}
                            <GridItem colSpan={{ base: 12, lg: 3 }} bg={bgPrimary} borderRight="1px solid" borderColor={borderColor} p={6}>
                                <Heading as="h3" size="md" mb={4} color={textPrimary}>
                                    {t('arena.challenge')}
                                </Heading>
                                {loading ? (
                                    <VStack py={10} justify="center">
                                        <Spinner color="brand.500" />
                                        <Text fontSize="sm" color="gray.500">{t('arena.loading_challenge')}</Text>
                                    </VStack>
                                ) : challenge ? (
                                    <VStack spacing={4} align="stretch">
                                        <Box bg={bgSecondary} borderRadius="8px" p={4}>
                                            <HStack justify="space-between" mb={2}>
                                                <Text fontSize="sm" fontWeight="bold" color="brand.500">
                                                    {challenge.title}
                                                </Text>
                                                {challenge.difficulty && (
                                                    <Badge colorScheme={challenge.difficulty === 'EASY' ? 'green' : challenge.difficulty === 'MEDIUM' ? 'yellow' : 'red'} variant="subtle" fontSize="xs">
                                                        {challenge.difficulty}
                                                    </Badge>
                                                )}
                                            </HStack>
                                            <Text fontSize="xs" color={textTertiary} mb={3}>
                                                {challenge.description}
                                            </Text>
                                            <HStack justify="space-between" fontSize="xs" color="gray.500">
                                                <Text>⏱ {challenge.timeLimit || 15} min</Text>
                                                <Text>🎯 {challenge.xp || 100} pts</Text>
                                            </HStack>
                                        </Box>

                                        {challenge.examples && challenge.examples.length > 0 && (
                                            <Box>
                                                <Text fontSize="xs" fontWeight="bold" color={textTertiary} textTransform="uppercase" mb={2}>
                                                    {t('arena.test_cases')}
                                                </Text>
                                                <VStack spacing={2} align="stretch">
                                                    {challenge.examples.map((ex, i) => (
                                                        <Box key={i} bg={bgSecondary} borderRadius="8px" p={3} fontSize="xs" fontFamily="mono">
                                                            <Text color={textTertiary}>{t('arena.input')}: {ex.input}</Text>
                                                            <Text color="green.400">{t('arena.output')}: {ex.output}</Text>
                                                        </Box>
                                                    ))}
                                                </VStack>
                                            </Box>
                                        )}
                                    </VStack>
                                ) : (
                                    <Text fontSize="sm" color="red.400">{t('arena.failed_load')}</Text>
                                )}
                            </GridItem>

                            {/* Coding Arena */}
                            <GridItem colSpan={{ base: 12, lg: 6 }} bg={bgPrimary} p={6}>
                                {mode === 'ai' ? (
                                    // Single Terminal
                                    <Box>
                                        <HStack justify="space-between" mb={4}>
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="semibold" color={textPrimary}>
                                                    {t('arena.your_solution')}
                                                </Text>
                                                <Select size="xs" width="auto" bg={bgSecondary} borderColor={borderColor} value={language} onChange={(e) => setLanguage(e.target.value)}>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                </Select>
                                            </HStack>
                                            <Text fontSize="xs" color={timeLeft <= 300 ? "red.400" : textTertiary} fontWeight={timeLeft <= 300 ? "bold" : "normal"}>
                                                ⏱ {formatTime(timeLeft)}
                                            </Text>
                                        </HStack>
                                        <Box bg={bgSecondary} borderRadius="8px" p={1} mb={4} h="80" overflow="hidden">
                                            <CodeEditor
                                                code={code}
                                                onChange={setCode}
                                                language={language}
                                                height="100%"
                                            />
                                        </Box>
                                        <HStack spacing={3} mb={4}>
                                            <Button flex={1} variant="primary" onClick={handleRunCode} isLoading={executing} loadingText={t('arena.running')}>{t('arena.execute')}</Button>
                                            <Button flex={1} colorScheme="green" onClick={handleSubmitCode} isLoading={submitting} loadingText={t('arena.running')}>{t('arena.submit')}</Button>
                                        </HStack>
                                        <Box bg={bgSecondary} borderRadius="8px" p={4} maxH="56" overflowY="auto">
                                            <Text fontSize="xs" fontWeight="semibold" color={textTertiary} mb={2}>
                                                {t('arena.console_output')}
                                            </Text>
                                            {consoleOutput.length > 0 ? (
                                                <VStack align="start" spacing={1}>
                                                    {consoleOutput.map((line, idx) => (
                                                        <Text key={idx} fontSize="xs" fontFamily="mono" color={line.type === 'success' ? 'green.400' : line.type === 'error' ? 'red.400' : textSecondary}>
                                                            {line.text || '\u00A0'}
                                                        </Text>
                                                    ))}
                                                </VStack>
                                            ) : (
                                                <Text fontSize="xs" fontFamily="mono" color={textTertiary}>
                                                    {'>'} {t('arena.ready')}
                                                </Text>
                                            )}
                                        </Box>
                                    </Box>
                                ) : (
                                    // Dual Terminal
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        {/* Your Terminal */}
                                        <Box>
                                            <HStack justify="space-between" mb={3}>
                                                <Text fontSize="sm" fontWeight="bold" color="brand.500">{t('arena.you')}</Text>
                                                <Text fontSize="xs" color="green.400">● {t('arena.active')}</Text>
                                            </HStack>
                                            <Box bg={bgSecondary} borderRadius="8px" p={3} h="64" overflow="auto" mb={3}>
                                                <Code display="block" whiteSpace="pre" bg="transparent" color={textSecondary} fontSize="xs">
                                                    {`function solve() {
  // Live coding...
  return [];
}`}
                                                </Code>
                                            </Box>
                                        </Box>
                                        {/* Opponent Terminal */}
                                        <Box>
                                            <HStack justify="space-between" mb={3}>
                                                <Text fontSize="sm" fontWeight="bold" color="yellow.400">{t('arena.opponent')}</Text>
                                                <Text fontSize="xs" color="yellow.400">{t('arena.typing')}</Text>
                                            </HStack>
                                            <Box bg={bgSecondary} borderRadius="8px" p={3} h="64" overflow="hidden" mb={3} position="relative">
                                                <Box position="absolute" inset={0} bg="rgba(17, 24, 39, 0.8)" backdropFilter="blur(4px)" display="flex" alignItems="center" justifyContent="center">
                                                    <VStack>
                                                        <Box w={12} h={12} borderRadius="full" border="4px solid" borderColor="yellow.400" borderTopColor="transparent" animation="spin 1s linear infinite" />
                                                        <Text fontSize="xs" color={textTertiary}>{t('arena.opponent_coding')}</Text>
                                                    </VStack>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </GridItem>

                            {/* Leaderboard Sidebar */}
                            <GridItem colSpan={{ base: 12, lg: 3 }} bg={bgPrimary} borderLeft="1px solid" borderColor={borderColor} p={6}>
                                <Heading as="h3" size="md" mb={4} color={textPrimary}>
                                    {t('arena.leaderboard')}
                                </Heading>
                                <VStack spacing={3} align="stretch">
                                    {loadingLeaderboard ? (
                                        <VStack py={5} justify="center">
                                            <Spinner size="sm" color="brand.500" />
                                            <Text fontSize="xs" color="gray.500">{t('arena.updating_leaderboard')}</Text>
                                        </VStack>
                                    ) : leaderboard.length > 0 ? (
                                        leaderboard.map((user, index) => {
                                            const rank = index + 1;
                                            const isActive = rank === 1; // Example purely for styling
                                            return (
                                                <HStack
                                                    key={user._id || index}
                                                    bg={isActive ? activeBg : inactiveBg}
                                                    borderRadius="10px"
                                                    p={3}
                                                    border="1px solid"
                                                    borderColor={isActive ? 'cyan.400' : inactiveBorder}
                                                    boxShadow={isActive ? '0 0 10px rgba(34, 211, 238, 0.2)' : inactiveBoxShadow}
                                                    transition="all 0.2s"
                                                    _hover={{ transform: 'translateY(-2px)', boxShadow: hoverBoxShadow }}
                                                >
                                                    <Box
                                                        w={8}
                                                        h={8}
                                                        borderRadius="full"
                                                        bg={rank === 1 ? 'yellow.500' : isActive ? 'brand.500' : badgeBgInactive}
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        fontWeight="bold"
                                                        fontSize="sm"
                                                        color={rank === 1 || isActive ? 'white' : textInactiveLeaderboard}
                                                    >
                                                        {rank}
                                                    </Box>
                                                    <Box flex={1} ml={1}>
                                                        <Text fontSize="sm" fontWeight="semibold" color={isActive ? 'brand.500' : usernameColor} isTruncated>
                                                            {user.username || user.email || 'Anonymous'}
                                                        </Text>
                                                        <Text fontSize="xs" fontWeight="medium" color={textTertiary}>
                                                            {(user.xp || 0).toLocaleString()} pts
                                                        </Text>
                                                    </Box>
                                                    <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} py={0.5}>
                                                        🔥 {user.streak || 0}
                                                    </Badge>
                                                </HStack>
                                            );
                                        })
                                    ) : (
                                        <Text fontSize="sm" color="gray.500" textAlign="center">{t('try.no_players')}</Text>
                                    )}
                                </VStack>
                            </GridItem>
                        </Grid>
                    </Box>
                </VStack>
            </Container>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </Box>
    );
};

export default Arena;
