import React, { useState, useEffect } from 'react';
import { getReCaptchaV3Token, mountReCaptchaV3, unmountReCaptchaV3 } from '../../services/recaptchaV3';
import { Box, Heading, Text, Button, VStack, HStack, Input, Checkbox, Link, Flex, InputGroup, InputLeftElement, InputRightElement, IconButton, Icon } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '../../layout/AuthLayout';
import { useAuth, redirectBasedOnRole } from './auth/context/AuthContext';

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

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!RECAPTCHA_SITE_KEY) return;

        mountReCaptchaV3(RECAPTCHA_SITE_KEY).catch(() => {
            // Token fetch will still surface submit-time errors if loading fails
        });

        return () => {
            unmountReCaptchaV3();
        };
    }, [RECAPTCHA_SITE_KEY]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            // Obtenir le token reCAPTCHA v3 dynamiquement
            const token = await getReCaptchaV3Token(RECAPTCHA_SITE_KEY, 'signin');
            const user = await login(username, password, token);

            // New user coming from SignUp — redirect to Speed Challenge placement test
            const isPendingChallenge = localStorage.getItem('sc_pending') === 'true';
            if (isPendingChallenge) {
                localStorage.removeItem('sc_pending');
                navigate('/speed-challenge', { replace: true });
                return;
            }

            const fallbackPath = redirectBasedOnRole(user);
            let from = location.state?.from?.pathname || fallbackPath;
            if (["/signin", "/signup", "/login"].includes(from)) {
                from = fallbackPath;
            }
            navigate(from, { replace: true });
        } catch {
            // Error is handled in context via toast
        } finally {
            setIsLoading(false);
        }
    };

    const headingColor = 'var(--color-text-heading)';
    const labelColor = 'var(--color-text-secondary)';
    const socialBtnBg = 'var(--color-bg-input)';
    const socialBtnColor = 'var(--color-text-primary)';
    const socialBtnHoverBg = 'var(--color-bg-elevated)';
    const iconStroke = 'var(--color-text-muted)';

    const inputStyles = {
        bg: 'var(--color-bg-input)', border: '1px solid', borderColor: 'var(--color-border)', borderRadius: '10px',
        color: 'var(--color-text-primary)', h: '52px', fontSize: '15px', pl: '52px', pr: '1.25rem',
        boxShadow: '0 2px 4px var(--color-glass-border)',
        _placeholder: { color: 'var(--color-text-muted)', fontWeight: 'medium' },
        _focus: { borderColor: 'var(--color-cyan-400)', boxShadow: '0 0 0 4px var(--color-focus-glow), inset 0 2px 4px var(--color-glass-border)', outline: 'none', bg: 'var(--color-bg-elevated)' },
        _hover: { borderColor: 'var(--color-border-hover)' }, transition: 'all 0.3s ease',
    };

    return (
        <AuthLayout activeTab="signin">
            <MotionBox w="100%" maxW="md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Box className="glass-panel" borderRadius="16px" p={{ base: 8, md: 10 }} boxShadow="0px 8px 24px -4px rgba(15,23,42,0.5)" position="relative" overflow="hidden" role="group">
                    {/* Spotlight glow */}
                    <Box position="absolute" top="-96px" left="-96px" w="192px" h="192px" bg="rgba(34,211,238,0.2)" borderRadius="full" filter="blur(48px)" transition="all 0.7s" _groupHover={{ bg: 'rgba(34,211,238,0.3)' }} />

                    <Box position="relative" zIndex={10}>
                        <VStack spacing={2} mb={8} textAlign="center">
                            <Heading fontFamily="heading" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color={headingColor}>
                                Welcome Back, <Text as="span" color="brand.500">Challenger</Text>
                            </Heading>
                            <Text color={labelColor} fontSize="sm">Continue your coding journey.</Text>
                        </VStack>

                        <form onSubmit={handleSubmit}>
                            <VStack spacing={5}>
                                {/* Username */}
                                <Box w="100%">
                                    <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase" letterSpacing="wider" ml={1} mb={1}>Username</Text>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" h="100%" w="52px" display="flex" alignItems="center" justifyContent="center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
                                        </InputLeftElement>
                                        <Input type="text" placeholder="dev_algoarena" value={username} onChange={(e) => setUsername(e.target.value)} {...inputStyles} />
                                    </InputGroup>
                                </Box>

                                {/* Password */}
                                <Box w="100%">
                                    <Flex justify="space-between" align="center" ml={1} mb={1}>
                                        <Text fontSize="xs" fontWeight="semibold" color={labelColor} textTransform="uppercase" letterSpacing="wider">Password</Text>
                                    </Flex>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none" h="100%" w="52px" display="flex" alignItems="center" justifyContent="center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </InputLeftElement>
                                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} {...inputStyles} pr="52px" />
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
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </Box>

                                {/* Remember + Forgot */}
                                <Flex w="100%" justify="space-between" align="center">
                                    <Checkbox colorScheme="cyan" size="sm" isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                                        <Text fontSize="sm" color={labelColor}>Remember me</Text>
                                    </Checkbox>
                                    <Link as={RouterLink} to="/forgot-password" fontSize="sm" fontWeight="medium" color="brand.500" _hover={{ color: 'brand.300' }}>Forgot password?</Link>
                                </Flex>

                                {/* reCAPTCHA v3 : token généré automatiquement lors du submit */}
                                {errorMsg && <Text fontSize="xs" color="red.400" mt={2}>{errorMsg}</Text>}

                                {/* Submit */}
                                <Button type="submit" w="100%" h="48px" bgGradient="linear(to-r, brand.500, cyan.400)" color="#0f172a" fontSize="sm" fontWeight="bold" borderRadius="8px"
                                    isLoading={isLoading} loadingText="Authenticating..." boxShadow="0 0 30px -5px rgba(34,211,238,0.5)"
                                    _hover={{ bgGradient: 'linear(to-r, brand.500, cyan.300)', transform: 'translateY(-2px)' }} _active={{ transform: 'translateY(0)' }} transition="all 0.3s">
                                    Enter the Arena
                                </Button>
                            </VStack>
                        </form>

                        {/* Divider */}
                        <Box mt={8} position="relative">
                            <Box position="absolute" inset={0} display="flex" alignItems="center"><Box w="100%" borderTop="1px solid" borderColor="var(--color-border)" /></Box>
                            <Flex position="relative" justify="center">
                                <Text px={4} fontSize="xs" color="gray.500" className="glass-panel" borderRadius="full">Or enter the arena with</Text>
                            </Flex>
                        </Box>

                        {/* Social */}
                        <HStack mt={6} spacing={3}>
                            {[
                                { label: 'Google', path: 'M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z', vb: '0 0 24 24' },
                                { label: 'GitHub', path: 'M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z', vb: '0 0 20 20' },
                            ].map(({ label, path, vb }) => (
                                <Button
                                    as="a"
                                    href={`http://localhost:3000/auth/${label.toLowerCase()}`}
                                    key={label} flex={1} h="44px" bg={socialBtnBg} border="1px solid" borderColor="var(--color-border)" borderRadius="8px" color={socialBtnColor} fontSize="sm" fontWeight="medium"
                                    leftIcon={<svg width="20" height="20" fill="currentColor" viewBox={vb}><path fillRule="evenodd" clipRule="evenodd" d={path} /></svg>}
                                    _hover={{ bg: socialBtnHoverBg, borderColor: 'brand.500', color: 'var(--color-text-heading)' }} transition="all 0.3s">
                                    {label}
                                </Button>
                            ))}
                        </HStack>

                        {/* Link to sign up */}
                        <Text mt={8} textAlign="center" fontSize="sm" color={labelColor}>
                            New to AlgoArena?{' '}
                            <Link as={RouterLink} to="/signup" fontWeight="medium" color="brand.500" _hover={{ color: 'brand.300' }}>Sign up</Link>
                        </Text>
                    </Box>
                </Box>
            </MotionBox>
        </AuthLayout>
    );
};

export default SignIn;
