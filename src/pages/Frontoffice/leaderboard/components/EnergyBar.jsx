/**
 * EnergyBar – animated XP progress bar
 *
 * Uses Framer m for a smooth scaleX fill animation on mount.
 * Gradient colours adapt based on the tier prop.
 */
import React from 'react';
import { Box } from '@chakra-ui/react';
import { m } from 'framer-motion';

const MotionBox = m.create(Box);

const tierGradients = {
    PLATINUM: 'linear-gradient(90deg, #22d3ee 0%, #60a5fa 100%)',
    DIAMOND: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
    GOLD: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    SILVER: 'linear-gradient(90deg, #71717a 0%, #a1a1aa 100%)',
    BRONZE: 'linear-gradient(90deg, #8B4513 0%, #CD853F 100%)',
};

const tierBgColors = {
    PLATINUM: 'rgba(34, 211, 238, 0.2)',
    DIAMOND: 'rgba(59, 130, 246, 0.2)',
    GOLD: 'rgba(245, 158, 11, 0.2)',
    SILVER: 'rgba(113, 113, 122, 0.2)',
    BRONZE: 'rgba(139, 69, 19, 0.2)',
};

const EnergyBar = ({ percentage = 0, tier = 'SILVER', height = '6px', maxW, glow = false }) => {
    const gradient = tierGradients[tier] || tierGradients.SILVER;
    const bgColor = tierBgColors[tier] || tierBgColors.SILVER;

    return (
        <Box
            w="full"
            maxW={maxW}
            h={height}
            borderRadius="full"
            overflow="hidden"
            bg={bgColor}
        >
            <MotionBox
                h="full"
                borderRadius="full"
                bg={gradient}
                transformOrigin="left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                style={{ width: `${percentage}%` }}
                boxShadow={glow ? '0 0 10px rgba(34, 211, 238, 0.6)' : 'none'}
            />
        </Box>
    );
};

export default EnergyBar;
