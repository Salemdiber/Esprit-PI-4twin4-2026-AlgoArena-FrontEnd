import React, { useEffect, useState } from 'react';
import { Box, Button, Text, VStack, Spinner, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { billingService } from '../../../../services/billingService';
import { useAuth } from '../../auth/context/AuthContext';

const BillingReturnPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { reload, updateCurrentUser } = useAuth();
    const params = new URLSearchParams(location.search);
    const status = params.get('hint_purchase');
    const sessionId = params.get('session_id');
    const [isConfirming, setIsConfirming] = useState(status === 'success');
    const [confirmationError, setConfirmationError] = useState('');

    useEffect(() => {
        let timer;
        let cancelled = false;

        const finalize = async () => {
            if (status !== 'success') {
                timer = setTimeout(() => {
                    navigate('/profile/billing', { replace: true });
                }, 1400);
                return;
            }

            if (!sessionId) {
                setConfirmationError('Missing payment session id.');
                timer = setTimeout(() => {
                    navigate('/profile/billing', { replace: true });
                }, 2200);
                return;
            }

            try {
                const result = await billingService.confirmStripeCheckoutSession({ sessionId });
                if (cancelled) return;

                if (result?.hintCredits !== undefined) {
                    updateCurrentUser({ hintCredits: result.hintCredits });
                }

                await reload();
            } catch (error) {
                if (!cancelled) {
                    setConfirmationError(error?.message || 'Unable to confirm payment.');
                }
            } finally {
                if (!cancelled) {
                    setIsConfirming(false);
                    timer = setTimeout(() => {
                        navigate('/profile/billing', { replace: true });
                    }, 1600);
                }
            }
        };

        finalize();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [navigate, reload, sessionId, status, updateCurrentUser]);

    return (
        <Box minH="100vh" pt={{ base: 24, md: 28 }} px={{ base: 4, sm: 6, lg: 8 }} bg="var(--color-bg-primary)">
            <VStack maxW="2xl" mx="auto" spacing={4} textAlign="center" py={16}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="cyan.300" fontWeight="800">Billing</Text>
                <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="900" color={useColorModeValue('gray.100', 'white')}>
                    {status === 'success' ? 'Payment successful' : 'Payment cancelled'}
                </Text>
                <Text color={useColorModeValue('gray.400', 'gray.400')}>
                    {status === 'success'
                        ? 'Your Arena Coins are being updated. You will be redirected to billing history.'
                        : 'The checkout was cancelled. You will be redirected back to billing history.'}
                </Text>
                {isConfirming ? <Spinner color="cyan.300" /> : null}
                {confirmationError ? (
                    <Text color="red.300" fontSize="sm">{confirmationError}</Text>
                ) : null}
                <Button colorScheme="cyan" onClick={() => navigate('/profile/billing')}>Go to billing history</Button>
            </VStack>
        </Box>
    );
};

export default BillingReturnPage;