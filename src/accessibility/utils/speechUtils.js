/**
 * speechUtils.js – Web Speech API helpers
 *
 * Provides:
 *  • readAloud(text)  – speaks text using SpeechSynthesis
 *  • stopSpeaking()   – cancels current speech
 *  • isSpeaking()     – returns boolean
 *  • startListening(onResult) – voice command recognition
 *  • stopListening()  – stops recognition
 */

/* ─── Text-to-Speech ─── */

export const readAloud = (text) => {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis not supported in this browser.');
        return;
    }
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = 'en-US';

    // Try to pick a nice English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
        (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

export const isSpeaking = () => {
    if ('speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
    }
    return false;
};

/* ─── Voice Commands (Speech Recognition) ─── */

let recognition = null;
let intentionallyStopped = false;
let restartTimeout = null;

export const startListening = (onResult, onError) => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported in this browser.');
        if (onError) onError('Speech Recognition not supported');
        return null;
    }

    // Clean up any previous instance
    stopListening();
    intentionallyStopped = false;

    const createRecognition = () => {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
            const last = event.results[event.results.length - 1];
            if (last.isFinal) {
                const transcript = last[0].transcript.trim().toLowerCase();
                console.log('[Voice Command] Heard:', transcript);
                if (onResult) onResult(transcript);
            }
        };

        rec.onerror = (event) => {
            console.warn('[Voice Command] Error:', event.error);
            // Auto-restart on recoverable errors (network, aborted, no-speech)
            if (!intentionallyStopped && ['network', 'aborted', 'no-speech'].includes(event.error)) {
                console.log('[Voice Command] Restarting in 1s...');
                restartTimeout = setTimeout(() => {
                    if (!intentionallyStopped) {
                        try {
                            recognition = createRecognition();
                            recognition.start();
                        } catch (e) {
                            console.warn('[Voice Command] Restart failed:', e);
                        }
                    }
                }, 1000);
            }
            if (onError) onError(event.error);
        };

        // Chrome may silently end the session — auto-restart
        rec.onend = () => {
            if (!intentionallyStopped) {
                console.log('[Voice Command] Session ended, restarting...');
                restartTimeout = setTimeout(() => {
                    if (!intentionallyStopped) {
                        try {
                            recognition = createRecognition();
                            recognition.start();
                        } catch (e) {
                            console.warn('[Voice Command] Restart failed:', e);
                        }
                    }
                }, 500);
            }
        };

        return rec;
    };

    recognition = createRecognition();

    try {
        recognition.start();
        console.log('[Voice Command] Listening started ✓');
    } catch (e) {
        console.warn('[Voice Command] Failed to start:', e);
    }

    return recognition;
};

export const stopListening = () => {
    intentionallyStopped = true;
    if (restartTimeout) {
        clearTimeout(restartTimeout);
        restartTimeout = null;
    }
    if (recognition) {
        try {
            recognition.onend = null; // prevent auto-restart
            recognition.onerror = null;
            recognition.stop();
        } catch (e) {
            // already stopped
        }
        recognition = null;
    }
};

/**
 * Extracts readable text from a container element,
 * skipping hidden elements and buttons.
 */
export const getPageText = (containerSelector = 'main') => {
    const container = document.querySelector(containerSelector);
    if (!container) return '';

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const style = window.getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden')
                    return NodeFilter.FILTER_REJECT;
                if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName))
                    return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    const parts = [];
    while (walker.nextNode()) {
        const text = walker.currentNode.textContent.trim();
        if (text) parts.push(text);
    }
    return parts.join('. ');
};
