import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { BirthData } from "@/types/astrology";

interface BirthChartRequest {
  birthData: BirthData;
}

interface BirthChartData {
  svg: string;
  signSummary: string;
  houseBreakdown: string[];
}

interface BirthChartResult {
  success: boolean;
  data?: {
    svg_chart: string;
    sign_summary: string;
    house_breakdown: string[];
  };
  error?: string;
}

function callPythonScript(action: string, data: object): Promise<BirthChartResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(process.cwd(), 'src/services/astrology-python/simple_astrology.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath, action, JSON.stringify(data)]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        resolve({
          success: false,
          error: `Python script failed with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        resolve({
          success: false,
          error: `Failed to parse Python output: ${error}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Failed to spawn Python process:', error);
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${error.message}`
      });
    });
    
    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'Python script timeout'
      });
    }, 30000); // 30 second timeout
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: BirthChartRequest = await request.json();
    
    // Validate input
    if (!body.birthData) {
      return NextResponse.json(
        { success: false, error: "Birth data is required" },
        { status: 400 }
      );
    }

    // Convert birth data to proper format for Python script
    const birthData = {
      name: body.birthData.name || 'User',
      year: new Date(body.birthData.date).getFullYear(),
      month: new Date(body.birthData.date).getMonth() + 1,
      day: new Date(body.birthData.date).getDate(),
      hour: new Date(body.birthData.date).getHours(),
      minute: new Date(body.birthData.date).getMinutes(),
      city: body.birthData.city,
      country: body.birthData.country || ""
    };

    // Call Python script for birth chart generation
    const chartResult = await callPythonScript('birth_chart', birthData);

    if (!chartResult.success || !chartResult.data) {
      // Fallback to data temporarily unavailable
      return NextResponse.json({
        success: true,
        data: {
          svg: '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="180" fill="none" stroke="#6B7280" stroke-width="2" stroke-dasharray="10,5"/><text x="200" y="200" text-anchor="middle" fill="#6B7280" font-size="16">Chart Unavailable</text></svg>',
          signSummary: "Birth chart temporarily unavailable. Our astrological calculation service is currently offline. We use authentic astronomical calculations with Swiss Ephemeris data to generate your complete natal chart. Please try again in a few moments.",
          houseBreakdown: [
            "Birth chart service temporarily unavailable",
            "Please try again in a few moments",
            "We use Swiss Ephemeris for accurate calculations"
          ],
          isUnavailable: true
        }
      });
    }

    // Transform Python response to expected format
    const birthChartData: BirthChartData = {
      svg: chartResult.data.svg_chart,
      signSummary: chartResult.data.sign_summary,
      houseBreakdown: chartResult.data.house_breakdown
    };

    return NextResponse.json({
      success: true,
      data: birthChartData
    });

  } catch (error) {
    console.error('Birth chart API error:', error);
    
    // Fail-safe fallback
    return NextResponse.json({
      success: true,
      data: {
        svg: '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="180" fill="none" stroke="#6B7280" stroke-width="2" stroke-dasharray="10,5"/><text x="200" y="200" text-anchor="middle" fill="#6B7280" font-size="16">Chart Unavailable</text></svg>',
        signSummary: "We're currently experiencing technical difficulties with our astrological calculation service. Please try again in a few moments.",
        houseBreakdown: [
          "Service temporarily unavailable",
          "Please try again later",
          "Your chart will be available when service is restored"
        ],
        isUnavailable: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}