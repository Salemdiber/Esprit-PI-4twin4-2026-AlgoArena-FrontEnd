/**
 * LeaderboardSkeleton – Loading state for Leaderboard page
 * 
 * Matches layout:
 * - Top 3 champion/runner-up cards
 * - Ranking list rows
 */
import React from 'react';
import { Box, Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const LeaderboardSkeleton = () => {
    const { settings } = useAccessibility();
    const speed = settings?.reducedMotion ? 0 : 0.8;

    return (
        <Box p={6} maxW="1400px" mx="auto">
            {/* Header skeleton */}
            <Box mb={8}>
                <Skeleton height="48px" width="300px" mb={3} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                <SkeletonText noOfLines={1} spacing={4} width="400px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
            </Box>

            {/* Filter buttons skeleton */}
            <Flex gap={4} mb={8} flexWrap="wrap">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} height="36px" width="100px" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                ))}
            </Flex>

            {/* Top 3 cards (Champion + 2 runners-up) */}
            <Flex gap={6} mb={12} flexWrap="wrap" justify="center">
                {/* Champion (larger) */}
                <Box
                    flex="1"
                    minW="340px"
                    maxW="400px"
                    p={6}
                    bg="var(--color-bg-card)"
                    borderRadius="16px"
                    border="1px solid var(--color-glass-border-strong)"
                >
                    <Flex align="center" gap={4} mb={4}>
                        <SkeletonCircle size="80px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Box flex="1">
                            <Skeleton height="24px" width="140px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Skeleton height="16px" width="100px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        </Box>
                    </Flex>
                    <Skeleton height="12px" width="100%" mb={2} borderRadius="full" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    <Flex gap={4} mt={4}>
                        <Skeleton height="40px" flex="1" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Skeleton height="40px" flex="1" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Flex>
                </Box>

                {/* Runners-up */}
                {[1, 2].map((i) => (
                    <Box
                        key={i}
                        flex="1"
                        minW="300px"
                        maxW="350px"
                        p={5}
                        bg="var(--color-bg-card)"
                        borderRadius="12px"
                        border="1px solid var(--color-border)"
                    >
                        <Flex align="center" gap={3} mb={3}>
                            <SkeletonCircle size="60px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Box flex="1">
                                <Skeleton height="20px" width="120px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                <Skeleton height="14px" width="80px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            </Box>
                        </Flex>
                        <Skeleton height="10px" width="100%" borderRadius="full" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Box>
                ))}
            </Flex>

            {/* Ranking list rows */}
            <Box>
                {[...Array(10)].map((_, i) => (
                    <Flex
                        key={i}
                        align="center"
                        gap={4}
                        p={4}
                        mb={2}
                        bg="var(--color-bg-surface)"
                        borderRadius="8px"
                        border="1px solid var(--color-border)"
                    >
                        <Skeleton height="24px" width="40px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <SkeletonCircle size="40px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Box flex="1">
                            <Skeleton height="16px" width="140px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Skeleton height="12px" width="100px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        </Box>
                        <Skeleton height="20px" width="80px" borderRadius="full" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Skeleton height="16px" width="60px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Flex>
                ))}
            </Box>
        </Box>
    );
};

export default LeaderboardSkeleton;
