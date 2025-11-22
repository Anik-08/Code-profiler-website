// hooks/useEnergyAnalysis.ts

import { useState, useCallback } from "react";
import { SupportedLanguage, EnergyAnalysis, Hotspot } from "../../lib/types";

const PATTERNS: Record<string, { 
  regex: RegExp; 
  type: Hotspot["type"]; 
  score: number; 
  suggestion: string;
}[]> = {
  javascript: [
    { 
      regex: /for\s*\([^)]*\)[\s\S]*?for\s*\([^)]*\)/g, 
      type: "loop", 
      score: 0.82, 
      suggestion: "Nested loops detected. Consider using a hash map for O(n) lookup." 
    },
    { 
      regex: /\.forEach[\s\S]*?\.forEach/g, 
      type: "loop", 
      score: 0.75, 
      suggestion: "Nested forEach. Use reduce or single loop with object lookup." 
    },
    { 
      regex: /\.filter\([^)]*\)\.map/g, 
      type: "algorithm", 
      score: 0.5, 
      suggestion: "Chained filter/map. Consider using reduce for single pass." 
    },
  ],
  python: [
    { 
      regex: /for\s+\w+\s+in[\s\S]*?for\s+\w+\s+in/g, 
      type: "loop", 
      score: 0.82, 
      suggestion: "Nested loops detected. Consider using set/dict for O(1) lookup." 
    },
    { 
      regex: /\.append\([^)]*\)/g, 
      type: "memory", 
      score: 0.4, 
      suggestion: "Dynamic list growth. Consider list comprehension or pre-allocation." 
    },
  ],
  cpp: [
    { 
      regex: /for\s*\([^)]*\)[\s\S]*?for\s*\([^)]*\)/g, 
      type: "loop", 
      score: 0.82, 
      suggestion: "Nested loops detected. Consider using unordered_map for O(1) lookup." 
    },
    { 
      regex: /\.push_back\(/g, 
      type: "memory", 
      score: 0.45, 
      suggestion: "Dynamic vector growth. Use reserve() to pre-allocate capacity." 
    },
  ],
};

function getLineNumber(code: string, index: number): number {
  return code.substring(0, index).split("\n").length;
}

export function useEnergyAnalysis() {
  const [analysis, setAnalysis] = useState<EnergyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback((language: SupportedLanguage, code: string) => {
    setIsAnalyzing(true);

    // Simulate async analysis
    setTimeout(() => {
      const patterns = PATTERNS[language] || PATTERNS.javascript;
      const hotspots: Hotspot[] = [];

      for (const pattern of patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;

        while ((match = regex.exec(code)) !== null) {
          const startLine = getLineNumber(code, match.index);
          const endLine = getLineNumber(code, match.index + match[0].length);

          hotspots.push({
            startLine,
            endLine,
            score: pattern.score + Math.random() * 0.1,
            estimate_mJ: (endLine - startLine + 1) * 0.01,
            suggestion: pattern.suggestion,
            type: pattern.type,
          });
        }
      }

      // Sort by score descending
      hotspots.sort((a, b) => b.score - a.score);

      // Calculate file score
      const avgScore = hotspots.length > 0
        ? hotspots.reduce((sum, h) => sum + h.score, 0) / hotspots.length
        : 0;
      const fileScore = Math.max(0.1, 1 - avgScore * 0.5);

      setAnalysis({
        fileScore,
        hotspots: hotspots.slice(0, 5),
        totalEstimate_mJ: hotspots.reduce((sum, h) => sum + h.estimate_mJ, 0),
      });

      setIsAnalyzing(false);
    }, 800);
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    analyze,
    reset,
  };
}