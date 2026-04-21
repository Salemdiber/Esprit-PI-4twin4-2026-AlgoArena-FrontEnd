/**
 * ChallengePlaySkeleton – Loading state for challenge play page
 * 
 * Matches the full play page layout with editor and terminal.
 */
import React from 'react';
import { Box, Flex, Skeleton, SkeletonText } from '@chakra-ui/react';
import useAccessibility from '../../accessibility/hooks/useAccessibility';

const ChallengePlaySkeleton = () => {
    const { settings } = useAccessibility();
    const speed = settings?.reducedMotion ? 0 : 0.8;

    return (
        <Box h="100vh" display="flex" flexDirection="column" bg="var(--color-bg-primary)">
            {/* Header */}
            <Box p={4} borderBottom="1px solid rgba(100,116,139,0.2)">
                <Flex justify="space-between" align="center">
                    <Box flex="1">
                        <Skeleton height="32px" width="300px" mb={2} speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                        <Skeleton height="16px" width="200px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                    </Box>
                    <Flex gap={2}>
                        <Skeleton height="36px" width="100px" borderRadius="8px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                        <Skeleton height="36px" width="80px" borderRadius="8px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                    </Flex>
                </Flex>
            </Box>

            {/* Main content area */}
            <Flex flex="1" overflow="hidden">
                {/* Left sidebar - Description */}
                <Box
                    w="360px"
                    p={4}
                    borderRight="1px solid rgba(100,116,139,0.2)"
                    overflowY="auto"
                >
                    <Skeleton height="24px" width="120px" mb={3} speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                    <SkeletonText
                        noOfLines={6}
                        spacing={3}
                        mb={6}
                        speed={speed}
                        startColor="rgba(30,41,59,0.6)"
                        endColor="rgba(30,41,59,0.9)"
                    />

                    <Skeleton height="20px" width="100px" mb={2} speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                    <Box mb={4}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i} mb={3} p={3} bg="rgba(30,41,59,0.3)" borderRadius="8px">
                                <Skeleton height="14px" width="180px" mb={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                                <SkeletonText noOfLines={2} spacing={2} speed={speed} startColor="var(--color-skeleton-base)" endColor="var(--color-skeleton-shimmer)" />
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Right side - Editor and Terminal */}
                <Flex flex="1" direction="column">
                    {/* Editor */}
                    <Box flex="1" p={4} bg="rgba(15,23,42,0.8)">
                        <Flex justify="space-between" align="center" mb={3}>
                            <Skeleton height="16px" width="120px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                            <Skeleton height="24px" width="100px" borderRadius="6px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                        </Flex>
                        {/* Editor content */}
                        <Box p={4} bg="rgba(0,0,0,0.3)" borderRadius="8px" fontFamily="monospace" fontSize="sm">
                            {[...Array(15)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    height="16px"
                                    width={`${Math.random() * 40 + 40}%`}
                                    mb={2}
                                    speed={speed}
                                    startColor="rgba(30,41,59,0.4)"
                                    endColor="rgba(30,41,59,0.7)"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Terminal */}
                    <Box h="280px" p={4} bg="rgba(0,0,0,0.5)" borderTop="1px solid var(--color-border-subtle)">
                        <Flex justify="space-between" align="center" mb={3}>
                            <Skeleton height="16px" width="80px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                            <Skeleton height="32px" width="100px" borderRadius="6px" speed={speed} startColor="rgba(30,41,59,0.6)" endColor="rgba(30,41,59,0.9)" />
                        </Flex>
                        <Box fontFamily="monospace" fontSize="sm">
                            {[...Array(8)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    height="14px"
                                    width={`${Math.random() * 50 + 30}%`}
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

export default ChallengePlaySkeleton;
