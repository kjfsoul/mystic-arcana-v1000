'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalaxyBackground } from '../effects/GalaxyBackground/GalaxyBackground';
import { TarotZonePreview } from '../panels/TarotZonePreview';
import { AstrologyZonePreview } from '../panels/AstrologyZonePreview';
import { CelestialEventsCarousel } from '../cosmic/CelestialEventsCarousel';
import { UnifiedTarotPanel } from '../tarot/UnifiedTarotPanel';
import { AstrologyReadingRoom } from '../astrology/AstrologyReadingRoom';
import { Header } from './Header';
import { AuthDebug } from '../debug/AuthDebug';

export type ViewMode = 'lobby' | 'tarot-room' | 'astrology-room' | 'awe-view';

export const UnifiedResponsiveLayout: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('lobby');
  const [galaxyIntensity, setGalaxyIntensity] = useState(0.7);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Responsive breakpoint detection
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Adjust galaxy intensity based on view mode and device (REDUCED for readability)
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let intensity = 0.3; // Significantly reduced default
    
    switch (viewMode) {
      case 'lobby':
        intensity = isMobile ? 0.2 : 0.3; // Much lower for content readability
        break;
      case 'awe-view':
        intensity = isMobile ? 0.4 : 0.6; // Reduced from 1.0
        break;
      case 'tarot-room':
        intensity = isMobile ? 0.2 : 0.25; // Heavily reduced for reading focus
        break;
      case 'astrology-room':
        intensity = isMobile ? 0.2 : 0.3; // Reduced for readability
        break;
    }
    
    setGalaxyIntensity(intensity);
  }, [viewMode, isMobile]);

  const handleEnterTarotRoom = () => setViewMode('tarot-room');
  const handleEnterAstrologyRoom = () => setViewMode('astrology-room');
  const handleEnterAweView = () => setViewMode('awe-view');
  const handleBackToLobby = () => setViewMode('lobby');

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Header with mobile-optimized spacing */}
      <Header onHomeClick={handleBackToLobby} />
      
      {/* Debug Component - Remove in production */}
      <AuthDebug />
      
      {/* Galaxy Background - Performance optimized for mobile */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GalaxyBackground
          intensity={galaxyIntensity}
          showMilkyWay={false} // Disable Milky Way entirely for cleaner background
          animated={true}
          starCount={isMobile ? 800 : 1500} // Drastically reduced star count for clarity
        />
      </div>

      {/* Dynamic content area with proper mobile spacing */}
      <div className="relative z-10 pt-16 md:pt-20">
        <AnimatePresence mode="wait">
          {viewMode === 'lobby' && (
            <MobileFirstLobby
              key="lobby"
              isMobile={isMobile}
              isTablet={isTablet}
              onEnterTarot={handleEnterTarotRoom}
              onEnterAstrology={handleEnterAstrologyRoom}
              onEnterAweView={handleEnterAweView}
            />
          )}

          {viewMode === 'tarot-room' && (
            <ResponsiveTarotRoom
              key="tarot-room"
              isMobile={isMobile}
              onBack={handleBackToLobby}
            />
          )}

          {viewMode === 'astrology-room' && (
            <ResponsiveAstrologyRoom
              key="astrology-room"
              isMobile={isMobile}
              onBack={handleBackToLobby}
            />
          )}

          {viewMode === 'awe-view' && (
            <ResponsiveAweView
              key="awe-view"
              isMobile={isMobile}
              onBack={handleBackToLobby}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

// Mobile-First Lobby Component
const MobileFirstLobby: React.FC<{
  isMobile: boolean;
  isTablet: boolean;
  onEnterTarot: () => void;
  onEnterAstrology: () => void;
  onEnterAweView: () => void;
}> = ({ isMobile, isTablet, onEnterTarot, onEnterAstrology, onEnterAweView }) => {
  
  // Mobile layout: Stack vertically with optimal spacing
  if (isMobile) {
    return (
      <motion.div
        className="min-h-[calc(100vh-64px)] px-4 py-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Mobile: Cosmic Weather First */}
        <motion.section
          className="flex items-center justify-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div 
            className="w-full max-w-sm backdrop-blur-lg bg-black/70 border border-purple-500/30 rounded-2xl p-4 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
            onClick={onEnterAweView}
            role="button"
            tabIndex={0}
            aria-label="View Cosmic Weather"
            onKeyDown={(e) => e.key === 'Enter' && onEnterAweView()}
          >
            <CelestialEventsCarousel onClick={onEnterAweView} />
          </div>
        </motion.section>

        {/* Mobile: Tarot Zone */}
        <motion.section
          className="cursor-pointer"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onClick={onEnterTarot}
          role="button"
          tabIndex={0}
          aria-label="Enter Tarot Reading Room"
          onKeyDown={(e) => e.key === 'Enter' && onEnterTarot()}
        >
          <div className="min-h-[280px] backdrop-blur-xl bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-black/75 border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/30 active:scale-95 transition-all duration-300">
            <TarotZonePreview />
          </div>
        </motion.section>

        {/* Mobile: Astrology Zone */}
        <motion.section
          className="cursor-pointer"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          onClick={onEnterAstrology}
          role="button"
          tabIndex={0}
          aria-label="Enter Astrology Reading Room"
          onKeyDown={(e) => e.key === 'Enter' && onEnterAstrology()}
        >
          <div className="min-h-[280px] backdrop-blur-xl bg-gradient-to-br from-amber-900/50 via-orange-900/40 to-black/75 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl hover:shadow-amber-500/30 active:scale-95 transition-all duration-300">
            <AstrologyZonePreview />
          </div>
        </motion.section>
      </motion.div>
    );
  }

  // Tablet/Desktop layout: Grid with proper responsive breakpoints
  return (
    <motion.div
      className={`min-h-[calc(100vh-80px)] px-4 py-8 max-w-7xl mx-auto ${
        isTablet 
          ? 'grid grid-cols-1 gap-6' // Tablet: Single column with larger cards
          : 'grid grid-cols-3 gap-8' // Desktop: Three columns
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Desktop/Tablet: Tarot Zone */}
      <motion.section
        className={`cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
          isTablet ? 'order-2' : 'order-1'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterTarot}
        role="button"
        tabIndex={0}
        aria-label="Enter Tarot Reading Room"
        onKeyDown={(e) => e.key === 'Enter' && onEnterTarot()}
      >
        <div className="h-full min-h-[400px] backdrop-blur-xl bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-black/75 border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
          <TarotZonePreview />
        </div>
      </motion.section>

      {/* Desktop/Tablet: Cosmic Weather */}
      <motion.section
        className={`flex items-center justify-center ${
          isTablet ? 'order-1 min-h-[200px]' : 'order-2 min-h-[500px]'
        }`}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div 
          className="w-full max-w-lg backdrop-blur-lg bg-black/60 border border-purple-500/35 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
          onClick={onEnterAweView}
          role="button"
          tabIndex={0}
          aria-label="View Cosmic Weather"
          onKeyDown={(e) => e.key === 'Enter' && onEnterAweView()}
        >
          <CelestialEventsCarousel onClick={onEnterAweView} />
        </div>
      </motion.section>

      {/* Desktop/Tablet: Astrology Zone */}
      <motion.section
        className={`cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
          isTablet ? 'order-3' : 'order-3'
        }`}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterAstrology}
        role="button"
        tabIndex={0}
        aria-label="Enter Astrology Reading Room"
        onKeyDown={(e) => e.key === 'Enter' && onEnterAstrology()}
      >
        <div className="h-full min-h-[400px] backdrop-blur-xl bg-gradient-to-br from-amber-900/50 via-orange-900/40 to-black/75 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl hover:shadow-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
          <AstrologyZonePreview />
        </div>
      </motion.section>
    </motion.div>
  );
};

// Responsive Tarot Room
const ResponsiveTarotRoom: React.FC<{ 
  isMobile: boolean;
  onBack: () => void 
}> = ({ isMobile, onBack }) => {
  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center ${
        isMobile ? 'p-4' : 'p-8'
      }`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Mobile-optimized back button */}
      <motion.button
        className={`absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-white font-medium hover:bg-black/80 hover:border-white/30 transform hover:-translate-x-1 transition-all duration-300 z-20 ${
          isMobile 
            ? 'px-3 py-2 text-sm min-h-[44px]' // Mobile: Larger touch target
            : 'px-6 py-3 text-base'
        }`}
        onClick={onBack}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ← Back to Lobby
      </motion.button>

      <motion.div
        className={`w-full max-w-6xl flex flex-col items-center ${
          isMobile ? 'gap-4' : 'gap-8'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className={`w-full bg-black/70 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl ${
          isMobile ? 'p-4' : 'p-12'
        }`}>
          <UnifiedTarotPanel />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Responsive Astrology Room
const ResponsiveAstrologyRoom: React.FC<{ 
  isMobile: boolean;
  onBack: () => void 
}> = ({ isMobile, onBack }) => {
  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center ${
        isMobile ? 'p-4' : 'p-8'
      }`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AstrologyReadingRoom onBack={onBack} />
    </motion.div>
  );
};

// Responsive Awe View
const ResponsiveAweView: React.FC<{ 
  isMobile: boolean;
  onBack: () => void 
}> = ({ isMobile, onBack }) => {
  const [currentView, setCurrentView] = useState<'earth' | 'moon' | 'mars' | 'deep-space'>('earth');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleViewChange = async (newView: 'earth' | 'moon' | 'mars' | 'deep-space') => {
    if (isTransitioning || newView === currentView) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 1000);
  };

  const viewConfig = {
    earth: { title: 'Earth View', description: 'Your home perspective in the cosmic dance', emoji: '🌍' },
    moon: { title: 'Lunar Perspective', description: 'See Earth from our celestial companion', emoji: '🌙' },
    mars: { title: 'Martian Vista', description: 'The red planet\'s unique cosmic viewpoint', emoji: '♂️' },
    'deep-space': { title: 'Deep Space Explorer', description: 'Journey beyond our solar system', emoji: '🌌' }
  };

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center overflow-hidden ${
        isMobile ? 'p-4' : 'p-8'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Mobile-optimized navigation radar */}
      <motion.div
        className={`absolute top-4 right-4 z-10 ${
          isMobile ? 'w-16 h-16' : 'w-24 h-24'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative w-full h-full border-2 border-amber-500/30 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
          <motion.div
            className={`absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-t from-transparent to-amber-500 origin-bottom -ml-px ${
              isMobile ? 'h-6 -mt-6' : 'h-10 -mt-10'
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative z-10">
            <span className={`drop-shadow-[0_0_10px_currentColor] ${
              isMobile ? 'text-lg' : 'text-2xl'
            }`}>
              {viewConfig[currentView].emoji}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Mobile-optimized back button */}
      <motion.button
        className={`absolute top-4 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl text-white font-medium hover:bg-black/80 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 z-10 ${
          isMobile 
            ? 'px-3 py-2 text-sm min-h-[44px]' // Mobile: Larger touch target
            : 'px-6 py-3 text-base'
        }`}
        onClick={onBack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back to Lobby
      </motion.button>

      {/* Main content with mobile-optimized typography */}
      <motion.div
        className="text-center text-white max-w-4xl mx-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            className={isMobile ? 'mb-6' : 'mb-12'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`font-extralight tracking-wider drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)] ${
              isMobile ? 'text-2xl mb-2' : 'text-6xl mb-4'
            }`}>
              {viewConfig[currentView].emoji} {viewConfig[currentView].title}
            </h1>
            <p className={`text-white/70 ${
              isMobile ? 'text-base' : 'text-xl'
            }`}>
              {viewConfig[currentView].description}
            </p>
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile-optimized interactive controls */}
        <motion.div 
          className={`justify-center max-w-3xl mx-auto ${
            isMobile 
              ? 'grid grid-cols-2 gap-3' // Mobile: 2x2 grid
              : 'grid grid-cols-4 gap-4'  // Desktop: 1x4 grid
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {Object.entries(viewConfig).map(([viewKey, config], index) => (
            <motion.button
              key={viewKey}
              className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl text-white font-medium transition-all duration-300 flex flex-col items-center gap-2 overflow-hidden ${
                isMobile 
                  ? 'px-3 py-4 text-sm min-h-[80px]' // Mobile: Compact but touch-friendly
                  : 'px-6 py-8 text-base'
              } ${
                currentView === viewKey 
                  ? 'bg-blue-600/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                  : 'border-white/10 hover:bg-black/60 hover:border-white/30 hover:shadow-xl hover:-translate-y-1'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => handleViewChange(viewKey as 'earth' | 'moon' | 'mars' | 'deep-space')}
              whileHover={!isTransitioning ? { 
                scale: 1.05, 
                y: -2,
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)'
              } : {}}
              whileTap={!isTransitioning ? { scale: 0.95 } : {}}
              disabled={isTransitioning}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (0.1 * index) }}
            >
              <span className={`drop-shadow-[0_0_10px_currentColor] ${
                isMobile ? 'text-xl' : 'text-3xl'
              }`}>
                {config.emoji}
              </span>
              <span className="font-semibold tracking-wide text-center">
                {isMobile ? config.title.split(' ')[0] : config.title}
              </span>
              {currentView === viewKey && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl -z-10"
                  layoutId="activeView"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Transition overlay */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-white">
                <motion.div
                  className={`mb-4 drop-shadow-[0_0_20px_currentColor] ${
                    isMobile ? 'text-4xl' : 'text-6xl'
                  }`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🌌
                </motion.div>
                <p className={`opacity-80 ${
                  isMobile ? 'text-base' : 'text-xl'
                }`}>
                  Transitioning to cosmic perspective...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile-optimized premium offer */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 right-8 z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, type: 'spring' }}
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-6 max-w-xs text-center text-white">
            <h3 className="text-lg mb-2 text-amber-400 font-semibold">✨ Cosmic Reading Bundle</h3>
            <p className="text-base mb-4 opacity-80 leading-relaxed">Unlock personalized insights from every perspective</p>
            <button className="w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white rounded-lg px-4 py-2 text-base font-semibold transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
              Explore Premium
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};