'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './TarotSpreadLayouts.module.css';
import { SpreadType } from './MobileTarotSpreadSelector';

interface TarotCard {
  id: string;
  name: string;
  imageUrl: string;
  position: string;
  meaning?: string;
}

interface TarotSpreadLayoutsProps {
  spreadType: SpreadType;
  cards: TarotCard[];
  onCardClick?: (card: TarotCard, index: number) => void;
  isRevealing?: boolean;
}

export const TarotSpreadLayouts: React.FC<TarotSpreadLayoutsProps> = ({
  spreadType,
  cards,
  onCardClick,
  isRevealing = false
}) => {
  const getCardPosition = (spreadType: SpreadType, index: number) => {
    const positions = {
      'single': [
        { x: 0, y: 0, rotate: 0, label: 'Your Card' }
      ],
      'three-card': [
        { x: -120, y: 0, rotate: -5, label: 'Past' },
        { x: 0, y: 0, rotate: 0, label: 'Present' },
        { x: 120, y: 0, rotate: 5, label: 'Future' }
      ],
      'celtic-cross': [
        { x: 0, y: 0, rotate: 0, label: 'Present Situation' },
        { x: 0, y: 0, rotate: 90, label: 'Challenge/Cross' },
        { x: 0, y: -150, rotate: 0, label: 'Distant Past' },
        { x: 0, y: 150, rotate: 0, label: 'Recent Past' },
        { x: -150, y: 0, rotate: 0, label: 'Possible Outcome' },
        { x: 150, y: 0, rotate: 0, label: 'Immediate Future' },
        { x: 250, y: 150, rotate: 0, label: 'Your Approach' },
        { x: 250, y: 50, rotate: 0, label: 'External Influences' },
        { x: 250, y: -50, rotate: 0, label: 'Hopes & Fears' },
        { x: 250, y: -150, rotate: 0, label: 'Final Outcome' }
      ]
    };

    return positions[spreadType][index] || { x: 0, y: 0, rotate: 0, label: '' };
  };

  const cardVariants = {
    hidden: { 
      rotateY: 180,
      scale: 0.8,
      opacity: 0
    },
    visible: (custom: number) => ({
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        delay: custom * 0.3,
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      }
    })
  };

  return (
    <div className={styles.spreadContainer}>
      <motion.div 
        className={styles.cardsLayout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {cards.map((card, index) => {
          const position = getCardPosition(spreadType, index);
          
          return (
            <motion.div
              key={card.id}
              className={styles.cardWrapper}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotate}deg)`
              }}
              custom={index}
              initial="hidden"
              animate={isRevealing ? "visible" : "hidden"}
              variants={cardVariants}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => onCardClick?.(card, index)}
            >
              <div className={styles.cardPositionLabel}>
                {position.label}
              </div>
              
              <div className={styles.card}>
                {isRevealing ? (
                  <>
                    <img 
                      src={card.imageUrl} 
                      alt={card.name}
                      className={styles.cardImage}
                    />
                    <div className={styles.cardName}>
                      {card.name}
                    </div>
                  </>
                ) : (
                  <div className={styles.cardBack}>
                    <div className={styles.cardBackPattern} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Mobile-optimized position guide */}
      {spreadType === 'celtic-cross' && (
        <div className={styles.positionGuide}>
          <h4 className={styles.guideTitle}>Position Meanings</h4>
          <div className={styles.guideGrid}>
            {cards.map((card, index) => {
              const position = getCardPosition(spreadType, index);
              return (
                <div key={index} className={styles.guideItem}>
                  <span className={styles.guideNumber}>{index + 1}</span>
                  <span className={styles.guideLabel}>{position.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};