import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AIAgent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('chat'); // 'chat' or 'nav'
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [playingMessageId, setPlayingMessageId] = useState(null);

    // Separate chat histories for modes to avoid confusion
    const [chatMessages, setChatMessages] = useState([
        { id: 1, text: "Hello! I'm your AlgoArena AI assistant. How can I guide you in the arena today?", isUser: false, time: 'Just now' }
    ]);
    const [navMessages, setNavMessages] = useState([
        { id: 1, text: "Audio Navigation Active. Type or use the microphone to dictate a destination (e.g. 'Take me to challenges', 'Open dashboard', 'Home').", isUser: false, time: 'Just now' }
    ]);

    const messagesEndRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const currentAudioPlaybackRef = useRef(null);
    const navigate = useNavigate();

    const activeMessages = mode === 'chat' ? chatMessages : navMessages;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, navMessages, isOpen, isLoading, mode, isListening]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (currentAudioPlaybackRef.current) {
                currentAudioPlaybackRef.current.pause();
                currentAudioPlaybackRef.current = null;
            }
        };
    }, []);

    const playMessageAudio = async (msgId, text) => {
        // If clicking the currently playing message, toggle stop
        if (playingMessageId === msgId && currentAudioPlaybackRef.current) {
            currentAudioPlaybackRef.current.pause();
            currentAudioPlaybackRef.current = null;
            setPlayingMessageId(null);
            return;
        }

        // Stop any currently playing audio
        if (currentAudioPlaybackRef.current) {
            currentAudioPlaybackRef.current.pause();
            currentAudioPlaybackRef.current = null;
            setPlayingMessageId(null);
        }

        setPlayingMessageId(msgId); // Set to loading/playing state visually immediately

        try {
            if (typeof puter === 'undefined') throw new Error("Puter SDK not loaded");
            const audio = await puter.ai.txt2speech(text);
            currentAudioPlaybackRef.current = audio;

            audio.onended = () => {
                setPlayingMessageId(null);
                currentAudioPlaybackRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error("Audio playback error:", error);
            setPlayingMessageId(null);
        }
    };

    const processNavigation = async (userText) => {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { id: Date.now(), text: userText, isUser: true, time: timeNow };

        setNavMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            if (typeof puter === 'undefined') throw new Error("Puter SDK not loaded");

            const systemPrompt = `Analyze the user's intent to navigate. 
Valid destinations: 'home', 'landing', 'battles', 'challenges', 'leaderboard', 'community', 'dashboard', 'profile'.
Extract ONLY the single word destination representing the platform page. If unclear, return 'unknown'.
User input: "${userText}"`;

            const response = await puter.ai.chat([{ role: "user", content: systemPrompt }]);
            let target = response.message.content.toLowerCase().replace(/[^a-z]/g, '');

            let route = '';
            let spokenText = '';

            if (target === 'landing') target = 'home';

            switch (target) {
                case 'Signin': route = '/signin'; spokenText = 'Navigating to Signin page.'; break;
                case 'Signup': route = '/signup'; spokenText = 'Navigating to Signup page.'; break;
                case 'home': route = '/'; spokenText = 'Navigating to home page.'; break;
                case 'challenges': route = '/challenges'; spokenText = 'Navigating to challenges.'; break;
                case 'battles': route = '/battles'; spokenText = 'Navigating to battles.'; break;
                case 'leaderboard': route = '/leaderboard'; spokenText = 'Navigating to leaderboard.'; break;
                case 'community': route = '/community'; spokenText = 'Navigating to community.'; break;
                case 'profile': route = '/profile'; spokenText = 'Opening your profile.'; break;
                case 'dashboard': route = '/admin'; spokenText = 'Going to your dashboard.'; break;
                default:
                    route = null;
                    spokenText = 'I could not recognize that destination. Please state a valid platform page.';
            }

            const aiMsg = { id: Date.now() + 1, text: spokenText, isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setNavMessages(prev => [...prev, aiMsg]);

            playMessageAudio(aiMsg.id, spokenText);

            if (route !== null) {
                setTimeout(() => {
                    navigate(route);
                    setIsOpen(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Navigation Error:", error);
            setNavMessages(prev => [...prev, { id: Date.now() + 1, text: "System offline. Unable to reach cognitive cores.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setIsLoading(false);
        }
    };

    const processChat = async (userText) => {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = { id: Date.now(), text: userText, isUser: true, time: timeNow };
        setChatMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            if (typeof puter === 'undefined') throw new Error("Puter SDK not loaded");

            const systemPrompt = `You are the official AI assistant for AlgoArena. 
AlgoArena is a Next-Gen Developer Combat Platform featuring coding challenges, AI battles, and skill improvement. 
Your primary responsibilities:
- Explain the platform's purpose and features.
- Describe benefits such as coding challenges, AI battles, and skill improvement.
- Answer questions related ONLY to the website and its features. 
- Please behave as an integrated platform guide. Be concise and friendly.`;

            const chatHistory = [
                { role: "system", content: systemPrompt },
                ...chatMessages.slice(1).map(m => ({
                    role: m.isUser ? "user" : "assistant",
                    content: m.text
                })),
                { role: "user", content: userText }
            ];

            const response = await puter.ai.chat(chatHistory);
            const aiMsg = { id: Date.now() + 1, text: response.message.content, isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            setChatMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            setChatMessages(prev => [...prev, { id: Date.now() + 1, text: "System offline. Unable to reach cognitive cores.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const userText = input.trim();
        setInput('');
        if (mode === 'chat') {
            processChat(userText);
        } else {
            processNavigation(userText);
        }
    };

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsLoading(true);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], "speech.webm", { type: 'audio/webm' });

                try {
                    const response = await puter.ai.speech2txt(audioFile);
                    if (response && response.text) {
                        processNavigation(response.text);
                    } else {
                        setNavMessages(prev => [...prev, { id: Date.now(), text: "I couldn't hear anything clearly. Try again.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                        setIsLoading(false);
                    }
                } catch (err) {
                    console.error("Speech2txt error:", err);
                    setNavMessages(prev => [...prev, { id: Date.now(), text: "Sorry, speech processing failed. Please try text input.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                    setIsLoading(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            setNavMessages(prev => [...prev, { id: Date.now(), text: "Microphone access denied. Please allow microphone permissions.", isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* AI Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-(--color-bg-primary) to-(--color-bg-secondary) text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:-translate-y-1 transition-all duration-300 border border-(--color-border) overflow-visible"
                    aria-label="Open AI Assistant"
                >
                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-[-4px] rounded-full border border-dashed border-(--color-border) animate-[spin_8s_linear_infinite] group-hover:border-cyan-400/60 hidden md:block"></div>
                    <div className="relative z-10 flex items-center justify-center filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-(--color-bg-primary) z-20" />
                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-(--color-bg-primary) z-10 animate-ping opacity-75" />
                </button>
            )}

            {/* AI Assistant Interface */}
            {isOpen && (
                <div className="w-[380px] h-[600px] flex flex-col rounded-2xl border border-(--color-border) bg-(--color-glass-bg-solid) backdrop-blur-2xl shadow-[var(--shadow-dropdown)] animate-fade-in-up overflow-hidden ring-1 ring-(--color-border)/50">

                    {/* Header */}
                    <div className="relative flex flex-col bg-gradient-to-br from-(--color-bg-secondary) to-(--color-bg-primary) border-b border-(--color-border)">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50"></div>

                        <div className="flex items-center justify-between p-5 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-(--color-bg-secondary)"></div>
                                </div>
                                <div>
                                    <h2 className="font-heading font-bold text-(--color-text-heading) text-lg tracking-wide">AlgoArena AI</h2>
                                    <p className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        System Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-hover-bg) p-2 rounded-full transition-colors focus:outline-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Mode Segmented Control */}
                        <div className="px-5 pb-5">
                            <div className="flex w-full bg-(--color-bg-primary) rounded-xl p-1.5 border border-(--color-border) shadow-inner relative z-10">
                                <button
                                    onClick={() => { setMode('chat'); if (isListening) stopListening(); }}
                                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition-all duration-300 ${mode === 'chat' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_4px_12px_rgba(34,211,238,0.3)]' : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-hover-bg)'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    Chat AI
                                </button>
                                <button
                                    onClick={() => setMode('nav')}
                                    className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg transition-all duration-300 ${mode === 'nav' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(168,85,247,0.3)]' : 'text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-hover-bg)'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    Audio Nav
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area Body */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar bg-gradient-to-b from-(--color-bg-secondary) to-(--color-bg-primary) relative">
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>

                        {activeMessages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 relative z-10 ${msg.isUser ? 'justify-end' : ''}`}>
                                {!msg.isUser && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${mode === 'chat' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-indigo-600'}`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {mode === 'chat' ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            )}
                                        </svg>
                                    </div>
                                )}
                                <div className={`max-w-[75%] ${msg.isUser ? 'order-1' : 'order-2'} group`}>
                                    <div className={`relative p-4 rounded-2xl ${msg.isUser ? 'bg-gradient-to-br from-cyan-500 to-blue-600 rounded-tr-sm text-white shadow-[0_4px_12px_rgba(34,211,238,0.2)]' : 'bg-(--color-bg-elevated) rounded-tl-sm border border-(--color-border) text-(--color-text-primary) shadow-sm'} transition-all`}>
                                        <p className="text-[13px] leading-[1.6] whitespace-pre-wrap">{msg.text}</p>

                                        {/* Playback Button Overlay for AI Messages */}
                                        {!msg.isUser && (
                                            <button
                                                onClick={() => playMessageAudio(msg.id, msg.text)}
                                                className={`absolute -right-3 -top-3 p-1.5 rounded-full shadow-lg transition-all duration-300 ${playingMessageId === msg.id ? 'bg-cyan-500 text-white ring-2 ring-cyan-500/50 opacity-100 scale-110' : 'bg-(--color-bg-secondary) text-(--color-text-muted) opacity-0 group-hover:opacity-100 border border-(--color-border) hover:text-cyan-400 hover:bg-(--color-hover-bg) hover:scale-105'} focus:outline-none`}
                                                title={playingMessageId === msg.id ? "Stop playback" : "Read aloud"}
                                            >
                                                {playingMessageId === msg.id ? (
                                                    <div className="flex items-center justify-center w-4 h-4 gap-[2px]">
                                                        <span className="w-1 h-2.5 bg-white rounded-sm animate-[bounce_0.8s_ease-in-out_infinite]"></span>
                                                        <span className="w-1 h-3.5 bg-white rounded-sm animate-[bounce_0.8s_ease-in-out_infinite_0.2s]"></span>
                                                        <span className="w-1 h-2 bg-white rounded-sm animate-[bounce_0.8s_ease-in-out_infinite_0.4s]"></span>
                                                    </div>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.061 8.25 8.25 0 000-11.666.75.75 0 010-1.06z" />
                                                        <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                                                    </svg>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <p className={`text-[11px] text-(--color-text-muted) mt-1.5 font-medium ${msg.isUser ? 'text-right' : 'text-left ml-1'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}

                        {(isLoading || isListening) && (
                            <div className="flex gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${mode === 'chat' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-indigo-600'}`}>
                                    <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                </div>
                                <div className="px-5 py-4 bg-(--color-bg-card) backdrop-blur-sm rounded-2xl rounded-tl-sm border border-(--color-border) text-(--color-text-primary) flex items-center gap-2 shadow-sm">
                                    {isListening ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            <span className="text-sm text-(--color-text-primary) animate-pulse">Listening...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-(--color-text-muted) rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-(--color-text-muted) rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-2 h-2 bg-(--color-text-muted) rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Interactive Input Footer */}
                    <div className="p-4 border-t border-(--color-border) bg-(--color-bg-card) backdrop-blur-md">
                        <div className="relative flex items-center gap-2">
                            <div className="relative group flex-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading || isListening}
                                    placeholder={mode === 'chat' ? "Ask about the platform..." : "Type or speak destination..."}
                                    className="w-full h-12 bg-(--color-bg-input) border border-(--color-border) rounded-xl pl-4 pr-12 text-[13px] text-(--color-text-primary) placeholder:text-(--color-text-muted) hover:border-(--color-border-hover) focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-[var(--color-focus-glow)] transition-all duration-300 disabled:opacity-60 shadow-sm"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || isListening || !input.trim()}
                                    className={`absolute right-1.5 top-1.5 h-9 w-9 flex items-center justify-center rounded-lg text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${mode === 'nav' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]'}`}
                                >
                                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                    </svg>
                                </button>
                            </div>

                            {/* Microphone Button (Only for Nav mode or optionally both) */}
                            {mode === 'nav' && (
                                <button
                                    onClick={toggleListening}
                                    disabled={isLoading}
                                    className={`h-12 w-12 flex-shrink-0 flex flex-col items-center justify-center rounded-xl transition-all duration-300 border focus:outline-none disabled:opacity-50
                                        ${isListening
                                            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                                            : 'bg-(--color-bg-primary) border-(--color-border) text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div className="text-center mt-3">
                            <p className="text-[10px] text-(--color-text-muted) uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
                                <svg className="w-3 h-3 text-(--color-text-muted)" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
                                Powered by AlgoArena Dev team
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAgent;
