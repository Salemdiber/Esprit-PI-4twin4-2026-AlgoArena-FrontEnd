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

const REQUIREMENTS = [
    { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { id: 'number', label: 'Contains number', test: (pw) => /\d/.test(pw) },
    { id: 'uppercase', label: 'Contains uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { id: 'special', label: 'Special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const LEVELS = [
    { label: 'Weak', color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
    { label: 'Fair', color: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)' },
    { label: 'Medium', color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)' },
    { label: 'Strong', color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' },
];

const usePasswordStrength = (password = '') => {
    return useMemo(() => {
        const requirements = REQUIREMENTS.map((r) => ({
            id: r.id,
            label: r.label,
            met: r.test(password),
        }));

        const score = requirements.filter((r) => r.met).length; // 0–4
        const idx = Math.max(0, Math.min(score - 1, LEVELS.length - 1));
        const level = score === 0 ? { label: '', color: '#475569', glowColor: 'transparent' } : LEVELS[idx];

        return {
            score,
            label: level.label,
            color: level.color,
            glowColor: level.glowColor,
            percent: (score / REQUIREMENTS.length) * 100,
            requirements,
        };
    }, [password]);
};

export default usePasswordStrength;
