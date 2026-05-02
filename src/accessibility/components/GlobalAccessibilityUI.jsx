import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { IconButton, useDisclosure, Icon } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AccessibilityDrawer = lazy(() => import('./AccessibilityDrawer'));
const POSITION_STORAGE_KEY = 'fo_accessibility_button_position';
const DEFAULT_POSITION = { right: 30, bottom: 110 };

const AccessibilityIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" />
        <path d="M5 8l7 1 7-1" />
        <path d="M12 9v5" />
        <path d="M9 21l3-7 3 7" />
    </Icon>
);

const clampPosition = (value) => ({
    right: Math.max(16, Math.min(window.innerWidth - 70, value.right)),
    bottom: Math.max(16, Math.min(window.innerHeight - 70, value.bottom)),
});

const GlobalAccessibilityUI = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [position, setPosition] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY) || 'null');
            if (Number.isFinite(stored?.right) && Number.isFinite(stored?.bottom)) {
                return clampPosition(stored);
            }
        } catch {
            // Ignore malformed persisted positions.
        }
        return DEFAULT_POSITION;
    });

    const dragConstraints = useMemo(() => ({ top: -window.innerHeight + 80, right: 0, bottom: window.innerHeight - 80, left: -window.innerWidth + 80 }), []);

    useEffect(() => {
        localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    }, [position]);

    useEffect(() => {
        const handleResize = () => setPosition((current) => clampPosition(current));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (location.pathname.startsWith('/admin')) {
        return null;
    }


    return (
        <>
            {isOpen && (
                <Suspense fallback={null}>
                    <AccessibilityDrawer isOpen={isOpen} onClose={onClose} />
                </Suspense>
            )}
            <m.div
                drag
                dragMomentum={false}
                dragSnapToOrigin
                dragConstraints={dragConstraints}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: `${position.bottom}px`,
                    right: `${position.right}px`,
                    zIndex: 9999,
                    cursor: 'grab',
                }}
                onDragStart={() => { document.body.style.cursor = 'grabbing'; }}
                onDragEnd={(_, info) => {
                    document.body.style.cursor = 'auto';
                    setPosition(clampPosition({
                        right: position.right - info.offset.x,
                        bottom: position.bottom - info.offset.y,
                    }));
                }}
            >
                <IconButton
                    borderRadius="full"
                    width={{ base: '50px', md: '60px' }}
                    height={{ base: '50px', md: '60px' }}
                    icon={<AccessibilityIcon w={8} h={8} />}
                    aria-label={t('accessibility.accessibilityOptions')}
                    colorScheme="cyan"
                    bg="#22d3ee"
                    color="#0f172a"
                    boxShadow="0 0 20px rgba(34, 211, 238, 0.6)"
                    onClick={onOpen}
                    pointerEvents="auto" // Ensure clicks work inside drag wrapper
                    _hover={{
                        boxShadow: '0 0 30px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.4)',
                        bg: '#67e8f9'
                    }}
                />
            </m.div>
        </>
    );
};

export default GlobalAccessibilityUI;
