"use client";
 
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { TarotEngine, TarotReading } from "../../lib/tarot/TarotEngine";
import { TarotService } from "../../services/TarotService";
import { useCosmicWeather } from "../../utils/cosmic-weather/useCosmicWeather";
import { AuthModal } from "../auth/AuthModal";
import { UnlockJourneyModal } from "../modals/UnlockJourneyModal";
import { TarotCard } from "./TarotCard";
interface UnifiedTarotPanelProps {
  onActivate?: () => void;
  className?: string;
}
export const UnifiedTarotPanel: React.FC<UnifiedTarotPanelProps> = ({
  className = "",
}) => {
  const { user, isGuest } = useAuth();
  const { cosmicInfluence } = useCosmicWeather();
  const [currentReading, setCurrentReading] = useState<TarotReading | null>(
    null
  );
  const [isPerformingReading, setIsPerformingReading] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<
    "single" | "three-card" | "celtic-cross"
  >("single");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  // Responsive breakpoint detection
 
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);
  // Initialize tarot engine with user context
 
  const tarotEngine = useMemo(
    () =>
      new TarotEngine({
        isGuest,
        cosmicInfluence,
      }),
    [isGuest, cosmicInfluence]
  );
  const availableSpreads = tarotEngine.getAvailableSpreadTypes();
 
  const handleSpreadSelection = useCallback(
    (spreadType: "single" | "three-card" | "celtic-cross") => {
      if (isGuest && spreadType !== "single") {
        setShowAuthModal(true);
        return;
      }
      setSelectedSpread(spreadType);
      setCurrentReading(null);
      setFlippedCards(new Set());
      setShowUnlockModal(false);
    },
    [isGuest]
  );
 
  const performReading = useCallback(async () => {
    setIsPerformingReading(true);
    setFlippedCards(new Set());
    try {
      const reading = await tarotEngine.performReading(selectedSpread);
      setCurrentReading(reading);
      setShowReadingModal(true); // Show the modal with the reading
      // Save reading for registered users
      if (!isGuest && user) {
        try {
          const { error } = await TarotService.saveReading(reading, user.id);
          if (error) {
            console.warn("Failed to save reading:", error);
          }
        } catch (saveError) {
          console.warn("Error saving reading:", saveError);
        }
      }
      // For guests, show unlock modal after single card reading with interpretation
      if (isGuest && selectedSpread === "single") {
        setTimeout(() => setShowUnlockModal(true), 6000);
      }
    } catch (error) {
      console.error("Error performing reading:", error);
    } finally {
      setIsPerformingReading(false);
    }
  }, [selectedSpread, isGuest, tarotEngine, user]);
 
  const handleCardFlip = useCallback((cardIndex: number) => {
    setFlippedCards((prev) => new Set([...prev, cardIndex]));
  }, []);
 
  const handleCloseUnlockModal = useCallback(() => {
    setShowUnlockModal(false);
  }, []);
  // Get responsive layout configuration
  const getLayoutConfig = () => {
    if (isMobile) {
      return {
        containerClass: "p-4 space-y-4",
        headerClass: "text-xl",
        buttonClass: "px-4 py-3 text-sm min-h-[44px]",
        cardSize: "w-16 h-24", // Smaller cards for mobile
        gridClass: {
          single: "flex justify-center",
          "three-card": "grid grid-cols-3 gap-2 max-w-xs mx-auto",
          "celtic-cross": "grid grid-cols-3 gap-1 max-w-sm mx-auto",
        },
      };
    } else if (isTablet) {
      return {
        containerClass: "p-6 space-y-6",
        headerClass: "text-2xl",
        buttonClass: "px-6 py-3 text-base",
        cardSize: "w-20 h-32",
        gridClass: {
          single: "flex justify-center",
          "three-card": "grid grid-cols-3 gap-4 max-w-md mx-auto",
          "celtic-cross": "grid grid-cols-5 gap-2 max-w-lg mx-auto",
        },
      };
    } else {
      return {
        containerClass: "p-8 space-y-8",
        headerClass: "text-3xl",
        buttonClass: "px-8 py-4 text-lg",
        cardSize: "w-24 h-36",
        gridClass: {
          single: "flex justify-center",
          "three-card": "grid grid-cols-3 gap-6 max-w-lg mx-auto",
          "celtic-cross": "grid grid-cols-5 gap-3 max-w-4xl mx-auto",
        },
      };
    }
  };
  const layout = getLayoutConfig();
  return (
    <div className={`relative w-full ${layout.containerClass} ${className}`}>
      {/* Header */}
      <motion.header
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={`${layout.headerClass} font-bold text-white mb-2`}>
          Tarot Reading
        </h2>
        <p className={`text-white/70 ${isMobile ? "text-sm" : "text-base"}`}>
          Discover cosmic insights through the ancient art of tarot
        </p>
      </motion.header>
      {/* Spread Selection - Mobile-optimized buttons */}
      <motion.section
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3
          className={`text-white font-semibold ${
            isMobile ? "text-lg" : "text-xl"
          }`}
        >
          Choose Your Reading
        </h3>
        <div
          className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}
        >
          {availableSpreads.map((spread) => (
            <motion.button
              key={spread.id}
              className={`${
                layout.buttonClass
              } bg-purple-900/50 border border-purple-500/50 rounded-xl text-white font-medium hover:bg-purple-800/60 hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 ${
                selectedSpread === spread.id
                  ? "bg-purple-700/70 border-purple-400/80 shadow-lg shadow-purple-500/30"
                  : ""
              } ${isGuest && spread.id !== "single" ? "opacity-50" : ""}`}
              onClick={() =>
                handleSpreadSelection(
                  spread.id as "single" | "three-card" | "celtic-cross"
                )
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGuest && spread.id !== "single"}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`${isMobile ? "text-lg" : "text-xl"}`}>
                  {spread.id === "single"
                    ? "🔮"
                    : spread.id === "three-card"
                    ? "🌟"
                    : "✨"}
                </span>
                <span className="font-semibold">{spread.name}</span>
                <span
                  className={`text-white/60 ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  {spread.description}
                </span>
                {isGuest && spread.id !== "single" && (
                  <span className="text-amber-400 text-xs font-medium">
                    Sign in required
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>
      {/* Reading Button - Enhanced */}
      <motion.div
        className="flex justify-center py-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          className={`${
            isMobile ? 'px-8 py-4 text-lg' : 'px-12 py-5 text-xl'
          } bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:via-purple-400 hover:to-blue-500 text-white rounded-full font-bold shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 border-2 border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 min-w-[200px]`}
          onClick={performReading}
          disabled={isPerformingReading}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPerformingReading ? (
            <div className="flex items-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Drawing Cards...</span>
            </div>
          ) : (
            `Draw ${
              selectedSpread === "single"
                ? "Card"
                : selectedSpread === "three-card"
                ? "3 Cards"
                : "10 Cards"
            }`
          )}
        </motion.button>
      </motion.div>
      {/* Reading Results Modal */}
      <AnimatePresence>
        {showReadingModal && currentReading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReadingModal(false)}
            />
            
            {/* Modal Content */}
            <motion.section
              className={`relative z-10 w-full max-w-7xl bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-blue-900/85 border-2 border-purple-500/50 rounded-3xl shadow-2xl overflow-hidden ${
                isMobile ? 'max-h-[95vh] p-4' : 'max-h-[90vh] p-8'
              }`}
              style={{
                boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 50px rgba(99, 102, 241, 0.2), inset 0 0 100px rgba(139, 92, 246, 0.1)'
              }}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  Your {selectedSpread === 'single' ? 'Card' : selectedSpread === 'three-card' ? 'Three Card' : 'Celtic Cross'} Reading
                </h2>
                <button
                  onClick={() => setShowReadingModal(false)}
                  className="text-white/80 hover:text-white text-3xl font-light transition-colors"
                  aria-label="Close reading"
                >
                  ×
                </button>
              </div>
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-600/10 to-blue-600/20 pointer-events-none" />
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2 relative z-10">
                {/* Cards Display with Enhanced Spacing */}
                <div className={`${
                  selectedSpread === 'single' 
                    ? 'flex justify-center' 
                    : selectedSpread === 'three-card'
                    ? isMobile ? 'grid grid-cols-3 gap-2 max-w-sm mx-auto' : 'grid grid-cols-3 gap-8 max-w-4xl mx-auto'
                    : isMobile ? 'grid grid-cols-3 gap-2 max-w-md mx-auto' : 'grid grid-cols-5 gap-4 max-w-6xl mx-auto'
                } mb-8`}>
              {currentReading.cards.map((cardData, index) => (
                <motion.div
                  key={`${currentReading.id}-card-${cardData.id}-${index}`}
                  className="flex flex-col items-center gap-2 relative"
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  <div
                    className={`relative ${
                      flippedCards.has(index) ? 'animate-pulse' : ''
                    }`}
                    style={{
                      filter: flippedCards.has(index) ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))' : 'none',
                    }}
                  >
                    <TarotCard
                      frontImage={cardData.frontImage}
                      backImage={cardData.backImage}
                      cardName={cardData.name}
                      cardMeaning={cardData.meaning.upright}
                      isFlipped={flippedCards.has(index)}
                      onFlip={() => handleCardFlip(index)}
                      className={`${
                        isMobile 
                          ? 'w-24 h-36' 
                          : selectedSpread === 'single' 
                          ? 'w-48 h-72' 
                          : selectedSpread === 'three-card'
                          ? 'w-36 h-54'
                          : 'w-28 h-42'
                      } cursor-pointer transform hover:scale-105 transition-all duration-300 rounded-lg overflow-hidden border-2 ${
                        flippedCards.has(index) 
                          ? 'border-purple-400/60' 
                          : 'border-transparent hover:border-purple-500/30'
                      }`}
                      style={{
                        boxShadow: flippedCards.has(index) 
                          ? '0 0 30px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.2)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  </div>
                  {selectedSpread !== "single" && (
                    <span
                      className={`text-white bg-purple-600/40 backdrop-blur-sm px-3 py-1 rounded-full text-center font-medium ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      {currentReading.positions[index]}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            {/* Interpretation */}
            {flippedCards.size > 0 && (
              <motion.div
                className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3
                  className={`text-white font-bold mb-3 ${
                    isMobile ? "text-lg" : "text-xl"
                  }`}
                >
                  Reading Interpretation
                </h3>
                
                {/* Individual Card Meanings - Show only for flipped cards */}
                {selectedSpread !== 'single' && (
                  <div className="space-y-4 mb-6">
                    {currentReading.cards.map((card, index) => {
                      if (!flippedCards.has(index)) return null;
                      return (
                        <motion.div
                          key={`meaning-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3"
                        >
                          <h4 className="text-purple-200 font-semibold mb-1">
                            {currentReading.positions[index]} - {card.name}
                          </h4>
                          <p className="text-white/80 text-sm">
                            {card.meaning.upright}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {/* Overall interpretation - show only when all cards are flipped */}
                {flippedCards.size === currentReading.cards.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`text-white/90 leading-relaxed ${
                      isMobile ? "text-sm" : "text-base"
                    }`}
                  >
                    <p className="font-semibold text-purple-200 mb-2">Complete Reading:</p>
                    {currentReading.interpretation}
                  </motion.div>
                )}
                
                {/* Single card shows immediately */}
                {selectedSpread === 'single' && (
                  <div className={`text-white/90 leading-relaxed ${
                    isMobile ? "text-sm" : "text-base"
                  }`}>
                    {currentReading.interpretation}
                  </div>
                )}
                {/* Cosmic Influence */}
                {cosmicInfluence && (
                  <motion.div
                    className="mt-4 p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h4
                      className={`text-purple-200 font-semibold mb-2 ${
                        isMobile ? "text-sm" : "text-base"
                      }`}
                    >
                      🌙 Cosmic Influence
                    </h4>
                    <p
                      className={`text-purple-100/80 ${
                        isMobile ? "text-xs" : "text-sm"
                      }`}
                    >
                      The current lunar phase enhances the mystical energy of
                      your reading.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
        title="Sign in to unlock full readings"
        subtitle="Guest users can only access single card readings"
      />
      <UnlockJourneyModal
        isVisible={showUnlockModal}
        onClose={handleCloseUnlockModal}
        type="tarot"
      />
    </div>
  );
};
