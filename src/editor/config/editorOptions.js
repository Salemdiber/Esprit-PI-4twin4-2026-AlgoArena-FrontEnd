/**
 * Editor configuration – shared options + custom theme for Monaco.
 *
 * AlgoArena custom dark theme:
 *   - Background #0f172a (matches app bg)
 *   - Cyan (#22d3ee) accents for cursor, selections, active line
 *   - Muted grays for syntax – clean, minimal contrast
 */

/** Default Monaco editor options (spread into <Editor />) */
export const defaultEditorOptions = {
    fontSize: 15,
    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', 'Consolas', monospace",
    fontLigatures: true,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    smoothScrolling: false,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'advanced',
    bracketPairColorization: { enabled: true },
    matchBrackets: 'always',
    renderLineHighlight: 'all',
    padding: { top: 16, bottom: 16 },
    roundedSelection: true,
    selectOnLineNumbers: true,
    wordWrap: 'off',
    tabSize: 2,
    // Disable heavy features for performance
    quickSuggestions: false,
    parameterHints: { enabled: false },
    suggestOnTriggerCharacters: false,
    hover: { enabled: false },
    codeLens: false,
    folding: true,
    foldingHighlight: false,
    links: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollbar: {
        vertical: 'visible',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
    },
};

/**
 * Register &  define the custom AlgoArena dark theme.
 * Call this once inside the `beforeMount` callback of <Editor />.
 *
 * @param {import('monaco-editor')} monaco
 */
export const defineAlgoArenaTheme = (monaco) => {
    monaco.editor.defineTheme('algoarena-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            // Keywords
            { token: 'keyword', foreground: 'c792ea', fontStyle: 'italic' },
            { token: 'keyword.control', foreground: 'c792ea' },
            // Functions
            { token: 'entity.name.function', foreground: '82aaff' },
            { token: 'support.function', foreground: '82aaff' },
            // Strings
            { token: 'string', foreground: 'ecc48d' },
            { token: 'string.quoted', foreground: 'ecc48d' },
            // Numbers
            { token: 'number', foreground: 'f78c6c' },
            { token: 'constant.numeric', foreground: 'f78c6c' },
            // Comments
            { token: 'comment', foreground: '546e7a', fontStyle: 'italic' },
            // Variables / types
            { token: 'variable', foreground: 'e4e4e4' },
            { token: 'type', foreground: '22d3ee' },
            { token: 'type.identifier', foreground: '22d3ee' },
            // Operators
            { token: 'operator', foreground: '89ddff' },
            // Delimiter / brackets
            { token: 'delimiter', foreground: '89ddff' },
            { token: 'delimiter.bracket', foreground: 'e4e4e4' },
        ],
        colors: {
            // Editor
            'editor.background': '#0f172a',
            'editor.foreground': '#e2e8f0',
            'editor.lineHighlightBackground': '#1e293b80',
            'editor.lineHighlightBorder': '#22d3ee15',
            'editor.selectionBackground': '#22d3ee30',
            'editor.inactiveSelectionBackground': '#22d3ee15',
            // Cursor
            'editorCursor.foreground': '#22d3ee',
            // Line numbers
            'editorLineNumber.foreground': '#475569',
            'editorLineNumber.activeForeground': '#94a3b8',
            // Indent guides
            'editorIndentGuide.background': '#1e293b',
            'editorIndentGuide.activeBackground': '#334155',
            // Gutter
            'editorGutter.background': '#0f172a',
            // Widget (autocomplete, etc.)
            'editorWidget.background': '#1e293b',
            'editorWidget.border': '#334155',
            // Scrollbar
            'scrollbar.shadow': '#00000000',
            'scrollbarSlider.background': '#33415580',
            'scrollbarSlider.hoverBackground': '#475569',
            'scrollbarSlider.activeBackground': '#22d3ee40',
            // Bracket match
            'editorBracketMatch.background': '#22d3ee20',
            'editorBracketMatch.border': '#22d3ee60',
            // Minimap (disabled but just in case)
            'minimap.background': '#0f172a',
        },
    });
};

/**
 * Language ID map for Monaco.
 * Converts app-level language names → Monaco language identifiers.
 */
export const LANGUAGE_MAP = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'cpp',
    java: 'java',
    typescript: 'typescript',
    c: 'c',
};

/**
 * Default code templates per language for the landing-page demo.
 */
export const DEMO_TEMPLATES = {
    javascript: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`,
    python: `def two_sum(nums, target):
    # Your code here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i`,
    cpp: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`,
};
