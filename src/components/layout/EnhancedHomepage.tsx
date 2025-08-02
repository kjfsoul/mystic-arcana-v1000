'use client';
 
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AccessibilityProvider } from "../accessibility/AccessibilityProvider";
import { CelestialEventsCarousel } from "../astronomical/CelestialEventsCarousel";
import { GalaxyBackground } from '../effects/GalaxyBackground/GalaxyBackground';
import { AstrologyPanel } from "../panels/AstrologyPanel";
import { ApiDrivenTarotPanel } from "../tarot/ApiDrivenTarotPanel";
import styles from './EnhancedHomepage.module.css';
export type ReadingMode = 'home' | 'tarot-room' | 'astrology-room';
interface EnhancedHomepageProps {
  className?: string;
}
/**
 * Enhanced Homepage with improved galaxy background visibility and API-driven tarot system
 * 
 * Features:
 * - Fixed galaxy background visibility issues
 * - API-driven tarot data (replaces hardcoded arrays)
 * - Improved loading states and error handling
 * - Better responsive design
 * - Enhanced accessibility
 */
export const EnhancedHomepage: React.FC<EnhancedHomepageProps> = ({
  className = ''
}) => {
  const [readingMode, setReadingMode] = useState<ReadingMode>('home');
  const [galaxyIntensity, setGalaxyIntensity] = useState(0.8);
  // Adjust galaxy intensity based on reading mode
 
  useEffect(() => {
    switch (readingMode) {
      case 'home':
        setGalaxyIntensity(0.8);
        break;
      case 'tarot-room':
        setGalaxyIntensity(0.6); // Dimmer for better card visibility
        break;
      case 'astrology-room':
        setGalaxyIntensity(1.0); // Full intensity for cosmic feel
        break;
    }
  }, [readingMode]);
  const handleTarotClick = () => setReadingMode('tarot-room');
  const handleAstrologyClick = () => setReadingMode('astrology-room');
  const handleBackToHome = () => setReadingMode('home');
  return (
    <AccessibilityProvider>
      <div className={`${styles.container} ${className}`}>
        {/* Enhanced Galaxy Background - Always Visible */}
        <GalaxyBackground 
          className={styles.galaxyBackground}
          intensity={galaxyIntensity}
          showMilkyWay={true}
          animated={true}
        />
        {/* Main Content */}
        <div className={styles.mainContent}>
          <AnimatePresence mode="wait">
            {readingMode === 'home' ? (
              <HomeView 
                key="home"
                onTarotClick={handleTarotClick}
                onAstrologyClick={handleAstrologyClick}
              />
            ) : readingMode === 'tarot-room' ? (
              <TarotRoom 
                key="tarot"
                onBack={handleBackToHome}
              />
            ) : (
              <AstrologyRoom 
                key="astrology"
                onBack={handleBackToHome}
              />
            )}
          </AnimatePresence>
        </div>
        {/* Floating Navigation */}
        {readingMode !== 'home' && (
          <motion.button
            className={styles.backButton}
            onClick={handleBackToHome}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Cosmic Lobby
          </motion.button>
        )}
      </div>
    </AccessibilityProvider>
  );
};
// Home View Component
interface HomeViewProps {
  onTarotClick: () => void;
  onAstrologyClick: () => void;
}
const HomeView: React.FC<HomeViewProps> = ({ onTarotClick, onAstrologyClick }) => {
  const { user, isGuest } = useAuth();
  return (
    <motion.div
      className={styles.homeView}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <motion.h1
          className={styles.title}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Welcome to Mystic Arcana
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {isGuest 
            ? "Discover your cosmic destiny through AI-powered readings"
            : `Welcome back, ${user?.email}. The stars await your return.`
          }
        </motion.p>
      </div>
      {/* Main Panels */}
      <div className={styles.panelsContainer}>
        {/* Tarot Panel */}
        <motion.div
          className={styles.panel}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={onTarotClick}
        >
          <div className={styles.panelContent}>
            <div className={styles.panelIcon}>🃏</div>
            <h2>Tarot Readings</h2>
            <p>Unlock the mysteries of your path with AI-guided tarot interpretations</p>
            <div className={styles.panelFeatures}>
              <span>✨ Daily Card</span>
              <span>🔮 Past, Present, Future</span>
              <span>🌟 Celtic Cross</span>
            </div>
          </div>
          <div className={styles.panelGlow} />
        </motion.div>
        {/* Astrology Panel */}
        <motion.div
          className={styles.panel}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          whileHover={{ scale: 1.02, y: -5 }}
          onClick={onAstrologyClick}
        >
          <div className={styles.panelContent}>
            <div className={styles.panelIcon}>⭐</div>
            <h2>Astrology</h2>
            <p>Explore your cosmic blueprint through personalized astrological insights</p>
            <div className={styles.panelFeatures}>
              <span>🌙 Birth Chart</span>
              <span>🪐 Planetary Transits</span>
              <span>🌟 Daily Horoscope</span>
            </div>
          </div>
          <div className={styles.panelGlow} />
        </motion.div>
      </div>
      {/* Celestial Events */}
      <motion.div
        className={styles.celestialEvents}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.8 }}
      >
        <CelestialEventsCarousel />
      </motion.div>
    </motion.div>
  );
};
// Tarot Room Component
interface TarotRoomProps {
  onBack: () => void;
}
const TarotRoom: React.FC<TarotRoomProps> = () => {
  return (
    <motion.div
      className={styles.readingRoom}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.roomHeader}>
        <h1>🃏 Tarot Reading Room</h1>
        <p>Connect with the ancient wisdom of the cards</p>
      </div>
      
      <ApiDrivenTarotPanel 
        className={styles.tarotPanel}
        onReadingComplete={(reading) => {
          console.log('Reading completed:', reading);
        }}
      />
    </motion.div>
  );
};
// Astrology Room Component
interface AstrologyRoomProps {
  onBack: () => void;
}
const AstrologyRoom: React.FC<AstrologyRoomProps> = () => {
  return (
    <motion.div
      className={styles.readingRoom}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.roomHeader}>
        <h1>⭐ Astrology Chamber</h1>
        <p>Discover your cosmic blueprint and celestial influences</p>
      </div>
      
      <AstrologyPanel className={styles.astrologyPanel} />
    </motion.div>
  );
};
