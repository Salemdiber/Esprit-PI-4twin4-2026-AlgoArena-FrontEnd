/**
 * CodeEditor – reusable Monaco wrapper for AlgoArena.
 *
 * Uses @monaco-editor/react (NOT react-monaco-editor).
 * Dynamically imports Monaco for code-splitting – does NOT block initial page load.
 *
 * Why @monaco-editor/react?
 *   - Active maintenance, modern React support (hooks, Suspense)
 *   - Built-in lazy-loading via CDN or local
 *   - First-class TypeScript support
 *   - Smaller bundle footprint vs react-monaco-editor
 *
 * Props:
 *   code            – string (controlled value)
 *   onChange         – (value: string) => void
 *   language        – 'javascript' | 'python' | 'cpp' | …
 *   height          – CSS height string (default '400px')
 *   readOnly        – boolean (optional, default false)
 *   options          – extra Monaco options to merge
 */
import React, { useCallback, useRef } from 'react';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useReducedMotion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
    defaultEditorOptions,
    defineAlgoArenaTheme,
    LANGUAGE_MAP,
} from '../config/editorOptions';

/**
 * Loader skeleton shown while Monaco is downloading.
 */
const EditorLoader = () => (
    <Flex
        h="100%"
        w="100%"
        align="center"
        justify="center"
        bg="var(--color-bg-primary)"
        direction="column"
        gap={3}
    >
        <Spinner size="lg" color="#22d3ee" thickness="3px" speed="0.8s" />
        <Text color="var(--color-text-muted)" fontSize="sm" fontFamily="mono">
            Loading editor…
        </Text>
    </Flex>
);

const CodeEditor = ({
    code,
    onChange,
    language = 'javascript',
    height = '400px',
    readOnly = false,
    options = {},
}) => {
    const noMotion = useReducedMotion();

    /**
     * beforeMount – define our custom theme before the editor renders.
     */
    const handleBeforeMount = useCallback((monaco) => {
        defineAlgoArenaTheme(monaco);
    }, []);

    /**
     * onMount – the editor instance is ready.
     * Disable scroll-beyond-last-line at runtime and prevent
     * the editor from auto-focusing (avoids page jump).
     */
    const handleMount = useCallback((editor, _monaco) => {
        // Don't auto-focus — prevents unexpected page scroll
    }, []);

    /**
     * onChange – Monaco fires this with the new value + event.
     * We only pass the value string upstream.
     */
    const handleChange = useCallback(
        (value) => {
            if (onChange) onChange(value || '');
        },
        [onChange],
    );

    const monacoLang = LANGUAGE_MAP[language] || 'plaintext';

    const mergedOptions = {
        ...defaultEditorOptions,
        readOnly,
        // Performance: disable smooth scrolling to fix scroll lag
        smoothScrolling: false,
        scrollBeyondLastLine: false,
        // Respect reduced motion
        ...(noMotion && {
            cursorBlinking: 'solid',
            cursorSmoothCaretAnimation: 'off',
        }),
        ...options,
    };

    /**
     * Stop wheel events from escaping Monaco so the outer page
     * doesn't scroll while the user scrolls inside the editor.
     */
    const containerRef = useRef(null);
    const handleWheel = useCallback((e) => {
        // Only stop propagation — don't preventDefault (Monaco needs it)
        e.stopPropagation();
    }, []);

    return (
        <Box
            ref={containerRef}
            h={height}
            w="100%"
            overflow="hidden"
            position="relative"
            bg="var(--color-bg-primary)"
            isolation="isolate"
            onWheel={handleWheel}
            sx={{
                /* Isolate scroll context — prevents bubbling to page */
                overscrollBehavior: 'contain',
                /* Override Monaco's default wrapper styles */
                '.monaco-editor, .overflow-guard': {
                    borderRadius: '0 !important',
                },
            }}
        >
            <Editor
                height="100%"
                theme="algoarena-dark"
                language={monacoLang}
                value={code}
                onChange={handleChange}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                loading={<EditorLoader />}
                options={mergedOptions}
            />
        </Box>
    );
};

export default CodeEditor;
