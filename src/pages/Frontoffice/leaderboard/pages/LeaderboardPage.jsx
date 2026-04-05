/**
 * LeaderboardPage – /leaderboard
 *
 * Full-page leaderboard experience with:
 *  • Same background system as Challenges & Battles (#0f172a + grid)
 *  • LeaderboardHeader (title + filters)
 *  • ArenaStage (Top 3 podium)
 *  • Elite Contenders list (ranks 4–10)
 *  • Responsive layout
 *  • Accessibility integration (reduced motion, voice read page)
 *  • Loading skeleton state
 */
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, VStack, IconButton, Icon, Tooltip } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

import LeaderboardHeader from '../components/LeaderboardHeader';
import ArenaStage from '../components/ArenaStage';
import RankCard from '../components/RankCard';
import mockLeaderboard from '../data/mockLeaderboard';
import useAccessibility from '../../../../accessibility/hooks/useAccessibility';
import { readAloud, stopSpeaking, getPageText } from '../../../../accessibility/utils/speechUtils';
import LeaderboardSkeleton from '../../../../shared/skeletons/LeaderboardSkeleton';

const MotionBox = motion.create(Box);

/* Inline speaker icon */
const SpeakerIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 010 14.14" />
        <path d="M15.54 8.46a5 5 0 010 7.07" />
    </Icon>
);

const LeaderboardPage = () => {
    // Loading state (simulated – will be replaced with real API call)
    const [isLoading, setIsLoading] = useState(true);

    // Filter state (functional – ready for real data)
    const [scope, setScope] = useState('Global');
    const [period, setPeriod] = useState('Monthly');
    const { settings } = useAccessibility();

    const noMotion = settings.reducedMotion;

    // Simulate data fetching
    useEffect(() => {
        // In production: replace with actual API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [scope, period]);

    // Show skeleton during loading
    if (isLoading) {
        return <LeaderboardSkeleton />;
    }

    // Top 3 for the stage
    const top3 = mockLeaderboard.slice(0, 3);

    // Ranks 4–10 for the contenders list
    const contenders = mockLeaderboard.slice(3);

    const totalCompetitors = 24567; // mock total

    const handleReadPage = () => {
        const text = getPageText('#main-content');
        if (text) readAloud(text);
        else readAloud('No readable content found.');
    };

    return (
        <MotionBox
            initial={noMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={noMotion ? { duration: 0 } : { duration: 0.4 }}
            minH="100vh"
            pt={{ base: 24, md: 28 }}
            pb={{ base: 10, md: 16 }}
            px={{ base: 4, sm: 6, lg: 8 }}
            bg="var(--color-bg-primary)"
            bgImage="linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px)"
            bgSize="50px 50px"
            position="relative"
            overflow="hidden"
        >
            <Box maxW="7xl" mx="auto" position="relative" zIndex={10}>
                {/* Header with filters */}
                <LeaderboardHeader
                    scope={scope}
                    setScope={setScope}
                    period={period}
                    setPeriod={setPeriod}
                />

                {/* Championship Arena Stage – Top 3 */}
                <ArenaStage players={top3} />

                {/* Elite Contenders (4–10) */}
                <MotionBox
                    initial={noMotion ? false : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={noMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
                >
                    {/* Section header */}
                    <Flex
                        align="center"
                        justify="space-between"
                        mb={6}
                    >
                        <Text fontFamily="heading" fontSize="2xl" fontWeight="bold" color="var(--color-text-primary)">
                            Elite Contenders
                        </Text>
                        <Text fontFamily="body" fontSize="sm" color="gray.400">
                            Showing top{' '}
                            <Text as="span" fontWeight="semibold" color="#22d3ee">
                                {mockLeaderboard.length}
                            </Text>{' '}
                            of{' '}
                            <Text as="span" fontWeight="semibold" color="#22d3ee">
                                {totalCompetitors.toLocaleString()}
                            </Text>{' '}
                            competitors
                        </Text>
                    </Flex>

                    {/* Contender rows */}
                    <VStack spacing={4} align="stretch">
                        {contenders.map((player) => (
                            <RankCard key={player.id} player={player} variant="compact" />
                        ))}
                    </VStack>
                </MotionBox>
            </Box>

            {/* Floating "Read Page" button – visible only when voice mode is on */}
            {settings.voiceMode && (
                <Tooltip label="Read this page aloud" hasArrow placement="left">
                    <IconButton
                        aria-label="Read page content aloud"
                        icon={<SpeakerIcon w={5} h={5} />}
                        position="fixed"
                        bottom={6}
                        right={6}
                        zIndex={100}
                        size="lg"
                        borderRadius="full"
                        bg="rgba(34, 211, 238, 0.15)"
                        color="#22d3ee"
                        border="1px solid rgba(34, 211, 238, 0.4)"
                        _hover={{ bg: 'rgba(34, 211, 238, 0.3)', transform: 'scale(1.1)' }}
                        _active={{ transform: 'scale(0.95)' }}
                        boxShadow="0 0 20px rgba(34, 211, 238, 0.3)"
                        onClick={handleReadPage}
                    />
                </Tooltip>
            )}
        </MotionBox>
    );
};

export default LeaderboardPage;
