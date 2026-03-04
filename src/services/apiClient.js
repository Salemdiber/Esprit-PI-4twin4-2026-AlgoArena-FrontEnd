import { getToken, removeToken, setToken } from './cookieUtils';

const BASE_URL = '/api';

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
    refreshQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    refreshQueue = [];
};

export const apiClient = async (endpoint, options = {}) => {
    const token = options.token || getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && options.body instanceof FormData) {
        // Let the browser set the content type with boundary for FormData
        delete headers['Content-Type'];
    }

    // Ensure cookies (refresh token HttpOnly) are sent for same-origin requests
    const fetchOptions = {
        ...options,
        headers,
        credentials: options.credentials || 'include',
    };

    const doFetch = async (fetchOpts) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, fetchOpts);

        let data;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } catch {
            data = null; // non-json or parsing error
        }

        return { response, data };
    };

    // Attempt fetch
    let { response, data } = await doFetch(fetchOptions);

    // If unauthorized, attempt refresh (except when calling login or refresh endpoints)
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        if (isRefreshing) {
            // Wait for existing refresh to complete
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            }).then(newToken => {
                const newOpts = { ...fetchOptions };
                newOpts.headers['Authorization'] = `Bearer ${newToken}`;
                return doFetch(newOpts).then(res => {
                    if (!res.response.ok) {
                        const errorMsg = res.data?.message || res.data?.error || 'Something went wrong';
                        throw new Error(errorMsg);
                    }
                    return res.data;
                });
            }).catch(err => {
                throw err;
            });
        }

        isRefreshing = true;

        try {
            // Try refresh
            const refreshResp = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
            if (refreshResp.ok) {
                const refreshData = await refreshResp.json();
                const newAccess = refreshData?.access_token;
                if (newAccess) {
                    // store new access token and retry original request
                    setToken(newAccess);
                    fetchOptions.headers['Authorization'] = `Bearer ${newAccess}`;

                    isRefreshing = false;
                    processQueue(null, newAccess);

                    ({ response, data } = await doFetch(fetchOptions));
                }
            } else {
                throw new Error('Refresh failed');
            }
        } catch (e) {
            isRefreshing = false;
            processQueue(e, null);

            // refresh failed -> clear client state
            removeToken();
            localStorage.removeItem('fo_auth');
            localStorage.removeItem('isAuthenticated');
            if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
                window.location.href = '/signin';
            }
            throw new Error('Session expired');
        }
    }

    if (!response.ok) {
        const errorMsg = data?.message || data?.error || 'Something went wrong';
        throw new Error(errorMsg);
    }

    return data;
};
