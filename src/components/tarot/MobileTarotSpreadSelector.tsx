'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MobileTarotSpreadSelector.module.css';

export type SpreadType = 'single' | 'three-card' | 'celtic-cross';

interface Spread {
  id: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface MobileTarotSpreadSelectorProps {
  onSelectSpread: (spread: SpreadType) => void;
  className?: string;
}

export const MobileTarotSpreadSelector: React.FC<MobileTarotSpreadSelectorProps> = ({
  onSelectSpread,
  className = ''
}) => {
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);

  const spreads: Spread[] = [
    {
      id: 'single',
      name: 'Single Card',
      description: 'Quick insight',
      cardCount: 1,
      duration: '2-3 min',
      difficulty: 'beginner'
    },
    {
      id: 'three-card',
      name: 'Three Card',
      description: 'Past, Present, Future',
      cardCount: 3,
      duration: '5-10 min',
      difficulty: 'intermediate'
    },
    {
      id: 'celtic-cross',
      name: 'Celtic Cross',
      description: 'Deep exploration',
      cardCount: 10,
      duration: '15-20 min',
      difficulty: 'advanced'
    }
  ];

  const getDifficultyColor = (difficulty: Spread['difficulty']) => {
    const colors = {
      beginner: '#4ecdc4',
      intermediate: '#ffd700',
      advanced: '#ff6b6b'
    };
    return colors[difficulty];
  };

  const handleSelectSpread = (spread: SpreadType) => {
    setSelectedSpread(spread);
    setTimeout(() => {
      onSelectSpread(spread);
    }, 300);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Spread</h2>
        <p className={styles.subtitle}>Select a reading type that resonates with you</p>
      </div>

      <div className={styles.spreadsContainer}>
        <AnimatePresence mode="wait">
          {spreads.map((spread, index) => (
            <motion.button
              key={spread.id}
              className={`${styles.spreadCard} ${
                selectedSpread === spread.id ? styles.selected : ''
              }`}
              onClick={() => handleSelectSpread(spread.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.spreadHeader}>
                <h3 className={styles.spreadName}>{spread.name}</h3>
                <span 
                  className={styles.difficulty}
                  style={{ color: getDifficultyColor(spread.difficulty) }}
                >
                  {spread.difficulty}
                </span>
              </div>

              <p className={styles.spreadDescription}>{spread.description}</p>

              <div className={styles.spreadMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>🃏</span>
                  <span className={styles.metaText}>{spread.cardCount} cards</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>⏱️</span>
                  <span className={styles.metaText}>{spread.duration}</span>
                </div>
              </div>

              {/* Visual representation of card layout */}
              <div className={styles.cardPreview}>
                {spread.id === 'single' && (
                  <div className={styles.singleCard}>
                    <div className={styles.card} />
                  </div>
                )}
                {spread.id === 'three-card' && (
                  <div className={styles.threeCards}>
                    <div className={styles.card} />
                    <div className={styles.card} />
                    <div className={styles.card} />
                  </div>
                )}
                {spread.id === 'celtic-cross' && (
                  <div className={styles.celticCross}>
                    <div className={styles.crossCenter}>
                      <div className={styles.card} />
                      <div className={styles.cardCross} />
                    </div>
                    <div className={styles.crossColumn}>
                      <div className={styles.card} />
                      <div className={styles.card} />
                      <div className={styles.card} />
                      <div className={styles.card} />
                    </div>
                  </div>
                )}
              </div>

              <motion.div 
                className={styles.selectIndicator}
                initial={{ scale: 0 }}
                animate={{ scale: selectedSpread === spread.id ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                ✓
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        <p className={styles.hint}>Tap a spread to begin your reading</p>
      </div>
    </div>
  );
};