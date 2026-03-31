/**
 * TryChallenge – "Try a Challenge Instantly" landing page section.
 *
 * Functional enhancements only:
 * - Challenge chooser modal with difficulty badges
 * - Dynamic challenge content + starter code switching
 * - Terminal-like output with explicit success/error feedback
 * - Error line reporting for code validation
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Text,
    Flex,
    Badge,
    VStack,
    HStack,
    Icon,
    Tag,
    Collapse,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CodeEditor, EditorToolbar, OutputTerminal, useEditorState, DEMO_TEMPLATES } from '../editor';
import { mockChallenges, DIFFICULTY_META } from '../pages/Frontoffice/challenges/data/mockChallenges';

const MotionBox = motion.create(Box);

const CodeIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </Icon>
);

const LightbulbIcon = (props) => (
    <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
    </Icon>
);

const normalizeDifficulty = (difficulty) => {
    if (!difficulty) return { label: 'Easy', hex: '#22c55e' };
    const key = String(difficulty).toUpperCase();
    const meta = DIFFICULTY_META?.[key];
    if (meta) {
        return { label: meta.label, hex: meta.hex || '#22c55e' };
    }
    return { label: String(difficulty), hex: '#22c55e' };
};

const extractLineFromError = (error) => {
    if (!error) return 1;

    const stack = String(error.stack || '');
    const message = String(error.message || '');

    const stackMatch = stack.match(/<anonymous>:(\d+):(\d+)/);
    if (stackMatch?.[1]) {
        return Math.max(1, Number(stackMatch[1]) - 1);
    }

    const lineMatch = message.match(/line\s*(\d+)/i);
    if (lineMatch?.[1]) {
        return Math.max(1, Number(lineMatch[1]));
    }

    return 1;
};

const findStructuralError = (code) => {
    const stack = [];
    const openers = { '(': ')', '{': '}', '[': ']' };
    const closers = new Set(Object.values(openers));

    let line = 1;
    for (let i = 0; i < code.length; i += 1) {
        const char = code[i];
        if (char === '\n') line += 1;

        if (openers[char]) {
            stack.push({ char, line });
            continue;
        }

        if (closers.has(char)) {
            const top = stack.pop();
            if (!top || openers[top.char] !== char) {
                return { line, message: `Unexpected token "${char}"` };
            }
        }
    }

    if (stack.length > 0) {
        const last = stack[stack.length - 1];
        return { line: last.line, message: `Missing closing token for "${last.char}"` };
    }

    return null;
};

const splitTopLevel = (text) => {
    const result = [];
    let current = '';
    let depth = 0;
    let quote = null;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];

        if (quote) {
            current += ch;
            if (ch === quote && text[i - 1] !== '\\') {
                quote = null;
            }
            continue;
        }

        if (ch === '"' || ch === '\'' || ch === '`') {
            quote = ch;
            current += ch;
            continue;
        }

        if (ch === '[' || ch === '{' || ch === '(') depth += 1;
        if (ch === ']' || ch === '}' || ch === ')') depth = Math.max(0, depth - 1);

        if (ch === ',' && depth === 0) {
            result.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }

    if (current.trim()) {
        result.push(current.trim());
    }

    return result;
};

const parseExampleArgs = (inputText) => {
    if (!inputText || typeof inputText !== 'string') return {};

    const assignments = splitTopLevel(inputText);
    const map = {};

    assignments.forEach((item) => {
        const eqIndex = item.indexOf('=');
        if (eqIndex === -1) return;

        const name = item.slice(0, eqIndex).trim();
        const valueExpr = item.slice(eqIndex + 1).trim();
        if (!name || !valueExpr) return;

        try {
            // Parse simple JS-like literals from challenge examples.
            // eslint-disable-next-line no-new-func
            map[name] = new Function(`return (${valueExpr});`)();
        } catch {
            map[name] = valueExpr;
        }
    });

    return map;
};

const extractJsCallableMeta = (code) => {
    const patterns = [
        /function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/,
        /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\(([^)]*)\)\s*=>/,
        /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*=>/,
        /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\(([^)]*)\)/,
    ];

    for (const pattern of patterns) {
        const match = code.match(pattern);
        if (match?.[1]) {
            const rawParams = match[2] || '';
            const params = rawParams
                .split(',')
                .map((p) => p.trim().replace(/=.*$/, ''))
                .filter(Boolean);
            return { name: match[1], params };
        }
    }

    return null;
};

const toDisplayText = (value) => {
    if (typeof value === 'string') return value;
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
};

const executeJavaScriptQuickRun = (code) => {
    const output = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const capture = (...args) => {
        output.push(args.map((arg) => toDisplayText(arg)).join(' '));
    };

    try {
        console.log = capture;
        console.warn = capture;
        console.error = capture;
        // eslint-disable-next-line no-new-func
        const runner = new Function(`"use strict";\n${code}`);
        runner();
        return { ok: true, output };
    } catch (error) {
        return {
            ok: false,
            error: {
                line: extractLineFromError(error),
                message: error.message || 'Runtime execution error',
            },
            output,
        };
    } finally {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
    }
};

const parsePythonLiteral = (valueText, vars) => {
    const value = valueText.trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1);
    }
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    if (value === 'True') return true;
    if (value === 'False') return false;
    if (value === 'None') return null;
    if (Object.prototype.hasOwnProperty.call(vars, value)) return vars[value];

    // Basic arithmetic/concat evaluator for quick local simulation.
    const expr = value
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\b([A-Za-z_]\w*)\b/g, (name) => {
            if (Object.prototype.hasOwnProperty.call(vars, name)) {
                return JSON.stringify(vars[name]);
            }
            return name;
        });

    try {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${expr});`)();
    } catch {
        // Keep unresolved expressions as plain text instead of crashing quick-run.
        return value;
    }
};

const executePythonQuickRun = (code) => {
    const output = [];
    const vars = {};
    const lines = code.split('\n');

    try {
        for (let i = 0; i < lines.length; i += 1) {
            const raw = lines[i];
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;

            const assignMatch = line.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
            if (assignMatch && !line.startsWith('if ') && !line.startsWith('while ') && !line.startsWith('for ')) {
                const [, name, valueExpr] = assignMatch;
                vars[name] = parsePythonLiteral(valueExpr, vars);
                continue;
            }

            const printMatch = line.match(/^print\((.*)\)$/);
            if (printMatch) {
                const items = splitTopLevel(printMatch[1]);
                const rendered = items.map((item) => toDisplayText(parsePythonLiteral(item, vars)));
                output.push(rendered.join(' '));
                continue;
            }
        }

        return { ok: true, output };
    } catch (error) {
        return {
            ok: false,
            error: {
                line: 1,
                message: error.message || 'Python quick-run simulation failed',
            },
            output,
        };
    }
};

const collectCppIssues = (code) => {
    const lines = code.split('\n');
    const issues = [];

    const pushIssue = (line, message) => {
        if (!issues.some((item) => item.line === line && item.message === message)) {
            issues.push({ line, message });
        }
    };

    // Check for missing semicolons at end of statements
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line || line.startsWith('//') || line.startsWith('/*') || line.endsWith('{') || line.endsWith('};')) continue;

        // Simple heuristic: lines that look like statements should end with semicolon
        if ((line.includes('=') || line.includes('cout') || line.includes('cin') || line.match(/^\s*\w+\s+\w+/))
            && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith(',')) {
            pushIssue(i + 1, 'Missing semicolon at end of statement');
        }
    }

    // Check for missing includes for common patterns
    if ((code.includes('cout') || code.includes('cin')) && !code.includes('iostream')) {
        pushIssue(1, 'iostream header not included (needed for cout/cin)');
    }
    if (code.includes('vector<') && !code.includes('#include <vector>') && !code.includes('#include "vector')) {
        pushIssue(1, 'vector header not included (needed for std::vector)');
    }
    if (code.includes('string') && !code.includes('#include <string>') && !code.includes('#include "string')) {
        pushIssue(1, 'string header not included (needed for std::string)');
    }
    if (code.includes('map<') && !code.includes('#include <map>') && !code.includes('#include "map')) {
        pushIssue(1, 'map header not included (needed for std::map)');
    }

    // Check for main function
    if (!code.includes('int main') && !code.includes('void main')) {
        pushIssue(1, 'main() function not found');
    }

    // Check for missing return in main function
    const mainMatch = code.match(/int\s+main\s*\([^)]*\)\s*{([\s\S]*?)^}/m);
    if (mainMatch && !mainMatch[1].includes('return')) {
        pushIssue(1, 'Missing return statement in main() function');
    }

    // Check for undefined variables - detect pattern matching
    const vars = new Set();
    const usedVars = new Set();

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        // Track variable declarations (simple pattern)
        const declMatch = line.match(/\b(int|float|double|string|vector|map|bool|char|long|short)\s+([a-zA-Z_]\w*)\b/g);
        if (declMatch) {
            declMatch.forEach((decl) => {
                const nameMatch = decl.match(/\s([a-zA-Z_]\w*)\b$/);
                if (nameMatch) vars.add(nameMatch[1]);
            });
        }

        // Track variable usage (simple pattern)
        const useMatch = line.match(/\b([a-zA-Z_]\w*)\s*[=+\-*/()]/g);
        if (useMatch) {
            useMatch.forEach((use) => {
                const nameMatch = use.match(/^([a-zA-Z_]\w*)\b/);
                if (nameMatch) usedVars.add(nameMatch[1]);
            });
        }
    }

    // Check for potentially undefined variables
    for (const v of usedVars) {
        if (!vars.has(v) && !['cout', 'cin', 'endl', 'std', 'return', 'if', 'for', 'while'].includes(v)) {
            // Find line number
            for (let i = 0; i < lines.length; i += 1) {
                if (lines[i].includes(v) && lines[i].includes('=')) {
                    pushIssue(i + 1, `Variable '${v}' may be used before declaration`);
                }
            }
        }
    }

    // Check for array/pointer dereference issues
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.includes('[') && line.includes(']') && !line.match(/\[\d+\]/) && !line.match(/\[[a-zA-Z_]\w*\]/)) {
            if (line.includes('[  ]') || line.includes('[]')) {
                pushIssue(i + 1, 'Array index appears empty or incomplete');
            }
        }
    }

    // Check for type mismatch patterns (common ones)
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (line.includes('vector<') && line.includes('[') && !line.includes('.at(') && !line.includes('.push_back')) {
            // Could be bounds issue, but also could be valid
        }
    }

    // Check for missing braces in control structures
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if ((line.startsWith('if ') || line.startsWith('for ') || line.startsWith('while ')) && !line.includes('{')) {
            const nextLine = lines[i + 1]?.trim() || '';
            if (!nextLine || nextLine === '' || nextLine.startsWith('}')) {
                pushIssue(i + 1, 'Control structure requires body or braces');
            }
        }
    }

    return issues.sort((a, b) => a.line - b.line);
};

