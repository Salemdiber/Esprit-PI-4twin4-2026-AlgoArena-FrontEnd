import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Flex, Avatar, Button, Text, FormControl, FormLabel,
    Input, Textarea, useToast, Spinner, AlertDialog,
    AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay, useDisclosure
, useColorModeValue } from '@chakra-ui/react';
import { useAuth } from '../Frontoffice/auth/context/AuthContext';
import { userService } from '../../services/userService';
import TwoFactorSection from '../Frontoffice/profile/components/TwoFactorSection';

const Profile = () => {
    const { currentUser, updateCurrentUser, logout } = useAuth();
    const toast = useToast();

    // Profile Edit State
    const [draft, setDraft] = useState({ username: '', email: '', bio: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Avatar State
    const fileInputRef = useRef(null);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Delete Account State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize draft from currentUser
    useEffect(() => {
        if (currentUser) {
            setDraft({
                username: currentUser.username || '',
                email: currentUser.email || '',
                bio: currentUser.bio || ''
            });
        }
    }, [currentUser]);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUpdatingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await userService.uploadAvatar(formData);
            const newAvatarUrl = res?.avatarUrl || URL.createObjectURL(file);
            updateCurrentUser({ avatar: newAvatarUrl });
            toast({ title: 'Avatar updated correctly', status: 'success', duration: 3000 });
        } catch (error) {
            toast({ title: 'Failed to update avatar', description: error.message, status: 'error', duration: 3000 });
        } finally {
            setIsUpdatingAvatar(false);
        }
        e.target.value = '';
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const patch = {};
            if (draft.username && draft.username !== currentUser.username) patch.username = draft.username;
            if (draft.email && draft.email !== currentUser.email) patch.email = draft.email;
            if (draft.bio !== currentUser.bio) patch.bio = draft.bio; // bio can be empty

            if (Object.keys(patch).length > 0) {
                await userService.updateProfile(patch);
                updateCurrentUser(patch);
                toast({ title: 'Profile updated successfully', status: 'success', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Failed to update profile', description: error.message, status: 'error', duration: 3000 });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast({ title: 'Passwords do not match', status: 'error', duration: 3000 });
        }
        setIsUpdatingPassword(true);
        try {
            await userService.changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            });
            toast({ title: 'Password changed successfully', status: 'success', duration: 3000 });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast({ title: 'Failed to change password', description: error.message, status: 'error', duration: 3000 });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return toast({ title: 'Password required', status: 'error', duration: 3000 });
        setIsDeleting(true);
        try {
            await userService.deleteAccount(deletePassword);
            logout();
            toast({ title: 'Account deleted', status: 'success', duration: 3000 });
            window.location.href = '/signin';
        } catch (error) {
            toast({ title: 'Failed to delete account', description: error.message, status: 'error', duration: 3000 });
        } finally {
            setIsDeleting(false);
            onDeleteClose();
            setDeletePassword('');
        }
    };

    if (!currentUser) {
        return (
            <Flex w="100%" h="50vh" align="center" justify="center" direction="column" gap={4}>
                <Spinner size="xl" color="cyan.400" />
                <Text color={useColorModeValue("gray.500","gray.400")}>Loading admin profile...</Text>
            </Flex>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">My Profile</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">Manage your account settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Avatar & Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 shadow-custom">
                        <Flex direction="column" align="center" textAlign="center">
                            <Box position="relative" mb={4}>
                                {isUpdatingAvatar ? (
                                    <Flex w="128px" h="128px" align="center" justify="center" borderRadius="full" border="4px solid" borderColor="cyan.400" bg="var(--color-bg-primary)">
                                        <Spinner color="cyan.400" />
                                    </Flex>
                                ) : (
                                    <Avatar
                                        src={currentUser.avatar?.startsWith('uploads/') ? `/${currentUser.avatar}` : currentUser.avatar}
                                        name={currentUser.username}
                                        w="128px" h="128px"
                                        border="4px solid" borderColor="cyan.400"
                                        boxShadow="0 0 20px rgba(34,211,238,0.3)"
                                    />
                                )}
                                <Button
                                    position="absolute"
                                    bottom={0}
                                    right={0}
                                    size="sm"
                                    borderRadius="full"
                                    colorScheme="cyan"
                                    onClick={() => fileInputRef.current?.click()}
                                    isLoading={isUpdatingAvatar}
                                >
                                    <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </Button>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                            </Box>
                            <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-1">@{currentUser.username}</h2>
                            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  mb-2">{currentUser.email}</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                                {currentUser.role}
                            </span>
                        </Flex>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Profile Information */}
                    <div className="glass-panel rounded-2xl p-6 shadow-custom">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-6">Profile Information</h2>
                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <FormControl>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>Username</FormLabel>
                                <Input
                                    bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")}
                                    value={draft.username}
                                    onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>Email Address</FormLabel>
                                <Input
                                    type="email"
                                    bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")}
                                    value={draft.email}
                                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>Bio</FormLabel>
                                <Textarea
                                    bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")} rows={4}
                                    value={draft.bio}
                                    onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                                />
                            </FormControl>
                            <Button type="submit" colorScheme="cyan" isLoading={isUpdatingProfile} mt={4} color="gray.900" fontWeight="bold">
                                Save Profile
                            </Button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="glass-panel rounded-2xl p-6 shadow-custom">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-6">Security (Change Password)</h2>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <FormControl isRequired>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>Current Password</FormLabel>
                                <Input
                                    type="password" bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>New Password</FormLabel>
                                <Input
                                    type="password" bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")}
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel color={useColorModeValue("gray.600","gray.300")}>Confirm New Password</FormLabel>
                                <Input
                                    type="password" bg="var(--color-bg-primary)" borderColor={useColorModeValue("gray.200","gray.700")} color={useColorModeValue("gray.800","gray.100")}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </FormControl>
                            <Button type="submit" colorScheme="cyan" isLoading={isUpdatingPassword} mt={4} color="gray.900" fontWeight="bold">
                                Update Password
                            </Button>
                        </form>
                    </div>

                    <TwoFactorSection />

                    {/* Danger Zone */}
                    <div className="glass-panel rounded-2xl p-6 shadow-custom border border-red-900/50">
                        <h2 className="font-heading text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm  mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <Button colorScheme="red" variant="outline" onClick={onDeleteOpen} _hover={{ bg: 'red.500', color: 'white' }}>
                            Delete Account
                        </Button>
                    </div>
                </div>

            </div>

            {/* Delete Account AlertDialog */}
            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent bg="var(--color-bg-secondary)" color={useColorModeValue("gray.800","gray.100")} border="1px solid" borderColor="var(--color-border)">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text mb={4}>Are you sure? You can't undo this action afterwards. Please enter your password to confirm.</Text>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                bg="var(--color-bg-primary)" borderColor="var(--color-border)" color={useColorModeValue("gray.800","gray.100")}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                            />
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose} variant="ghost" _hover={{ bg: 'gray.700' }}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteAccount} ml={3} isLoading={isDeleting}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default Profile;
