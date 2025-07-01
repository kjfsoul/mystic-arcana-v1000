"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTarotReading } from "../../hooks/useTarotAPI";
import { useCosmicWeather } from "../../utils/cosmic-weather/useCosmicWeather";
import { AuthModal } from "../auth/AuthModal";
import { UnlockJourneyModal } from "../modals/UnlockJourneyModal";
import { TarotCard } from "./TarotCard";
import { Loader2, AlertCircle, CheckCircle, Save, RefreshCw } from "lucide-react";

interface UnifiedTarotPanelV2Props {
  onActivate?: () => void;
  className?: string;
}

export const UnifiedTarotPanelV2: React.FC<UnifiedTarotPanelV2Props> = ({
  className = "",
}) => {
  const { user, isGuest } = useAuth();
  // const { cosmicInfluence } = useCosmicWeather();
  const tarotReading = useTarotReading();

  const [selectedSpread, setSelectedSpread] = useState<"single" | "three-card" | "celtic-cross">("single");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Available spreads configuration
  const availableSpreads = useMemo(() => {
    const spreads = [
      {
        id: "single" as const,
        name: "Single Card",
        description: "Quick insight into your current situation",
        cardCount: 1,
        available: true,
      },
      {
        id: "three-card" as const,
        name: "Three Card Spread",
        description: "Past, Present, and Future perspective",
        cardCount: 3,
        available: !isGuest,
      },
      {
        id: "celtic-cross" as const,
        name: "Celtic Cross",
        description: "Comprehensive 10-card life reading",
        cardCount: 10,
        available: !isGuest,
      },
    ];

    return spreads;
  }, [isGuest]);

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

  // Perform tarot reading using production API
  const performReading = useCallback(async () => {
    if (isGuest && selectedSpread !== "single") {
      setShowAuthModal(true);
      return;
    }

    try {
      setFlippedCards(new Set());
      setSaveSuccess(false);
      setSaveError(null);

      const result = await tarotReading.performReading(
        selectedSpread,
        user?.id
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to perform reading");
      }

      // Show unlock modal for guests after 6 seconds
      if (isGuest && selectedSpread === "single") {
        setTimeout(() => setShowUnlockModal(true), 6000);
      }
    } catch (error) {
      console.error("Error performing reading:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to perform reading");
    }
  }, [selectedSpread, isGuest, tarotReading, user]);

  // Save current reading
  const handleSaveReading = useCallback(async () => {
    if (!user || isGuest) {
      setShowAuthModal(true);
      return;
    }

    if (!interpretation.trim()) {
      setSaveError("Please provide an interpretation for your reading");
      return;
    }

    try {
      setSaveError(null);
      const result = await tarotReading.saveCurrentReading(
        user.id,
        interpretation,
        question || undefined,
        notes || undefined,
        [] // tags - could be enhanced later
      );

      if (result.success) {
        setSaveSuccess(true);
        setShowSaveModal(false);
        // Clear form
        setInterpretation("");
        setQuestion("");
        setNotes("");
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(result.error || "Failed to save reading");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save reading");
    }
  }, [user, isGuest, interpretation, question, notes, tarotReading]);

  const handleCardFlip = useCallback((cardIndex: number) => {
    setFlippedCards((prev) => new Set([...prev, cardIndex]));
  }, []);

  // Get responsive layout configuration
  const getLayoutConfig = () => {
    if (isMobile) {
      return {
        containerClass: "p-4 space-y-4",
        headerClass: "text-xl",
        buttonClass: "px-4 py-3 text-sm min-h-[44px]",
        cardSize: "w-16 h-24",
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

      {/* Error/Success Messages */}
      <AnimatePresence mode="wait">
        {tarotReading.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 text-sm">{tarotReading.error}</span>
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-200 text-sm">Reading saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spread Selection */}
      <motion.section
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className={`text-white font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
          Choose Your Reading
        </h3>
        <div className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
          {availableSpreads.map((spread) => (
            <motion.button
              key={spread.id}
              className={`${layout.buttonClass} rounded-lg border transition-all duration-200 ${
                selectedSpread === spread.id
                  ? "bg-purple-600 border-purple-400 text-white"
                  : spread.available
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
              }`}
              onClick={() => spread.available && setSelectedSpread(spread.id)}
              disabled={!spread.available || tarotReading.isLoading}
              whileHover={spread.available ? { scale: 1.02 } : undefined}
              whileTap={spread.available ? { scale: 0.98 } : undefined}
            >
              <div className="text-left">
                <h4 className="font-semibold">{spread.name}</h4>
                <p className={`${isMobile ? "text-xs" : "text-sm"} opacity-80 mt-1`}>
                  {spread.description}
                </p>
                {!spread.available && (
                  <p className="text-xs text-yellow-400 mt-1">🔒 Sign in to unlock</p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Draw Cards Button */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.button
          className={`${layout.buttonClass} px-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          onClick={performReading}
          disabled={tarotReading.isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tarotReading.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Shuffling deck...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Draw Cards</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Card Display Area */}
      <AnimatePresence mode="wait">
        {tarotReading.drawnCards && tarotReading.drawnCards.length > 0 && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <div className={layout.gridClass[selectedSpread]}>
              {tarotReading.drawnCards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  className="relative"
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TarotCard
                    frontImage={card.image_url}
                    backImage="/images/tarot/card-back.svg"
                    cardName={card.name}
                    cardMeaning={card.isReversed ? card.meaning_reversed : card.meaning_upright}
                    isFlipped={flippedCards.has(index)}
                    onFlip={() => handleCardFlip(index)}
                    className={layout.cardSize}
                  />
                </motion.div>
              ))}
            </div>

            {/* Save Reading Button */}
            {!isGuest && tarotReading.drawnCards.length > 0 && (
              <motion.div
                className="flex justify-center mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  onClick={() => setShowSaveModal(true)}
                  disabled={tarotReading.save.loading}
                >
                  <Save className="w-5 h-5" />
                  Save Reading
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Reading Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Save Your Reading</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Question (optional)
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What question did you ask?"
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Interpretation *
                  </label>
                  <textarea
                    value={interpretation}
                    onChange={(e) => setInterpretation(e.target.value)}
                    placeholder="What does this reading mean to you?"
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional thoughts or observations?"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>

                {saveError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{saveError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleSaveReading}
                    disabled={tarotReading.save.loading || !interpretation.trim()}
                  >
                    {tarotReading.save.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Unlock Journey Modal */}
      <UnlockJourneyModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={() => {
          setShowUnlockModal(false);
          setShowAuthModal(true);
        }}
      />
    </div>
  );
};