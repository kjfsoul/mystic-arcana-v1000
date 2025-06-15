'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotEngine, TarotReading } from '../../lib/tarot/TarotEngine';
import { TarotCard } from './TarotCard';
import { useTarotDeck } from '../../hooks/useTarotDeck';
import { TarotService } from '../../services/TarotService';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ApiDrivenTarotPanel.module.css';

interface ApiDrivenTarotPanelProps {
  className?: string;
  deckId?: string;
  onReadingComplete?: (reading: TarotReading) => void;
}

/**
 * Enhanced Tarot Panel using the Tarot Data Engine API
 * 
 * Features:
 * - API-driven card data (replaces hardcoded arrays)
 * - Loading states and error handling
 * - Smooth animations and transitions
 * - Guest vs authenticated user experiences
 * - Automatic reading persistence
 */
export const ApiDrivenTarotPanel: React.FC<ApiDrivenTarotPanelProps> = ({
  className = '',
  deckId,
  onReadingComplete
}) => {
  const { user, isGuest } = useAuth();
  const { cards, deck, loading, error, refetch } = useTarotDeck(deckId);
  
  const [selectedSpread, setSelectedSpread] = useState<'single' | 'three-card' | 'celtic-cross'>('single');
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  const [isPerformingReading, setIsPerformingReading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize tarot engine with API-driven data
  const tarotEngine = useMemo(() => new TarotEngine({
    isGuest,
    deckId
  }), [isGuest, deckId]);

  const availableSpreads = tarotEngine.getAvailableSpreadTypes();

  const handleSpreadSelection = useCallback((spreadType: 'single' | 'three-card' | 'celtic-cross') => {
    if (isGuest && spreadType !== 'single') {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedSpread(spreadType);
    setCurrentReading(null);
    setFlippedCards(new Set());
  }, [isGuest]);

  const performReading = useCallback(async () => {
    if (loading || error) {
      console.warn('Cannot perform reading: deck not loaded');
      return;
    }

    setIsPerformingReading(true);
    setFlippedCards(new Set());
    
    try {
      const reading = await tarotEngine.performReading(selectedSpread);
      setCurrentReading(reading);
      
      // Save reading for registered users
      if (!isGuest && user) {
        try {
          const { error: saveError } = await TarotService.saveReading(reading, user.id);
          if (saveError) {
            console.warn('Failed to save reading:', saveError);
          }
        } catch (saveError) {
          console.warn('Error saving reading:', saveError);
        }
      }
      
      // Notify parent component
      if (onReadingComplete) {
        onReadingComplete(reading);
      }
    } catch (error) {
      console.error('Error performing reading:', error);
    } finally {
      setIsPerformingReading(false);
    }
  }, [selectedSpread, isGuest, tarotEngine, user, loading, error, onReadingComplete]);

  const handleCardFlip = useCallback((cardIndex: number) => {
    setFlippedCards(prev => new Set([...prev, cardIndex]));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingState}>
          <motion.div
            className={styles.loadingSpinner}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🌟
          </motion.div>
          <h3>Loading Tarot Deck...</h3>
          <p>Connecting to the cosmic database...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Unable to Load Tarot Deck</h3>
          <p>{error}</p>
          <button 
            onClick={refetch}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Deck Information */}
      {deck && (
        <div className={styles.deckInfo}>
          <h2 className={styles.deckName}>{deck.name}</h2>
          <p className={styles.deckDescription}>{deck.description}</p>
          <div className={styles.deckStats}>
            <span>{cards.length} cards loaded</span>
          </div>
        </div>
      )}

      {/* Spread Selection */}
      <div className={styles.spreadSelection}>
        <h3>Choose Your Reading</h3>
        <div className={styles.spreadOptions}>
          {availableSpreads.map((spread) => (
            <button
              key={spread.id}
              onClick={() => handleSpreadSelection(spread.id as any)}
              className={`${styles.spreadButton} ${
                selectedSpread === spread.id ? styles.active : ''
              } ${
                isGuest && spread.id !== 'single' ? styles.locked : ''
              }`}
              disabled={isGuest && spread.id !== 'single'}
            >
              <div className={styles.spreadIcon}>
                {spread.id === 'single' ? '🃏' : 
                 spread.id === 'three-card' ? '🃏🃏🃏' : '🃏✨🃏'}
              </div>
              <div className={styles.spreadDetails}>
                <h4>{spread.name}</h4>
                <p>{spread.description}</p>
                <span className={styles.cardCount}>{spread.cardCount} cards</span>
              </div>
              {isGuest && spread.id !== 'single' && (
                <div className={styles.lockIcon}>🔒</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Area */}
      <div className={styles.readingArea}>
        {!currentReading ? (
          <div className={styles.startReading}>
            <button
              onClick={performReading}
              disabled={isPerformingReading}
              className={styles.performReadingButton}
            >
              {isPerformingReading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                  Shuffling Cards...
                </>
              ) : (
                <>🔮 Begin Reading</>
              )}
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div 
              className={styles.cardsContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Cards Display */}
              <div className={`${styles.cardsLayout} ${styles[selectedSpread]}`}>
                {currentReading.cards.map((card, index) => (
                  <motion.div
                    key={`${currentReading.id}-${card.id}-${index}`}
                    className={styles.cardPosition}
                    initial={{ opacity: 0, y: 50, rotateY: 0 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: index * 0.3, duration: 0.8 }}
                  >
                    <div className={styles.positionLabel}>
                      {currentReading.positions[index]}
                    </div>
                    <TarotCard
                      frontImage={card.frontImage}
                      backImage={card.backImage}
                      cardName={card.name}
                      cardMeaning={card.meaning.upright}
                      isFlipped={flippedCards.has(index)}
                      onFlip={() => handleCardFlip(index)}
                      className={styles.tarotCard}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Interpretation */}
              {flippedCards.size > 0 && (
                <motion.div
                  className={styles.interpretation}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3>Your Reading</h3>
                  <p>{currentReading.interpretation}</p>
                  
                  {/* New Reading Button */}
                  <button
                    onClick={performReading}
                    className={styles.newReadingButton}
                    disabled={isPerformingReading}
                  >
                    🔄 New Reading
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Auth Modal for Guests */}
      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.authModal} onClick={e => e.stopPropagation()}>
            <h3>🔮 Unlock Full Readings</h3>
            <p>Create an account to access advanced spreads and save your readings!</p>
            <div className={styles.modalButtons}>
              <button className={styles.signUpButton}>Sign Up</button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowAuthModal(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
