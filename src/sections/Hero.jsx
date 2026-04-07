import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Grid,
    GridItem,
    Code,
    Progress,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Fix for deprecated motion() usage
const MotionBox = motion.create(Box);

const languages = ['C', 'C++', 'Java', 'Python', 'JS', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'TypeScript', 'Scala', 'Perl', 'R'];

const PixelGrid = () => {
    const containerRef = useRef(null);
    const pixelsRef = useRef([]);
    const gridSize = 15;

    // Generate static grid data once
    const pixels = useMemo(() => {
        const newPixels = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const hasLang = Math.random() > 0.7;
            newPixels.push({
                id: i,
                lang: hasLang ? languages[Math.floor(Math.random() * languages.length)] : null,
            });
        }
        return newPixels;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            pixelsRef.current.forEach((pixel, index) => {
                if (!pixel) return;

                // Only process pixels that have a language (optimization)
                if (!pixel.dataset.lang) return;

                const row = Math.floor(index / gridSize);
                const col = index % gridSize;

                // Calculate center of pixel
                // Using exact logic from HTML: (col / gridSize) * width + width / (gridSize * 2)
                const pixelX = (col / gridSize) * rect.width + rect.width / (gridSize * 2);
                const pixelY = (row / gridSize) * rect.height + rect.height / (gridSize * 2);

                const distance = Math.sqrt(
                    Math.pow(x - pixelX, 2) + Math.pow(y - pixelY, 2)
                );

                const revealRadius = 150;

                if (distance < revealRadius) {
                    pixel.classList.add('revealed');
                } else {
                    pixel.classList.remove('revealed');
                }
            });
        };

        container.closest('section')?.addEventListener('mousemove', handleMouseMove);

        return () => {
            container.closest('section')?.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <Box
            ref={containerRef}
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            display="grid"
            gridTemplateColumns={`repeat(${gridSize}, 1fr)`}
            gap="8px"
            p="20px"
            pointerEvents="none"
            zIndex={1}
            id="pixelGrid"
        >
            {pixels.map((pixel, i) => (
                <Box
                    key={pixel.id}
                    ref={el => pixelsRef.current[i] = el}
                    data-lang={pixel.lang || ''}
                    className="pixel"
                    // Inline styles for base pixel look to match CSS
                    bg="rgba(34, 211, 238, 0.05)"
                    borderRadius="4px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="10px"
                    fontWeight="600"
                    color="transparent" // Initially transparent
                    fontFamily="monospace"
                    transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    sx={{
                        '&.revealed': {
                            bg: 'rgba(34, 211, 238, 0.2)',
                            color: 'rgba(34, 211, 238, 0.9)',
                            boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)',
                            transform: 'scale(1.1)',
                        }
                    }}
                >
                    {pixel.lang}
                </Box>
            ))}
        </Box>
    );
};

