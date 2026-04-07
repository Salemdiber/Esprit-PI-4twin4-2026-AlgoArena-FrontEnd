/**
 * LeaderboardHeader – title, subtitle, and filter controls
 *
 * Filters:
 *  • Scope: Global / Friends / Country
 *  • Period: Weekly / Monthly / All-Time
 *
 * All filter state is managed via React useState.
 */
import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const LeaderboardHeader = ({
    eyebrow = 'Elite Championship',
    title = 'Global Arena',
    subtitle = 'Where legends compete for supremacy',
}) => {
    return (
        <MotionBox
            textAlign="center"
            mb={16}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Elite Championship pill */}
            <Flex justify="center" mb={4}>
                <Box
                    display="inline-block"
                    px={4}
                    py={2}
                    borderRadius="6px"
                    bg="rgba(34, 211, 238, 0.1)"
                    border="1px solid rgba(34, 211, 238, 0.3)"
                >
                    <Text
                        fontFamily="body"
                        fontSize="xs"
                        fontWeight="semibold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color="#22d3ee"
                    >
                        {eyebrow}
                    </Text>
                </Box>
            </Flex>

            {/* Title */}
            <Text
                as="h1"
                fontFamily="heading"
                fontSize={{ base: '5xl', sm: '6xl', lg: '7xl' }}
                fontWeight="black"
                letterSpacing="tight"
                mb={4}
                bgGradient="linear(135deg, #22d3ee, #60a5fa)"
                bgClip="text"
            >
                {title}
            </Text>

            {/* Subtitle */}
            <Text fontFamily="body" fontSize={{ base: 'lg', sm: 'xl' }} color="gray.400" mb={8}>
                {subtitle}
            </Text>
        </MotionBox>
    );
};

export default LeaderboardHeader;
