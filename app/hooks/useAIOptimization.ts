// app/hooks/useAIOptimization.ts - Update fetch URL

import { useState, useCallback } from "react";
import { SupportedLanguage, Hotspot } from "../../lib/types";

export interface OptimizationSuggestion {
  type: string;
  title: string;
  description: string;
  example?: string;
  severity?: number;
}

export interface OptimizationResult {
  status: string;
  method?: string;
  model?: string;
  optimized_code?: string;
  suggestions: OptimizationSuggestion[];
  ai_available?: boolean;
  confidence?: number;
}

const PYTHON_SERVICE_URL = 
  process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 
  "http://localhost:5001";

export function useAIOptimization() {
  const [optimizations, setOptimizations] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async (
    language: SupportedLanguage,
    code: string,
    hotspots: Hotspot[] = [],
    useAI: boolean = false
  ) => {
    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch(`${PYTHON_SERVICE_URL}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code,
          hotspots: hotspots.map(h => ({
            startLine: h.startLine,
            endLine: h.endLine,
            score: h.score,
            type: h.type,
            suggestion: h.suggestion
          })),
          use_ai: useAI
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Optimization failed");
      }

      const data = await response.json();
      setOptimizations(data);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      console.error("Optimization error:", errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setOptimizations(null);
    setError(null);
  }, []);

  return {
    optimizations,
    isOptimizing,
    error,
    optimize,
    reset,
  };
}