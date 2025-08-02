import { NextRequest, NextResponse } from 'next/server';
import { AstrologyCache } from '@/lib/cache/AstrologyCache';
export async function GET(request: NextRequest) {
  try {
    const cache = new AstrologyCache();
    const stats = cache.getCacheStats();
    
    // Additional system stats could be added here
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        uptime_seconds: process.uptime(),
        memory_usage: process.memoryUsage(),
        node_version: process.version
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('Cache stats error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
