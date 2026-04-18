import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIAgent from '../components/AIAgent';

const PublicLayout = () => {
    const bg = useColorModeValue('white', 'gray.900');

    return (
        <Box minH="100vh" bg={bg} transition="background-color 0.3s ease">
            <Header />
            <Box as="main" id="main-content">
                <Outlet />
            </Box>
            <Footer />
            <AIAgent />
        </Box>
    );
};


export default PublicLayout;


