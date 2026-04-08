import { getToken, removeToken, setToken } from './cookieUtils';
import i18n, { getAcceptLanguageHeader } from '../i18n';
import { recordNetworkFailure } from './diagnosticsCollector';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
        'Accept-Language': getAcceptLanguageHeader(),
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

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const doFetch = async (fetchOpts) => {
        const method = String(fetchOpts.method || 'GET').toUpperCase();
        const retryable = ['GET', 'HEAD', 'OPTIONS'].includes(method);
        const maxRetries = retryable ? 3 : 0;
        let attempt = 0;
        let response;

        while (attempt <= maxRetries) {
            try {
                response = await fetch(`${BASE_URL}${endpoint}`, fetchOpts);
                break;
            } catch (error) {
                if (attempt === maxRetries) {
                    recordNetworkFailure({ url: `${BASE_URL}${endpoint}`, method, status: 0 });
                    const networkError = new Error(i18n.t('errors.network'));
                    networkError.cause = error;
                    throw networkError;
                }
                const backoffMs = 500 * (2 ** attempt);
                await delay(backoffMs);
                attempt += 1;
            }
        }

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
                        const errorMsg = res.data?.message || res.data?.error || i18n.t('errors.generic');
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
            const refreshResp = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Accept-Language': getAcceptLanguageHeader() },
            });
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
                throw new Error(i18n.t('errors.refreshFailed'));
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
            throw new Error(i18n.t('errors.sessionExpired'));
        }
    }

    if (!response.ok) {
        recordNetworkFailure({ url: `${BASE_URL}${endpoint}`, method: fetchOptions.method || 'GET', status: response.status });
        const errorMsg = data?.message || data?.error || i18n.t('errors.generic');
        const error = new Error(errorMsg);
        error.status = response.status;
        error.payload = data;
        throw error;
    }

    return data;
};
