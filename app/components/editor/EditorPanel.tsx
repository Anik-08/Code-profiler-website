// components/editor/EditorPanel.tsx
// Combines CodeEditor and EditorToolbar into one cohesive panel

"use client";

import { CodeEditor } from "./CodeEditor";
import { EditorToolbar } from "./EditorToolbar";
import { SupportedLanguage } from "../../../lib/types";

interface EditorPanelProps {
  language: SupportedLanguage;
  code: string;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onAnalyze: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export function EditorPanel({
  language,
  code,
  onLanguageChange,
  onCodeChange,
  onRun,
  onAnalyze,
  isRunning,
  isAnalyzing,
}: EditorPanelProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">Code Editor</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">
            Monaco
          </span>
        </div>

        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[400px]">
        <CodeEditor
          language={language}
          value={code}
          onChange={onCodeChange}
        />
      </div>

      {/* Bottom toolbar with actions */}
      <EditorToolbar
        language={language}
        onLanguageChange={onLanguageChange}
        onRun={onRun}
        onAnalyze={onAnalyze}
        isRunning={isRunning}
        isAnalyzing={isAnalyzing}
      />
    </div>
  );
}