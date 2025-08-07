"use client";

import React, { useState, useCallback } from "react";
import { HighPerformanceStarField } from "../../components/astronomical/HighPerformanceStarField/HighPerformanceStarField";
import { AstronomicalSettings } from "../../components/settings/AstronomicalSettings/AstronomicalSettings";
import { RenderConfig, CalculationConfig } from "../../types/astronomical";
import { Star } from "../../lib/astronomy/types";
import styles from "./page.module.css";
interface PerformanceStats {
  totalStars: number;
  visibleStars: number;
  fps: number;
  renderTime: number;
}
/**
 * High-Performance Star Rendering Demo
 *
 * Showcases the WebGL2 renderer with 100,000+ real stars
 * using Claude Opus 4's Swiss Ephemeris calculations.
 */
export default function HighPerformanceStarsPage() {
  const [useRealStars, setUseRealStars] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    totalStars: 0,
    visibleStars: 0,
    fps: 0,
    renderTime: 0,
  });
  const [renderConfig, setRenderConfig] = useState<RenderConfig>({
    starCatalog: "hipparcos",
    maxStars: 100000,
    minMagnitude: 6.5,
    showConstellations: false,
    showPlanets: true,
    showDeepSky: false,
    coordinateSystem: "horizontal",
    projection: "stereographic",
  });
  const [calculationConfig, setCalculationConfig] = useState<CalculationConfig>(
    {
      ephemerisAccuracy: "high",
      updateInterval: 1000,
      precessionCorrection: true,
      nutationCorrection: true,
      aberrationCorrection: true,
      refractionCorrection: true,
    },
  );

  const handleSettingsChange = useCallback(
    (settings: {
      useRealStars: boolean;
      renderConfig: RenderConfig;
      calculationConfig: CalculationConfig;
    }) => {
      setUseRealStars(settings.useRealStars);
      setRenderConfig(settings.renderConfig);
      setCalculationConfig(settings.calculationConfig);
    },
    [],
  );

  const handleStarClick = useCallback((star: Star) => {
    setSelectedStar(star);
  }, []);

  const handlePerformanceUpdate = useCallback((stats: PerformanceStats) => {
    setPerformanceStats(stats);
  }, []);
  const getPerformanceRating = (
    fps: number,
  ): { rating: string; color: string } => {
    if (fps >= 55) return { rating: "Excellent", color: "#00FF00" };
    if (fps >= 45) return { rating: "Good", color: "#FFD700" };
    if (fps >= 30) return { rating: "Fair", color: "#FFA500" };
    return { rating: "Poor", color: "#FF6B6B" };
  };
  const performanceRating = getPerformanceRating(performanceStats.fps);
  return (
    <div className={styles.demoPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🚀 High-Performance Star Renderer</h1>
          <p>
            WebGL2 rendering of 100,000+ real stars with Swiss Ephemeris
            precision
          </p>
          <div className={styles.headerControls}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={styles.settingsButton}
            >
              ⚙️ {showSettings ? "Hide" : "Show"} Settings
            </button>
            <div className={styles.performanceIndicator}>
              <span
                className={styles.fpsIndicator}
                style={{ color: performanceRating.color }}
              >
                {performanceStats.fps.toFixed(1)} FPS -{" "}
                {performanceRating.rating}
              </span>
            </div>
          </div>
        </div>
      </header>
      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <AstronomicalSettings
            onSettingsChange={handleSettingsChange}
            className={styles.settings}
          />
        </div>
      )}
      {/* Main Star Field Display */}
      <main className={styles.mainDisplay}>
        <HighPerformanceStarField
          useRealStars={useRealStars}
          renderConfig={renderConfig}
          onStarClick={handleStarClick}
          onPerformanceUpdate={handlePerformanceUpdate}
          className={styles.starField}
        />
        {/* Performance Stats Overlay */}
        <div className={styles.performanceOverlay}>
          <div className={styles.performancePanel}>
            <h3>📊 Performance Metrics</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Stars:</span>
                <span className={styles.statValue}>
                  {performanceStats.totalStars.toLocaleString()}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Visible:</span>
                <span className={styles.statValue}>
                  {performanceStats.visibleStars.toLocaleString()}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>FPS:</span>
                <span
                  className={styles.statValue}
                  style={{ color: performanceRating.color }}
                >
                  {performanceStats.fps.toFixed(1)}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Render Time:</span>
                <span className={styles.statValue}>
                  {performanceStats.renderTime.toFixed(2)}ms
                </span>
              </div>
            </div>
          </div>
          {/* Configuration Info */}
          <div className={styles.configPanel}>
            <h3>🔧 Current Configuration</h3>
            <div className={styles.configGrid}>
              <div className={styles.configItem}>
                <strong>Mode:</strong>
                <span>
                  {useRealStars
                    ? "🔬 Real Astronomical Data"
                    : "🎨 Procedural Stars"}
                </span>
              </div>
              {useRealStars && (
                <>
                  <div className={styles.configItem}>
                    <strong>Catalog:</strong>
                    <span>{renderConfig.starCatalog.toUpperCase()}</span>
                  </div>
                  <div className={styles.configItem}>
                    <strong>Max Stars:</strong>
                    <span>{renderConfig.maxStars.toLocaleString()}</span>
                  </div>
                  <div className={styles.configItem}>
                    <strong>Magnitude Limit:</strong>
                    <span>{renderConfig.minMagnitude}</span>
                  </div>
                  <div className={styles.configItem}>
                    <strong>Accuracy:</strong>
                    <span>
                      {calculationConfig.ephemerisAccuracy.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Star Information Panel */}
        {selectedStar && (
          <div className={styles.starInfoPanel}>
            <h3>⭐ Selected Star</h3>
            <div className={styles.starDetails}>
              <div className={styles.starItem}>
                <strong>Name:</strong>
                <span>{selectedStar.name || selectedStar.id}</span>
              </div>
              <div className={styles.starItem}>
                <strong>Magnitude:</strong>
                <span>{selectedStar.magnitude.toFixed(2)}</span>
              </div>
              <div className={styles.starItem}>
                <strong>Spectral Class:</strong>
                <span>{selectedStar.spectralType || "Unknown"}</span>
              </div>
              <div className={styles.starItem}>
                <strong>Constellation:</strong>
                <span>{selectedStar.constellation}</span>
              </div>
              <div className={styles.starItem}>
                <strong>RA:</strong>
                <span>
                  {(selectedStar.ra ?? selectedStar.coordinates.ra).toFixed(4)}°
                </span>
              </div>
              <div className={styles.starItem}>
                <strong>Dec:</strong>
                <span>
                  {(selectedStar.dec ?? selectedStar.coordinates.dec).toFixed(
                    4,
                  )}
                  °
                </span>
              </div>
              {selectedStar.colorIndex !== undefined && (
                <div className={styles.starItem}>
                  <strong>Color Index (B-V):</strong>
                  <span>{selectedStar.colorIndex.toFixed(3)}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedStar(null)}
              className={styles.closeButton}
            >
              ✕ Close
            </button>
          </div>
        )}
      </main>
      {/* Technical Information */}
      <section className={styles.technicalInfo}>
        <h2>🔬 Technical Implementation</h2>
        <div className={styles.techGrid}>
          <div className={styles.techItem}>
            <h3>🎮 WebGL2 Rendering</h3>
            <ul>
              <li>GPU-accelerated star rendering</li>
              <li>Instanced drawing for massive star fields</li>
              <li>Real-time atmospheric effects</li>
              <li>Optimized for 100,000+ stars at 60fps</li>
            </ul>
          </div>
          <div className={styles.techItem}>
            <h3>🌟 Astronomical Accuracy</h3>
            <ul>
              <li>Swiss Ephemeris calculations</li>
              <li>Real star catalog data (Hipparcos, Yale, Gaia)</li>
              <li>Precise coordinate transformations</li>
              <li>Location and time-based accuracy</li>
            </ul>
          </div>
          <div className={styles.techItem}>
            <h3>⚡ Performance Optimizations</h3>
            <ul>
              <li>Frustum culling for invisible stars</li>
              <li>Level-of-detail based on magnitude</li>
              <li>Efficient GPU memory usage</li>
              <li>Adaptive quality scaling</li>
            </ul>
          </div>
          <div className={styles.techItem}>
            <h3>🎨 Visual Effects</h3>
            <ul>
              <li>Realistic star colors from B-V index</li>
              <li>Atmospheric twinkling simulation</li>
              <li>Diffraction spikes for bright stars</li>
              <li>Chromatic aberration effects</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Status Information */}
      <footer className={styles.footer}>
        <div className={styles.status}>
          <p>
            <strong>Status:</strong>
            {useRealStars
              ? " High-performance rendering with real astronomical data from Claude Opus 4's Swiss Ephemeris bridge."
              : " High-performance rendering with procedural star generation for testing."}
          </p>
          <p className={styles.disclaimer}>
            <strong>Performance:</strong> Optimized for modern GPUs. Performance
            may vary based on hardware capabilities and star count settings.
          </p>
        </div>
      </footer>
    </div>
  );
}
