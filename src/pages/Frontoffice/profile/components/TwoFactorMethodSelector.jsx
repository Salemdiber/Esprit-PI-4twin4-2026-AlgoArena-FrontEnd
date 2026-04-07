/**
 * TwoFactorMethodSelector – card-based method picker for 2FA setup.
 *
 * Props:
 *  • selectedMethod   'authenticator' | 'email' | null
 *  • onSelect         (method) => void
 */
import React from 'react';
import { SimpleGrid, Box, VStack, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';

const MotionBox = motion.create(Box);

/* Inline icons */
const SmartphoneIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </Icon>
);

const MailIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </Icon>
);

const METHODS = [
    {
        id: 'authenticator',
        icon: SmartphoneIcon,
        title: 'Mobile Authenticator',
        desc: 'Use an app like Google Authenticator or Authy',
    },
    {
        id: 'email',
        icon: MailIcon,
        title: 'Email Verification',
        desc: 'Receive a code via your registered email',
    },
];

const TwoFactorMethodSelector = ({ selectedMethod, onSelect }) => {
    const prefersReducedMotion = useReducedMotion();

    const cardBgHover = useColorModeValue('rgba(34, 211, 238, 0.05)', 'rgba(34, 211, 238, 0.05)');
    const cardBgUnselected = useColorModeValue('white', 'var(--color-bg-secondary)');
    const cardBgSelected = useColorModeValue('cyan.50', 'rgba(34, 211, 238, 0.08)');

    const iconWrapperBgUnselected = useColorModeValue('gray.100', 'rgba(71, 85, 105, 0.4)');
    const iconWrapperBgSelected = useColorModeValue('cyan.100', 'rgba(34, 211, 238, 0.15)');

    const textTitleUnselected = useColorModeValue('gray.800', 'gray.200');
    const textTitleSelected = useColorModeValue('brand.500', '#22d3ee');
    const textDesc = useColorModeValue('gray.600', 'gray.400');
    const iconColorUnselected = useColorModeValue('gray.500', 'gray.400');
    const shadowUnselected = useColorModeValue('sm', 'none');

    return (
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            {METHODS.map((m) => {
                const isSelected = selectedMethod === m.id;
                return (
                    <MotionBox
                        key={m.id}
                        as="button"
                        onClick={() => onSelect(m.id)}
                        textAlign="center"
                        p={6}
                        bg={isSelected ? cardBgSelected : cardBgUnselected}
                        border="2px solid"
                        borderColor={isSelected ? '#22d3ee' : 'var(--color-border)'}
                        borderRadius="12px"
                        boxShadow={isSelected ? '0 0 10px rgba(34, 211, 238, 0.2)' : shadowUnselected}
                        cursor="pointer"
                        _hover={{ borderColor: '#22d3ee', bg: cardBgHover, transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    >
                        <VStack spacing={3}>
                            <Box
                                p={3}
                                borderRadius="full"
                                bg={isSelected ? iconWrapperBgSelected : iconWrapperBgUnselected}
                            >
                                <m.icon w={6} h={6} color={isSelected ? textTitleSelected : iconColorUnselected} />
                            </Box>
                            <Text fontFamily="heading" fontWeight="600" color={isSelected ? textTitleSelected : textTitleUnselected}>
                                {m.title}
                            </Text>
                            <Text fontSize="xs" fontWeight="500" color={textDesc}>
                                {m.desc}
                            </Text>
                        </VStack>
                    </MotionBox>
                );
            })}
        </SimpleGrid>
    );
};

export default TwoFactorMethodSelector;


