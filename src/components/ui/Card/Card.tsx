import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'cosmic' | 'glass' | 'tarot';
  animate?: boolean;
  role?: string;
  'aria-label'?: string;
}

/**
 * Card Component
 * 
 * Versatile card component with multiple visual variants for different contexts.
 * Supports cosmic-themed styling and accessibility features.
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'default',
  animate = false,
  role,
  'aria-label': ariaLabel,
  ...props 
}) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${animate ? styles.animate : ''} ${className}`}
      onClick={onClick}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </div>
  );
};