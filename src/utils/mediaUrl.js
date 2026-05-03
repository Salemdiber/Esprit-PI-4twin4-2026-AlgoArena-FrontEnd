export const getApiOrigin = () => {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();
  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      return window.location.origin;
    }
  }
  if (raw.startsWith('/')) return window.location.origin;
  return `${window.location.protocol}//${window.location.hostname}:3000`;
};

export const toMediaUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (String(url).startsWith('/uploads/') || String(url).startsWith('uploads/')) {
    return `${getApiOrigin()}${String(url).startsWith('/') ? url : `/${url}`}`;
  }
  return String(url).startsWith('/') ? url : `/${String(url).replace(/^\//, '')}`;
};
