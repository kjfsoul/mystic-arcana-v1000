'use client';

import React from 'react';
import { BirthData } from '@/lib/astrology/AstronomicalCalculator';
import styles from './CareerInsights.module.css';

interface CareerInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}

export const CareerInsights: React.FC<CareerInsightsProps> = ({ 
  onBack 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>💼 Career Insights</h2>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
      </div>
      
      <div className={styles.comingSoonContent}>
        <div className={styles.comingSoonIcon}>🚧</div>
        <h3>Feature Under Development</h3>
        <p>
          Career insights require accurate astrological house systems, professional 
          midheaven calculations, and comprehensive planetary analysis. This feature 
          is currently being developed with proper ephemeris data.
        </p>
        <p>
          <strong>Coming Soon:</strong> Real vocational astrology analysis including 
          midheaven signs, 10th house placements, and Saturn career lessons based 
          on accurate birth chart calculations.
        </p>
        <div className={styles.integrityNote}>
          <p>
            <em>
              Professional astrological guidance deserves authentic calculations 
              rather than generic career advice. This feature will launch when 
              it can provide genuine vocational insights.
            </em>
          </p>
        </div>
      </div>
    </div>
  );
};