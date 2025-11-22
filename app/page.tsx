// app/page.tsx

"use client";

import { useState, useCallback } from "react";
import { Zap, FileText, Flame } from "lucide-react";

// Layout components
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";

// Dashboard components
import { MetricCards } from "./components/dashboard/MetricCard";
import { TabNav } from "./components/dashboard/TabNav";

// Editor components
import { EditorPanel } from "./components/editor/EditorPanel";

// Output components
import { OutputPanel } from "./components/output/OutputPanel";
import { EnergyAnalysisPanel } from "./components/output/EnergyAnalysis";

// Hooks
import { useCodeRunner } from "./hooks/useCodeRunner";
import { useEnergyAnalysis } from "./hooks/useEnergyAnalysis";

// Types & Constants
import { SupportedLanguage, MetricData } from "../lib/types";
import { DEFAULT_CODE } from "../lib/constants";

// Tab configuration
const TABS = [
  { id: "compiler", label: "Compiler" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "achievements", label: "Achievements" },
];

// Metrics data
const METRICS: MetricData[] = [
  {
    label: "Energy Saved",
    value: "1,234.5",
    unit: "mJ",
    subtitle: "vs. naive implementations",
    icon: Zap,
    color: "emerald",
  },
  {
    label: "Files Optimized",
    value: "24",
    subtitle: "this week",
    icon: FileText,
    color: "violet",
  },
  {
    label: "Day Streak",
    value: "7",
    subtitle: "days coding efficiently",
    icon: Flame,
    color: "amber",
  },
];

export default function DashboardPage() {
  // Editor state
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [activeTab, setActiveTab] = useState("compiler");

  // Custom hooks for code execution and analysis
  const { output, status, executionTime, isRunning, runCode } = useCodeRunner();
  const { analysis, isAnalyzing, analyze } = useEnergyAnalysis();

  // Handle language change
  const handleLanguageChange = useCallback((newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  }, []);

  // Handle code change
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  // Run code and analyze
  const handleRun = useCallback(async () => {
    await runCode(language, code);
    analyze(language, code);
  }, [language, code, runCode, analyze]);

  // Analyze only
  const handleAnalyze = useCallback(() => {
    analyze(language, code);
  }, [language, code, analyze]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30">
        {/* Header */}
        <Header />

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Metric Cards */}
          <div className="mb-6">
            <MetricCards metrics={METRICS} />
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <TabNav
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Main Grid: Editor + Output */}
          <div className="grid grid-cols-5 gap-4" style={{ minHeight: "500px" }}>
            {/* Code Editor - takes 3 columns */}
            <div className="col-span-3">
              <EditorPanel
                language={language}
                code={code}
                onLanguageChange={handleLanguageChange}
                onCodeChange={handleCodeChange}
                onRun={handleRun}
                onAnalyze={handleAnalyze}
                isRunning={isRunning}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Right Panel - takes 2 columns */}
            <div className="col-span-2 flex flex-col gap-4">
              {/* Output Panel */}
              <OutputPanel
                output={output}
                status={status}
                executionTime={executionTime}
              />

              {/* Energy Analysis Panel */}
              <EnergyAnalysisPanel analysis={analysis} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}