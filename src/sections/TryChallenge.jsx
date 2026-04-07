/**
 * TryChallenge – "Try a Challenge Instantly" landing page section.
 *
 * Self-contained: includes its own mock data, editor state, and layout.
 * Uses the shared /editor module — CodeEditor, EditorToolbar, OutputTerminal.
 *
 * Desktop: two-column (description left, editor right)
 * Mobile:  stacked (description → editor → output)
 */
import React from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    Badge,
    VStack,
    HStack,
    Icon,
    Tag,
    Collapse,
    Button,
    useDisclosure,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CodeEditor, EditorToolbar, OutputTerminal, useEditorState } from '../editor';

const MotionBox = motion.create(Box);

/* ── Static demo challenge ──────────────────────────────────── */
const DEMO_CHALLENGE = {
    title: 'Two Sum',
    difficulty: 'Easy',
    difficultyColor: '#22c55e',
    tags: ['Arrays', 'Hash Table'],
    description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    rules: [
        'You may assume that each input would have exactly one solution.',
        'You may not use the same element twice.',
        'You can return the answer in any order.',
    ],
    examples: [
        { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9' },
        { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] == 6' },
    ],
};

/* ── Icons ──────────────────────────────────────────────────── */
const CodeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </Icon>
);

const LightbulbIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </Icon>
);

