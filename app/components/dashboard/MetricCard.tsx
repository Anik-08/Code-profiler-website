// components/dashboard/MetricCard.tsx

"use client";

import { MetricData } from "@/lib/types";

const colorClasses = {
  emerald: {
    icon: "text-emerald-400",
    value: "text-emerald-400",
  },
  violet: {
    icon: "text-violet-400",
    value: "text-slate-100",
  },
  amber: {
    icon: "text-amber-400",
    value: "text-amber-400",
  },
};

export function MetricCard({ metric }: { metric: MetricData }) {
  const Icon = metric.icon;
  const colors = colorClasses[metric.color];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/50 to-slate-900/50 p-5 hover:border-slate-600/50 transition-all duration-300">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {metric.label}
          </span>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${colors.value}`}>
            {metric.value}
          </span>
          {metric.unit && (
            <span className="text-sm text-slate-500">{metric.unit}</span>
          )}
        </div>

        {/* Subtitle */}
        <div className="text-xs text-slate-600 mt-1">
          {metric.subtitle}
        </div>
      </div>
    </div>
  );
}

// Grid wrapper for multiple cards
export function MetricCards({ metrics }: { metrics: MetricData[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}