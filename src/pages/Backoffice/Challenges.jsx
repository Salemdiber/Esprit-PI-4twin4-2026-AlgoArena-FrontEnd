import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { challengeService } from '../../services/challengeService';
import { importChallengeFile } from '../../services/challengeImporter';
import { aiService } from '../../services/aiService';
import ActionButton from '../../components/ActionButton';
import {
    AlertTriangle,
    Bot,
    BrainCircuit,
    Check,
    Eye,
    EyeOff,
    FileSpreadsheet,
    FileUp,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    Upload,
    WandSparkles,
    X,
} from 'lucide-react';


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
    title: '', description: '', difficulty: 'Medium', topic: 'Arrays',
    constraints: [''], examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '' }], hints: [''],
    xpReward: 120, estimatedTime: 25, starterCode: { javascript: '' },
};

const ACTION_ICON_BUTTON = 'inline-flex items-center gap-2 rounded-lg text-[13px] font-semibold transition-all duration-200';
const ACTION_COMPACT_STYLE = {
    height: '38px',
    minHeight: '38px',
    padding: '0.4rem 0.75rem',
    width: 'fit-content',
    minWidth: '0',
    flex: '0 0 auto',
};

/* ═══════════════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════════════ */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    const c = type === 'success'
        ? { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e', icon: Check }
        : { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', icon: X };
    const Icon = c.icon;
    return (
        <div className="fixed top-6 right-6 z-50 animate-scale-in" style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(12px)', maxWidth: '400px' }}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ color: c.text, background: 'rgba(15,23,42,0.08)' }}>
                <Icon size={16} strokeWidth={2.4} />
            </span>
            <span style={{ color: c.text, fontSize: '14px', fontWeight: 500 }}>{message}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   CONFIRM MODAL — fixed positioning, no scroll issue
   ═══════════════════════════════════════════════════════════════════ */
const ConfirmModal = ({ title, message, onConfirm, onClose }) => {
    useEffect(() => {
        const { body } = document;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, []);

    return createPortal((
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in"
                style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: '0 26px 56px rgba(2, 6, 23, 0.45)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.24)' }}>
                    <AlertTriangle size={22} strokeWidth={2.2} className="text-red-400" />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>{title}</h2>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{message}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                    <button
                        onClick={onConfirm}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                        style={{ background: 'rgba(239,68,68,0.16)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)' }}
                    >
                        <Trash2 size={14} strokeWidth={2.2} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    ), document.body);
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const Challenges = () => {
    const [view, setView] = useState('list'); // 'list' | 'ai' | 'manual'
    const [challenges, setChallenges] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [toast, setToast] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [previewForm, setPreviewForm] = useState(null); // for preview modal

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
    const [importHighlight, setImportHighlight] = useState({});
    const [importErrors, setImportErrors] = useState([]);
    const [editingDraftId, setEditingDraftId] = useState(null); // ID of draft being edited
    const fileInputRef = useRef(null);

    // AI Assist removed from manual flow — manual creation is 100% manual

    // ── Fetch ─────────────────────────────────────────────────────
    const fetchChallenges = useCallback(async () => {
        try {
            setLoading(true);
            const data = await challengeService.getAll({ search: searchQuery, difficulty: filterDifficulty });
            const all = data.challenges || [];
            setDrafts(all.filter(c => c.status !== 'published'));
            setChallenges(all.filter(c => c.status === 'published'));
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

    const handleSaveAndPublish = async (draft) => {
        const result = draft || aiResult;
        if (!result) return;
        setPublishing(true);
        try {
            const payload = {
                title: result.title, description: result.description, difficulty: aiForm.difficulty,
                tags: [aiForm.topic], constraints: result.constraints || [], examples: result.examples || [],
                testCases: result.testCases || [], xpReward: XP_MAP[aiForm.difficulty] || 50,
                estimatedTime: TIME_MAP[aiForm.difficulty] || 15,
                starterCode: result.starterCode || { javascript: `// Solution for: ${result.title}\nfunction solution() {\n  // Write your code here\n}\n` },
                aiGenerated: true, status: 'published',
            };
            await challengeService.create(payload);
            setToast({ message: `"${result.title}" published successfully!`, type: 'success' });
            setAiResult(null); setAiForm({ description: '', difficulty: 'Medium', topic: 'Arrays', testCases: 5 });
            setView('list'); fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to publish.', type: 'error' }); }
        finally { setPublishing(false); }
    };

    const handleSaveAsDraft = async (draft) => {
        const result = draft || aiResult;
        if (!result) return;
        setPublishing(true);
        try {
            const payload = {
                title: result.title, description: result.description, difficulty: aiForm.difficulty,
                tags: [aiForm.topic], constraints: result.constraints || [], examples: result.examples || [],
                testCases: result.testCases || [], xpReward: XP_MAP[aiForm.difficulty] || 50,
                estimatedTime: TIME_MAP[aiForm.difficulty] || 15,
                starterCode: result.starterCode || { javascript: '' },
                aiGenerated: true, status: 'draft',
            };
            await challengeService.create(payload);
            setToast({ message: `"${result.title}" saved as draft.`, type: 'success' });
            setAiResult(null); fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to save draft.', type: 'error' }); }
        finally { setPublishing(false); }
    };

    // ── Import handler ────────────────────────────────────────────
    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const { data, errors } = await importChallengeFile(file);
        if (errors.length > 0) setImportErrors(errors);
        else setImportErrors([]);
        if (data) {
            setManualForm(prev => ({ ...prev, ...data }));
            const hl = {};
            Object.keys(data).forEach(k => { if (data[k] && (typeof data[k] === 'string' ? data[k].trim() : true)) hl[k] = true; });
            setImportHighlight(hl);
            setTimeout(() => setImportHighlight({}), 4000);
            if (!errors.length) setToast({ message: `Imported "${data.title || 'challenge'}" successfully!`, type: 'success' });
            setView('manual');
        }
    };


    // ── Edit draft ─────────────────────────────────────────────
    const handleEditDraft = (ch) => {
        // Map the existing draft back into the manual form
        setManualForm({
            title: ch.title || '',
            description: ch.description || '',
            difficulty: ch.difficulty || 'Medium',
            topic: ch.tags?.[0] || 'Arrays',
            constraints: ch.constraints?.length ? ch.constraints : [''],
            examples: ch.examples?.length ? ch.examples : [{ input: '', output: '', explanation: '' }],
            testCases: ch.testCases?.length ? ch.testCases : [{ input: '', output: '' }],
            hints: ch.hints?.length ? ch.hints : [''],
            xpReward: ch.xpReward || XP_MAP[ch.difficulty] || 120,
            estimatedTime: ch.estimatedTime || TIME_MAP[ch.difficulty] || 25,
            starterCode: ch.starterCode || { javascript: '' },
        });
        setEditingDraftId(ch._id);
        setManualErrors({});
        setImportErrors([]);
        setView('manual');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ── Manual save (create or update draft) ───────────────────
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
        const validTcs = manualForm.testCases.filter(tc => tc.input?.trim() && tc.output?.trim());
        if (validTcs.length === 0) errs.testCases = 'At least 1 complete test case (input & output) required';
        else if (manualForm.testCases.length > 10) errs.testCases = 'Max 10 test cases';
        setManualErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleManualSave = async (status) => {
        if (!validateManual()) return;
        setManualSaving(true);
        try {
            const payload = {
                title: manualForm.title.trim(), description: manualForm.description.trim(),
                difficulty: manualForm.difficulty, tags: [manualForm.topic],
                constraints: manualForm.constraints.filter(c => c.trim()),
                examples: manualForm.examples.filter(e => e.input.trim()),
                testCases: manualForm.testCases.filter(t => t.input.trim()),
                hints: manualForm.hints.filter(h => h.trim()),
                xpReward: manualForm.xpReward, estimatedTime: manualForm.estimatedTime,
                starterCode: manualForm.starterCode, aiGenerated: false, status,
            };
            if (editingDraftId) {
                await challengeService.update(editingDraftId, payload);
                setToast({ message: `"${payload.title}" ${status === 'published' ? 'published' : 'updated'}!`, type: 'success' });
            } else {
                await challengeService.create(payload);
                setToast({ message: `"${payload.title}" ${status === 'published' ? 'published' : 'saved as draft'}!`, type: 'success' });
            }
            setManualForm({ ...EMPTY_MANUAL }); setEditingDraftId(null); setView('list'); fetchChallenges();
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

    const handlePublishDraft = async (ch) => {
        try {
            await challengeService.publish(ch._id);
            setToast({ message: `"${ch.title}" published successfully!`, type: 'success' });
            fetchChallenges();
        } catch (err) { setToast({ message: err.message || 'Failed to publish.', type: 'error' }); }
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
            {previewForm && typeof previewForm === 'object' && 'difficulty' in previewForm && (
                <PreviewModal form={previewForm} onClose={() => setPreviewForm(null)}
                    onPublish={() => { setPreviewForm(null); handleManualSave('published'); }} />
            )}

            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">Challenge Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Create and manage coding challenges with AI assistance or manually</p>
            </div>

            {/* ── Control Bar ──────────────────────────── */}
            <div className="glass-panel rounded-2xl p-4 mb-6 shadow-custom">
                {/* Row 1 — Search + Difficulty filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <div className="flex-1 relative search-wrapper">
                        <input type="text" placeholder="Search challenges..." className="search-input w-full"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="form-select sm:w-44 bg-(--color-bg-input)"
                        value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                        <option value="">All Difficulties</option>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                {/* Row 2 — Action buttons (wrap on mobile) */}
                <input type="file" ref={fileInputRef} className="hidden" accept=".json,.xlsx,.xls" onChange={handleImportFile} />
                <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                    {/* Import */}
                    <div className="flex flex-col gap-1">
                        <button onClick={() => fileInputRef.current?.click()}
                            className={`${ACTION_ICON_BUTTON} btn-secondary group/imp justify-start whitespace-nowrap`}
                            style={{ ...ACTION_COMPACT_STYLE, transition: 'all 0.2s ease', borderColor: 'rgba(96,165,250,0.28)', background: 'linear-gradient(180deg, rgba(96,165,250,0.12), rgba(96,165,250,0.04))' }}>
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-transform group-hover/imp:scale-105" style={{ borderColor: 'rgba(96,165,250,0.24)', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                                <FileUp size={14} strokeWidth={2.2} />
                            </span>
                            <span className="flex min-w-0 flex-col items-start text-left">
                                <span>Import Challenges</span>
                                <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>JSON or Excel challenge packs</span>
                            </span>
                        </button>
                        <p className="px-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Supports structured `.json`, `.xlsx`, and `.xls` files that match the challenge schema.
                        </p>
                    </div>

                    {/* Create Manually */}
                    <button onClick={() => { setView(view === 'manual' ? 'list' : 'manual'); setImportErrors([]); }}
                        className={`${ACTION_ICON_BUTTON} whitespace-nowrap ${view === 'manual' ? 'ring-2 ring-green-400' : ''}`}
                        style={{
                            ...ACTION_COMPACT_STYLE,
                            background: view === 'manual'
                                ? 'linear-gradient(180deg, rgba(34,197,94,0.22), rgba(34,197,94,0.12))'
                                : 'linear-gradient(180deg, rgba(34,197,94,0.16), rgba(34,197,94,0.08))',
                            color: '#dcfce7',
                            border: '1px solid rgba(34,197,94,0.3)',
                            boxShadow: '0 10px 30px rgba(34,197,94,0.12)',
                        }}>
                        {view === 'manual' ? (
                            <>
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: 'rgba(220,252,231,0.18)', background: 'rgba(255,255,255,0.08)' }}>
                                    <X size={14} strokeWidth={2.2} />
                                </span>
                                <span>Close Manual</span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: 'rgba(220,252,231,0.18)', background: 'rgba(255,255,255,0.08)' }}>
                                    <Plus size={14} strokeWidth={2.2} />
                                </span>
                                <span className="flex min-w-0 flex-col items-start text-left">
                                    <span>Create Manually</span>
                                    <span className="text-[10px] font-medium text-green-100/80">Primary admin workflow</span>
                                </span>
                            </>
                        )}
                    </button>

                    {/* Generate with AI */}
                    <button onClick={() => setView(view === 'ai' ? 'list' : 'ai')}
                        className={`${ACTION_ICON_BUTTON} btn-primary whitespace-nowrap ${view === 'ai' ? 'ring-2 ring-cyan-300' : ''}`}
                        style={ACTION_COMPACT_STYLE}>
                        {view === 'ai' ? (
                            <>
                                <Bot size={14} strokeWidth={2.2} />
                                <span>Close AI</span>
                            </>
                        ) : (
                            <>
                                <WandSparkles size={14} strokeWidth={2.2} />
                                <span>Generate with AI</span>
                            </>
                        )}
                    </button>
                </div>
            </div>


            {/* ── Manual Creator ────────────────────────── */}
            {importErrors.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm mb-4 animate-fade-in-up">
                    <div className="flex items-center gap-2 font-semibold mb-1"><AlertTriangle size={16} strokeWidth={2.2} />Import Warnings</div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">{importErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                </div>
            )}
            {view === 'manual' && (
                <ManualChallengeForm form={manualForm} errors={manualErrors} saving={manualSaving}
                    onUpdate={updateManual} onUpdateArray={updateManualArray}
                    onAddItem={addManualArrayItem} onRemoveItem={removeManualArrayItem}
                    onSaveDraft={() => handleManualSave('draft')}
                    onSavePublish={() => handleManualSave('published')}
                    onPreview={() => setPreviewForm(JSON.parse(JSON.stringify(manualForm)))}
                    onCancel={() => { setManualForm({ ...EMPTY_MANUAL }); setEditingDraftId(null); setImportErrors([]); setView('list'); }}
                    highlight={importHighlight} editingDraftId={editingDraftId} />
            )}

            {/* ── AI Generator ────────────────────────── */}
            {view === 'ai' && (
                <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                        <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">AI Challenge Generator</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            Powered by the AlgoArena Experts
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
                                </div>Generating...</>) : (<>
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

            {/* ── Draft Challenges Section ───────────────────────── */}
            {drafts.length > 0 && (
                <div className="glass-panel rounded-2xl p-6 shadow-custom" style={{ border: '1px solid rgba(250,204,21,0.2)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(250,204,21,0.1)' }}>
                                <svg className="w-4 h-4" fill="none" stroke="#facc15" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--color-text-heading)' }}>
                                Draft Challenges <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>({drafts.length})</span>
                            </h2>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)' }}>Not visible to users</span>
                    </div>
                    <div className="space-y-2">
                        {drafts.map(ch => (
                            <DraftRow key={ch._id} challenge={ch}
                                onEdit={handleEditDraft}
                                onPublish={() => handlePublishDraft(ch)}
                                onDelete={() => handleDeleteChallenge(ch)} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Published Challenges List ───────────────────────── */}
            <div className="glass-panel rounded-2xl p-6 shadow-custom">
                <div className="flex items-center justify-between mb-6">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">
                        Published <span className="ml-2 text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>({challenges.length})</span>
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
                        <p className="font-medium">No published challenges yet</p>
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
   PREVIEW MODAL — full challenge preview before publish
   ═══════════════════════════════════════════════════════════════════ */
const PreviewModal = ({ form, onClose, onPublish }) => {
    useEffect(() => {
        const { body } = document;
        const previousOverflow = body.style.overflow;
        const previousPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPaddingRight;
        };
    }, []);

    // Guard: form must be a valid challenge object
    const isValidChallenge = (
        form &&
        typeof form === 'object' &&
        typeof form.title === 'string' &&
        typeof form.description === 'string' &&
        typeof form.difficulty === 'string' &&
        DIFF_COLORS[form.difficulty]
    );

    if (!isValidChallenge) {
        return createPortal((
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                onClick={onClose}>
                <div className="w-full max-w-sm mx-4 rounded-2xl p-8 text-center animate-scale-in"
                    style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                    onClick={e => e.stopPropagation()}>
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ background: 'rgba(148,163,184,0.12)', borderColor: 'rgba(148,163,184,0.24)', color: '#94a3b8' }}>
                            <FileSpreadsheet size={24} strokeWidth={2.1} />
                        </div>
                    </div>
                    <p className="font-semibold mb-2" style={{ color: 'var(--color-text-heading)' }}>No preview data available</p>
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                        Please fill in the Title, Description, and at least one Test Case before previewing.
                    </p>
                    <button onClick={onClose} className="btn-secondary">Back to Form</button>
                </div>
            </div>
        ), document.body);
    }

    const dc = DIFF_COLORS[form.difficulty];
    return createPortal((
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm"
            onClick={onClose}>
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col"
                style={{ height: 'min(88vh, 920px)', background: 'var(--color-bg-card, var(--color-bg-sidebar))', border: '1px solid var(--color-border)' }}
                onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 shrink-0"
                    style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-elevated, var(--color-bg-sidebar))' }}>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ background: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)', color: '#67e8f9' }}>
                            <Eye size={18} strokeWidth={2.1} />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text-heading)' }}>Challenge Preview</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>As seen in Front Office</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}><X size={16} strokeWidth={2.3} /></button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">
                    {/* Title + Badges */}
                    <div>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                            <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>{form.title || 'Untitled Challenge'}</h1>
                            <span style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, borderRadius: '8px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>{form.difficulty}</span>
                            <span style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '3px 10px', fontSize: '12px' }}>{form.topic}</span>
                        </div>
                        <div className="flex items-center gap-5 text-sm flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="inline-flex items-center gap-1.5"><Sparkles size={14} strokeWidth={2.1} />{form.xpReward} XP</span>
                            <span className="inline-flex items-center gap-1.5"><BrainCircuit size={14} strokeWidth={2.1} />~{form.estimatedTime} min</span>
                            <span className="inline-flex items-center gap-1.5"><FileSpreadsheet size={14} strokeWidth={2.1} />{form.testCases?.filter(t => t.input || t.output).length || 0} test cases</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Problem Statement</p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{form.description || <span className="opacity-40 italic">No description provided</span>}</p>
                    </div>

                    {/* Constraints */}
                    {form.constraints?.filter(c => c.trim()).length > 0 && (
                        <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Constraints</p>
                            <ul className="space-y-1.5">
                                {form.constraints.filter(c => c.trim()).map((c, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-cyan-400 font-bold mt-px shrink-0">›</span>
                                        <code className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>{c}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Examples */}
                    {form.examples?.filter(e => e.input || e.output).length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Examples</p>
                            <div className="space-y-3">
                                {form.examples.filter(e => e.input || e.output).map((ex, i) => (
                                    <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
                                        <div className="px-4 py-2 text-xs font-bold text-cyan-400 uppercase tracking-wider" style={{ background: 'rgba(6,182,212,0.05)', borderBottom: '1px solid var(--color-border)' }}>Example {i + 1}</div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500 mb-1 font-semibold">INPUT</p>
                                                <code className="text-xs font-mono" style={{ color: 'var(--color-text-primary)' }}>{ex.input}</code>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-green-500 mb-1 font-semibold">OUTPUT</p>
                                                <code className="text-xs font-mono text-green-400">{ex.output}</code>
                                            </div>
                                        </div>
                                        {ex.explanation && <div className="px-4 pb-3 text-xs" style={{ color: 'var(--color-text-muted)' }}><span className="font-semibold">↳</span> {ex.explanation}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Test Cases */}
                    {form.testCases?.filter(t => t.input || t.output).length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Test Cases</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {form.testCases.filter(t => t.input || t.output).map((tc, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg text-xs font-mono" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                                        <span className="font-bold text-cyan-400 shrink-0">#{i + 1}</span>
                                        <span className="truncate flex-1" style={{ color: 'var(--color-text-secondary)' }}>{tc.input}</span>
                                        <span className="shrink-0 text-green-400">→ {tc.output}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Hints */}
                    {form.hints?.filter(h => h.trim()).length > 0 && (
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-3 text-yellow-400">Hints</p>
                            {form.hints.filter(h => h.trim()).map((h, i) => (
                                <p key={i} className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}><span className="text-yellow-400 font-bold">{i + 1}.</span> {h}</p>
                            ))}
                        </div>
                    )}

                    {/* Starter Code */}
                    {form.starterCode?.javascript?.trim() && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>{'</>'} Starter Code</p>
                            <pre className="text-xs font-mono p-4 rounded-xl overflow-x-auto" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>{form.starterCode.javascript}</pre>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={onPublish} className="flex-1 btn-primary flex items-center justify-center gap-2">
                        <Check size={16} strokeWidth={2.3} />
                        Looks Good — Save & Publish
                    </button>
                    <button onClick={onClose} className="btn-secondary">Back to Edit</button>
                </div>
            </div>
        </div>
    ), document.body);
};

/* ═══════════════════════════════════════════════════════════════════
   DRAFT ROW — shown in the Draft Challenges section
   ═══════════════════════════════════════════════════════════════════ */
const DraftRow = ({ challenge: ch, onPublish, onDelete, onEdit }) => {
    const dc = DIFF_COLORS[ch.difficulty] || DIFF_COLORS.Medium;
    return (
        <div className="flex flex-col gap-3 p-4 rounded-xl transition-all sm:flex-row sm:items-center sm:gap-4"
            style={{ background: 'var(--color-bg-input)', border: '1px solid rgba(250,204,21,0.15)' }}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{ch.title}</span>
                    <span style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, borderRadius: '6px', padding: '1px 8px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>{ch.difficulty}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' }}>DRAFT</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{ch.tags?.[0] || 'General'}</span>
                    {ch.updatedAt && <span>Updated {new Date(ch.updatedAt).toLocaleDateString()}</span>}
                        {ch.testCases?.length > 0 && <span className="inline-flex items-center gap-1"><FileSpreadsheet size={12} strokeWidth={2.1} />{ch.testCases.length} tests</span>}
                </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 shrink-0 sm:w-auto sm:justify-end">
                <ActionButton label="Edit" tone="blue" icon={Pencil} onClick={() => onEdit(ch)} />
                <ActionButton label="Publish" tone="green" icon={Upload} onClick={onPublish} />
                <ActionButton label="Delete" tone="red" icon={Trash2} onClick={onDelete} />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   MANUAL CHALLENGE FORM
   ═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
   AI ASSIST BUTTON — modern branded
   ═══════════════════════════════════════════════════════════════════ */
const AiAssistBtn = ({ section, ready, loading, onAssist }) => (
    <div className="relative group/ai inline-block">
        <button
            onClick={() => onAssist(section)}
            disabled={!ready || loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
                background: ready ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.1))' : 'rgba(100,116,139,0.1)',
                color: ready ? '#67e8f9' : 'var(--color-text-muted)',
                border: ready ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--color-border)',
                boxShadow: ready ? '0 0 8px rgba(6,182,212,0.1)' : 'none',
                transform: 'translateY(0)',
            }}
        >
            {loading ? (
                <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
            )}
            <span>AI Assist</span>
        </button>
        {/* Tooltip */}
        {ready && !loading && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/ai:opacity-100 transition-opacity duration-150 z-10"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                Generate {section} with AI
            </div>
        )}
    </div>
);

const SectionHeader = ({ label, required, error, highlight }) => (
    <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}{required && ' *'}</label>
        {error && <span className="text-red-400 text-xs">{error}</span>}
        {highlight && <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-semibold animate-pulse"><Check size={12} strokeWidth={2.4} />imported</span>}
    </div>
);

const ManualChallengeForm = ({ form, errors, saving, onUpdate, onUpdateArray, onAddItem, onRemoveItem, onSaveDraft, onSavePublish, onCancel, onPreview, highlight = {}, editingDraftId }) => {
    const [collapsed, setCollapsed] = useState({});
    const toggle = (s) => setCollapsed(p => ({ ...p, [s]: !p[s] }));

    const hlStyle = (field) => highlight[field] ? { boxShadow: '0 0 0 2px rgba(34,197,94,0.4)', transition: 'box-shadow 0.5s ease' } : {};

    return (
        <div className="glass-panel rounded-2xl p-6 shadow-custom mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-xl font-bold">
                        {editingDraftId ? 'Edit Draft' : 'Create Challenge'}
                    </h2>
                    {editingDraftId && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.25)' }}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Editing Draft
                        </span>
                    )}
                </div>
                {!editingDraftId && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">✎ Manual</span>
                )}
            </div>

            <div className="space-y-5">
                {/* ── STEP 1: Basic Fields ── */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-sidebar)', border: '1px solid var(--color-border)' }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>Step 1 — Basic Information</div>
                    <div className="space-y-4">
                        <div style={hlStyle('title')}>
                            <SectionHeader label="Title" required error={errors.title} />
                            <input className={`form-input w-full ${errors.title ? 'border-red-500' : ''}`} placeholder="e.g. Two Sum Advanced"
                                value={form.title} onChange={e => onUpdate('title', e.target.value)} />
                        </div>
                        <div style={hlStyle('description')}>
                            <SectionHeader label="Description" required error={errors.description} />
                            <textarea rows="4" className={`form-textarea w-full ${errors.description ? 'border-red-500' : ''}`}
                                placeholder="Clear problem statement..." value={form.description} onChange={e => onUpdate('description', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={hlStyle('difficulty')}>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Difficulty</label>
                                <select className="form-select w-full" value={form.difficulty}
                                    onChange={e => { onUpdate('difficulty', e.target.value); onUpdate('xpReward', XP_MAP[e.target.value]); onUpdate('estimatedTime', TIME_MAP[e.target.value]); }}>
                                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Topic</label>
                                <select className="form-select w-full" value={form.topic} onChange={e => onUpdate('topic', e.target.value)}>
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
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
                    </div>
                </div>

                {/* ── STEP 2: Challenge Details (collapsible) ── */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-sidebar)', border: '1px solid var(--color-border)' }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--color-text-muted)' }}>Step 2 — Challenge Details</div>

                    {/* Constraints */}
                    <div className="mb-4" style={hlStyle('constraints')}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle('constraints')}>
                            <SectionHeader label="Constraints" highlight={highlight.constraints} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{collapsed.constraints ? '▸' : '▾'}</span>
                        </div>
                        {!collapsed.constraints && <ArrayField items={form.constraints} placeholder="e.g. 1 <= n <= 10^5"
                            onChange={(i, v) => onUpdateArray('constraints', i, v)}
                            onAdd={() => onAddItem('constraints', '')} onRemove={(i) => onRemoveItem('constraints', i)} />}
                    </div>

                    {/* Examples */}
                    <div className="mb-4" style={hlStyle('examples')}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle('examples')}>
                            <SectionHeader label="Examples" highlight={highlight.examples} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{collapsed.examples ? '▸' : '▾'}</span>
                        </div>
                        {!collapsed.examples && (<>
                            {form.examples.map((ex, i) => (
                                <div key={i} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-cyan-400">Example {i + 1}</span>
                                        {form.examples.length > 1 && <button onClick={() => onRemoveItem('examples', i)} className="text-xs text-red-400 hover:text-red-300">Remove</button>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                        <input className="form-input w-full text-xs" placeholder="Input" value={ex.input} onChange={e => onUpdateArray('examples', i, { ...ex, input: e.target.value })} />
                                        <input className="form-input w-full text-xs" placeholder="Output" value={ex.output} onChange={e => onUpdateArray('examples', i, { ...ex, output: e.target.value })} />
                                    </div>
                                    <input className="form-input w-full text-xs" placeholder="Explanation (optional)" value={ex.explanation} onChange={e => onUpdateArray('examples', i, { ...ex, explanation: e.target.value })} />
                                </div>
                            ))}
                            <button onClick={() => onAddItem('examples', { input: '', output: '', explanation: '' })} className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add Example</button>
                        </>)}
                    </div>

                    {/* Test Cases */}
                    <div className="mb-4" style={hlStyle('testCases')}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle('testCases')}>
                            <SectionHeader label="Test Cases" required error={errors.testCases} highlight={highlight.testCases} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{collapsed.testCases ? '▸' : '▾'}</span>
                        </div>
                        {!collapsed.testCases && (<>
                            {form.testCases.map((tc, i) => (
                                <div key={i} className="flex gap-2 mb-2 items-center">
                                    <span className="text-xs font-bold text-cyan-400 shrink-0">#{i + 1}</span>
                                    <input className="form-input flex-1 text-xs" placeholder="Input" value={tc.input} onChange={e => onUpdateArray('testCases', i, { ...tc, input: e.target.value })} />
                                    <input className="form-input flex-1 text-xs" placeholder="Output" value={tc.output} onChange={e => onUpdateArray('testCases', i, { ...tc, output: e.target.value })} />
                                    {form.testCases.length > 1 && <button onClick={() => onRemoveItem('testCases', i)} className="text-red-400 hover:text-red-300 text-xs"><X size={14} strokeWidth={2.3} /></button>}
                                </div>
                            ))}
                            {form.testCases.length < 10 && <button onClick={() => onAddItem('testCases', { input: '', output: '' })} className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add Test Case</button>}
                        </>)}
                    </div>

                    {/* Hints */}
                    <div className="mb-4" style={hlStyle('hints')}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle('hints')}>
                            <SectionHeader label="Hints" highlight={highlight.hints} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{collapsed.hints ? '▸' : '▾'}</span>
                        </div>
                        {!collapsed.hints && <ArrayField items={form.hints} placeholder="Hint text..."
                            onChange={(i, v) => onUpdateArray('hints', i, v)}
                            onAdd={() => onAddItem('hints', '')} onRemove={(i) => onRemoveItem('hints', i)} />}
                    </div>

                    {/* Starter Code */}
                    <div style={hlStyle('starterCode')}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggle('starterCode')}>
                            <SectionHeader label="Starter Code (JavaScript)" highlight={highlight.starterCode} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{collapsed.starterCode ? '▸' : '▾'}</span>
                        </div>
                        {!collapsed.starterCode && <textarea rows="4" className="form-textarea w-full font-mono text-xs"
                            placeholder="function solution() {\n  // ...\n}" value={form.starterCode.javascript}
                            onChange={e => onUpdate('starterCode', { ...form.starterCode, javascript: e.target.value })} />}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={onPreview} disabled={saving} title="Preview before publishing"
                        className="btn-secondary disabled:opacity-60 flex items-center gap-2 hover:border-cyan-400/50"
                        style={{ transition: 'all 0.2s' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Preview
                    </button>
                    <button onClick={onSavePublish} disabled={saving} className="flex-1 btn-primary disabled:opacity-60 flex items-center justify-center gap-2">
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

const ArrayField = ({ items, placeholder, onChange, onAdd, onRemove }) => (
    <div>
        {items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
                <input className="form-input flex-1 text-xs" placeholder={placeholder} value={item}
                    onChange={e => onChange(i, e.target.value)} />
                {items.length > 1 && <button onClick={() => onRemove(i)} className="text-red-400 hover:text-red-300 text-xs"><X size={14} strokeWidth={2.3} /></button>}
            </div>
        ))}
        <button onClick={onAdd} className="text-xs text-cyan-400 hover:text-cyan-300 mt-1">+ Add</button>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   AI RESULT CARD — Editable Preview Panel
   Admin must explicitly confirm before saving. No auto-publish.
   ═══════════════════════════════════════════════════════════════════ */
const AIResultCard = ({ aiResult, aiForm, publishing, onPublish, onSaveDraft, onRegenerate, onDiscard, aiGenerating }) => {
    const dc = DIFF_COLORS[aiForm.difficulty] || DIFF_COLORS.Medium;
    // Local editable copy
    const [draft, setDraft] = useState({ ...aiResult });
    const updateDraft = (field, val) => setDraft(p => ({ ...p, [field]: val }));
    const updateDraftTc = (i, key, val) => setDraft(p => {
        const arr = [...p.testCases]; arr[i] = { ...arr[i], [key]: val }; return { ...p, testCases: arr };
    });
    const updateDraftEx = (i, key, val) => setDraft(p => {
        const arr = [...p.examples]; arr[i] = { ...arr[i], [key]: val }; return { ...p, examples: arr };
    });
    const updateDraftConstraint = (i, val) => setDraft(p => {
        const arr = [...p.constraints]; arr[i] = val; return { ...p, constraints: arr };
    });
    // Pass edited draft back to parent handlers
    const handlePublish = () => onPublish(draft);
    const handleDraft = () => onSaveDraft(draft);

    return (
        <div className="mt-6 animate-fade-in-up rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(6,182,212,0.25)', background: 'var(--color-bg-card, var(--color-bg-input))' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.06))', borderBottom: '1px solid rgba(6,182,212,0.15)', padding: '16px 24px' }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} strokeWidth={2.1} color="#67e8f9" />
                            <span className="text-xs font-semibold" style={{ color: '#67e8f9' }}>AI Generated Preview</span>
                        </div>
                        <span style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`, borderRadius: '8px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>{aiForm.difficulty}</span>
                        <span style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '2px 10px', fontSize: '11px' }}>{aiForm.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}><Sparkles size={13} strokeWidth={2.1} />{XP_MAP[aiForm.difficulty]} XP</span>
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}><BrainCircuit size={13} strokeWidth={2.1} />~{TIME_MAP[aiForm.difficulty]} min</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Eye size={12} strokeWidth={2.2} />Editable</span>
                    </div>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>Review and edit the generated content before saving. Changes are applied before submission.</p>
            </div>

            {/* Editable Body */}
            <div className="p-6 space-y-5" style={{ maxHeight: '65vh', overflowY: 'auto' }}>

                {/* Title */}
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}><FileUp size={12} strokeWidth={2.1} />Title</span>
                    </div>
                    <input className="form-input w-full font-semibold" value={draft.title} onChange={e => updateDraft('title', e.target.value)} />
                </div>

                {/* Description */}
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}><FileSpreadsheet size={12} strokeWidth={2.1} />Description</span>
                    </div>
                    <textarea rows={4} className="form-textarea w-full text-sm" value={draft.description} onChange={e => updateDraft('description', e.target.value)} />
                </div>

                {/* Constraints */}
                {draft.constraints?.length > 0 && (
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}><AlertTriangle size={12} strokeWidth={2.1} />Constraints</span>
                        {draft.constraints.map((c, i) => (
                            <div key={i} className="flex gap-2 mb-1.5">
                                <span className="text-cyan-400 font-bold mt-2 text-xs shrink-0">›</span>
                                <input className="form-input flex-1 text-xs font-mono" value={c} onChange={e => updateDraftConstraint(i, e.target.value)} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Examples */}
                {draft.examples?.length > 0 && (
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}><Sparkles size={12} strokeWidth={2.1} />Examples</span>
                        {draft.examples.map((ex, i) => (
                            <div key={i} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-bg-sidebar)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase">Example {i + 1}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-1.5">
                                    <div>
                                        <span className="text-[10px] text-gray-500 block mb-1">Input</span>
                                        <input className="form-input w-full text-xs font-mono" value={ex.input} onChange={e => updateDraftEx(i, 'input', e.target.value)} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-green-500 block mb-1">Output</span>
                                        <input className="form-input w-full text-xs font-mono" value={ex.output} onChange={e => updateDraftEx(i, 'output', e.target.value)} />
                                    </div>
                                </div>
                                {ex.explanation && (
                                    <input className="form-input w-full text-xs" placeholder="Explanation" value={ex.explanation} onChange={e => updateDraftEx(i, 'explanation', e.target.value)} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Test Cases */}
                {draft.testCases?.length > 0 && (
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}><FileSpreadsheet size={12} strokeWidth={2.1} />Test Cases ({draft.testCases.length})</span>
                        <div className="space-y-1.5">
                            {draft.testCases.map((tc, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-cyan-400 shrink-0 w-5">#{i + 1}</span>
                                    <input className="form-input flex-1 text-xs font-mono" placeholder="Input" value={tc.input} onChange={e => updateDraftTc(i, 'input', e.target.value)} />
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>→</span>
                                    <input className="form-input flex-1 text-xs font-mono" placeholder="Expected Output" value={tc.output} onChange={e => updateDraftTc(i, 'output', e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Starter Code */}
                {draft.starterCode?.javascript && (
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-text-muted)' }}>{'</>'} Starter Code</span>
                        <textarea rows={5} className="form-textarea w-full font-mono text-xs"
                            value={draft.starterCode.javascript}
                            onChange={e => updateDraft('starterCode', { javascript: e.target.value })} />
                    </div>
                )}
            </div>

            {/* Action Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--color-border)', background: 'rgba(6,182,212,0.03)' }}>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={handlePublish} disabled={publishing || aiGenerating}
                        className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {publishing ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Publishing...</>
                            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Save & Publish</>}
                    </button>
                    <button onClick={handleDraft} disabled={publishing} className="btn-secondary disabled:opacity-60">Save Draft</button>
                    <button onClick={onRegenerate} disabled={publishing || aiGenerating} className="btn-secondary disabled:opacity-60 inline-flex items-center gap-2"><Upload size={14} strokeWidth={2.2} />Regenerate</button>
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
                {isPublished ? (
                    <ActionButton
                        label="Unpublish"
                        tone="amber"
                        icon={EyeOff}
                        onClick={onTogglePublish}
                        title="Unpublish challenge"
                    />
                ) : (
                    <ActionButton
                        label="Publish"
                        tone="green"
                        icon={Upload}
                        onClick={onTogglePublish}
                        title="Publish challenge"
                    />
                )}
                <ActionButton
                    label="Delete"
                    tone="red"
                    icon={Trash2}
                    onClick={onDelete}
                    title="Delete challenge"
                />
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
