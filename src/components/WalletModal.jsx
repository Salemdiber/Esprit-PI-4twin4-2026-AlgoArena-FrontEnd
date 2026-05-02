import { useCallback, useState } from 'react';
import {
    Box,
    Button,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react';
import { billingService } from '../services/billingService';

const WalletModal = ({ isOpen, onClose, currentUser, coinBalance }) => {
    const toast = useToast();
    const [coinTopUp, setCoinTopUp] = useState(3);
    const topUpAmount = Math.max(1, Number(coinTopUp) || 1);

    const modalBg = useColorModeValue('white', '#0f172a');
    const modalBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
    const eyebrowColor = useColorModeValue('cyan.600', 'cyan.300');
    const panelBg = useColorModeValue(
        'linear-gradient(135deg, rgba(34,211,238,0.10), rgba(14,165,233,0.05))',
        'linear-gradient(135deg, rgba(34,211,238,0.14), rgba(14,165,233,0.08))',
    );
    const panelBorder = useColorModeValue('cyan.100', 'whiteAlpha.100');
    const mutedColor = useColorModeValue('gray.500', 'gray.400');
    const primaryText = useColorModeValue('gray.800', 'white');
    const secondaryText = useColorModeValue('gray.600', 'gray.300');
    const balanceBg = useColorModeValue('white', 'whiteAlpha.100');
    const balanceBorder = useColorModeValue('cyan.100', 'whiteAlpha.200');
    const balanceLabel = useColorModeValue('gray.700', 'gray.200');
    const formBg = useColorModeValue('gray.50', 'whiteAlpha.50');
    const formBorder = useColorModeValue('gray.200', 'whiteAlpha.100');
    const inputBg = useColorModeValue('white', 'gray.900');
    const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200');

    const handleRechargeCoins = useCallback(async () => {
        try {
            const checkout = await billingService.createHintCreditsCheckout({ amount: topUpAmount });
            const checkoutUrl = checkout?.url || checkout?.checkoutUrl || checkout?.sessionUrl;

            if (!checkoutUrl) {
                throw new Error('Stripe checkout url missing');
            }

            window.location.assign(checkoutUrl);
        } catch (error) {
            toast({
                title: 'Stripe checkout failed',
                description: error?.message || 'Unable to start payment.',
                status: 'error',
                duration: 4500,
                isClosable: true,
            });
        }
    }, [toast, topUpAmount]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" motionPreset="slideInBottom" isCentered>
            <ModalOverlay bg="rgba(2, 6, 23, 0.72)" backdropFilter="blur(10px)" />
            <ModalContent bg={modalBg} borderRadius="24px" border="1px solid" borderColor={modalBorder} boxShadow="0 24px 80px rgba(0,0,0,0.35)">
                <ModalHeader pb={2}>
                    <Text fontSize="sm" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={eyebrowColor}>
                        Wallet
                    </Text>
                    <Text mt={1}>Arena Coins Wallet</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Box p={5} borderRadius="20px" bg={panelBg} border="1px solid" borderColor={panelBorder} mb={5}>
                        <HStack justify="space-between" align="start" gap={4} flexWrap="wrap">
                            <Box>
                                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color={mutedColor} fontWeight="700">
                                    Current user
                                </Text>
                                <Text fontSize="lg" fontWeight="900" color={primaryText} mt={1} noOfLines={1}>
                                    {currentUser?.username || 'Guest user'}
                                </Text>
                                <Text mt={2} fontSize="sm" color={secondaryText}>
                                    Your Arena Coins are used for hints and premium actions.
                                </Text>
                            </Box>

                            <Box px={4} py={3} borderRadius="16px" bg={balanceBg} border="1px solid" borderColor={balanceBorder} minW="150px" textAlign="right">
                                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.08em" color={mutedColor}>
                                    Current balance
                                </Text>
                                <Text fontSize="4xl" fontWeight="900" lineHeight="1" color={eyebrowColor} mt={1}>
                                    {coinBalance}
                                </Text>
                                <Text mt={1} fontSize="sm" fontWeight="700" color={balanceLabel}>
                                    Arena Coins
                                </Text>
                            </Box>
                        </HStack>
                    </Box>

                    <Box p={4} borderRadius="18px" bg={formBg} border="1px solid" borderColor={formBorder}>
                        <Text fontSize="sm" fontWeight="700" color={balanceLabel} mb={2}>
                            Top up Arena Coins
                        </Text>
                        <HStack spacing={3} align="stretch">
                            <Box flex="1">
                                <Input
                                    type="number"
                                    min={1}
                                    step={1}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={coinTopUp}
                                    onChange={(event) => setCoinTopUp(event.target.value)}
                                    size="lg"
                                    placeholder="3"
                                    bg={inputBg}
                                    borderColor={inputBorder}
                                    borderRadius="14px"
                                    fontSize="lg"
                                    fontWeight="800"
                                    textAlign="center"
                                    _focusVisible={{ borderColor: 'cyan.400', boxShadow: '0 0 0 1px var(--chakra-colors-cyan-400)' }}
                                />
                                <HStack mt={3} spacing={2} flexWrap="wrap">
                                    {[3, 5, 10].map((preset) => (
                                        <Button
                                            key={preset}
                                            size="sm"
                                            variant={topUpAmount === preset ? 'solid' : 'outline'}
                                            colorScheme="cyan"
                                            borderRadius="999px"
                                            onClick={() => setCoinTopUp(String(preset))}
                                        >
                                            {preset}
                                        </Button>
                                    ))}
                                </HStack>
                                <Text mt={3} fontSize="sm" color={mutedColor}>
                                    1 credit = $1.99
                                </Text>
                                <Text mt={1} fontSize="sm" fontWeight="700" color={balanceLabel}>
                                    Total: ${(topUpAmount * 1.99).toFixed(2)}
                                </Text>
                            </Box>
                            <Button
                                alignSelf="end"
                                size="lg"
                                px={6}
                                borderRadius="16px"
                                bg="linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)"
                                color="#082f49"
                                fontWeight="800"
                                boxShadow="0 12px 28px rgba(34,211,238,0.28)"
                                _hover={{ transform: 'translateY(-1px)', boxShadow: '0 16px 34px rgba(34,211,238,0.34)' }}
                                _active={{ transform: 'translateY(0px)' }}
                                onClick={handleRechargeCoins}
                            >
                                Recharge
                            </Button>
                        </HStack>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={onClose} borderRadius="14px">
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default WalletModal;
