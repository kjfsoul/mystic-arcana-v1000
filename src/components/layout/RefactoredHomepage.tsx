"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalaxyBackground } from "../effects/GalaxyBackground/GalaxyBackground";
import { TarotPanel } from "../panels/TarotPanel";
import { UnifiedTarotPanelV2 } from "../tarot/UnifiedTarotPanelV2";
import { AstrologyPanel } from "../panels/AstrologyPanel";
import { CelestialEventsCarousel } from "../astronomical/CelestialEventsCarousel";
import { AccessibilityProvider } from "../accessibility/AccessibilityProvider";
import styles from "./RefactoredHomepage.module.css";
export type ReadingMode = "home" | "tarot-room" | "astrology-room";
interface ReadingRoomProps {
  mode: ReadingMode;
  onBack: () => void;
}
/**
 * Refactored Homepage Component
 *
 * Features the refined UI vision:
 * - Prominent GalaxyBackground as primary visual element
 * - Two-panel layout: Tarot (left) + Astrology (right)
 * - Central CelestialEventsCarousel replacing Virtual Reader
 * - Splash page transitions to immersive reading rooms
 */
export const RefactoredHomepage: React.FC = () => {
  const [readingMode, setReadingMode] = useState<ReadingMode>("home");
  const handleTarotClick = () => {
    setReadingMode("tarot-room");
  };
  const handleAstrologyClick = () => {
    setReadingMode("astrology-room");
  };
  const handleBackToHome = () => {
    setReadingMode("home");
  };
  return (
    <AccessibilityProvider>
      <div className={styles.container}>
        {/* Galaxy Background - Always Present */}
        <GalaxyBackground
          className={styles.galaxyBg}
          intensity={readingMode === "home" ? 0.7 : 1.0}
          showMilkyWay={true}
          animated={true}
        />
        <AnimatePresence mode="wait">
          {readingMode === "home" ? (
            <HomeView
              key="home"
              onTarotClick={handleTarotClick}
              onAstrologyClick={handleAstrologyClick}
            />
          ) : (
            <ReadingRoom
              key={readingMode}
              mode={readingMode}
              onBack={handleBackToHome}
            />
          )}
        </AnimatePresence>
      </div>
    </AccessibilityProvider>
  );
};
const HomeView: React.FC<{
  onTarotClick: () => void;
  onAstrologyClick: () => void;
}> = ({ onTarotClick, onAstrologyClick }) => {
  return (
    <motion.div
      className={styles.homeView}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Left Panel - Tarot */}
      <motion.section
        className={`${styles.panel} ${styles.tarotPanel}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onTarotClick}
        role="button"
        tabIndex={0}
        aria-label="Enter Tarot Reading Room"
        onKeyDown={(e) => e.key === "Enter" && onTarotClick()}
      >
        <div className={styles.panelContent}>
          <TarotPanel />
          <div className={styles.enterPrompt}>
            <span className={styles.enterIcon}>🔮</span>
            <p>Click to enter the Tarot Realm</p>
          </div>
        </div>
      </motion.section>
      {/* Center - Celestial Events Carousel */}
      <motion.section
        className={`${styles.panel} ${styles.centerPanel}`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <CelestialEventsCarousel />
      </motion.section>
      {/* Right Panel - Astrology */}
      <motion.section
        className={`${styles.panel} ${styles.astrologyPanel}`}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onAstrologyClick}
        role="button"
        tabIndex={0}
        aria-label="Enter Astrology Reading Room"
        onKeyDown={(e) => e.key === "Enter" && onAstrologyClick()}
      >
        <div className={styles.panelContent}>
          <AstrologyPanel />
          <div className={styles.enterPrompt}>
            <span className={styles.enterIcon}>✨</span>
            <p>Click to enter the Astrology Realm</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
const ReadingRoom: React.FC<ReadingRoomProps> = ({ mode, onBack }) => {
  return (
    <motion.div
      className={styles.readingRoom}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Back Button */}
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        aria-label="Return to Homepage"
      >
        ← Back to Galaxy View
      </motion.button>
      {/* Reading Room Content */}
      <motion.div
        className={styles.roomContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {mode === "tarot-room" && (
          <div className={styles.tarotRoom}>
            <div className={styles.immersiveContent}>
              <UnifiedTarotPanelV2 />
            </div>
          </div>
        )}
        {mode === "astrology-room" && (
          <div className={styles.astrologyRoom}>
            <h1 className={styles.roomTitle}>✨ Astrology Reading Room</h1>
            <div className={styles.immersiveContent}>
              <AstrologyPanel />
              {/* Additional immersive astrology features would go here */}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
