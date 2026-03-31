/**
 * Playground Arena Component
 * Complete integrated challenge solving interface with:
 * - Code editor
 * - Test case execution
 * - Test results display
 * - Live leaderboard
 * - Submission tracking
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorModeValue,
  Spinner,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Services
import playgroundChallengesService from '../services/playgroundChallengesService';

// Components
import CodeEditor from '../editor/components/CodeEditor';
import EditorToolbar from '../editor/components/EditorToolbar';
import TestResults from './TestResults';
import LiveLeaderboard from './LiveLeaderboard';
import OutputTerminal from '../editor/components/OutputTerminal';

// Hooks
import useCodeExecution from '../hooks/useCodeExecution';

const MotionBox = motion.create(Box);

// Timer icon
const TimerIcon = (props) => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 2" />
  </Icon>
);

const ChallengeArenaPlayground = ({ challengeId }) => {
  // Challenge data
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState([]);

  // Execution
  const execution = useCodeExecution(
    challengeId,
    challenge?.testCases || challenge?.examples || []
  );

  // Color scheme
  const bgPrimary = useColorModeValue('gray.50', 'gray.900');
  const bgPanel = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Load challenge
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true);
        setError(null);

        let ch;
        if (challengeId) {
          ch = await playgroundChallengesService.getChallenge(challengeId);
        } else {
          ch = await playgroundChallengesService.getRandomChallenge();
        }

        if (ch) {
          setChallenge(ch);
          
          // Set starter code
          const starterCode = ch.starterCode?.[language] || ch.starterCode?.javascript || '// Write your solution here\n';
          setCode(starterCode);
          
          console.log('✅ Challenge loaded:', ch.title);
        } else {
          setError('Challenge not found');
        }
      } catch (err) {
        console.error('❌ Challenge load error:', err);
        setError(err.message || 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [challengeId, language]);

  // Run code
  const handleRunCode = async () => {
    execution.resetResults();
    await execution.runCode(code, language);
  };

  // Submit code
  const handleSubmitCode = async () => {
    execution.resetResults();
    await execution.submitCode(code, language, 'current-user-id');
  };

  // Reset code
  const handleResetCode = () => {
    const starterCode = challenge?.starterCode?.[language] || '// Write your solution here\n';
    setCode(starterCode);
    execution.resetResults();
    execution.clearError();
  };

  // Change language
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const starterCode = challenge?.starterCode?.[newLang] || challenge?.starterCode?.javascript || '// Write your solution here\n';
    setCode(starterCode);
  };

  if (loading) {
    return (
      <Container maxW="full" h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="cyan.400" thickness="4px" />
          <Text color="gray.500">Loading challenge...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !challenge) {
    return (
      <Container maxW="full" p={4}>
        <Alert status="error" borderRadius="8px">
          <AlertIcon />
          <AlertTitle>{error || 'Failed to load challenge'}</AlertTitle>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgPrimary} minH="100vh" py={4}>
      <Container maxW="full" px={4}>
        {/* Header */}
        <MotionBox
          mb={6}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between" align="flex-start">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {challenge.title}
                  </Text>
                  <Badge colorScheme={
                    challenge.difficulty === 'HARD' ? 'red' :
                    challenge.difficulty === 'MEDIUM' ? 'yellow' :
                    'green'
                  }>
                    {challenge.difficulty || 'EASY'}
                  </Badge>
                </HStack>
                <Text color="gray.500" fontSize="sm">
                  {challenge.description?.substring(0, 100)}...
                </Text>
              </VStack>
              <VStack align="end" spacing={1} fontSize="sm">
                <HStack>
                  <TimerIcon w={4} h={4} />
                  <Text>{challenge.timeLimit || 15} min</Text>
                </HStack>
                <Text color="gray.500">
                  🎯 {challenge.xp || 100} pts
                </Text>
              </VStack>
            </HStack>

            {/* Error Alert */}
            {execution.error && (
              <Alert status="error" borderRadius="6px" fontSize="sm">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <AlertTitle>{execution.error}</AlertTitle>
                </VStack>
              </Alert>
            )}

            {/* Success Alert */}
            {execution.success && (
              <Alert status="success" borderRadius="6px" fontSize="sm">
                <AlertIcon />
                <Text fontWeight="600">🎉 All tests passed! Ready to submit.</Text>
              </Alert>
            )}
          </VStack>
        </MotionBox>

        {/* Main Grid */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 350px' }} gap={4} minH="75vh">
          {/* Left: Problem Description */}
          <GridItem>
            <MotionBox
              bg={bgPanel}
              borderRadius="12px"
              border={`1px solid ${borderColor}`}
              p={6}
              h="100%"
              maxH="75vh"
              overflowY="auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <VStack align="stretch" spacing={6}>
                {/* Description */}
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" fontSize="lg">Problem Statement</Text>
                  <Text color="gray.600" lineHeight="1.8">
                    {challenge.description}
                  </Text>
                </VStack>

                <Divider />

                {/* Examples */}
                {(challenge.examples || challenge.testCases) && (
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="bold" fontSize="lg">Examples</Text>
                    <VStack align="stretch" spacing={2}>
                      {(challenge.examples || challenge.testCases).slice(0, 3).map((example, idx) => (
                        <Box
                          key={idx}
                          bg={useColorModeValue('gray.50', 'gray.700')}
                          p={3}
                          borderRadius="6px"
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          <Text color={useColorModeValue('gray.600', 'gray.300')}>
                            Input: {typeof example.input === 'string' ? example.input : JSON.stringify(example.input)}
                          </Text>
                          <Text color="green.500">
                            Output: {typeof example.output === 'string' ? example.output : JSON.stringify(example.output)}
                          </Text>
                          {example.explanation && (
                            <Text color={useColorModeValue('gray.500', 'gray.400')} mt={2}>
                              💡 {example.explanation}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </VStack>
                )}

                {/* Tags */}
                {challenge.tags && (
                  <>
                    <Divider />
                    <VStack align="start" spacing={2} w="100%">
                      <Text fontWeight="bold" fontSize="sm">Tags</Text>
                      <HStack wrap="wrap" spacing={2}>
                        {challenge.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" colorScheme="cyan">
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  </>
                )}
              </VStack>
            </MotionBox>
          </GridItem>

          {/* Center: Code Editor */}
          <GridItem>
            <MotionBox
              display="flex"
              flexDirection="column"
              h="100%"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {/* Toolbar */}
              <HStack spacing={3} mb={3} wrap="wrap">
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  w="140px"
                  size="sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </Select>

                <Button
                  colorScheme="cyan"
                  size="sm"
                  isLoading={execution.isRunning}
                  onClick={handleRunCode}
                  flex={1}
                >
                  ▶ Run Code
                </Button>

                <Button
                  colorScheme="green"
                  size="sm"
                  isLoading={execution.isSubmitting}
                  onClick={handleSubmitCode}
                  isDisabled={execution.isRunning}
                  flex={1}
                >
                  ✓ Submit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCode}
                  isDisabled={execution.isRunning}
                >
                  ↺ Reset
                </Button>
              </HStack>

              {/* Code Editor */}
              <Box
                flex={1}
                bg={bgPanel}
                borderRadius="12px"
                border={`1px solid ${borderColor}`}
                overflow="hidden"
                minH="400px"
              >
                <CodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  height="100%"
                />
              </Box>
            </MotionBox>
          </GridItem>

          {/* Right: Results & Leaderboard */}
          <GridItem>
            <VStack spacing={4} h="100%">
              {/* Test Results */}
              <MotionBox
                w="100%"
                bg={bgPanel}
                borderRadius="12px"
                border={`1px solid ${borderColor}`}
                overflow="hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <TestResults
                  results={execution.testResults}
                  isRunning={execution.isRunning}
                  passedTests={execution.passedTests}
                  totalTests={execution.totalTests}
                />
              </MotionBox>

              {/* Live Leaderboard */}
              <MotionBox
                w="100%"
                flex={1}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                overflow="hidden"
              >
                <LiveLeaderboard challengeId={challengeId} />
              </MotionBox>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default ChallengeArenaPlayground;