const TryChallenge = () => {
    const { code, setCode, language, setLanguage, output, isRunning, runCode, resetCode } = useEditorState();
    const { isOpen: showExamples, onToggle: toggleExamples } = useDisclosure({ defaultIsOpen: true });

    return (
        <Box
            id="try-challenge"
            as="section"
            py={{ base: 16, lg: 24 }}
            bg="var(--color-bg-primary)"
            position="relative"
            overflow="hidden"
        >
            {/* Subtle gradient glow */}
            <Box
                position="absolute"
                top="-200px"
                right="-100px"
                w="500px"
                h="500px"
                bg="#22d3ee"
                borderRadius="full"
                filter="blur(180px)"
                opacity={0.06}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                bottom="-150px"
                left="-80px"
                w="400px"
                h="400px"
                bg="#a855f7"
                borderRadius="full"
                filter="blur(160px)"
                opacity={0.04}
                pointerEvents="none"
            />

            <Container maxW="7xl" position="relative" zIndex={1}>
                {/* Section header */}
                <MotionBox
                    textAlign="center"
                    mb={{ base: 10, lg: 14 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <HStack justify="center" mb={4}>
                        <CodeIcon w={5} h={5} color="#22d3ee" />
                        <Text
                            fontSize="sm"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="widest"
                            color="#22d3ee"
                        >
                            Live Playground
                        </Text>
                    </HStack>
                    <Heading
                        as="h2"
                        fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
                        fontFamily="heading"
                        fontWeight="bold"
                        color={useColorModeValue("gray.800", "gray.100")}
                        mb={4}
                    >
                        Try a Challenge{' '}
                        <Text as="span" bgGradient="linear(to-r, #22d3ee, #a855f7)" bgClip="text">
                            Instantly
                        </Text>
                    </Heading>
                    <Text fontSize={{ base: 'lg', lg: 'xl' }} color={useColorModeValue("gray.500", "gray.400")} maxW="2xl" mx="auto">
                        No sign-up needed. Write code, hit run, and see the results.
                    </Text>
                </MotionBox>

                {/* Main content: description + editor */}
                <MotionBox
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: 6, lg: 0 }}
                        bg="var(--color-editor-toolbar)"
                        borderRadius="16px"
                        border="1px solid"
                        borderColor="var(--color-editor-border)"
                        overflow="hidden"
                        boxShadow="0 8px 40px rgba(0, 0, 0, 0.4)"
                    >
                        {/* LEFT – Challenge description */}
                        <Box
                            w={{ base: '100%', lg: '40%' }}
                            p={{ base: 6, lg: 8 }}
                            borderRight={{ lg: '1px solid' }}
                            borderColor={{ lg: 'var(--color-editor-border)' }}
                            overflowY="auto"
                            maxH={{ lg: '520px' }}
                            sx={{
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { bg: 'var(--color-border)', borderRadius: '3px' },
                                overscrollBehavior: 'contain',
                            }}
                        >
                            {/* Title + difficulty */}
                            <HStack mb={4} spacing={3}>
                                <Heading fontSize="xl" fontFamily="heading" fontWeight="bold" color={useColorModeValue("gray.800", "gray.100")}>
                                    {DEMO_CHALLENGE.title}
                                </Heading>
                                <Badge
                                    bg={`${DEMO_CHALLENGE.difficultyColor}20`}
                                    color={DEMO_CHALLENGE.difficultyColor}
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="6px"
                                    fontWeight="semibold"
                                >
                                    {DEMO_CHALLENGE.difficulty}
                                </Badge>
                            </HStack>

                            {/* Tags */}
                            <HStack spacing={2} mb={5} flexWrap="wrap">
                                {DEMO_CHALLENGE.tags.map((tag) => (
                                    <Tag
                                        key={tag}
                                        size="sm"
                                        bg="var(--color-bg-secondary)"
                                        color={useColorModeValue("gray.600", "gray.300")}
                                        borderRadius="6px"
                                        fontSize="xs"
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                            </HStack>

                            {/* Description */}
                            <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="sm" lineHeight="1.8" mb={5}>
                                {DEMO_CHALLENGE.description}
                            </Text>

                            {/* Rules */}
                            <VStack align="start" spacing={2} mb={6}>
                                {DEMO_CHALLENGE.rules.map((rule, i) => (
                                    <HStack key={i} align="start" spacing={2}>
                                        <Text color="#22d3ee" fontSize="sm" mt="2px">•</Text>
                                        <Text color={useColorModeValue("gray.500", "gray.400")} fontSize="sm">{rule}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            {/* Examples (collapsible) */}
                            <Button
                                variant="unstyled"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                color={useColorModeValue("gray.500", "gray.400")}
                                fontSize="sm"
                                fontWeight="semibold"
                                mb={3}
                                _hover={{ color: '#22d3ee' }}
                                onClick={toggleExamples}
                            >
                                <LightbulbIcon w={4} h={4} />
                                {showExamples ? 'Hide' : 'Show'} Examples
                            </Button>

                            <Collapse in={showExamples} animateOpacity>
                                <VStack spacing={4} align="stretch">
                                    {DEMO_CHALLENGE.examples.map((ex, i) => (
                                        <Box
                                            key={i}
                                            bg="var(--color-bg-primary)"
                                            borderRadius="10px"
                                            p={4}
                                            border="1px solid"
                                            borderColor="var(--color-editor-border)"
                                        >
                                            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                                                Example {i + 1}
                                            </Text>
                                            <Box fontFamily="mono" fontSize="13px" lineHeight="1.8">
                                                <Text color={useColorModeValue("gray.500", "gray.400")}>
                                                    <Text as="span" color="var(--color-text-muted)" fontWeight="semibold">Input: </Text>
                                                    {ex.input}
                                                </Text>
                                                <Text color="#22c55e">
                                                    <Text as="span" color="var(--color-text-muted)" fontWeight="semibold">Output: </Text>
                                                    {ex.output}
                                                </Text>
                                                {ex.explanation && (
                                                    <Text color="gray.500" fontStyle="italic" mt={1}>
                                                        {ex.explanation}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </VStack>
                            </Collapse>
                        </Box>

                        {/* RIGHT – Editor + terminal */}
                        <Flex
                            w={{ base: '100%', lg: '60%' }}
                            direction="column"
                            bg="var(--color-bg-primary)"
                        >
                            {/* Toolbar */}
                            <EditorToolbar
                                language={language}
                                setLanguage={setLanguage}
                                isRunning={isRunning}
                                onRun={runCode}
                                onReset={resetCode}
                            />

                            {/* Monaco editor */}
                            <CodeEditor
                                code={code}
                                onChange={setCode}
                                language={language}
                                height="300px"
                            />

                            {/* Output terminal */}
                            <OutputTerminal output={output} isRunning={isRunning} />
                        </Flex>
                    </Flex>
                </MotionBox>
            </Container>
        </Box>
    );
};

export default TryChallenge;
