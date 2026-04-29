import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Streams stage-by-stage progress from the AlgoArena complexity model
 * service ("Reading your code..." → "Checking pattern library..." →
 * "Running classifier..." → final verdict). The frontend uses this to
 * drive a ChatGPT-style typing animation while the backend submission
 * runs in parallel.
 *
 * The model service exposes /predict_stream as Server-Sent Events.
 * EventSource doesn't support POST so we use fetch + ReadableStream and
 * parse the SSE frames manually.
 *
 * If the model service is unreachable (network, CORS, dev with the
 * service down) the hook silently degrades to empty state. The actual
 * submission still works because grading goes through the backend.
 */
const MODEL_URL =
    import.meta.env.VITE_COMPLEXITY_MODEL_URL || 'http://127.0.0.1:8088';

export default function useComplexityThinking() {
    const [stages, setStages] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    // AbortController for the in-flight fetch so callers can cancel
    // when the user navigates away or starts a new submission.
    const abortRef = useRef(null);

    const reset = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        setStages([]);
        setResult(null);
        setError(null);
        setIsStreaming(false);
    }, []);

    /**
     * Kick off a streaming prediction. Returns a Promise that resolves
     * with the final payload (or null on error) so callers can await
     * it if they want to chain UI transitions.
     */
    const start = useCallback(
        async ({ code, language, tags }) => {
            // Make sure any prior stream is cancelled before opening a new one.
            if (abortRef.current) {
                abortRef.current.abort();
            }
            const controller = new AbortController();
            abortRef.current = controller;

            setStages([]);
            setResult(null);
            setError(null);
            setIsStreaming(true);

            try {
                const res = await fetch(`${MODEL_URL}/predict_stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: code || '',
                        language: language || 'javascript',
                        tags: tags || [],
                    }),
                    signal: controller.signal,
                });
                if (!res.ok || !res.body) {
                    throw new Error(`HTTP ${res.status}`);
                }

                // Manual SSE parsing: events are separated by blank lines,
                // each event is one or more "data: <json>" lines. We hold
                // partial chunks in `buffer` until we see "\n\n".
                const reader = res.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';
                let finalPayload = null;

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    let sep;
                    while ((sep = buffer.indexOf('\n\n')) !== -1) {
                        const frame = buffer.slice(0, sep);
                        buffer = buffer.slice(sep + 2);
                        const dataLines = frame
                            .split('\n')
                            .filter((l) => l.startsWith('data:'))
                            .map((l) => l.slice(5).trim());
                        if (dataLines.length === 0) continue;
                        let evt;
                        try {
                            evt = JSON.parse(dataLines.join('\n'));
                        } catch {
                            continue; // ignore malformed frames
                        }
                        if (evt.type === 'stage') {
                            setStages((prev) => [
                                ...prev,
                                {
                                    id: evt.stage,
                                    message: evt.message,
                                    at: Date.now(),
                                },
                            ]);
                        } else if (evt.type === 'result') {
                            finalPayload = evt.payload;
                            setResult(evt.payload);
                        } else if (evt.type === 'error') {
                            setError(evt.message || 'Model service error');
                        }
                    }
                }
                setIsStreaming(false);
                return finalPayload;
            } catch (e) {
                // Aborts are expected when the caller calls reset() or
                // unmounts; we don't surface those as errors.
                if (e?.name !== 'AbortError') {
                    setError(e?.message || String(e));
                }
                setIsStreaming(false);
                return null;
            } finally {
                if (abortRef.current === controller) {
                    abortRef.current = null;
                }
            }
        },
        [],
    );

    // Cancel any in-flight stream when the consuming component unmounts.
    useEffect(
        () => () => {
            if (abortRef.current) abortRef.current.abort();
        },
        [],
    );

    return { stages, result, error, isStreaming, start, reset };
}
