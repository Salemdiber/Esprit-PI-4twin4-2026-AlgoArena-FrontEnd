/**
 * Challenge Import Utility — Parses JSON & Excel files into challenge form data
 *
 * Supported Excel layouts:
 *   A) Header-Row layout  → Row 1 = column names, Row 2+ = data rows
 *   B) Key-Value layout   → Column A = field name, Column B = value (one field per row)
 *
 * The parser auto-detects which layout is present.
 */

import * as ExcelJS from 'exceljs';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];
const TOPICS = ['Arrays', 'Strings', 'Hash Table', 'Dynamic Programming', 'Graphs', 'Trees'];
const XP_MAP = { Easy: 50, Medium: 120, Hard: 250, Expert: 400 };
const TIME_MAP = { Easy: 15, Medium: 25, Hard: 40, Expert: 50 };

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize a value to an allowed list, case-insensitive, with fallback. */
function normalize(val, allowed, fallback) {
    if (!val) return fallback;
    const s = String(val).trim().toLowerCase();
    const match = allowed.find(a => a.toLowerCase() === s);
    return match || fallback;
}

/** Normalize a raw header/key to a clean lowercase key for comparison. */
function normalizeKey(key) {
    return String(key ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

/** Read a cell and coerce to a clean string, handling Date, richText, formula. */
function cellToString(cell) {
    const v = cell?.value;
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
        if (v.richText) return v.richText.map(r => r.text).join('');
        if (v.result !== undefined) return String(v.result);
        if (v instanceof Date) return v.toISOString();
    }
    return String(v);
}

/** Parse a raw JSON string or array into a string array. */
function parseStringArray(raw) {
    if (!raw) return [''];
    if (Array.isArray(raw)) return raw.map(s => String(s)).filter(Boolean);
    const s = String(raw).trim();
    if (!s) return [''];
    // Try JSON parse first (supports ["a","b"])
    if (s.startsWith('[')) {
        try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) return parsed.map(x => String(x)).filter(Boolean);
        } catch { /* fall through */ }
    }
    // Newline-separated fallback
    return s.split('\n').map(x => x.trim()).filter(Boolean);
}

/** Parse a raw value (JSON string or array) into test case objects. */
function parseTestCases(raw) {
    let arr = [];
    if (Array.isArray(raw)) {
        arr = raw;
    } else if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try { arr = JSON.parse(raw); } catch { return [{ input: '', output: '' }]; }
    } else {
        return [{ input: '', output: '' }];
    }
    return arr.slice(0, 10).map(tc => ({
        input: String(tc.input ?? tc.Input ?? ''),
        output: String(tc.output ?? tc.Output ?? tc.expected ?? tc.Expected ?? ''),
    })).filter(tc => tc.input || tc.output);
}

/** Parse a raw value (JSON string or array) into example objects. */
function parseExamples(raw) {
    let arr = [];
    if (Array.isArray(raw)) {
        arr = raw;
    } else if (typeof raw === 'string' && raw.trim().startsWith('[')) {
        try { arr = JSON.parse(raw); } catch { return [{ input: '', output: '', explanation: '' }]; }
    } else {
        return [{ input: '', output: '', explanation: '' }];
    }
    return arr.map(ex => ({
        input: String(ex.input ?? ex.Input ?? ''),
        output: String(ex.output ?? ex.Output ?? ''),
        explanation: String(ex.explanation ?? ex.Explanation ?? ''),
    }));
}

// ── JSON parser ──────────────────────────────────────────────────────────────

export function parseJSONChallenge(jsonObj) {
    const errors = [];
    if (!jsonObj || typeof jsonObj !== 'object') {
        errors.push('Invalid JSON structure');
        return { data: null, errors };
    }

    const difficulty = normalize(jsonObj.difficulty, DIFFICULTIES, 'Medium');
    const topic = normalize(jsonObj.topic ?? jsonObj.tags?.[0], TOPICS, 'Arrays');

    const data = {
        title: String(jsonObj.title ?? '').trim(),
        description: String(jsonObj.description ?? '').trim(),
        difficulty,
        topic,
        xpReward: Number(jsonObj.xpReward ?? jsonObj.xp ?? XP_MAP[difficulty]),
        estimatedTime: Number(jsonObj.estimatedTime ?? jsonObj.time ?? TIME_MAP[difficulty]),
        constraints: parseStringArray(jsonObj.constraints),
        examples: parseExamples(jsonObj.examples),
        testCases: parseTestCases(jsonObj.testCases),
        hints: parseStringArray(jsonObj.hints),
        starterCode: { javascript: String(jsonObj.starterCode?.javascript ?? jsonObj.starterCode ?? '').trim() },
    };

    if (!data.title) errors.push("Column 'title' not found or empty in file.");
    if (!data.description) errors.push("Column 'description' not found or empty in file.");
    if (data.testCases.length === 0) {
        data.testCases = [{ input: '', output: '' }];
        errors.push('No valid test cases found — add at least one with input & output.');
    }
    if (data.examples.length === 0) data.examples = [{ input: '', output: '', explanation: '' }];
    if (data.constraints.filter(Boolean).length === 0) data.constraints = [''];
    if (data.hints.filter(Boolean).length === 0) data.hints = [''];

    return { data, errors };
}

// ── Excel parser ─────────────────────────────────────────────────────────────

/**
 * Key aliases — maps every reasonable header variation to a canonical key.
 * The canonical key must match what we use in the `data` object below.
 */
