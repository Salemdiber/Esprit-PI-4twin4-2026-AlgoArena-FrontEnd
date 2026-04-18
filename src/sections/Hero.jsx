import { useRef } from 'react';
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
import { useTranslation } from 'react-i18next';

const PixelGrid = () => {
    return (
        <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            pointerEvents="none"
            zIndex={1}
            opacity={0.7}
            bgImage="
                linear-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 211, 238, 0.08) 1px, transparent 1px)
            "
            bgSize="44px 44px"
            maskImage="radial-gradient(circle at center, black 0%, transparent 72%)"
        />
    );
};

const Hero = () => {
    const { t } = useTranslation();
    const spotlightRef = useRef(null);
    const previewCells = [0.25, 0.38, 0.5, 0.62, 0.72, 0.82, 0.9, 1];

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
                        {t('landing.hero.title')}
                    </Heading>

                    <Text fontSize={{ base: 'lg', sm: 'xl' }} color={subTextColor} maxW="3xl">
                        {t('landing.hero.subtitle')}
                    </Text>

                    {/* CTA Buttons */}
                    <HStack spacing={4} flexWrap="wrap" justify="center">
                        <Button variant="primary" size="lg" boxShadow="custom">
                            {t('landing.hero.ctaAi')}
                        </Button>
                        <Button variant="secondary" size="lg">
                            {t('landing.hero.ctaPlayer')}
                        </Button>
                        <Button variant="ghost" size="lg">
                            {t('landing.hero.ctaDemo')}
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
                                            {t('landing.hero.fileLabel')}
                                        </Text>
                                        <Text fontSize="xs" color="green.400">
                                            {t('landing.hero.running')}
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
                                        {t('landing.hero.gameSimulation')}
                                    </Text>
                                    <Grid templateColumns="repeat(4, 1fr)" gap={1} mb={4}>
                                        {previewCells.map((opacity, index) => (
                                            <Box
                                                key={index}
                                                aspectRatio={1}
                                                bg="brand.500"
                                                borderRadius="4px"
                                                opacity={opacity}
                                            />
                                        ))}
                                    </Grid>
                                    <VStack spacing={2}>
                                        <HStack justify="space-between" width="100%" fontSize="xs" color={mutedColor}>
                                            <Text>{t('landing.hero.progress')}</Text>
                                            <Text>100%</Text>
                                        </HStack>
                                        <Progress
                                            value={100}
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
