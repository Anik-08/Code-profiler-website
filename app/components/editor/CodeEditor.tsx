// components/editor/CodeEditor.tsx

"use client";

import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import { useRef, useCallback } from "react";
import type * as monacoTypes from "monaco-editor";
import { SupportedLanguage } from "@/lib/types";
import { LANGUAGE_CONFIG } from "../../../lib/constants";

interface CodeEditorProps {
  language: SupportedLanguage;
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export function CodeEditor({ 
  language, 
  value, 
  onChange, 
  height = "100%" 
}: CodeEditorProps) {
  const editorRef = useRef<monacoTypes.editor.IStandaloneCodeEditor | null>(null);

const handleMount: OnMount = useCallback((editor, monaco) => {
  editorRef.current = editor;
  
  editor.updateOptions({
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: 22,
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    wordWrap: "on",
  });

    // Define custom theme
    monaco.editor.defineTheme("energy-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "type", foreground: "4EC9B0" },
      ],
      colors: {
        "editor.background": "#0a0a0f",
        "editor.foreground": "#d4d4d4",
        "editor.lineHighlightBackground": "#1a1a2e",
        "editor.selectionBackground": "#264f78",
        "editorCursor.foreground": "#a78bfa",
        "editorLineNumber.foreground": "#4a5568",
        "editorLineNumber.activeForeground": "#a78bfa",
        "editor.inactiveSelectionBackground": "#3a3d41",
      },
    });

    monaco.editor.setTheme("energy-dark");

    // Focus editor
    editor.focus();
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || "");
  }, [onChange]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-700/50">
      <Editor
        height={height}
        language={LANGUAGE_CONFIG[language].monacoLang}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        loading={
          <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="text-slate-500 text-sm">Loading editor...</div>
          </div>
        }
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  );
}