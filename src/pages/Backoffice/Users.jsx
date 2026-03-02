import React, { useState, useEffect, useMemo, useRef } from 'react';
import { userService } from '../../services/userService';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ── Edit Modal ──────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSave }) => {
    const [form, setForm] = useState({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'Player',
        bio: user.bio || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar
            ? user.avatar.startsWith('/uploads/')
                ? user.avatar
                : user.avatar.startsWith('uploads/')
                    ? `/${user.avatar}`
                    : user.avatar
            : null
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef();

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        e.target.value = '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await userService.updateUserByAdmin(user._id, form);
            if (avatarFile) {
                const fd = new FormData();
                fd.append('avatar', avatarFile);
                await userService.uploadAvatarByAdmin(user._id, fd);
            }
            onSave();
        } catch (err) {
            setError(err?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const firstLetter = (user.username || 'U').charAt(0).toUpperCase();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="glass-panel rounded-2xl p-6 w-full max-w-lg shadow-custom animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 style={{ color: 'var(--color-text-heading)' }} className="text-xl font-bold mb-4">Edit User</h2>
                {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div
                            className="relative w-16 h-16 rounded-full border-2 border-cyan-400 overflow-hidden cursor-pointer group shrink-0"
                            onClick={() => fileRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-2xl">
                                    {firstLetter}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5" style={{ color: 'var(--color-text-heading)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click avatar to change</p>
                    </div>

                    {/* Username */}
                    <div>
                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-1">Username</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} className="form-input w-full" required />
                    </div>
                    {/* Email */}
                    <div>
                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input w-full" required />
                    </div>
                    {/* Role */}
                    <div>
                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-1">Role</label>
                        <select name="role" value={form.role} onChange={handleChange} className="form-select w-full">
                            <option value="Player">Player</option>
                            <option value="Admin">Admin</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                    {/* Bio */}
                    <div>
                        <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium mb-1">Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="form-input w-full resize-none" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                        <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Confirm Disable / Reactivate Modal ──────────────────────────────────
const ConfirmToggleModal = ({ user, isCurrentlyActive, onClose, onConfirm, processing }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shadow-custom animate-fade-in-up text-center" onClick={(e) => e.stopPropagation()}>
            <div className={`mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center ${isCurrentlyActive ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                {isCurrentlyActive ? (
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-heading)' }}>
                {isCurrentlyActive ? 'Disable Account' : 'Reactivate Account'}
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                {isCurrentlyActive ? (
                    <>Are you sure you want to disable <span className="text-cyan-400 font-semibold">@{user.username}</span>? They will be unable to log in. All user data and audit history will be preserved.</>
                ) : (
                    <>Reactivate <span className="text-cyan-400 font-semibold">@{user.username}</span>? They will regain access to their account and be able to log in again.</>
                )}
            </p>
            <div className="flex justify-center gap-3">
                <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                <button
                    onClick={(e) => { e.stopPropagation(); onConfirm(); }}
                    disabled={processing}
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-colors disabled:opacity-50 ${isCurrentlyActive
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        }`}
                >
                    {processing ? 'Processing...' : isCurrentlyActive ? 'Disable Account' : 'Reactivate Account'}
                </button>
            </div>
        </div>
    </div>
);

// ── Rank palette ────────────────────────────────────────────────────────
const RANK_STYLE = {
    BRONZE: { emoji: '🥉', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.3)' },
    SILVER: { emoji: '🥈', color: '#c0c0c0', bg: 'rgba(192,192,192,0.1)', border: 'rgba(192,192,192,0.25)' },
    GOLD: { emoji: '🥇', color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
    PLATINUM: { emoji: '🔷', color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
    DIAMOND: { emoji: '💎', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
};

// ── User Row ────────────────────────────────────────────────────────────
const UserRow = ({ username, email, role, _id, status, avatar, bio, rank, xp, createdAt, onEdit, onToggleStatus }) => {
    const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';
    const isActive = !!status;
    const displayStatus = isActive ? 'Active' : 'Disabled';
    const rankKey = String(rank || '').toUpperCase();
    const rankMeta = RANK_STYLE[rankKey];

    return (
        <tr className="table-row-hover border-b transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    {avatar ? (
                        <img
                            src={avatar.startsWith('/uploads/') ? avatar : avatar.startsWith('uploads/') ? `/${avatar}` : avatar}
                            alt={username}
                            className="w-9 h-9 rounded-full object-cover border border-cyan-400/30"
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-cyan-900 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-400/30">
                            {firstLetter}
                        </div>
                    )}
                    <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>@{username}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-secondary)' }}>{email}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        role === 'Premium' ? 'bg-amber-500/10  text-amber-400  border border-amber-500/20' :
                            'bg-cyan-500/10   text-cyan-400   border border-cyan-500/20'
                    }`}>
                    {role || 'Player'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {rankMeta ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: rankMeta.bg, color: rankMeta.color, border: `1px solid ${rankMeta.border}` }}>
                        {rankMeta.emoji} {rankKey}
                    </span>
                ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {xp != null ? xp.toLocaleString() : '—'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${isActive
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    {displayStatus}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-2">
                    {/* Edit */}
                    <button title="Edit User" className="action-btn action-btn-edit"
                        onClick={() => onEdit({ _id, username, email, role, bio, avatar, status })}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    {/* Disable / Reactivate toggle */}
                    <button
                        title={isActive ? 'Disable Account' : 'Reactivate Account'}
                        className={`action-btn ${isActive
                                ? 'text-amber-400 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'text-green-400 hover:bg-green-500/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                            }`}
                        onClick={() => onToggleStatus({ _id, username, status })}
                    >
                        {isActive ? (
                            /* Ban/disable icon — circle with line */
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        ) : (
                            /* Checkmark in circle — reactivate icon */
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ── Users Page ──────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

const Users = () => {
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [toggleUser, setToggleUser] = useState(null);   // user whose status is being toggled
    const [isProcessing, setIsProcessing] = useState(false);

    // ── Filters ─────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch users ─────────────────────────────────────────────────────
    const fetchUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Filter + paginate ───────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        let list = [...users];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter((u) =>
                (u.username || '').toLowerCase().includes(q) ||
                (u.email || '').toLowerCase().includes(q)
            );
        }
        if (roleFilter !== 'All') list = list.filter((u) => u.role === roleFilter);
        if (statusFilter !== 'All') {
            if (statusFilter === 'Active') list = list.filter((u) => u.status === true);
            if (statusFilter === 'Disabled') list = list.filter((u) => u.status === false);
        }
        return list;
    }, [users, searchQuery, roleFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const startIndex = Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length);
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length);
    const paginatedUsers = filteredUsers.slice(startIndex - 1, endIndex);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter]);

    const pageNumbers = useMemo(() => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    // ── Toggle status (disable / reactivate) ────────────────────────────
    const handleToggleConfirm = async () => {
        if (!toggleUser) return;
        setIsProcessing(true);
        try {
            // Flip the status: active → disabled, disabled → active
            await userService.updateStatusByAdmin(toggleUser._id, !toggleUser.status);
            setToggleUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Edit save handler ───────────────────────────────────────────────
    const handleEditSave = () => {
        setEditingUser(null);
        fetchUsers();
    };

    // ── Excel Export ────────────────────────────────────────────────────
    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('AlgoArena Users');

        sheet.columns = [
            { header: 'Username', key: 'username', width: 25 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Rank', key: 'rank', width: 18 },
            { header: 'XP', key: 'xp', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0891B2' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FF22D3EE' } } };
        });
        sheet.getRow(1).height = 30;

        filteredUsers.forEach((u) => {
            sheet.addRow({
                username: u.username || '—',
                email: u.email || '—',
                role: u.role || 'Player',
                rank: u.rank || '—',
                xp: u.xp ?? 0,
                status: u.status ? 'Active' : 'Disabled',
            });
        });

        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 ? 'center' : 'left' };
                if (rowNumber % 2 === 0) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
                }
            });
            row.height = 25;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AlgoArena_Users_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── PDF Export (Professional branded report) ────────────────────────
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const brandCyan = [8, 145, 178];
            const darkSlate = [15, 23, 42];
            const lightGray = [148, 163, 184];
            const now = new Date();

            // ── Header band ───────────────────────────────────────────
            doc.setFillColor(...darkSlate);
            doc.rect(0, 0, pageW, 38, 'F');
            // Accent line
            doc.setFillColor(...brandCyan);
            doc.rect(0, 38, pageW, 1.5, 'F');

            // Title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('AlgoArena — Users Report', 14, 16);

            // Metadata
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(180, 200, 220);
            doc.text(`Generated: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${now.toLocaleTimeString()}`, 14, 24);
            doc.text(`Total Users: ${filteredUsers.length}`, 14, 30);
            // Badges
            doc.setFontSize(8);
            doc.setTextColor(100, 120, 140);
            doc.text('OFFICIAL PLATFORM REPORT', pageW - 14, 24, { align: 'right' });
            doc.text('CONFIDENTIAL', pageW - 14, 30, { align: 'right' });

            // ── Table ─────────────────────────────────────────────────
            const columns = ['#', 'Username', 'Email', 'Role', 'Rank', 'XP', 'Status', 'Registered'];
            const rows = filteredUsers.map((u, i) => [
                String(i + 1),
                u.username || '—',
                u.email || '—',
                u.role || 'Player',
                u.rank || '—',
                String(u.xp ?? 0),
                u.status ? 'Active' : 'Disabled',
                u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
            ]);

            doc.autoTable({
                startY: 44,
                head: [columns],
                body: rows,
                theme: 'grid',
                headStyles: {
                    fillColor: brandCyan,
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 9,
                    halign: 'center',
                    valign: 'middle',
                    cellPadding: 3,
                },
                bodyStyles: {
                    textColor: [51, 65, 85],
                    fontSize: 8.5,
                    valign: 'middle',
                    cellPadding: 2.5,
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10, fontStyle: 'bold', textColor: [120, 140, 160] },
                    1: { halign: 'left', fontStyle: 'bold', cellWidth: 35 },
                    2: { halign: 'left', cellWidth: 55 },
                    3: { halign: 'center', cellWidth: 20 },
                    4: { halign: 'center', cellWidth: 22 },
                    5: { halign: 'center', cellWidth: 18 },
                    6: { halign: 'center', cellWidth: 22 },
                    7: { halign: 'center', cellWidth: 28 },
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { top: 44, left: 14, right: 14, bottom: 22 },
                styles: {
                    lineColor: [226, 232, 240],
                    lineWidth: 0.3,
                    overflow: 'ellipsize',
                },
                didDrawPage: (data) => {
                    const pn = doc.internal.getNumberOfPages();
                    // Footer accent line
                    doc.setDrawColor(...brandCyan);
                    doc.setLineWidth(0.5);
                    doc.line(14, pageH - 14, pageW - 14, pageH - 14);
                    // Footer text
                    doc.setFontSize(7);
                    doc.setTextColor(...lightGray);
                    doc.text('AlgoArena Platform', 14, pageH - 9);
                    doc.text(`Page ${pn}`, pageW / 2, pageH - 9, { align: 'center' });
                    doc.text(`\u00A9 ${now.getFullYear()} AlgoArena`, pageW - 14, pageH - 9, { align: 'right' });

                    // Continuation header on pages 2+
                    if (pn > 1) {
                        doc.setFillColor(...darkSlate);
                        doc.rect(0, 0, pageW, 12, 'F');
                        doc.setFillColor(...brandCyan);
                        doc.rect(0, 12, pageW, 0.8, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text('AlgoArena — Users Report (continued)', 14, 8);
                    }
                },
                didParseCell: (data) => {
                    // Color-code Status column (index 6)
                    if (data.section === 'body' && data.column.index === 6) {
                        if (data.cell.raw === 'Active') {
                            data.cell.styles.textColor = [16, 185, 129]; // green
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.textColor = [239, 68, 68]; // red
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                    // Color-code Role column (index 3) for Admins
                    if (data.section === 'body' && data.column.index === 3) {
                        if (data.cell.raw === 'Admin') {
                            data.cell.styles.textColor = [139, 92, 246]; // purple
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                },
            });

            doc.save(`AlgoArena_Users_Report_${now.toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // ── Render ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Page header */}
            <div className="mb-6">
                <h1 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-3xl font-bold mb-2">User Management</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Manage platform users and their permissions</p>
            </div>

            {/* Filters + Export */}
            <div className="glass-panel rounded-2xl p-4 shadow-custom">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative search-wrapper w-full">
                        <input
                            type="text"
                            placeholder="Search users by name, email, or username..."
                            className="search-input w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="w-5 h-5 search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <select className="form-select w-full md:w-40 bg-(--color-bg-input)" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Player">Player</option>
                        <option value="Premium">Premium</option>
                    </select>
                    <select className="form-select w-full md:w-40 bg-(--color-bg-input)" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Disabled">Disabled</option>
                    </select>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button className="btn-primary flex-1 md:flex-none whitespace-nowrap !px-4" onClick={handleExportExcel} title="Export to Excel">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel
                        </button>
                        <button className="btn-secondary flex-1 md:flex-none whitespace-nowrap !px-4" onClick={handleExportPDF} title="Export as PDF">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl shadow-custom overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-(--color-bg-sidebar)/50 border-b">
                            <tr>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rank</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Score</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th style={{ color: 'var(--color-text-muted)' }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user, index) => (
                                    <UserRow
                                        key={user._id || index}
                                        {...user}
                                        onEdit={(u) => setEditingUser(u)}
                                        onToggleStatus={(u) => setToggleUser(u)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t gap-4">
                    <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
                        {filteredUsers.length === 0
                            ? 'No results'
                            : `Showing ${startIndex} to ${endIndex} of ${filteredUsers.length} users`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                            Previous
                        </button>
                        {pageNumbers.map((n) => (
                            <button key={n} className={`${n === currentPage ? 'btn-primary' : 'btn-secondary hover:text-cyan-400'} px-3 py-1.5 text-sm`} onClick={() => setCurrentPage(n)}>
                                {n}
                            </button>
                        ))}
                        <button className="btn-secondary px-3 py-1.5 text-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleEditSave}
                />
            )}

            {/* Disable / Reactivate Confirmation Modal */}
            {toggleUser && (
                <ConfirmToggleModal
                    user={toggleUser}
                    isCurrentlyActive={!!toggleUser.status}
                    onClose={() => setToggleUser(null)}
                    onConfirm={handleToggleConfirm}
                    processing={isProcessing}
                />
            )}
        </div>
    );
};

export default Users;
