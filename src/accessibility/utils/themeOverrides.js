/**
 * themeOverrides.js – Dynamic Chakra theme overrides for accessibility
 *
 * Generates a partial theme object based on current accessibility settings.
 * This is merged at runtime via CSS custom properties on document.body
 * rather than re-creating the Chakra theme (which would remount the tree).
 */

/**
 * Apply accessibility CSS custom properties to document root.
 * This allows all components (Chakra + vanilla) to pick up changes instantly.
 */
export const applyAccessibilityOverrides = (settings) => {
    const root = document.documentElement;

    // ── Font scale ──
    const scaleMap = { small: '14px', medium: '16px', large: '20px' };
    root.style.fontSize = scaleMap[settings.fontScale] || '16px';

    // ── Dyslexia font ──
    if (settings.dyslexiaFont) {
        root.style.setProperty('--a11y-font-body', "'OpenDyslexic', 'Comic Sans MS', sans-serif");
        root.style.setProperty('--a11y-font-heading', "'OpenDyslexic', 'Comic Sans MS', sans-serif");
    } else {
        root.style.removeProperty('--a11y-font-body');
        root.style.removeProperty('--a11y-font-heading');
    }

    // ── High contrast ──
    if (settings.highContrast) {
        root.setAttribute('data-a11y-high-contrast', 'true');
    } else {
        root.removeAttribute('data-a11y-high-contrast');
    }

    // ── Reduced motion ──
    if (settings.reducedMotion) {
        root.setAttribute('data-a11y-reduced-motion', 'true');
    } else {
        root.removeAttribute('data-a11y-reduced-motion');
    }

    // ── Cleanup stale attributes from removed features ──
    root.removeAttribute('data-a11y-color-blind');
    root.style.removeProperty('--a11y-danger');
    root.style.removeProperty('--a11y-success');
    root.style.removeProperty('--a11y-warning');
    root.style.removeProperty('--a11y-accent');
};
