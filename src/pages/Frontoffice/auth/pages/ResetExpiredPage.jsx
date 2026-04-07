/**
 * ResetExpiredPage – /reset-expired
 *
 * Shows when a reset token is invalid or expired.
 * Prompts user to request a new link.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Text, Icon, Divider, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AuthCard from '../components/AuthCard';
import AuthHeader from '../components/AuthHeader';

const MotionIcon = motion.create(Icon);

const ClockIcon = (props) => (
    <Icon
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </Icon>
);

const ArrowLeftIcon = (props) => (
    <Icon
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </Icon>
);

const ResetExpiredPage = () => {
    const navigate = useNavigate();

    return (
        <AuthCard>
            {/* Animated Warning Icon */}
            <Box display="flex" justifyContent="center" mb={6}>
                <MotionIcon
                    as={ClockIcon}
                    w={16}
                    h={16}
                    color="#f59e0b"
                    filter="drop-shadow(0 0 12px rgba(245, 158, 11, 0.3))"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                />
            </Box>

            <AuthHeader
                title="Reset Link Expired"
                subtitle="This reset link is invalid or has expired."
            />

            <Text textAlign="center" color="gray.400" fontSize="sm" mb={6} mt={-4}>
                Password reset links are valid for 1 hour. Please request a new one.
            </Text>

            {/* Request New Link Button */}
            <Button
                w="100%"
                h="48px"
                bg="#22d3ee"
                color="#0f172a"
                fontWeight="semibold"
                borderRadius="8px"
                boxShadow="0 4px 16px rgba(34, 211, 238, 0.2)"
                _hover={{
                    bg: '#06b6d4',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 24px rgba(34, 211, 238, 0.35)',
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                onClick={() => navigate('/forgot-password')}
                mb={6}
            >
                Request New Reset Link
            </Button>

            <Divider borderColor="var(--color-border)" my={6} />

            {/* Back to Login */}
            <Button
                variant="ghost"
                w="100%"
                color="#22d3ee"
                fontSize="sm"
                fontWeight="normal"
                leftIcon={<ArrowLeftIcon w={4} h={4} />}
                _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                onClick={() => navigate('/signin')}
            >
                Back to Login
            </Button>
        </AuthCard>
    );
};

export default ResetExpiredPage;
