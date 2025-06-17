'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ephemeris, PlanetaryPosition, LunarPhase, CelestialWeather, formatLunarPhase, getLunarEnergyColor, getSolarWindColor } from '../../lib/astronomy/RealTimeEphemeris';
import styles from './PlanetaryOverlay.module.css';

interface PlanetaryOverlayProps {
  className?: string;
  showPlanets?: boolean;
  showLunarPhase?: boolean;
  showSolarWind?: boolean;
  showTrails?: boolean;
  intensity?: number;
}

/**
 * PlanetaryOverlay Component
 * 
 * Renders real-time planetary positions, lunar phases, and celestial weather
 * as an overlay on the galaxy background with smooth animations.
 */
export const PlanetaryOverlay: React.FC<PlanetaryOverlayProps> = ({
  className = '',
  showPlanets = true,
  showLunarPhase = true,
  showSolarWind = true,
  showTrails = true,
  intensity = 1.0
}) => {
  const [planets, setPlanets] = useState<Map<string, PlanetaryPosition>>(new Map());
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);
  const [celestialWeather, setCelestialWeather] = useState<CelestialWeather | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initial data load
    setLunarPhase(ephemeris.getCurrentLunarPhase());
    setCelestialWeather(ephemeris.getCelestialWeather());

    // Animation loop for real-time updates
    const animate = () => {
      if (showPlanets) {
        setPlanets(ephemeris.updatePlanetaryPositions());
      }
      
      // Update celestial weather every 30 seconds
      if (Date.now() % 30000 < 100) {
        setCelestialWeather(ephemeris.getCelestialWeather());
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Update lunar phase daily
    const lunarInterval = setInterval(() => {
      setLunarPhase(ephemeris.getCurrentLunarPhase());
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(lunarInterval);
    };
  }, [showPlanets]);

  const handlePlanetClick = (planetName: string) => {
    // Could trigger planet information modal or astrological insights
    console.log(`Clicked on ${planetName}`);
  };

  const getSolarWindParticles = () => {
    if (!showSolarWind || !celestialWeather) return [];
    
    const particleCount = Math.floor(celestialWeather.solarWind.speed / 50);
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: celestialWeather.solarWind.speed / 100,
      size: Math.random() * 2 + 1
    }));
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ opacity: intensity }}
    >
      {/* Solar Wind Particles */}
      {showSolarWind && celestialWeather && (
        <div className={styles.solarWind}>
          {getSolarWindParticles().map(particle => (
            <motion.div
              key={particle.id}
              className={styles.solarParticle}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: getSolarWindColor(celestialWeather.solarWind.intensity)
              }}
              animate={{
                x: [0, window.innerWidth],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 10 / particle.speed,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      {/* Planetary Bodies */}
      {showPlanets && (
        <AnimatePresence>
          {Array.from(planets.entries()).map(([name, planet]) => (
            <motion.div
              key={name}
              className={styles.planetContainer}
              style={{
                left: `${planet.x * 100}%`,
                top: `${planet.y * 100}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: planet.brightness }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => handlePlanetClick(name)}
            >
              {/* Planet Trail */}
              {showTrails && planet.trail.length > 0 && (
                <svg className={styles.trailSvg}>
                  <path
                    d={`M ${planet.trail.map(point => 
                      `${(point.x - planet.x) * window.innerWidth} ${(point.y - planet.y) * window.innerHeight}`
                    ).join(' L ')}`}
                    stroke={planet.color}
                    strokeWidth="1"
                    fill="none"
                    opacity="0.3"
                  />
                </svg>
              )}

              {/* Planet Body */}
              <motion.div
                className={styles.planet}
                style={{
                  width: planet.size * 8,
                  height: planet.size * 8,
                  backgroundColor: planet.color,
                  boxShadow: `0 0 ${planet.size * 4}px ${planet.color}40`
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  scale: {
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 20 / planet.speed,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              />

              {/* Planet Label */}
              <div className={styles.planetLabel}>
                {name}
              </div>

              {/* Planet Glow */}
              <div 
                className={styles.planetGlow}
                style={{
                  backgroundColor: planet.color,
                  opacity: planet.brightness * 0.3
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Lunar Phase Indicator */}
      {showLunarPhase && lunarPhase && (
        <motion.div
          className={styles.lunarPhase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className={styles.moonContainer}>
            <div 
              className={styles.moon}
              style={{
                background: `linear-gradient(90deg, 
                  ${getLunarEnergyColor(lunarPhase.energy)} 0%, 
                  ${getLunarEnergyColor(lunarPhase.energy)}40 ${lunarPhase.illumination * 100}%, 
                  transparent ${lunarPhase.illumination * 100}%)`
              }}
            />
            <div className={styles.moonGlow} style={{
              backgroundColor: getLunarEnergyColor(lunarPhase.energy),
              opacity: lunarPhase.illumination * 0.5
            }} />
          </div>
          
          <div className={styles.lunarInfo}>
            <div className={styles.phaseName}>
              {formatLunarPhase(lunarPhase.phase)}
            </div>
            <div className={styles.phaseDetails}>
              <span>{Math.round(lunarPhase.illumination * 100)}% illuminated</span>
              <span>{lunarPhase.energy} energy</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Celestial Weather Display */}
      {showSolarWind && celestialWeather && (
        <motion.div
          className={styles.celestialWeather}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className={styles.weatherTitle}>Cosmic Weather</div>
          
          <div className={styles.weatherItem}>
            <span className={styles.weatherLabel}>Solar Wind:</span>
            <span 
              className={styles.weatherValue}
              style={{ color: getSolarWindColor(celestialWeather.solarWind.intensity) }}
            >
              {Math.round(celestialWeather.solarWind.speed)} km/s
            </span>
          </div>
          
          <div className={styles.weatherItem}>
            <span className={styles.weatherLabel}>Geomagnetic:</span>
            <span className={styles.weatherValue}>
              K{celestialWeather.geomagneticActivity.kIndex} ({celestialWeather.geomagneticActivity.activity})
            </span>
          </div>
          
          <div className={styles.weatherItem}>
            <span className={styles.weatherLabel}>Cosmic Rays:</span>
            <div className={styles.cosmicRayBar}>
              <div 
                className={styles.cosmicRayFill}
                style={{ width: `${celestialWeather.cosmicRayIntensity * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Constellation Highlights */}
      <div className={styles.constellationHighlights}>
        {ephemeris.getConstellationHighlights().map(constellation => (
          <motion.div
            key={constellation}
            className={styles.constellationHighlight}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            {constellation}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