const Hero = () => {
    const spotlightRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [gridCubes, setGridCubes] = useState([]);
    const timeoutsRef = useRef([]);

    /* Theme-aware colors */
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const subTextColor = useColorModeValue('gray.600', 'gray.300');
    const cardBg = useColorModeValue('rgba(255,255,255,0.7)', 'rgba(31,41,55,0.5)');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const codeBg = useColorModeValue('gray.100', 'gray.900');
    const codeColor = useColorModeValue('gray.700', 'gray.300');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    const handleMouseMove = (e) => {
        // Optimize: Update the spotlight DOM directly instead of State
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (spotlightRef.current) {
            spotlightRef.current.style.left = `${x}px`;
            spotlightRef.current.style.top = `${y}px`;
        }
    };

    // Animate hero grid
    useEffect(() => {
        const animateGrid = () => {
            // Clear any existing timeouts for this cycle
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];

            setGridCubes([]); // Reset state
            const totalCubes = 8;
            const newCubes = Array(totalCubes).fill(0).map((_, i) => ({ id: i }));

            newCubes.forEach((cube, i) => {
                const timeoutId = setTimeout(() => {
                    setGridCubes(prev => {
                        // Prevent duplicates strictly
                        if (prev.some(c => c.id === cube.id)) return prev;
                        return [...prev, {
                            ...cube,
                            opacity: (i + 1) / totalCubes
                        }];
                    });
                    setProgress(Math.round(((i + 1) / totalCubes) * 100));
                }, i * 200);
                timeoutsRef.current.push(timeoutId);
            });
        };

        animateGrid();
        const interval = setInterval(animateGrid, 5000);

        return () => {
            clearInterval(interval);
            timeoutsRef.current.forEach(clearTimeout);
        };
    }, []);

    return (
        <Box
            id="home"
            as="section"
            position="relative"
            minH="100vh"
            maxH="1000px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Spotlight Background */}
            <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                pointerEvents="none"
                zIndex={0}
            >
                {/* Ref-based Spotlight Box */}
                <Box
                    ref={spotlightRef}
                    position="absolute"
                    width="600px"
                    height="600px"
                    borderRadius="50%"
                    bgGradient="radial(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)"
                    pointerEvents="none"
                    transition="all 0.1s ease-out"
                    transform="translate(-50%, -50%)"
                    left="50%" // Initial center
                    top="50%"
                />
            </Box>

            {/* Optimized Pixel Grid Layer */}
            <PixelGrid />

            {/* Floating Code Snippets */}
            {['function solve() {', 'const result = [];', 'return optimized;', 'while (i < n) {'].map((code, index) => (
                <Text
                    key={index}
                    position="absolute"
                    fontFamily="monospace"
                    fontSize="xs"
                    color="rgba(34, 211, 238, 0.1)"
                    pointerEvents="none"
                    top={`${[10, 30, 60, 80][index]}%`}
                    left={`${[10, 80, 15, 70][index]}%`}
                    animation={`float 20s linear infinite`}
                    style={{ animationDelay: `${index * 3}s` }}
                    zIndex={2}
                >
                    {code}
                </Text>
            ))}

            {/* Hero Content */}
            <Container maxW="5xl" position="relative" zIndex={10} textAlign="center" pt={20}>
                <VStack spacing={6}>
                    <Heading
                        as="h2"
                        fontSize={{ base: '4xl', sm: '5xl', lg: '6xl' }}
                        fontFamily="heading"
                        fontWeight="bold"
                        color={headingColor}
                    >
                        Turn Algorithms Into Action.
                    </Heading>

                    <Text fontSize={{ base: 'lg', sm: 'xl' }} color={subTextColor} maxW="3xl">
                        Write code. Run simulations. Compete in real-time. Watch your logic shape dynamic game worlds.
                    </Text>

                    {/* CTA Buttons */}
                    <HStack spacing={4} flexWrap="wrap" justify="center">
                        <Button variant="primary" size="lg" boxShadow="custom">
                            Start 1 vs AI
                        </Button>
                        <Button variant="secondary" size="lg">
                            Challenge a Player
                        </Button>
                        <Button variant="ghost" size="lg">
                            View Demo
                        </Button>
                    </HStack>

                    {/* Mini Preview Card */}
                    <Box
                        maxW="2xl"
                        bg={cardBg}
                        backdropFilter="blur(8px)"
                        borderRadius="16px"
                        p={6}
                        border="1px solid"
                        borderColor={cardBorder}
                        boxShadow="custom"
                        mt={8}
                    >
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                            {/* Code Snippet */}
                            <GridItem>
                                <Box bg={codeBg} borderRadius="8px" p={4}>
                                    <HStack justify="space-between" mb={3}>
                                        <Text fontSize="xs" color={mutedColor} fontFamily="mono">
                                            solution.js
                                        </Text>
                                        <Text fontSize="xs" color="green.400">
                                            ● Running
                                        </Text>
                                    </HStack>
                                    <Code
                                        display="block"
                                        whiteSpace="pre"
                                        fontSize="sm"
                                        color={codeColor}
                                        bg="transparent"
                                        p={0}
                                    >
                                        {`function solve(grid) {
  let score = 0;
  for (let row of grid) {
    score += row.reduce(
      (a, b) => a + b, 0
    );
  }
  return score;
}`}
                                    </Code>
                                </Box>
                            </GridItem>

                            {/* Game Board Preview */}
                            <GridItem>
                                <Box bg={codeBg} borderRadius="8px" p={4}>
                                    <Text fontSize="xs" color={mutedColor} mb={3}>
                                        Game Simulation
                                    </Text>
                                    <Grid templateColumns="repeat(4, 1fr)" gap={1} mb={4}>
                                        {gridCubes.map((cube) => (
                                            <MotionBox
                                                key={cube.id}
                                                aspectRatio={1}
                                                bg="brand.500"
                                                borderRadius="4px"
                                                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                                                animate={{ opacity: cube.opacity, scale: 1, y: 0 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        ))}
                                    </Grid>
                                    <VStack spacing={2}>
                                        <HStack justify="space-between" width="100%" fontSize="xs" color={mutedColor}>
                                            <Text>Progress</Text>
                                            <Text>{progress}%</Text>
                                        </HStack>
                                        <Progress
                                            value={progress}
                                            size="sm"
                                            colorScheme="cyan"
                                            borderRadius="full"
                                            width="100%"
                                        />
                                    </VStack>
                                </Box>
                            </GridItem>
                        </Grid>
                    </Box>
                </VStack>
            </Container>

            {/* Keyframes for floating animation */}
            <style>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }
      `}</style>
        </Box>
    );
};

export default Hero;
