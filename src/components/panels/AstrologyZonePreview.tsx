'use client';

import React from 'react';
import styles from './AstrologyZonePreview.module.css';

interface AstrologyZonePreviewProps {
  onSelectFeature?: (feature: string) => void;
}

export const AstrologyZonePreview: React.FC<AstrologyZonePreviewProps> = ({
  onSelectFeature
}) => {
  const features = [
    {
      id: 'birth-chart',
      name: 'Birth Chart',
      icon: '🌟',
      description: 'Your cosmic blueprint'
    },
    {
      id: 'horoscope',
      name: 'Daily Horoscope',
      icon: '☀️',
      description: 'Today\'s guidance'
    },
    {
      id: 'moon-cycle',
      name: 'Moon Cycle',
      icon: '🌙',
      description: 'Lunar influences'
    },
    {
      id: 'transits',
      name: 'Current Transits',
      icon: '🪐',
      description: 'Planetary movements'
    }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>✨ Astrology Portal</h2>
      
      <div className={styles.featureGrid}>
        {features.map(feature => (
          <button
            key={feature.id}
            className={styles.featureCard}
            onClick={() => onSelectFeature?.(feature.id)}
            aria-label={`Select ${feature.name}`}
          >
            <span className={styles.featureIcon}>{feature.icon}</span>
            <div className={styles.featureInfo}>
              <span className={styles.featureName}>{feature.name}</span>
              <span className={styles.featureDesc}>{feature.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.cosmicInsight}>
        <h3 className={styles.insightTitle}>Today&apos;s Cosmic Weather</h3>
        <p className={styles.insightText}>
          Mercury in Capricorn brings clarity to communication. 
          The waxing moon invites new beginnings.
        </p>
      </div>

      <div className={styles.hint}>
        Click to explore the cosmos
      </div>
    </div>
  );
};