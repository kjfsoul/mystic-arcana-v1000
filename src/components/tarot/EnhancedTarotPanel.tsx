'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard } from './TarotCard';
import { TarotEngine, TarotReading, TarotCardData } from '../../lib/tarot/TarotEngine';
import { TarotService } from '../../services/TarotService';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { UnlockJourneyModal } from '../modals/UnlockJourneyModal';
import { useCosmicWeather } from '../../utils/cosmic-weather/useCosmicWeather';
import { MobileTarotReading } from './MobileTarotReading';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import styles from './EnhancedTarotPanel.module.css';

interface EnhancedTarotPanelProps {
  isActive?: boolean;
  onActivate?: () => void;
  className?: string;
}

export const EnhancedTarotPanel: React.FC<EnhancedTarotPanelProps> = ({
  isActive = true,
  className = ''
}) => {
  const { user, isGuest } = useAuth();
  const { cosmicInfluence } = useCosmicWeather();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(null);
  const [isPerformingReading, setIsPerformingReading] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<'single' | 'three-card' | 'celtic-cross'>('single');
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // Initialize tarot engine with user context
  const tarotEngine = useMemo(() => new TarotEngine({
    isGuest,
    cosmicInfluence
  }), [isGuest, cosmicInfluence]);
  
  const availableSpreads = tarotEngine.getAvailableSpreadTypes();

  const handleSpreadSelection = useCallback((spreadType: 'single' | 'three-card' | 'celtic-cross') => {
    if (isGuest && spreadType !== 'single') {
      setShowAuthModal(true);
      return;
    }
    
    setSelectedSpread(spreadType);
    setCurrentReading(null);
    setFlippedCards(new Set());
    setShowUnlockModal(false);
  }, [isGuest]);

  const performReading = useCallback(async () => {
    setIsPerformingReading(true);
    setFlippedCards(new Set());
    
    try {
      const reading = await tarotEngine.performReading(selectedSpread);
      setCurrentReading(reading);
      
      // Save reading for registered users
      if (!isGuest && user) {
        try {
          const { error } = await TarotService.saveReading(reading, user.id);
          if (error) {
            console.warn('Failed to save reading:', error);
          }
        } catch (saveError) {
          console.warn('Error saving reading:', saveError);
        }
      }
      
      // For guests, show unlock modal after single card reading with interpretation
      if (isGuest && selectedSpread === 'single') {
        setTimeout(() => setShowUnlockModal(true), 4000);
      }
    } catch (error) {
      console.error('Error performing reading:', error);
    } finally {
      setIsPerformingReading(false);
    }
  }, [selectedSpread, isGuest, tarotEngine, user]);

  const handleCardFlip = useCallback((cardIndex: number) => {
    setFlippedCards(prev => new Set([...prev, cardIndex]));
  }, []);

  const handleCloseUnlockModal = useCallback(() => {
    setShowUnlockModal(false);
  }, []);

  // Use mobile-optimized component for mobile devices
  if (isMobile) {
    return (
      <>
        <MobileTarotReading />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode="signin"
          title="Sign in to unlock full readings"
          subtitle="Guest users can only access single card readings"
        />
      </>
    );
  }

  return (
    <div className={`${styles.panel} ${isActive ? styles.active : ''} ${className}`}>
      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>
          🔮 Tarot Reading
          {isGuest && <span className={styles.guestBadge}>Guest</span>}
        </h2>
        <p className={styles.cosmicInfluence}>
          Cosmic Influence: {cosmicInfluence.currentPhase}
        </p>
      </motion.header>

      {/* Spread Selector */}
      <motion.div 
        className={styles.spreadSelector}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3>Choose Your Spread</h3>
        <div className={styles.spreadOptions}>
          {availableSpreads.map((spread) => {
            const canAccess = tarotEngine.canAccessSpread(spread.id as 'single' | 'three-card' | 'celtic-cross');
            return (
              <motion.button
                key={spread.id}
                className={`${styles.spreadButton} ${
                  selectedSpread === spread.id ? styles.selected : ''
                } ${!canAccess ? styles.locked : ''}`}
                onClick={() => handleSpreadSelection(spread.id as 'single' | 'three-card' | 'celtic-cross')}
                disabled={!canAccess}
                whileHover={canAccess ? { scale: 1.05 } : {}}
                whileTap={canAccess ? { scale: 0.95 } : {}}
              >
                <div className={styles.spreadInfo}>
                  <span className={styles.spreadName}>{spread.name}</span>
                  <span className={styles.spreadCards}>{spread.cardCount} cards</span>
                  <span className={styles.spreadDescription}>{spread.description}</span>
                  {!canAccess && (
                    <span className={styles.lockIcon}>🔒 Sign up to unlock</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Reading Area */}
      <motion.div 
        className={styles.readingArea}
        layout
      >
        {!currentReading ? (
          <motion.div 
            className={styles.startReading}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <button
              className={styles.drawButton}
              onClick={performReading}
              disabled={isPerformingReading}
            >
              {isPerformingReading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  🌟
                </motion.div>
              ) : (
                '✨ Draw Cards'
              )}
            </button>
            <p className={styles.instruction}>
              {isGuest 
                ? "Experience a free Daily Card reading" 
                : "Click to shuffle and draw your cards"
              }
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div 
              className={styles.cardsContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              {/* Cards */}
              <div className={`${styles.cardsLayout} ${styles[selectedSpread]}`}>
                {currentReading.cards.map((card: TarotCardData, index: number) => (
                  <motion.div
                    key={`${currentReading.id}-${card.id}-${index}`}
                    className={styles.cardPosition}
                    initial={{ opacity: 0, y: 50, rotateY: 0 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
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
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <h3>Your Reading</h3>
                  <div className={styles.interpretationText}>
                    <p>{currentReading.interpretation}</p>
                    
                    {flippedCards.size === currentReading.cards.length && (
                      <motion.div
                        className={styles.completedReading}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <p className={styles.completedMessage}>
                          ✨ Your reading is complete! The cards have revealed their wisdom.
                        </p>
                        
                        {!isGuest && (
                          <button 
                            className={styles.newReadingButton}
                            onClick={() => setCurrentReading(null)}
                          >
                            Draw New Cards
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Unlock Journey Modal - positioned below reading content */}
      <UnlockJourneyModal
        isVisible={showUnlockModal}
        onClose={handleCloseUnlockModal}
        type="tarot"
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signup"
        title="Join Mystic Arcana"
        subtitle="Unlock your personalized spiritual journey"
      />
    </div>
  );
};