/**
 * OutputTerminal – displays run output with coloured lines.
 *
 * Props:
 *   output     – Array<{ type: 'info'|'success'|'error'|'result', text: string }>
 *   isRunning  – boolean (shows a pulsing cursor while running)
 */
import React, { useRef, useEffect } from 'react';
import { Box, Flex, Text, Icon, keyframes } from '@chakra-ui/react';

const blink = keyframes`
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
`;

const TerminalIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
    </Icon>
);

const COLOR_MAP = {
    info: '#94a3b8',
    success: '#22c55e',
    error: '#ef4444',
    result: '#e2e8f0',
};

const OutputTerminal = ({ output = [], isRunning = false }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    return (
        <Box
            bg="var(--color-terminal-bg)"
            borderTop="1px solid"
            borderColor="var(--color-editor-border)"
            borderBottomRadius="12px"
            overflow="hidden"
            flexShrink={0}
        >
            {/* Terminal header */}
            <Flex
                bg="var(--color-editor-toolbar)"
                px={4}
                py={2}
                align="center"
                gap={2}
                borderBottom="1px solid"
                borderColor="var(--color-editor-border)"
            >
                <TerminalIcon w={3.5} h={3.5} color="var(--color-text-muted)" />
                <Text fontSize="xs" fontWeight="semibold" color="var(--color-text-muted)" textTransform="uppercase" letterSpacing="wider">
                    Output
                </Text>
                {/* Decorative dots */}
                <Flex ml="auto" gap={1.5}>
                    <Box w="8px" h="8px" borderRadius="full" bg="var(--color-border)" />
                    <Box w="8px" h="8px" borderRadius="full" bg="var(--color-border)" />
                    <Box w="8px" h="8px" borderRadius="full" bg="var(--color-border)" />
                </Flex>
            </Flex>

            {/* Terminal body */}
            <Box
                ref={scrollRef}
                px={4}
                py={3}
                maxH="140px"
                minH="80px"
                overflowY="auto"
                fontFamily="'Fira Code', 'Cascadia Code', 'Consolas', monospace"
                fontSize="13px"
                lineHeight="1.8"
                sx={{
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { bg: 'var(--color-terminal-bg)' },
                    '&::-webkit-scrollbar-thumb': { bg: 'var(--color-border)', borderRadius: '3px' },
                }}
            >
                {output.length === 0 && !isRunning && (
                    <Text color="var(--color-text-muted)" fontStyle="italic" fontSize="sm">
                        Click "Run Code" to execute and see results here…
                    </Text>
                )}

                {output.map((line, i) => (
                    <Text key={i} color={COLOR_MAP[line.type] || '#e2e8f0'} whiteSpace="pre-wrap">
                        {line.text}
                    </Text>
                ))}

                {isRunning && (
                    <Flex align="center" gap={1} mt={1}>
                        <Text color="#22d3ee" fontSize="sm">{'>'}</Text>
                        <Box
                            w="8px"
                            h="16px"
                            bg="#22d3ee"
                            animation={`${blink} 1s step-end infinite`}
                        />
                    </Flex>
                )}
            </Box>
        </Box>
    );
};

export default OutputTerminal;
