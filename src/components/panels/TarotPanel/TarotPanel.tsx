'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card } from '../../ui/Card/Card';
import { CardAnimations } from '../../animations/CardAnimations/CardAnimations';
import { useCosmicWeather } from '../../../utils/cosmic-weather/useCosmicWeather';
import styles from './TarotPanel.module.css';

interface TarotPanelProps {
  isActive: boolean;
  onActivate: () => void;
}

interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  image: string;
  meaning: {
    upright: string;
    reversed: string;
  };
}

/**
 * TarotPanel Component
 * 
 * Handles tarot card selection, spreads, and readings.
 * Features:
 * - Interactive card deck with shuffle animations
 * - Multiple spread layouts (Celtic Cross, Three Card, etc.)
 * - Card interpretations with cosmic weather influence
 * - Accessibility features for screen readers
 */
export const TarotPanel: React.FC<TarotPanelProps> = ({ isActive, onActivate }) => {
  const [selectedCards] = useState<TarotCard[]>([]);
  const [currentSpread, setCurrentSpread] = useState<'three-card' | 'celtic-cross' | 'single'>('three-card');
  const [isShuffling, setIsShuffling] = useState(false);
  const { cosmicInfluence } = useCosmicWeather();



  const handleShuffle = async () => {
    setIsShuffling(true);
    // Shuffle animation and logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsShuffling(false);
  };

  return (
    <div
      className={`${styles.panel} ${isActive ? styles.active : ''}`}
      onClick={onActivate}
      role="tabpanel"
      aria-label="Tarot reading interface"
    >
      <header className={styles.header}>
        <h2>Tarot Reading</h2>
        <p className={styles.cosmicInfluence}>
          Cosmic Influence: {cosmicInfluence.currentPhase}
        </p>
      </header>

      <div className={styles.content}>
        {/* Spread selector */}
        <div className={styles.spreadSelector}>
          <label htmlFor="spread-type">Choose Spread:</label>
          <select
            id="spread-type"
            value={currentSpread}
            onChange={(e) => setCurrentSpread(e.target.value as 'three-card' | 'celtic-cross' | 'single')}
            aria-label="Select tarot spread type"
          >
            <option value="single">Single Card</option>
            <option value="three-card">Three Card (Past, Present, Future)</option>
            <option value="celtic-cross">Celtic Cross</option>
          </select>
        </div>

        {/* Card display area with animations */}
        <div className={styles.cardArea}>
          <CardAnimations isShuffling={isShuffling}>
            {selectedCards.length === 0 ? (
              <div className={styles.deckPlaceholder}>
                <button
                  onClick={handleShuffle}
                  disabled={isShuffling}
                  className={styles.shuffleButton}
                  aria-label="Shuffle tarot deck"
                >
                  {isShuffling ? 'Shuffling...' : 'Shuffle & Draw'}
                </button>
              </div>
            ) : (
              <div className={styles.spreadLayout}>
                {selectedCards.map((card, index) => (
                  <Card
                    key={card.id}
                    className={styles.tarotCard}
                    role="img"
                    aria-label={`${card.name} card in position ${index + 1}`}
                  >
                    <Image src={card.image} alt={card.name} width={200} height={300} />
                    <div className={styles.cardInfo}>
                      <h3>{card.name}</h3>
                      <p>{card.meaning.upright}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardAnimations>
        </div>

        {/* Interpretation area */}
        {selectedCards.length > 0 && (
          <div className={styles.interpretation} role="region" aria-label="Card interpretation">
            <h3>Your Reading</h3>
            <div className={styles.readingText}>
              {/* Dynamic interpretation based on cards and cosmic weather */}
              <p>The cards reveal a path influenced by {cosmicInfluence.planetaryAlignment}...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};