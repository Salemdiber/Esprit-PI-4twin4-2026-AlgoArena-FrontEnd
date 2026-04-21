/**
 * useCursor – Optimized position tracking for any custom cursor
 * 
 * Uses direct DOM manipulation to avoid React render cycles.
 */
import { useEffect, useRef, useState } from 'react';

const useCursor = () => {
    const cursorRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable on touch devices
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouch) return;

        setIsVisible(true);

        const onMouseMove = (e) => {
            posRef.current.x = e.clientX;
            posRef.current.y = e.clientY;
        };

        const onMouseOver = (e) => {
            // Hide custom cursor over text inputs to restore I-beam
            const target = e.target;
            const isText =
                target.tagName === 'TEXTAREA' ||
                (target.tagName === 'INPUT' && !['button', 'submit', 'checkbox', 'radio'].includes(target.type)) ||
                target.isContentEditable ||
                target.closest('.monaco-editor');

            if (cursorRef.current) {
                if (isText) {
                    cursorRef.current.style.opacity = '0';
                } else {
                    cursorRef.current.style.opacity = '1';
                }
            }
        };

        // Animation Loop
        const animate = () => {
            if (cursorRef.current) {
                // Use translate3d for GPU acceleration
                cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
            }
            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseover', onMouseOver, { passive: true });
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return { cursorRef, isVisible };
};

export default useCursor;
