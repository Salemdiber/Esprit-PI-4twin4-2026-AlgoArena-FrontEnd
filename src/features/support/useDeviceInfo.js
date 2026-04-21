import { useMemo } from 'react';

export const useDeviceInfo = () =>
  useMemo(() => {
    const ua = navigator.userAgent || '';
    let browser = 'Unknown';
    if (/chrome\/([\d.]+)/i.test(ua) && !/edg\//i.test(ua)) browser = `Chrome ${ua.match(/chrome\/([\d.]+)/i)?.[1] || ''}`.trim();
    else if (/firefox\/([\d.]+)/i.test(ua)) browser = `Firefox ${ua.match(/firefox\/([\d.]+)/i)?.[1] || ''}`.trim();
    else if (/safari\/([\d.]+)/i.test(ua) && /version\/([\d.]+)/i.test(ua)) browser = `Safari ${ua.match(/version\/([\d.]+)/i)?.[1] || ''}`.trim();
    else if (/edg\/([\d.]+)/i.test(ua)) browser = `Edge ${ua.match(/edg\/([\d.]+)/i)?.[1] || ''}`.trim();

    let operatingSystem = 'Unknown';
    if (/windows/i.test(ua)) operatingSystem = 'Windows';
    else if (/mac os x/i.test(ua)) operatingSystem = 'macOS';
    else if (/android/i.test(ua)) operatingSystem = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) operatingSystem = 'iOS';
    else if (/linux/i.test(ua)) operatingSystem = 'Linux';

    return {
      browser,
      operatingSystem,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    };
  }, []);

