import { useState, useEffect, useRef } from 'react';
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
    Code,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const gameData = {
    tetris: {
        title: 'Tetris Logic',
        icon: '🎮',
        code: `function movePiece(grid, direction) {
  // Tetris-like logic
  const piece = grid.activePiece;
  
  if (direction === 'down') {
    piece.y += 1;
    if (checkCollision(grid, piece)) {
      piece.y -= 1;
      lockPiece(grid, piece);
      clearLines(grid);
    }
  }
  
  return grid;
}`,
        pattern: [3, 4, 11, 12, 19, 20, 27, 28],
    },
    maze: {
        title: 'Maze Solver',
        icon: '🧩',
        code: `function solveMaze(maze, start, end) {
  const queue = [start];
  const visited = new Set();
  
  while (queue.length > 0) {
    const pos = queue.shift();
    if (pos === end) return true;
    
    visited.add(pos);
    const neighbors = getNeighbors(pos);
    queue.push(...neighbors);
  }
  
  return false;
}`,
        pattern: [0, 1, 2, 10, 18, 26, 27, 28],
    },
    tower: {
        title: 'Tower Defense',
        icon: '🏰',
        code: `function targetEnemy(towers, enemies) {
  for (let tower of towers) {
    let closest = null;
    let minDist = Infinity;
    
    for (let enemy of enemies) {
      const dist = distance(tower, enemy);
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    }
    
    tower.target = closest;
  }
}`,
        pattern: [4, 12, 13, 14, 20, 21, 22, 28],
    },
    puzzle: {
        title: 'Puzzle Grid',
        icon: '🧠',
        code: `function solvePuzzle(grid) {
  const n = grid.length;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (canPlace(grid, i, j)) {
        grid[i][j] = findBestPiece();
        if (solvePuzzle(grid)) return true;
        grid[i][j] = null;
      }
    }
  }
  
  return false;
}`,
        pattern: [0, 7, 8, 15, 16, 23, 24, 31],
    },
};

