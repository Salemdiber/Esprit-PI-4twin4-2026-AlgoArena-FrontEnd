/**
 * TwoFactorSetupPage – /profile/2fa-setup
 *
 * Multi-step wizard:
 *   Step 1 → Choose method (authenticator | email)
 *   Step 2 → Verify (QR / email code)
 *   Step 3 → Success confirmation
 *
 * Uses step-based state; no hardcoded transition logic.
 */
import React, { useState, useCallback } from 'react';
import {
    Box,
    Text,
    Button,
    Flex,
    VStack,
    HStack,
    PinInput,
    PinInputField,
    Icon,
    useToast,
    useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import TwoFactorMethodSelector from '../components/TwoFactorMethodSelector';
import { useProfile } from '../context/ProfileContext';

const MotionBox = motion.create(Box);

/* --------------- inline icons --------------- */
const ArrowLeftIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </Icon>
);

const CheckCircleIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
);

const QRPlaceholder = () => {
    const bgContainer = useColorModeValue('gray.50', 'var(--color-bg-primary)');
    const borderColor = useColorModeValue('gray.200', 'var(--color-border)');
    const gridEmpty = useColorModeValue('white', 'var(--color-bg-secondary)');

    return (
        <Box
            w="180px"
            h="180px"
            bg={bgContainer}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
        >
            <VStack spacing={1}>
                {/* Simple QR-like grid */}
                {[0, 1, 2, 3, 4].map((row) => (
                    <HStack key={row} spacing={1}>
                        {[0, 1, 2, 3, 4].map((col) => (
                            <Box
                                key={col}
                                w="20px"
                                h="20px"
                                bg={(row + col) % 2 === 0 ? '#22d3ee' : gridEmpty}
                                borderRadius="2px"
                            />
                        ))}
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
};

const MOCK_SECRET = 'JBSW Y3DP EHPK 3PXP';

/* --------------- step transition variants --------------- */
const stepVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
};

const TwoFactorSetupPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const prefersReducedMotion = useReducedMotion();
    const { setTwoFactorEnabled, setTwoFactorMethod } = useProfile();

    const [step, setStep] = useState(1);
    const [method, setMethod] = useState(null);
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const maskedEmail = 'a***@algoarena.com';

    const handleVerify = useCallback(async () => {
        setIsVerifying(true);
        // Simulate verification
        await new Promise((r) => setTimeout(r, 1000));
        setIsVerifying(false);

        if (code.length === 6) {
            setTwoFactorEnabled(true);
            setTwoFactorMethod(method);
            setStep(3);
        } else {
            toast({
                title: 'Invalid code',
                description: 'Please enter a valid 6-digit code.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top',
            });
        }
    }, [code, method, setTwoFactorEnabled, setTwoFactorMethod, toast]);

    const transition = prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: 'easeOut' };

    // Form/Theme state colors moved up to comply with rules of hooks
    const btnBackHoverColor = useColorModeValue("gray.500", "gray.400");
    const textHeadingColor = useColorModeValue("gray.800", "gray.100");
    const textSubColor = useColorModeValue("gray.500", "gray.400");
    const textDescColor = useColorModeValue("gray.600", "gray.300");

    const cardBg = useColorModeValue('white', 'var(--color-bg-secondary)');
    const cardBorderColor = useColorModeValue('gray.200', 'var(--color-border)');
    const cardBoxShadow = useColorModeValue('sm', 'var(--shadow-card)');

    const inputBg = useColorModeValue('white', 'var(--color-bg-primary)');
    const inputBorderColor = useColorModeValue('gray.300', 'var(--color-border)');
    const inputHoverBorderColor = useColorModeValue('gray.400', '#475569');

    const boxSecondaryBg = useColorModeValue('gray.50', 'var(--color-bg-primary)');

    return (
        <MotionBox
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            minH="100vh"
            pt={{ base: 24, md: 28 }}
            pb={{ base: 10, md: 16 }}
            px={{ base: 4, sm: 6, lg: 8 }}
            bg="var(--color-bg-primary)"
            position="relative"
            overflow="hidden"
        >
            <Box maxW="xl" mx="auto" position="relative" zIndex={10}>
                {/* Back button */}
                {step < 3 && (
                    <Button
                        leftIcon={<ArrowLeftIcon w={4} h={4} />}
                        variant="unstyled"
                        color={btnBackHoverColor}
                        display="flex"
                        alignItems="center"
                        mb={6}
                        fontSize="sm"
                        _hover={{ color: '#22d3ee' }}
                        onClick={() => {
                            if (step === 1) navigate('/profile');
                            else setStep((s) => s - 1);
                        }}
                    >
                        {step === 1 ? 'Back to Profile' : 'Back'}
                    </Button>
                )}

                {/* Step indicator */}
                <HStack spacing={2} mb={8} justify="center">
                    {[1, 2, 3].map((s) => (
                        <Box
                            key={s}
                            w={s === step ? '32px' : '8px'}
                            h="8px"
                            borderRadius="full"
                            bg={s <= step ? '#22d3ee' : 'var(--color-border)'}
                            transition="all 0.3s"
                        />
                    ))}
                </HStack>

                {/* Steps */}
                <AnimatePresence mode="wait">
                    {/* ─── Step 1: Choose method ─── */}
                    {step === 1 && (
                        <MotionBox
                            key="step1"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                        >
                            <Box
                                bg={cardBg}
                                borderRadius="12px"
                                p={{ base: 6, md: 8 }}
                                border="1px solid"
                                borderColor={cardBorderColor}
                                boxShadow={cardBoxShadow}
                                borderTop="3px solid #22d3ee"
                            >
                                <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={textHeadingColor} mb={2}>
                                    Choose Verification Method
                                </Text>
                                <Text color={textSubColor} fontSize="sm" mb={6}>
                                    Select how you'd like to verify your identity when signing in.
                                </Text>

                                <TwoFactorMethodSelector selectedMethod={method} onSelect={setMethod} />

                                <Button
                                    mt={8}
                                    w="100%"
                                    bg="#22d3ee"
                                    color="#0f172a"
                                    fontWeight="600"
                                    borderRadius="6px"
                                    boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                                    _hover={{ bg: '#67e8f9', boxShadow: '0 8px 24px rgba(34, 211, 238, 0.4)' }}
                                    isDisabled={!method}
                                    onClick={() => setStep(2)}
                                >
                                    Continue
                                </Button>
                            </Box>
                        </MotionBox>
                    )}

                    {/* ─── Step 2: Verify ─── */}
                    {step === 2 && (
                        <MotionBox
                            key="step2"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                        >
                            <Box
                                bg={cardBg}
                                borderRadius="12px"
                                p={{ base: 6, md: 8 }}
                                border="1px solid"
                                borderColor={cardBorderColor}
                                boxShadow={cardBoxShadow}
                                borderTop="3px solid #22d3ee"
                            >
                                {method === 'authenticator' ? (
                                    /* ── Authenticator flow ── */
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={textHeadingColor} mb={2}>
                                                Scan QR Code
                                            </Text>
                                            <Text color={textSubColor} fontSize="sm">
                                                Open your authenticator app and scan the QR code, or enter the secret key manually.
                                            </Text>
                                        </Box>

                                        <QRPlaceholder />

                                        {/* Secret key */}
                                        <Box textAlign="center">
                                            <Text fontSize="xs" color={textSubColor} mb={1}>
                                                Secret Key
                                            </Text>
                                            <Box
                                                bg={boxSecondaryBg}
                                                border="1px solid"
                                                borderColor={cardBorderColor}
                                                borderRadius="6px"
                                                px={4}
                                                py={2}
                                                fontFamily="mono"
                                                fontSize="sm"
                                                color="#22d3ee"
                                                letterSpacing="wider"
                                                display="inline-block"
                                                userSelect="all"
                                            >
                                                {MOCK_SECRET}
                                            </Box>
                                        </Box>

                                        {/* Code input */}
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500" color={textDescColor} mb={3} textAlign="center">
                                                Enter the 6-digit code from your app
                                            </Text>
                                            <Flex justify="center">
                                                <HStack>
                                                    <PinInput
                                                        size="lg"
                                                        value={code}
                                                        onChange={setCode}
                                                        otp
                                                    >
                                                        {[...Array(6)].map((_, i) => (
                                                            <PinInputField
                                                                key={i}
                                                                bg={inputBg}
                                                                border="1px solid"
                                                                borderColor={inputBorderColor}
                                                                color={textHeadingColor}
                                                                _focus={{ borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' }}
                                                                _hover={{ borderColor: inputHoverBorderColor }}
                                                                borderRadius="8px"
                                                                fontFamily="mono"
                                                                fontSize="lg"
                                                            />
                                                        ))}
                                                    </PinInput>
                                                </HStack>
                                            </Flex>
                                        </Box>

                                        <Button
                                            w="100%"
                                            bg="#22d3ee"
                                            color="#0f172a"
                                            fontWeight="600"
                                            borderRadius="6px"
                                            boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                                            _hover={{ bg: '#67e8f9' }}
                                            isDisabled={code.length < 6}
                                            isLoading={isVerifying}
                                            onClick={handleVerify}
                                        >
                                            Verify & Enable
                                        </Button>
                                    </VStack>
                                ) : (
                                    /* ── Email flow ── */
                                    <VStack spacing={6} align="stretch">
                                        <Box>
                                            <Text fontFamily="heading" fontSize="xl" fontWeight="bold" color={textHeadingColor} mb={2}>
                                                Email Verification
                                            </Text>
                                            <Text color={textSubColor} fontSize="sm">
                                                We'll send a verification code to your registered email address.
                                            </Text>
                                        </Box>

                                        {/* Masked email */}
                                        <Flex
                                            bg={boxSecondaryBg}
                                            border="1px solid"
                                            borderColor={cardBorderColor}
                                            borderRadius="8px"
                                            p={4}
                                            align="center"
                                            justify="center"
                                        >
                                            <Text fontFamily="mono" color="#22d3ee" fontSize="sm">
                                                {maskedEmail}
                                            </Text>
                                        </Flex>

                                        <Button
                                            w="100%"
                                            variant="outline"
                                            borderColor="rgba(34, 211, 238, 0.3)"
                                            color="#22d3ee"
                                            _hover={{ bg: 'rgba(34, 211, 238, 0.1)' }}
                                            borderRadius="6px"
                                            fontWeight="500"
                                            onClick={() => {
                                                toast({
                                                    title: 'Code sent!',
                                                    description: `A verification code has been sent to ${maskedEmail}`,
                                                    status: 'info',
                                                    duration: 3000,
                                                    isClosable: true,
                                                    position: 'top',
                                                });
                                            }}
                                        >
                                            Send Verification Code
                                        </Button>

                                        {/* Code input */}
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500" color={textDescColor} mb={3} textAlign="center">
                                                Enter the 6-digit code from your email
                                            </Text>
                                            <Flex justify="center">
                                                <HStack>
                                                    <PinInput
                                                        size="lg"
                                                        value={code}
                                                        onChange={setCode}
                                                        otp
                                                    >
                                                        {[...Array(6)].map((_, i) => (
                                                            <PinInputField
                                                                key={i}
                                                                bg={inputBg}
                                                                border="1px solid"
                                                                borderColor={inputBorderColor}
                                                                color={textHeadingColor}
                                                                _focus={{ borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' }}
                                                                _hover={{ borderColor: inputHoverBorderColor }}
                                                                borderRadius="8px"
                                                                fontFamily="mono"
                                                                fontSize="lg"
                                                            />
                                                        ))}
                                                    </PinInput>
                                                </HStack>
                                            </Flex>
                                        </Box>

                                        <Button
                                            w="100%"
                                            bg="#22d3ee"
                                            color="#0f172a"
                                            fontWeight="600"
                                            borderRadius="6px"
                                            boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                                            _hover={{ bg: '#67e8f9' }}
                                            isDisabled={code.length < 6}
                                            isLoading={isVerifying}
                                            onClick={handleVerify}
                                        >
                                            Confirm & Enable
                                        </Button>
                                    </VStack>
                                )}
                            </Box>
                        </MotionBox>
                    )}

                    {/* ─── Step 3: Success ─── */}
                    {step === 3 && (
                        <MotionBox
                            key="step3"
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={transition}
                        >
                            <Box
                                bg={cardBg}
                                borderRadius="12px"
                                p={{ base: 8, md: 12 }}
                                border="1px solid"
                                borderColor={cardBorderColor}
                                boxShadow={cardBoxShadow}
                                borderTop="4px solid #10b981"
                                textAlign="center"
                            >
                                <Box
                                    mx="auto"
                                    mb={6}
                                    w="72px"
                                    h="72px"
                                    borderRadius="full"
                                    bg="rgba(16, 185, 129, 0.1)"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <CheckCircleIcon w={10} h={10} color="#10b981" />
                                </Box>

                                <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color={textHeadingColor} mb={3}>
                                    Two-Factor Enabled!
                                </Text>
                                <Text color={textSubColor} fontSize="sm" maxW="sm" mx="auto" mb={8} lineHeight="1.7">
                                    Your account is now protected with two-factor authentication using{' '}
                                    <Text as="span" color="#22d3ee" fontWeight="600">
                                        {method === 'authenticator' ? 'Mobile Authenticator' : 'Email Verification'}
                                    </Text>
                                    .
                                </Text>

                                <Button
                                    bg="#22d3ee"
                                    color="#0f172a"
                                    fontWeight="600"
                                    borderRadius="6px"
                                    px={8}
                                    boxShadow="0 4px 14px rgba(34, 211, 238, 0.2)"
                                    _hover={{ bg: '#67e8f9', boxShadow: '0 8px 24px rgba(34, 211, 238, 0.4)' }}
                                    onClick={() => navigate('/profile')}
                                >
                                    Back to Profile
                                </Button>
                            </Box>
                        </MotionBox>
                    )}
                </AnimatePresence>
            </Box>
        </MotionBox>
    );
};

export default TwoFactorSetupPage;
