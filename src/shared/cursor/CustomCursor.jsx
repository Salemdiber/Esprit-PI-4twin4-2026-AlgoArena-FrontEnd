/**
 * CustomCursor – Displays a resized version of the user's cursor.png
 * 
 * Benefits:
 * - Scalable (CSS controls size)
 * - Transparent (respects PNG alpha channel)
 * - GPU Accelerated (transform3d)
 * - Zero Lag (Direct DOM updates)
 */
import React, { useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import useCursor from './useCursor';

const CustomCursor = () => {
    const { cursorRef } = useCursor();

    // Check if on touch device (don't render custom cursor)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return null;

    return (
        <Box
            ref={cursorRef}
            position="fixed"
            top={0}
            left={0}
            pointerEvents="none"
            zIndex={99999}
            style={{
                // Standard Cursor Size (24px x 24px)
                width: '24px',
                height: '24px',

                // Use the custom PNG (from public/assets/cursors)
                backgroundImage: `url('/assets/cursors/custom-cursor.png')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',

                // Performance handling
                willChange: 'transform',
                transform: 'translate3d(0,0,0)',

                // Keep default origin (top-left) - standard for cursors
                transformOrigin: 'top left',
            }}
        />
    );
};

export default CustomCursor;
