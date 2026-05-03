/**
 * ActiveBattleSkeleton – Loading state for Active Battle page
 * 
 * Matches layout:
 * - Battle header with info
 * - Code editor
 * - Terminal/Output panel
 * - Action buttons
 */
import React from 'react';
import { Box, Flex, Skeleton, SkeletonText, SkeletonCircle } from '@chakra-ui/react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const ActiveBattleSkeleton = () => {
    const { settings } = useAccessibility();
    const speed = settings?.reducedMotion ? 0 : 0.8;

    return (
        <Box
            minH="100vh"
            bg="var(--color-bg-primary)"
            display="flex"
            flexDirection="column"
        >
            {/* Header */}
            <Box
                p={5}
                borderBottom="1px solid rgba(100,116,139,0.2)"
                bg="rgba(30,41,59,0.4)"
            >
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Skeleton height="32px" width="250px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Flex align="center" gap={3}>
                            <SkeletonCircle size="32px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Skeleton height="16px" width="120px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        </Flex>
                    </Box>
                    <Flex gap={3}>
                        <Skeleton height="40px" width="120px" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        <Skeleton height="40px" width="100px" borderRadius="8px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    </Flex>
                </Flex>
            </Box>

            {/* Main Content */}
            <Flex flex="1" overflow="hidden">
                {/* Problem Description Sidebar */}
                <Box
                    w="360px"
                    borderRight="1px solid rgba(100,116,139,0.2)"
                    p={5}
                    overflowY="auto"
                    bg="rgba(15,23,42,0.4)"
                >
                    <Skeleton height="24px" width="180px" mb={4} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    <SkeletonText
                        noOfLines={8}
                        spacing={3}
                        mb={6}
                        speed={speed}
                        startColor="var(--color-skeleton-base)"
                        endColor="var(--color-skeleton-shimmer)"
                    />

                    <Skeleton height="20px" width="120px" mb={3} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                    {[1, 2, 3].map((i) => (
                        <Box key={i} mb={4} p={3} bg="rgba(30,41,59,0.3)" borderRadius="8px">
                            <Skeleton height="14px" width="100px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <SkeletonText noOfLines={2} spacing={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                        </Box>
                    ))}
                </Box>

                {/* Code Editor Area */}
                <Flex flex="1" direction="column">
                    {/* Editor */}
                    <Box flex="1" p={4} bg="rgba(0,0,0,0.4)">
                        <Flex justify="space-between" align="center" mb={3}>
                            <Skeleton height="16px" width="100px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Flex gap={2}>
                                <Skeleton height="24px" width="80px" borderRadius="6px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                <Skeleton height="24px" width="100px" borderRadius="6px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            </Flex>
                        </Flex>

                        {/* Code lines */}
                        <Box fontFamily="monospace" fontSize="sm">
                            {[...Array(20)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    height="16px"
                                    width={`${Math.random() * 50 + 30}%`}
                                    mb={2}
                                    speed={speed}
                                    startColor="rgba(30,41,59,0.4)"
                                    endColor="rgba(30,41,59,0.7)"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Terminal/Output */}
                    <Box
                        h="240px"
                        p={4}
                        bg="rgba(0,0,0,0.6)"
                        borderTop="1px solid var(--color-border-subtle)"
                    >
                        <Flex justify="space-between" align="center" mb={3}>
                            <Skeleton height="16px" width="80px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            <Flex gap={2}>
                                <Skeleton height="32px" width="100px" borderRadius="6px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                <Skeleton height="32px" width="80px" borderRadius="6px" speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            </Flex>
                        </Flex>

                        <Box fontFamily="monospace" fontSize="sm">
                            {[...Array(8)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    height="14px"
                                    width={`${Math.random() * 60 + 20}%`}
                                    mb={2}
                                    speed={speed}
                                    startColor="rgba(30,41,59,0.4)"
                                    endColor="rgba(30,41,59,0.7)"
                                />
                            ))}
                        </Box>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export default ActiveBattleSkeleton;
