import { useState } from 'react';
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
} from '@chakra-ui/react';

const Arena = () => {
    const [mode, setMode] = useState('ai');

    return (
        <Box as="section" py={32} bg={useColorModeValue("white", "gray.900")} position="relative" overflow="hidden">
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
                            color={useColorModeValue("gray.800", "gray.100")}
                        >
                            This Is The Product.
                        </Heading>
                        <Text fontSize={{ base: 'xl', sm: '2xl' }} color={useColorModeValue("gray.600", "gray.300")}>
                            Experience the full competitive coding arena. Battle AI or real players in real-time.
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
                                1 vs AI
                            </Button>
                            <Button
                                variant={mode === 'pvp' ? 'primary' : 'secondary'}
                                size="lg"
                                onClick={() => setMode('pvp')}
                                px={8}
                                py={4}
                            >
                                1 vs 1
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
                            <GridItem colSpan={{ base: 12, lg: 3 }} bg={useColorModeValue("white", "gray.900")} borderRight="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")} p={6}>
                                <Heading as="h3" size="md" mb={4} color={useColorModeValue("gray.800", "gray.100")}>
                                    Challenge
                                </Heading>
                                <VStack spacing={4} align="stretch">
                                    <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={4}>
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" fontWeight="bold" color="brand.500">
                                                Two Sum
                                            </Text>
                                            <Badge colorScheme="green" variant="subtle" fontSize="xs">
                                                Easy
                                            </Badge>
                                        </HStack>
                                        <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mb={3}>
                                            Given an array of integers, return indices of two numbers that add up to target.
                                        </Text>
                                        <HStack justify="space-between" fontSize="xs" color="gray.500">
                                            <Text>⏱ 15 min</Text>
                                            <Text>🎯 100 pts</Text>
                                        </HStack>
                                    </Box>

                                    <Box>
                                        <Text fontSize="xs" fontWeight="bold" color={useColorModeValue("gray.500", "gray.400")} textTransform="uppercase" mb={2}>
                                            Test Cases
                                        </Text>
                                        <VStack spacing={2} align="stretch">
                                            <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={3} fontSize="xs" fontFamily="mono">
                                                <Text color={useColorModeValue("gray.500", "gray.400")}>Input: [2,7,11,15], 9</Text>
                                                <Text color="green.400">Output: [0,1]</Text>
                                            </Box>
                                            <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={3} fontSize="xs" fontFamily="mono">
                                                <Text color={useColorModeValue("gray.500", "gray.400")}>Input: [3,2,4], 6</Text>
                                                <Text color="green.400">Output: [1,2]</Text>
                                            </Box>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </GridItem>

                            {/* Coding Arena */}
                            <GridItem colSpan={{ base: 12, lg: 6 }} bg={useColorModeValue("white", "gray.900")} p={6}>
                                {mode === 'ai' ? (
                                    // Single Terminal
                                    <Box>
                                        <HStack justify="space-between" mb={4}>
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="semibold" color={useColorModeValue("gray.800", "gray.100")}>
                                                    Your Solution
                                                </Text>
                                                <Select size="xs" width="auto" bg={useColorModeValue("gray.50", "gray.800")} borderColor={useColorModeValue("gray.200", "gray.700")}>
                                                    <option>JavaScript</option>
                                                    <option>Python</option>
                                                </Select>
                                            </HStack>
                                            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
                                                ⏱ 12:34
                                            </Text>
                                        </HStack>
                                        <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={4} mb={4} h="80" overflow="auto">
                                            <Code display="block" whiteSpace="pre" bg="transparent" color={useColorModeValue("gray.600", "gray.300")} fontSize="sm">
                                                {`function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`}
                                            </Code>
                                        </Box>
                                        <HStack spacing={3} mb={4}>
                                            <Button flex={1} variant="primary">Run Code</Button>
                                            <Button flex={1} colorScheme="green">Submit</Button>
                                        </HStack>
                                        <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={4}>
                                            <Text fontSize="xs" fontWeight="semibold" color={useColorModeValue("gray.500", "gray.400")} mb={2}>
                                                Console Output
                                            </Text>
                                            <Text fontSize="xs" fontFamily="mono" color="green.400">
                                                ✓ Test case 1 passed
                                            </Text>
                                            <Text fontSize="xs" fontFamily="mono" color="green.400">
                                                ✓ Test case 2 passed
                                            </Text>
                                            <Text fontSize="xs" fontFamily="mono" color={useColorModeValue("gray.500", "gray.400")} mt={2}>
                                                Runtime: 52ms | Memory: 42.1MB
                                            </Text>
                                        </Box>
                                    </Box>
                                ) : (
                                    // Dual Terminal
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        {/* Your Terminal */}
                                        <Box>
                                            <HStack justify="space-between" mb={3}>
                                                <Text fontSize="sm" fontWeight="bold" color="brand.500">You</Text>
                                                <Text fontSize="xs" color="green.400">● Active</Text>
                                            </HStack>
                                            <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={3} h="64" overflow="auto" mb={3}>
                                                <Code display="block" whiteSpace="pre" bg="transparent" color={useColorModeValue("gray.600", "gray.300")} fontSize="xs">
                                                    {`function twoSum(nums, target) {
  const map = new Map();
  // Live coding...
  return [];
}`}
                                                </Code>
                                            </Box>
                                        </Box>
                                        {/* Opponent Terminal */}
                                        <Box>
                                            <HStack justify="space-between" mb={3}>
                                                <Text fontSize="sm" fontWeight="bold" color="yellow.400">Opponent</Text>
                                                <Text fontSize="xs" color="yellow.400">Typing...</Text>
                                            </HStack>
                                            <Box bg={useColorModeValue("gray.50", "gray.800")} borderRadius="8px" p={3} h="64" overflow="hidden" mb={3} position="relative">
                                                <Box position="absolute" inset={0} bg="rgba(17, 24, 39, 0.8)" backdropFilter="blur(4px)" display="flex" alignItems="center" justifyContent="center">
                                                    <VStack>
                                                        <Box w={12} h={12} borderRadius="full" border="4px solid" borderColor="yellow.400" borderTopColor="transparent" animation="spin 1s linear infinite" />
                                                        <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>Opponent is coding...</Text>
                                                    </VStack>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </GridItem>

                            {/* Leaderboard Sidebar */}
                            <GridItem colSpan={{ base: 12, lg: 3 }} bg={useColorModeValue("white", "gray.900")} borderLeft="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")} p={6}>
                                <Heading as="h3" size="md" mb={4} color={useColorModeValue("gray.800", "gray.100")}>
                                    Live Leaderboard
                                </Heading>
                                <VStack spacing={3} align="stretch">
                                    {[
                                        { rank: 1, name: 'CodeMaster', score: '2,450 pts', color: 'yellow.500', flame: 12 },
                                        { rank: 2, name: 'AlgoNinja', score: '2,180 pts', color: 'gray.700', flame: 8 },
                                        { rank: 3, name: 'You', score: '1,920 pts', color: 'brand.500', flame: 5, active: true },
                                        { rank: 4, name: 'DevQueen', score: '1,750 pts', color: 'gray.700', flame: 4 },
                                    ].map((user) => (
                                        <HStack
                                            key={user.rank}
                                            bg={user.active ? useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.1)') : useColorModeValue('white', 'gray.800')}
                                            borderRadius="10px"
                                            p={3}
                                            border="1px solid"
                                            borderColor={user.active ? 'cyan.400' : useColorModeValue('gray.200', 'transparent')}
                                            boxShadow={user.active ? '0 0 10px rgba(34, 211, 238, 0.2)' : useColorModeValue('0 2px 4px rgba(0,0,0,0.05)', 'none')}
                                            transition="all 0.2s"
                                            _hover={{ transform: 'translateY(-2px)', boxShadow: useColorModeValue('md', 'lg') }}
                                        >
                                            <Box
                                                w={8}
                                                h={8}
                                                borderRadius="full"
                                                bg={user.rank === 1 ? 'yellow.500' : user.active ? 'brand.500' : useColorModeValue('gray.200', 'gray.700')}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontWeight="bold"
                                                fontSize="sm"
                                                color={user.rank === 1 || user.active ? 'white' : useColorModeValue('gray.700', 'gray.300')}
                                            >
                                                {user.rank}
                                            </Box>
                                            <Box flex={1} ml={1}>
                                                <Text fontSize="sm" fontWeight="semibold" color={user.active ? 'brand.500' : useColorModeValue('gray.900', 'gray.100')}>
                                                    {user.name}
                                                </Text>
                                                <Text fontSize="xs" fontWeight="medium" color={useColorModeValue('gray.500', 'gray.400')}>
                                                    {user.score}
                                                </Text>
                                            </Box>
                                            <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2} py={0.5}>
                                                🔥 {user.flame}
                                            </Badge>
                                        </HStack>
                                    ))}
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
