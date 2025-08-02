import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
interface MoonPhaseData {
  phase: string;
  illumination: number;
  emoji: string;
  nextFullMoon: string;
  nextNewMoon: string;
}
interface MoonPhaseResult {
  success: boolean;
  data?: {
    phase_name: string;
    illumination: number;
    age_days: number;
    distance_km: number;
    angular_size_arcmin: number;
    next_full_moon: string;
    next_new_moon: string;
    zodiac_sign?: string;
  };
  error?: string;
}
function getMoonEmoji(phaseName: string): string {
  const phase = phaseName.toLowerCase();
  
  if (phase.includes('new')) return '🌑';
  if (phase.includes('waxing crescent')) return '🌒';
  if (phase.includes('first quarter')) return '🌓';
  if (phase.includes('waxing gibbous')) return '🌔';
  if (phase.includes('full')) return '🌕';
  if (phase.includes('waning gibbous')) return '🌖';
  if (phase.includes('last quarter') || phase.includes('third quarter')) return '🌗';
  if (phase.includes('waning crescent')) return '🌘';
  
  // Default based on illumination if phase name doesn't match
  return '🌙';
}
function callPythonScript(action: string): Promise<MoonPhaseResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(process.cwd(), 'src/services/astrology-python/simple_astrology.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath, action]);
    
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
export async function GET() {
  try {
    // Call Python script for moon phase calculation
    const moonResult = await callPythonScript('moon_phase');
    if (!moonResult.success || !moonResult.data) {
      // Fallback to data temporarily unavailable
      return NextResponse.json({
        success: true,
        data: {
          phase: "Moon phase temporarily unavailable",
          illumination: 0,
          emoji: "🌙",
          nextFullMoon: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          nextNewMoon: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isUnavailable: true
        }
      });
    }
    // Transform Python response to expected format
    const moonData: MoonPhaseData = {
      phase: moonResult.data.phase_name,
      illumination: Math.round(moonResult.data.illumination * 100), // Convert to percentage
      emoji: getMoonEmoji(moonResult.data.phase_name),
      nextFullMoon: moonResult.data.next_full_moon,
      nextNewMoon: moonResult.data.next_new_moon
    };
    return NextResponse.json({
      success: true,
      data: moonData
    });
  } catch (error) {
    console.error('Moon phase API error:', error);
    
    // Fail-safe fallback
    return NextResponse.json({
      success: true,
      data: {
        phase: "Moon phase temporarily unavailable",
        illumination: 0,
        emoji: "🌙",
        nextFullMoon: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        nextNewMoon: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isUnavailable: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
