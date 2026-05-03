import React, { useEffect, useState } from 'react';
import {
    Box,
    Flex,
    HStack,
    Icon,
    Spinner,
    Text,
    useColorModeValue,
    VStack,
} from '@chakra-ui/react';
import { m, AnimatePresence } from 'framer-motion';

const MotionBox = m.create(Box);
const MotionFlex = m.create(Flex);

/**
 * Tiny brain icon used as the "thinking" mark next to each stage.
 * Pulled inline (no external icon dep) so the component stays
 * self-contained.
 */
const BrainIcon = (props) => (
    <Icon
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5V5a2.5 2.5 0 0 0-2.45 3 2.5 2.5 0 0 0-1.05 4.18A2.5 2.5 0 0 0 4.5 17a2.5 2.5 0 0 0 2 2.45A2.5 2.5 0 0 0 9 22a2.5 2.5 0 0 0 2.5-2.5V4.5A2.5 2.5 0 0 0 9.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5V5a2.5 2.5 0 0 1 2.45 3 2.5 2.5 0 0 1 1.05 4.18A2.5 2.5 0 0 1 19.5 17a2.5 2.5 0 0 1-2 2.45A2.5 2.5 0 0 1 15 22a2.5 2.5 0 0 1-2.5-2.5V4.5A2.5 2.5 0 0 1 14.5 2z" />
    </Icon>
);

/**
 * Type-out animation: returns the source string progressively.
 * `speedMs` is per character. Resets when `text` changes.
 */
function useTypewriter(text, speedMs = 14) {
    const [out, setOut] = useState('');
    useEffect(() => {
        if (!text) {
            setOut('');
            return undefined;
        }
        setOut('');
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setOut(text.slice(0, i));
            if (i >= text.length) clearInterval(id);
        }, speedMs);
        return () => clearInterval(id);
    }, [text, speedMs]);
    return out;
}

/**
 * Renders a single stage line. The most-recent stage types itself out;
 * older stages are shown immediately and dimmed slightly to draw the
 * eye to the front of the queue.
 */
const StageLine = ({ stage, isLatest, accent }) => {
    const typed = useTypewriter(isLatest ? stage.message : '');
    const text = isLatest ? typed : stage.message;
    return (
        <MotionFlex
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: isLatest ? 1 : 0.65, x: 0 }}
            transition={{ duration: 0.18 }}
            align="flex-start"
            gap={2}
        >
            <Box mt="3px" color={accent} flexShrink={0}>
                <BrainIcon boxSize="14px" />
            </Box>
            <Text
                fontSize="xs"
                fontFamily="mono"
                lineHeight="1.5"
                whiteSpace="pre-wrap"
            >
                {text}
                {isLatest && text.length < stage.message.length && (
                    <Box as="span" ml={0.5} opacity={0.6}>
                        ▋
                    </Box>
                )}
            </Text>
        </MotionFlex>
    );
};

/**
 * "Thinking" trace card displayed in the terminal panel during a
 * submission. Driven by useComplexityThinking() events:
 *   - stages[]   chronological list of {id, message}
 *   - isStreaming  true while events are still arriving
 *   - result     the final prediction payload, used to flip the panel
 *                from "thinking" mode into a short summary line
 *
 * When result === null and isStreaming === false the component renders
 * nothing - we don't want a stale trace lingering after the submission
 * finishes (the persistent verdict lives on the Submission tab).
 */
const ThinkingTrace = ({ stages, isStreaming, result, error, label }) => {
    const cardBg = useColorModeValue(
        'linear-gradient(140deg, rgba(124,58,237,0.08) 0%, rgba(34,211,238,0.06) 100%)',
        'linear-gradient(140deg, rgba(124,58,237,0.18) 0%, rgba(34,211,238,0.12) 100%)',
    );
    const border = useColorModeValue('purple.200', 'purple.500');
    const accent = useColorModeValue('purple.500', 'purple.300');
    const titleColor = useColorModeValue('purple.700', 'purple.200');
    const summaryColor = useColorModeValue('gray.700', 'gray.200');

    const visible = stages.length > 0 || isStreaming || error;
    if (!visible) return null;

    return (
        <AnimatePresence>
            <MotionBox
                key="thinking-trace"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderRadius="12px"
                p={3}
                mb={3}
            >
                <HStack spacing={2} mb={2}>
                    <Box color={accent}>
                        {isStreaming ? (
                            <Spinner size="xs" thickness="2px" color={accent} />
                        ) : (
                            <BrainIcon boxSize="14px" />
                        )}
                    </Box>
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        letterSpacing="0.04em"
                        textTransform="uppercase"
                        color={titleColor}
                    >
                        {label || 'AlgoArena · CodeAnalyser is thinking'}
                    </Text>
                </HStack>

                <VStack align="stretch" spacing={1.5} pl={1}>
                    {stages.map((s, i) => (
                        <StageLine
                            key={`${s.id}-${i}`}
                            stage={s}
                            isLatest={i === stages.length - 1 && isStreaming}
                            accent={accent}
                        />
                    ))}
                </VStack>

                {/* Compact summary line once the final verdict has arrived. */}
                {result && !isStreaming && (
                    <MotionFlex
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        mt={3}
                        pt={2}
                        borderTop="1px solid"
                        borderColor={border}
                        gap={3}
                        wrap="wrap"
                        fontSize="xs"
                        color={summaryColor}
                    >
                        <Text>
                            <strong>Time:</strong> {result.timeComplexity}
                        </Text>
                        <Text>
                            <strong>Space:</strong> {result.spaceComplexity}
                        </Text>
                        <Text>
                            <strong>Confidence:</strong>{' '}
                            {Math.round((result.confidence || 0) * 100)}%
                        </Text>
                        {result.method && (
                            <Text fontStyle="italic" opacity={0.8}>
                                via {result.method}
                            </Text>
                        )}
                    </MotionFlex>
                )}

                {/* Soft error: model service unreachable. We don't block the */}
                {/* user's submission - real grading still goes through the   */}
                {/* backend - so we just whisper a notice.                    */}
                {error && !isStreaming && stages.length === 0 && (
                    <Text fontSize="xs" color="orange.400" mt={1}>
                        Live thinking trace unavailable ({error}). The verdict
                        will still appear on the Submission tab.
                    </Text>
                )}
            </MotionBox>
        </AnimatePresence>
    );
};

export default ThinkingTrace;
