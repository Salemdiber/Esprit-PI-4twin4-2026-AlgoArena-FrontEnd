import {
    Box,
    Container,
    Grid,
    GridItem,
    Heading,
    Text,
    VStack,
    HStack,
    Link,
    Divider,
    Flex,
    useColorModeValue,
} from '@chakra-ui/react';

const Footer = () => {
    const bg = useColorModeValue('gray.100', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderColor} py={12} transition="background-color 0.3s ease">
            <Container maxW="7xl">
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8} mb={8}>
                    {/* Column 1 - Brand */}
                    <GridItem>
                        <Heading as="h3" size="md" fontFamily="heading" color="brand.500" mb={4}>
                            AlgoArena
                        </Heading>
                        <Text fontSize="sm" color={textColor}>
                            The ultimate AI-powered competitive coding platform. Battle, learn, and master algorithms through interactive simulations.
                        </Text>
                    </GridItem>

                    {/* Column 2 - Product */}
                    <GridItem>
                        <Heading as="h4" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            Product
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Game Modes</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Arena</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Leaderboards</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Roadmap</Link>
                        </VStack>
                    </GridItem>

                    {/* Column 3 - Resources */}
                    <GridItem>
                        <Heading as="h4" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            Resources
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Docs</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">API</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Blog</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Support</Link>
                        </VStack>
                    </GridItem>

                    {/* Column 4 - Community */}
                    <GridItem>
                        <Heading as="h4" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            Community
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Discord</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">GitHub</Link>
                            <Link href="#" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">Twitter</Link>
                        </VStack>
                    </GridItem>
                </Grid>

                {/* Bottom Section */}
                <Divider borderColor={borderColor} mb={8} />
                <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align="center"
                    fontSize="sm"
                    color={mutedColor}
                >
                    <Text mb={{ base: 4, sm: 0 }}>© 2026 AlgoArena. All rights reserved.</Text>
                    <HStack spacing={6}>
                        <Link href="#" _hover={{ color: 'brand.500' }} transition="colors 0.3s">Privacy Policy</Link>
                        <Link href="#" _hover={{ color: 'brand.500' }} transition="colors 0.3s">Terms</Link>
                    </HStack>
                </Flex>
            </Container >
        </Box >
    );
};

export default Footer;
