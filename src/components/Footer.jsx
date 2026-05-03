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
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    const bg = useColorModeValue('gray.100', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const headingColor = useColorModeValue('gray.800', 'gray.100');
    const textColor = useColorModeValue('gray.600', 'gray.300');
    // gray.500 on gray.100 is ~3.4:1 (fails WCAG AA). Bump to gray.600 for 5.7:1.
    const mutedColor = useColorModeValue('gray.600', 'gray.300');

    return (
        <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderColor} py={12} transition="background-color 0.3s ease">
            <Container maxW="7xl">
                <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8} mb={8}>
                    {/* Column 1 - Brand */}
                    <GridItem>
                        <Heading as="h2" size="md" fontFamily="heading" color="brand.500" mb={4}>
                            {t('common.algoArena')}
                        </Heading>
                        <Text fontSize="sm" color={textColor}>
                            {t('footer.tagline')}
                        </Text>
                    </GridItem>

                    {/* Column 2 - Product */}
                    <GridItem>
                        <Heading as="h3" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            {t('footer.product')}
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link as={RouterLink} to="/challenges" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.gameModes')}</Link>
                            <Link as={RouterLink} to="/battles" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.arena')}</Link>
                            <Link as={RouterLink} to="/leaderboard" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.leaderboards')}</Link>
                            <Link as={RouterLink} to="/" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.roadmap')}</Link>
                        </VStack>
                    </GridItem>

                    {/* Column 3 - Resources */}
                    <GridItem>
                        <Heading as="h3" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            {t('footer.resources')}
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link as={RouterLink} to="/" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.docs')}</Link>
                            <Link as={RouterLink} to="/" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.api')}</Link>
                            <Link as={RouterLink} to="/community" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.blog')}</Link>
                            <Link as={RouterLink} to="/" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.support')}</Link>
                        </VStack>
                    </GridItem>

                    {/* Column 4 - Community */}
                    <GridItem>
                        <Heading as="h3" size="sm" fontFamily="heading" color={headingColor} mb={4}>
                            {t('footer.community')}
                        </Heading>
                        <VStack align="start" spacing={2} fontSize="sm">
                            <Link href="https://discord.gg/algoarena" isExternal rel="noopener noreferrer" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.discord')}</Link>
                            <Link href="https://github.com/algoarena" isExternal rel="noopener noreferrer" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.github')}</Link>
                            <Link href="https://twitter.com/algoarena" isExternal rel="noopener noreferrer" color={textColor} _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.twitter')}</Link>
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
                    <Text mb={{ base: 4, sm: 0 }}>{t('footer.rights', { year: 2026 })}</Text>
                    <HStack spacing={6}>
                        <Link as={RouterLink} to="/" _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.privacy')}</Link>
                        <Link as={RouterLink} to="/" _hover={{ color: 'brand.500' }} transition="colors 0.3s">{t('footer.terms')}</Link>
                    </HStack>
                </Flex>
            </Container >
        </Box >
    );
};

export default Footer;
