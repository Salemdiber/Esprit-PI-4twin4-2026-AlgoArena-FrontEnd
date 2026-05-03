/**
 * Editor module – barrel exports.
 *
 * Usage:
 *   import { CodeEditor, EditorToolbar, OutputTerminal, useEditorState } from '../editor';
 */
export { default as CodeEditor } from './components/CodeEditor';
export { default as EditorToolbar } from './components/EditorToolbar';
export { default as LanguageSelector } from './components/LanguageSelector';
export { default as RunButton } from './components/RunButton';
export { default as OutputTerminal } from './components/OutputTerminal';
export { default as useEditorState } from './hooks/useEditorState';
export {
    defaultEditorOptions,
    defineAlgoArenaTheme,
    LANGUAGE_MAP,
    DEMO_TEMPLATES,
} from './config/editorOptions';
