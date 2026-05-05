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
import i18n from '../../../../i18n';
import { authService } from '../../../../services/authService';
import { userService } from '../../../../services/userService';
import { setToken, removeToken, getToken } from '../../../../services/cookieUtils';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../../../services/backendUrl';
export { hasCompletedSpeedChallenge, redirectBasedOnRole } from './authContextUtils';

const AuthContext = createContext(null);
const AUTH_CHANNEL_NAME = 'auth_sync_channel';


const STORAGE_KEY = 'fo_auth';
let refreshAccessTokenPromise = null;

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
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: data.user } }));
    } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('isAuthenticated');
        removeToken();
        window.dispatchEvent(new CustomEvent('auth-change', { detail: { user: null } }));
    }
};

const refreshAccessToken = async () => {
    if (!refreshAccessTokenPromise) {
        refreshAccessTokenPromise = fetch(buildApiUrl('/auth/refresh'), {
            method: 'POST',
            credentials: 'include',
            headers: { 'Accept-Language': i18n.language || 'en' },
        })
            .then(async (response) => {
                if (response.status === 401 || response.status === 403) return null;
                if (!response.ok) return undefined;
                const data = await response.json().catch(() => null);
                if (data?.access_token) {
                    setToken(data.access_token);
                    return data.access_token;
                }
                return undefined;
            })
            .catch((error) => {
                console.error('Token refresh failed:', error);
                return undefined;
            })
            .finally(() => {
                refreshAccessTokenPromise = null;
            });
    }

    return refreshAccessTokenPromise;
};

