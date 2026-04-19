import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

const shouldLogWebVitals = () => {
  if (import.meta.env.DEV) return true;
  return String(import.meta.env.VITE_ENABLE_WEB_VITALS || '').toLowerCase() === 'true';
};

const formatMetricValue = (metric) => {
  if (metric.name === 'CLS') {
    return Number(metric.value).toFixed(3);
  }
  return `${Math.round(metric.value)}ms`;
};

const logMetric = (metric) => {
  if (!shouldLogWebVitals()) return;
  const value = formatMetricValue(metric);
  const rating = String(metric.rating || '').toUpperCase();
  // eslint-disable-next-line no-console
  console.log(`[Web Vitals] ${metric.name}: ${value} - ${rating}`);
};

export const reportWebVitals = () => {
  onCLS(logMetric);
  onFCP(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
  onTTFB(logMetric);
};

export default reportWebVitals;
