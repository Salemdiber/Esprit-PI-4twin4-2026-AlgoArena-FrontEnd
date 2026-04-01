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
    const runCode = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        setOutput([]);

        try {
            const resp = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            });
            const json = await resp.json();

            if (json.type === 'raw') {
                const out = json.output || '';
                const lines = out.split('\n').filter(Boolean);
                const items = [];
                if (!lines.length) items.push({ type: 'info', text: `No output` });
                lines.forEach((l) => items.push({ type: 'result', text: l }));
                setOutput(items);
            } else if (json.type === 'validation') {
                const res = json.result;
                const items = [];
                items.push({ type: 'info', text: `Tests: ${res.passedTests}/${res.totalTests}` });
                res.results.forEach((r) => {
                    items.push({ type: r.passed ? 'success' : 'error', text: `Test ${r.testCase}: ${r.passed ? '✓' : '✗'} Expected: ${r.expectedOutput} Got: ${r.actualOutput || r.error || ''}` });
                });
                setOutput(items);
            } else if (json.type === 'error') {
                setOutput([{ type: 'error', text: json.message || 'Execution error' }]);
            } else {
                setOutput([{ type: 'info', text: 'Unknown response from executor' }]);
            }
        } catch (err) {
            // Fallback to simulated output
            setOutput([{ type: 'error', text: err?.message || 'Failed to run code' }]);
        } finally {
            setIsRunning(false);
        }
    }, [isRunning, language, code]);

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
