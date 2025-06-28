'use client';

import React from "react";
import { BirthData } from "@/lib/astrology/AstronomicalCalculator";
import styles from "./CompatibilityInsights.module.css";

interface CompatibilityInsightsProps {
  userBirthData: BirthData;
  onBack: () => void;
}

export const CompatibilityInsights: React.FC<CompatibilityInsightsProps> = ({
  onBack,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>💫 Compatibility Insights</h2>
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
      </div>
      
      <div className={styles.comingSoonContent}>
        <div className={styles.comingSoonIcon}>🚧</div>
        <h3>Feature Under Development</h3>
        <p>
          Compatibility insights require accurate astronomical calculations and comprehensive 
          astrological analysis. This feature is currently being developed with proper 
          ephemeris data and will be available in a future update.
        </p>
        <p>
          <strong>Coming Soon:</strong> Real synastry analysis, aspect calculations, and 
          personalized compatibility reports based on actual planetary positions.
        </p>
        <div className={styles.integrityNote}>
          <p>
            <em>
              We believe in providing authentic astrological insights rather than 
              placeholder content. This feature will launch when it can deliver 
              real value based on accurate astronomical data.
            </em>
          </p>
        </div>
      </div>
    </div>
  );
};