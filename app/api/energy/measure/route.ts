// app/api/energy/measure/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SupportedLanguage, RealEnergyMeasurement } from "@/lib/types";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { language?: SupportedLanguage; code?: string; stdin?: string };
    const { language, code, stdin } = body;

    // Validate
    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      );
    }

    // CodeCarbon only supports Python
    if (language !== "python") {
      return NextResponse.json(
        { 
          error: "Real energy measurement only supports Python",
          hint: "Use the pattern-based analysis for JavaScript and C++"
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
          error: "Python service error", 
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Basic shape validation before returning
    const measurement: RealEnergyMeasurement = {
      status: data.status || "success",
      output: data.output || "",
      error: data.error,
      executionTime: data.executionTime ?? (data.time_ms ?? 0),
      energy: {
        total_kwh: data.energy?.total_kwh ?? data.total_kwh ?? 0,
        total_wh: data.energy?.total_wh ?? data.total_wh ?? 0,
        total_mj: data.energy?.total_mj ?? data.total_mj ?? 0,
        co2_emissions_kg: data.energy?.co2_emissions_kg ?? data.co2_emissions_kg ?? 0,
        co2_emissions_g: data.energy?.co2_emissions_g ?? data.co2_emissions_g ?? 0,
      },
      hardware: {
        cpu_energy: data.hardware?.cpu_energy ?? "0",
        gpu_energy: data.hardware?.gpu_energy ?? "0",
        ram_energy: data.hardware?.ram_energy ?? "0",
      },
      measurement_method: "codecarbon",
    };
    return NextResponse.json(measurement);

  } catch (error) {
    console.error("Measurement error:", error);
    
    // Check if Python service is running
    if ((error as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: "Python service not available",
          hint: "Make sure the Python service is running on port 5001",
          setup: "cd python-service && python energy_service.py"
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
    // Health check for Python service
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "available",
        pythonService: data,
      });
    } else {
      return NextResponse.json({
        status: "unavailable",
        message: "Python service not responding",
      });
    }
  } catch {
    return NextResponse.json({
      status: "unavailable",
      message: "Python service not running",
      hint: "Start with: cd python-service && python energy_service.py",
    });
  }
}