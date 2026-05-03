/**
 * ChallengeCardSkeleton – Loading state for challenge cards
 * 
 * Used in grid layout on challenges list page.
 */
import React from 'react';
import { Box, Flex, Skeleton, SkeletonText } from '@chakra-ui/react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const ChallengeCardSkeleton = ({ count = 6 }) => {
    const { settings } = useAccessibility();
    const speed = settings?.reducedMotion ? 0 : 0.8;

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <Box
                    key={i}
                    p={5}
                    bg="var(--color-bg-card)"
                    borderRadius="12px"
                    border="1px solid var(--color-border)"
                    transition="all 0.2s"
                >
                    {/* Header */}
                    <Flex justify="space-between" align="start" mb={3}>
                        <Skeleton height="24px" width="180px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Skeleton height="24px" width="60px" borderRadius="full" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Flex>

                    {/* Description */}
                    <SkeletonText
                        noOfLines={2}
                        spacing={2}
                        mb={4}
                        speed={speed}
                        startColor="var(--color-skeleton-base)"
                        endColor="var(--color-skeleton-shimmer)"
                    />

                    {/* Tags */}
                    <Flex gap={2} mb={4} flexWrap="wrap">
                        {[1, 2, 3].map((j) => (
                            <Skeleton
                                key={j}
                                height="20px"
                                width="60px"
                                borderRadius="full"
                                speed={speed}
                                startColor="var(--color-skeleton-base)"
                                endColor="var(--color-skeleton-shimmer)"
                            />
                        ))}
                    </Flex>

                    {/* Stats row */}
                    <Flex justify="space-between" align="center" pt={3} borderTop="1px solid var(--color-border-subtle)">
                        <Skeleton height="16px" width="80px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Skeleton height="16px" width="100px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Flex>
                </Box>
            ))}
        </>
    );
};

export default ChallengeCardSkeleton;
