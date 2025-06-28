import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Python script paths
const PYTHON_SCRIPTS_PATH = path.join(process.cwd(), 'src/services/astrology-python');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    let pythonScript = '';
    let args: string[] = [];

    switch (action) {
      case 'calculate-birth-chart':
        pythonScript = 'simple_astrology.py';
        args = ['birth-chart', JSON.stringify(data)];
        break;
      
      case 'calculate-synastry':
        pythonScript = 'simple_astrology.py';
        args = ['synastry', JSON.stringify(data)];
        break;
      
      case 'get-current-transits':
        pythonScript = 'simple_astrology.py';
        args = ['transits'];
        break;
      
      case 'geocode-location':
        pythonScript = 'simple_astrology.py';
        args = ['geocode', JSON.stringify(data)];
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Execute Python script
    const result = await executePythonScript(pythonScript, args);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Astrology API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function executePythonScript(scriptName: string, args: string[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || path.join(process.cwd(), 'venv-astrology/bin/python');
    const scriptPath = path.join(PYTHON_SCRIPTS_PATH, scriptName);
    
    const pythonProcess = spawn(pythonPath, [scriptPath, ...args]);
    
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
        reject(new Error(`Python script failed: ${stderr}`));
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch {
          reject(new Error(`Invalid JSON response: ${stdout}`));
        }
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// TypeScript interfaces for the API
export interface BirthChartRequest {
  name: string;
  birthDate: string; // ISO format
  city: string;
  country?: string;
}

export interface SynastryRequest {
  person1: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    country?: string;
  };
  person2: {
    name: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    city: string;
    country?: string;
  };
}

export interface GeocodeRequest {
  city: string;
  country?: string;
}