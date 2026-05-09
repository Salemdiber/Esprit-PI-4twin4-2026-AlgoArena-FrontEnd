const trimTrailingSlash = (value) => String(value || '').trim().replace(/\/+$/, '');

const getConfiguredApiUrl = () => trimTrailingSlash(import.meta?.env?.VITE_API_URL || '');

const normalizeRelativePath = (value) => String(value || '').trim().replace(/^\/+/, '').replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const raw = getConfiguredApiUrl();
  if (!raw) return '/api';

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const pathname = parsed.pathname.replace(/\/+$/, '');
      const basePath = pathname.endsWith('/api') ? pathname : `${pathname}/api`;
      return `${parsed.origin}${basePath}`.replace(/\/+$/, '');
    } catch {
      return '/api';
    }
  }

  if (raw.startsWith('/')) {
    return raw || '/api';
  }

  return `/${normalizeRelativePath(raw)}` || '/api';
};

export const buildApiUrl = (path) => {
  const endpoint = String(path || '').trim();
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export const getApiOrigin = () => {
  const raw = getConfiguredApiUrl();
  if (!raw) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      return typeof window !== 'undefined' ? window.location.origin : '';
    }
  }

  if (raw.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  return typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : '';
};

export const buildWsUrl = (path) => {
  const endpoint = String(path || '').trim();
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const raw = getConfiguredApiUrl();

  if (/^https?:\/\//i.test(raw)) {
    return `${raw.replace(/^http/i, 'ws').replace(/\/+$/, '').replace(/\/api$/, '')}${normalizedPath}`;
  }

  if (typeof window !== 'undefined') {
    const secure = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${secure}://${window.location.hostname}:3000${normalizedPath}`;
  }

  return `ws://localhost:3000${normalizedPath}`;
};