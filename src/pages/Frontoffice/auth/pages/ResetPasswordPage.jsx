import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    InputGroup,
    InputRightElement,
    Icon,
    IconButton,
    Link,
    Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import AuthHeader from '../components/AuthHeader';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import RequirementChecklist from '../components/RequirementChecklist';
import usePasswordStrength from '../hooks/usePasswordStrength';
import { authService } from '../../../../services/authService';

/* Icons */
const LockIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
);

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

const ArrowLeftIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </Icon>
);

const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: verify code, 2: set password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { score, label, color, glowColor, percent, requirements } = usePasswordStrength(password);

    useEffect(() => {
        if (token === 'expired-token') navigate('/reset-expired');
    }, [token, navigate]);

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setCodeError('');
        if (!email || !code) {
            setCodeError(t('auth.reset.enterEmailAndCode'));
            return;
        }
        setIsLoading(true);
        try {
            await authService.verifyResetCode(email, code);
            setStep(2);
        } catch (err) {
            setCodeError(err?.message || t('auth.reset.invalidCode'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError(t('auth.reset.passwordsNoMatch'));
            return;
        }
        if (score < 2) {
            setError(t('auth.reset.passwordTooWeak'));
            return;
        }
        setIsLoading(true);
        try {
            await authService.resetPassword(token, password, confirmPassword);
            navigate('/reset-success');
        } catch (err) {
            if (err?.message && err.message.toLowerCase().includes('expired')) {
                navigate('/reset-expired');
            } else {
                setError(err?.message || t('auth.reset.resetFailed'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyles = {
        bg: 'var(--color-bg-primary)',
        border: '1px solid',
        borderColor: 'gray.600',
        borderRadius: '8px',
        color: 'gray.100',
        h: '48px',
        fontSize: 'sm',
        _placeholder: { color: 'gray.500' },
        _focus: { borderColor: '#22d3ee', boxShadow: '0 0 0 2px rgba(34, 211, 238, 0.2)', outline: 'none' },
        _hover: { borderColor: 'gray.500' },
        transition: 'all 0.2s',
    };

    return (
        <AuthCard>
            {step === 1 ? (
                <>
                    <AuthHeader
                        icon={<LockIcon w={5} h={5} color="#22d3ee" />}
                        title={t('auth.reset.enterCode')}
                        subtitle={t('auth.reset.codeSubtitle')}
                    />

                    <form onSubmit={handleCodeSubmit}>
                        <FormControl mb={4} isRequired>
                            <FormLabel fontSize="sm" fontWeight="medium" color="gray.300">{t('auth.reset.email')}</FormLabel>
                            <Input type="email" placeholder={t('auth.reset.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} {...inputStyles} />
                        </FormControl>

                        <FormControl mb={6} isRequired isInvalid={!!codeError}>
                            <FormLabel fontSize="sm" fontWeight="medium" color="gray.300">{t('auth.reset.codeLabel')}</FormLabel>
                            <Input type="text" placeholder={t('auth.reset.codePlaceholder')} value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} {...inputStyles} />
                            <FormErrorMessage fontSize="xs" mt={2}>{codeError}</FormErrorMessage>
                        </FormControl>

                        <Button type="submit" w="100%" h="48px" bg="#22d3ee" color="#0f172a" fontWeight="semibold" borderRadius="8px" boxShadow="0 4px 16px rgba(34, 211, 238, 0.2)" isLoading={isLoading} loadingText={t('auth.reset.verifying')} isDisabled={email.length === 0 || code.length !== 6} _hover={{ bg: '#06b6d4', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(34, 211, 238, 0.35)' }} _active={{ transform: 'translateY(0)' }} transition="all 0.2s" mb={6}>
                            {t('auth.reset.verifyCode')}
                        </Button>
                    </form>
                </>
            ) : (
                <>
                    <AuthHeader icon={<LockIcon w={5} h={5} color="#22d3ee" />} title={t('auth.reset.createNewPassword')} subtitle={t('auth.reset.createSubtitle')} />

                    <form onSubmit={handleSubmit}>
                        <FormControl mb={4} isInvalid={!!error && error.includes('weak')}>
                            <FormLabel fontSize="sm" fontWeight="medium" color="gray.300">{t('auth.reset.newPassword')}</FormLabel>
                            <InputGroup>
                                <Input type={showPassword ? 'text' : 'password'} placeholder={t('auth.reset.newPasswordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} {...inputStyles} />
                                <InputRightElement h="100%">
                                    <IconButton variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)} icon={showPassword ? <EyeOffIcon /> : <EyeIcon />} color="gray.500" _hover={{ bg: 'transparent', color: 'gray.300' }} aria-label={showPassword ? t('auth.reset.hidePassword') : t('auth.reset.showPassword')} />
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        <PasswordStrengthMeter score={score} label={label} color={color} glowColor={glowColor} percent={percent} />

                        <Box mb={6}>
                            <RequirementChecklist requirements={requirements} />
                        </Box>

                        <FormControl mb={6} isInvalid={!!error}>
                            <FormLabel fontSize="sm" fontWeight="medium" color="gray.300">{t('auth.reset.confirmPassword')}</FormLabel>
                            <Input type="password" placeholder={t('auth.reset.confirmPlaceholder')} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} {...inputStyles} />
                            <FormErrorMessage fontSize="xs" mt={2}>{error}</FormErrorMessage>
                        </FormControl>

                        <Button type="submit" w="100%" h="48px" bg="#22d3ee" color="#0f172a" fontWeight="semibold" borderRadius="8px" boxShadow="0 4px 16px rgba(34, 211, 238, 0.2)" isLoading={isLoading} loadingText={t('auth.reset.updating')} isDisabled={password.length === 0 || confirmPassword.length === 0} _hover={{ bg: '#06b6d4', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(34, 211, 238, 0.35)' }} _active={{ transform: 'translateY(0)' }} transition="all 0.2s" mb={6}>
                            {t('auth.reset.updatePassword')}
                        </Button>
                    </form>
                </>
            )}

            <Divider borderColor="var(--color-border)" my={6} />

            <Box textAlign="center">
                <Link as={RouterLink} to="/signin" color="#22d3ee" fontSize="sm" _hover={{ textDecoration: 'underline' }} display="inline-flex" alignItems="center" gap={1}>
                    <ArrowLeftIcon w={4} h={4} />
                    {t('auth.reset.backToLogin')}
                </Link>
            </Box>
        </AuthCard>
    );
};

export default ResetPasswordPage;
