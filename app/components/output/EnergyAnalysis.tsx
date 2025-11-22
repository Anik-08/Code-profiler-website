// components/output/EnergyAnalysis.tsx

"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import { EnergyAnalysis, Hotspot } from "../../../lib/types";

interface EnergyAnalysisPanelProps {
  analysis: EnergyAnalysis | null;
}

export function EnergyAnalysisPanel({ analysis }: EnergyAnalysisPanelProps) {
  return (
    <div className="flex-1 rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/30 to-slate-900/50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div>
          <div className="text-sm font-medium text-slate-300">Energy Analysis</div>
          <div className="text-xs text-slate-600">Pattern-based analyzer v1</div>
        </div>
        {analysis && <ScoreBadge score={analysis.fileScore} />}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {analysis ? (
          <AnalysisContent analysis={analysis} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 0.75 ? "text-emerald-400" : score >= 0.5 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="text-right">
      <div className="text-xs text-slate-500">Efficiency</div>
      <div className={`text-2xl font-bold ${color}`}>
        {(score * 100).toFixed(0)}
      </div>
    </div>
  );
}

function AnalysisContent({ analysis }: { analysis: EnergyAnalysis }) {
  return (
    <>
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-linear-to-r from-violet-500 via-emerald-400 to-emerald-300 transition-all duration-500"
          style={{ width: `${analysis.fileScore * 100}%` }}
        />
      </div>

      {/* Total energy */}
      {analysis.totalEstimate_mJ > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <span className="text-xs text-slate-400">Estimated Energy</span>
          <span className="text-sm font-semibold text-amber-400">
            {analysis.totalEstimate_mJ.toFixed(2)} mJ
          </span>
        </div>
      )}

      {/* Hotspots */}
      {analysis.hotspots.length > 0 ? (
        <HotspotList hotspots={analysis.hotspots} />
      ) : (
        <NoHotspots />
      )}
    </>
  );
}

function HotspotList({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
        Hotspots ({hotspots.length})
      </div>
      <div className="space-y-2">
        {hotspots.map((hotspot, index) => (
          <HotspotCard key={index} hotspot={hotspot} />
        ))}
      </div>
    </>
  );
}

function HotspotCard({ hotspot }: { hotspot: Hotspot }) {
  const dotColor = hotspot.score >= 0.75 ? "bg-rose-500" : hotspot.score >= 0.5 ? "bg-amber-500" : "bg-emerald-500";
  const scoreColor = hotspot.score >= 0.75 ? "text-rose-400" : hotspot.score >= 0.5 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
      <div className="flex items-start gap-3">
        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Lines {hotspot.startLine}–{hotspot.endLine}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
              {hotspot.type}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Score <span className={scoreColor}>{(hotspot.score * 100).toFixed(0)}%</span>
            <span className="text-emerald-400 ml-2">
              ~{hotspot.estimate_mJ.toFixed(2)} mJ
            </span>
          </div>
          {hotspot.suggestion && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {hotspot.suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function NoHotspots() {
  return (
    <div className="text-center py-8">
      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
      <p className="text-sm text-slate-400">No major hotspots detected!</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
      <p className="text-sm text-slate-500">Run analysis to see energy hotspots</p>
    </div>
  );
}