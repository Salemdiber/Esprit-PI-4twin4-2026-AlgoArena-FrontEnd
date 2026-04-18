import React, { Suspense, lazy } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const Footer = lazy(() => import('../components/Footer'));
const AIAgent = lazy(() => import('../components/AIAgent'));

const PublicLayout = () => {
    const bg = useColorModeValue('white', 'gray.900');

    return (
        <Box minH="100vh" bg={bg} transition="background-color 0.3s ease">
            <Header />
            <Box as="main" id="main-content">
                <Outlet />
            </Box>
            <Suspense fallback={null}>
                <Footer />
                <AIAgent />
            </Suspense>
        </Box>
    );
};


export default PublicLayout;


