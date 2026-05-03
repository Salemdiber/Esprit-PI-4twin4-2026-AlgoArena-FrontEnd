import { apiClient } from './apiClient';
import { setToken } from './cookieUtils';

export const authService = {
    login: async (credentials) => {
        // credentials: { username, password }
        // API expecting username and password for login
        // We need credentials to include cookies so backend can set refresh_token HttpOnly cookie
        const resp = await apiClient('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            credentials: 'include',
        });
        // Backend returns { access_token }
        if (resp?.access_token) {
            // store short-lived access token in cookie/local state
            setToken(resp.access_token);
        }
        return resp;
    },

    register: async (data) => {
        // data: { username, password, email, bio?, avatar?, role? }
        return apiClient('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // logout is handled on UI level by removing cookies, but if a backend route exists, we could use it.
    // For now we will support logout utility function in cookieUtils.

    logout: async () => {
        try {
            await apiClient('/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            // ignore
        }
    },

    checkAvailability: async (field, value) => {
        return apiClient('/auth/check-availability', {
            method: 'POST',
            body: JSON.stringify({ [field]: value }),
        });
    },

    forgotPassword: async (email) => {
        return apiClient('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    verifyResetCode: async (email, code) => {
        return apiClient('/auth/verify-reset-code', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });
    },

    resetPassword: async (token, newPassword, confirmPassword) => {
        return apiClient('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword, confirmPassword }),
        });
    },

};
