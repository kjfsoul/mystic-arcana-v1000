'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GalaxyBackground } from '../../components/effects/GalaxyBackground/GalaxyBackground';
import { LocalAuthProvider } from '../../lib/auth/LocalAuthProvider';
import styles from './page.module.css';

/**
 * Cosmic Demo Page
 * 
 * Showcases the enhanced galaxy background with real-time celestial elements:
 * - Live planetary positions and movements
 * - Asteroid belt animations
 * - Lunar phase indicator with current energy
 * - Solar wind and cosmic weather effects
 * - Constellation highlighting based on astrological transits
 */
const CosmicDemoContent: React.FC = () => {
  const [galaxySettings, setGalaxySettings] = useState({
    intensity: 0.8,
    showMilkyWay: true,
    animated: true,
    showPlanets: true,
    showAsteroids: false,
    showLunarPhase: true,
    showSolarWind: true,
    asteroidDensity: 'medium' as const,
    interactive: false
  });

  const handleSettingChange = (setting: string, value: any) => {
    setGalaxySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className={styles.container}>
      {/* Enhanced Galaxy Background with Celestial Elements */}
      <GalaxyBackground 
        className={styles.galaxyBackground}
        intensity={galaxySettings.intensity}
        showMilkyWay={galaxySettings.showMilkyWay}
        animated={galaxySettings.animated}
        showPlanets={galaxySettings.showPlanets}
        showAsteroids={galaxySettings.showAsteroids}
        showLunarPhase={galaxySettings.showLunarPhase}
        showSolarWind={galaxySettings.showSolarWind}
        asteroidDensity={galaxySettings.asteroidDensity}
        interactive={galaxySettings.interactive}
      />

      {/* Main Content */}
      <div className={styles.content}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className={styles.title}>🌌 Cosmic UX Enhancement Demo</h1>
          <p className={styles.subtitle}>
            Experience living celestial elements with real-time planetary positions, 
            lunar phases, and cosmic weather effects
          </p>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          className={styles.features}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className={styles.featureGrid}>
            {/* Real-time Planets */}
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🪐</div>
              <h3>Live Planetary Positions</h3>
              <p>Real-time orbital mechanics with authentic movement patterns and brightness variations</p>
              <div className={styles.featureStatus}>
                {galaxySettings.showPlanets ? (
                  <span className={styles.statusActive}>✨ Active</span>
                ) : (
                  <span className={styles.statusInactive}>⭕ Disabled</span>
                )}
              </div>
            </div>

            {/* Lunar Phase */}
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🌙</div>
              <h3>Current Lunar Phase</h3>
              <p>Live moon phase indicator with energy readings and astrological significance</p>
              <div className={styles.featureStatus}>
                {galaxySettings.showLunarPhase ? (
                  <span className={styles.statusActive}>🌕 Tracking</span>
                ) : (
                  <span className={styles.statusInactive}>🌑 Hidden</span>
                )}
              </div>
            </div>

            {/* Solar Wind */}
            <div className={styles.feature}>
              <div className={styles.featureIcon}>☀️</div>
              <h3>Cosmic Weather</h3>
              <p>Real-time solar wind, geomagnetic activity, and cosmic ray intensity monitoring</p>
              <div className={styles.featureStatus}>
                {galaxySettings.showSolarWind ? (
                  <span className={styles.statusActive}>🌊 Flowing</span>
                ) : (
                  <span className={styles.statusInactive}>🚫 Calm</span>
                )}
              </div>
            </div>

            {/* Asteroid Belt */}
            <div className={styles.feature}>
              <div className={styles.featureIcon}>☄️</div>
              <h3>Asteroid Field</h3>
              <p>Animated asteroid belt with different mineral compositions and orbital dynamics</p>
              <div className={styles.featureStatus}>
                {galaxySettings.showAsteroids ? (
                  <span className={styles.statusActive}>💫 Orbiting</span>
                ) : (
                  <span className={styles.statusInactive}>🔒 Hidden</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Controls */}
        <motion.div
          className={styles.controls}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h2>🎛️ Cosmic Controls</h2>
          
          <div className={styles.controlGrid}>
            {/* Intensity Control */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Galaxy Intensity: {Math.round(galaxySettings.intensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={galaxySettings.intensity}
                onChange={(e) => handleSettingChange('intensity', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            {/* Toggle Controls */}
            <div className={styles.toggleGrid}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.showMilkyWay}
                  onChange={(e) => handleSettingChange('showMilkyWay', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>🌌 Milky Way</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.animated}
                  onChange={(e) => handleSettingChange('animated', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>✨ Animations</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.showPlanets}
                  onChange={(e) => handleSettingChange('showPlanets', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>🪐 Planets</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.showAsteroids}
                  onChange={(e) => handleSettingChange('showAsteroids', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>☄️ Asteroids</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.showLunarPhase}
                  onChange={(e) => handleSettingChange('showLunarPhase', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>🌙 Lunar Phase</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.showSolarWind}
                  onChange={(e) => handleSettingChange('showSolarWind', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>☀️ Solar Wind</span>
              </label>

              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={galaxySettings.interactive}
                  onChange={(e) => handleSettingChange('interactive', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>🎯 Interactive</span>
              </label>
            </div>

            {/* Asteroid Density */}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>Asteroid Density</label>
              <select
                value={galaxySettings.asteroidDensity}
                onChange={(e) => handleSettingChange('asteroidDensity', e.target.value)}
                className={styles.select}
              >
                <option value="low">Low (30 objects)</option>
                <option value="medium">Medium (50 objects)</option>
                <option value="high">High (80 objects)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Information Panel */}
        <motion.div
          className={styles.infoPanel}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <h2>🔬 Technical Features</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <h4>Real-Time Ephemeris</h4>
              <p>Calculates actual planetary positions using orbital mechanics</p>
            </div>
            <div className={styles.infoItem}>
              <h4>Lunar Energy Tracking</h4>
              <p>Current moon phase with manifestation, growth, culmination, or release energy</p>
            </div>
            <div className={styles.infoItem}>
              <h4>Space Weather</h4>
              <p>Simulated solar wind speed, geomagnetic activity, and cosmic ray intensity</p>
            </div>
            <div className={styles.infoItem}>
              <h4>Asteroid Composition</h4>
              <p>Three types: Rocky (silicate), Metallic (iron-nickel), Carbonaceous (carbon-rich)</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className={styles.navigation}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <a href="/" className={styles.navLink}>← Back to Main App</a>
          <a href="/local-demo" className={styles.navLink}>Local Auth Demo →</a>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Cosmic Demo Page with Authentication Provider
 */
export default function CosmicDemoPage() {
  return (
    <LocalAuthProvider>
      <CosmicDemoContent />
    </LocalAuthProvider>
  );
}
