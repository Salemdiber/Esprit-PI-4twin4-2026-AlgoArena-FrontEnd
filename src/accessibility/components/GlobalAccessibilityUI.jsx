import React from 'react';
import { IconButton, useDisclosure, Icon } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AccessibilityDrawer from './AccessibilityDrawer';

const AccessibilityIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" />
        <path d="M5 8l7 1 7-1" />
        <path d="M12 9v5" />
        <path d="M9 21l3-7 3 7" />
    </Icon>
);

const GlobalAccessibilityUI = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();


    return (
        <>
            <AccessibilityDrawer isOpen={isOpen} onClose={onClose} />

            <motion.div
                drag
                dragMomentum={false}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '110px',
                    right: '30px',
                    zIndex: 9999,
                    cursor: 'grab',
                }}
                onDragStart={() => { document.body.style.cursor = 'grabbing'; }}
                onDragEnd={() => { document.body.style.cursor = 'auto'; }}
            >
                <IconButton
                    borderRadius="full"
                    width={{ base: '50px', md: '60px' }}
                    height={{ base: '50px', md: '60px' }}
                    icon={<AccessibilityIcon w={8} h={8} />}
                    aria-label="Accessibility Options"
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
            </motion.div>
        </>
    );
};

export default GlobalAccessibilityUI;
