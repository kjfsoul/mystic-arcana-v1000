'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './TarotCard.module.css';

interface TarotCardProps {
  frontImage: string;
  backImage: string;
  cardName: string;
  cardMeaning?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TarotCard: React.FC<TarotCardProps> = ({
  frontImage,
  backImage,
  cardName,
  cardMeaning,
  isFlipped = false,
  onFlip,
  disabled = false,
  className = '',
  style
}) => {
  const [isFlippedState, setIsFlippedState] = useState(isFlipped);

  const handleCardClick = () => {
    if (disabled) {
      return;
    }
    
    const newFlippedState = !isFlippedState;
    setIsFlippedState(newFlippedState);
    
    if (onFlip && newFlippedState) {
      onFlip();
    }
  };

  return (
    <div 
      className={`${styles.cardContainer} ${className}`} 
      style={{
        ...style,
        minHeight: '320px', // Ensure minimum height to prevent cutoff
        height: '320px', // Fixed height instead of auto
        display: 'block', // Ensure visibility
        visibility: 'visible', // Force visibility
        overflow: 'visible' // Prevent clipping
      }}
    >
      <motion.div
        className={styles.card}
        onClick={handleCardClick}
        whileHover={disabled ? {} : { scale: 1.05, y: -10 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        style={{
          cursor: disabled ? 'default' : 'pointer',
          zIndex: 10 // Ensure card is clickable
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`${cardName} tarot card${isFlippedState ? ` - revealed, meaning: ${cardMeaning}` : ' - press Enter or Space to reveal'}`}
        aria-pressed={isFlippedState}
        aria-describedby={`card-${cardName.replace(/\s+/g, '-').toLowerCase()}-description`}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <motion.div
          className={styles.cardInner}
          initial={false}
          animate={{ rotateY: isFlippedState ? 180 : 0 }}
          transition={{
            duration: 0.8,
            type: 'spring',
            stiffness: 100,
            damping: 15
          }}
        >
          {/* Card Back */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <Image
              src={backImage}
              alt="Tarot card back"
              fill
              sizes="(max-width: 768px) 200px, 250px"
              className={styles.cardImage}
              priority
            />
            <div className={styles.mysticalGlow} />
          </div>

          {/* Card Front */}
          <div className={`${styles.cardFace} ${styles.cardFront}`}>
            <Image
              src={frontImage}
              alt={cardName}
              fill
              sizes="(max-width: 768px) 200px, 250px"
              className={styles.cardImage}
            />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardName}>{cardName}</h3>
            </div>
            <div className={styles.revealGlow} />
          </div>
        </motion.div>
      </motion.div>

      {/* Floating particles effect when flipped */}
      {isFlippedState && (
        <div className={styles.particleContainer} aria-hidden="true">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1.2, 0.8, 0],
                y: [-20, -100],
                x: [0, (Math.random() - 0.5) * 80]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.08,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Hidden description for screen readers */}
      <div 
        id={`card-${cardName.replace(/\s+/g, '-').toLowerCase()}-description`}
        className="sr-only"
      >
        {isFlippedState && cardMeaning ? `Card meaning: ${cardMeaning}` : 'Click to reveal card meaning'}
      </div>
    </div>
  );
};