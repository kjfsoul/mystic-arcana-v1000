'use client';
 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMoonPhase, MoonPhaseData, isFullMoon, formatNextPhaseDate } from '@/lib/astrology/MoonPhase';
import styles from './CosmicWeather.module.css';
interface CosmicWeatherProps {
  onClick?: () => void;
  className?: string;
}
export const CosmicWeather: React.FC<CosmicWeatherProps> = ({ 
  onClick, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(true);
  const [activeOrb, setActiveOrb] = useState(0);
  const [moonPhase, setMoonPhase] = useState<MoonPhaseData | null>(null);
  const [moonError, setMoonError] = useState(false);
  // Rotate through different cosmic elements
 
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrb(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  // Load real moon phase data
 
  useEffect(() => {
    async function loadMoonPhase() {
      try {
        setLoading(true);
        setMoonError(false);
        const moonData = await getMoonPhase();
        setMoonPhase(moonData);
        
        if (moonData.isUnavailable) {
          setMoonError(true);
        }
      } catch (error) {
        console.error('Error loading moon phase:', error);
        setMoonError(true);
      } finally {
        setLoading(false);
      }
    }
    loadMoonPhase();
  }, []);
  const cosmicOrbs = [
    { 
      emoji: moonPhase?.emoji || '🌙', 
      label: 'Moon Phase',
      value: moonError ? 'Data Unavailable' : moonPhase ? `${moonPhase.phase} (${moonPhase.illumination}%)` : 'Loading...',
      color: '#E6E6FA',
      isFullMoon: moonPhase ? isFullMoon(moonPhase) : false
    },
    { 
      emoji: '☿', 
      label: 'Mercury',
      value: 'Direct',
      color: '#FFD700',
      isFullMoon: false
    },
    { 
      emoji: '♀', 
      label: 'Venus',
      value: 'Harmonious',
      color: '#FF69B4',
      isFullMoon: false
    },
    { 
      emoji: '♂', 
      label: 'Mars',
      value: 'Energetic',
      color: '#FF4500',
      isFullMoon: false
    }
  ];
  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <motion.div
            className={styles.loadingOrb}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ✦
          </motion.div>
          <p className={styles.loadingText}>Reading cosmic energies...</p>
        </div>
      </div>
    );
  }
  return (
    <motion.div 
      className={`${styles.container} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Central Cosmic Display */}
      <div className={styles.centralDisplay}>
        <motion.div 
          className={styles.mainOrb}
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOrb}
              className={styles.orbContent}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{ color: cosmicOrbs[activeOrb].color }}
            >
              <motion.div 
                className={styles.orbEmoji}
                animate={cosmicOrbs[activeOrb].isFullMoon ? {
                  textShadow: [
                    '0 0 10px #ffffff',
                    '0 0 20px #e6e6fa',
                    '0 0 30px #e6e6fa',
                    '0 0 20px #e6e6fa',
                    '0 0 10px #ffffff'
                  ],
                  scale: [1, 1.1, 1]
                } : {}}
                transition={cosmicOrbs[activeOrb].isFullMoon ? {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}}
              >
                {cosmicOrbs[activeOrb].emoji}
              </motion.div>
              <div className={styles.orbLabel}>{cosmicOrbs[activeOrb].label}</div>
              <div className={styles.orbValue}>{cosmicOrbs[activeOrb].value}</div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* Orbital Elements */}
        <div className={styles.orbitalRing}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              className={styles.orbitalElement}
              animate={{
                rotate: 360,
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                rotate: { 
                  duration: 15 + index * 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                },
                scale: { 
                  duration: 3 + index * 0.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: index * 0.2
                }
              }}
              style={{
                transform: `rotate(${index * 60}deg) translateX(120px)`
              }}
            >
              ✦
            </motion.div>
          ))}
        </div>
        {/* Cosmic Weather Indicators */}
        <div className={styles.weatherIndicators}>
          {activeOrb === 0 && moonPhase && !moonError ? (
            <>
              <motion.div
                className={styles.aspectIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                🌕 Next Full Moon: {formatNextPhaseDate(moonPhase.nextFullMoon)}
              </motion.div>
              <motion.div
                className={styles.aspectIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                🌑 Next New Moon: {formatNextPhaseDate(moonPhase.nextNewMoon)}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                className={styles.aspectIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                ☽ ☌ ☉ Harmonious Energy
              </motion.div>
              <motion.div
                className={styles.aspectIndicator}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                ♀ △ ♃ Creative Flow
              </motion.div>
            </>
          )}
        </div>
      </div>
      {/* Interactive Hint */}
      <motion.div 
        className={styles.interactiveHint}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className={styles.hintText}>Explore the Cosmos</span>
        <span className={styles.hintIcon}>→</span>
      </motion.div>
    </motion.div>
  );
};
