/**
 * RouteLoader – Top progress bar for route transitions
 * 
 * Lightweight NProgress-style loader
 */
import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { m } from 'framer-motion';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const MotionBox = m.create(Box);

const RouteLoader = () => {
    const [progress, setProgress] = useState(0);
    const { settings } = useAccessibility();
    const reducedMotion = settings?.reducedMotion || false;

    useEffect(() => {
        // Simulate loading progress (stops at 80%, completes on unmount)
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 80) return prev;
                return prev + Math.random() * 20;
            });
        }, 180);

        return () => {
            clearInterval(interval);
            setProgress(100);
        };
    }, []);

    return (
        <MotionBox
            position="fixed"
            top={0}
            left={0}
            right={0}
            h="3px"
            bg="transparent"
            zIndex={9999}
            pointerEvents="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <MotionBox
                h="100%"
                bg="linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #22d3ee 100%)"
                boxShadow="0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(34,211,238,0.4)"
                initial={{ width: '0%', x: 0 }}
                animate={{
                    width: `${progress}%`,
                }}
                transition={{
                    duration: reducedMotion ? 0.1 : 0.3,
                    ease: 'easeOut',
                }}
                style={{
                    backgroundSize: '200% 100%',
                }}
            >
                {/* Glowing tip */}
                {!reducedMotion && (
                    <Box
                        position="absolute"
                        right={-2}
                        top="50%"
                        transform="translateY(-50%)"
                        w="8px"
                        h="8px"
                        bg="#22d3ee"
                        borderRadius="full"
                        boxShadow="0 0 12px rgba(34,211,238,1)"
                    />
                )}
            </MotionBox>
        </MotionBox>
    );
};

export default RouteLoader;

