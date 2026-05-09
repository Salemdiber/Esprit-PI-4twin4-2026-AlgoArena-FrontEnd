const isSecureContext = () =>
    typeof window !== 'undefined' && window.location.protocol === 'https:';

export const setToken = (token) => {
    // Access token is short-lived (15 minutes)
    const maxAge = 15 * 60; // 15 minutes in seconds
    const secure = isSecureContext();
    const sameSite = secure ? 'None' : 'Lax';
    const securePart = secure ? '; Secure' : '';
    document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=${sameSite}${securePart}`;
};

export const getToken = () => {
    const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
    return match ? match[2] : null;
};

export const removeToken = () => {
    const secure = isSecureContext();
    const sameSite = secure ? 'None' : 'Lax';
    const securePart = secure ? '; Secure' : '';
    document.cookie = `access_token=; path=/; max-age=0; SameSite=${sameSite}${securePart}`;
};
