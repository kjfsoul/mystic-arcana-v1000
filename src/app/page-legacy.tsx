"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalaxyBackground } from "../components/effects/GalaxyBackground/GalaxyBackground";
import { TarotZonePreview } from "../components/panels/TarotZonePreview";
import { AstrologyZonePreview } from "../components/panels/AstrologyZonePreview";
import { CelestialEventsCarousel } from "../components/cosmic/CelestialEventsCarousel";
import { UnifiedTarotPanelV2 } from "../components/tarot/UnifiedTarotPanelV2";
import { AstrologyReadingRoom } from "../components/astrology/AstrologyReadingRoom";
import { Header } from "../components/layout/Header";
import { AuthDebug } from "../components/debug/AuthDebug";
export type ViewMode = "lobby" | "tarot-room" | "astrology-room" | "awe-view";
export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("lobby");
  const [galaxyIntensity, setGalaxyIntensity] = useState(0.7);

  useEffect(() => {
    // Adjust galaxy intensity based on view mode
    switch (viewMode) {
      case "lobby":
        setGalaxyIntensity(0.7);
        break;
      case "awe-view":
        setGalaxyIntensity(1.0);
        break;
      case "tarot-room":
        setGalaxyIntensity(1.2); // More dramatic for tarot immersion
        break;
      case "astrology-room":
        setGalaxyIntensity(0.9);
        break;
    }
  }, [viewMode]);
  const handleEnterTarotRoom = () => {
    setViewMode("tarot-room");
  };
  const handleEnterAstrologyRoom = () => {
    setViewMode("astrology-room");
  };
  const handleEnterAweView = () => {
    setViewMode("awe-view");
  };
  const handleBackToLobby = () => {
    setViewMode("lobby");
  };
  return (
    <main className="relative min-h-screen w-full overflow-hidden pt-20 perspective-[1200px] preserve-3d">
      {/* Header with Authentication */}
      <Header />

      {/* Debug Component - Remove in production */}
      <AuthDebug />

      {/* Galaxy Background - Always Present */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GalaxyBackground
          intensity={galaxyIntensity}
          showMilkyWay={true}
          animated={true}
        />
      </div>
      <AnimatePresence mode="wait">
        {viewMode === "lobby" && (
          <CosmicLobby
            key="lobby"
            onEnterTarot={handleEnterTarotRoom}
            onEnterAstrology={handleEnterAstrologyRoom}
            onEnterAweView={handleEnterAweView}
          />
        )}
        {viewMode === "tarot-room" && (
          <TarotReadingRoom key="tarot-room" onBack={handleBackToLobby} />
        )}
        {viewMode === "astrology-room" && (
          <AstrologyRoom key="astrology-room" onBack={handleBackToLobby} />
        )}
        {viewMode === "awe-view" && (
          <AweView key="awe-view" onBack={handleBackToLobby} />
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
      className="relative z-10 min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 p-4 lg:p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Mobile: Show cosmic weather first, Desktop: normal order */}
      {/* Center - Cosmic Weather */}
      <motion.section
        className="order-1 lg:order-2 flex items-center justify-center min-h-[300px] lg:min-h-[500px]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="w-full max-w-md lg:max-w-lg backdrop-blur-lg bg-black/20 border border-purple-500/25 rounded-2xl p-4 lg:p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
          <CelestialEventsCarousel onClick={onEnterAweView} />
        </div>
      </motion.section>
      {/* Left Panel - Tarot Zone Preview */}
      <motion.section
        className="order-2 lg:order-1 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterTarot}
        role="button"
        tabIndex={0}
        aria-label="Enter Tarot Reading Room"
        onKeyDown={(e) => e.key === "Enter" && onEnterTarot()}
      >
        <div className="h-full min-h-[400px] lg:min-h-[600px] backdrop-blur-xl bg-gradient-to-br from-purple-900/20 via-indigo-900/15 to-black/20 border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
          <TarotZonePreview />
        </div>
      </motion.section>
      {/* Right Panel - Astrology Zone Preview */}
      <motion.section
        className="order-3 lg:order-3 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onClick={onEnterAstrology}
        role="button"
        tabIndex={0}
        aria-label="Enter Astrology Reading Room"
        onKeyDown={(e) => e.key === "Enter" && onEnterAstrology()}
      >
        <div className="h-full min-h-[400px] lg:min-h-[600px] backdrop-blur-xl bg-gradient-to-br from-amber-900/20 via-orange-900/15 to-black/20 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
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
      className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 lg:p-8"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.button
        className="absolute top-4 lg:top-8 left-4 lg:left-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-xl text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium hover:bg-black/80 hover:border-white/30 transform hover:-translate-x-1 transition-all duration-300 z-20"
        onClick={onBack}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ← Back to Cosmic Lobby
      </motion.button>
      <motion.div
        className="w-full max-w-6xl flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 lg:p-12 shadow-2xl">
          <UnifiedTarotPanelV2 />
        </div>
      </motion.div>
    </motion.div>
  );
};
// Astrology Reading Room
const AstrologyRoom: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <motion.div
      className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 lg:p-8"
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
  const [currentView, setCurrentView] = useState<
    "earth" | "moon" | "mars" | "deep-space"
  >("earth");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const handleViewChange = async (
    newView: "earth" | "moon" | "mars" | "deep-space",
  ) => {
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
      title: "Earth View",
      description: "Your home perspective in the cosmic dance",
      emoji: "🌍",
    },
    moon: {
      title: "Lunar Perspective",
      description: "See Earth from our celestial companion",
      emoji: "🌙",
    },
    mars: {
      title: "Martian Vista",
      description: "The red planet's unique cosmic viewpoint",
      emoji: "♂️",
    },
    "deep-space": {
      title: "Deep Space Explorer",
      description: "Journey beyond our solar system",
      emoji: "🌌",
    },
  };
  return (
    <motion.div
      className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Navigation Radar */}
      <motion.div
        className="absolute top-4 lg:top-8 right-4 lg:right-8 w-20 h-20 lg:w-24 lg:h-24 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative w-full h-full border-2 border-amber-500/30 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
          <motion.div
            className="absolute top-1/2 left-1/2 w-0.5 h-8 lg:h-10 bg-gradient-to-t from-transparent to-amber-500 origin-bottom -ml-px -mt-8 lg:-mt-10"
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <div className="relative z-10">
            <span className="text-xl lg:text-2xl drop-shadow-[0_0_10px_currentColor]">
              {viewConfig[currentView].emoji}
            </span>
          </div>
        </div>
      </motion.div>
      {/* Back Button */}
      <motion.button
        className="absolute top-4 lg:top-8 left-4 lg:left-8 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium hover:bg-black/80 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 z-10"
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
        className="text-center text-white max-w-4xl mx-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            className="mb-8 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl lg:text-6xl font-extralight mb-4 tracking-wider drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
              {viewConfig[currentView].emoji} {viewConfig[currentView].title}
            </h1>
            <p className="text-lg lg:text-xl text-white/70">
              {viewConfig[currentView].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Interactive Controls */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 justify-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {Object.entries(viewConfig).map(([viewKey, config], index) => (
            <motion.button
              key={viewKey}
              className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl text-white px-4 py-6 lg:px-6 lg:py-8 text-sm lg:text-base font-medium transition-all duration-300 flex flex-col items-center gap-2 lg:gap-3 overflow-hidden ${
                currentView === viewKey
                  ? "bg-blue-600/30 border-blue-500/50 shadow-lg shadow-blue-500/20"
                  : "border-white/10 hover:bg-black/60 hover:border-white/30 hover:shadow-xl hover:-translate-y-1"
              } ${isTransitioning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() =>
                handleViewChange(
                  viewKey as "earth" | "moon" | "mars" | "deep-space",
                )
              }
              whileHover={
                !isTransitioning
                  ? {
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 12px 40px rgba(102, 126, 234, 0.3)",
                    }
                  : {}
              }
              whileTap={!isTransitioning ? { scale: 0.95 } : {}}
              disabled={isTransitioning}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + 0.1 * index }}
            >
              <span className="text-2xl lg:text-3xl drop-shadow-[0_0_10px_currentColor]">
                {config.emoji}
              </span>
              <span className="font-semibold tracking-wide">
                {config.title}
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
        {/* Transition Overlay */}
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
                  className="text-5xl lg:text-6xl mb-4 drop-shadow-[0_0_20px_currentColor]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🌌
                </motion.div>
                <p className="text-lg lg:text-xl opacity-80">
                  Transitioning to cosmic perspective...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Impulse Elements */}
      <motion.div
        className="absolute bottom-4 lg:bottom-8 right-4 lg:right-8 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
      >
        <div className="bg-black/80 backdrop-blur-2xl border border-amber-500/30 rounded-2xl p-4 lg:p-6 max-w-xs text-center text-white">
          <h3 className="text-base lg:text-lg mb-2 text-amber-400 font-semibold">
            ✨ Cosmic Reading Bundle
          </h3>
          <p className="text-sm lg:text-base mb-4 opacity-80 leading-relaxed">
            Unlock personalized insights from every perspective
          </p>
          <button className="w-full bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white rounded-lg px-4 py-2 text-sm lg:text-base font-semibold transform hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
            Explore Premium
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
