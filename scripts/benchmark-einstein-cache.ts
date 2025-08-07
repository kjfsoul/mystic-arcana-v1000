#!/usr/bin/env node
/**
 * Einstein Birth Chart Performance Benchmark
 * Measures speed before/after caching implementation
 * Tests Supabase cache performance and Python wrapper caching
 */

import { BirthData } from "@/types/astrology";

interface BenchmarkResult {
  operation: string;
  duration_ms: number;
  success: boolean;
  cache_status: "HIT" | "MISS" | "ERROR";
  response_size_bytes: number;
  timestamp: string;
}

interface BenchmarkSummary {
  test_subject: string;
  total_requests: number;
  cache_hits: number;
  cache_misses: number;
  cache_efficiency: number;
  average_response_time_ms: number;
  fastest_response_ms: number;
  slowest_response_ms: number;
  total_time_saved_ms: number;
  results: BenchmarkResult[];
}

const EINSTEIN_BIRTH_DATA: BirthData = {
  name: "Albert Einstein",
  date: "1879-03-14T11:30:00.000Z",
  city: "Ulm",
  country: "Germany",
  latitude: 48.4,
  longitude: 10.0,
};

const API_BASE_URL = "http://localhost:3002";

class AstrologyBenchmark {
  private results: BenchmarkResult[] = [];

  constructor() {}

