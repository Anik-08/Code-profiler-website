// hooks/useCodeRunner.ts

import { useState, useCallback } from "react";
import { SupportedLanguage, RunResponse } from "../../lib/types";
import { LANGUAGE_CONFIG, PISTON_API_URL } from "../../lib/constants";

export function useCodeRunner() {
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<RunResponse["status"]>("idle");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = useCallback(async (language: SupportedLanguage, code: string) => {
    setIsRunning(true);
    setStatus("idle");
    setOutput("⏳ Compiling and running...");

    const config = LANGUAGE_CONFIG[language];
    const startTime = performance.now();

    try {
      const response = await fetch(PISTON_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: config.pistonLang,
          version: config.pistonVersion,
          files: [{ 
            name: `main${config.extension}`, 
            content: code 
          }],
        }),
      });

      const data = await response.json();
      const elapsed = (performance.now() - startTime) / 1000;
      setExecutionTime(elapsed);

      if (data.run?.stderr) {
        setOutput(data.run.stderr);
        setStatus("error");
      } else {
        setOutput(data.run?.output || "No output");
        setStatus("success");
      }
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
      setStatus("error");
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setOutput("");
    setStatus("idle");
    setExecutionTime(null);
  }, []);

  return {
    output,
    status,
    executionTime,
    isRunning,
    runCode,
    reset,
  };
}