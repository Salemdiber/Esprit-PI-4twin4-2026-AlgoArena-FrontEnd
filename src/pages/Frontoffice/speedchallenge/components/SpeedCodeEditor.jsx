import React, { useRef } from 'react';
import { Box, Flex, Text, Select, useColorModeValue } from '@chakra-ui/react';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
];

/**
 * Minimal but styled code editor using a <textarea>.
 * (Monaco would be loaded via the shared CodeEditor component
 *  if you want rich features. This textarea version keeps the
 *  component fully standalone with no extra deps.)
 */
const SpeedCodeEditor = ({ code, onChange, language, onLanguageChange }) => {
    const textareaRef = useRef(null);
    const editorBg = useColorModeValue('#ffffff', '#0f172a');
    const toolbarBg = useColorModeValue('rgba(248,250,252,0.94)', '#0b1220');
    const gutterBg = useColorModeValue('#f1f5f9', '#0b1220');
    const borderColor = useColorModeValue('rgba(14,116,144,0.14)', 'rgba(255,255,255,0.06)');
    const subtleBorder = useColorModeValue('rgba(14,116,144,0.1)', 'rgba(255,255,255,0.04)');
    const fileColor = useColorModeValue('var(--color-text-muted)', 'gray.500');
    const textColor = useColorModeValue('#0f172a', '#e2e8f0');
    const numberColor = useColorModeValue('rgba(15,23,42,0.34)', 'rgba(255,255,255,0.2)');
    const selectText = useColorModeValue('var(--color-text-secondary)', 'gray.300');
    const selectOptionBg = useColorModeValue('#ffffff', '#0f172a');
    const scrollbarThumb = useColorModeValue('#94a3b8', '#334155');

    // Tab key support
    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = textareaRef.current;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const newVal = code.slice(0, start) + '  ' + code.slice(end);
            onChange(newVal);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 2;
            });
        }
    };

    return (
        <Flex direction="column" flex={1} overflow="hidden" bg={editorBg}>
            {/* Toolbar */}
            <Flex
                align="center"
                justify="space-between"
                px={4}
                py={2}
                bg={toolbarBg}
                borderBottom="1px solid"
                borderColor={borderColor}
                flexShrink={0}
            >
                <HStack spacing={3}>
                    {/* Window dots */}
                    <Flex gap="6px">
                        <Box w="10px" h="10px" borderRadius="full" bg="rgba(239,68,68,0.6)" />
                        <Box w="10px" h="10px" borderRadius="full" bg="rgba(250,204,21,0.6)" />
                        <Box w="10px" h="10px" borderRadius="full" bg="rgba(34,197,94,0.6)" />
                    </Flex>
                    <Text fontSize="xs" color={fileColor} fontFamily="mono">
                        solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                    </Text>
                </HStack>

                {/* Language selector */}
                <Select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    size="xs"
                    maxW="130px"
                    bg={editorBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="6px"
                    color={selectText}
                    fontSize="xs"
                    fontFamily="mono"
                    _focus={{ borderColor: '#22d3ee', boxShadow: '0 0 0 1px #22d3ee' }}
                    cursor="pointer"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value} style={{ background: selectOptionBg }}>
                            {l.label}
                        </option>
                    ))}
                </Select>
            </Flex>

            {/* Editor area */}
            <Flex flex={1} overflow="hidden" position="relative">
                {/* Line numbers */}
                <Box
                    as="pre"
                    px={3}
                    py={4}
                    color={numberColor}
                    fontSize="13px"
                    fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                    lineHeight="1.6"
                    textAlign="right"
                    userSelect="none"
                    bg={gutterBg}
                    borderRight="1px solid"
                    borderColor={subtleBorder}
                    minW="44px"
                    overflowY="hidden"
                    flexShrink={0}
                    aria-hidden="true"
                >
                    {code.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </Box>

                {/* Textarea */}
                <Box
                    as="textarea"
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    flex={1}
                    p={4}
                    bg="transparent"
                    color={textColor}
                    fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                    fontSize="13px"
                    lineHeight="1.6"
                    border="none"
                    outline="none"
                    resize="none"
                    overflowY="auto"
                    sx={{
                        caretColor: '#22d3ee',
                        '&::selection': { background: 'rgba(34,211,238,0.2)' },
                        '&::-webkit-scrollbar': { width: '5px' },
                        '&::-webkit-scrollbar-track': { bg: 'transparent' },
                        '&::-webkit-scrollbar-thumb': { bg: scrollbarThumb, borderRadius: '3px' },
                        whiteSpace: 'pre',
                    }}
                />
            </Flex>
        </Flex>
    );
};

// Helper HStack without Chakra dep within the file
const HStack = ({ children, spacing = 2 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${spacing * 4}px` }}>
        {children}
    </div>
);

export default SpeedCodeEditor;
