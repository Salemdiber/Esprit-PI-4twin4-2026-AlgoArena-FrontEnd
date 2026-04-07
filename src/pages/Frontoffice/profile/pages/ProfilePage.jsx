/**
 * ProfilePage – /profile
 *
 * Assembles all profile sections:
 *  1. AvatarSection
 *  2. ProfileInfoSection
 *  3. ChangePasswordSection
 *  4. TwoFactorSection
 *  5. Danger Zone (bonus)
 *
 * Uses the same background system as Battles / Challenges / Leaderboard:
 *   bg: #0f172a, subtle cyan grid overlay.
 */
import React, { useRef, useState } from 'react';
import { Box, Text, Button, VStack, Flex, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Input, useToast , useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import AvatarSection from '../components/AvatarSection';
import ProfileInfoSection from '../components/ProfileInfoSection';
import ChangePasswordSection from '../components/ChangePasswordSection';
import TwoFactorSection from '../components/TwoFactorSection';

import { userService } from '../../../../services/userService';
import { useAuth } from '../../auth/context/AuthContext';

const MotionBox = motion.create(Box);

const ProfilePage = () => {
    const prefersReducedMotion = useReducedMotion();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleDeleteAccount = async () => {
        if (!deletePassword) return toast({ title: 'Password required', status: 'error', duration: 3000 });
        setIsDeleting(true);
        try {
            await userService.deleteAccount(deletePassword);
            logout(); // Clears context and cookies
            toast({ title: 'Account deleted', status: 'success', duration: 3000 });
            navigate('/');
        } catch (error) {
            toast({ title: 'Failed to delete account', description: error.message, status: 'error', duration: 3000 });
        } finally {
            setIsDeleting(false);
            onClose();
            setDeletePassword('');
        }
    };

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
            bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
            bgSize="50px 50px"
            position="relative"
            overflow="hidden"
        >
            <Box maxW="3xl" mx="auto" position="relative" zIndex={10}>
                {/* Page header */}
                <Box mb={8}>
                    <Text
                        fontFamily="heading"
                        fontSize={{ base: '2xl', md: '3xl' }}
                        fontWeight="bold"
                        color={useColorModeValue("gray.800","gray.100")}
                        mb={2}
                    >
                        Account Settings
                    </Text>
                    <Text color={useColorModeValue("gray.500","gray.400")} fontSize={{ base: 'sm', md: 'md' }}>
                        Manage your profile, security, and authentication
                    </Text>
                </Box>

                {/* Sections stack */}
                <VStack spacing={8} align="stretch">
                    <AvatarSection />
                    <ProfileInfoSection />
                    <ChangePasswordSection />
                    <TwoFactorSection />

                    {/* Danger Zone */}
                    <MotionBox
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                        border="1px solid"
                        borderColor="rgba(239, 68, 68, 0.2)"
                        bg="rgba(239, 68, 68, 0.04)"
                        borderRadius="12px"
                        p={{ base: 6, md: 8 }}
                        mt={4}
                    >
                        <Text fontFamily="heading" color="#ef4444" fontWeight="600" fontSize="lg" mb={2}>
                            Danger Zone
                        </Text>
                        <Text color={useColorModeValue("gray.500","gray.400")} fontSize="sm" mb={6}>
                            Once you delete your account, there is no going back. Please be certain.
                        </Text>
                        <Button
                            variant="outline"
                            borderColor="rgba(239, 68, 68, 0.5)"
                            color="#ef4444"
                            fontWeight="500"
                            borderRadius="6px"
                            fontSize="sm"
                            _hover={{ bg: '#ef4444', color: 'white' }}
                            transition="all 0.2s"
                            onClick={onOpen}
                        >
                            Delete Account
                        </Button>
                    </MotionBox>
                </VStack>
            </Box>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent bg="var(--color-bg-secondary)" color={useColorModeValue("gray.800","gray.100")} border="1px solid" borderColor="var(--color-border)">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Account
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure? You can't undo this action afterwards.
                            Please enter your password to confirm.
                            <Input
                                type="password"
                                mt={4}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter password"
                                bg="var(--color-bg-primary)"
                                borderColor="var(--color-border)"
                                _focus={{ borderColor: '#ef4444', boxShadow: '0 0 0 1px #ef4444' }}
                            />
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose} bg="gray.600" _hover={{ bg: 'gray.500' }}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteAccount} ml={3} isLoading={isDeleting}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </MotionBox>
    );
};

export default ProfilePage;
