/**
 * ChallengePlayPage – /challenges/:id
 *
 * Split layout:
 *  LEFT  (45%) – ProblemTabs + ProblemDescription
 *  RIGHT (55%) – EditorToolbar + CodeEditorContainer + TerminalPanel
 *
 * Mobile: stacked with problem in a Drawer.
 * Loading skeleton state
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    Text,
    Button,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    DrawerBody,
    useDisclosure,
    Icon,
    useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useChallengeContext } from '../context/ChallengeContext';
import ChallengeHeader from '../components/ChallengeHeader';
import ProblemTabs from '../components/ProblemTabs';
import ProblemDescription from '../components/ProblemDescription';
import EditorToolbar from '../components/EditorToolbar';
import CodeEditorContainer from '../components/CodeEditorContainer';
import TerminalPanel from '../components/TerminalPanel';
import ChallengePlaySkeleton from '../../../../shared/skeletons/ChallengePlaySkeleton';

const MotionBox = motion.create(Box);

const MenuIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </Icon>
);

const ChallengePlayPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        selectedChallenge,
        selectChallenge,
        deselectChallenge,
        code,
        setCode,
        language,
        setLanguage,
    } = useChallengeContext();

    // Loading state (simulated – will be replaced with real API call)
    const [isLoading, setIsLoading] = useState(true);

    // Mobile drawer for problem description
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Select the challenge on mount
    useEffect(() => {
        if (id) selectChallenge(id);
        return () => deselectChallenge();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Simulate data fetching
    useEffect(() => {
        // In production: replace with actual API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [id]);

    // Top-level hooks for color mode to avoid conditional hook execution
    const notFoundHeadingColor = useColorModeValue("gray.800", "gray.100");
    const notFoundTextColor = useColorModeValue("gray.500", "gray.400");
    const headerBorderColor = useColorModeValue("gray.200", "gray.700");
    const menuIconColor = useColorModeValue("gray.600", "gray.300");
    const drawerTextColor = useColorModeValue("gray.800", "gray.100");
    const drawerCloseIconColor = useColorModeValue("gray.500", "gray.400");

    // Show skeleton during loading
    if (isLoading) {
        return <ChallengePlaySkeleton />;
    }

    if (!selectedChallenge) {
        return (
            <Box
                minH="100vh"
                bg="var(--color-bg-primary)"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color={notFoundHeadingColor} mb={4}>
                        Challenge Not Found
                    </Text>
                    <Text color={notFoundTextColor} mb={6}>The requested challenge doesn't exist.</Text>
                    <Button variant="primary" onClick={() => navigate('/challenges')}>
                        Back to Challenges
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            h="100vh"
            minH="100vh"
            maxH="100vh"
            bg="var(--color-bg-primary)"
            display="flex"
            flexDirection="column"
            overflow="hidden"
        >
            {/* Top nav bar – chrono + submit */}
            <ChallengeHeader />

            {/* Mobile problem drawer toggle */}
            <Box
                display={{ base: 'block', lg: 'none' }}
                p={2}
                bg="var(--color-bg-secondary)"
                borderBottom="1px solid"
                borderColor={headerBorderColor}
            >
                <Button
                    size="sm"
                    variant="ghost"
                    color={menuIconColor}
                    leftIcon={<MenuIcon w={4} h={4} />}
                    onClick={onOpen}
                >
                    View Problem
                </Button>
            </Box>

            {/* Mobile Drawer */}
            <Drawer isOpen={isOpen} onClose={onClose} placement="left" size="full">
                <DrawerOverlay />
                <DrawerContent bg="var(--color-bg-primary)" color={drawerTextColor}>
                    <DrawerCloseButton color={drawerCloseIconColor} />
                    <DrawerBody pt={12} px={6} overflowY="auto">
                        <ProblemTabs />
                        <ProblemDescription />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Main split layout – viewport-locked, independent scroll */}
            <Flex flex={1} direction={{ base: 'column', lg: 'row' }} overflow="hidden" minH={0}>
                {/* LEFT PANEL – Problem (scrolls independently) */}
                <Box
                    display={{ base: 'none', lg: 'flex' }}
                    flexDirection="column"
                    w={{ lg: '40%' }}
                    bg="var(--color-bg-primary)"
                    borderRight="1px solid"
                    borderColor={headerBorderColor}
                    overflow="hidden"
                >
                    <Box
                        flex={1}
                        overflowY="auto"
                        p={5}
                        sx={{
                            '&::-webkit-scrollbar': { width: '5px' },
                            '&::-webkit-scrollbar-track': { bg: 'var(--color-bg-primary)' },
                            '&::-webkit-scrollbar-thumb': { bg: 'var(--color-border)', borderRadius: '3px' },
                            overscrollBehavior: 'contain',
                        }}
                    >
                        <ProblemTabs />
                        <ProblemDescription />
                    </Box>
                </Box>

                {/* RIGHT PANEL – Editor (fixed, no page scroll) */}
                <Flex
                    w={{ base: '100%', lg: '60%' }}
                    direction="column"
                    bg="var(--color-bg-primary)"
                    overflow="hidden"
                    minH={0}
                >
                    <EditorToolbar />

                    <CodeEditorContainer
                        code={code}
                        setCode={setCode}
                        language={language}
                    />

                    <TerminalPanel />
                </Flex>
            </Flex>
        </MotionBox>
    );
};

export default ChallengePlayPage;
