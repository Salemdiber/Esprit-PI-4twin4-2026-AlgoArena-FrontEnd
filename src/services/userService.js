import { apiClient } from './apiClient';

export const userService = {
    // ------------------------------------
    // Front Office Profile API
    // ------------------------------------

    // In some cases to load logged-in profile we can use /user/me if it exists,
    // or /user/:id (where id is stored locally from login). We assume /user/:id or /user/me
    getProfile: async (id, token = null) => {
        return apiClient(id === 'me' ? '/user/me' : `/user/${id}`, {
            method: 'GET',
            token, // Bypass cookie race conditions
        });
    },

    /**
     * Persist the Speed Challenge placement result to the user profile.
     * Called once right after the challenge finishes.
     * @param {{ rank: string, xp: number, level?: string }} data
     */
    updatePlacement: async (data) => {
        return apiClient('/user/me/placement', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    updateProfile: async (data) => {
        // PATCH /user/me
        // data: { username?, email?, bio? }
        return apiClient('/user/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    uploadAvatar: async (formData) => {
        // PATCH /user/me/avatar
        // uses FormData
        return apiClient('/user/me/avatar', {
            method: 'PATCH',
            body: formData,
        });
    },

    changePassword: async (data) => {
        // PATCH /user/me/password
        // data: { currentPassword, newPassword, confirmPassword }
        return apiClient('/user/me/password', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    deleteAccount: async (password) => {
        // DELETE /user/me
        // data: { password }
        return apiClient('/user/me', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        });
    },

    // ------------------------------------
    // Back Office User Management API
    // ------------------------------------

    getUsers: async () => {
        return apiClient('/user', {
            method: 'GET',
        });
    },

    createAdmin: async (data) => {
        return apiClient('/user/admin', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getUserById: async (id) => {
        return apiClient(`/user/${id}`, {
            method: 'GET',
        });
    },

    updateUserByAdmin: async (id, data) => {
        return apiClient(`/user/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    uploadAvatarByAdmin: async (id, formData) => {
        return apiClient(`/user/${id}/avatar`, {
            method: 'PATCH',
            body: formData,
        });
    },

    updateStatusByAdmin: async (id, status) => {
        return apiClient(`/user/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },
};
