'use client';

import React, { useState } from 'react';
import { TarotPanel } from '../../panels/TarotPanel/TarotPanel';
import { ReaderPanel } from '../../panels/ReaderPanel/ReaderPanel';
import { AstrologyPanel } from '../../panels/AstrologyPanel/AstrologyPanel';
import { CosmicBackground } from '../../animations/CosmicBackground/CosmicBackground';
import { useAccessibility } from '../../../utils/accessibility/useAccessibility';
import styles from './ThreePanelLayout.module.css';

interface ThreePanelLayoutProps {
  className?: string;
}

/**
 * ThreePanelLayout Component
 * 
 * Main layout component that manages the three-panel interface for Mystic Arcana.
 * Handles responsive behavior, panel visibility, and accessibility features.
 * 
 * Layout structure:
 * - Left: Tarot Panel (card readings, spreads, interpretations)
 * - Center: Reader Panel (virtual reader avatar, chat interface)
 * - Right: Astrology Panel (charts, cosmic weather, planetary positions)
 */
export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({ className = '' }) => {
  const [activePanel, setActivePanel] = useState<'tarot' | 'reader' | 'astrology'>('reader');
  const { announceToScreenReader } = useAccessibility();

  const handlePanelChange = (panel: 'tarot' | 'reader' | 'astrology') => {
    setActivePanel(panel);
    announceToScreenReader(`Switched to ${panel} panel`);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Cosmic background with animated stars and galaxy effects */}
      <CosmicBackground />

      <div className={styles.panelContainer}>
        {/* Tarot Panel - Left Side */}
        <div
          className={`${styles.panel} ${styles.tarotPanel} ${activePanel === 'tarot' ? styles.active : ''}`}
          role="region"
          aria-label="Tarot Reading Panel"
        >
          <TarotPanel
            isActive={activePanel === 'tarot'}
            onActivate={() => handlePanelChange('tarot')}
          />
        </div>

        {/* Reader Panel - Center */}
        <div
          className={`${styles.panel} ${styles.readerPanel} ${activePanel === 'reader' ? styles.active : ''}`}
          role="region"
          aria-label="Virtual Reader Panel"
        >
          <ReaderPanel
            isActive={activePanel === 'reader'}
            onActivate={() => handlePanelChange('reader')}
          />
        </div>

        {/* Astrology Panel - Right Side */}
        <div
          className={`${styles.panel} ${styles.astrologyPanel} ${activePanel === 'astrology' ? styles.active : ''}`}
          role="region"
          aria-label="Astrology Chart Panel"
        >
          <AstrologyPanel
            isActive={activePanel === 'astrology'}
            onActivate={() => handlePanelChange('astrology')}
          />
        </div>
      </div>

      {/* Mobile navigation for smaller screens */}
      <nav className={styles.mobileNav} role="navigation" aria-label="Panel navigation">
        <button
          onClick={() => handlePanelChange('tarot')}
          className={activePanel === 'tarot' ? styles.active : ''}
          aria-pressed={activePanel === 'tarot'}
        >
          Tarot
        </button>
        <button
          onClick={() => handlePanelChange('reader')}
          className={activePanel === 'reader' ? styles.active : ''}
          aria-pressed={activePanel === 'reader'}
        >
          Reader
        </button>
        <button
          onClick={() => handlePanelChange('astrology')}
          className={activePanel === 'astrology' ? styles.active : ''}
          aria-pressed={activePanel === 'astrology'}
        >
          Astrology
        </button>
      </nav>
    </div>
  );
};