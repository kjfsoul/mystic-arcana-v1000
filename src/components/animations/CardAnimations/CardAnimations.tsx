'use client';

import React from 'react';
import styles from './CardAnimations.module.css';

interface CardAnimationsProps {
  children: React.ReactNode;
  isShuffling?: boolean;
  isRevealing?: boolean;
  className?: string;
}

/**
 * CardAnimations Component
 * 
 * Wrapper component that provides smooth animations for tarot cards
 * including shuffle, flip, reveal, and floating effects.
 */
export const CardAnimations: React.FC<CardAnimationsProps> = ({ 
  children, 
  isShuffling = false,
  isRevealing = false,
  className = ''
}) => {
  return (
    <div 
      className={`
        ${styles.cardAnimations} 
        ${isShuffling ? styles.shuffling : ''} 
        ${isRevealing ? styles.revealing : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};