const Games = () => {
    const [currentGame, setCurrentGame] = useState('tetris');
    const [stats, setStats] = useState({ score: 0, lines: 0, level: 1 });
    const [activeIndices, setActiveIndices] = useState([]);
    const timeoutsRef = useRef([]);

    // Clear any pending animations
    const clearTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const runGameAnimation = (gameKey) => {
        clearTimeouts();
        setActiveIndices([]);
        setStats({ score: 0, lines: 0, level: 1 });

        const pattern = gameData[gameKey].pattern;

        // Animate pattern cubes one by one
        pattern.forEach((index, i) => {
            const timeoutId = setTimeout(() => {
                setActiveIndices(prev => [...prev, index]);

                setStats({
                    score: (i + 1) * 30,
                    lines: i + 1,
                    level: i > 6 ? 3 : i > 3 ? 2 : 1,
                });
            }, i * 300);
            timeoutsRef.current.push(timeoutId);
        });
    };

    // Run animation when game changes
    useEffect(() => {
        runGameAnimation(currentGame);
        return clearTimeouts;
    }, [currentGame]);

    const handleRunCode = () => {
        runGameAnimation(currentGame);
    };

    const sectionBg = useColorModeValue('rgba(241,245,249,0.6)', 'rgba(31,41,55,0.3)');
    const cardBg = useColorModeValue('white', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const codeBg = useColorModeValue('gray.100', 'gray.800');
    const codeColor = useColorModeValue('gray.700', 'gray.300');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const inactiveGrid = useColorModeValue('gray.200', 'gray.700');
    const selectBg = useColorModeValue('gray.100', 'gray.800');

    return (
        <Box id="games" as="section" py={20} bg={sectionBg}>
            <Container maxW="7xl">
                <VStack spacing={16}>
                    <VStack spacing={4} textAlign="center">
                        <Heading
                            as="h2"
                            fontSize={{ base: '3xl', sm: '4xl' }}
                            fontFamily="heading"
                            fontWeight="bold"
                            color={headingColor}
                        >
                            Your Code. Your Game.
                        </Heading>
                        <Text fontSize="xl" color={textColor}>
                            Choose a game. Write the logic. Watch it evolve.
                        </Text>
                    </VStack>

                    {/* Game Selector Tabs */}
                    <HStack spacing={3} flexWrap="wrap" justify="center">
                        {Object.entries(gameData).map(([key, game]) => (
                            <Button
                                key={key}
                                onClick={() => setCurrentGame(key)}
                                variant={currentGame === key ? 'primary' : 'ghost'}
                                size="lg"
                                leftIcon={<span>{game.icon}</span>}
                            >
                                {game.title}
                            </Button>
                        ))}
                    </HStack>

                    {/* Game Preview Layout */}
                    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12} width="100%">
                        {/* Code Editor */}
                        <GridItem>
                            <Box
                                bg={cardBg}
                                borderRadius="16px"
                                p={6}
                                border="1px solid"
                                borderColor={borderColor}
                                boxShadow="custom"
                                position="relative"
                                overflow="hidden"
                                _hover={{
                                    '&::before': {
                                        opacity: 1,
                                    },
                                }}
                                _before={{
                                    content: '""',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '200%',
                                    height: '200%',
                                    bgGradient: 'radial(circle, rgba(34, 211, 238, 0.1) 0%, transparent 50%)',
                                    transform: 'translate(-50%, -50%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                    pointerEvents: 'none',
                                }}
                            >
                                <HStack justify="space-between" mb={4}>
                                    <HStack spacing={2}>
                                        <Box w={3} h={3} borderRadius="full" bg="red.500" />
                                        <Box w={3} h={3} borderRadius="full" bg="yellow.500" />
                                        <Box w={3} h={3} borderRadius="full" bg="green.500" />
                                    </HStack>
                                    <Select
                                        bg={selectBg}
                                        color={textColor}
                                        size="sm"
                                        borderColor={borderColor}
                                        width="auto"
                                    >
                                        <option>JavaScript</option>
                                        <option>Python</option>
                                    </Select>
                                </HStack>

                                <Code
                                    display="block"
                                    whiteSpace="pre"
                                    fontSize="sm"
                                    color={codeColor}
                                    bg="transparent"
                                    p={0}
                                    mb={4}
                                    height="256px"
                                    overflowX="auto"
                                >
                                    {gameData[currentGame].code}
                                </Code>

                                <HStack spacing={3}>
                                    <Button flex={1} variant="primary" onClick={handleRunCode}>
                                        Run Code
                                    </Button>
                                    <Button variant="ghost" borderColor={borderColor} onClick={handleRunCode}>
                                        Reset
                                    </Button>
                                </HStack>
                            </Box>
                        </GridItem>

                        <GridItem>
                            <MotionBox
                                bg={cardBg}
                                borderRadius="16px"
                                p={6}
                                border="1px solid"
                                borderColor={borderColor}
                                boxShadow="custom"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <HStack justify="space-between" mb={4}>
                                    <Heading as="h3" size="md" fontFamily="heading" color={headingColor}>
                                        {gameData[currentGame].title}
                                    </Heading>
                                    <Text fontSize="xs" color="brand.500" fontWeight="semibold">
                                        ● LIVE
                                    </Text>
                                </HStack>

                                <Box bg={codeBg} borderRadius="8px" p={4} mb={4}>
                                    <Grid templateColumns="repeat(8, 1fr)" gap={1} mb={4}>
                                        {Array.from({ length: 32 }).map((_, i) => (
                                            <MotionBox
                                                key={i}
                                                aspectRatio={1}
                                                bg={activeIndices.includes(i) ? 'brand.500' : inactiveGrid}
                                                borderRadius="4px"
                                                animate={{
                                                    scale: activeIndices.includes(i) ? [0.8, 1.1, 1] : 1,
                                                }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        ))}
                                    </Grid>
                                </Box>

                                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                                    <Box bg={codeBg} borderRadius="8px" p={3} textAlign="center">
                                        <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                                            {stats.score}
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Score
                                        </Text>
                                    </Box>
                                    <Box bg={codeBg} borderRadius="8px" p={3} textAlign="center">
                                        <Text fontSize="2xl" fontWeight="bold" color="green.400">
                                            {stats.lines}
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Progress
                                        </Text>
                                    </Box>
                                    <Box bg={codeBg} borderRadius="8px" p={3} textAlign="center">
                                        <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                                            {stats.level}
                                        </Text>
                                        <Text fontSize="xs" color={mutedColor}>
                                            Level
                                        </Text>
                                    </Box>
                                </Grid>
                            </MotionBox>
                        </GridItem>
                    </Grid>
                </VStack>
            </Container>
        </Box>
    );
};

export default Games;
