import React, { useState, useEffect } from 'react';
import challengesService from '../../services/challengesService';

const Challenges = () => {
    const [view, setView] = useState('list'); // 'list', 'manual', 'ai'
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Manual creation form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [type, setType] = useState('ALGORITHMIC');
    const [points, setPoints] = useState(100);
    const [editingId, setEditingId] = useState(null);

    // Search / filter
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('ALL');

    const handleGenerateAI = async () => {
        setAiGenerating(true);
        setAiResult(null);
        try {
            // Placeholder: call AI generation endpoint here when available
            // e.g. const result = await aiService.generate(prompt)
            // setAiResult(result);
        } finally {
            setAiGenerating(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await challengesService.getChallenges();
                if (mounted) setChallenges(data || []);
            } catch (err) {
                if (mounted) setError(err.message || 'Failed to load');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, []);

    const refresh = async () => {
        try {
            const data = await challengesService.getChallenges();
            setChallenges(data || []);
        } catch (err) {
            setError(err.message || 'Failed to refresh');
        }
    };

    const handleSaveManual = async () => {
        const payload = {
            title: title.trim(),
            description: description.trim(),
            type,
            difficulty,
            maxScore: Number(points) || 0,
        };
        try {
            if (editingId) {
                await challengesService.updateChallenge(editingId, payload);
            } else {
                await challengesService.createChallenge(payload);
            }
            setTitle(''); setDescription(''); setPoints(100); setDifficulty('EASY'); setType('ALGORITHMIC'); setEditingId(null);
            setView('list');
            await refresh();
        } catch (err) {
            setError(err.message || 'Create/update failed');
        }
    };

    const handleSaveAI = async () => {
        if (!aiResult) return;
        const payload = {
            title: aiResult.title,
            description: aiResult.description,
            type: 'ALGORITHMIC',
            difficulty: 'MEDIUM',
            maxScore: 250,
        };
        try {
            await challengesService.createChallenge(payload);
            setAiResult(null);
            setView('list');
            await refresh();
        } catch (err) {
            setError(err.message || 'AI save failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this challenge?')) return;
        try {
            await challengesService.deleteChallenge(id);
            await refresh();
        } catch (err) {
            setError(err.message || 'Delete failed');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold  mb-2">Challenge Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }} className="">Create and manage coding challenges with AI assistance</p>
            </div>

            {/* Control Bar */}
            <div className="glass-panel rounded-2xl p-4 mb-6 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative search-wrapper w-full">
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} type="text" placeholder="Search challenges..." className="search-input w-full" />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="form-select w-full md:w-40 bg-(--color-bg-input)">
                        <option value="ALL">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                    <button
                        onClick={() => {
                            if (view !== 'manual') {
                                setTitle(''); setDescription(''); setDifficulty('EASY'); setType('ALGORITHMIC'); setPoints(100); setEditingId(null);
                            }
                            setView(view === 'manual' ? 'list' : 'manual');
                        }}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${view === 'manual' ? 'bg-gray-700 text-white' : 'btn-secondary'}`}
                    >
                        {view === 'manual' ? 'Cancel' : 'Create Manually'}
                    </button>
                    <button
                        onClick={() => setView(view === 'ai' ? 'list' : 'ai')}
                        className={`btn-primary flex items-center gap-2 whitespace-nowrap ${view === 'ai' ? 'ring-2 ring-cyan-300' : ''}`}
                    >
                        {view === 'ai' ? (
                            <>Close AI</>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                Create with AI
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Manual Editor */}
            {view === 'manual' && (
                <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-6">Create New Challenge Manually</h2>
                    <div className="space-y-6">
                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Challenge Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g., Two Sum Problem" className="form-input w-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="form-select w-full">
                                    <option value="ALGORITHMIC">Algorithmic</option>
                                    <option value="LOGICAL">Logical</option>
                                    <option value="DATA_STRUCTURES">Data Structures</option>
                                    <option value="MATHEMATICAL">Mathematical</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Difficulty</label>
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="form-select w-full">
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Points</label>
                                <input value={points} onChange={e => setPoints(e.target.value)} type="number" placeholder="100" className="form-input w-full" />
                            </div>
                        </div>

                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows="4" placeholder="Describe the challenge..." className="form-textarea w-full"></textarea>
                        </div>

                        

                        <div className="flex items-center gap-4 pt-4 border-t ">
                            <button onClick={handleSaveManual} className="flex-1 btn-primary">Save & Publish</button>
                            <button onClick={() => { setEditingId(null); setType('ALGORITHMIC'); setView('list'); }} className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generator */}
            {view === 'ai' && (
                <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold ">AI Challenge Generator</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            AI Powered
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Describe the challenge you want to create</label>
                            <textarea rows="4" placeholder="Example: Create a medium difficulty challenge about finding the longest palindromic substring in a string. Include edge cases and optimize for time complexity." className="form-textarea w-full"></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Difficulty</label>
                                <select className="form-select w-full">
                                    <option>Easy</option>
                                    <option defaultValue>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Topic</label>
                                <select className="form-select w-full">
                                    <option>Arrays</option>
                                    <option>Strings</option>
                                    <option>Trees</option>
                                    <option>Graphs</option>
                                    <option>Dynamic Programming</option>
                                    <option>Sorting</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Test Cases</label>
                                <input type="number" defaultValue="5" min="3" max="10" className="form-input w-full" />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateAI}
                            disabled={aiGenerating}
                            className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {aiGenerating ? (
                                    <>
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                        Generate Challenge with AI
                                    </>
                                )}
                            </span>
                        </button>

                        {aiResult && (
                            <div className="mt-6 p-6 bg-(--color-bg-input)/50 border border-cyan-400/30 rounded-xl animate-fade-in-up">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-heading text-lg font-bold text-cyan-400">AI Generated Challenge</h3>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Generated Successfully</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm font-medium  mb-1">Title</p>
                                        <p style={{ color: 'var(--color-text-secondary)' }} className=" font-medium">{aiResult.title}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm font-medium  mb-1">Description</p>
                                        <p style={{ color: 'var(--color-text-secondary)' }} className=" text-sm">{aiResult.description}</p>
                                    </div>
                                    
                                    <div>
                                        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm font-medium  mb-2">Test Cases (2 preview)</p>
                                        <div className="space-y-2">
                                            {aiResult.testCases.map((tc, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-(--color-bg-sidebar) rounded-lg border /50">
                                                    <span style={{ color: 'var(--color-text-secondary)' }} className="text-sm ">Input: {tc.input}</span>
                                                    <span className="text-sm text-cyan-400">Output: {tc.output}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-6 pt-4 border-t ">
                                    <button onClick={handleSaveAI} className="flex-1 btn-primary">Save & Publish</button>
                                    <button onClick={handleGenerateAI} className="btn-secondary">Regenerate</button>
                                    <button onClick={() => setAiResult(null)} className="btn-secondary hover:text-red-400 hover:border-red-400/30">Discard</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Existing Challenges List */}
            <div className="glass-panel rounded-2xl p-6 shadow-custom">
                <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold  mb-6">Existing Challenges</h2>
                <div className="space-y-3">

                    {loading && <p className="text-sm">Loading challenges...</p>}
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {!loading && !challenges.length && <p className="text-sm text-muted">No challenges yet.</p>}
                    {(() => {
                        const q = (searchQuery || '').trim().toLowerCase();
                        return challenges
                            .filter(c => {
                                if (filterDifficulty !== 'ALL' && (c.difficulty || '').toUpperCase() !== filterDifficulty) return false;
                                if (!q) return true;
                                const inTitle = (c.title || '').toLowerCase().includes(q);
                                const inDesc = (c.description || '').toLowerCase().includes(q);
                                return inTitle || inDesc;
                            })
                            .map((c) => (
                                <ChallengeItem
                                    key={c._id || c.id}
                                    id={c._id || c.id}
                                    title={c.title}
                                    subtitle={`${c.type} • ${c.maxScore} points`}
                                    difficulty={c.difficulty}
                                    color={c.difficulty === 'HARD' ? 'red' : c.difficulty === 'MEDIUM' ? 'yellow' : 'green'}
                                    aiGenerated={false}
                                    onDelete={handleDelete}
                                    onEdit={(id) => {
                                        const item = challenges.find(x => (x._id || x.id) === id);
                                        if (!item) return;
                                        setTitle(item.title || '');
                                        setDescription(item.description || '');
                                        setDifficulty(item.difficulty || 'EASY');
                                        setType(item.type || 'ALGORITHMIC');
                                        setPoints(item.maxScore || 0);
                                        setEditingId(id);
                                        setView('manual');
                                    }}
                                />
                            ));
                    })()}

                </div>
            </div>
        </div>
    );
};

const ChallengeItem = ({ id, title, subtitle, difficulty, color, aiGenerated, onDelete, onEdit }) => {
    const colorClasses = {
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20"
    };

    return (
        <div className="flex items-center justify-between p-4 bg-(--color-bg-input) rounded-lg border  hover:border-cyan-400/30 transition-all group spotlight-hover table-row-hover">
            <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
                    {difficulty}
                </span>
                <div>
                    <div className="flex items-center gap-2">
                        <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm font-medium  group-hover:text-cyan-400 transition-colors">{title}</p>
                        {aiGenerated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide">AI Generated</span>
                        )}
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-xs ">{subtitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button title="Edit" onClick={() => onEdit && onEdit(id)} className="action-btn action-btn-edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>
                <button title="Delete" onClick={() => onDelete && onDelete(id)} className="action-btn action-btn-delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Challenges;
