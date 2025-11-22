// components/editor/EditorToolbar.tsx

"use client";

import { Play, Activity, Loader2, Lightbulb } from "lucide-react";
import { SupportedLanguage } from "@/lib/types";
import { LANGUAGE_CONFIG } from "../../../lib/constants";

interface EditorToolbarProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onRun: () => void;
  onAnalyze: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}

export function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onAnalyze,
  isRunning,
  isAnalyzing,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">Code Editor</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-medium">
            Monaco
          </span>
        </div>

        <LanguageSelect 
          value={language} 
          onChange={onLanguageChange} 
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-800/20">
        <Tip />
        <ActionButtons
          onRun={onRun}
          onAnalyze={onAnalyze}
          isRunning={isRunning}
          isAnalyzing={isAnalyzing}
        />
      </div>
    </div>
  );
}

function LanguageSelect({ 
  value, 
  onChange 
}: { 
  value: SupportedLanguage; 
  onChange: (lang: SupportedLanguage) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SupportedLanguage)}
      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
    >
      {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
}

function Tip() {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <Lightbulb className="w-4 h-4" />
      <span>Ctrl+Space for suggestions • Auto-brackets enabled</span>
    </div>
  );
}

function ActionButtons({
  onRun,
  onAnalyze,
  isRunning,
  isAnalyzing,
}: {
  onRun: () => void;
  onAnalyze: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-sm font-medium text-slate-300 hover:bg-slate-600/50 disabled:opacity-50 transition-all"
      >
        {isAnalyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Activity className="w-4 h-4" />
        )}
        Analyze
      </button>

      <button
        onClick={onRun}
        disabled={isRunning || isAnalyzing}
        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-linear-to-r from-violet-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 disabled:opacity-50 transition-all"
      >
        {isRunning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        Run & Analyze
      </button>
    </div>
  );
}