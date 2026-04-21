/**
 * BattleSummarySkeleton – Loading state for Battle Summary page
 * 
 * Matches layout:
 * - Battle result header
 * - Performance stats
 * - Code comparison
 * - Action buttons
 */
import React from 'react';
import { Box, Flex, Skeleton, SkeletonText, SkeletonCircle, Grid } from '@chakra-ui/react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const BattleSummarySkeleton = () => {
    const { settings } = useAccessibility();
    const speed = settings?.reducedMotion ? 0 : 0.8;

    return (
        <Box
            minH="100vh"
            bg="var(--color-bg-primary)"
            pt={24}
            pb={10}
            px={{ base: 4, md: 6, lg: 8 }}
        >
            <Box maxW="6xl" mx="auto">
                {/* Result Header */}
                <Box
                    mb={8}
                    p={8}
                    bg="var(--color-bg-card)"
                    borderRadius="16px"
                    border="1px solid rgba(34,211,238,0.3)"
                    textAlign="center"
                >
                    <Skeleton height="64px" width="200px" mx="auto" mb={4} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    <Skeleton height="32px" width="300px" mx="auto" mb={3} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    <Skeleton height="20px" width="250px" mx="auto" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                </Box>

                {/* Performance Stats */}
                <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                    gap={4}
                    mb={8}
                >
                    {[1, 2, 3].map((i) => (
                        <Box
                            key={i}
                            p={5}
                            bg="var(--color-bg-card)"
                            borderRadius="12px"
                            border="1px solid var(--color-border)"
                            textAlign="center"
                        >
                            <Skeleton height="16px" width="120px" mx="auto" mb={3} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Skeleton height="40px" width="100px" mx="auto" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Skeleton height="14px" width="80px" mx="auto" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        </Box>
                    ))}
                </Grid>

                {/* Players Comparison */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mb={8}>
                    {[1, 2].map((player) => (
                        <Box
                            key={player}
                            p={5}
                            bg="var(--color-bg-card)"
                            borderRadius="12px"
                            border="1px solid var(--color-border)"
                        >
                            {/* Player header */}
                            <Flex align="center" gap={3} mb={4} pb={4} borderBottom="1px solid rgba(100,116,139,0.2)">
                                <SkeletonCircle size="48px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                <Box flex="1">
                                    <Skeleton height="20px" width="140px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                    <Skeleton height="16px" width="100px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                </Box>
                            </Flex>

                            {/* Code block */}
                            <Box bg="rgba(0,0,0,0.4)" p={4} borderRadius="8px" fontFamily="monospace">
                                {[...Array(12)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        height="14px"
                                        width={`${Math.random() * 60 + 30}%`}
                                        mb={2}
                                        speed={speed}
                                        startColor="rgba(30,41,59,0.4)"
                                        endColor="rgba(30,41,59,0.7)"
                                    />
                                ))}
                            </Box>

                            {/* Metrics */}
                            <Flex justify="space-between" mt={4} pt={4} borderTop="1px solid var(--color-border-subtle)">
                                <Box>
                                    <Skeleton height="14px" width="80px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                    <Skeleton height="18px" width="60px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                </Box>
                                <Box>
                                    <Skeleton height="14px" width="80px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                    <Skeleton height="18px" width="60px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                </Box>
                            </Flex>
                        </Box>
                    ))}
                </Grid>

                {/* Action Buttons */}
                <Flex gap={4} justify="center">
                    <Skeleton height="48px" width="180px" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    <Skeleton height="48px" width="160px" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                </Flex>
            </Box>
        </Box>
    );
};

export default BattleSummarySkeleton;
