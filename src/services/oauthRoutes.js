function normalizeBackendBase(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value, window.location.origin);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isDevPort = parsed.port === '3000' || parsed.port === '';

    if (isLocalHost && !isDevPort) {
      return '';
    }

    const pathname = parsed.pathname.replace(/\/$/, '');
    const basePath = pathname.endsWith('/api') ? pathname : `${pathname}/api`;
    return `${parsed.origin}${basePath}`.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function getOAuthUrl(provider) {
  const apiBase =
    normalizeBackendBase(import.meta?.env?.VITE_API_URL) ||
    normalizeBackendBase(import.meta?.env?.VITE_BACKEND_TARGET) ||
    '/api';
  const path = `/auth/${provider}`;

  return `${apiBase}${path}`;
}