const FIELD_ALIASES = {
    title: ['title'],
    description: ['description', 'desc', 'problem', 'problem_statement'],
    difficulty: ['difficulty', 'level'],
    topic: ['topic', 'category', 'tag', 'tags'],
    xpreward: ['xpreward', 'xp_reward', 'xp', 'points'],
    estimatedtime: ['estimatedtime', 'estimated_time', 'time', 'duration', 'est_time'],
    constraints: ['constraints', 'constraint'],
    examples: ['examples', 'example'],
    testcases: ['testcases', 'test_cases', 'tests', 'testcase'],
    hints: ['hints', 'hint', 'tips'],
    startercode_javascript: ['startercode_javascript', 'starter_code_javascript',
        'startercode', 'starter_code', 'code_template', 'template'],
};

/** Build a reverse map: alias → canonical key */
const ALIAS_TO_CANONICAL = {};
for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
        ALIAS_TO_CANONICAL[alias] = canonical;
    }
}

function resolveKey(rawHeader) {
    const nk = normalizeKey(rawHeader);
    return ALIAS_TO_CANONICAL[nk] ?? nk;
}

export async function parseExcelChallenge(file) {
    const errors = [];
    try {
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);

        const ws = workbook.getWorksheet(1);
        if (!ws) {
            errors.push('No worksheet found in Excel file.');
            return { data: null, errors };
        }

        // ── Auto-detect layout ──────────────────────────────────────────────
        // Header-Row: Row 1 has multiple non-empty cells across columns.
        // Key-Value:  Row 1 has something in col A and col B, and col C is empty.
        const row1 = ws.getRow(1);
        const row1Values = [];
        row1.eachCell({ includeEmpty: false }, (cell) => {
            const s = cellToString(cell).trim();
            if (s) row1Values.push(s);
        });

        // If first row has 3+ filled cells, it's a header-row layout.
        const isHeaderRow = row1Values.length >= 3;

        let fieldMap = {}; // canonical key → raw value

        if (isHeaderRow) {
            // ── Layout A: Header-Row ─────────────────────────────────────────
            // Row 1 = headers, Row 2 = data values
            const headers = [];
            row1.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const raw = cellToString(cell);
                headers[colNumber] = resolveKey(raw);
            });

            const dataRow = ws.getRow(2);
            dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const key = headers[colNumber];
                if (key) {
                    const existing = fieldMap[key];
                    // Only set if not already set (first column wins)
                    if (existing === undefined) {
                        fieldMap[key] = cell.value;
                    }
                }
            });
        } else {
            // ── Layout B: Key-Value ──────────────────────────────────────────
            // Col A = field name, Col B = value, one per row
            ws.eachRow((row) => {
                const rawKey = cellToString(row.getCell(1));
                if (!rawKey.trim()) return;
                const canonical = resolveKey(rawKey);
                fieldMap[canonical] = row.getCell(2).value;
            });
        }

        // ── Build data object ───────────────────────────────────────────────
        const difficulty = normalize(fieldMap.difficulty, DIFFICULTIES, 'Medium');
        const topic = normalize(fieldMap.topic, TOPICS, 'Arrays');

        const rawStarterCode = fieldMap.startercode_javascript ?? fieldMap.startercode ?? '';

        const data = {
            title: String(fieldMap.title ?? '').trim(),
            description: String(
                fieldMap.description ?? ''
            ).trim(),
            difficulty,
            topic,
            xpReward: Number(fieldMap.xpreward ?? XP_MAP[difficulty]),
            estimatedTime: Number(fieldMap.estimatedtime ?? TIME_MAP[difficulty]),
            constraints: parseStringArray(fieldMap.constraints),
            examples: parseExamples(fieldMap.examples),
            testCases: parseTestCases(fieldMap.testcases),
            hints: parseStringArray(fieldMap.hints),
            starterCode: { javascript: String(rawStarterCode ?? '').trim() },
        };

        // ── Validate ────────────────────────────────────────────────────────
        if (!data.title) errors.push("Column 'title' not found or empty in file.");
        if (!data.description) errors.push("Column 'description' not found or empty in file.");
        if (data.testCases.length === 0) {
            data.testCases = [{ input: '', output: '' }];
            errors.push('No valid test cases found — add at least one with input & output.');
        }
        if (data.examples.length === 0) data.examples = [{ input: '', output: '', explanation: '' }];
        if (data.constraints.filter(Boolean).length === 0) data.constraints = [''];
        if (data.hints.filter(Boolean).length === 0) data.hints = [''];

        // ── Debug: log resolved fieldMap for easier troubleshooting ─────────
        console.debug('[importChallenge] Excel layout:', isHeaderRow ? 'Header-Row' : 'Key-Value');
        console.debug('[importChallenge] Resolved field map:', Object.fromEntries(
            Object.entries(fieldMap).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 60) : v])
        ));

        return { data, errors };
    } catch (e) {
        errors.push('Failed to parse Excel file: ' + e.message);
        console.error('[importChallenge] Excel parse error:', e);
        return { data: null, errors };
    }
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function importChallengeFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.json')) {
        const text = await file.text();
        try {
            const json = JSON.parse(text);
            return parseJSONChallenge(json);
        } catch {
            return { data: null, errors: ['Invalid JSON format — could not parse file.'] };
        }
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        return parseExcelChallenge(file);
    }
    return { data: null, errors: ['Unsupported file type. Please use .json or .xlsx'] };
}
