'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useCosmicWeather } from '../../utils/cosmic-weather/useCosmicWeather';
import styles from './CosmicWeather.module.css';

interface CosmicWeatherProps {
  onClick?: () => void;
  className?: string;
}

export const CosmicWeather: React.FC<CosmicWeatherProps> = ({ 
  onClick, 
  className = '' 
}) => {
  // const { cosmicInfluence } = useCosmicWeather(); // For future use with real data
  const [loading, setLoading] = useState(true);
  const [activeOrb, setActiveOrb] = useState(0);

  // Rotate through different cosmic elements
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrb(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const cosmicOrbs = [
    { 
      emoji: '🌙', 
      label: 'Moon Phase',
      value: 'Waxing Crescent',
      color: '#E6E6FA'
    },
    { 
      emoji: '☿', 
      label: 'Mercury',
      value: 'Direct',
      color: '#FFD700'
    },
    { 
      emoji: '♀', 
      label: 'Venus',
      value: 'Harmonious',
      color: '#FF69B4'
    },
    { 
      emoji: '♂', 
      label: 'Mars',
      value: 'Energetic',
      color: '#FF4500'
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
              <div className={styles.orbEmoji}>{cosmicOrbs[activeOrb].emoji}</div>
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