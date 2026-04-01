import {
    Box,
    Container,
    Heading,
    Text,
    Grid,
    GridItem,
    VStack,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const steps = [
    {
        title: 'Write Your Logic',
        desc: 'Code your algorithm in JavaScript or Python. Use our Monaco-powered editor with syntax highlighting and intelligent autocomplete.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
        ),
    },
    {
        title: 'Execute & Simulate',
        desc: 'Run your code in a secure sandbox. Our engine validates logic, checks edge cases, and measures performance in real-time.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
            />
        ),
    },
    {
        title: 'Compete & Climb',
        desc: 'Battle AI or real players. Climb leaderboards. Earn achievements. Watch your ranking rise as you master algorithms.',
        icon: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
        ),
    },
];

const features = [
    {
        title: 'Real-Time Battles',
        desc: "Compete against AI or real players in live coding challenges. See your opponent's progress in real-time.",
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        )
    },
    {
        title: 'Visual Simulations',
        desc: 'Watch your algorithms come alive through interactive game simulations. See every step visualized.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        )
    },
    {
        title: 'Performance Analytics',
        desc: 'Track your runtime, memory usage, and optimization metrics. Compare with top performers.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        )
    },
    {
        title: 'Curated Challenges',
        desc: 'Access hundreds of algorithm challenges from easy to expert. New problems added weekly.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        )
    },
    {
        title: 'Global Leaderboards',
        desc: 'Compete with developers worldwide. Track your ranking and climb to the top.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        )
    },
    {
        title: 'Secure Sandbox',
        desc: 'Run code safely in isolated environments. Full support for JavaScript and Python.',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        )
    }
];

const Features = () => {
    const sectionBg = useColorModeValue('rgba(241,245,249,0.6)', 'rgba(31,41,55,0.3)');
    const sectionBg2 = useColorModeValue('white', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.900');
    const cardBg2 = useColorModeValue('gray.50', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const textColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <>
            {/* How It Works Section */}
            <Box as="section" py={20} bg={sectionBg}>
                <Container maxW="7xl">
                    <VStack spacing={16} mb={20}>
                        <VStack spacing={4} textAlign="center">
                            <Heading as="h2" size="2xl" color={headingColor} fontFamily="heading">
                                How It Works
                            </Heading>
                            <Text fontSize="xl" color={textColor}>
                                Three steps to competitive coding mastery
                            </Text>
                        </VStack>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                            {steps.map((step, index) => (
                                <MotionBox
                                    key={index}
                                    bg={cardBg}
                                    borderRadius="16px"
                                    p={8}
                                    textAlign="center"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    boxShadow="custom"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                    gridColumn={index === 2 ? { sm: 'span 2', lg: 'span 1' } : 'auto'}
                                >
                                    <Box
                                        w={20}
                                        h={20}
                                        borderRadius="full"
                                        bg="rgba(34, 211, 238, 0.2)"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mx="auto"
                                        mb={6}
                                        position="relative"
                                    >
                                        <Box position="absolute" inset={0} bg="brand.500" opacity={0.1} borderRadius="full" filter="blur(10px)" />
                                        <Icon viewBox="0 0 24 24" w={10} h={10} color="brand.400" fill="none" stroke="currentColor">
                                            {step.icon}
                                        </Icon>
                                    </Box>
                                    <Heading as="h3" size="lg" mb={4} color={headingColor}>
                                        {step.title}
                                    </Heading>
                                    <Text color={textColor}>
                                        {step.desc}
                                    </Text>
                                </MotionBox>
                            ))}
                        </Grid>
                    </VStack>
                </Container>
            </Box>

            {/* Features Grid Section */}
            <Box id="features" as="section" py={20} bg={sectionBg2}>
                <Container maxW="7xl">
                    <VStack spacing={16}>
                        <VStack spacing={4} textAlign="center">
                            <Heading as="h2" size="2xl" color={headingColor} fontFamily="heading">
                                Built for Competitive Coders
                            </Heading>
                            <Text fontSize="xl" color={textColor}>
                                Everything you need to master algorithms
                            </Text>
                        </VStack>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
                            {features.map((feature, index) => (
                                <Box
                                    key={index}
                                    bg={cardBg2}
                                    borderRadius="16px"
                                    p={6}
                                    border="1px solid"
                                    borderColor={borderColor}
                                    boxShadow="custom"
                                    transition="transform 0.3s"
                                    _hover={{ transform: 'translateY(-5px)' }}
                                >
                                    <Box
                                        w={12}
                                        h={12}
                                        bg="rgba(34, 211, 238, 0.2)"
                                        borderRadius="8px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mb={4}
                                    >
                                        <Icon viewBox="0 0 24 24" w={6} h={6} color="brand.400" fill="none" stroke="currentColor">
                                            {feature.icon}
                                        </Icon>
                                    </Box>
                                    <Heading as="h3" size="md" mb={3} color={headingColor}>
                                        {feature.title}
                                    </Heading>
                                    <Text fontSize="sm" color={textColor}>
                                        {feature.desc}
                                    </Text>
                                </Box>
                            ))}
                        </Grid>
                    </VStack>
                </Container>
            </Box>
        </>
    );
};

export default Features;
