import React, { useState, useEffect, useCallback } from 'react';
import { aiService } from '../../services/aiService';
import { challengeService } from '../../services/challengeService';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];
const TOPICS = ['Arrays', 'Strings', 'Hash Table', 'Dynamic Programming', 'Graphs', 'Trees'];
const XP_MAP = { Easy: 50, Medium: 120, Hard: 250, Expert: 400 };
const TIME_MAP = { Easy: 15, Medium: 25, Hard: 40, Expert: 50 };
const DIFF_COLORS = {
    Easy: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
    Medium: { bg: 'rgba(250,204,21,0.1)', text: '#facc15', border: 'rgba(250,204,21,0.25)' },
    Hard: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
    Expert: { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.25)' },
};

const EMPTY_MANUAL = {
    title: '', description: '', difficulty: 'Medium', tags: [],
    constraints: [''], examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '' }], hints: [''],
    xpReward: 120, estimatedTime: 25, starterCode: { javascript: '' },
};

/* ═══════════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════════ */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    const c = type === 'success'
        ? { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', icon: '✓' }
        : { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', icon: '✕' };
    return (
        <div className="fixed top-6 right-6 z-50 animate-scale-in" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(12px)', maxWidth: '400px' }}>
            <span style={{ color: c.text, fontWeight: 700, fontSize: '16px' }}>{c.icon}</span>
            <span style={{ color: c.text, fontSize: '14px', fontWeight: 500 }}>{message}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   CONFIRM MODAL — fixed positioning, no scroll issue
   ═══════════════════════════════════════════════════════════════════ */
const ConfirmModal = ({ title, message, onConfirm, onClose }) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose} style={{ margin: 0, top: 0, left: 0, width: '100vw', height: '100vh' }}>
        <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-custom animate-scale-in text-center"
            onClick={e => e.stopPropagation()}>
            <div className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10">
                <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>{title}</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
            <div className="flex justify-center gap-3">
                <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg font-semibold"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    Delete
                </button>
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const Challenges = () => {
    const [view, setView] = useState('list'); // 'list' | 'ai' | 'manual'
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    // AI state
    const [aiForm, setAiForm] = useState({ description: '', difficulty: 'Medium', topic: 'Arrays', testCases: 5 });
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState('');
    const [publishing, setPublishing] = useState(false);

    // Manual state
    const [manualForm, setManualForm] = useState({ ...EMPTY_MANUAL });
    const [manualErrors, setManualErrors] = useState({});
    const [manualSaving, setManualSaving] = useState(false);

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchChallenges = useCallback(async () => {
        try {
            setLoading(true);
            const data = await challengeService.getAll({ search: searchQuery, difficulty: filterDifficulty });
            setChallenges(data.challenges || []);
        } catch (err) { console.error('Failed to fetch challenges:', err); }
        finally { setLoading(false); }
    }, [searchQuery, filterDifficulty]);

    useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

    // ── AI handlers ───────────────────────────────────────────────
    const handleAiFormChange = (f, v) => setAiForm(p => ({ ...p, [f]: v }));

    const handleGenerateAI = async () => {
        if (!aiForm.description || aiForm.description.trim().length < 10) {
            setAiError('Please provide a description of at least 10 characters.'); return;
        }
        setAiGenerating(true); setAiResult(null); setAiError('');
        try {
            const result = await aiService.generateChallenge({
                description: aiForm.description.trim(), difficulty: aiForm.difficulty,
                topic: aiForm.topic, testCases: Number(aiForm.testCases),
            });
            setAiResult(result);
        } catch (err) { setAiError(err.message || 'Something went wrong.'); }
        finally { setAiGenerating(false); }
    };

    const handleSaveAndPublish = async () => {
        if (!aiResult) return;
        setPublishing(true);
        try {
            const payload = {
                title: aiResult.title, description: aiResult.description, difficulty: aiForm.difficulty,
                tags: [aiForm.topic], constraints: aiResult.constraints || [], examples: aiResult.examples || [],
                testCases: aiResult.testCases || [], xpReward: XP_MAP[aiForm.difficulty] || 50,
                estimatedTime: TIME_MAP[aiForm.difficulty] || 15,
                starterCode: { javascript: `// Solution for: ${aiResult.title}\nfunction solution() {\n  // Write your code here\n}\n` },
                aiGenerated: true, status: 'published',
            };
            await challengeService.create(payload);
            setToast({ message: `"${aiResult.title}" published successfully!`, type: 'success' });
            setAiResult(null); setAiForm({ description: '', difficulty: 'Medium', topic: 'Arrays', testCases: 5 });
            setView('list'); fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to publish.', type: 'error' }); }
        finally { setPublishing(false); }
    };

    const handleSaveAsDraft = async () => {
        if (!aiResult) return;
        setPublishing(true);
        try {
            const payload = {
                title: aiResult.title, description: aiResult.description, difficulty: aiForm.difficulty,
                tags: [aiForm.topic], constraints: aiResult.constraints || [], examples: aiResult.examples || [],
                testCases: aiResult.testCases || [], xpReward: XP_MAP[aiForm.difficulty] || 50,
                estimatedTime: TIME_MAP[aiForm.difficulty] || 15, aiGenerated: true, status: 'draft',
            };
            await challengeService.create(payload);
            setToast({ message: `"${aiResult.title}" saved as draft.`, type: 'success' });
            setAiResult(null); fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to save draft.', type: 'error' }); }
        finally { setPublishing(false); }
    };

    // ── Manual handlers ───────────────────────────────────────────
    const updateManual = (field, value) => setManualForm(p => ({ ...p, [field]: value }));
    const updateManualArray = (field, idx, value) => {
        setManualForm(p => {
            const arr = [...p[field]]; arr[idx] = value; return { ...p, [field]: arr };
        });
    };
    const addManualArrayItem = (field, template) => setManualForm(p => ({ ...p, [field]: [...p[field], template] }));
    const removeManualArrayItem = (field, idx) => {
        setManualForm(p => ({ ...p, [field]: p[field].filter((_, i) => i !== idx) }));
    };

    const validateManual = () => {
        const errs = {};
        if (!manualForm.title.trim()) errs.title = 'Title is required';
        if (!manualForm.description.trim()) errs.description = 'Description is required';
        if (manualForm.testCases.length === 0) errs.testCases = 'At least 1 test case';
        for (const tc of manualForm.testCases) {
            if (!tc.input?.trim() || !tc.output?.trim()) { errs.testCases = 'All test cases need input & output'; break; }
        }
        setManualErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleManualSave = async (status) => {
        if (!validateManual()) return;
        setManualSaving(true);
        try {
            const payload = {
                title: manualForm.title.trim(), description: manualForm.description.trim(),
                difficulty: manualForm.difficulty, tags: manualForm.tags.length ? manualForm.tags : [TOPICS[0]],
                constraints: manualForm.constraints.filter(c => c.trim()),
                examples: manualForm.examples.filter(e => e.input.trim()),
                testCases: manualForm.testCases.filter(t => t.input.trim()),
                hints: manualForm.hints.filter(h => h.trim()),
                xpReward: manualForm.xpReward, estimatedTime: manualForm.estimatedTime,
                starterCode: manualForm.starterCode, aiGenerated: false, status,
            };
            await challengeService.create(payload);
            setToast({ message: `"${payload.title}" ${status === 'published' ? 'published' : 'saved as draft'}!`, type: 'success' });
            setManualForm({ ...EMPTY_MANUAL }); setView('list'); fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to save.', type: 'error' }); }
        finally { setManualSaving(false); }
    };

    // ── Toggle publish / Delete ───────────────────────────────────
    const handleTogglePublish = async (ch) => {
        try {
            if (ch.status === 'published') {
                await challengeService.unpublish(ch._id);
                setToast({ message: `"${ch.title}" unpublished.`, type: 'success' });
            } else {
                await challengeService.publish(ch._id);
                setToast({ message: `"${ch.title}" published!`, type: 'success' });
            }
            fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to update status.', type: 'error' }); }
    };

    const handleDeleteChallenge = (ch) => {
        setDeleteModal({
            title: 'Delete Challenge',
            message: `Are you sure you want to delete "${ch.title}"? This cannot be undone.`,
            onConfirm: async () => {
                try {
                    await challengeService.remove(ch._id);
                    setToast({ message: `"${ch.title}" deleted.`, type: 'success' });
                    fetchChallenges();
                } catch (err) { setToast({ message: err.message || 'Failed to delete.', type: 'error' }); }
                setDeleteModal(null);
            },
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {deleteModal && <ConfirmModal title={deleteModal.title} message={deleteModal.message}
                onConfirm={deleteModal.onConfirm} onClose={() => setDeleteModal(null)} />}

            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">Challenge Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Create and manage coding challenges with AI assistance or manually</p>
            </div>

            {/* ── Control Bar ──────────────────────────── */}
            <div className="glass-panel rounded-2xl p-4 mb-6 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative search-wrapper w-full">
                        <input type="text" placeholder="Search challenges..." className="search-input w-full"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="form-select w-full md:w-40 bg-(--color-bg-input)"
                        value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                        <option value="">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={() => setView(view === 'manual' ? 'list' : 'manual')}
                        className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${view === 'manual' ? 'ring-2 ring-green-400' : ''}`}>
                        {view === 'manual' ? <>Close Manual</> : (<>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Manually
                        </>)}
                    </button>
                    <button onClick={() => setView(view === 'ai' ? 'list' : 'ai')}
                        className={`btn-primary flex items-center gap-2 whitespace-nowrap ${view === 'ai' ? 'ring-2 ring-cyan-300' : ''}`}>
                        {view === 'ai' ? <>Close AI</> : (<>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Generate with AI
                        </>)}
                    </button>
                </div>
            </div>

            {/* ── Manual Creator ────────────────────────── */}
            {view === 'manual' && (
                <ManualChallengeForm form={manualForm} errors={manualErrors} saving={manualSaving}
                    onUpdate={updateManual} onUpdateArray={updateManualArray}
                    onAddItem={addManualArrayItem} onRemoveItem={removeManualArrayItem}
                    onSaveDraft={() => handleManualSave('draft')}
                    onSavePublish={() => handleManualSave('published')}
                    onCancel={() => { setManualForm({ ...EMPTY_MANUAL }); setView('list'); }} />
            )}

            {/* ── AI Generator ────────────────────────── */}
            {view === 'ai' && (
                <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">AI Challenge Generator</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            Powered by Groq AI
                        </span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Describe the challenge</label>
                            <textarea rows="4" placeholder="Example: Create a challenge about finding the longest palindromic substring..."
                                className="form-textarea w-full" value={aiForm.description}
                                onChange={e => handleAiFormChange('description', e.target.value)} disabled={aiGenerating} maxLength={500} />
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{aiForm.description.length}/500</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Difficulty</label>
                                <select className="form-select w-full" value={aiForm.difficulty}
                                    onChange={e => handleAiFormChange('difficulty', e.target.value)} disabled={aiGenerating}>
                                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Topic</label>
                                <select className="form-select w-full" value={aiForm.topic}
                                    onChange={e => handleAiFormChange('topic', e.target.value)} disabled={aiGenerating}>
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-2">Test Cases (max 10)</label>
                                <input type="number" min="1" max="10" value={aiForm.testCases}
                                    onChange={e => handleAiFormChange('testCases', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                                    className="form-input w-full" disabled={aiGenerating} />
                            </div>
                        </div>
                        {aiError && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{aiError}</span>
                            </div>
                        )}
                        <button onClick={handleGenerateAI} disabled={aiGenerating} className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
                            <span className="flex items-center justify-center gap-2">
                                {aiGenerating ? (<><div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>Generating with Groq AI...</>) : (<>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>Generate Challenge with AI</>)}
                            </span>
                        </button>
                        {aiResult && <AIResultCard aiResult={aiResult} aiForm={aiForm} publishing={publishing}
                            onPublish={handleSaveAndPublish} onSaveDraft={handleSaveAsDraft}
                            onRegenerate={handleGenerateAI} onDiscard={() => setAiResult(null)} aiGenerating={aiGenerating} />}
                    </div>
                </div>
            )}

            {/* ── Challenge List ───────────────────────── */}
            <div className="glass-panel rounded-2xl p-6 shadow-custom">
                <div className="flex items-center justify-between mb-6">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">
                        Challenges <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>({challenges.length})</span>
                    </h2>
                </div>
                {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-input)' }} />
                    ))}</div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">No challenges yet</p>
                        <p className="text-sm mt-1">Use the AI generator or create manually to add your first challenge.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {challenges.map(ch => (
                            <ChallengeRow key={ch._id} challenge={ch}
                                onTogglePublish={() => handleTogglePublish(ch)}
                                onDelete={() => handleDeleteChallenge(ch)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MANUAL CHALLENGE FORM
   ═══════════════════════════════════════════════════════════════════ */
const ManualChallengeForm = ({ form, errors, saving, onUpdate, onUpdateArray, onAddItem, onRemoveItem, onSaveDraft, onSavePublish, onCancel }) => {
    const tagInput = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (!form.tags.includes(tag)) onUpdate('tags', [...form.tags, tag]);
            e.target.value = '';
        }
    };
    return (
        <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">Create Challenge Manually</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">✎ Manual</span>
            </div>
            <div className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Title *</label>
                    <input className={`form-input w-full ${errors.title ? 'border-red-500' : ''}`} placeholder="e.g. Two Sum Advanced"
                        value={form.title} onChange={e => onUpdate('title', e.target.value)} />
                    {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
                </div>
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Description *</label>
                    <textarea rows="5" className={`form-textarea w-full ${errors.description ? 'border-red-500' : ''}`}
                        placeholder="Clear problem statement..." value={form.description} onChange={e => onUpdate('description', e.target.value)} />
                    {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
                </div>
                {/* Difficulty + XP + Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</label>
                        <select className="form-select w-full" value={form.difficulty}
                            onChange={e => { onUpdate('difficulty', e.target.value); onUpdate('xpReward', XP_MAP[e.target.value]); onUpdate('estimatedTime', TIME_MAP[e.target.value]); }}>
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>XP Reward</label>
                        <input type="number" min="0" className="form-input w-full" value={form.xpReward} onChange={e => onUpdate('xpReward', +e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Est. Time (min)</label>
                        <input type="number" min="1" className="form-input w-full" value={form.estimatedTime} onChange={e => onUpdate('estimatedTime', +e.target.value)} />
                    </div>
                </div>
                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Tags (press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {form.tags.map((t, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}>
                                {t}
                                <button onClick={() => onUpdate('tags', form.tags.filter((_, j) => j !== i))} className="hover:text-red-400">×</button>
                            </span>
                        ))}
                    </div>
                    <input className="form-input w-full" placeholder="e.g. Arrays" onKeyDown={tagInput} />
                </div>
                {/* Constraints */}
                <ArrayField label="Constraints" items={form.constraints} placeholder="e.g. 1 <= n <= 10^5"
                    onChange={(i, v) => onUpdateArray('constraints', i, v)}
                    onAdd={() => onAddItem('constraints', '')} onRemove={(i) => onRemoveItem('constraints', i)} />
                {/* Examples */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Examples</label>
                    {form.examples.map((ex, i) => (
                        <div key={i} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-cyan-400">Example {i + 1}</span>
                                {form.examples.length > 1 && <button onClick={() => onRemoveItem('examples', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                <input className="form-input w-full text-xs" placeholder="Input" value={ex.input}
                                    onChange={e => onUpdateArray('examples', i, { ...ex, input: e.target.value })} />
                                <input className="form-input w-full text-xs" placeholder="Output" value={ex.output}
                                    onChange={e => onUpdateArray('examples', i, { ...ex, output: e.target.value })} />
                            </div>
                            <input className="form-input w-full text-xs" placeholder="Explanation (optional)" value={ex.explanation}
                                onChange={e => onUpdateArray('examples', i, { ...ex, explanation: e.target.value })} />
                        </div>
                    ))}
                    <button onClick={() => onAddItem('examples', { input: '', output: '', explanation: '' })}
                        className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add Example</button>
                </div>
                {/* Test Cases */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Test Cases * {errors.testCases && <span className="text-red-400 text-xs ml-2">{errors.testCases}</span>}</label>
                    {form.testCases.map((tc, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <span className="text-xs font-bold text-cyan-400 shrink-0">#{i + 1}</span>
                            <input className="form-input flex-1 text-xs" placeholder="Input" value={tc.input}
                                onChange={e => onUpdateArray('testCases', i, { ...tc, input: e.target.value })} />
                            <input className="form-input flex-1 text-xs" placeholder="Output" value={tc.output}
                                onChange={e => onUpdateArray('testCases', i, { ...tc, output: e.target.value })} />
                            {form.testCases.length > 1 && <button onClick={() => onRemoveItem('testCases', i)} className="text-red-400 hover:text-red-300 text-xs">✕</button>}
                        </div>
                    ))}
                    <button onClick={() => onAddItem('testCases', { input: '', output: '' })}
                        className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add Test Case</button>
                </div>
                {/* Hints */}
                <ArrayField label="Hints (optional)" items={form.hints} placeholder="Hint text..."
                    onChange={(i, v) => onUpdateArray('hints', i, v)}
                    onAdd={() => onAddItem('hints', '')} onRemove={(i) => onRemoveItem('hints', i)} />
                {/* Starter Code */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Starter Code (JavaScript)</label>
                    <textarea rows="4" className="form-textarea w-full font-mono text-xs"
                        placeholder="function solution() {\n  // ...\n}" value={form.starterCode.javascript}
                        onChange={e => onUpdate('starterCode', { ...form.starterCode, javascript: e.target.value })} />
                </div>
                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={onSavePublish} disabled={saving}
                        className="flex-1 btn-primary disabled:opacity-60 flex items-center justify-center gap-2">
                        {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Save & Publish</>}
                    </button>
                    <button onClick={onSaveDraft} disabled={saving} className="btn-secondary disabled:opacity-60">Save Draft</button>
                    <button onClick={onCancel} disabled={saving} className="btn-secondary hover:text-red-400 disabled:opacity-60">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const ArrayField = ({ label, items, placeholder, onChange, onAdd, onRemove }) => (
    <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>{label}</label>
        {items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
                <input className="form-input flex-1 text-xs" placeholder={placeholder} value={item}
                    onChange={e => onChange(i, e.target.value)} />
                {items.length > 1 && <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-300 text-xs">✕</button>}
            </div>
        ))}
        <button onClick={onAdd} className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add</button>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   AI RESULT CARD
   ═══════════════════════════════════════════════════════════════════ */
const AIResultCard = ({ aiResult, aiForm, publishing, onPublish, onSaveDraft, onRegenerate, onDiscard, aiGenerating }) => {
    const dc = DIFF_COLORS[aiForm.difficulty] || DIFF_COLORS.Medium;
    return (
        <div className="mt-6 animate-fade-in-up rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(34,211,238,0.2)', background: 'var(--color-bg-card, var(--color-bg-input))' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.06))', borderBottom: '1px solid rgba(34,211,238,0.15)', padding: '20px 24px' }}>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-heading text-xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{aiResult.title}</h3>
                            <span style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>{aiForm.difficulty}</span>
                            <span style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '8px', padding: '2px 10px', fontSize: '12px', fontWeight: 500 }}>{aiForm.topic}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <span>⚡ {XP_MAP[aiForm.difficulty] || 50} XP</span>
                            <span>⏱ ~{TIME_MAP[aiForm.difficulty] || 15} min</span>
                            <span>📝 {aiResult.testCases?.length || 0} test cases</span>
                            <span className="inline-flex items-center gap-1 text-cyan-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                AI Generated
                            </span>
                        </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">✓ Ready</span>
                </div>
            </div>
            <div style={{ padding: '24px' }} className="space-y-6">
                <div><SectionLabel icon="📋" text="Problem Statement" />
                    <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{aiResult.description}</p></div>
                {aiResult.constraints?.length > 0 && (<div><SectionLabel icon="📐" text="Constraints" />
                    <div className="mt-2 space-y-1.5">{aiResult.constraints.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <span className="text-cyan-400 font-bold mt-px">›</span>
                            <code className="font-mono text-xs" style={{ background: 'var(--color-bg-input)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>{c}</code>
                        </div>))}</div></div>)}
                {aiResult.examples?.length > 0 && (<div><SectionLabel icon="💡" text={`Examples (${aiResult.examples.length})`} />
                    <div className="mt-3 space-y-3">{aiResult.examples.map((ex, i) => (
                        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)' }}>
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', background: 'rgba(34,211,238,0.04)' }}>
                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Example {i + 1}</span>
                            </div>
                            <div style={{ padding: '14px 16px' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <IOBlock label="Input" value={ex.input} color="var(--color-text-primary)" />
                                    <IOBlock label="Output" value={ex.output} color="#34d399" />
                                </div>
                                {ex.explanation && <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}><span className="font-semibold">↳</span> {ex.explanation}</p>}
                            </div>
                        </div>))}</div></div>)}
                {aiResult.testCases?.length > 0 && (<div><SectionLabel icon="🧪" text={`Test Cases (${aiResult.testCases.length})`} />
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">{aiResult.testCases.map((tc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg text-xs font-mono" style={{ background: 'var(--color-bg-sidebar)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-cyan-400 shrink-0">#{i + 1}</span>
                                <span className="truncate" style={{ color: 'var(--color-text-secondary)' }}>{tc.input}</span>
                            </div>
                            <span className="shrink-0 ml-2" style={{ color: '#34d399' }}>→ {tc.output}</span>
                        </div>))}</div></div>)}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', background: 'rgba(34,211,238,0.03)' }}>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={onPublish} disabled={publishing || aiGenerating} className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {publishing ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</>)
                            : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Save & Publish</>)}
                    </button>
                    <button onClick={onSaveDraft} disabled={publishing} className="btn-secondary disabled:opacity-60">Save Draft</button>
                    <button onClick={onRegenerate} disabled={publishing || aiGenerating} className="btn-secondary disabled:opacity-60">Regenerate</button>
                    <button onClick={onDiscard} disabled={publishing} className="btn-secondary hover:text-red-400 disabled:opacity-60">Discard</button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   CHALLENGE ROW
   ═══════════════════════════════════════════════════════════════════ */
const ChallengeRow = ({ challenge, onTogglePublish, onDelete }) => {
    const dc = DIFF_COLORS[challenge.difficulty] || DIFF_COLORS.Medium;
    const isPublished = challenge.status === 'published';
    return (
        <div className="flex items-center justify-between p-4 rounded-xl transition-all group spotlight-hover table-row-hover"
            style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-4 min-w-0">
                <span style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, borderRadius: '8px', padding: '3px 12px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {challenge.difficulty}
                </span>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors truncate" style={{ color: 'var(--color-text-secondary)' }}>{challenge.title}</p>
                        {challenge.aiGenerated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide shrink-0">AI</span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 ${isPublished ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                            {isPublished ? 'Published' : 'Draft'}
                        </span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {challenge.tags?.join(' • ')} • {challenge.xpReward || 0} XP
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button title={isPublished ? 'Unpublish' : 'Publish'} onClick={onTogglePublish}
                    className="action-btn action-btn-edit" style={{ color: isPublished ? '#facc15' : '#22c55e' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isPublished
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                    </svg>
                </button>
                <button title="Delete" onClick={onDelete} className="action-btn action-btn-delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

/* ── Small Helpers ─────────────────────────────────────────────── */
const SectionLabel = ({ icon, text }) => (
    <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{text}</span>
    </div>
);

const IOBlock = ({ label, value, color }) => (
    <div>
        <span className="text-xs font-semibold block mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <code className="text-xs font-mono block p-2.5 rounded-lg" style={{ background: 'var(--color-bg-input)', color, border: '1px solid var(--color-border)' }}>{value}</code>
    </div>
);

export default Challenges;
