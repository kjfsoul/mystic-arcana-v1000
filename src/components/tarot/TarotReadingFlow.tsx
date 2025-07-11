'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TarotDeckService } from '@/services/tarot/TarotDeckService';
import { TarotCard, SpreadType } from '@/types/tarot';
import { TarotCardDisplay } from './TarotCardDisplay';
import { supabase } from '@/lib/supabase/client';
import styles from './TarotReadingFlow.module.css';

interface TarotReadingFlowProps {
  spreadType: SpreadType;
  onComplete?: (cards: TarotCard[]) => void;
  onCancel?: () => void;
}

type Phase = 'loading' | 'shuffle' | 'cut' | 'draw' | 'reveal';

export const TarotReadingFlow: React.FC<TarotReadingFlowProps> = ({
  spreadType,
  onComplete,
  onCancel
}) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('loading');
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardCount = spreadType === 'single' ? 1 : spreadType === 'three-card' ? 3 : 10;

  useEffect(() => {
    loadDeck();
  }, []);

  const loadDeck = async () => {
    try {
      const deckService = TarotDeckService.getInstance();
      const deckData = await deckService.getDefaultDeck();
      setDeck(deckData.cards);
      setPhase('shuffle');
    } catch (err) {
      console.error('Failed to load deck:', err);
      setError('Failed to load tarot deck. Please try again.');
    }
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    
    // Animate shuffle for 3 seconds
    setTimeout(() => {
      const deckService = TarotDeckService.getInstance();
      const shuffled = deckService.shuffleDeck(deck);
      setDeck(shuffled);
      setIsShuffling(false);
      setPhase('cut');
    }, 3000);
  };

  const handleCut = () => {
    // Simulate cutting the deck
    const cutPoint = Math.floor(Math.random() * (deck.length - 20)) + 10;
    const cutDeck = [...deck.slice(cutPoint), ...deck.slice(0, cutPoint)];
    setDeck(cutDeck);
    setPhase('draw');
  };

  const handleDraw = () => {
    // Draw cards with reversal chance
    const drawnCards = deck.slice(0, cardCount).map(card => ({
      ...card,
      isReversed: Math.random() < 0.5
    }));
    setSelectedCards(drawnCards);
    setPhase('reveal');
    saveReading(drawnCards);
  };

  const saveReading = async (cards: TarotCard[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tarot_readings')
        .insert({
          user_id: user.id,
          spread_type: spreadType,
          cards_drawn: cards.map(c => ({
            id: c.id,
            name: c.name,
            isReversed: c.isReversed
          })),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save reading:', error);
      }
    } catch (err) {
      console.error('Error saving reading:', err);
    }
  };

  const handleRevealComplete = () => {
    onComplete?.(selectedCards);
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={onCancel} className={styles.button}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className={styles.phaseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.loading}>
              <span className={styles.loadingIcon}>🔮</span>
              <p>Preparing the sacred deck...</p>
            </div>
          </motion.div>
        )}

        {phase === 'shuffle' && (
          <motion.div
            key="shuffle"
            className={styles.phaseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.phaseTitle}>Shuffle the Deck</h2>
            <p className={styles.phaseDescription}>
              Focus on your question as the cards are shuffled
            </p>
            
            <div className={styles.deckContainer}>
              <motion.div
                className={styles.deck}
                animate={isShuffling ? {
                  x: [0, -20, 20, -10, 10, 0],
                  rotateZ: [0, -5, 5, -2, 2, 0]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isShuffling ? Infinity : 0
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.deckCard}
                    style={{
                      transform: `translateZ(${i * 2}px)`,
                      zIndex: 5 - i
                    }}
                  />
                ))}
              </motion.div>
            </div>

            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              {isShuffling ? 'Shuffling...' : 'Shuffle'}
            </button>
          </motion.div>
        )}

        {phase === 'cut' && (
          <motion.div
            key="cut"
            className={styles.phaseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.phaseTitle}>Cut the Deck</h2>
            <p className={styles.phaseDescription}>
              Trust your intuition and cut the deck
            </p>
            
            <div className={styles.cutDeckContainer}>
              <motion.div
                className={styles.deckHalf}
                whileHover={{ x: -20 }}
              />
              <motion.div
                className={styles.deckHalf}
                whileHover={{ x: 20 }}
              />
            </div>

            <button
              onClick={handleCut}
              className={`${styles.button} ${styles.primaryButton}`}
            >
              Cut the Deck
            </button>
          </motion.div>
        )}

        {phase === 'draw' && (
          <motion.div
            key="draw"
            className={styles.phaseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.phaseTitle}>Draw Your Cards</h2>
            <p className={styles.phaseDescription}>
              The universe will guide you to the right cards
            </p>
            
            <div className={styles.drawPrompt}>
              <span className={styles.cardCount}>{cardCount}</span>
              <span>card{cardCount > 1 ? 's' : ''} will be drawn</span>
            </div>

            <motion.button
              onClick={handleDraw}
              className={`${styles.button} ${styles.primaryButton} ${styles.glowButton}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Draw Cards
            </motion.button>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            className={styles.phaseContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.phaseTitle}>Your Reading</h2>
            
            <div className={styles.cardsGrid}>
              {selectedCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.3 }}
                >
                  <TarotCardDisplay
                    card={card}
                    isFlipped={true}
                    isRevealing={index === selectedCards.length - 1}
                    size="medium"
                    showMeaning={true}
                  />
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={handleRevealComplete}
              className={`${styles.button} ${styles.primaryButton}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: selectedCards.length * 0.3 + 0.5 }}
            >
              View Full Interpretation
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};