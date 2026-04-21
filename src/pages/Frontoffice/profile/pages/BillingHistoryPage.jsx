import React from 'react';
import { Box, Button, HStack, Text, VStack, Badge, Divider, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

const BillingHistoryPage = () => {
    const navigate = useNavigate();
    const { coinBalance, coinHistory } = useAuth();

    return (
        <Box minH="100vh" pt={{ base: 24, md: 28 }} pb={{ base: 10, md: 16 }} px={{ base: 4, sm: 6, lg: 8 }} bg="var(--color-bg-primary)">
            <Box maxW="4xl" mx="auto">
                <HStack justify="space-between" align="start" flexWrap="wrap" gap={4} mb={8}>
                    <Box>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="cyan.300" fontWeight="700">Billing</Text>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" color={useColorModeValue('gray.100', 'white')} mt={1}>Billing history</Text>
                        <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.400')} mt={1}>Track your Arena Coins balance and wallet activity.</Text>
                    </Box>
                    <Button variant="outline" borderColor="rgba(34, 211, 238, 0.3)" color="cyan.300" _hover={{ bg: 'rgba(34, 211, 238, 0.08)' }} onClick={() => navigate('/profile')}>Back to profile</Button>
                </HStack>

                <Box p={{ base: 5, md: 6 }} borderRadius="16px" border="1px solid" borderColor="rgba(34, 211, 238, 0.16)" bg="rgba(15, 23, 42, 0.72)" mb={6}>
                    <Text fontSize="sm" color={useColorModeValue('gray.400', 'gray.400')}>Current balance</Text>
                    <Text fontSize="4xl" fontWeight="900" color="cyan.300">{coinBalance}</Text>
                </Box>

                <VStack align="stretch" spacing={3}>
                    {(coinHistory || []).length === 0 ? (
                        <Box p={5} borderRadius="16px" bg="rgba(15, 23, 42, 0.72)" border="1px solid" borderColor="rgba(148, 163, 184, 0.12)">
                            <Text color={useColorModeValue('gray.400', 'gray.400')}>No billing activity yet.</Text>
                        </Box>
                    ) : (coinHistory || []).map((entry) => (
                        <Box key={entry.id} p={4} borderRadius="16px" bg="rgba(15, 23, 42, 0.72)" border="1px solid" borderColor="rgba(148, 163, 184, 0.12)">
                            <HStack justify="space-between" align="start" gap={4}>
                                <Box>
                                    <HStack spacing={2} mb={1}>
                                        <Badge colorScheme={entry.type === 'spend' ? 'red' : 'green'} borderRadius="full" px={2}>
                                            {entry.type === 'spend' ? 'Charge' : 'Top-up'}
                                        </Badge>
                                        <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                                        </Text>
                                    </HStack>
                                    <Text fontSize="sm" color={useColorModeValue('gray.200', 'gray.100')}>{entry.reason}</Text>
                                </Box>
                                <Text fontWeight="900" color={entry.type === 'spend' ? 'red.300' : 'green.300'}>{entry.type === 'spend' ? '-' : '+'}{entry.amount}</Text>
                            </HStack>
                            <Divider mt={3} borderColor="rgba(148, 163, 184, 0.12)" />
                        </Box>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
};

export default BillingHistoryPage;