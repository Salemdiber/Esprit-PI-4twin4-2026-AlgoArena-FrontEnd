/**
 * ProfileContext – centralised state for the profile feature.
 *
 * Manages:
 *  • user object (avatar, username, email, bio)
 *  • isEditing / isUpdating flags
 *  • twoFactorEnabled / twoFactorMethod
 *
 * Syncs with AuthContext:
 *  • Reads initial user data from auth (localStorage-backed)
 *  • Propagates profile updates back to auth so the header stays in sync
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { userService } from '../../../../services/userService';
import { useToast } from '@chakra-ui/react';

const ProfileContext = createContext(null);


/* ── fallback user seed data (used when not logged in) ── */
const FALLBACK_USER = {
    avatar: '',
    username: 'guest',
    email: '',
    emailVerified: false,
    bio: '',
};

export const ProfileProvider = ({ children }) => {
    const { currentUser: authUser, isLoggedIn, updateCurrentUser } = useAuth();
    const toast = useToast();

    const [user, setUser] = useState(() => {
        if (authUser) return { ...FALLBACK_USER, ...authUser };
        return FALLBACK_USER;
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorMethod, setTwoFactorMethod] = useState(null); // 'authenticator' | 'email' | null

    /* Sync profile user when auth user changes (login / logout) */
    useEffect(() => {
        if (authUser) {
            setUser((prev) => ({ ...prev, ...authUser }));
        } else {
            setUser(FALLBACK_USER);
        }
    }, [authUser]);

    /* ── helpers that will wrap real API calls ── */
    const updateUser = useCallback(async (patch) => {
        setIsUpdating(true);
        try {
            await userService.updateProfile(patch);
            setUser((prev) => ({ ...prev, ...patch }));
            if (isLoggedIn) updateCurrentUser(patch);
            toast({ title: 'Profile updated', status: 'success', duration: 3000, isClosable: true });
        } catch (error) {
            toast({ title: 'Failed to update profile', description: error.message, status: 'error', duration: 3000, isClosable: true });
            throw error;
        } finally {
            setIsUpdating(false);
            setIsEditing(false);
        }
    }, [isLoggedIn, updateCurrentUser, toast]);

    const updateAvatar = useCallback(async (file) => {
        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file); // Adjust field name if necessary

            const response = await userService.uploadAvatar(formData);

            // Assume response returns the updated avatar URL, or create object URL temporarily
            const newAvatarUrl = response?.avatarUrl || URL.createObjectURL(file);
            setUser((prev) => ({ ...prev, avatar: newAvatarUrl }));
            if (isLoggedIn) updateCurrentUser({ avatar: newAvatarUrl });

            toast({ title: 'Avatar updated', status: 'success', duration: 3000, isClosable: true });
        } catch (error) {
            toast({ title: 'Failed to update avatar', description: error.message, status: 'error', duration: 3000, isClosable: true });
        } finally {
            setIsUpdating(false);
        }
    }, [isLoggedIn, updateCurrentUser, toast]);

    const removeAvatar = useCallback(async () => {
        setIsUpdating(true);
        try {
            await new Promise((r) => setTimeout(r, 300));
            setUser((prev) => ({ ...prev, avatar: '' }));
            if (isLoggedIn) updateCurrentUser({ avatar: '' });
        } finally {
            setIsUpdating(false);
        }
    }, [isLoggedIn, updateCurrentUser]);

    return (
        <ProfileContext.Provider
            value={{
                user,
                setUser,
                isEditing,
                setIsEditing,
                isUpdating,
                setIsUpdating,
                twoFactorEnabled,
                setTwoFactorEnabled,
                twoFactorMethod,
                setTwoFactorMethod,
                updateUser,
                updateAvatar,
                removeAvatar,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
    return ctx;
};

export default ProfileContext;

