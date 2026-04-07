import {
    Box,
    Container,
    Heading,
    Text,
    Grid,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';

const statsData = [
    { value: '12,450', label: 'Battles Completed', color: 'brand.400', bg: 'rgba(34, 211, 238, 0.05)' },
    { value: '3,200', label: 'Active Coders', color: 'green.400', bg: 'rgba(72, 187, 120, 0.05)' },
    { value: '1,050', label: 'Daily AI Challenges', color: 'yellow.400', bg: 'rgba(236, 201, 75, 0.05)' },
    { value: '98%', label: 'Success Rate', color: 'purple.400', bg: 'rgba(159, 122, 234, 0.05)' },
];

const Stats = () => {
    const sectionBg = useColorModeValue('rgba(241,245,249,0.6)', 'rgba(31,41,55,0.3)');
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const cardBg = useColorModeValue('white', 'gray.900');
    const cardBorder = useColorModeValue('gray.200', 'gray.700');
    const labelColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Box id="leaderboards" as="section" py={20} bg={sectionBg}>
            <Container maxW="7xl">
                <VStack spacing={16}>
                    <VStack spacing={4} textAlign="center">
                        <Heading as="h2" size="2xl" color={headingColor} fontFamily="heading">
                            Join the Arena
                        </Heading>
                        <Text fontSize="xl" color={textColor}>
                            Thousands of developers competing daily
                        </Text>
                    </VStack>

                    <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6} width="100%">
                        {statsData.map((stat, index) => (
                            <Box
                                key={index}
                                bg={cardBg}
                                borderRadius="16px"
                                p={8}
                                textAlign="center"
                                border="1px solid"
                                borderColor={cardBorder}
                                boxShadow="custom"
                                position="relative"
                                overflow="hidden"
                                transition="background-color 0.3s ease, border-color 0.3s ease"
                            >
                                <Box position="absolute" inset={0} bg={stat.bg} filter="blur(30px)" />
                                <Box position="relative" zIndex={10}>
                                    <Text fontSize="5xl" fontWeight="bold" color={stat.color} mb={2}>
                                        {stat.value}
                                    </Text>
                                    <Text color={labelColor}>
                                        {stat.label}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </Grid>
                </VStack>
            </Container>
        </Box>
    );
};

export default Stats;
