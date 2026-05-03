/**
 * useEditorState – manages code editor state.
 *
 * Returns:
 *   code, setCode, language, setLanguage,
 *   output, isRunning, runCode, resetCode
 *
 * Future-ready: runCode will call an API; for now it simulates output.
 */
import { useState, useCallback, useRef } from 'react';
import { DEMO_TEMPLATES } from '../config/editorOptions';

const useEditorState = (initialLanguage = 'javascript', templates = DEMO_TEMPLATES) => {
    const [language, setLanguageRaw] = useState(initialLanguage);
    const [code, setCode] = useState(templates[initialLanguage] || '');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    /**
     * Change language — also swaps the code template
     * (only if the current code is unchanged from the previous template).
     */
    const setLanguage = useCallback(
        (lang) => {
            setLanguageRaw((prevLang) => {
                // Swap template only if code matches the old template
                setCode((prevCode) => {
                    const wasTemplate = prevCode.trim() === (templates[prevLang] || '').trim();
                    return wasTemplate ? templates[lang] || '' : prevCode;
                });
                return lang;
            });
        },
        [templates],
    );

    /**
     * Simulate "Run Code" — produces mock output after a short delay.
     * Replace internals with a backend call later.
     */
    const runCode = useCallback(() => {
        if (isRunning) return;
        setIsRunning(true);
        setOutput([]);

        // Clear any pending timer
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setOutput([
                { type: 'info', text: `Compiling ${language}...` },
                { type: 'info', text: 'Running test cases...' },
                { type: 'success', text: '' },
                { type: 'result', text: 'Test Case 1: nums = [2,7,11,15], target = 9' },
                { type: 'success', text: '  ✓ Output: [0, 1]  Expected: [0, 1]  (2ms)' },
                { type: 'result', text: 'Test Case 2: nums = [3,2,4], target = 6' },
                { type: 'success', text: '  ✓ Output: [1, 2]  Expected: [1, 2]  (1ms)' },
                { type: 'result', text: 'Test Case 3: nums = [3,3], target = 6' },
                { type: 'success', text: '  ✓ Output: [0, 1]  Expected: [0, 1]  (1ms)' },
                { type: 'success', text: '' },
                { type: 'success', text: '✔ All test cases passed  (4ms total)' },
            ]);
            setIsRunning(false);
        }, 1200);
    }, [isRunning, language]);

    /** Reset code back to the template for the current language */
    const resetCode = useCallback(() => {
        setCode(templates[language] || '');
        setOutput([]);
    }, [language, templates]);

    return {
        code,
        setCode,
        language,
        setLanguage,
        output,
        setOutput,
        isRunning,
        runCode,
        resetCode,
    };
};

export default useEditorState;
