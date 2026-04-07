/**
 * TwoFactorSection – displays 2FA status, toggle switch, and setup button.
 *
 * When user clicks "Set Up 2FA", navigates to /profile/2fa-setup.
 */
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Button,
    Switch,
    Badge,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useProfile } from '../context/ProfileContext';

const MotionBox = motion.create(Box);

/* Inline icons */
const ShieldOffIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19.69 14a6.9 6.9 0 00.31-2V5l-8-3-3.16 1.18" />
        <path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 005.62-4.38" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </Icon>
);

const ShieldCheckIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </Icon>
);

const ShieldPlusIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="9" y1="12" x2="15" y2="12" />
    </Icon>
);

const TwoFactorSection = () => {
    const { twoFactorEnabled, setTwoFactorEnabled } = useProfile();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const handleToggle = () => {
        if (!twoFactorEnabled) {
            // When enabling, navigate to setup
            navigate('/profile/2fa-setup');
        } else {
            setTwoFactorEnabled(false);
        }
    };

    return (
        <MotionBox
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            bg="var(--color-bg-secondary)"
            borderRadius="12px"
            boxShadow="var(--shadow-card)"
            borderTop="3px solid #22d3ee"
            p={{ base: 6, md: 8 }}
            position="relative"
            overflow="hidden"
        >
            {/* Background glow */}
            <Box
                position="absolute"
                top={0}
                right={0}
                w="256px"
                h="256px"
                bg="rgba(34, 211, 238, 0.05)"
                borderRadius="full"
                filter="blur(60px)"
                transform="translate(33%, -50%)"
                pointerEvents="none"
            />

            {/* Header row */}
            <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', md: 'center' }}
                mb={6}
                gap={4}
                position="relative"
                zIndex={1}
            >
                <Flex align="center" gap={3}>
                    <Text fontFamily="heading" fontSize="lg" fontWeight="600" color={useColorModeValue("gray.800","gray.100")}>
                        Two-Factor Authentication
                    </Text>
                    <Badge
                        display="flex"
                        alignItems="center"
                        gap="6px"
                        px="10px"
                        py="4px"
                        borderRadius="6px"
                        fontSize="xs"
                        fontWeight="600"
                        bg={twoFactorEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(71, 85, 105, 0.5)'}
                        color={twoFactorEnabled ? '#10b981' : 'gray.400'}
                        border="1px solid"
                        borderColor={twoFactorEnabled ? 'rgba(16, 185, 129, 0.2)' : '#475569'}
                    >
                        {twoFactorEnabled ? (
                            <ShieldCheckIcon w={3} h={3} />
                        ) : (
                            <ShieldOffIcon w={3} h={3} />
                        )}
                        {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                </Flex>

                {/* Toggle */}
                <Switch
                    size="lg"
                    isChecked={twoFactorEnabled}
                    onChange={handleToggle}
                    sx={{
                        '& .chakra-switch__track': {
                            bg: twoFactorEnabled ? '#22d3ee' : 'var(--color-border)',
                            boxShadow: twoFactorEnabled ? '0 0 20px rgba(34, 211, 238, 0.3)' : 'none',
                        },
                    }}
                />
            </Flex>

            {/* Description + buttons */}
            <Box position="relative" zIndex={1}>
                <Text color={useColorModeValue("gray.500","gray.400")} fontSize="sm" lineHeight="1.7" maxW="2xl" mb={6}>
                    Add an extra layer of security to your account. You'll need to enter a verification code in addition to your password when signing in.
                </Text>

                <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
                    <Button
                        leftIcon={<ShieldPlusIcon w={4} h={4} />}
                        bg="#22d3ee"
                        color="#0f172a"
                        fontWeight="600"
                        borderRadius="6px"
                        fontSize="sm"
                        boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                        _hover={{
                            bg: '#67e8f9',
                            boxShadow: '0 8px 24px rgba(34, 211, 238, 0.4)',
                        }}
                        onClick={() => navigate('/profile/2fa-setup')}
                    >
                        Set Up 2FA
                    </Button>

                    <Button
                        variant="outline"
                        borderColor="var(--color-border-hover)"
                        color={useColorModeValue("gray.600","gray.300")}
                        fontWeight="500"
                        borderRadius="6px"
                        fontSize="sm"
                        _hover={{ color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.5)' }}
                    >
                        Learn more
                    </Button>
                </Flex>
            </Box>
        </MotionBox>
    );
};

export default TwoFactorSection;
