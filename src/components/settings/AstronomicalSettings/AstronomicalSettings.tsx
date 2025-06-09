'use client';

import React, { useState } from 'react';
// import { Card } from '@ag-ui/core';
import { RenderConfig, CalculationConfig } from '../../../types/astronomical';
import styles from './AstronomicalSettings.module.css';

interface AstronomicalSettingsProps {
  className?: string;
  onSettingsChange?: (settings: {
    useRealStars: boolean;
    renderConfig: RenderConfig;
    calculationConfig: CalculationConfig;
  }) => void;
}

/**
 * AstronomicalSettings Component
 * 
 * Provides user controls for astronomical accuracy and rendering options.
 * Allows switching between decorative and real star fields.
 */
export const AstronomicalSettings: React.FC<AstronomicalSettingsProps> = ({
  className = '',
  onSettingsChange
}) => {
  const [useRealStars, setUseRealStars] = useState(false);
  const [renderConfig, setRenderConfig] = useState<RenderConfig>({
    starCatalog: 'hipparcos',
    maxStars: 25000,
    minMagnitude: 5.5,
    showConstellations: true,
    showPlanets: true,
    showDeepSky: false,
    coordinateSystem: 'horizontal',
    projection: 'stereographic'
  });

  const [calculationConfig, setCalculationConfig] = useState<CalculationConfig>({
    ephemerisAccuracy: 'medium',
    updateInterval: 1000,
    precessionCorrection: true,
    nutationCorrection: true,
    aberrationCorrection: true,
    refractionCorrection: true
  });

  const handleSettingChange = (newSettings: Partial<{
    useRealStars: boolean;
    renderConfig: Partial<RenderConfig>;
    calculationConfig: Partial<CalculationConfig>;
  }>) => {
    const updatedUseRealStars = newSettings.useRealStars ?? useRealStars;
    const updatedRenderConfig = { ...renderConfig, ...newSettings.renderConfig };
    const updatedCalculationConfig = { ...calculationConfig, ...newSettings.calculationConfig };

    setUseRealStars(updatedUseRealStars);
    setRenderConfig(updatedRenderConfig);
    setCalculationConfig(updatedCalculationConfig);

    onSettingsChange?.({
      useRealStars: updatedUseRealStars,
      renderConfig: updatedRenderConfig,
      calculationConfig: updatedCalculationConfig
    });
  };

  return (
    <div className={`${styles.astronomicalSettings} ${className}`}>
      <div className={styles.header}>
        <h3>🌟 Astronomical Settings</h3>
        <p>Configure star field accuracy and rendering options</p>
      </div>

      {/* Main Toggle */}
      <div className={styles.section}>
        <div className={styles.toggleGroup}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={useRealStars}
              onChange={(e) => handleSettingChange({ useRealStars: e.target.checked })}
            />
            <span className={styles.slider}></span>
            <div className={styles.toggleLabel}>
              <strong>Real Astronomical Data</strong>
              <p>{useRealStars ? 'Using factual star positions' : 'Using decorative star field'}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Real Stars Configuration */}
      {useRealStars && (
        <>
          <div className={styles.section}>
            <h4>Star Catalog</h4>
            <select
              value={renderConfig.starCatalog}
              onChange={(e) => handleSettingChange({
                renderConfig: { starCatalog: e.target.value as 'hipparcos' | 'yale' | 'gaia' }
              })}
              className={styles.select}
            >
              <option value="hipparcos">Hipparcos (118,000 stars)</option>
              <option value="yale">Yale Bright Star (9,000 stars)</option>
              <option value="gaia">Gaia DR3 (1.8 billion stars)</option>
            </select>
          </div>

          <div className={styles.section}>
            <h4>Performance Settings</h4>
            <div className={styles.inputGroup}>
              <label>
                Max Stars: {renderConfig.maxStars.toLocaleString()}
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={renderConfig.maxStars}
                  onChange={(e) => handleSettingChange({
                    renderConfig: { maxStars: parseInt(e.target.value) }
                  })}
                  className={styles.slider}
                />
              </label>
            </div>

            <div className={styles.inputGroup}>
              <label>
                Faintest Magnitude: {renderConfig.minMagnitude}
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.1"
                  value={renderConfig.minMagnitude}
                  onChange={(e) => handleSettingChange({
                    renderConfig: { minMagnitude: parseFloat(e.target.value) }
                  })}
                  className={styles.slider}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Display Options</h4>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={renderConfig.showConstellations}
                  onChange={(e) => handleSettingChange({
                    renderConfig: { showConstellations: e.target.checked }
                  })}
                />
                Show Constellation Lines
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={renderConfig.showPlanets}
                  onChange={(e) => handleSettingChange({
                    renderConfig: { showPlanets: e.target.checked }
                  })}
                />
                Show Planets
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={renderConfig.showDeepSky}
                  onChange={(e) => handleSettingChange({
                    renderConfig: { showDeepSky: e.target.checked }
                  })}
                />
                Show Deep Sky Objects
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Calculation Accuracy</h4>
            <select
              value={calculationConfig.ephemerisAccuracy}
              onChange={(e) => handleSettingChange({
                calculationConfig: { ephemerisAccuracy: e.target.value as 'low' | 'medium' | 'high' | 'ultra' }
              })}
              className={styles.select}
            >
              <option value="low">Low (Fast, ±1 arcminute)</option>
              <option value="medium">Medium (Balanced, ±10 arcseconds)</option>
              <option value="high">High (Precise, ±1 arcsecond)</option>
              <option value="ultra">Ultra (Research, ±0.1 arcsecond)</option>
            </select>
          </div>

          <div className={styles.section}>
            <h4>Corrections</h4>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={calculationConfig.precessionCorrection}
                  onChange={(e) => handleSettingChange({
                    calculationConfig: { precessionCorrection: e.target.checked }
                  })}
                />
                Precession Correction
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={calculationConfig.nutationCorrection}
                  onChange={(e) => handleSettingChange({
                    calculationConfig: { nutationCorrection: e.target.checked }
                  })}
                />
                Nutation Correction
              </label>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={calculationConfig.refractionCorrection}
                  onChange={(e) => handleSettingChange({
                    calculationConfig: { refractionCorrection: e.target.checked }
                  })}
                />
                Atmospheric Refraction
              </label>
            </div>
          </div>
        </>
      )}

      {/* Performance Warning */}
      {useRealStars && renderConfig.maxStars > 50000 && (
        <div className={styles.warning}>
          ⚠️ High star count may impact performance on slower devices
        </div>
      )}

      {/* Info Panel */}
      <div className={styles.info}>
        <h4>ℹ️ About Astronomical Accuracy</h4>
        <p>
          {useRealStars
            ? 'Real astronomical data provides factually accurate star positions based on your location and time. Perfect for serious astrological work.'
            : 'Decorative mode uses randomly generated stars for visual appeal without astronomical accuracy. Faster and suitable for general ambiance.'
          }
        </p>
      </div>
    </div>
  );
};
