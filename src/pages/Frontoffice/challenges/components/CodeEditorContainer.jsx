/**
 * CodeEditorContainer – integrates the shared CodeEditor (Monaco)
 * into the ChallengePlayPage.
 *
 * Props:
 *   code         – string
 *   setCode      – (string) => void
 *   language     – string
 *   readOnly     – boolean (optional)
 */
import React from 'react';
import { Box } from '@chakra-ui/react';
import { CodeEditor } from '../../../../editor';

const CodeEditorContainer = ({ code, setCode, language, readOnly = false }) => (
    <Box flex={1} overflow="hidden" position="relative" bg="var(--color-bg-primary)">
        <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            height="100%"
            readOnly={readOnly}
        />
    </Box>
);

export default CodeEditorContainer;

