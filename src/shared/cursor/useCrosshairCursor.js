/**
 * useCrosshairCursor – Logic for the competitive "Code Crosshair" cursor
 * 
 * Performance-focused:
 * - Uses requestAnimationFrame for all position updates
 * - Direct DOM manipulation via refs (no state updates on mouse move)
 * - Throttled hover detection
 */
import { useEffect, useRef, useState } from 'react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const useCrosshairCursor = () => {
    const cursorRef = useRef(null); // The main cursor container
    const requestRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const cursorPosRef = useRef({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);

    // Accessibility settings
    const { settings } = useAccessibility();
    const reducedMotion = settings?.reducedMotion || false;
    const highContrast = settings?.highContrast || false;

    useEffect(() => {
        // Detect touch devices - disable custom cursor entirely
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        setIsVisible(true);

        const onMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const onMouseDown = () => {
            if (cursorRef.current) {
                cursorRef.current.classList.add('cursor-click');
            }
        };

        const onMouseUp = () => {
            if (cursorRef.current) {
                cursorRef.current.classList.remove('cursor-click');
            }
        };

        const onMouseOver = (e) => {
            if (!cursorRef.current) return;

            const target = e.target;
            const tagName = target.tagName.toLowerCase();

            // Check for text inputs - HIDE custom cursor
            const isTextInput =
                tagName === 'textarea' ||
                (tagName === 'input' && !['button', 'submit', 'checkbox', 'radio'].includes(target.type)) ||
                target.isContentEditable ||
                target.closest('.monaco-editor');

            if (isTextInput) {
                cursorRef.current.classList.add('cursor-hidden');
                return;
            } else {
                cursorRef.current.classList.remove('cursor-hidden');
            }

            // Check for interactive elements - EXPAND cursor
            const isInteractive =
                tagName === 'a' ||
                tagName === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.getAttribute('role') === 'button' ||
                target.closest('[role="button"]') ||
                target.dataset.cursor === 'hover';

            if (isInteractive) {
                cursorRef.current.classList.add('cursor-hover');
            } else {
                cursorRef.current.classList.remove('cursor-hover');
            }
        };

        // Animation Loop
        const animate = () => {
            if (!cursorRef.current) return;

            // Lerp for smooth movement (0.2 = fast/responsive)
            // If reduced motion, snap instantly (1.0)
            const ease = reducedMotion ? 1 : 0.2;

            cursorPosRef.current.x += (mouseRef.current.x - cursorPosRef.current.x) * ease;
            cursorPosRef.current.y += (mouseRef.current.y - cursorPosRef.current.y) * ease;

            // Apply transform directly to DOM
            cursorRef.current.style.transform = `translate3d(${cursorPosRef.current.x}px, ${cursorPosRef.current.y}px, 0)`;

            requestRef.current = requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseover', onMouseOver, { passive: true });

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseover', onMouseOver);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [reducedMotion]);

    return { cursorRef, isVisible, highContrast };
};

export default useCrosshairCursor;
