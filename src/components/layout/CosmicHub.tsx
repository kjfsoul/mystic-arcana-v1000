'use client';

import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Lazy load the heavy GalaxyBackground component to prevent blocking main page load
const GalaxyBackground = lazy(() => import('../effects/GalaxyBackground/GalaxyBackground').then(m => ({ default: m.GalaxyBackground })));
import { AstrologyReadingRoom } from '../astrology/AstrologyReadingRoom';
import { UnifiedTarotPanelV2 } from '../tarot/UnifiedTarotPanelV2';
import { MercuryRetrogradeBanner } from '../astrology/MercuryRetrogradeBanner';
import { Header } from './Header';
import { useRouter } from 'next/navigation';
import styles from './CosmicHub.module.css';

// Lazy load the horoscope widget to prevent blocking main page load
const DailyHoroscopeWidget = lazy(() => import('../horoscope/DailyHoroscopeWidget').then(m => ({ default: m.DailyHoroscopeWidget })));

// Lazy load the Daily Oracle Display component
const DailyOracleDisplay = lazy(() => import('../oracle/DailyOracleDisplay').then(m => ({ default: m.DailyOracleDisplay })));

export type ViewMode = 'hub' | 'tarot' | 'astrology';

export const CosmicHub: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('hub');
  const router = useRouter();

  const handleReturnToHub = () => {
    setCurrentView('hub');
  };

  const handleEnterTarot = () => {
    setCurrentView('tarot');
  };

  const handleEnterAstrology = () => {
    setCurrentView('astrology');
  };

  const renderHub = () => (
    <motion.div
      key="hub"
      className={styles.hubContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.hubContent}>
        <motion.h1
          className={styles.hubTitle}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ✨ Welcome to Mystic Arcana ✨
        </motion.h1>
        
        <motion.p
          className={styles.hubSubtitle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Choose your path to cosmic wisdom
        </motion.p>

        {/* Mercury Retrograde Banner */}
        <motion.div
          className="w-full max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <MercuryRetrogradeBanner onMarketplaceClick={() => router.push('/marketplace')} />
        </motion.div>

        <div className={styles.realmCards}>
          {/* Tarot Realm Card */}
          <motion.div
            className={`${styles.realmCard} ${styles.tarotCard}`}
            initial={{ opacity: 0, x: -100, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: 5,
              boxShadow: '0 20px 40px rgba(255, 107, 107, 0.3)'
            }}
            onClick={handleEnterTarot}
          >
            <div className={styles.cardBackground}>
              <div className={styles.tarotSymbols}>
                <span className={styles.symbol}>🔮</span>
                <span className={styles.symbol}>🃏</span>
                <span className={styles.symbol}>✨</span>
                <span className={styles.symbol}>🌙</span>
              </div>
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Enter the Tarot Realm</h2>
              <p className={styles.cardDescription}>
                Unveil the mysteries of your past, present, and future through the ancient wisdom of tarot cards
              </p>
              <div className={styles.cardFeatures}>
                <span>• Single Card Insights</span>
                <span>• Three Card Spreads</span>
                <span>• Celtic Cross</span>
              </div>
            </div>
          </motion.div>

          {/* Astrology Realm Card */}
          <motion.div
            className={`${styles.realmCard} ${styles.astrologyCard}`}
            initial={{ opacity: 0, x: 100, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            whileHover={{ 
              scale: 1.05, 
              rotateY: -5,
              boxShadow: '0 20px 40px rgba(255, 215, 0, 0.3)'
            }}
            onClick={handleEnterAstrology}
          >
            <div className={styles.cardBackground}>
              <div className={styles.astrologySymbols}>
                <span className={styles.symbol}>🌟</span>
                <span className={styles.symbol}>🪐</span>
                <span className={styles.symbol}>⭐</span>
                <span className={styles.symbol}>🌕</span>
              </div>
            </div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>Enter the Astrology Cosmos</h2>
              <p className={styles.cardDescription}>
                Explore the celestial influences shaping your destiny through personalized astrological insights
              </p>
              <div className={styles.cardFeatures}>
                <span>• Birth Chart Analysis</span>
                <span>• Compatibility Readings</span>
                <span>• Career Guidance</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Daily Horoscope Widget - Lazy Loaded */}
        <motion.div
          className={styles.horoscopeSection}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <Suspense fallback={
            <div className="text-center text-purple-300 p-4">
              <div className="animate-pulse">Loading cosmic insights...</div>
            </div>
          }>
            <DailyHoroscopeWidget />
          </Suspense>
        </motion.div>

        {/* Daily Oracle Display - Comprehensive Reading */}
        <motion.div
          className={styles.oracleSection}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <Suspense fallback={
            <div className="text-center text-purple-300 p-4">
              <div className="animate-pulse">Consulting the cosmic oracle...</div>
            </div>
          }>
            <DailyOracleDisplay />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'hub':
        return renderHub();
      case 'tarot':
        return (
          <motion.div
            key="tarot"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className={styles.roomContainer}
          >
            <div className={styles.roomHeader}>
              <motion.button
                className={styles.backButton}
                onClick={handleReturnToHub}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Hub
              </motion.button>
            </div>
            <UnifiedTarotPanelV2 
              className={styles.tarotPanel}
            />
          </motion.div>
        );
      case 'astrology':
        return (
          <motion.div
            key="astrology"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className={styles.roomContainer}
          >
            <AstrologyReadingRoom onBack={handleReturnToHub} />
          </motion.div>
        );
      default:
        return renderHub();
    }
  };

  return (
    <div className={styles.cosmicHub}>
      {/* Header with Return to Hub functionality */}
      <Header onHomeClick={currentView !== 'hub' ? handleReturnToHub : undefined} />
      
      {/* Galaxy Background - Lazy Loaded */}
      <div className={styles.galaxyLayer}>
        <Suspense fallback={
          <div className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black opacity-80" />
        }>
          <GalaxyBackground
            intensity={currentView === 'hub' ? 0.8 : 0.4}
            showMilkyWay={currentView === 'hub'}
            animated={true}
            starCount={currentView === 'hub' ? 1000 : 500}
          />
        </Suspense>
      </div>

      {/* Return to Main Menu Button (visible on non-hub views) */}
      {currentView !== 'hub' && (
        <motion.button
          className={styles.returnButton}
          onClick={handleReturnToHub}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏠 Return to Main Menu
        </motion.button>
      )}

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};