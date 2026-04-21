import { useEffect } from 'react';
import { subscribeNetworkFailure } from '../../services/diagnosticsCollector';

const SESSION_KEY = 'session_id';
const MAX_CONSOLE = 50;
const MAX_NETWORK = 20;

const consoleBuffer = [];
const networkBuffer = [];
let patched = false;
let unbindNetwork = null;

const pushBounded = (arr, item, max) => {
  arr.push(item);
  if (arr.length > max) arr.splice(0, arr.length - max);
};

const getOrCreateSessionId = () => {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sess_${Date.now()}`;
  }
};

const detectBrowser = (ua) => {
  if (/edg\/([\d.]+)/i.test(ua)) return `Edge ${ua.match(/edg\/([\d.]+)/i)?.[1] || ''}`.trim();
  if (/chrome\/([\d.]+)/i.test(ua) && !/edg\//i.test(ua)) return `Chrome ${ua.match(/chrome\/([\d.]+)/i)?.[1] || ''}`.trim();
  if (/firefox\/([\d.]+)/i.test(ua)) return `Firefox ${ua.match(/firefox\/([\d.]+)/i)?.[1] || ''}`.trim();
  if (/version\/([\d.]+).*safari/i.test(ua)) return `Safari ${ua.match(/version\/([\d.]+)/i)?.[1] || ''}`.trim();
  return 'Unknown';
};

const detectOS = (ua) => {
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
};

const patchCapture = () => {
  if (patched || typeof window === 'undefined') return;
  patched = true;

  const prevOnError = window.onerror;
  window.onerror = (message, source, line, col) => {
    pushBounded(
      consoleBuffer,
      { message: String(message || 'Unknown error'), source: source ? String(source) : undefined, line: line ?? undefined, col: col ?? undefined, timestamp: Date.now() },
      MAX_CONSOLE,
    );
    if (typeof prevOnError === 'function') return prevOnError(message, source, line, col, null);
    return false;
  };

  const prevOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    pushBounded(
      consoleBuffer,
      { message: String(event?.reason?.message || event?.reason || 'Unhandled rejection'), timestamp: Date.now() },
      MAX_CONSOLE,
    );
    if (typeof prevOnUnhandledRejection === 'function') return prevOnUnhandledRejection(event);
    return false;
  };

  unbindNetwork = subscribeNetworkFailure((event) => {
    pushBounded(networkBuffer, event, MAX_NETWORK);
  });
};

export const useReproductionBundle = () => {
  useEffect(() => {
    patchCapture();
    return () => {
      if (typeof unbindNetwork === 'function') unbindNetwork();
      unbindNetwork = null;
    };
  }, []);

  const getBundle = () => {
    const ua = navigator.userAgent || 'Unknown';
    return {
      route: window.location.pathname,
      fullUrl: window.location.href,
      device: {
        browser: detectBrowser(ua),
        os: detectOS(ua),
        userAgent: ua,
      },
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
        pixelRatio: window.devicePixelRatio || 1,
      },
      locale: navigator.language || 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      buildVersion: import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_APP_BUILD || 'unknown',
      featureFlags: [],
      consoleErrors: [...consoleBuffer],
      networkFailures: [...networkBuffer],
      clientTimestamp: Date.now(),
      sessionId: getOrCreateSessionId(),
    };
  };

  return { getBundle };
};

