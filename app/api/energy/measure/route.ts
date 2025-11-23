// app/api/energy/measure/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SupportedLanguage } from "@/lib/types";

// Use environment variable in production
const PYTHON_SERVICE_URL = 
  process.env.NEXT_PUBLIC_PYTHON_SERVICE_URL || 
  process.env.PYTHON_SERVICE_URL || 
  "http://localhost:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      );
    }

    const supportedLanguages: SupportedLanguage[] = ["python", "javascript", "cpp", "java"];
    if (!supportedLanguages.includes(language as SupportedLanguage)) {
      return NextResponse.json(
        { 
          error: `Language not supported for energy measurement`,
          supported: supportedLanguages
        },
        { status: 400 }
      );
    }

    // Call Python microservice
    const response = await fetch(`${PYTHON_SERVICE_URL}/measure`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        code,
        stdin: stdin || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: "Measurement service error", 
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Measurement error:", error);
    
    if ((error as unknown as { code?: string }).code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: "Energy measurement service not available",
          hint: "Backend service may be starting up (can take 1-2 min on free tier)",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Measurement failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "available",
        service: data,
      });
    } else {
      return NextResponse.json({
        status: "unavailable",
        message: "Service not responding",
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "unavailable",
      message: "Service not running",
    });
  }
}