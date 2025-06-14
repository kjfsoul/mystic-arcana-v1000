'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalaxyBackground } from '../components/effects/GalaxyBackground/GalaxyBackground';
import { TarotZonePreview } from '../components/panels/TarotZonePreview';
import { AstrologyZonePreview } from '../components/panels/AstrologyZonePreview';
import { CosmicWeather } from '../components/cosmic/CosmicWeather';
import { EnhancedTarotPanel } from '../components/tarot/EnhancedTarotPanel';
import { AstrologyReadingRoom } from '../components/astrology/AstrologyReadingRoom';
import { Header } from '../components/layout/Header';
import { AuthDebug } from '../components/debug/AuthDebug';
import styles from './page.module.css';

export type ViewMode = 'lobby' | 'tarot-room' | 'astrology-room' | 'awe-view';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('lobby');
  const [galaxyIntensity, setGalaxyIntensity] = useState(0.7);

  useEffect(() => {
    // Adjust galaxy intensity based on view mode
    switch (viewMode) {
      case 'lobby':
        setGalaxyIntensity(0.7);
        break;
      case 'awe-view':
        setGalaxyIntensity(1.0);
        break;
      case 'tarot-room':
        setGalaxyIntensity(1.2); // More dramatic for tarot immersion
        break;
      case 'astrology-room':
        setGalaxyIntensity(0.9);
        break;
    }
  }, [viewMode]);

  const handleEnterTarotRoom = () => {
    setViewMode('tarot-room');
  };

  const handleEnterAstrologyRoom = () => {
    setViewMode('astrology-room');
  };

  const handleEnterAweView = () => {
    setViewMode('awe-view');
  };

  const handleBackToLobby = () => {
    setViewMode('lobby');
  };

  return (
    <main className={styles.main}>
      {/* Header with Authentication */}
      <Header />
      
      {/* Debug Component - Remove in production */}
      <AuthDebug />
      
      {/* Galaxy Background - Always Present */}
      <div className={styles.galaxyLayer}>
        <GalaxyBackground
          intensity={galaxyIntensity}
          showMilkyWay={true}
          animated={true}
        />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'lobby' && (
          <CosmicLobby
            key="lobby"
            onEnterTarot={handleEnterTarotRoom}
            onEnterAstrology={handleEnterAstrologyRoom}
            onEnterAweView={handleEnterAweView}
          />
        )}

        {viewMode === 'tarot-room' && (
          <TarotReadingRoom
            key="tarot-room"
            onBack={handleBackToLobby}
          />
        )}

        {viewMode === 'astrology-room' && (
          <AstrologyRoom
            key="astrology-room"
            onBack={handleBackToLobby}
          />
        )}

        {viewMode === 'awe-view' && (
          <AweView
            key="awe-view"
            onBack={handleBackToLobby}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// Cosmic Lobby Component
const CosmicLobby: React.FC<{
  onEnterTarot: () => void;
  onEnterAstrology: () => void;
  onEnterAweView: () => void;
}> = ({ onEnterTarot, onEnterAstrology, onEnterAweView }) => {
  return (
    <motion.div
      className={styles.lobby}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Left Panel - Tarot Zone Preview */}
      <motion.section
        className={`${styles.sidePanel} ${styles.leftPanel}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterTarot}
        role="button"
        tabIndex={0}
        aria-label="Enter Tarot Reading Room"
        onKeyDown={(e) => e.key === 'Enter' && onEnterTarot()}
      >
        <div className={styles.panelGlass}>
          <TarotZonePreview />
        </div>
      </motion.section>

      {/* Center - Cosmic Weather */}
      <motion.section
        className={styles.centerSection}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <CosmicWeather onClick={onEnterAweView} />
      </motion.section>

      {/* Right Panel - Astrology Zone Preview */}
      <motion.section
        className={`${styles.sidePanel} ${styles.rightPanel}`}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterAstrology}
        role="button"
        tabIndex={0}
        aria-label="Enter Astrology Reading Room"
        onKeyDown={(e) => e.key === 'Enter' && onEnterAstrology()}
      >
        <div className={styles.panelGlass}>
          <AstrologyZonePreview />
        </div>
      </motion.section>
    </motion.div>
  );
};

// Tarot Reading Room
const TarotReadingRoom: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div
      className={styles.readingRoom}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ← Back to Cosmic Lobby
      </motion.button>

      <motion.div
        className={styles.roomContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={styles.immersivePanel}>
          <EnhancedTarotPanel />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Astrology Reading Room
const AstrologyRoom: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div
      className={styles.readingRoom}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AstrologyReadingRoom onBack={onBack} />
    </motion.div>
  );
};

// Awe View Component
const AweView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'earth' | 'moon' | 'mars' | 'deep-space'>('earth');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = async (newView: 'earth' | 'moon' | 'mars' | 'deep-space') => {
    if (isTransitioning || newView === currentView) return;
    
    setIsTransitioning(true);
    
    // Simulate camera transition delay
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 1000);
  };

  const viewConfig = {
    earth: {
      title: 'Earth View',
      description: 'Your home perspective in the cosmic dance',
      emoji: '🌍'
    },
    moon: {
      title: 'Lunar Perspective',
      description: 'See Earth from our celestial companion',
      emoji: '🌙'
    },
    mars: {
      title: 'Martian Vista',
      description: 'The red planet\'s unique cosmic viewpoint',
      emoji: '♂️'
    },
    'deep-space': {
      title: 'Deep Space Explorer',
      description: 'Journey beyond our solar system',
      emoji: '🌌'
    }
  };

  return (
    <motion.div
      className={styles.aweView}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Navigation Radar */}
      <motion.div
        className={styles.cosmicRadar}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.radarCircle}>
          <motion.div
            className={styles.radarSweep}
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <div className={styles.radarCenter}>
            <span className={styles.currentViewEmoji}>
              {viewConfig[currentView].emoji}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.button
        className={styles.backButtonMinimal}
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Lobby
      </motion.button>

      {/* Main Content */}
      <motion.div
        className={styles.aweContent}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            className={styles.viewHeader}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={styles.aweTitle}>
              {viewConfig[currentView].emoji} {viewConfig[currentView].title}
            </h1>
            <p className={styles.aweDescription}>
              {viewConfig[currentView].description}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Interactive Controls */}
        <motion.div 
          className={styles.cosmicControls}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {Object.entries(viewConfig).map(([viewKey, config]) => (
            <motion.button
              key={viewKey}
              className={`${styles.cosmicButton} ${
                currentView === viewKey ? styles.active : ''
              } ${isTransitioning ? styles.disabled : ''}`}
              onClick={() => handleViewChange(viewKey as 'earth' | 'moon' | 'mars' | 'deep-space')}
              whileHover={!isTransitioning ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isTransitioning ? { scale: 0.95 } : {}}
              disabled={isTransitioning}
            >
              <span className={styles.buttonEmoji}>{config.emoji}</span>
              <span className={styles.buttonText}>
                {config.title}
              </span>
              {currentView === viewKey && (
                <motion.div
                  className={styles.activeIndicator}
                  layoutId="activeView"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Transition Overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className={styles.transitionOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.transitionContent}>
                <motion.div
                  className={styles.transitionSpinner}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🌌
                </motion.div>
                <p>Transitioning to cosmic perspective...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Impulse Elements */}
      <motion.div
        className={styles.cosmicInsights}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
      >
        <div className={styles.insightCard}>
          <h3>✨ Cosmic Reading Bundle</h3>
          <p>Unlock personalized insights from every perspective</p>
          <button className={styles.insightButton}>
            Explore Premium
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};