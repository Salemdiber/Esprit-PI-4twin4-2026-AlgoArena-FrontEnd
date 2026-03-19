import React from 'react';
import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const WarningIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
);

const SuccessIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5" />
    </Icon>
);

const paletteByTone = {
    error: {
        bg: 'rgba(254, 226, 226, 0.9)',
        border: 'rgba(248, 113, 113, 0.55)',
        color: '#7f1d1d',
        shadow: '0 12px 24px -18px rgba(239, 68, 68, 0.65)',
        Icon: WarningIcon,
    },
    success: {
        bg: 'rgba(220, 252, 231, 0.9)',
        border: 'rgba(74, 222, 128, 0.5)',
        color: '#14532d',
        shadow: '0 12px 24px -18px rgba(34, 197, 94, 0.55)',
        Icon: SuccessIcon,
    },
};

const FormFeedbackAlert = ({ message, tone = 'error' }) => {
    const palette = paletteByTone[tone] || paletteByTone.error;
    const AlertIcon = palette.Icon;

    return (
        <AnimatePresence mode="wait">
            {message ? (
                <MotionBox
                    key={`${tone}-${message}`}
                    role="alert"
                    aria-live="polite"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    bg={palette.bg}
                    border="1px solid"
                    borderColor={palette.border}
                    borderRadius="12px"
                    px={3}
                    py={2.5}
                    boxShadow={palette.shadow}
                    backdropFilter="blur(4px)"
                >
                    <HStack align="start" spacing={2.5}>
                        <AlertIcon mt="1px" boxSize={4.5} color={palette.color} />
                        <Text fontSize="12px" lineHeight="1.5" fontWeight="semibold" color={palette.color}>
                            {message}
                        </Text>
                    </HStack>
                </MotionBox>
            ) : null}
        </AnimatePresence>
    );
};

export default FormFeedbackAlert;
