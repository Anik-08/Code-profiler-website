// lib/types.ts

export type SupportedLanguage = "javascript" | "python" | "cpp";

export interface RunRequest {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
}

export interface RunResponse {
  output: string;
  error?: string;
  executionTime?: number;
  status: "success" | "error" | "idle";
  memoryUsed?: number; // optional memory usage in KB from external services
}

export interface Hotspot {
  startLine: number;
  endLine: number;
  score: number;
  estimate_mJ: number;
  suggestion?: string;
  type: "loop" | "recursion" | "io" | "memory" | "algorithm";
}

export interface EnergyAnalysis {
  fileScore: number;
  hotspots: Hotspot[];
  totalEstimate_mJ: number;
}

// Request payload for energy analysis API
export interface EnergyAnalysisRequest {
  language: SupportedLanguage;
  code: string;
}

// Extended response including suggestions list
export interface EnergyAnalysisResponse extends EnergyAnalysis {
  suggestions: string[];
}

export interface MetricData {
  label: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon: React.ElementType;
  color: "emerald" | "violet" | "amber";
}

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}