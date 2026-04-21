import { apiClient } from './apiClient';

export const billingService = {
    createHintCreditsCheckout: async (payload = {}) => {
        return apiClient('/billing/hint-credits/checkout', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    confirmStripeCheckoutSession: async (payload = {}) => {
        return apiClient('/billing/stripe/confirm', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
};
