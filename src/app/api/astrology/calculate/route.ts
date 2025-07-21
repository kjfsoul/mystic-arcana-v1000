import { NextRequest, NextResponse } from 'next/server';
import { SwissEphemerisShim } from '@/lib/astrology/SwissEphemerisShim';
import type { BirthData } from '@/lib/astrology/AstronomicalCalculator';

export async function POST(request: NextRequest) {
  try {
    const birthData: BirthData = await request.json();
    
    console.log('Received birth data:', birthData);
    
    // Validate input
    if (!birthData.date || !birthData.latitude || !birthData.longitude) {
      return NextResponse.json(
        { error: 'Missing required birth data: date, latitude, longitude' },
        { status: 400 }
      );
    }

    // Ensure date is a Date object
    if (typeof birthData.date === 'string') {
      birthData.date = new Date(birthData.date);
    }
    
    console.log('Parsed birth data:', birthData);

    // Initialize Swiss Ephemeris shim (will use fallback if not available)
    const shimInitialized = await SwissEphemerisShim.initialize();
    console.log('Swiss Ephemeris shim initialized:', shimInitialized);
    
    // Calculate the full chart
    const chart = await SwissEphemerisShim.calculateFullChart(birthData);
    console.log('Chart calculated successfully:', { planetsCount: chart.planets.length, housesCount: chart.houses.length });
    
    return NextResponse.json({
      success: true,
      chart,
      calculatedAt: new Date().toISOString(),
      method: 'SwissEphemerisShim'
    });
    
  } catch (error) {
    console.error('Astrology calculation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate astrological chart',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Astrology calculation API',
    methods: ['POST'],
    requiredFields: ['date', 'latitude', 'longitude'],
    optionalFields: ['name', 'city', 'country', 'timezone']
  });
}