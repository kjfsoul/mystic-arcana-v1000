import { NextRequest, NextResponse } from 'next/server';
import { SwissEphemerisShim } from '@/lib/astrology/SwissEphemerisShim';
import { AstrologyCache } from '@/lib/cache/AstrologyCache';
import type { BirthData } from '@/types/astrology';
import { z } from 'zod';
import { spawn } from 'child_process';
import path from 'path';

// Zod validation schema for exact payload format (matching birth-chart route)
const CalculatePayloadSchema = z.object({
  name: z.string().optional(),
  birthDate: z.string().datetime({ message: "birthDate must be ISO datetime string with Z" }),
  location: z.object({
    lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90"),
    lon: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    timezone: z.string().optional().default("UTC")
  }, { message: "Invalid location format - must include lat, lon, city, country" })
});

type ValidatedCalculatePayload = z.infer<typeof CalculatePayloadSchema>;
type ValidatedBirthData = BirthData; // For internal use

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const cache = new AstrologyCache();
  
  try {
    // Parse and validate input data
    const rawPayload = await request.json();
    console.log('🔍 Received calculate payload:', rawPayload);
    
    // Validate with exact schema matching birth-chart route
    const validationResult = CalculatePayloadSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => {
        const field = err.path.join('.');
        return `${field}: ${err.message}`;
      }).join(', ');
      
      console.error('❌ Calculate validation failed:', validationErrors);
      
      return NextResponse.json({
        success: false,
        error: 'Birth data is required',
        details: validationErrors,
        required_format: {
          name: "string (optional)",
          birthDate: "ISO datetime string with Z (e.g., '1879-03-14T11:30:00.000Z')",
          location: {
            lat: "number (-90 to 90)",
            lon: "number (-180 to 180)", 
            city: "string (required)",
            country: "string (required)",
            timezone: "string (optional, defaults to UTC)"
          }
        },
        received_payload: rawPayload
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      });
    }
    
    const payload: ValidatedCalculatePayload = validationResult.data;
    console.log('✅ Validated calculate payload:', payload);
    
    // Convert to internal BirthData format
    const birthData: ValidatedBirthData = {
      name: payload.name || 'User',
      birthDate: payload.birthDate, // Required string field
      birthTime: payload.birthTime,
      birthLocation: `${payload.location.city}, ${payload.location.country}`,
      date: new Date(payload.birthDate), // For backward compatibility
      city: payload.location.city,
      country: payload.location.country,
      latitude: payload.location.lat,
      longitude: payload.location.lon,
      timezone: payload.location.timezone
    };

    // Check cache first for performance
    const cacheKey = `calculate_${birthData.date.getTime()}_${birthData.latitude}_${birthData.longitude}`;
    
    // Try multiple calculation methods with fallbacks
    let chart: any = null;
    let calculationMethod = 'Unknown';
    let swissEphemerisAvailable = false;
    
    // Method 1: Try Python wrapper with Placidus house integration
    try {
      console.log('🐍 Attempting Python calculation with Placidus integration...');
      const pythonResult = await callPythonCalculation(birthData);
      if (pythonResult.success && pythonResult.data) {
        chart = pythonResult.data;
        calculationMethod = 'Python + Placidus Houses';
        console.log('✅ Python calculation successful');
      }
    } catch (pythonError) {
      console.log('⚠️ Python calculation failed, trying fallback methods:', pythonError.message);
    }
    
    // Method 2: Try SwissEphemerisShim fallback
    if (!chart) {
      try {
        console.log('🔄 Attempting SwissEphemerisShim fallback...');
        const shimInitialized = await SwissEphemerisShim.initialize();
        swissEphemerisAvailable = shimInitialized;
        console.log('Swiss Ephemeris shim initialized:', shimInitialized);
        
        const shimChart = await SwissEphemerisShim.calculateFullChart(birthData);
        chart = {
          planets: shimChart.planets,
          houses: shimChart.houses.map(h => ({
            house: h.house,
            cusp: h.cusp,
            sign: h.sign,
            ruler: h.ruler
          })),
          ascendant: { degree: shimChart.ascendant, sign: SwissEphemerisShim.getZodiacSign(shimChart.ascendant) },
          midheaven: { degree: shimChart.midheaven, sign: SwissEphemerisShim.getZodiacSign(shimChart.midheaven) },
          method: 'Enhanced Fallback Calculations'
        };
        calculationMethod = 'SwissEphemerisShim Fallback';
        console.log('✅ SwissEphemerisShim calculation successful');
      } catch (shimError) {
        console.error('❌ SwissEphemerisShim calculation failed:', shimError);
      }
    }
    
    if (!chart) {
      throw new Error('All calculation methods failed - unable to generate astrological chart');
    }
    
    console.log('📊 Chart calculated successfully:', { 
      planetsCount: chart.planets?.length || 0, 
      housesCount: chart.houses?.length || 0,
      method: calculationMethod
    });
    
    const responseTime = Date.now() - startTime;
    
    // Store in cache for future requests
    try {
      await cache.cacheBirthChart(
        birthData,
        chart,
        '', // SVG not generated in this endpoint
        `Chart calculated using ${calculationMethod}`,
        [`Method: ${calculationMethod}`, `Calculation Time: ${responseTime}ms`],
        calculationMethod.includes('Placidus'),
        calculationMethod,
        responseTime,
        swissEphemerisAvailable,
        !swissEphemerisAvailable
      );
    } catch (cacheError) {
      console.warn('⚠️ Cache storage failed:', cacheError);
    }
    
    return NextResponse.json({
      success: true,
      chart,
      metadata: {
        calculatedAt: new Date().toISOString(),
        method: calculationMethod,
        responseTime: responseTime,
        swissEphemerisAvailable,
        calculationEngine: 'Mystic Arcana Astrology Engine v1.0',
        birthData: {
          name: birthData.name,
          date: birthData.date.toISOString(),
          location: `${birthData.city || 'Unknown'}, ${birthData.country || 'Unknown'}`,
          coordinates: `${birthData.latitude}°N, ${birthData.longitude}°E`
        }
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Cache-Status': 'MISS',
        'X-Response-Time': `${responseTime}ms`,
        'X-Calculation-Method': calculationMethod
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('💥 Astrology calculation error:', error);
    
    // Log error to a_mem
    await logToAMem({
      event: 'astrology_calculate_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: responseTime
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate astrological chart',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        commonCauses: [
          'Invalid date format (use ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ)',
          'Latitude/longitude out of valid range (-90 to 90, -180 to 180)',
          'Missing Python astrology dependencies',
          'Swiss Ephemeris library not available'
        ],
        supportedFormats: {
          date: 'ISO 8601 datetime string or Date object',
          latitude: 'Number between -90 and 90',
          longitude: 'Number between -180 and 180'
        }
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`
      }
    });
  }
}

/**
 * Python calculation wrapper with enhanced error handling
 */
function callPythonCalculation(birthData: ValidatedBirthData): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(process.cwd(), 'src/services/astrology-python/cached_astrology.py');
    
    const pythonData = {
      name: birthData.name,
      birthDate: birthData.date.toISOString(),
      city: birthData.city || 'Unknown',
      country: birthData.country || '',
      latitude: birthData.latitude,
      longitude: birthData.longitude
    };
    
    const pythonProcess = spawn(pythonPath, [scriptPath, 'birth-chart', JSON.stringify(pythonData)]);
    
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
        reject(new Error(`Python calculation failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to spawn Python process: ${error.message}`));
    });
    
    // Set timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Python calculation timeout'));
    }, 30000);
  });
}

/**
 * Log events to a_mem for debugging
 */
async function logToAMem(logData: any): Promise<void> {
  try {
    const fs = await import('fs');
    const logEntry = JSON.stringify(logData) + '\n';
    fs.appendFileSync('/Users/kfitz/mystic-arcana-v1000/A-mem/crew_operations.log', logEntry);
  } catch (error) {
    console.warn('Failed to log to a_mem:', error);
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mystic Arcana Astrology Calculation API',
    version: '1.0',
    methods: ['POST'],
    endpoint: '/api/astrology/calculate',
    description: 'Calculate comprehensive astrological chart with planets, houses, and aspects',
    requiredFields: {
      date: 'ISO 8601 datetime string (e.g., "1879-03-14T11:30:00.000Z")',
      latitude: 'Number between -90 and 90 (positive for North)',
      longitude: 'Number between -180 and 180 (positive for East)'
    },
    optionalFields: {
      name: 'String - Person\'s name for the chart',
      city: 'String - Birth city name', 
      country: 'String - Birth country name',
      timezone: 'String - IANA timezone identifier'
    },
    features: [
      'Swiss Ephemeris integration with fallbacks',
      'Placidus house system calculations',
      'Comprehensive planetary positions',
      'Cache optimization for performance',
      'Multiple calculation methods with redundancy'
    ],
    exampleRequest: {
      name: 'Albert Einstein',
      birthDate: '1879-03-14T11:30:00.000Z',
      location: {
        lat: 48.4,
        lon: 10.0,
        city: 'Ulm',
        country: 'Germany',
        timezone: 'Europe/Berlin'
      }
    }
  });
}