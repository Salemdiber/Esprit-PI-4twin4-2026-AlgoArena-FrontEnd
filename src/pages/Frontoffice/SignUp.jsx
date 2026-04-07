import React, { useState, useEffect } from 'react';
import { getDiceBearUrl } from '../../services/dicebear';
import { getReCaptchaV3Token, mountReCaptchaV3, unmountReCaptchaV3 } from '../../services/recaptchaV3';
import { Box, Heading, Text, Button, VStack, HStack, Input, Link, Flex, InputGroup, InputLeftElement, InputRightElement, IconButton, Icon, Grid, Image, Spinner } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../layout/AuthLayout';
import { useAuth } from './auth/context/AuthContext';
import { authService } from '../../services/authService';
import FormFeedbackAlert from './auth/components/FormFeedbackAlert';
import { useTranslation } from 'react-i18next';

const MotionBox = motion.create(Box);

const EyeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);

const EyeOffIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </Icon>
);

const normalize = (value) => value.trim().toLowerCase();
const toAlphaNumeric = (value) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const passwordContainsIdentityData = (password, username, email) => {
    const normalizedPassword = normalize(password);
    const passwordAlphaNumeric = toAlphaNumeric(password);
    const normalizedUsername = normalize(username);
    const normalizedEmail = normalize(email);
    const [emailLocalPart = '', emailDomain = ''] = normalizedEmail.split('@');
    const domainName = emailDomain.split('.')[0] || '';

    const tokens = new Set([
        normalizedUsername,
        toAlphaNumeric(normalizedUsername),
        normalizedEmail,
        emailLocalPart,
        toAlphaNumeric(emailLocalPart),
        emailDomain,
        domainName,
        toAlphaNumeric(normalizedEmail),
    ]);

    normalizedUsername.split(/[^a-z0-9]+/g).forEach((part) => tokens.add(part));
    normalizedEmail.split(/[^a-z0-9]+/g).forEach((part) => tokens.add(part));

    return [...tokens]
        .filter((token) => token && token.length >= 3)
        .some((token) => normalizedPassword.includes(token) || (toAlphaNumeric(token).length >= 3 && passwordAlphaNumeric.includes(toAlphaNumeric(token))));
};

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    // Génère un avatar DiceBear à chaque changement de pseudo (si vide)
    useEffect(() => {
        if (username && username.length >= 3) {
            setAvatarUrl(getDiceBearUrl(username, 'adventurer'));
        } else {
            setAvatarUrl('');
        }
    }, [username]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [shakeKeys, setShakeKeys] = useState({ email: 0, password: 0, username: 0 });
    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const { signup } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' }); // 'idle', 'loading', 'available', 'taken'
    const [emailStatus, setEmailStatus] = useState({ state: 'idle', message: '' }); // idle | loading | available | taken | invalid

    const triggerShake = (field) => {
        setShakeKeys((prev) => ({ ...prev, [field]: prev[field] + 1 }));
    };

    useEffect(() => {
        if (!username || username.length < 3) {
            setUsernameStatus({ state: 'idle', message: '' });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setUsernameStatus({ state: 'loading', message: '' });
            try {
                const res = await authService.checkAvailability('username', username);
                if (res.available) setUsernameStatus({ state: 'available', message: t('auth.signUp.available') });
                else setUsernameStatus({ state: 'taken', message: res.message || t('auth.signUp.taken') });
            } catch {
                setUsernameStatus({ state: 'idle', message: '' });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [username, t]);

    useEffect(() => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setEmailStatus({ state: 'idle', message: '' });
            return;
        }

        const strictEmailRegex = /^(?=.{6,254}$)(?=.{1,64}@)([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*)@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)$/i;
        if (!strictEmailRegex.test(trimmedEmail)) {
            setEmailStatus({ state: 'invalid', message: t('auth.signUp.invalidEmail') });
            return;
        }

        const timeoutId = setTimeout(async () => {
            setEmailStatus({ state: 'loading', message: '' });
            try {
                const res = await authService.checkAvailability('email', trimmedEmail);
                if (res.available) setEmailStatus({ state: 'available', message: t('auth.signUp.available') });
                else {
                    const message = res.message || '';
                    const isInvalid = message === 'Invalid email format' ||
                        message === 'Disposable emails are not allowed' ||
                        message === 'Email domain cannot receive emails';
                    let displayMessage = message;
                    if (isInvalid) {
                        if (message === 'Invalid email format') displayMessage = t('auth.signUp.invalidEmail');
                        else if (message === 'Disposable emails are not allowed') displayMessage = t('auth.signUp.disposableEmail');
                        else displayMessage = t('auth.signUp.emailNoReceive');
                    } else {
                        displayMessage = message || t('auth.signUp.taken');
                    }
                    setEmailStatus({
                        state: isInvalid ? 'invalid' : 'taken',
                        message: displayMessage,
                    });
                }
            } catch {
                setEmailStatus({ state: 'idle', message: '' });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [email, t]);

    useEffect(() => {
        if (!RECAPTCHA_SITE_KEY) return;

        mountReCaptchaV3(RECAPTCHA_SITE_KEY).catch(() => {
            // Token fetch will still surface submit-time errors if loading fails
        });

        return () => {
            unmountReCaptchaV3();
        };
    }, [RECAPTCHA_SITE_KEY]);

    const hasSensitivePasswordContent = passwordContainsIdentityData(password, username, email);
    const isFormInvalid =
        usernameStatus.state === 'loading' ||
        emailStatus.state === 'loading' ||
        usernameStatus.state === 'taken' ||
        emailStatus.state === 'taken' ||
        emailStatus.state === 'invalid' ||
        password.length < 6 ||
        hasSensitivePasswordContent;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (usernameStatus.state === 'taken') {
            setErrorMsg(t('auth.signUp.usernameTaken'));
            triggerShake('username');
            return;
        }
        if (emailStatus.state === 'taken') {
            setErrorMsg(t('auth.signUp.emailTaken'));
            triggerShake('email');
            return;
        }
        if (password.length < 6) {
            setErrorMsg(t('auth.signUp.passwordMinLength'));
            triggerShake('password');
            return;
        }
        if (hasSensitivePasswordContent) {
            setErrorMsg(t('auth.signUp.passContainsUsername'));
            triggerShake('password');
            return;
        }
        if (emailStatus.state === 'invalid') {
            setErrorMsg(emailStatus.message || t('auth.signUp.invalidEmail'));
            triggerShake('email');
            return;
        }

        setIsLoading(true);
        try {
            // Obtenir le token reCAPTCHA v3 dynamiquement
            const token = await getReCaptchaV3Token(RECAPTCHA_SITE_KEY, 'signup');
            await signup(username, email, password, token, avatarUrl);
            navigate('/', { replace: true });
        } catch {
            // error handled by toast in AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    const strength = password.length === 0 ? { w: '0%', l: '', c: 'gray.500' }
        : password.length < 4 ? { w: '25%', l: t('auth.signUp.strengthWeak'), c: 'red.400' }
            : password.length < 6 ? { w: '50%', l: t('auth.signUp.strengthFair'), c: 'yellow.400' }
                : password.length < 8 ? { w: '75%', l: t('auth.signUp.strengthGood'), c: 'blue.400' }
                    : { w: '100%', l: t('auth.signUp.strengthStrong'), c: 'green.400' };

    const inputStyles = {
        bg: 'var(--color-bg-input)', border: '1px solid', borderColor: 'var(--color-border)', borderRadius: '10px',
        color: 'var(--color-text-primary)', h: '52px', fontSize: '15px', pl: '52px', pr: '1.25rem',
        boxShadow: '0 2px 4px var(--color-glass-border)',
        _placeholder: { color: 'var(--color-text-muted)', fontWeight: 'medium' },
        _focus: { borderColor: 'var(--color-cyan-400)', boxShadow: '0 0 0 4px var(--color-focus-glow), inset 0 2px 4px var(--color-glass-border)', outline: 'none', bg: 'var(--color-bg-elevated)' },
        _hover: { borderColor: 'var(--color-border-hover)' }, transition: 'all 0.3s ease',
    };

    const usernameHasError = usernameStatus.state === 'taken';
    const usernameIsSuccess = usernameStatus.state === 'available';
    const emailHasError = emailStatus.state === 'taken' || emailStatus.state === 'invalid';
    const emailIsSuccess = emailStatus.state === 'available';
    const passwordHasError = hasSensitivePasswordContent || (password.length > 0 && password.length < 6);
    const passwordIsSuccess = password.length >= 8 && !passwordHasError;

    const getFieldStyles = ({ hasError, isSuccess }) => ({
        ...inputStyles,
        borderColor: hasError ? 'red.300' : isSuccess ? 'green.300' : inputStyles.borderColor,
        boxShadow: hasError
            ? '0 0 0 3px rgba(248,113,113,0.18), 0 8px 18px -12px rgba(239,68,68,0.65)'
            : isSuccess
                ? '0 0 0 3px rgba(74,222,128,0.14), 0 8px 18px -12px rgba(34,197,94,0.55)'
                : inputStyles.boxShadow,
        _focus: {
            ...inputStyles._focus,
            borderColor: hasError ? 'red.400' : isSuccess ? 'green.400' : 'var(--color-cyan-400)',
            boxShadow: hasError
                ? '0 0 0 4px rgba(248,113,113,0.18), inset 0 2px 4px var(--color-glass-border)'
                : isSuccess
                    ? '0 0 0 4px rgba(74,222,128,0.14), inset 0 2px 4px var(--color-glass-border)'
                    : inputStyles._focus.boxShadow,
        },
    });



    return (
        <AuthLayout activeTab="signup">
            <MotionBox w="100%" maxW="5xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Box className="glass-panel" borderRadius="16px" boxShadow="0px 8px 24px -4px rgba(15,23,42,0.5)" overflow="hidden" display="flex" flexDirection={{ base: 'column', lg: 'row' }} minH="600px">

                    {/* Left Panel — Gamified Preview */}
                    <Box display={{ base: 'none', lg: 'flex' }} w={{ lg: '42%' }} bg="rgba(15,23,42,0.5)" position="relative" flexDirection="column" justifyContent="space-between" p={10} borderRight="1px solid" borderColor="whiteAlpha.50">
                        <Box position="absolute" inset={0} opacity={0.3} backgroundSize="40px 40px" backgroundImage="linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)" />
                        <Box position="absolute" inset={0} bgGradient="linear(to-b, transparent, transparent, rgba(15,23,42,0.9))" />

                        <Box position="relative" zIndex={10}>
                            {/* Live badge */}
                            <HStack spacing={2} px={3} py={1} borderRadius="full" bg="rgba(34,211,238,0.1)" border="1px solid" borderColor="rgba(34,211,238,0.2)" display="inline-flex" mb={6}>
                                <Box position="relative" w={2} h={2}>
                                    <Box position="absolute" inset={0} borderRadius="full" bg="brand.500" opacity={0.75} sx={{ animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
                                    <Box position="relative" w={2} h={2} borderRadius="full" bg="brand.500" />
                                </Box>
                                <Text fontSize="xs" fontFamily="mono" color="brand.500">{t('auth.signUp.liveArena')}</Text>
                            </HStack>
                            <Heading fontFamily="heading" fontSize="3xl" fontWeight="bold" color="var(--color-text-primary)" lineHeight="tight">
                                {t('auth.signUp.riseThrough')}<br />{t('auth.signUp.the')}<Text as="span" bgGradient="linear(to-r, brand.500, blue.500)" bgClip="text" color="transparent">{t('auth.signUp.ranks')}</Text>
                            </Heading>
                            <Text mt={4} color="gray.400" fontSize="sm" lineHeight="relaxed">{t('auth.signUp.joinDevs')}</Text>
                        </Box>

                        {/* Stats cards */}
                        <VStack spacing={4} position="relative" zIndex={10} mt={8}>
                            <Box w="100%" bg="rgba(30,41,59,0.8)" backdropFilter="blur(8px)" border="1px solid" borderColor="var(--color-border)" borderRadius="lg" p={4} transition="transform 0.3s" _hover={{ transform: 'scale(1.05)' }}>
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontSize="xs" color="gray.400" fontFamily="mono">{t('auth.signUp.currentRank')}</Text>
                                    <HStack spacing={1}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                                        <Text fontSize="xs" fontWeight="bold" color="yellow.400">{t('auth.signUp.rookieIII')}</Text>
                                    </HStack>
                                </Flex>
                                <Box w="100%" bg="gray.600" h="6px" borderRadius="full" overflow="hidden">
                                    <Box h="100%" w="75%" borderRadius="full" bgGradient="linear(to-r, brand.500, cyan.400)" boxShadow="0 0 10px rgba(34,211,238,0.5)" />
                                </Box>
                                <Flex justify="space-between" mt={1}><Text fontSize="10px" color="gray.500">{t('auth.signUp.xpStart')}</Text><Text fontSize="10px" color="gray.500">{t('auth.signUp.xpEnd')}</Text></Flex>
                            </Box>

                            <Flex w="100%" bg="rgba(30,41,59,0.8)" backdropFilter="blur(8px)" border="1px solid" borderColor="var(--color-border)" borderRadius="lg" p={4} align="center" gap={4}>
                                <Flex w={10} h={10} borderRadius="full" bgGradient="linear(to-br, purple.500, purple.700)" align="center" justify="center" fontWeight="bold" color="var(--color-text-primary)" fontSize="sm">{t('auth.signUp.js')}</Flex>
                                <Box><Text fontSize="xs" color="gray.400">{t('auth.signUp.primaryWeapon')}</Text><Text fontSize="sm" fontWeight="bold" color="var(--color-text-primary)">{t('auth.signUp.javascript')}</Text></Box>
                                <Box ml="auto"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg></Box>
                            </Flex>
                        </VStack>

                        {/* Community avatars */}
                        <Box position="relative" zIndex={10} mt="auto" pt={8}>
                            <Flex>
                                {['photo-1534528741775-53994a69daeb', 'photo-1506794778202-cad84cf45f1d', 'photo-1507003211169-0a1dd7228f2d'].map((id, i) => (
                                    <Image key={id} src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=64&h=64`} alt="" w={8} h={8} borderRadius="full" border="2px solid var(--color-bg-primary)" ml={i > 0 ? '-8px' : 0} objectFit="cover" />
                                ))}
                                <Flex w={8} h={8} borderRadius="full" border="2px solid var(--color-bg-primary)" bg="gray.600" align="center" justify="center" fontSize="10px" fontWeight="bold" color="var(--color-text-primary)" ml="-8px">{t('auth.signUp.plus2k')}</Flex>
                            </Flex>
                            <Text fontSize="xs" color="gray.500" mt={2}>{t('auth.signUp.joinCommunity')}</Text>
                        </Box>
                    </Box>

                    {/* Right Panel — Form */}
                    <Box flex={1} p={{ base: 8, md: 12 }} overflowY="auto">
                        <Box maxW="md" mx="auto">
                            <Box mb={8}>
                                <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="var(--color-text-primary)" mb={2}>{t('auth.signUp.createProfile')}</Heading>
                                <Text color="gray.400" fontSize="sm">{t('auth.signUp.startCompeting')}</Text>
                            </Box>

                            <form onSubmit={handleSubmit}>
                                <VStack spacing={5}>
                                    {/* Username + Avatar DiceBear */}
                                    <Box w="100%">
                                        <Flex justify="space-between" align="center" ml={1} mb={1}>
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider">{t('auth.signUp.username')}</Text>

                                            {usernameStatus.state === 'loading' && <Spinner size="xs" color="brand.500" />}
                                            {usernameStatus.state === 'available' && (
                                                <HStack spacing={1}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                    <Text fontSize="10px" fontFamily="mono" color="brand.500">{t('auth.signUp.available')}</Text>
                                                </HStack>
                                            )}
                                            {usernameStatus.state === 'taken' && (
                                                <HStack spacing={1}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                    <Text fontSize="10px" fontFamily="mono" color="red.400">{t('auth.signUp.taken')}</Text>
                                                </HStack>
                                            )}
                                        </Flex>
                                        <MotionBox
                                            key={`username-shake-${shakeKeys.username}`}
                                            initial={false}
                                            animate={usernameHasError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                                            transition={{ duration: 0.34, ease: 'easeOut' }}
                                        >
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" h="100%" w="52px" display="flex" alignItems="center" justifyContent="center">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
                                                </InputLeftElement>
                                                <Input type="text" placeholder={t('auth.signUp.usernamePlaceholder')} value={username} onChange={(e) => setUsername(e.target.value)} {...getFieldStyles({ hasError: usernameHasError, isSuccess: usernameIsSuccess })} pr={avatarUrl ? "52px" : "1.25rem"} />
                                                {avatarUrl && (
                                                    <InputRightElement width="52px" h="100%" display="flex" alignItems="center" justifyContent="center">
                                                        <img src={avatarUrl} alt={t('auth.signUp.avatarAlt')} style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff' }} />
                                                    </InputRightElement>
                                                )}
                                            </InputGroup>
                                        </MotionBox>
                                        <Box mt={2}>
                                            <FormFeedbackAlert message={usernameHasError ? t('auth.signUp.usernameTaken') : ''} />
                                        </Box>
                                        <Text fontSize="10px" color="gray.500" ml={1} mt={1}>{t('auth.signUp.rankStarts')}<Text as="span" color="yellow.500" fontWeight="bold">{t('auth.signUp.rookie')}</Text></Text>                                    </Box>

                                    {/* Email */}
                                    <Box w="100%">
                                        <Flex justify="space-between" align="center" ml={1} mb={1}>
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider">{t('auth.signUp.emailAddress')}</Text>

                                            {emailStatus.state === 'loading' && <Spinner size="xs" color="brand.500" />}
                                            {emailStatus.state === 'available' && (
                                                <HStack spacing={1}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                    <Text fontSize="10px" fontFamily="mono" color="brand.500">{t('auth.signUp.available')}</Text>
                                                </HStack>
                                            )}
                                            {emailStatus.state === 'taken' && (
                                                <HStack spacing={1}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                    <Text fontSize="10px" fontFamily="mono" color="red.400">{t('auth.signUp.inUse')}</Text>
                                                </HStack>
                                            )}
                                            {emailStatus.state === 'invalid' && (
                                                <HStack spacing={1}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                    <Text fontSize="10px" fontFamily="mono" color="red.400">{t('auth.signUp.invalid')}</Text>
                                                </HStack>
                                            )}
                                        </Flex>
                                        <MotionBox
                                            key={`email-shake-${shakeKeys.email}`}
                                            initial={false}
                                            animate={emailHasError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                                            transition={{ duration: 0.34, ease: 'easeOut' }}
                                        >
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" h="100%" w="52px" display="flex" alignItems="center" justifyContent="center">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                                </InputLeftElement>
                                                <Input type="email" placeholder={t('auth.signUp.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} {...getFieldStyles({ hasError: emailHasError, isSuccess: emailIsSuccess })} pr={emailIsSuccess ? '52px' : '1.25rem'} />
                                                {emailIsSuccess && (
                                                    <InputRightElement width="52px" h="100%" display="flex" alignItems="center" justifyContent="center">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                    </InputRightElement>
                                                )}
                                            </InputGroup>
                                        </MotionBox>
                                        <Box mt={2}>
                                            <FormFeedbackAlert message={emailStatus.state === 'invalid' ? (emailStatus.message || t('auth.signUp.invalidEmail')) : emailStatus.state === 'taken' ? t('auth.signUp.emailTaken') : ''} />
                                        </Box>
                                    </Box>

                                    {/* Password */}
                                    <Box w="100%">
                                        <Text fontSize="xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" ml={1} mb={1}>{t('auth.signUp.password')}</Text>
                                        <MotionBox
                                            key={`password-shake-${shakeKeys.password}`}
                                            initial={false}
                                            animate={passwordHasError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                                            transition={{ duration: 0.34, ease: 'easeOut' }}
                                        >
                                        <InputGroup>
                                            <InputLeftElement pointerEvents="none" h="100%" w="52px" display="flex" alignItems="center" justifyContent="center">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            </InputLeftElement>
                                            <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.signUp.passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} {...getFieldStyles({ hasError: passwordHasError, isSuccess: passwordIsSuccess })} pr="52px" />
                                            <InputRightElement h="100%" w="52px" right="0" display="flex" alignItems="center" justifyContent="center">
                                                <IconButton
                                                    variant="unstyled"
                                                    size="sm"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    icon={showPassword ? <EyeOffIcon w={4} h={4} /> : <EyeIcon w={4} h={4} />}
                                                    color="gray.500"
                                                    _hover={{ color: 'var(--color-text-heading)' }}
                                                    aria-label={showPassword ? t('auth.signUp.hidePassword') : t('auth.signUp.showPassword')}
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                        </MotionBox>
                                        <Flex mt={2} align="center" gap={2}>
                                            <Box flex={1} h="4px" bg="gray.600" borderRadius="full" overflow="hidden">
                                                <Box h="100%" w={strength.w} bgGradient="linear(to-r, red.500, yellow.500, green.500)" borderRadius="full" transition="width 0.3s" />
                                            </Box>
                                            <Text fontSize="10px" fontFamily="mono" color={strength.c}>{strength.l}</Text>
                                        </Flex>
                                        <Box mt={2}>
                                            <FormFeedbackAlert message={hasSensitivePasswordContent ? t('auth.signUp.passContainsUsername') : ''} />
                                        </Box>
                                    </Box>



                                    {/* reCAPTCHA v3 : token généré automatiquement lors du submit */}
                                    <FormFeedbackAlert message={errorMsg} />

                                    {/* Submit */}
                                    <Box pt={4} w="100%">
                                        <Button type="submit" w="100%" h="48px" bgGradient="linear(to-r, brand.500, cyan.400)" color="#0f172a" fontSize="sm" fontWeight="bold" borderRadius="8px"
                                            isDisabled={isFormInvalid}
                                            isLoading={isLoading} loadingText={t('auth.signUp.creatingProfile')} boxShadow="0 0 30px -5px rgba(34,211,238,0.5)" position="relative" overflow="hidden" role="group"
                                            _hover={{ bgGradient: 'linear(to-r, brand.500, cyan.300)', transform: 'translateY(-2px)' }} _active={{ transform: 'translateY(0)' }} transition="all 0.3s">
                                            <Box position="absolute" inset={0} bg="whiteAlpha.200" transform="translateX(-100%) skewX(-12deg)" _groupHover={{ transform: 'translateX(100%) skewX(-12deg)' }} transition="transform 0.5s" />
                                            <HStack spacing={2} position="relative">
                                                <Text>{t('auth.signUp.enterArena')}</Text>
                                                <Box _groupHover={{ transform: 'translateX(4px)' }} transition="transform 0.3s">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                                </Box>
                                            </HStack>
                                        </Button>
                                    </Box>
                                </VStack>
                            </form>

                            <Text mt={6} textAlign="center" fontSize="sm" color="gray.400">
                                {t('auth.signUp.alreadyHaveAccount')}{' '}
                                <Link as={RouterLink} to="/signin" fontWeight="medium" color="brand.500" _hover={{ color: 'brand.300' }}>{t('auth.signUp.signIn')}</Link>
                            </Text>
                        </Box>
                    </Box>
                </Box>
            </MotionBox>

            <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
        </AuthLayout>
    );
};

export default SignUp;

