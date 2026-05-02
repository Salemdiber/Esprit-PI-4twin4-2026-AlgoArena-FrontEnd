import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Lazy-load the floating AI assistant so it doesn't block LCP/TBT on initial paint.
// It's a heavy (~32KB + external Puter SDK) widget that the user can only interact
// with after the page is already idle.
const AIAgent = lazy(() => import('../components/AIAgent'));

const useDeferredMount = (delayMs = 1500) => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const mount = () => { if (!cancelled) setReady(true); };
        const idle = typeof window !== 'undefined' && 'requestIdleCallback' in window
            ? window.requestIdleCallback(mount, { timeout: delayMs })
            : setTimeout(mount, delayMs);
        return () => {
            cancelled = true;
            if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idle === 'number') {
                try { window.cancelIdleCallback(idle); } catch (_) { /* noop */ }
            } else {
                clearTimeout(idle);
            }
        };
    }, [delayMs]);
    return ready;
};

const PublicLayout = () => {
    const bg = useColorModeValue('white', 'gray.900');
    const showAgent = useDeferredMount(10000);

    return (
        <Box minH="100vh" bg={bg} transition="background-color 0.3s ease">
            <Header />
            <Box as="main" minH="calc(100vh - 64px)">
                <Outlet />
            </Box>
            <Footer />
            {showAgent && (
                <Suspense fallback={null}>
                    <AIAgent />
                </Suspense>
            )}
        </Box>
    );
};


export default PublicLayout;


