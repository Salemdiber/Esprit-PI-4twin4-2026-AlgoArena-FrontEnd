/**
 * TrendIndicator – animated arrow showing ranking trend
 *
 * UP   → green upward arrow with subtle bounce
 * DOWN → red downward arrow with subtle bounce
 * STABLE → grey dash (no animation)
 */
import React from 'react';
import { Box, Icon } from '@chakra-ui/react';
import { m } from 'framer-motion';

const MotionBox = m.create(Box);

const UpArrow = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
        />
    </Icon>
);

const DownArrow = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        />
    </Icon>
);

const StableDash = (props) => (
    <Icon viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
    </Icon>
);

const bounceVariants = {
    animate: {
        y: [0, -3, 0],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const bounceDownVariants = {
    animate: {
        y: [0, 3, 0],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

const TrendIndicator = ({ trend = 'STABLE', size = 6 }) => {
    if (trend === 'UP') {
        return (
            <MotionBox
                variants={bounceVariants}
                animate="animate"
                flexShrink={0}
            >
                <UpArrow w={size} h={size} color="#10b981" />
            </MotionBox>
        );
    }

    if (trend === 'DOWN') {
        return (
            <MotionBox
                variants={bounceDownVariants}
                animate="animate"
                flexShrink={0}
            >
                <DownArrow w={size} h={size} color="#ef4444" />
            </MotionBox>
        );
    }

    return (
        <Box flexShrink={0}>
            <StableDash w={size} h={size} color="var(--color-text-muted)" />
        </Box>
    );
};

export default TrendIndicator;
