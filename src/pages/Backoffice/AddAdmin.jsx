import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { userService } from '../../services/userService';
import usePasswordStrength from '../Frontoffice/profile/hooks/usePasswordStrength';
import PasswordStrengthMeter from '../Frontoffice/profile/components/PasswordStrengthMeter';
import RequirementChecklist from '../Frontoffice/profile/components/RequirementChecklist';

const AddAdmin = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        role: 'Admin',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const { score, label, color, glowColor, percent, requirements } = usePasswordStrength(formData.password);

    const validateForm = () => {
        setErrors({}); // Clear existing errors

        if (!formData.name.trim()) {
            setErrors({ name: t('admin.addAdmin.validationNameRequired') });
            return false;
        }
        if (formData.name.trim().length < 3) {
            setErrors({ name: t('admin.addAdmin.validationNameMinLength') });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            setErrors({ email: t('admin.addAdmin.validationEmailRequired') });
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: t('admin.addAdmin.validationEmailInvalid') });
            return false;
        }

        if (!formData.username.trim()) {
            setErrors({ username: t('admin.addAdmin.validationUsernameRequired') });
            return false;
        }
        if (formData.username.trim().length < 3) {
            setErrors({ username: t('admin.addAdmin.validationUsernameMinLength') });
            return false;
        }

        if (!formData.password) {
            setErrors({ password: t('admin.addAdmin.validationPasswordRequired') });
            return false;
        }
        if (score < 4) {
            setErrors({ password: t('admin.addAdmin.validationPasswordWeak') });
            return false;
        }

        return true;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await userService.createAdmin({
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role // Note: The backend enforces creation privileges strictly.
                // Not pushing 'name' because back-end lacks a top level standard schema mapping for it, yet leaving UI present.
            });
            toast({
                title: t('admin.addAdmin.toastCreatedTitle'),
                description: t('admin.addAdmin.toastCreatedDesc'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            });
            navigate('/admin/users');
        } catch (error) {
            toast({
                title: t('admin.addAdmin.toastFailedTitle'),
                description: error.message || t('admin.addAdmin.toastFailedDesc'),
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">{t('admin.addAdmin.title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">{t('admin.addAdmin.subtitle')}</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="glass-panel rounded-2xl p-8 shadow-custom">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                        {/* Header/Intro */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b ">
                            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold ">{t('admin.addAdmin.accountDetails')}</h3>
                                <p style={{ color: 'var(--color-text-muted)' }} className="text-sm ">{t('admin.addAdmin.accountDetailsSubtitle')}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.addAdmin.fullName')}</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder={t('admin.addAdmin.fullNamePlaceholder')} className={`form-input w-full ${errors.name ? 'border-red-500 focus:border-red-500 box-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`} />
                                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.addAdmin.emailAddress')}</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('admin.addAdmin.emailPlaceholder')} className={`form-input w-full ${errors.email ? 'border-red-500 focus:border-red-500 box-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`} />
                                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.addAdmin.username')}</label>
                                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder={t('admin.addAdmin.usernamePlaceholder')} className={`form-input w-full ${errors.username ? 'border-red-500 focus:border-red-500 box-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`} />
                                {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                            </div>

                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.addAdmin.role')}</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="form-select w-full bg-(--color-bg-input)">
                                    <option value="Admin">{t('admin.addAdmin.roleAdmin')}</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">{t('admin.addAdmin.temporaryPassword')}</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t('admin.addAdmin.passwordPlaceholder')} className={`form-input w-full ${errors.password ? 'border-red-500 focus:border-red-500 box-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`} />
                                {errors.password && (
                                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                )}

                                <div className="mt-3 bg-(--color-bg-input) p-4 rounded-lg border ">
                                    <PasswordStrengthMeter score={score} label={label} color={color} glowColor={glowColor} percent={percent} />
                                    <RequirementChecklist requirements={requirements} />
                                </div>
                            </div>
                        </div>

                        {/* Permissions Review (Visual only) */}
                        <div className="pt-4 mt-2">
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-3">{t('admin.addAdmin.permissions')}</label>
                            <div className="bg-(--color-bg-input) rounded-lg p-4 border  space-y-2">
                                <PermissionItem label={t('admin.addAdmin.permManageUsers')} />
                                <PermissionItem label={t('admin.addAdmin.permManageBattles')} />
                                <PermissionItem label={t('admin.addAdmin.permViewAnalytics')} />
                                <PermissionItem label={t('admin.addAdmin.permEditSettings')} isActive={false} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 mt-6 border-t ">
                            <button type="submit" disabled={isLoading} className="flex-1 btn-primary py-3 justify-center">
                                {isLoading ? t('admin.addAdmin.creating') : t('admin.addAdmin.createAdminAccount')}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="btn-secondary py-3 px-6">{t('admin.addAdmin.cancel')}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const PermissionItem = ({ label, isActive = true }) => (
    <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isActive ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-(--color-border) text-gray-500'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <span className={`text-sm ${isActive ? 'text-gray-300' : 'text-gray-500 line-through'}`}>{label}</span>
    </div>
);

export default AddAdmin;
