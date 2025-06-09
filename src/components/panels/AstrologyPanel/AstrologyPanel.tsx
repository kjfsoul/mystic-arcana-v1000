'use client';

import React, { useState, useEffect } from 'react';
import { GalaxyShader } from '../../effects/GalaxyShader/GalaxyShader';
import { useCosmicWeather } from '../../../utils/cosmic-weather/useCosmicWeather';
import styles from './AstrologyPanel.module.css';

interface AstrologyPanelProps {
  isActive: boolean;
  onActivate: () => void;
}

interface PlanetaryPosition {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  house: number;
}



/**
 * AstrologyPanel Component
 * 
 * Displays astrological charts, planetary positions, and cosmic weather.
 * Features interactive natal charts, transit overlays, and real-time updates.
 * 
 * Features:
 * - Interactive natal chart visualization with WebGL shaders
 * - Real-time planetary positions and transits
 * - Cosmic weather updates and predictions
 * - House system calculations and interpretations
 * - Aspect patterns and configurations
 * - Integration with tarot for cosmic timing
 */
export const AstrologyPanel: React.FC<AstrologyPanelProps> = ({ isActive, onActivate }) => {
  const [chartType, setChartType] = useState<'natal' | 'transit' | 'synastry'>('natal');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPosition[]>([]);
  const { cosmicWeather, currentTransits, updateCosmicWeather } = useCosmicWeather();

  useEffect(() => {
    // Update cosmic weather every minute
    const interval = setInterval(() => {
      updateCosmicWeather();
    }, 60000);

    return () => clearInterval(interval);
  }, [updateCosmicWeather]);

  // Sample planetary data (would be calculated from ephemeris in production)
  useEffect(() => {
    setPlanetaryPositions([
      { planet: 'Sun', sign: 'Sagittarius', degree: 15.5, retrograde: false, house: 9 },
      { planet: 'Moon', sign: 'Cancer', degree: 22.3, retrograde: false, house: 4 },
      { planet: 'Mercury', sign: 'Sagittarius', degree: 8.7, retrograde: true, house: 9 },
      { planet: 'Venus', sign: 'Scorpio', degree: 28.1, retrograde: false, house: 8 },
      { planet: 'Mars', sign: 'Aries', degree: 3.9, retrograde: false, house: 1 },
      { planet: 'Jupiter', sign: 'Taurus', degree: 11.2, retrograde: false, house: 2 },
      { planet: 'Saturn', sign: 'Pisces', degree: 5.6, retrograde: false, house: 12 },
    ]);
  }, []);

  const handlePlanetClick = (planet: string) => {
    setSelectedPlanet(planet === selectedPlanet ? null : planet);
  };

  return (
    <div
      className={`${styles.panel} ${isActive ? styles.active : ''}`}
      onClick={onActivate}
      role="tabpanel"
      aria-label="Astrology chart and cosmic weather panel"
    >
      <header className={styles.header}>
        <h2>Celestial Map</h2>
        <div className={styles.chartControls}>
          <button
            onClick={() => setChartType('natal')}
            className={chartType === 'natal' ? styles.active : ''}
            aria-pressed={chartType === 'natal'}
          >
            Natal
          </button>
          <button
            onClick={() => setChartType('transit')}
            className={chartType === 'transit' ? styles.active : ''}
            aria-pressed={chartType === 'transit'}
          >
            Transits
          </button>
          <button
            onClick={() => setChartType('synastry')}
            className={chartType === 'synastry' ? styles.active : ''}
            aria-pressed={chartType === 'synastry'}
          >
            Synastry
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {/* Astrological Chart with WebGL Effects */}
        <div className={styles.chartContainer}>
          <GalaxyShader className={styles.galaxyBackground} />

          <svg
            className={styles.astroChart}
            viewBox="0 0 500 500"
            role="img"
            aria-label="Astrological chart"
          >
            {/* Chart wheel */}
            <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Houses */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x1 = 250 + 100 * Math.cos(angle);
              const y1 = 250 + 100 * Math.sin(angle);
              const x2 = 250 + 200 * Math.cos(angle);
              const y2 = 250 + 200 * Math.sin(angle);

              return (
                <line
                  key={i}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Planetary positions */}
            {planetaryPositions.map((pos) => {
              const angle = ((pos.house - 1) * 30 + (pos.degree / 30) * 30 - 90) * (Math.PI / 180);
              const x = 250 + 175 * Math.cos(angle);
              const y = 250 + 175 * Math.sin(angle);

              return (
                <g key={pos.planet}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={selectedPlanet === pos.planet ? '#FFD700' : '#9370DB'}
                    onClick={() => handlePlanetClick(pos.planet)}
                    className={styles.planetMarker}
                    role="button"
                    aria-label={`${pos.planet} in ${pos.sign}`}
                  />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                  >
                    {pos.planet.substring(0, 2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Cosmic Weather Sidebar */}
        <div className={styles.cosmicWeatherSidebar}>
          <h3>Cosmic Weather</h3>

          <div className={styles.weatherCard}>
            <h4>Current Phase</h4>
            <p>{cosmicWeather.moonPhase}</p>
            <p className={styles.subtle}>{cosmicWeather.moonSign}</p>
          </div>

          <div className={styles.weatherCard}>
            <h4>Active Transits</h4>
            {currentTransits.map((transit, i) => (
              <p key={i} className={styles.transitItem}>
                {transit.planet} {transit.aspect} {transit.natalPlanet}
              </p>
            ))}
          </div>

          <div className={styles.weatherCard}>
            <h4>Planetary Hours</h4>
            <p>Current: {cosmicWeather.planetaryHour}</p>
            <p className={styles.subtle}>Until {cosmicWeather.nextHourTime}</p>
          </div>

          {selectedPlanet && (
            <div className={styles.weatherCard}>
              <h4>{selectedPlanet} Details</h4>
              {planetaryPositions
                .filter(p => p.planet === selectedPlanet)
                .map(p => (
                  <div key={p.planet}>
                    <p>{p.sign} {p.degree.toFixed(1)}°</p>
                    <p>House {p.house}</p>
                    {p.retrograde && <p className={styles.retrograde}>Retrograde</p>}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};