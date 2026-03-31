/**
 * CodeEditorContainer - integrates the shared CodeEditor (Monaco)
 * into the ChallengePlayPage.
 */
import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { CodeEditor } from '../../../../editor';

const CodeEditorContainer = ({
    code,
    setCode,
    language,
    readOnly = false,
    pasteBlocked = false,
    editorSettings = { fontFamily: 'monospace', fontSize: 14 },
    onLockedInteraction,
    onPasteBlocked,
}) => {
    const handleLockedInteraction = () => {
        if (readOnly && onLockedInteraction) onLockedInteraction();
    };

    const handlePasteBlock = (event) => {
        if (!pasteBlocked) return;
        event.preventDefault();
        if (onPasteBlocked) onPasteBlocked();
    };

    return (
        <Box
            flex={1}
            overflow="hidden"
            position="relative"
            bg="var(--color-bg-primary)"
            onMouseDownCapture={handleLockedInteraction}
            onKeyDownCapture={(event) => {
                if (pasteBlocked && ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v')) {
                    event.preventDefault();
                    if (onPasteBlocked) onPasteBlocked();
                }
                handleLockedInteraction();
            }}
            onPasteCapture={handlePasteBlock}
            onContextMenuCapture={handlePasteBlock}
        >
            <CodeEditor
                code={code}
                onChange={setCode}
                language={language}
                height="100%"
                readOnly={readOnly}
                options={{
                    fontFamily: editorSettings.fontFamily,
                    fontSize: editorSettings.fontSize,
                }}
            />

            {pasteBlocked && (
                <Text
                    position="absolute"
                    right={3}
                    bottom={2}
                    fontSize="xs"
                    color="orange.300"
                    bg="rgba(15, 23, 42, 0.82)"
                    px={2}
                    py={1}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="orange.500"
                >
                    Paste disabled after reset
                </Text>
            )}
        </Box>
    );
};

export default CodeEditorContainer;