const collectPythonIssues = (code) => {
    const lines = code.split('\n');
    const issues = [];

    const pushIssue = (line, message) => {
        if (!issues.some((item) => item.line === line && item.message === message)) {
            issues.push({ line, message });
        }
    };

    // Indentation and control-block syntax checks.
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const leadingSpaces = line.match(/^(\s*)/)[1].length;
        if (line.includes('\t')) {
            pushIssue(i + 1, 'Tab indentation detected (use spaces only)');
        }
        if (leadingSpaces % 4 !== 0) {
            pushIssue(i + 1, 'Inconsistent indentation (should be multiple of 4 spaces)');
        }

        if ((trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('else:') === false && trimmed.startsWith('else ')
            || trimmed.startsWith('for ') || trimmed.startsWith('while ') || trimmed.startsWith('def ')
            || trimmed.startsWith('class ')) && !trimmed.endsWith(':')) {
            pushIssue(i + 1, 'Missing colon (:) after control structure or definition');
        }

        if (/^(if|elif|while)\b.*[^=!<>]=[^=].*:$/.test(trimmed)) {
            pushIssue(i + 1, 'Possible assignment (=) instead of comparison (==) in condition');
        }

        if (trimmed.endsWith(':')) {
            const nextLine = lines[i + 1];
            if (!nextLine || !nextLine.trim()) {
                pushIssue(i + 1, 'Expected block after colon');
            } else {
                const nextIndent = nextLine.match(/^(\s*)/)[1].length;
                if (nextIndent <= leadingSpaces) {
                    pushIssue(i + 2, 'Expected indented block after colon');
                }
            }
        }
    }

    if (code.includes('print (') && !code.includes('print(')) {
        pushIssue(1, 'Space before parentheses in print statement (remove space)');
    }

    // Bracket mismatch checks while ignoring string literals.
    const openCounts = { '(': 0, '[': 0, '{': 0 };
    const closeCounts = { ')': 0, ']': 0, '}': 0 };
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        let inString = false;
        let stringChar = '';
        for (let j = 0; j < line.length; j += 1) {
            const ch = line[j];
            if ((ch === '"' || ch === "'") && line[j - 1] !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = ch;
                } else if (ch === stringChar) {
                    inString = false;
                }
            }

            if (!inString) {
                if (ch === '(') openCounts['('] += 1;
                if (ch === '[') openCounts['['] += 1;
                if (ch === '{') openCounts['{'] += 1;
                if (ch === ')') closeCounts[')'] += 1;
                if (ch === ']') closeCounts[']'] += 1;
                if (ch === '}') closeCounts['}'] += 1;
            }
        }
    }
    if (openCounts['('] !== closeCounts[')']) pushIssue(1, 'Mismatched parentheses count');
    if (openCounts['['] !== closeCounts[']']) pushIssue(1, 'Mismatched square brackets count');
    if (openCounts['{'] !== closeCounts['}']) pushIssue(1, 'Mismatched curly braces count');

    // Runtime-like checks from deterministic patterns.
    for (let i = 0; i < lines.length; i += 1) {
        const trimmed = lines[i].trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        if (/\/\s*0(?![\d.])/.test(trimmed) || /\/\/\s*0(?![\d.])/.test(trimmed) || /%\s*0(?![\d.])/.test(trimmed)) {
            pushIssue(i + 1, 'Potential division by zero');
        }

        if (/\bNone\s*\./.test(trimmed)) {
            pushIssue(i + 1, 'Attribute access on None value');
        }

        if (trimmed.match(/\d\[/) || trimmed.match(/True\[/) || trimmed.match(/False\[/)) {
            pushIssue(i + 1, 'Cannot use index/key on non-container type (number/boolean)');
        }
    }

    // Detect return outside function using indentation scope.
    const functionIndentStack = [];
    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const indent = line.match(/^(\s*)/)[1].length;
        while (functionIndentStack.length > 0 && indent <= functionIndentStack[functionIndentStack.length - 1]) {
            functionIndentStack.pop();
        }

        if (/^def\s+\w+\s*\(/.test(trimmed)) {
            functionIndentStack.push(indent);
            continue;
        }

        if (/^return\b/.test(trimmed) && functionIndentStack.length === 0) {
            pushIssue(i + 1, 'return statement outside function definition');
        }
    }

    return issues.sort((a, b) => a.line - b.line);
};

const buildHint = (message, language) => {
    const text = String(message || '').toLowerCase();

    // JavaScript/TypeScript hints
    if (language === 'javascript' || language === 'typescript') {
        if (text.includes('unexpected token')) {
            return 'Check missing commas, brackets, or extra characters around this line.';
        }
        if (text.includes('not defined')) {
            return 'A variable/function is used before declaration. Verify names and scope.';
        }
        if (text.includes('not a function')) {
            return 'You are calling something that is not callable. Check function names and returned values.';
        }
        if (text.includes('cannot read properties of undefined') || text.includes('cannot read property')) {
            return 'A value is undefined/null before property access. Add guards before using it.';
        }
        if (text.includes('assignment to constant variable')) {
            return 'A const value is being reassigned. Use let or avoid reassignment.';
        }
        if (text.includes('maximum call stack size exceeded')) {
            return 'Likely infinite recursion. Ensure the recursive function has a valid base case.';
        }
        if (text.includes('cannot access') && text.includes('before initialization')) {
            return 'A let/const variable is used in its temporal dead zone. Move usage below declaration.';
        }
    }

    // C++ specific hints
    if (language === 'cpp') {
        if (text.includes('missing semicolon')) {
            return 'Add semicolon (;) at the end of statements, declarations, and after closing braces in structs/classes.';
        }
        if (text.includes('iostream')) {
            return 'Add #include <iostream> at the top for cout/cin operations.';
        }
        if (text.includes('vector')) {
            return 'Add #include <vector> at the top for vector<> usage.';
        }
        if (text.includes('string')) {
            return 'Add #include <string> at the top for std::string usage.';
        }
        if (text.includes('map')) {
            return 'Add #include <map> at the top for std::map usage.';
        }
        if (text.includes('main() function not found')) {
            return 'Ensure your code has: int main() { ... return 0; } as the entry point.';
        }
        if (text.includes('missing return')) {
            return 'Add a return statement at the end of main(). Usually: return 0;';
        }
        if (text.includes('used before declaration')) {
            return 'Declare the variable before using it, or check variable name spelling and scope.';
        }
        if (text.includes('array index') || text.includes('empty or incomplete')) {
            return 'Array index should not be empty. Use: array[index] or array.at(index) for bounds checking.';
        }
        if (text.includes('control structure requires')) {
            return 'Add braces {} after if/for/while statements or place body on next line with proper indentation.';
        }
        if (text.includes('unexpected token') || text.includes('expected')) {
            return 'Check for missing semicolons, brackets, or incorrect syntax around this line.';
        }
    }

    // Python specific hints
    if (language === 'python') {
        if (text.includes('indentation')) {
            return 'Python requires consistent indentation. Use 4 spaces per indent level, not tabs or irregular spacing.';
        }
        if (text.includes('tab indentation')) {
            return 'Replace tabs with spaces. Python indentation should use spaces consistently.';
        }
        if (text.includes('missing colon')) {
            return 'Add colon (:) after if, elif, else, for, while, def, class statements.';
        }
        if (text.includes('expected block after colon')) {
            return 'A colon must be followed by a block. Add the next line(s) with indentation.';
        }
        if (text.includes('expected indented block')) {
            return 'After a colon (:), the next line must be indented. Add 4 spaces to the block.';
        }
        if (text.includes('print statement')) {
            return 'In Python 3, use print(value) function (not print value). Remove space before parentheses.';
        }
        if (text.includes('assignment') && text.includes('comparison')) {
            return 'Use == for comparison in if/while conditions, not = (which is assignment).';
        }
        if (text.includes('division by zero')) {
            return 'Ensure the denominator cannot become 0 before division or modulo operations.';
        }
        if (text.includes('attribute access on none')) {
            return 'A value may be None before attribute access. Add a None check before using dot notation.';
        }
        if (text.includes('not defined') || text.includes('before assignment')) {
            return 'Variable must be assigned a value before being used. Check spelling and ensure it\'s defined first.';
        }
        if (text.includes('cannot use index') || text.includes('non-container')) {
            return 'Cannot index/access keys on numbers or booleans. You can only index lists, dicts, strings, tuples.';
        }
        if (text.includes('mismatched') && text.includes('parentheses')) {
            return 'Unequal opening and closing parentheses. Count your ( and ) symbols and match them.';
        }
        if (text.includes('mismatched') && text.includes('square')) {
            return 'Unequal opening and closing square brackets. Count your [ and ] symbols and match them.';
        }
        if (text.includes('mismatched') && text.includes('curly')) {
            return 'Unequal opening and closing curly braces. Count your { and } symbols and match them.';
        }
        if (text.includes('mixing range()')) {
            return 'Combine range() with for loops: for i in range(n): instead of while with range().';
        }
        if (text.includes('return statement outside')) {
            return 'return can only be used inside a function. Move the return statement into a def function block.';
        }
        if (text.includes('unexpected') || text.includes('invalid')) {
            return 'Check syntax around this line. Python is strict about indentation, colons, and parentheses.';
        }
    }

    // Fallback hint
    return 'Only static checks are available in browser mode. Verify runtime behavior on full judge execution.';
};

const runValidation = ({ language, code, challenge }) => {
    if (!code.trim()) {
        return { ok: false, line: 1, message: 'Code is empty', hint: 'Write your solution before running.' };
    }

    const structural = findStructuralError(code);
    if (structural) {
        return {
            ok: false,
            line: structural.line,
            message: structural.message,
            hint: buildHint(structural.message, language),
        };
    }

    // C++ specific validation
    if (language === 'cpp') {
        const cppIssues = collectCppIssues(code);
        if (cppIssues.length > 0) {
            const firstIssue = cppIssues[0];
            return {
                ok: false,
                line: firstIssue.line,
                message: firstIssue.message,
                hint: buildHint(firstIssue.message, language),
                errors: cppIssues.map((issue) => ({
                    ...issue,
                    hint: buildHint(issue.message, language),
                })),
            };
        }
    }

    // Python specific validation
    if (language === 'python') {
        const pythonIssues = collectPythonIssues(code);
        if (pythonIssues.length > 0) {
            const firstIssue = pythonIssues[0];
            return {
                ok: false,
                line: firstIssue.line,
                message: firstIssue.message,
                hint: buildHint(firstIssue.message, language),
                errors: pythonIssues.map((issue) => ({
                    ...issue,
                    hint: buildHint(issue.message, language),
                })),
            };
        }
    }

    if (language === 'javascript' || language === 'typescript') {
        try {
            // Syntax compile check.
            // eslint-disable-next-line no-new-func
            new Function(code);
        } catch (error) {
            const message = error.message || 'Unexpected syntax error';
            return {
                ok: false,
                line: extractLineFromError(error),
                message,
                hint: buildHint(message, language),
            };
        }

        // Runtime probe with first challenge example when possible.
        const callableMeta = extractJsCallableMeta(code);
        if (callableMeta?.name) {
            const functionName = callableMeta.name;
            const params = callableMeta.params || [];

            const sampleInput = challenge?.examples?.[0]?.input || '';
            const parsedMap = parseExampleArgs(sampleInput);
            const args = params.map((name) => parsedMap[name]);
            const hasMissingMappedArgs = params.length > 0
                && args.some((arg) => arg === undefined);

            if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/.test(code)) {
                return {
                    ok: false,
                    line: 1,
                    message: 'Potential infinite loop detected',
                    hint: 'Avoid unbounded loops without a clear exit condition.',
                };
            }

            try {
                // eslint-disable-next-line no-new-func
                const factory = new Function(`"use strict"; ${code}; return typeof ${functionName} === "function" ? ${functionName} : null;`);
                const fn = factory();

                if (typeof fn !== 'function') {
                    return {
                        ok: false,
                        line: 1,
                        message: `Function ${functionName} not found`,
                        hint: 'Ensure your solution keeps the expected function declaration name.',
                    };
                }

                if (!hasMissingMappedArgs) {
                    const result = fn(...args);
                    if (result && typeof result.then === 'function') {
                        return {
                            ok: false,
                            line: 1,
                            message: 'Async Promise output is not supported in quick-run mode',
                            hint: 'Return a direct value instead of a Promise for local quick checks.',
                        };
                    }
                }
            } catch (error) {
                const message = error.message || 'Runtime execution error';
                return {
                    ok: false,
                    line: extractLineFromError(error),
                    message,
                    hint: buildHint(message, language),
                };
            }
        }
    }

    const warnings = [];
    if (/TODO/i.test(code)) {
        warnings.push('TODO markers found. Replace placeholders before final submit.');
    }
    if (/return\s*;/.test(code) && (language === 'javascript' || language === 'typescript')) {
        warnings.push('Found an empty return statement. Verify function output requirements.');
    }
    if ((language === 'javascript' || language === 'typescript') && challenge?.examples?.[0]?.input) {
        const callableMeta = extractJsCallableMeta(code);
        if (callableMeta?.params?.length) {
            const parsedMap = parseExampleArgs(challenge.examples[0].input);
            const missing = callableMeta.params.filter((name) => parsedMap[name] === undefined);
            if (missing.length > 0) {
                warnings.push(`Skipped sample auto-run because inputs were missing for: ${missing.join(', ')}`);
            }
        }
    }

    // Language-specific warnings
    if (language === 'cpp' && /TODO/i.test(code)) {
        warnings.push('C++: Ensure includes (#include) are at the top of the file.');
    }
    if (language === 'python' && /TODO/i.test(code)) {
        warnings.push('Python: Remember to check indentation is consistent (4 spaces per level).');
    }

    return { ok: true, warnings };
};

const PYTHON_DEFAULT_SNIPPET = `def twoSum(nums, target):
    num_map = {}

    for i in range(len(nums)):
        complement = target - nums[i]

        if complement in num_map:
            return [num_map[complement], i]

        num_map[nums[i]] = i


nums = [2,7,11,15]
target = 9

result = twoSum(nums, target)

print("Input: nums = [2,7,11,15], target = 9")
print()
print("Output: [", 0, ",", 1, "]", sep="")`;

const JAVASCRIPT_DEFAULT_SNIPPET = `function longestPalindrome(s) {
    const n = s.length;
    if (n < 2) return s;

    const dp = Array.from({ length: n }, () => Array(n).fill(false));

    let start = 0;
    let maxLength = 1;

    // Every single character is a palindrome
    for (let i = 0; i < n; i++) {
        dp[i][i] = true;
    }

    // Build DP table
    for (let len = 2; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            let j = i + len - 1;

            if (s[i] === s[j]) {
                if (len === 2 || dp[i + 1][j - 1]) {
                    dp[i][j] = true;

                    if (len > maxLength) {
                        start = i;
                        maxLength = len;
                    }
                }
            }
        }
    }

    return s.substring(start, start + maxLength);
}


// Test cases with console output
console.log("Input: babad -> Output:", longestPalindrome("babad"));
console.log("Input: cbbd -> Output:", longestPalindrome("cbbd"));
console.log("Input: racecar -> Output:", longestPalindrome("racecar"));
console.log("Input: a -> Output:", longestPalindrome("a"));`;

const getStarterForChallenge = (challenge, language) => {
    if (language === 'python') {
        return PYTHON_DEFAULT_SNIPPET;
    }
    if (language === 'javascript') {
        return JAVASCRIPT_DEFAULT_SNIPPET;
    }
    const starter = challenge?.starterCode?.[language];
    return starter || DEMO_TEMPLATES[language] || '';
};

const TryChallenge = () => {
    const challengeList = useMemo(() => mockChallenges.slice(0, 10), []);
    const defaultChallenge = challengeList[0];

    const [selectedChallenge, setSelectedChallenge] = useState(defaultChallenge);

    const {
        code,
        setCode,
        language,
        setLanguage,
        output,
        setOutput,
        isRunning,
        resetCode,
    } = useEditorState();

    const {
        isOpen: showExamples,
        onToggle: toggleExamples,
    } = useDisclosure({ defaultIsOpen: true });

    const {
        isOpen: isChooserOpen,
        onOpen: openChooser,
        onClose: closeChooser,
    } = useDisclosure();

    useEffect(() => {
        const shouldApplyPythonDefault = language === 'python'
            && (code === DEMO_TEMPLATES.python || code.trim().length === 0);
        const shouldApplyJavascriptDefault = language === 'javascript'
            && (code === DEMO_TEMPLATES.javascript || code.trim().length === 0);

        if (shouldApplyPythonDefault) {
            setCode(PYTHON_DEFAULT_SNIPPET);
            return;
        }

        if (shouldApplyJavascriptDefault) {
            setCode(JAVASCRIPT_DEFAULT_SNIPPET);
        }
    }, [code, language, setCode]);

    const challengeDifficulty = normalizeDifficulty(selectedChallenge?.difficulty);

    const handleSelectChallenge = useCallback(
        (challenge) => {
            setSelectedChallenge(challenge);
            setCode(getStarterForChallenge(challenge, language));
            setOutput([]);
            closeChooser();
        },
        [closeChooser, language, setCode, setOutput],
    );

    const handleLanguageChange = useCallback(
        (nextLanguage) => {
            setLanguage(nextLanguage);
            setCode(getStarterForChallenge(selectedChallenge, nextLanguage));
            setOutput([]);
        },
        [selectedChallenge, setCode, setLanguage, setOutput],
    );

    const handleRunCode = useCallback(() => {
        if (isRunning) return;

        setOutput([
            { type: 'info', text: `Compiling ${language}...` },
            { type: 'info', text: `Challenge: ${selectedChallenge?.title || 'Unknown challenge'}` },
            { type: 'info', text: 'Executing...' },
        ]);

        const validation = runValidation({ language, code, challenge: selectedChallenge });

        if (!validation.ok) {
            const detailedErrors = Array.isArray(validation.errors) && validation.errors.length > 0
                ? validation.errors
                : [{ line: validation.line, message: validation.message, hint: validation.hint }];

            setOutput((prev) => ([
                ...prev,
                ...detailedErrors.map((item, index) => ({
                    type: 'error',
                    text: `Error ${index + 1}: ${item.message} on line ${item.line}`,
                })),
                ...detailedErrors.map((item) => ({
                    type: 'error',
                    text: `Hint: ${item.hint || 'Review code around this line and verify variable/function usage.'}`,
                })),
                { type: 'error', text: 'Execution failed.' },
            ]));
            return;
        }

        const exampleCount = Array.isArray(selectedChallenge?.examples)
            ? selectedChallenge.examples.length
            : 0;

        let runtimeOutput = [];
        if (language === 'javascript' || language === 'typescript') {
            const exec = executeJavaScriptQuickRun(code);
            if (!exec.ok) {
                setOutput((prev) => ([
                    ...prev,
                    ...(exec.output || []).map((line) => ({ type: 'result', text: line })),
                    { type: 'error', text: `Error: ${exec.error.message} on line ${exec.error.line}` },
                    { type: 'error', text: `Hint: ${buildHint(exec.error.message, language)}` },
                    { type: 'error', text: 'Execution failed.' },
                ]));
                return;
            }
            runtimeOutput = exec.output || [];
        }

        if (language === 'python') {
            const exec = executePythonQuickRun(code);
            if (!exec.ok) {
                setOutput((prev) => ([
                    ...prev,
                    ...(exec.output || []).map((line) => ({ type: 'result', text: line })),
                    { type: 'error', text: `Error: ${exec.error.message} on line ${exec.error.line}` },
                    { type: 'error', text: `Hint: ${buildHint(exec.error.message, language)}` },
                    { type: 'error', text: 'Execution failed.' },
                ]));
                return;
            }
            runtimeOutput = exec.output || [];
        }

        setOutput((prev) => ([
            ...prev,
            { type: 'result', text: `Processed ${exampleCount} sample input${exampleCount === 1 ? '' : 's'}.` },
            ...(runtimeOutput.length > 0
                ? runtimeOutput.map((line) => ({ type: 'result', text: line }))
                : [{ type: 'info', text: 'No runtime output produced.' }]),
            ...(validation.warnings || []).map((warning) => ({ type: 'info', text: `Hint: ${warning}` })),
            { type: 'success', text: 'Success: Code executed correctly in syntax/runtime quick checks.' },
            { type: 'success', text: 'Ready for full test-case verification.' },
        ]));
    }, [code, isRunning, language, selectedChallenge, setOutput]);

    const handleReset = useCallback(() => {
        const starter = getStarterForChallenge(selectedChallenge, language);
        if (starter) {
            setCode(starter);
            setOutput([]);
            return;
        }
        resetCode();
    }, [language, resetCode, selectedChallenge, setCode, setOutput]);

    return (
        <Box
            id="try-challenge"
            as="section"
            py={{ base: 16, lg: 24 }}
            bg="#0f172a"
            position="relative"
            overflow="hidden"
        >
            <Box
                position="absolute"
                top="-200px"
                right="-100px"
                w="500px"
                h="500px"
                bg="#22d3ee"
                borderRadius="full"
                filter="blur(180px)"
                opacity={0.06}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                bottom="-150px"
                left="-80px"
                w="400px"
                h="400px"
                bg="#a855f7"
                borderRadius="full"
                filter="blur(160px)"
                opacity={0.04}
                pointerEvents="none"
            />

            <Container maxW="7xl" position="relative" zIndex={1}>
                <MotionBox
                    textAlign="center"
                    mb={{ base: 10, lg: 14 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                >
                    <HStack justify="center" mb={4}>
                        <CodeIcon w={5} h={5} color="#22d3ee" />
                        <Text
                            fontSize="sm"
                            fontWeight="bold"
                            textTransform="uppercase"
                            letterSpacing="widest"
                            color="#22d3ee"
                        >
                            Live Playground
                        </Text>
                    </HStack>
                    <Heading
                        as="h2"
                        fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}
                        fontFamily="heading"
                        fontWeight="bold"
                        color="gray.100"
                        mb={4}
                    >
                        Try a Challenge{' '}
                        <Text as="span" bgGradient="linear(to-r, #22d3ee, #a855f7)" bgClip="text">
                            Instantly
                        </Text>
                    </Heading>
                    <Text fontSize={{ base: 'lg', lg: 'xl' }} color="gray.400" maxW="2xl" mx="auto">
                        No sign-up needed. Write code, hit run, and see the results.
                    </Text>
                </MotionBox>

                <MotionBox
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        gap={{ base: 6, lg: 0 }}
                        bg="#111827"
                        borderRadius="16px"
                        border="1px solid"
                        borderColor="#1e293b"
                        overflow="hidden"
                        boxShadow="0 8px 40px rgba(0, 0, 0, 0.4)"
                    >
                        <Box
                            w={{ base: '100%', lg: '40%' }}
                            p={{ base: 6, lg: 8 }}
                            borderRight={{ lg: '1px solid' }}
                            borderColor={{ lg: '#1e293b' }}
                            overflowY="auto"
                            maxH={{ lg: '520px' }}
                            sx={{
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { bg: '#334155', borderRadius: '3px' },
                                overscrollBehavior: 'contain',
                            }}
                        >
                            <HStack mb={4} spacing={3} align="center" justify="space-between">
                                <HStack spacing={3} align="center">
                                    <Heading fontSize="xl" fontFamily="heading" fontWeight="bold" color="gray.100">
                                        {selectedChallenge?.title || 'Challenge'}
                                    </Heading>
                                    <Badge
                                        bg={`${challengeDifficulty.hex}20`}
                                        color={challengeDifficulty.hex}
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="6px"
                                        fontWeight="semibold"
                                    >
                                        {challengeDifficulty.label}
                                    </Badge>
                                </HStack>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    color="gray.300"
                                    border="1px solid"
                                    borderColor="#334155"
                                    _hover={{ color: '#22d3ee', borderColor: '#22d3ee' }}
                                    onClick={openChooser}
                                >
                                    Choose Challenge
                                </Button>
                            </HStack>

                            <HStack spacing={2} mb={5} flexWrap="wrap">
                                {(selectedChallenge?.tags || []).map((tag) => (
                                    <Tag
                                        key={tag}
                                        size="sm"
                                        bg="#1e293b"
                                        color="gray.300"
                                        borderRadius="6px"
                                        fontSize="xs"
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                            </HStack>

                            <Text color="gray.300" fontSize="sm" lineHeight="1.8" mb={5}>
                                {selectedChallenge?.description}
                            </Text>

                            <VStack align="start" spacing={2} mb={6}>
                                {(selectedChallenge?.constraints || []).slice(0, 3).map((rule, i) => (
                                    <HStack key={`${rule}-${i}`} align="start" spacing={2}>
                                        <Text color="#22d3ee" fontSize="sm" mt="2px">•</Text>
                                        <Text color="gray.400" fontSize="sm">{rule}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Button
                                variant="unstyled"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                color="gray.400"
                                fontSize="sm"
                                fontWeight="semibold"
                                mb={3}
                                _hover={{ color: '#22d3ee' }}
                                onClick={toggleExamples}
                            >
                                <LightbulbIcon w={4} h={4} />
                                {showExamples ? 'Hide' : 'Show'} Examples
                            </Button>

                            <Collapse in={showExamples} animateOpacity>
                                <VStack spacing={4} align="stretch">
                                    {(selectedChallenge?.examples || []).map((ex, i) => (
                                        <Box
                                            key={`${ex.input}-${i}`}
                                            bg="#0f172a"
                                            borderRadius="10px"
                                            p={4}
                                            border="1px solid"
                                            borderColor="#1e293b"
                                        >
                                            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                                                Example {i + 1}
                                            </Text>
                                            <Box fontFamily="mono" fontSize="13px" lineHeight="1.8">
                                                <Text color="gray.400">
                                                    <Text as="span" color="#94a3b8" fontWeight="semibold">Input: </Text>
                                                    {ex.input}
                                                </Text>
                                                <Text color="#22c55e">
                                                    <Text as="span" color="#94a3b8" fontWeight="semibold">Output: </Text>
                                                    {ex.output}
                                                </Text>
                                                {ex.explanation && (
                                                    <Text color="gray.500" fontStyle="italic" mt={1}>
                                                        {ex.explanation}
                                                    </Text>
                                                )}
                                            </Box>
                                        </Box>
                                    ))}
                                </VStack>
                            </Collapse>
                        </Box>

                        <Flex
                            w={{ base: '100%', lg: '60%' }}
                            direction="column"
                            bg="#0f172a"
                        >
                            <EditorToolbar
                                language={language}
                                setLanguage={handleLanguageChange}
                                isRunning={isRunning}
                                onRun={handleRunCode}
                                onReset={handleReset}
                            />

                            <CodeEditor
                                code={code}
                                onChange={setCode}
                                language={language}
                                height="300px"
                            />

                            <OutputTerminal output={output} isRunning={false} />
                        </Flex>
                    </Flex>
                </MotionBox>
            </Container>

            <Modal isOpen={isChooserOpen} onClose={closeChooser} size="md" isCentered>
                <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(2px)" />
                <ModalContent bg="#111827" border="1px solid" borderColor="#1e293b" borderRadius="14px">
                    <ModalHeader color="gray.100" fontFamily="heading" fontSize="lg">
                        Choose Challenge
                    </ModalHeader>
                    <ModalCloseButton color="gray.400" />
                    <ModalBody pb={4}>
                        <VStack align="stretch" spacing={2} maxH="360px" overflowY="auto" pr={1}
                            sx={{
                                '&::-webkit-scrollbar': { width: '5px' },
                                '&::-webkit-scrollbar-track': { bg: 'transparent' },
                                '&::-webkit-scrollbar-thumb': { bg: '#334155', borderRadius: '3px' },
                            }}
                        >
                            {challengeList.map((challenge) => {
                                const difficulty = normalizeDifficulty(challenge.difficulty);
                                const active = selectedChallenge?.id === challenge.id;

                                return (
                                    <Button
                                        key={challenge.id}
                                        justifyContent="space-between"
                                        variant="ghost"
                                        px={3}
                                        py={5}
                                        h="auto"
                                        border="1px solid"
                                        borderColor={active ? '#22d3ee' : '#1e293b'}
                                        bg={active ? 'rgba(34, 211, 238, 0.08)' : 'transparent'}
                                        _hover={{
                                            borderColor: '#22d3ee',
                                            bg: 'rgba(34, 211, 238, 0.06)',
                                        }}
                                        onClick={() => handleSelectChallenge(challenge)}
                                    >
                                        <VStack align="start" spacing={1}>
                                            <Text color="gray.100" fontSize="sm" fontWeight="semibold" textAlign="left">
                                                {challenge.title}
                                            </Text>
                                        </VStack>
                                        <Badge
                                            bg={`${difficulty.hex}20`}
                                            color={difficulty.hex}
                                            fontSize="xs"
                                            px={2}
                                            py={0.5}
                                            borderRadius="6px"
                                            fontWeight="semibold"
                                        >
                                            {difficulty.label}
                                        </Badge>
                                    </Button>
                                );
                            })}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TryChallenge;