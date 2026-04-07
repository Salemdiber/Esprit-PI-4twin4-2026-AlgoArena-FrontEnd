/**
 * ResetSuccessPage – /reset-success
 *
 * Confirms password update success.
 * Auto-redirects to login after 5 seconds.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Text, Icon, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AuthCard from '../components/AuthCard';
import AuthHeader from '../components/AuthHeader';

const MotionIcon = motion.create(Icon);

const CheckCircleIcon = (props) => (
    <Icon
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
);

const ResetSuccessPage = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            navigate('/signin');
        }
    }, [countdown, navigate]);

    return (
        <AuthCard>
            {/* Animated Check Icon */}
            <Box display="flex" justifyContent="center" mb={6}>
                <MotionIcon
                    as={CheckCircleIcon}
                    w={20}
                    h={20}
                    color="#10b981"
                    filter="drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))"
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                />
            </Box>

            <AuthHeader
                title="Password Updated Successfully"
                subtitle="Your password has been changed. You can now log in with your new password."
            />

            {/* Auto-redirect notice */}
            <Text textAlign="center" color="gray.500" fontSize="xs" mb={6}>
                Redirecting to login in {countdown}s...
            </Text>

            {/* Manual button */}
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
                onClick={() => navigate('/signin')}
            >
                Go to Login
            </Button>
        </AuthCard>
    );
};

export default ResetSuccessPage;
