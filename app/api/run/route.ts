// app/api/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { compileAndRun } from "@/lib/compiler";
import { RunRequest, SupportedLanguage } from "@/lib/types";
import { LANGUAGE_CONFIG } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 30; // Max 30 seconds for compilation

export async function POST(request: NextRequest) {
  try {
    const body: RunRequest = await request.json();
    const { language, code, stdin } = body;

    // Validate language
    if (!language || !Object.keys(LANGUAGE_CONFIG).includes(language)) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    // Validate code
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Code size limit (100KB)
    if (code.length > 100000) {
      return NextResponse.json(
        { error: "Code exceeds maximum size limit (100KB)" },
        { status: 400 }
      );
    }

    // Determine which compiler to use based on env
    let compiler: "piston" | "judge0" | "jdoodle" = "piston";
    if (process.env.JUDGE0_API_KEY) compiler = "judge0";
    else if (process.env.JDOODLE_CLIENT_ID) compiler = "jdoodle";

    // Run the code
    const result = await compileAndRun(
      language as SupportedLanguage,
      code,
      stdin,
      compiler
    );

    return NextResponse.json({
      output: result.output,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      status: result.status,
      compiler,
    });
  } catch (error) {
    console.error("Run API error:", error);
    return NextResponse.json(
      { error: `Server error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    supportedLanguages: Object.keys(LANGUAGE_CONFIG),
    compiler: process.env.JUDGE0_API_KEY
      ? "judge0"
      : process.env.JDOODLE_CLIENT_ID
      ? "jdoodle"
      : "piston",
  });
}