'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DailyHoroscopeService } from '@/services/horoscope/DailyHoroscopeService';
import { DailyHoroscope } from '@/types/horoscope';
import styles from './DailyHoroscopeWidget.module.css';

interface DailyHoroscopeWidgetProps {
  className?: string;
}

export const DailyHoroscopeWidget: React.FC<DailyHoroscopeWidgetProps> = ({ className }) => {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [moonPhase, setMoonPhase] = useState<string>('');
  const [cosmicEvent, setCosmicEvent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const service = DailyHoroscopeService.getInstance();
    setHoroscope(service.getGeneralDailyHoroscope());
    setMoonPhase(service.getCurrentMoonPhase());
    setCosmicEvent(service.getCosmicEvent());
  }, []);

  if (!horoscope) {
    return (
      <div className={`${styles.widget} ${className}`}>
        <div className={styles.loading}>
          <span className={styles.loadingIcon}>🌙</span>
          <p>Reading the cosmos...</p>
        </div>
      </div>
    );
  }

  const energyIcons = {
    high: '⚡',
    medium: '🌟',
    low: '🌛'
  };

  return (
    <motion.div 
      className={`${styles.widget} ${className} ${isExpanded ? styles.expanded : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>✨</span>
          Daily Cosmic Insight
        </h3>
        <button 
          className={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.overview}>{horoscope.general.overview}</p>
        
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Energy Level:</span>
            <span className={styles.detailValue}>
              {energyIcons[horoscope.general.energy]} {horoscope.general.energy}
            </span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Cosmic Mood:</span>
            <span className={styles.detailValue}>{horoscope.general.mood}</span>
          </div>
        </div>

        <motion.div 
          className={styles.expandedContent}
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.moonPhase}>
            <span className={styles.moonIcon}>🌙</span>
            <span>{moonPhase}</span>
          </div>

          <div className={styles.cosmicEvent}>
            <span className={styles.eventIcon}>🔮</span>
            <span>{cosmicEvent}</span>
          </div>

          <div className={styles.luckySection}>
            <div className={styles.luckyNumbers}>
              <span className={styles.luckyLabel}>Lucky Numbers:</span>
              <div className={styles.numbersList}>
                {horoscope.general.luckyNumbers.map((num, index) => (
                  <span key={index} className={styles.luckyNumber}>
                    {num}
                  </span>
                ))}
              </div>
            </div>
            
            <div className={styles.luckyColor}>
              <span className={styles.luckyLabel}>Lucky Color:</span>
              <span 
                className={styles.colorSwatch}
                style={{ backgroundColor: horoscope.general.luckyColor }}
              />
              <span className={styles.colorName}>{horoscope.general.luckyColor}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </span>
      </div>
    </motion.div>
  );
};