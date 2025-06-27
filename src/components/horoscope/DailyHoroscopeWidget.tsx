'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DailyHoroscopeService } from '@/services/horoscope/DailyHoroscopeService';
import { DailyHoroscope } from '@/types/horoscope';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import styles from './DailyHoroscopeWidget.module.css';

interface DailyHoroscopeWidgetProps {
  className?: string;
}

export const DailyHoroscopeWidget: React.FC<DailyHoroscopeWidgetProps> = ({ className }) => {
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [moonPhase, setMoonPhase] = useState<string>('');
  const [cosmicEvent, setCosmicEvent] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const loadHoroscope = async () => {
      const service = DailyHoroscopeService.getInstance();
      
      // Set moon phase and cosmic event (same for all users)
      setMoonPhase(service.getCurrentMoonPhase());
      setCosmicEvent(service.getCosmicEvent());

      // Try to get personalized horoscope for authenticated users
      if (user) {
        try {
          const profile = await profileService.getProfile(user.id);
          
          if (profile?.birth_date) {
            const personalizedHoroscope = service.getPersonalizedHoroscope(profile.birth_date);
            if (personalizedHoroscope) {
              setHoroscope(personalizedHoroscope);
              setIsPersonalized(true);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading user profile for horoscope:', error);
        }
      }

      // Fallback to general horoscope
      setHoroscope(service.getGeneralDailyHoroscope());
      setIsPersonalized(false);
    };

    loadHoroscope();
  }, [user]);

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
          {isPersonalized ? `Your ${horoscope.personalized?.sign} Reading` : 'Daily Cosmic Insight'}
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
          {isPersonalized && horoscope.personalized && (
            <div className={styles.personalizedSection}>
              <div className={styles.zodiacHeader}>
                <span className={styles.zodiacSymbol}>
                  {horoscope.personalized.sign === 'aries' && '♈'}
                  {horoscope.personalized.sign === 'taurus' && '♉'}
                  {horoscope.personalized.sign === 'gemini' && '♊'}
                  {horoscope.personalized.sign === 'cancer' && '♋'}
                  {horoscope.personalized.sign === 'leo' && '♌'}
                  {horoscope.personalized.sign === 'virgo' && '♍'}
                  {horoscope.personalized.sign === 'libra' && '♎'}
                  {horoscope.personalized.sign === 'scorpio' && '♏'}
                  {horoscope.personalized.sign === 'sagittarius' && '♐'}
                  {horoscope.personalized.sign === 'capricorn' && '♑'}
                  {horoscope.personalized.sign === 'aquarius' && '♒'}
                  {horoscope.personalized.sign === 'pisces' && '♓'}
                </span>
                <span className={styles.signName}>
                  {horoscope.personalized.sign.charAt(0).toUpperCase() + horoscope.personalized.sign.slice(1)}
                </span>
              </div>
              
              <div className={styles.personalizedInsight}>
                <p className={styles.insight}>{horoscope.personalized.insight}</p>
              </div>
              
              <div className={styles.personalizedAdvice}>
                <span className={styles.adviceLabel}>Your Focus Today:</span>
                <p className={styles.advice}>{horoscope.personalized.advice}</p>
              </div>
              
              <div className={styles.focusArea}>
                <span className={styles.focusLabel}>Energy Focus:</span>
                <span className={styles.focusValue}>{horoscope.personalized.focus}</span>
              </div>
            </div>
          )}
          
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