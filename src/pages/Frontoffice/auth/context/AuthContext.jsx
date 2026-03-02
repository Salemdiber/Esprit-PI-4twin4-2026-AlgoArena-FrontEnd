/**
 * AuthContext – front-office authentication via localStorage.
 *
 * Stores:
 *   • currentUser  { username, email, avatar, role }
 *   • isLoggedIn   boolean
 *
 * Persists to localStorage under key "fo_auth".
 * Exposes login / signup / logout helpers.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '../../../../services/authService';
import { userService } from '../../../../services/userService';
import { setToken, removeToken, getToken } from '../../../../services/cookieUtils';
import { useToast } from '@chakra-ui/react';

const AuthContext = createContext(null);


const STORAGE_KEY = 'fo_auth';

/* Real user state persistence (for role UI logic offline etc.), token is in cookie */
const readStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const writeStorage = (data) => {
    if (data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        const role = String(data.user?.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'ORGANIZER') {
            localStorage.setItem('isAuthenticated', 'true');
        } else {
            localStorage.removeItem('isAuthenticated');
        }
    } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('isAuthenticated');
        removeToken();
    }
};

/**
 * redirectBasedOnRole – determines the redirect path based on user role.
 *
 * ADMIN | ORGANIZER → /admin (Backoffice)
 * USER | COMPETITOR → / (Frontoffice Home)
 */
export const redirectBasedOnRole = (user) => {
    if (!user || !user.role) return '/signin';
    const role = user.role.toUpperCase();
    if (role === 'ADMIN' || role === 'ORGANIZER') {
        return '/admin';
    }
    return '/';
};

const DEFAULT_AVATAR =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = readStorage();
        return stored ? stored.user : null;
    });
    const toast = useToast();

    /* Rehydrate on mount */
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = getToken();
            if (!storedToken) {
                writeStorage(null);
                setCurrentUser(null);
                return;
            }

            try {
                // Fetch fresh profile from backend
                const profile = await userService.getProfile('me');
                setCurrentUser(profile);
                writeStorage({ user: profile });
            } catch (err) {
                // If it fails (e.g. 401), apiClient clears token already
                const stored = readStorage();
                if (stored?.user) {
                    setCurrentUser(stored.user);
                }
            }
        };
        initAuth();
    }, []);

    /* Proactive Background Token Refresh Loop based on User Activity */
    useEffect(() => {
        let lastActivity = Date.now();

        const updateActivity = () => {
            lastActivity = Date.now();
        };

        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

        // Runs every 10 minutes (600,000 ms)
        const refreshInterval = setInterval(async () => {
            const token = getToken();
            if (!token) return; // Not signed in, ignore

            const isTabVisible = document.visibilityState === 'visible';
            const isUserActive = (Date.now() - lastActivity) < 15 * 60 * 1000; // Active within 15 minutes

            if (isTabVisible && isUserActive) {
                try {
                    const refreshResp = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
                    if (refreshResp.ok) {
                        const data = await refreshResp.json();
                        if (data?.access_token) {
                            setToken(data.access_token);
                        }
                    }
                } catch (error) {
                    console.error("Proactive background refresh failed:", error);
                }
            }
        }, 10 * 60 * 1000);

        return () => {
            clearInterval(refreshInterval);
            activityEvents.forEach(event => window.removeEventListener(event, updateActivity));
        };
    }, []);

    const isLoggedIn = !!currentUser;

    /**
     * login – authenticates user via API
     */
    const login = useCallback(async (username, password, recaptchaToken) => {
        try {
            const data = await authService.login({ username, password, recaptchaToken });
            if (data.access_token) {
                setToken(data.access_token);

                // Fetch complete profile details
                const profile = await userService.getProfile('me', data.access_token);
                // profile from /user/me has rank+xp; data.user from JWT only has basic claims.
                // Merge: data.user provides base, profile overrides (has rank, xp, avatar, bio…)
                const user = { ...data.user, role: data.role || profile?.role || 'USER', ...profile };

                setCurrentUser(user);
                writeStorage({ user });

                toast({ title: 'Welcome Back!', status: 'success', duration: 3000, isClosable: true });
                return user;
            }
        } catch (error) {
            toast({ title: 'Login failed', description: error.message, status: 'error', duration: 4000, isClosable: true });
            throw error;
        }
    }, [toast]);

    /**
     * signup – creates new account
     */
    const signup = useCallback(async (username, email, password, recaptchaToken, avatar) => {
        try {
            const data = await authService.register({ username, email, password, recaptchaToken, avatar });
            toast({ title: 'Account created successfully', description: 'You can now sign in.', status: 'success', duration: 4000, isClosable: true });
            return data;
        } catch (error) {
            toast({ title: 'Registration failed', description: error.message, status: 'error', duration: 4000, isClosable: true });
            throw error;
        }
    }, [toast]);

    /**
     * logout – clears session.
     */
    const logout = useCallback(() => {
        setCurrentUser(null);
        writeStorage(null);
    }, []);

    /**
     * updateCurrentUser – partial-patch the persisted user.
     * Used by ProfileContext when the user updates their profile.
     */
    const updateCurrentUser = useCallback((patch) => {
        setCurrentUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            writeStorage({ user: next });
            return next;
        });
    }, []);

    /**
     * reload – refresh user auth from token and server
     * Used after OAuth redirect to re-fetch user data
     */
    const reload = useCallback(async () => {
        const storedToken = getToken();
        if (!storedToken) {
            writeStorage(null);
            setCurrentUser(null);
            return;
        }

        try {
            const profile = await userService.getProfile('me');
            setCurrentUser(profile);
            writeStorage({ user: profile });
        } catch (err) {
            const stored = readStorage();
            if (stored?.user) {
                setCurrentUser(stored.user);
            }
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isLoggedIn,
                login,
                signup,
                logout,
                updateCurrentUser,
                reload,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};

export default AuthContext;
