/**
 * EmailSentPage – /email-sent
 *
 * Shows confirmation that an email has been sent.
 * Includes a countdown timer for the "Resend" button.
 */
import React, { useState, useEffect } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Text,
    Icon,
    Link,
    Divider,
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AuthCard from '../components/AuthCard';
import AuthHeader from '../components/AuthHeader';

const MotionIcon = motion.create(Icon);

const MailCheckIcon = (props) => (
    <Icon
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}
    >
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        <path d="m16 19 2 2 4-4" />
    </Icon>
);

const InfoIcon = (props) => (
    <Icon
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
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

const EmailSentPage = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email';
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = () => {
        // Simulate resend logic
        setCountdown(60);
    };

    return (
        <AuthCard>
            {/* Animated Icon */}
            <Box display="flex" justifyContent="center" mb={6}>
                <MotionIcon
                    as={MailCheckIcon}
                    w={16}
                    h={16}
                    color="#22d3ee"
                    filter="drop-shadow(0 0 12px rgba(34, 211, 238, 0.4))"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring' }}
                />
            </Box>

            <AuthHeader
                title="Check Your Email"
                subtitle={`If an account exists for ${email}, a reset link has been sent.`}
            />

            {/* Security Notice */}
            <Box
                bg="rgba(34, 211, 238, 0.08)"
                border="1px solid"
                borderColor="rgba(34, 211, 238, 0.2)"
                borderRadius="8px"
                p={4}
                mb={6}
            >
                <VStack align="start" spacing={1}>
                    <Box display="flex" gap={3}>
                        <InfoIcon w={4} h={4} color="#22d3ee" mt={0.5} flexShrink={0} />
                        <Text color="gray.300" fontSize="xs" lineHeight="relaxed">
                            For security, we don't confirm whether an email is registered except via the email itself.
                        </Text>
                    </Box>
                </VStack>
            </Box>

            {/* Resend Button */}
            <Button
                w="100%"
                h="48px"
                bg="transparent"
                border="1px solid"
                borderColor="var(--color-border)"
                color="gray.400"
                fontSize="sm"
                borderRadius="8px"
                disabled={countdown > 0}
                _disabled={{ opacity: 0.6, cursor: 'not-allowed', _hover: { borderColor: 'gray.600' } }}
                _hover={{
                    borderColor: '#22d3ee',
                    color: '#22d3ee',
                    bg: 'rgba(34, 211, 238, 0.1)',
                }}
                transition="all 0.2s"
                onClick={handleResend}
                mb={6}
            >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            </Button>

            <Divider borderColor="var(--color-border)" my={6} />

            {/* Back to Login */}
            <Box textAlign="center">
                <Link
                    as={RouterLink}
                    to="/signin"
                    color="#22d3ee"
                    fontSize="sm"
                    _hover={{ textDecoration: 'underline' }}
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                >
                    <ArrowLeftIcon w={4} h={4} />
                    Back to Login
                </Link>
            </Box>
        </AuthCard>
    );
};

export default EmailSentPage;
