import React from 'react';
import { Box, Flex, HStack, Text, Button, Image, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../assets/logo_algoarena.png';

const AuthLayout = ({ children, activeTab = 'signin' }) => {
    const bg = useColorModeValue('#f8fafc', '#0f172a');
    const gridColor = useColorModeValue('rgba(0,0,0,0.04)', 'rgba(30,41,59,0.5)');
    const pillBg = useColorModeValue('rgba(241,245,249,0.8)', 'rgba(30,41,59,0.5)');
    const pillBorder = useColorModeValue('gray.200', 'whiteAlpha.100');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const activeTextColor = useColorModeValue('white', '#0f172a');
    const hoverColor = useColorModeValue('gray.800', 'white');
    const { t } = useTranslation();

    return (
        <Box minH="100vh" bg={bg} position="relative" overflow="hidden" display="flex" flexDirection="column" transition="background-color 0.3s ease">
            {/* Background */}
            <Box position="fixed" inset={0} zIndex={0} pointerEvents="none">
                <Box
                    position="absolute" inset={0} opacity={0.4}
                    backgroundSize="40px 40px"
                    backgroundImage={`linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`}
                    sx={{ maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }}
                />
                <Text position="absolute" top="20%" left="10%" fontFamily="mono" fontSize="xs" color="brand.500" opacity={0.2} className="float-animation">
                    const arena = new Arena();
                </Text>
                <Text position="absolute" bottom="40%" right="20%" fontFamily="mono" fontSize="xs" color="green.400" opacity={0.2} className="float-animation" style={{ animationDelay: '2s' }}>
                    {'function optimize(O_n) { ... }'}
                </Text>
                <Box position="absolute" top="-10%" left="-10%" w="384px" h="384px" bg="blue.600" borderRadius="full" mixBlendMode="screen" filter="blur(128px)" opacity={0.2} className="animate-pulse-glow" />
                <Box position="absolute" bottom="-10%" right="-10%" w="384px" h="384px" bg="cyan.600" borderRadius="full" mixBlendMode="screen" filter="blur(128px)" opacity={0.2} className="animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </Box>

            {/* Nav */}
            <Flex as="nav" position="relative" zIndex={50} w="100%" p={6} justify="space-between" align="center" maxW="7xl" mx="auto">
                <HStack as={RouterLink} to="/" spacing={2} _hover={{ textDecoration: 'none' }}>
                    <Image src={Logo} alt={t('auth.layout.logoAlt')} h={{ base: '48px', md: '56px' }} objectFit="contain" />
                </HStack>
                <HStack spacing={0} bg={pillBg} backdropFilter="blur(12px)" p={1} borderRadius="lg" border="1px solid" borderColor={pillBorder}>
                    <Button as={RouterLink} to="/signin" size="sm" px={4} borderRadius="md" fontSize="sm" fontWeight="medium"
                        bg={activeTab === 'signin' ? 'brand.500' : 'transparent'} color={activeTab === 'signin' ? activeTextColor : inactiveColor}
                        boxShadow={activeTab === 'signin' ? '0 0 20px -5px rgba(34,211,238,0.3)' : 'none'}
                        _hover={activeTab === 'signin' ? { bg: 'brand.400' } : { color: hoverColor }}>
                        {t('auth.layout.signIn')}
                    </Button>
                    <Button as={RouterLink} to="/signup" size="sm" px={4} borderRadius="md" fontSize="sm" fontWeight="medium"
                        bg={activeTab === 'signup' ? 'brand.500' : 'transparent'} color={activeTab === 'signup' ? activeTextColor : inactiveColor}
                        boxShadow={activeTab === 'signup' ? '0 0 20px -5px rgba(34,211,238,0.3)' : 'none'}
                        _hover={activeTab === 'signup' ? { bg: 'brand.400' } : { color: hoverColor }}>
                        {t('auth.layout.signUp')}
                    </Button>
                </HStack>
            </Flex>

            {/* Content */}
            <Flex flex={1} position="relative" zIndex={10} direction="column" align="center" justify="center" p={{ base: 4, md: 8 }} w="100%" maxW="7xl" mx="auto">
                {children}
            </Flex>
        </Box>
    );
};

export default AuthLayout;
