export const setToken = (token) => {
    // Access token is short-lived (15 minutes)
    const maxAge = 15 * 60; // 15 minutes in seconds
    document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const getToken = () => {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    return match ? match[2] : null;
};

export const removeToken = () => {
    document.cookie = 'access_token=; path=/; max-age=0;';
};
