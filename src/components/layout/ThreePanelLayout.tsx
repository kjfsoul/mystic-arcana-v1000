'use client';

import React, { useState, useEffect } from 'react';
import { TarotPanel } from '../panels/TarotPanel';
import { ReaderPanel } from '../panels/ReaderPanel';
import { AstrologyPanel } from '../panels/AstrologyPanel';
import { CosmicBackground } from '../effects/CosmicBackground';
import { AccessibilityProvider } from '../accessibility/AccessibilityProvider';
import { AuthButton } from '../auth/AuthButton';
import styles from './ThreePanelLayout.module.css';

export type ActivePanel = 'tarot' | 'reader' | 'astrology';

export interface ThreePanelLayoutProps {
  initialPanel?: ActivePanel;
  className?: string;
}

/**
 * Main layout component implementing the signature 3-panel Mystic Arcana interface
 * 
 * Features:
 * - Responsive design: 3 panels on desktop, single panel with navigation on mobile
 * - Cosmic animated background with real-time astrological weather
 * - Accessibility-first design with WCAG 2.2+ compliance
 * - Smooth panel transitions with cosmic-themed animations
 * - Keyboard navigation and focus management
 */
export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  initialPanel = 'reader',
  className = ''
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(initialPanel);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading state management
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1':
            setActivePanel('tarot');
            break;
          case '2':
            setActivePanel('reader');
            break;
          case '3':
            setActivePanel('astrology');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const panelConfig = {
    tarot: {
      title: 'Tarot Zone',
      icon: '🔮',
      description: 'Interactive tarot readings and card interpretations'
    },
    reader: {
      title: 'Virtual Reader',
      icon: '🌟',
      description: 'Your personal AI spiritual guide'
    },
    astrology: {
      title: 'Astrology Zone', 
      icon: '✨',
      description: 'Birth charts, horoscopes, and cosmic insights'
    }
  };

  const handlePanelSwitch = (panel: ActivePanel) => {
    setActivePanel(panel);
    // Announce panel change for screen readers
    const announcement = `Switched to ${panelConfig[panel].title}`;
    const ariaLive = document.getElementById('aria-live-region');
    if (ariaLive) {
      ariaLive.textContent = announcement;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <CosmicBackground />
        <div className={styles.loadingSpinner}>
          <div className={styles.cosmicLoader}>
            <div className={styles.starBurst}></div>
            <p className={styles.loadingText}>Aligning the stars...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <div className={`${styles.container} ${className}`}>
        {/* Cosmic Background Layer */}
        <CosmicBackground />
        
        {/* Screen Reader Announcements */}
        <div
          id="aria-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Skip Navigation */}
        <nav className={styles.skipNav}>
          <a href="#main-content" className={styles.skipLink}>
            Skip to main content
          </a>
          <a href="#panel-navigation" className={styles.skipLink}>
            Skip to panel navigation
          </a>
        </nav>

        {/* Mobile Panel Navigation */}
        {isMobile && (
          <nav 
            id="panel-navigation"
            className={styles.mobileNav}
            role="tablist"
            aria-label="Panel Navigation"
          >
            {(Object.keys(panelConfig) as ActivePanel[]).map((panel) => (
              <button
                key={panel}
                role="tab"
                aria-selected={activePanel === panel}
                aria-controls={`${panel}-panel`}
                aria-label={`Switch to ${panelConfig[panel].title}`}
                className={`${styles.navButton} ${
                  activePanel === panel ? styles.active : ''
                }`}
                onClick={() => handlePanelSwitch(panel)}
              >
                <span className={styles.navIcon}>
                  {panelConfig[panel].icon}
                </span>
                <span className={styles.navLabel}>
                  {panelConfig[panel].title}
                </span>
              </button>
            ))}
          </nav>
        )}

        {/* Main Content Area */}
        <main 
          id="main-content"
          className={`${styles.mainContent} ${isMobile ? styles.mobile : styles.desktop}`}
        >
          {/* Desktop: All 3 panels visible */}
          {!isMobile ? (
            <div className={styles.desktopLayout}>
              <section 
                className={`${styles.panel} ${styles.tarotPanel}`}
                aria-label="Tarot Reading Interface"
              >
                <TarotPanel />
              </section>
              
              <section 
                className={`${styles.panel} ${styles.readerPanel}`}
                aria-label="Virtual Reader Interface"
              >
                <ReaderPanel />
              </section>
              
              <section 
                className={`${styles.panel} ${styles.astrologyPanel}`}
                aria-label="Astrology Interface"
              >
                <AstrologyPanel />
              </section>
            </div>
          ) : (
            /* Mobile: Single active panel */
            <div className={styles.mobileLayout}>
              <section
                id={`${activePanel}-panel`}
                className={`${styles.panel} ${styles.activePanel}`}
                role="tabpanel"
                aria-labelledby={`${activePanel}-nav`}
                aria-label={panelConfig[activePanel].description}
              >
                {activePanel === 'tarot' && <TarotPanel />}
                {activePanel === 'reader' && <ReaderPanel />}
                {activePanel === 'astrology' && <AstrologyPanel />}
              </section>
            </div>
          )}
        </main>

        {/* Authentication Button */}
        <div className={styles.authContainer}>
          <AuthButton />
        </div>

        {/* Quick Actions Floating Menu */}
        <div className={styles.quickActions}>
          <button
            className={styles.quickButton}
            aria-label="Quick Draw - Get an instant tarot card"
            title="Quick Draw (Ctrl+Q)"
          >
            🎴
          </button>
          <button
            className={styles.quickButton}
            aria-label="Toggle Night Mode"
            title="Night Mode (Ctrl+N)"
          >
            🌙
          </button>
          <button
            className={styles.quickButton}
            aria-label="Open Settings"
            title="Settings (Ctrl+,)"
          >
            ⚙️
          </button>
        </div>

        {/* Cosmic Weather Indicator */}
        <div className={styles.cosmicWeather}>
          <div className={styles.weatherIndicator}>
            <span className={styles.moonPhase}>🌙</span>
            <span className={styles.weatherText}>New Moon Energy</span>
          </div>
        </div>
      </div>
    </AccessibilityProvider>
  );
};