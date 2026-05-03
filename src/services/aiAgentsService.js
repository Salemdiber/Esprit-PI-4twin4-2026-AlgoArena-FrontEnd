import { apiClient } from './apiClient';

export const aiAgentsService = {
  getAnalyticsInsights: async ({ activityDays = 7, communityDays = 30, force = true } = {}) =>
    apiClient(
      `/ai-agents/analytics-insights?activityDays=${encodeURIComponent(activityDays)}&communityDays=${encodeURIComponent(communityDays)}&force=${encodeURIComponent(force)}`,
      { method: 'GET' },
    ),
  getSecurityScan: async ({ minSeverity = 'low', limit = 200, category = '', force = true } = {}) =>
    apiClient(
      `/ai-agents/security-scan?minSeverity=${encodeURIComponent(minSeverity)}&limit=${encodeURIComponent(limit)}&category=${encodeURIComponent(category)}&force=${encodeURIComponent(force)}`,
      { method: 'GET' },
    ),
  getI18nScan: async ({ limit = 150, minConfidence = 0, force = true } = {}) =>
    apiClient(
      `/ai-agents/i18n-scan?limit=${encodeURIComponent(limit)}&minConfidence=${encodeURIComponent(minConfidence)}&force=${encodeURIComponent(force)}`,
      { method: 'GET' },
    ),
  getExecutiveBrief: async (i18nLimit = 120, provider = 'auto', force = true) =>
    apiClient(
      `/ai-agents/executive-brief?i18nLimit=${encodeURIComponent(i18nLimit)}&provider=${encodeURIComponent(provider)}&force=${encodeURIComponent(force)}`,
      { method: 'GET' },
    ),
};

