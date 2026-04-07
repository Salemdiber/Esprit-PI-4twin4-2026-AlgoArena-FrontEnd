/**
 * usePasswordStrength – evaluates a password against common requirements.
 *
 * Returns:
 *  • score        (0 – 4)
 *  • label        'Weak' | 'Fair' | 'Medium' | 'Strong'
 *  • color        Chakra-friendly colour string
 *  • percent      0 – 100  (for the progress bar width)
 *  • requirements [{id, label, met}]
 */
import { useMemo } from 'react';
import i18n from 'i18next';

const REQUIREMENTS = [
    { id: 'length', labelKey: 'profilePage.req8chars', test: (pw) => pw.length >= 8 },
    { id: 'number', labelKey: 'profilePage.reqNumber', test: (pw) => /\d/.test(pw) },
    { id: 'uppercase', labelKey: 'profilePage.reqUppercase', test: (pw) => /[A-Z]/.test(pw) },
    { id: 'special', labelKey: 'profilePage.reqSpecial', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const LEVEL_KEYS = [
    { labelKey: 'profilePage.weak', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
    { labelKey: 'profilePage.fair', color: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)' },
    { labelKey: 'profilePage.medium', color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)' },
    { labelKey: 'profilePage.strong', color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' },
];

const usePasswordStrength = (password = '') => {
    return useMemo(() => {
        const requirements = REQUIREMENTS.map((r) => ({
            id: r.id,
            label: i18n.t(r.labelKey),
            met: r.test(password),
        }));

        const score = requirements.filter((r) => r.met).length;
        const idx = Math.max(0, Math.min(score - 1, LEVEL_KEYS.length - 1));
        const level = score === 0
            ? { label: '', color: '#475569', glowColor: 'transparent' }
            : { label: i18n.t(LEVEL_KEYS[idx].labelKey), color: LEVEL_KEYS[idx].color, glowColor: LEVEL_KEYS[idx].glowColor };

        return {
            score,
            label: level.label,
            color: level.color,
            glowColor: level.glowColor,
            percent: (score / REQUIREMENTS.length) * 100,
            requirements,
        };
    }, [password, i18n.language]);
};

export default usePasswordStrength;
