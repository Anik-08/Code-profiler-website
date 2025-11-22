// app/api/energy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { analyzeEnergy } from "@/lib/energy-analyzer";
import { SupportedLanguage, EnergyAnalysisRequest } from "@/lib/types";
import { LANGUAGE_CONFIG } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body: EnergyAnalysisRequest = await request.json();
    const { language, code } = body;

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

    // Analyze energy consumption patterns
    const analysis = analyzeEnergy(language as SupportedLanguage, code);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Energy analysis error:", error);
    return NextResponse.json(
      { error: `Analysis failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    model: "static-pattern-analyzer-v1",
    supportedLanguages: Object.keys(LANGUAGE_CONFIG),
    patternTypes: ["loop", "recursion", "io", "memory", "algorithm"],
  });
}