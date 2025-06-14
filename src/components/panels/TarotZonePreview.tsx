'use client';

import React from 'react';
import styles from './TarotZonePreview.module.css';

interface TarotZonePreviewProps {
  onSelectReading?: (type: string) => void;
}

export const TarotZonePreview: React.FC<TarotZonePreviewProps> = ({
  onSelectReading
}) => {

  const readings = [
    { id: 'single', name: 'Single Card', description: 'Quick insight' },
    { id: 'three-card', name: 'Three Card', description: 'Past, Present, Future' },
    { id: 'celtic-cross', name: 'Celtic Cross', description: 'Deep exploration' }
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔮 Tarot Portal</h2>
      
      <div className={styles.deckInfo}>
        <h3 className={styles.deckTitle}>🌙 Rider-Waite Deck</h3>
        <p className={styles.deckDescription}>
          The classic tarot deck for timeless wisdom
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Select Reading Type</h3>
        <div className={styles.readingList}>
          {readings.map(reading => (
            <button
              key={reading.id}
              className={styles.readingItem}
              onClick={() => onSelectReading?.(reading.id)}
              aria-label={`Select ${reading.name} reading`}
            >
              <span className={styles.readingName}>{reading.name}</span>
              <span className={styles.readingDesc}>{reading.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.hint}>
        Click to enter the Tarot Realm
      </div>
    </div>
  );
};