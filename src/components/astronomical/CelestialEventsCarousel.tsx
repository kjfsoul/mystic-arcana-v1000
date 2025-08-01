'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CelestialEventsCarousel.module.css';

interface CelestialEvent {
  id: string;
  type: 'retrograde' | 'eclipse' | 'conjunction' | 'full-moon' | 'new-moon' | 'meteor-shower';
  title: string;
  description: string;
  date: string;
  impact: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

// Mock celestial events data - in production this would come from astronomical API
const mockEvents: CelestialEvent[] = [
  {
    id: '1',
    type: 'retrograde',
    title: 'Mercury Retrograde',
    description: 'Communication and technology may experience disruptions. Perfect time for reflection.',
    date: 'Dec 15 - Jan 4',
    impact: 'high',
    icon: '☿',
    color: '#ff6b9d'
  },
  {
    id: '2',
    type: 'full-moon',
    title: 'Cold Moon in Gemini',
    description: 'Heightened intuition and emotional clarity. Ideal for manifestation practices.',
    date: 'Dec 15',
    impact: 'medium',
    icon: '🌕',
    color: '#e6d7ff'
  },
  {
    id: '3',
    type: 'conjunction',
    title: 'Venus-Jupiter Conjunction',
    description: 'A rare alignment bringing abundance and love energy to all signs.',
    date: 'Dec 20',
    impact: 'high',
    icon: '♀♃',
    color: '#ffd700'
  },
  {
    id: '4',
    type: 'meteor-shower',
    title: 'Geminids Peak',
    description: 'The most prolific meteor shower of the year. Make wishes under shooting stars.',
    date: 'Dec 13-14',
    impact: 'low',
    icon: '☄️',
    color: '#9c88ff'
  },
  {
    id: '5',
    type: 'new-moon',
    title: 'New Moon in Capricorn',
    description: 'Perfect timing for setting intentions around career and long-term goals.',
    date: 'Dec 30',
    impact: 'medium',
    icon: '🌑',
    color: '#ff9a9e'
  }
];

interface CelestialEventsCarouselProps {
  onEventClick?: () => void;
}

/**
 * Celestial Events Carousel Component
 * 
 * Displays current and upcoming astronomical events in an engaging carousel format.
 * Replaces the Virtual Reader panel with dynamic cosmic content.
 */
export const CelestialEventsCarousel: React.FC<CelestialEventsCarouselProps> = ({ onEventClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentEvent = mockEvents[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
    setIsAutoPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockEvents.length) % mockEvents.length);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#ff6b9d';
      case 'medium': return '#ffd700';
      case 'low': return '#9c88ff';
      default: return '#ffffff';
    }
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🌌</span>
          Cosmic Events
        </h2>
        <p className={styles.subtitle}>Current celestial influences</p>
      </div>

      <div 
        className={styles.eventContainer}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            className={styles.eventCard}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            style={{ '--event-color': currentEvent.color } as React.CSSProperties}
            onClick={onEventClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onEventClick?.()}
          >
            <div className={styles.eventIcon}>
              {currentEvent.icon}
            </div>
            
            <div className={styles.eventContent}>
              <div className={styles.eventHeader}>
                <h3 className={styles.eventTitle}>{currentEvent.title}</h3>
                <div className={styles.eventMeta}>
                  <span className={styles.eventDate}>{currentEvent.date}</span>
                  <span 
                    className={styles.impactBadge}
                    style={{ backgroundColor: getImpactColor(currentEvent.impact) }}
                  >
                    {currentEvent.impact} impact
                  </span>
                </div>
              </div>
              
              <p className={styles.eventDescription}>
                {currentEvent.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={handlePrevious}
          aria-label="Previous event"
        >
          ‹
        </button>
        
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNext}
          aria-label="Next event"
        >
          ›
        </button>
      </div>

      {/* Pagination Dots */}
      <div className={styles.pagination}>
        {mockEvents.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to event ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div className={styles.autoPlayIndicator}>
          <div className={styles.progressBar} />
        </div>
      )}
    </div>
  );
};