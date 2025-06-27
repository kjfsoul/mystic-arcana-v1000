'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TarotCard } from '@/types/tarot';
import styles from './TarotCardDisplay.module.css';

interface TarotCardDisplayProps {
  card: TarotCard;
  isFlipped?: boolean;
  isRevealing?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showMeaning?: boolean;
}

export const TarotCardDisplay: React.FC<TarotCardDisplayProps> = ({
  card,
  isFlipped = false,
  isRevealing = false,
  onClick,
  size = 'medium',
  showMeaning = false
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  };

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image for card: ${card.name}`);
  };

  return (
    <motion.div
      className={`${styles.cardContainer} ${sizeClasses[size]}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <motion.div
        className={styles.cardInner}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div className={styles.cardFace}>
          <div className={styles.cardBack}>
            <div className={styles.backPattern}>
              <span className={styles.backSymbol}>✨</span>
              <span className={styles.backText}>Mystic Arcana</span>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          {isRevealing && (
            <motion.div
              className={styles.revealGlow}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5 }}
            />
          )}
          
          <div className={`${styles.cardContent} ${card.isReversed ? styles.reversed : ''}`}>
            {imageError ? (
              <div className={styles.fallbackCard}>
                <h3>{card.name}</h3>
                <p className={styles.arcana}>{card.arcana === 'major' ? 'Major Arcana' : card.suit}</p>
                {card.isReversed && <span className={styles.reversedIndicator}>Reversed</span>}
              </div>
            ) : (
              <div className={styles.imageWrapper}>
                <Image
                  src={card.frontImage}
                  alt={card.name}
                  fill
                  sizes={size === 'small' ? '150px' : size === 'medium' ? '200px' : '300px'}
                  className={styles.cardImage}
                  onError={handleImageError}
                  priority={isFlipped}
                />
                {card.isReversed && (
                  <div className={styles.reversedOverlay}>
                    <span>Reversed</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {showMeaning && isFlipped && (
            <motion.div
              className={styles.meaningPanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4>{card.name}</h4>
              <p className={styles.meaning}>
                {card.isReversed ? card.meaning.reversed : card.meaning.upright}
              </p>
              <div className={styles.keywords}>
                {card.meaning.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};