const DEFAULT_AVATAR =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = readStorage();
        return stored ? stored.user : null;
    });
    const [coinBalance, setCoinBalance] = useState(() => Number(readStorage()?.user?.hintCredits ?? 1));
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const authChannel = React.useRef(null);

    /* Cross-tab Auth Synchronization using BroadcastChannel */
    useEffect(() => {
        authChannel.current = new BroadcastChannel(AUTH_CHANNEL_NAME);
        authChannel.current.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'LOGOUT') {
                writeStorage(null);
                setCurrentUser(null);
                toast({
                    title: i18n.t('auth.context.sessionExpiredTitle'),
                    description: i18n.t('auth.context.sessionExpiredSignedOut'),
                    status: 'warning',
                    duration: 5000,
                    isClosable: true,
                });
                navigate('/signin');
            } else if (type === 'LOGIN') {
                const stored = readStorage();
                if (stored?.user) {
                    setCurrentUser(stored.user);
                } else if (payload?.user) {
                    setCurrentUser(payload.user);
                }
                // Optional: redirect to protected page or just let UI update
            }
        };

        return () => {
            if (authChannel.current) {
                authChannel.current.close();
            }
        };
    }, [toast, navigate]);

    useEffect(() => {
        setCoinBalance(Number(currentUser?.hintCredits ?? 1));
    }, [currentUser?.hintCredits]);

    /* Rehydrate on mount */
    useEffect(() => {
        const initAuth = async () => {
            let storedToken = getToken();
            if (!storedToken) {
                const refreshedToken = await refreshAccessToken();
                if (refreshedToken) {
                    storedToken = refreshedToken;
                } else if (refreshedToken === undefined) {
                    const stored = readStorage();
                    if (stored?.user) {
                        setCurrentUser(stored.user);
                        setCoinBalance(Number(stored.user?.hintCredits ?? 1));
                        setIsAuthLoading(false);
                        return;
                    }
                }
            }

            if (!storedToken) {
                writeStorage(null);
                setCurrentUser(null);
                setIsAuthLoading(false);
                return;
            }

            try {
                // Fetch fresh profile from backend
                const profile = await userService.getProfile('me');
                setCurrentUser(profile);
                setCoinBalance(Number(profile?.hintCredits ?? 1));
                writeStorage({ user: profile });
            } catch (err) {
                // If it fails (e.g. 401), apiClient clears token already
                const stored = readStorage();
                if (stored?.user) {
                    setCurrentUser(stored.user);
                    setCoinBalance(Number(stored.user?.hintCredits ?? 1));
                }
            } finally {
                setIsAuthLoading(false);
            }
        };
        initAuth();
    }, []);

    /* Proactive Background Token Refresh Loop */
    useEffect(() => {
        const doRefresh = async () => {
            const hasSession = Boolean(getToken() || readStorage()?.user);
            if (!hasSession) return;

            try {
                const token = await refreshAccessToken();
                if (token === null) {
                    writeStorage(null);
                    setCurrentUser(null);
                    toast({
                        title: i18n.t('auth.context.sessionExpiredTitle'),
                        description: i18n.t('auth.context.sessionExpiredLogin'),
                        status: 'warning',
                        duration: 5000,
                        isClosable: true,
                    });
                    navigate('/signin');
                }
            } catch (error) {
                console.error("Proactive background refresh failed:", error);
            }
        };

        // Refresh every 5 minutes (access token lives 15 min)
        const refreshInterval = setInterval(doRefresh, 5 * 60 * 1000);

        // Also refresh when tab becomes visible again
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                doRefresh();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(refreshInterval);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [navigate, toast]);

    const isLoggedIn = !!currentUser;

    const establishSession = useCallback(async (accessToken) => {
        if (!accessToken) return null;

        setToken(accessToken);

        // Fetch complete profile details
        const profile = await userService.getProfile('me', accessToken);
        const user = { ...profile };

        setCurrentUser(user);
        setCoinBalance(Number(user?.hintCredits ?? 1));
        writeStorage({ user });

        if (authChannel.current) {
            authChannel.current.postMessage({ type: 'LOGIN', payload: { user } });
        }

        return user;
    }, []);

    /**
     * login – authenticates user via API
     */
    const login = useCallback(async (username, password, recaptchaToken) => {
        try {
            const data = await authService.login({ username, password, recaptchaToken });
            const user = await establishSession(data.access_token);
            toast({ title: i18n.t('auth.context.welcomeBack'), status: 'success', duration: 3000, isClosable: true });
            return user;
        } catch (error) {
            toast({ title: i18n.t('auth.context.loginFailed'), description: error.message, status: 'error', duration: 4000, isClosable: true });
            throw error;
        }
    }, [establishSession, toast]);

    /**
     * signup – creates new account
     */
    const signup = useCallback(async (username, email, password, recaptchaToken, avatar) => {
        try {
            const data = await authService.register({ username, email, password, recaptchaToken, avatar });
            const user = await establishSession(data.access_token);
            toast({ title: i18n.t('auth.context.accountCreated'), description: i18n.t('auth.context.nowSignedIn'), status: 'success', duration: 4000, isClosable: true });
            return user;
        } catch (error) {
            toast({ title: i18n.t('auth.context.registrationFailed'), description: error.message, status: 'error', duration: 4000, isClosable: true });
            throw error;
        }
    }, [establishSession, toast]);

    /**
     * logout – clears session.
     */
    const logout = useCallback(() => {
        setCurrentUser(null);
        writeStorage(null);
        if (authChannel.current) {
            authChannel.current.postMessage({ type: 'LOGOUT' });
        }
        navigate('/signin');
    }, [navigate]);

    /**
     * updateCurrentUser – partial-patch the persisted user.
     * Used by ProfileContext when the user updates their profile.
     */
    const updateCurrentUser = useCallback((patch) => {
        setCurrentUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            if (patch?.hintCredits !== undefined) {
                setCoinBalance(Number(patch.hintCredits ?? 1));
            }
            writeStorage({ user: next });
            return next;
        });
    }, []);

    /**
     * reload – refresh user auth from token and server
     * Used after OAuth redirect to re-fetch user data
     */
    const reload = useCallback(async () => {
        let storedToken = getToken();
        if (!storedToken) {
            const refreshedToken = await refreshAccessToken();
            if (refreshedToken) {
                storedToken = refreshedToken;
            } else if (refreshedToken === undefined) {
                const stored = readStorage();
                if (stored?.user) {
                    setCurrentUser(stored.user);
                    setCoinBalance(Number(stored.user?.hintCredits ?? 1));
                    return;
                }
            }
        }
        if (!storedToken) {
            writeStorage(null);
            setCurrentUser(null);
            return;
        }

        try {
            const profile = await userService.getProfile('me');
            setCurrentUser(profile);
            setCoinBalance(Number(profile?.hintCredits ?? 1));
            writeStorage({ user: profile });
        } catch (err) {
            const stored = readStorage();
            if (stored?.user) {
                setCurrentUser(stored.user);
                setCoinBalance(Number(stored.user?.hintCredits ?? 1));
            }
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isLoggedIn,
                isAuthLoading,
                login,
                signup,
                logout,
                updateCurrentUser,
                reload,
                coinBalance,
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
