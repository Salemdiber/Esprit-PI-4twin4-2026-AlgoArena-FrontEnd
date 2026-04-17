import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const Footer = lazy(() => import('../components/Footer'));
const AIAgent = lazy(() => import('../components/AIAgent'));

const PublicLayout = () => {
    const bg = useColorModeValue('white', 'gray.900');
    const [showSecondaryShell, setShowSecondaryShell] = useState(false);

    useEffect(() => {
        const reveal = () => setShowSecondaryShell(true);
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(reveal, { timeout: 1500 });
            return () => window.cancelIdleCallback(id);
        }

        const id = window.setTimeout(reveal, 1000);
        return () => window.clearTimeout(id);
    }, []);

    return (
        <Box minH="100vh" bg={bg} transition="background-color 0.3s ease">
            <Header />
            <Box as="main" id="main-content">
                <Outlet />
            </Box>
            {showSecondaryShell && (
                <Suspense fallback={null}>
                    <Footer />
                    <AIAgent />
                </Suspense>
            )}
        </Box>
    );
};


export default PublicLayout;


