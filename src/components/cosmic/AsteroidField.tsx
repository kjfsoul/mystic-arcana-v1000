'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ephemeris, AsteroidData } from '../../lib/astronomy/RealTimeEphemeris';
import styles from './AsteroidField.module.css';

interface AsteroidFieldProps {
  className?: string;
  density?: 'low' | 'medium' | 'high';
  animated?: boolean;
  interactive?: boolean;
  showLabels?: boolean;
  intensity?: number;
}

interface AsteroidParticle extends AsteroidData {
  rotationSpeed: number;
  pulsePhase: number;
  trailPoints: { x: number; y: number; opacity: number }[];
}

/**
 * AsteroidField Component
 * 
 * Renders an animated asteroid belt with realistic movement patterns,
 * different asteroid types, and interactive elements.
 */
export const AsteroidField: React.FC<AsteroidFieldProps> = ({
  className = '',
  density = 'medium',
  animated = true,
  interactive = false,
  showLabels = false,
  intensity = 1.0
}) => {
  const [asteroids, setAsteroids] = useState<AsteroidParticle[]>([]);
  const [hoveredAsteroid, setHoveredAsteroid] = useState<string | null>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate asteroids based on density
  const asteroidCount = useMemo(() => {
    const counts = { low: 30, medium: 50, high: 80 };
    return counts[density];
  }, [density]);

  useEffect(() => {
    // Initialize asteroids with enhanced properties
    const initialAsteroids: AsteroidParticle[] = Array.from({ length: asteroidCount }, (_, i) => {
      const baseAsteroid = ephemeris.updateAsteroidBelt()[0]; // Get template
      return {
        id: `asteroid-${i}`,
        x: Math.random(),
        y: Math.random(),
        size: 0.1 + Math.random() * 0.4,
        speed: 0.05 + Math.random() * 0.15,
        angle: Math.random() * 360,
        brightness: 0.3 + Math.random() * 0.5,
        type: ['rocky', 'metallic', 'carbonaceous'][Math.floor(Math.random() * 3)] as any,
        rotationSpeed: 0.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        trailPoints: []
      };
    });

    setAsteroids(initialAsteroids);
  }, [asteroidCount]);

  useEffect(() => {
    if (!animated) return;

    const animate = () => {
      setAsteroids(prevAsteroids => 
        prevAsteroids.map(asteroid => {
          const time = Date.now() / 1000;
          
          // Update orbital position
          const newAngle = (asteroid.angle + asteroid.speed) % 360;
          const radians = (newAngle * Math.PI) / 180;
          
          // Asteroid belt orbital mechanics
          const beltRadius = 0.3 + (asteroid.size * 0.1) + (Math.sin(time * 0.1 + asteroid.pulsePhase) * 0.05);
          const x = 0.5 + Math.cos(radians) * beltRadius;
          const y = 0.5 + Math.sin(radians) * beltRadius * 0.7; // Elliptical orbit
          
          // Update trail
          const newTrailPoint = { x, y, opacity: 1.0 };
          const updatedTrail = [newTrailPoint, ...asteroid.trailPoints.slice(0, 8)].map((point, index) => ({
            ...point,
            opacity: Math.max(0, 1 - (index * 0.2))
          }));

          // Brightness variation based on distance and type
          const distanceFromSun = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
          const baseBrightness = asteroid.brightness;
          const dynamicBrightness = baseBrightness * (1 - distanceFromSun * 0.3) * 
            (1 + Math.sin(time * 0.5 + asteroid.pulsePhase) * 0.2);

          return {
            ...asteroid,
            x,
            y,
            angle: newAngle,
            brightness: Math.max(0.1, dynamicBrightness),
            trailPoints: updatedTrail
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animated]);

  const getAsteroidColor = (type: AsteroidData['type'], brightness: number): string => {
    const colors = {
      rocky: `rgba(139, 119, 101, ${brightness})`,
      metallic: `rgba(192, 192, 192, ${brightness})`,
      carbonaceous: `rgba(64, 64, 64, ${brightness})`
    };
    return colors[type];
  };

  const getAsteroidGlow = (type: AsteroidData['type']): string => {
    const glows = {
      rocky: '#8B7765',
      metallic: '#C0C0C0',
      carbonaceous: '#404040'
    };
    return glows[type];
  };

  const handleAsteroidClick = (asteroid: AsteroidParticle) => {
    if (!interactive) return;
    
    // Could trigger asteroid information or mining simulation
    console.log(`Clicked asteroid ${asteroid.id} (${asteroid.type})`);
  };

  const handleAsteroidHover = (asteroidId: string | null) => {
    if (!interactive) return;
    setHoveredAsteroid(asteroidId);
  };

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ opacity: intensity }}
    >
      {/* Asteroid Belt Background Glow */}
      <div className={styles.beltGlow} />

      {/* Individual Asteroids */}
      {asteroids.map(asteroid => (
        <motion.div
          key={asteroid.id}
          className={styles.asteroidContainer}
          style={{
            left: `${asteroid.x * 100}%`,
            top: `${asteroid.y * 100}%`
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: asteroid.brightness,
            rotate: animated ? [0, 360] : 0
          }}
          transition={{
            scale: { duration: 0.5 },
            opacity: { duration: 0.3 },
            rotate: {
              duration: 10 / asteroid.rotationSpeed,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          whileHover={interactive ? { scale: 1.5 } : {}}
          onClick={() => handleAsteroidClick(asteroid)}
          onHoverStart={() => handleAsteroidHover(asteroid.id)}
          onHoverEnd={() => handleAsteroidHover(null)}
        >
          {/* Asteroid Trail */}
          {animated && asteroid.trailPoints.length > 1 && (
            <svg className={styles.trailSvg}>
              <path
                d={`M ${asteroid.trailPoints.map((point, index) => 
                  `${(point.x - asteroid.x) * window.innerWidth} ${(point.y - asteroid.y) * window.innerHeight}`
                ).join(' L ')}`}
                stroke={getAsteroidGlow(asteroid.type)}
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />
            </svg>
          )}

          {/* Asteroid Body */}
          <div
            className={`${styles.asteroid} ${styles[asteroid.type]}`}
            style={{
              width: asteroid.size * 12,
              height: asteroid.size * 12,
              backgroundColor: getAsteroidColor(asteroid.type, asteroid.brightness),
              boxShadow: `0 0 ${asteroid.size * 6}px ${getAsteroidGlow(asteroid.type)}40`
            }}
          />

          {/* Asteroid Glow Effect */}
          <div 
            className={styles.asteroidGlow}
            style={{
              backgroundColor: getAsteroidGlow(asteroid.type),
              opacity: asteroid.brightness * 0.2
            }}
          />

          {/* Asteroid Label (on hover) */}
          {interactive && showLabels && hoveredAsteroid === asteroid.id && (
            <motion.div
              className={styles.asteroidLabel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className={styles.labelTitle}>{asteroid.type.charAt(0).toUpperCase() + asteroid.type.slice(1)}</div>
              <div className={styles.labelDetails}>
                <span>Size: {(asteroid.size * 10).toFixed(1)}km</span>
                <span>Speed: {(asteroid.speed * 100).toFixed(1)} km/s</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Asteroid Belt Information Panel */}
      {interactive && (
        <motion.div
          className={styles.beltInfo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className={styles.infoTitle}>Asteroid Belt</div>
          <div className={styles.infoStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Objects:</span>
              <span className={styles.statValue}>{asteroids.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Types:</span>
              <span className={styles.statValue}>
                {Array.from(new Set(asteroids.map(a => a.type))).length}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Density:</span>
              <span className={styles.statValue}>{density}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Asteroid Type Legend */}
      {showLabels && (
        <div className={styles.typeLegend}>
          <div className={styles.legendTitle}>Asteroid Types</div>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.rocky}`} />
              <span>Rocky (Silicate)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.metallic}`} />
              <span>Metallic (Iron-Nickel)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.carbonaceous}`} />
              <span>Carbonaceous (Carbon-rich)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
