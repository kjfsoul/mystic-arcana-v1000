'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { TarotReadingEngine, TarotReading, TarotCard, SpreadPosition } from '@/services/tarot/TarotReadingEngine';
import { MobileTarotSpreadSelector, SpreadType } from './MobileTarotSpreadSelector';
import { TarotSpreadLayouts } from './TarotSpreadLayouts';
import styles from './MobileTarotReading.module.css';

type ReadingPhase = 'select-spread' | 'ask-question' | 'shuffling' | 'revealing' | 'interpretation';

export const MobileTarotReading: React.FC = () => {
  const { user } = useAuth();
  const [readingEngine] = useState(() => new TarotReadingEngine());
  
  const [phase, setPhase] = useState<ReadingPhase>('select-spread');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [question, setQuestion] = useState('');
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleSelectSpread = (spread: SpreadType) => {
    setSelectedSpread(spread);
    setPhase('ask-question');
  };

  const handleSubmitQuestion = async () => {
    if (!selectedSpread) return;
    
    setPhase('shuffling');
    
    // Simulate shuffling animation time
    setTimeout(async () => {
      const newReading = await readingEngine.drawCards(selectedSpread, question);
      setReading(newReading);
      setPhase('revealing');
      
      // Start revealing cards
      setTimeout(() => {
        setIsRevealing(true);
      }, 500);
    }, 3000);
  };

  const handleCardClick = (card: TarotCard, index: number) => {
    console.log('Card clicked:', card, index);
  };

  const handleGetInterpretation = async () => {
    if (!reading) return;
    
    setPhase('interpretation');
    
    const interpretedReading = await readingEngine.generateInterpretation(reading);
    
    setReading(interpretedReading);
    
    // Save to database if user is logged in
    if (user) {
      await readingEngine.saveReading(interpretedReading, user.id);
    }
  };

  const handleNewReading = () => {
    setPhase('select-spread');
    setSelectedSpread(null);
    setQuestion('');
    setReading(null);
    setIsRevealing(false);
    // setSelectedCardIndex(null);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {/* Phase 1: Select Spread */}
        {phase === 'select-spread' && (
          <motion.div
            key="select-spread"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MobileTarotSpreadSelector onSelectSpread={handleSelectSpread} />
          </motion.div>
        )}

        {/* Phase 2: Ask Question */}
        {phase === 'ask-question' && (
          <motion.div
            key="ask-question"
            className={styles.questionPhase}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <h2 className={styles.phaseTitle}>Focus Your Intention</h2>
            <p className={styles.phaseSubtitle}>
              What guidance are you seeking? (Optional)
            </p>
            
            <textarea
              className={styles.questionInput}
              placeholder="Enter your question or leave blank for general guidance..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
            />
            
            <div className={styles.buttonGroup}>
              <button
                className={styles.secondaryButton}
                onClick={() => setPhase('select-spread')}
              >
                Back
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleSubmitQuestion}
              >
                Shuffle & Draw
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Shuffling */}
        {phase === 'shuffling' && (
          <motion.div
            key="shuffling"
            className={styles.shufflingPhase}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
          >
            <motion.div
              className={styles.shufflingCards}
              animate={{
                rotateY: [0, 180, 360],
                x: [-50, 50, -50]
              }}
              transition={{
                duration: 1,
                repeat: 3,
                ease: "easeInOut"
              }}
            >
              <div className={styles.shuffleCard} />
              <div className={styles.shuffleCard} />
              <div className={styles.shuffleCard} />
            </motion.div>
            
            <h3 className={styles.shufflingText}>
              Shuffling the cosmic deck...
            </h3>
          </motion.div>
        )}

        {/* Phase 4: Revealing */}
        {phase === 'revealing' && reading && (
          <motion.div
            key="revealing"
            className={styles.revealingPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.phaseTitle}>Your {selectedSpread} Reading</h2>
            
            <TarotSpreadLayouts
              spreadType={selectedSpread!}
              cards={reading.positions.map((p) => p.card)}
              onCardClick={handleCardClick}
              isRevealing={isRevealing}
            />
            
            {isRevealing && (
              <motion.button
                className={styles.primaryButton}
                onClick={handleGetInterpretation}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                Get Your Interpretation
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Phase 5: Interpretation */}
        {phase === 'interpretation' && reading && (
          <motion.div
            key="interpretation"
            className={styles.interpretationPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className={styles.phaseTitle}>Your Reading</h2>
            
            {reading.question && (
              <div className={styles.questionDisplay}>
                <h3>Your Question:</h3>
                <p>{reading.question}</p>
              </div>
            )}
            
            <div className={styles.interpretationContent}>
              {reading.positions.map((position: SpreadPosition, index: number) => (
                <motion.div
                  key={index}
                  className={styles.cardInterpretation}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={styles.cardHeader}>
                    <h4>{position.label}</h4>
                    <span className={styles.cardName}>
                      {position.card.name} {position.card.isReversed && '(Reversed)'}
                    </span>
                  </div>
                  <p className={styles.cardMeaning}>
                    {position.interpretation}
                  </p>
                </motion.div>
              ))}
              
              {reading.overallInterpretation && (
                <motion.div
                  className={styles.overallInterpretation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3>Overall Message</h3>
                  <p>{reading.overallInterpretation}</p>
                </motion.div>
              )}
              
              {reading.cosmicInfluences && (
                <motion.div
                  className={styles.cosmicInfluences}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h4>Cosmic Influences</h4>
                  <p>🌙 {reading.cosmicInfluences.moonPhase}</p>
                  <p>✨ {reading.cosmicInfluences.astrologyNotes}</p>
                </motion.div>
              )}
            </div>
            
            <div className={styles.actionButtons}>
              <button
                className={styles.secondaryButton}
                onClick={() => {/* Share functionality */}}
              >
                Share Reading
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleNewReading}
              >
                New Reading
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};