import { communityService } from '../../../../services/communityService';

// Resolve the absolute origin we should prepend to relative media paths
// returned by the API (which often returns "/uploads/foo.png").
export const getApiOrigin = () => {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).origin;
    } catch {
      // fall through to the localhost fallback below
    }
  }

  if (raw.startsWith('/')) {
    return window.location.origin;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000`;
};

// Normalise a possibly-relative media URL into something an <img> / <video>
// element can load directly.
export const toMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^data:/i.test(url)) return url;
  const apiOrigin = getApiOrigin();
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
};

// Upload a single file via the community service and return the absolute
// URL the server stored it under. Returns '' if no file was provided so
// callers can use the result unconditionally.
export const uploadMediaAndGetUrl = async (file) => {
  if (!file) return '';
  const result = await communityService.uploadMedia(file);
  return String(result?.url || result?.absoluteUrl || '');
};
