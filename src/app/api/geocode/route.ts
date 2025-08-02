import { NextRequest, NextResponse } from 'next/server';
/**
 * Geocoding API
 * Supports both location search and reverse geocoding
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const input = searchParams.get('input'); // Support both 'q' and 'input' parameters
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    // If lat/lon provided, do reverse geocoding
    if (lat && lon) {
      return await reverseGeocode(parseFloat(lat), parseFloat(lon));
    }
    // If query or input provided, do forward geocoding
    const searchQuery = query || input;
    if (searchQuery) {
      return await forwardGeocode(searchQuery);
    }
    return NextResponse.json(
      { error: 'Either q/input (query) or lat/lon parameters are required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
async function forwardGeocode(query: string) {
  try {
    // Use OpenStreetMap Nominatim as a free alternative
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MysticArcana/1.0'
      }
    });
    if (!response.ok) {
      throw new Error('Nominatim API request failed');
    }
    const data = await response.json();
    
    // Transform to our format
    const results = data.map((item: any) => ({
      name: item.display_name.split(',')[0].trim(),
      country: item.address?.country || 'Unknown',
      state: item.address?.state || item.address?.region,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name
    }));
    return NextResponse.json(results);
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return NextResponse.json(
      { error: 'Geocoding failed' },
      { status: 500 }
    );
  }
}
async function reverseGeocode(lat: number, lon: number) {
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'MysticArcana/1.0'
      }
    });
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }
    const data = await response.json();
    
    const result = {
      name: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
      country: data.address?.country || 'Unknown',
      state: data.address?.state || data.address?.region,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      display_name: data.display_name
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return NextResponse.json(
      { error: 'Reverse geocoding failed' },
      { status: 500 }
    );
  }
}
