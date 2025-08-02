/**
 * Astrology Cache Service - Supabase Edge Caching for Birth Chart Calculations
 * Implements 1-hour TTL for transit calculations and persistent birth chart storage
 */
import { createClient } from '@supabase/supabase-js';
import { BirthData } from '../../types/astrology';
export interface CachedBirthChart {
  id: string;
  birth_data_hash: string;
  birth_date: string;
  location: string;
  chart_data: any;
  svg_chart: string;
  sign_summary: string;
  house_breakdown: string[];
  placidus_method: boolean;
  created_at: string;
  expires_at: string;
  calculation_method: string;
  cache_metadata: {
    swiss_ephemeris: boolean;
    fallback_mode: boolean;
    performance_ms: number;
  };
}
export interface CachedTransitData {
  id: string;
  date_key: string; // YYYY-MM-DD-HH format for hourly granularity
  location_hash: string;
  transit_data: any;
  cosmic_weather: any;
  created_at: string;
  expires_at: string;
}
export interface CacheStats {
  birth_chart_hits: number;
  transit_hits: number;
  total_requests: number;
  cache_efficiency: number;
  average_response_time: number;
}
export class AstrologyCache {
  private supabase: any;
  private readonly BIRTH_CHART_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days for birth charts
  private readonly TRANSIT_TTL = 60 * 60 * 1000; // 1 hour for transits
  private stats: CacheStats = {
    birth_chart_hits: 0,
    transit_hits: 0,
    total_requests: 0,
    cache_efficiency: 0,
    average_response_time: 0
  };
  constructor() {
    if (typeof window === 'undefined') {
      // Server-side: use service role key for full access
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
    } else {
      // Client-side: use anon key
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }
  /**
   * Generate consistent hash for birth data to use as cache key
   */
  private generateBirthDataHash(birthData: BirthData): string {
    const normalizedData = {
      date: new Date(birthData.date || birthData.birthDate).toISOString(),
      city: (birthData.city || '').toLowerCase().trim(),
      country: (birthData.country || '').toLowerCase().trim(),
      // Round coordinates to 2 decimal places for caching
      lat: birthData.latitude ? Math.round(birthData.latitude * 100) / 100 : null,
      lng: birthData.longitude ? Math.round(birthData.longitude * 100) / 100 : null
    };
    
    return Buffer.from(JSON.stringify(normalizedData)).toString('base64');
  }
  /**
   * Generate location hash for transit caching
   */
  private generateLocationHash(latitude?: number, longitude?: number): string {
    if (!latitude || !longitude) return 'default_location';
    
    const roundedLat = Math.round(latitude * 100) / 100;
    const roundedLng = Math.round(longitude * 100) / 100;
    return `${roundedLat}_${roundedLng}`;
  }
  /**
   * Get cached birth chart
   */
  async getCachedBirthChart(birthData: BirthData): Promise<CachedBirthChart | null> {
    const startTime = Date.now();
    this.stats.total_requests++;
    try {
      const hash = this.generateBirthDataHash(birthData);
      
      const { data, error } = await this.supabase
        .from('cached_birth_charts')
        .select('*')
        .eq('birth_data_hash', hash)
        .gt('expires_at', new Date().toISOString())
        .single();
      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime, data ? 'birth_chart' : null);
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Supabase cache lookup error:', error);
        return null;
      }
      if (data) {
        console.log(`🚀 Birth chart cache HIT (${responseTime}ms)`);
        return data;
      }
      console.log(`⏱️ Birth chart cache MISS (${responseTime}ms)`);
      return null;
    } catch (error) {
      console.error('Cache lookup failed:', error);
      return null;
    }
  }
  /**
   * Store birth chart in cache
   */
  async cacheBirthChart(
    birthData: BirthData,
    chartData: any,
    svgChart: string,
    signSummary: string,
    houseBreakdown: string[],
    placidusMethod: boolean,
    calculationMethod: string,
    performanceMs: number,
    swissEphemeris: boolean = false,
    fallbackMode: boolean = false
  ): Promise<void> {
    try {
      const hash = this.generateBirthDataHash(birthData);
      const expiresAt = new Date(Date.now() + this.BIRTH_CHART_TTL);
      const cacheEntry: Partial<CachedBirthChart> = {
        birth_data_hash: hash,
        birth_date: new Date(birthData.date || birthData.birthDate).toISOString(),
        location: `${birthData.city}, ${birthData.country || ''}`,
        chart_data: chartData,
        svg_chart: svgChart,
        sign_summary: signSummary,
        house_breakdown: houseBreakdown,
        placidus_method: placidusMethod,
        expires_at: expiresAt.toISOString(),
        calculation_method: calculationMethod,
        cache_metadata: {
          swiss_ephemeris: swissEphemeris,
          fallback_mode: fallbackMode,
          performance_ms: performanceMs
        }
      };
      const { error } = await this.supabase
        .from('cached_birth_charts')
        .upsert(cacheEntry, { 
          onConflict: 'birth_data_hash',
          ignoreDuplicates: false 
        });
      if (error) {
        console.error('Failed to cache birth chart:', error);
      } else {
        console.log(`💾 Cached birth chart (expires: ${expiresAt.toLocaleString()})`);
      }
    } catch (error) {
      console.error('Cache storage failed:', error);
    }
  }
  /**
   * Get cached transit data
   */
  async getCachedTransitData(date: Date, latitude?: number, longitude?: number): Promise<CachedTransitData | null> {
    const startTime = Date.now();
    this.stats.total_requests++;
    try {
      const dateKey = date.toISOString().slice(0, 13); // YYYY-MM-DD-HH
      const locationHash = this.generateLocationHash(latitude, longitude);
      const { data, error } = await this.supabase
        .from('cached_transit_data')
        .select('*')
        .eq('date_key', dateKey)
        .eq('location_hash', locationHash)
        .gt('expires_at', new Date().toISOString())
        .single();
      const responseTime = Date.now() - startTime;
      this.updateStats(responseTime, data ? 'transit' : null);
      if (error && error.code !== 'PGRST116') {
        console.error('Transit cache lookup error:', error);
        return null;
      }
      if (data) {
        console.log(`🚀 Transit cache HIT (${responseTime}ms)`);
        return data;
      }
      console.log(`⏱️ Transit cache MISS (${responseTime}ms)`);
      return null;
    } catch (error) {
      console.error('Transit cache lookup failed:', error);
      return null;
    }
  }
  /**
   * Store transit data in cache
   */
  async cacheTransitData(
    date: Date,
    transitData: any,
    cosmicWeather: any,
    latitude?: number,
    longitude?: number
  ): Promise<void> {
    try {
      const dateKey = date.toISOString().slice(0, 13); // YYYY-MM-DD-HH
      const locationHash = this.generateLocationHash(latitude, longitude);
      const expiresAt = new Date(Date.now() + this.TRANSIT_TTL);
      const cacheEntry: Partial<CachedTransitData> = {
        date_key: dateKey,
        location_hash: locationHash,
        transit_data: transitData,
        cosmic_weather: cosmicWeather,
        expires_at: expiresAt.toISOString()
      };
      const { error } = await this.supabase
        .from('cached_transit_data')
        .upsert(cacheEntry, { 
          onConflict: 'date_key,location_hash',
          ignoreDuplicates: false 
        });
      if (error) {
        console.error('Failed to cache transit data:', error);
      } else {
        console.log(`💾 Cached transit data (expires: ${expiresAt.toLocaleString()})`);
      }
    } catch (error) {
      console.error('Transit cache storage failed:', error);
    }
  }
  /**
   * Clean expired cache entries
   */
  async cleanExpiredCache(): Promise<{ birth_charts_cleaned: number; transits_cleaned: number }> {
    try {
      const now = new Date().toISOString();
      const [birthChartResult, transitResult] = await Promise.all([
        this.supabase
          .from('cached_birth_charts')
          .delete()
          .lt('expires_at', now),
        this.supabase
          .from('cached_transit_data')
          .delete()
          .lt('expires_at', now)
      ]);
      const birthChartsCleanred = birthChartResult.count || 0;
      const transitsCleared = transitResult.count || 0;
      console.log(`🧹 Cleaned ${birthChartsCleanred} birth charts, ${transitsCleared} transits`);
      return {
        birth_charts_cleaned: birthChartsCleanred,
        transits_cleaned: transitsCleared
      };
    } catch (error) {
      console.error('Cache cleanup failed:', error);
      return { birth_charts_cleaned: 0, transits_cleaned: 0 };
    }
  }
  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return { ...this.stats };
  }
  /**
   * Update internal statistics
   */
  private updateStats(responseTime: number, cacheType: 'birth_chart' | 'transit' | null): void {
    if (cacheType === 'birth_chart') {
      this.stats.birth_chart_hits++;
    } else if (cacheType === 'transit') {
      this.stats.transit_hits++;
    }
    const totalHits = this.stats.birth_chart_hits + this.stats.transit_hits;
    this.stats.cache_efficiency = this.stats.total_requests > 0 
      ? (totalHits / this.stats.total_requests) * 100 
      : 0;
    // Update rolling average response time
    this.stats.average_response_time = 
      (this.stats.average_response_time + responseTime) / 2;
  }
  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      birth_chart_hits: 0,
      transit_hits: 0,
      total_requests: 0,
      cache_efficiency: 0,
      average_response_time: 0
    };
  }
  /**
   * Warm cache with popular birth data combinations
   */
  async warmCache(popularBirthData: BirthData[]): Promise<number> {
    let warmedCount = 0;
    
    for (const birthData of popularBirthData) {
      const cached = await this.getCachedBirthChart(birthData);
      if (!cached) {
        // Would trigger cache generation in actual usage
        console.log(`🔥 Cache miss for warming: ${birthData.name}`);
      } else {
        warmedCount++;
      }
    }
    console.log(`🔥 Cache warming complete: ${warmedCount}/${popularBirthData.length} already cached`);
    return warmedCount;
  }
}
