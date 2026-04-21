/**
 * useAccessibility – convenience hook for consuming AccessibilityContext
 */
import { useContext } from 'react';
import AccessibilityContext from '../context/AccessibilityContextDef';

const useAccessibility = () => {
    const ctx = useContext(AccessibilityContext);
    if (!ctx) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return ctx;
};

export default useAccessibility;