  async callBirthChartAPI(
    birthData: BirthData,
    testName: string,
  ): Promise<BenchmarkResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/astrology/birth-chart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ birthData }),
        },
      );

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      const responseSize = new TextEncoder().encode(responseText).length;

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { success: false, error: "Invalid JSON response" };
      }

      const cacheStatus =
        (response.headers.get("X-Cache-Status") as "HIT" | "MISS" | "ERROR") ||
        (data.data?.cached ? "HIT" : "MISS");

      return {
        operation: testName,
        duration_ms: duration,
        success: response.ok && data.success,
        cache_status: cacheStatus,
        response_size_bytes: responseSize,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        operation: testName,
        duration_ms: duration,
        success: false,
        cache_status: "ERROR",
        response_size_bytes: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async warmupAPI(): Promise<void> {
    console.log("🔥 Warming up API...");
    try {
      await fetch(`${API_BASE_URL}/api/health`, { method: "GET" });
      console.log("✅ API warmed up");
    } catch (error) {
      console.log("⚠️  API warmup failed, continuing with benchmark");
    }
  }

  async clearCache(): Promise<void> {
    console.log("🧹 Clearing cache...");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/astrology/cache/clear`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        console.log("✅ Cache cleared successfully");
      } else {
        console.log("⚠️  Cache clear failed, continuing with benchmark");
      }
    } catch (error) {
      console.log("⚠️  Cache clear error, continuing with benchmark");
    }
  }

  async runBenchmark(): Promise<BenchmarkSummary> {
    console.log("🧪 EINSTEIN BIRTH CHART CACHE PERFORMANCE BENCHMARK");
    console.log("====================================================");
    console.log(`Subject: ${EINSTEIN_BIRTH_DATA.name}`);
    console.log(
      `Birth: ${new Date(EINSTEIN_BIRTH_DATA.date).toLocaleString()}`,
    );
    console.log(
      `Location: ${EINSTEIN_BIRTH_DATA.city}, ${EINSTEIN_BIRTH_DATA.country}\n`,
    );

    // Warmup
    await this.warmupAPI();
    await this.clearCache();

    // Wait for cache clear to propagate
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("📊 Running benchmark tests...\n");

    // Test 1: Cold cache (should be MISS)
    console.log("1️⃣  Testing cold cache performance...");
    const coldResult = await this.callBirthChartAPI(
      EINSTEIN_BIRTH_DATA,
      "Cold Cache (First Request)",
    );
    this.results.push(coldResult);
    console.log(
      `   Duration: ${coldResult.duration_ms}ms | Status: ${coldResult.cache_status} | Success: ${coldResult.success}`,
    );

    // Small delay to ensure cache is written
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Test 2: Warm cache (should be HIT)
    console.log("2️⃣  Testing warm cache performance...");
    const warmResult = await this.callBirthChartAPI(
      EINSTEIN_BIRTH_DATA,
      "Warm Cache (Cached Request)",
    );
    this.results.push(warmResult);
    console.log(
      `   Duration: ${warmResult.duration_ms}ms | Status: ${warmResult.cache_status} | Success: ${warmResult.success}`,
    );

    // Test 3-6: Multiple cache hits to measure consistency
    console.log("3️⃣  Testing cache consistency (4 additional requests)...");
    for (let i = 0; i < 4; i++) {
      const result = await this.callBirthChartAPI(
        EINSTEIN_BIRTH_DATA,
        `Cache Consistency Test ${i + 1}`,
      );
      this.results.push(result);
      console.log(
        `   Request ${i + 1}: ${result.duration_ms}ms | ${result.cache_status}`,
      );

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Test 7: Modified data (should be MISS due to different cache key)
    console.log("4️⃣  Testing cache key uniqueness...");
    const modifiedData = {
      ...EINSTEIN_BIRTH_DATA,
      name: "Albert Einstein (Modified)",
    };
    const modifiedResult = await this.callBirthChartAPI(
      modifiedData,
      "Modified Data (Different Cache Key)",
    );
    this.results.push(modifiedResult);
    console.log(
      `   Duration: ${modifiedResult.duration_ms}ms | Status: ${modifiedResult.cache_status} | Success: ${modifiedResult.success}`,
    );

    return this.generateSummary();
  }

  generateSummary(): BenchmarkSummary {
    const successfulResults = this.results.filter((r) => r.success);
    const cacheHits = this.results.filter(
      (r) => r.cache_status === "HIT",
    ).length;
    const cacheMisses = this.results.filter(
      (r) => r.cache_status === "MISS",
    ).length;

    const durations = successfulResults.map((r) => r.duration_ms);
    const averageDuration =
      durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;
    const fastestDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const slowestDuration = durations.length > 0 ? Math.max(...durations) : 0;

    // Calculate time saved by caching
    const hitDurations = this.results
      .filter((r) => r.cache_status === "HIT")
      .map((r) => r.duration_ms);
    const missDurations = this.results
      .filter((r) => r.cache_status === "MISS")
      .map((r) => r.duration_ms);

    const avgHitTime =
      hitDurations.length > 0
        ? hitDurations.reduce((a, b) => a + b, 0) / hitDurations.length
        : 0;
    const avgMissTime =
      missDurations.length > 0
        ? missDurations.reduce((a, b) => a + b, 0) / missDurations.length
        : 0;
    const timeSaved = cacheHits * (avgMissTime - avgHitTime);

    return {
      test_subject: EINSTEIN_BIRTH_DATA.name,
      total_requests: this.results.length,
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      cache_efficiency:
        this.results.length > 0 ? (cacheHits / this.results.length) * 100 : 0,
      average_response_time_ms: Math.round(averageDuration),
      fastest_response_ms: fastestDuration,
      slowest_response_ms: slowestDuration,
      total_time_saved_ms: Math.round(timeSaved),
      results: this.results,
    };
  }

  displaySummary(summary: BenchmarkSummary): void {
    console.log("\n📈 BENCHMARK RESULTS SUMMARY");
    console.log("============================");
    console.log(`Test Subject: ${summary.test_subject}`);
    console.log(`Total Requests: ${summary.total_requests}`);
    console.log(`Cache Hits: ${summary.cache_hits}`);
    console.log(`Cache Misses: ${summary.cache_misses}`);
    console.log(`Cache Efficiency: ${summary.cache_efficiency.toFixed(1)}%`);
    console.log(`Average Response Time: ${summary.average_response_time_ms}ms`);
    console.log(`Fastest Response: ${summary.fastest_response_ms}ms`);
    console.log(`Slowest Response: ${summary.slowest_response_ms}ms`);
    console.log(
      `Total Time Saved by Caching: ${summary.total_time_saved_ms}ms`,
    );

    console.log("\n🎯 PERFORMANCE ANALYSIS:");
    console.log("========================");

    const hitResults = summary.results.filter(
      (r) => r.cache_status === "HIT" && r.success,
    );
    const missResults = summary.results.filter(
      (r) => r.cache_status === "MISS" && r.success,
    );

    if (hitResults.length > 0 && missResults.length > 0) {
      const avgHitTime =
        hitResults.reduce((a, b) => a + b.duration_ms, 0) / hitResults.length;
      const avgMissTime =
        missResults.reduce((a, b) => a + b.duration_ms, 0) / missResults.length;
      const speedup = avgMissTime / avgHitTime;
      const timeSavedPercent = ((avgMissTime - avgHitTime) / avgMissTime) * 100;

      console.log(`Average Cache HIT time: ${Math.round(avgHitTime)}ms`);
      console.log(`Average Cache MISS time: ${Math.round(avgMissTime)}ms`);
      console.log(`Cache Speedup Factor: ${speedup.toFixed(2)}x faster`);
      console.log(`Time Saved by Cache: ${timeSavedPercent.toFixed(1)}%`);

      if (speedup > 2) {
        console.log(
          "✅ EXCELLENT: Cache provides significant performance improvement",
        );
      } else if (speedup > 1.5) {
        console.log("✅ GOOD: Cache provides moderate performance improvement");
      } else {
        console.log("⚠️  POOR: Cache provides minimal performance improvement");
      }
    }

    console.log("\n📋 DETAILED RESULTS:");
    console.log("====================");
    summary.results.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      const cacheIcon =
        result.cache_status === "HIT"
          ? "🚀"
          : result.cache_status === "MISS"
            ? "⏱️"
            : "❌";
      console.log(`${index + 1}. ${status} ${cacheIcon} ${result.operation}`);
      console.log(
        `   Duration: ${result.duration_ms}ms | Cache: ${result.cache_status} | Size: ${(result.response_size_bytes / 1024).toFixed(1)}KB`,
      );
    });

    // Recommendations
    console.log("\n💡 RECOMMENDATIONS:");
    console.log("===================");

    if (summary.cache_efficiency > 80) {
      console.log("✅ Cache efficiency is excellent (>80%)");
    } else if (summary.cache_efficiency > 60) {
      console.log("⚠️  Cache efficiency is good (>60%) but could be improved");
    } else {
      console.log(
        "❌ Cache efficiency is poor (<60%) - investigate cache configuration",
      );
    }

    if (summary.fastest_response_ms < 100) {
      console.log("✅ Cache response times are excellent (<100ms)");
    } else if (summary.fastest_response_ms < 500) {
      console.log("⚠️  Cache response times are acceptable (<500ms)");
    } else {
      console.log(
        "❌ Cache response times are slow (>500ms) - investigate network/database performance",
      );
    }
  }

  async saveBenchmarkResults(summary: BenchmarkSummary): Promise<void> {
    const filename = `benchmark-results-${Date.now()}.json`;
    const filepath = `/Users/kfitz/mystic-arcana-v1000/benchmark-results/${filename}`;

    // Create benchmark results directory if it doesn't exist
    const fs = await import("fs");
    const path = await import("path");

    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
    console.log(`\n💾 Benchmark results saved to: ${filepath}`);
  }
}

// Execute benchmark if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new AstrologyBenchmark();

  benchmark
    .runBenchmark()
    .then(async (summary) => {
      benchmark.displaySummary(summary);
      await benchmark.saveBenchmarkResults(summary);

      console.log("\n✨ Benchmark completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Benchmark failed:", error);
      process.exit(1);
    });
}

export { AstrologyBenchmark };
