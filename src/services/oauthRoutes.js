function normalizeBackendOrigin(rawUrl) {
  const value = String(rawUrl || '').trim();
  if (!value) return '';

  try {
    const parsed = new URL(value, window.location.origin);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isDevPort = parsed.port === '3000' || parsed.port === '';

    if (isLocalHost && !isDevPort) {
      return '';
    }

    if (parsed.pathname === '/api' || parsed.pathname === '/api/') {
      return parsed.origin;
    }
    return parsed.origin + parsed.pathname.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export function getOAuthUrl(provider) {
  const backendBase =
    normalizeBackendOrigin(import.meta?.env?.VITE_BACKEND_TARGET) ||
    normalizeBackendOrigin(import.meta?.env?.VITE_API_URL) ||
    '';
  const path = `/auth/${provider}`;

  if (backendBase) {
    return `${backendBase}${path}`;
  }

  return path;
}
