// components/output/OutputPanel.tsx

"use client";

import { Terminal, CheckCircle2, AlertTriangle } from "lucide-react";
import { RunResponse } from "../../../lib/types";

interface OutputPanelProps {
  output: string;
  status: RunResponse["status"];
  executionTime: number | null;
}

export function OutputPanel({ output, status, executionTime }: OutputPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Output</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <TimeBadge time={executionTime} />
        </div>
      </div>

      {/* Output content */}
      <pre className="p-4 text-sm font-mono text-slate-300 bg-slate-950/30 min-h-24 max-h-40 overflow-auto whitespace-pre-wrap">
        {output || "Click 'Run & Analyze' to execute your code"}
      </pre>
    </div>
  );
}

function StatusBadge({ status }: { status: RunResponse["status"] }) {
  if (status === "idle") return null;

  const isSuccess = status === "success";

  return (
    <span
      className={`flex items-center gap-1 text-xs ${
        isSuccess ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {isSuccess ? "Success" : "Error"}
    </span>
  );
}

function TimeBadge({ time }: { time: number | null }) {
  if (time === null) return null;

  return (
    <span className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      {time.toFixed(3)}s
    </span>
  );
}