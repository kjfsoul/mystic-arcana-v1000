'use client';
import React, { useState } from 'react';
// Temporarily disabled to fix build issues
// import { CosmicBackground } from '../../components/animations/CosmicBackground/CosmicBackground';
// import { AstronomicalSettings } from '../../components/settings/AstronomicalSettings/AstronomicalSettings';
import { RenderConfig, CalculationConfig, Star } from '../../types/astronomical';
import styles from './page.module.css';
/**
 * Astronomical Demo Page
 * 
 * Demonstrates the difference between decorative and real star fields.
 * Allows users to toggle settings and see the astronomical accuracy in action.
 */
export default function AstronomicalDemoPage() {
  const [useRealStars] = useState(false);
  const [renderConfig] = useState<RenderConfig>({
    starCatalog: 'hipparcos',
    maxStars: 25000,
    minMagnitude: 5.5,
    showConstellations: true,
    showPlanets: true,
    showDeepSky: false,
    coordinateSystem: 'horizontal',
    projection: 'stereographic'
  });
  const [calculationConfig] = useState<CalculationConfig>({
    ephemerisAccuracy: 'medium',
    updateInterval: 1000,
    precessionCorrection: true,
    nutationCorrection: true,
    aberrationCorrection: true,
    refractionCorrection: true
  });
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  // Temporarily disabled during build optimization
  // const handleSettingsChange = (settings: {
  //   useRealStars: boolean;
  //   renderConfig: RenderConfig;
  //   calculationConfig: CalculationConfig;
  // }) => {
  //   setUseRealStars(settings.useRealStars);
  //   setRenderConfig(settings.renderConfig);
  //   setCalculationConfig(settings.calculationConfig);
  // };
  // Star click handler for future use
  // const handleStarClick = (star: Star) => {
  //   setSelectedStar(star);
  // };
  return (
    <div className={styles.demoPage}>
      {/* Header */}
      <header className={styles.header}>
        <h1>🌟 Astronomical Accuracy Demo</h1>
        <p>Experience the difference between decorative and factually accurate star fields</p>
        <div className={styles.headerControls}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={styles.settingsButton}
          >
            ⚙️ {showSettings ? 'Hide' : 'Show'} Settings
          </button>
          <div className={styles.modeIndicator}>
            <span className={`${styles.indicator} ${useRealStars ? styles.real : styles.decorative}`}>
              {useRealStars ? '🔬 Real Astronomical Data' : '🎨 Decorative Mode'}
            </span>
          </div>
        </div>
      </header>
      {/* Settings Panel */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settings}>
            <p>Settings temporarily disabled during build optimization</p>
          </div>
        </div>
      )}
      {/* Main Star Field Display */}
      <main className={styles.mainDisplay}>
        <div className={styles.starField}>
          <p>Cosmic background temporarily disabled during build optimization</p>
        </div>
        {/* Information Overlay */}
        <div className={styles.infoOverlay}>
          <div className={styles.infoPanel}>
            <h3>Current Configuration</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>Mode:</strong>
                <span>{useRealStars ? 'Real Astronomical Data' : 'Decorative Stars'}</span>
              </div>
              {useRealStars && (
                <>
                  <div className={styles.infoItem}>
                    <strong>Catalog:</strong>
                    <span>{renderConfig.starCatalog.toUpperCase()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Max Stars:</strong>
                    <span>{renderConfig.maxStars.toLocaleString()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Magnitude Limit:</strong>
                    <span>{renderConfig.minMagnitude}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Accuracy:</strong>
                    <span>{calculationConfig.ephemerisAccuracy.toUpperCase()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Star Information Panel */}
          {selectedStar && (
            <div className={styles.starInfo}>
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
                  <span>{selectedStar.spectralClass}</span>
                </div>
                <div className={styles.starItem}>
                  <strong>Constellation:</strong>
                  <span>{selectedStar.constellation}</span>
                </div>
                <div className={styles.starItem}>
                  <strong>RA:</strong>
                  <span>{selectedStar.coordinates.ra.toFixed(4)}°</span>
                </div>
                <div className={styles.starItem}>
                  <strong>Dec:</strong>
                  <span>{selectedStar.coordinates.dec.toFixed(4)}°</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStar(null)}
                className={styles.closeButton}
              >
                ✕ Close
              </button>
            </div>
          )}
        </div>
      </main>
      {/* Comparison Section */}
      <section className={styles.comparison}>
        <h2>🔬 Real vs Decorative Comparison</h2>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <h3>🎨 Decorative Mode</h3>
            <ul>
              <li>✅ Fast rendering</li>
              <li>✅ Low resource usage</li>
              <li>✅ Consistent appearance</li>
              <li>❌ No astronomical accuracy</li>
              <li>❌ Random star positions</li>
              <li>❌ No real constellation patterns</li>
            </ul>
          </div>
          <div className={styles.comparisonItem}>
            <h3>🔬 Real Astronomical Data</h3>
            <ul>
              <li>✅ Factually accurate star positions</li>
              <li>✅ Real constellation patterns</li>
              <li>✅ Location and time-based accuracy</li>
              <li>✅ Professional-grade precision</li>
              <li>⚠️ Higher resource usage</li>
              <li>⚠️ Requires location permission</li>
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
              ? ' Real astronomical calculations active. Star positions are factually accurate for your location and time.'
              : ' Decorative mode active. Stars are randomly generated for visual appeal only.'
            }
          </p>
          {useRealStars && (
            <p className={styles.disclaimer}>
              <strong>Note:</strong> Real astronomical data requires Claude Opus 4&apos;s calculation algorithms.
              Currently showing placeholder implementation.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
