import React from 'react';
import { Box, Flex, Text, HStack } from '@chakra-ui/react';

const STEPS = [
    { index: 1, difficulty: 'EASY', color: '#22c55e' },
    { index: 2, difficulty: 'MEDIUM', color: '#facc15' },
    { index: 3, difficulty: 'HARD', color: '#ef4444' },
];

const ProblemStepper = ({ currentIndex, solvedIds, problems }) => {
    return (
        <Flex align="center" gap={0}>
            {STEPS.map((step, i) => {
                const problem = problems[i];
                const isSolved = solvedIds.includes(problem?.id);
                const isCurrent = step.index === currentIndex;
                const isPast = step.index < currentIndex;

                return (
                    <React.Fragment key={step.index}>
                        {/* Step node */}
                        <Flex
                            align="center"
                            justify="center"
                            direction="column"
                            gap={1}
                            position="relative"
                        >
                            <Box
                                w="36px"
                                h="36px"
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                position="relative"
                                transition="all 0.4s cubic-bezier(0.4,0,0.2,1)"
                                border="2px solid"
                                borderColor={
                                    isSolved
                                        ? '#22c55e'
                                        : isCurrent
                                            ? step.color
                                            : 'rgba(255,255,255,0.1)'
                                }
                                bg={
                                    isSolved
                                        ? 'rgba(34,197,94,0.15)'
                                        : isCurrent
                                            ? `rgba(${hexToRgb(step.color)},0.12)`
                                            : 'rgba(30,41,59,0.6)'
                                }
                                boxShadow={
                                    isCurrent
                                        ? `0 0 16px ${step.color}55`
                                        : isSolved
                                            ? '0 0 12px rgba(34,197,94,0.4)'
                                            : 'none'
                                }
                            >
                                {isSolved ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                ) : (
                                    <Text
                                        fontSize="sm"
                                        fontWeight="bold"
                                        fontFamily="mono"
                                        color={isCurrent ? step.color : 'gray.500'}
                                    >
                                        {step.index}
                                    </Text>
                                )}
                            </Box>

                            {/* Label */}
                            <Text
                                fontSize="9px"
                                fontWeight="semibold"
                                color={
                                    isSolved ? '#22c55e' : isCurrent ? step.color : 'gray.600'
                                }
                                letterSpacing="0.08em"
                                textTransform="uppercase"
                            >
                                {step.difficulty}
                            </Text>
                        </Flex>

                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                            <Box
                                h="2px"
                                w="40px"
                                mb="14px"
                                bg={
                                    isPast || isSolved
                                        ? 'linear-gradient(90deg, #22c55e, rgba(34,197,94,0.3))'
                                        : 'rgba(255,255,255,0.07)'
                                }
                                borderRadius="full"
                                transition="background 0.5s ease"
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </Flex>
    );
};

// Utility: hex → "r,g,b" for rgba()
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

export default ProblemStepper;
