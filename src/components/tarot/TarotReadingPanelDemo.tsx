"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTarotReading } from "../../hooks/useTarotAPI";
import { useTarotSession } from "../../contexts/TarotSessionContext";
import { AuthModal } from "../auth/AuthModal";
import { UnlockJourneyModal } from "../modals/UnlockJourneyModal";
import { TarotCard } from "./TarotCard";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Save, 
  RefreshCw, 
  Sparkles,
  Moon,
  Star,
  Heart,
  Eye,
  Book,
  History
} from "lucide-react";

interface TarotReadingPanelDemoProps {
  onActivate?: () => void;
  className?: string;
}

export const TarotReadingPanelDemo: React.FC<TarotReadingPanelDemoProps> = ({
  className = "",
}) => {
  const { user, isGuest } = useAuth();
  const tarotReading = useTarotReading();
  const tarotSession = useTarotSession();

  const [selectedSpread, setSelectedSpread] = useState<"single" | "three-card" | "celtic-cross">("single");
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  // Responsive state
  const [viewport, setViewport] = useState({ width: 0, height: 0, isMobile: false, isTablet: false });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Available spreads with celestial theming
  const availableSpreads = useMemo(() => {
    const spreads = [
      {
        id: "single" as const,
        name: "Cosmic Insight",
        description: "Quick guidance from the universe",
        cardCount: 1,
        available: true,
        icon: <Star className="w-6 h-6" />,
        gradient: "from-blue-500 via-purple-500 to-pink-500"
      },
      {
        id: "three-card" as const,
        name: "Celestial Journey",
        description: "Past, Present, Future illuminated",
        cardCount: 3,
        available: !isGuest,
        icon: <Moon className="w-6 h-6" />,
        gradient: "from-indigo-500 via-purple-600 to-blue-600"
      },
      {
        id: "celtic-cross" as const,
        name: "Stellar Revelation",
        description: "Complete cosmic life reading",
        cardCount: 10,
        available: !isGuest,
        icon: <Sparkles className="w-6 h-6" />,
        gradient: "from-purple-600 via-pink-600 to-orange-500"
      },
    ];

    return spreads;
  }, [isGuest]);

  // Perform shuffle with enhanced animation
  const performShuffle = useCallback(async () => {
    setIsShuffling(true);
    try {
      const result = await tarotReading.shuffle.shuffleDeck({ algorithm: "fisher-yates" });
      if (!result.success) {
        throw new Error(result.error || "Failed to shuffle deck");
      }
    } catch (error) {
      console.error("Shuffle error:", error);
    } finally {
      setTimeout(() => setIsShuffling(false), 1500); // Extended animation
    }
  }, [tarotReading.shuffle]);

  // Perform reading with enhanced UX
  const performReading = useCallback(async () => {
    if (isGuest && selectedSpread !== "single") {
      setShowAuthModal(true);
      return;
    }

    try {
      setFlippedCards(new Set());
      setSaveSuccess(false);
      setSaveError(null);

      // Shuffle first for dramatic effect
      await performShuffle();
      
      // Small delay for shuffle animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = await tarotReading.performReading(
        selectedSpread,
        user?.id
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to perform reading");
      }

      // Add to session for non-authenticated users
      if (!user && tarotReading.drawnCards) {
        tarotSession.addSessionReading({
          spreadType: selectedSpread,
          cards: tarotReading.drawnCards,
          question,
          notes: ""
        });
      }

      // Progressive card reveal for dramatic effect
      if (selectedSpread !== "single") {
        for (let i = 0; i < (tarotReading.drawnCards?.length || 0); i++) {
          setTimeout(() => {
            setFlippedCards(prev => new Set([...prev, i]));
          }, (i + 1) * 800);
        }
      } else {
        // Immediate reveal for single card
        setTimeout(() => setFlippedCards(new Set([0])), 500);
      }

      // Show unlock modal for guests after experience
      if (isGuest && selectedSpread === "single") {
        setTimeout(() => setShowUnlockModal(true), 8000);
      }
    } catch (error) {
      console.error("Error performing reading:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to perform reading");
    }
  }, [selectedSpread, isGuest, tarotReading, user, question, performShuffle, tarotSession]);

  // Save reading with enhanced UX
  const handleSaveReading = useCallback(async () => {
    if (!user || isGuest) {
      setShowAuthModal(true);
      return;
    }

    if (!interpretation.trim()) {
      setSaveError("Please share your interpretation of this reading");
      return;
    }

    try {
      setSaveError(null);
      const result = await tarotReading.saveCurrentReading(
        user.id,
        interpretation,
        question || undefined,
        notes || undefined,
        []
      );

      if (result.success) {
        setSaveSuccess(true);
        setShowSaveModal(false);
        
        // Add journal entry if provided
        if (journalEntry.trim()) {
          tarotSession.addJournalEntry({
            content: journalEntry,
            mood: "reflective",
            tags: [selectedSpread, "reading"]
          });
        }

        // Clear form
        setInterpretation("");
        setQuestion("");
        setNotes("");
        setJournalEntry("");
        
        // Auto-hide success after 4 seconds
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(result.error || "Failed to save reading");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save reading");
    }
  }, [user, isGuest, interpretation, question, notes, journalEntry, tarotReading, selectedSpread, tarotSession]);

  const handleCardFlip = useCallback((cardIndex: number) => {
    setFlippedCards((prev) => new Set([...prev, cardIndex]));
  }, []);

  // Get layout configuration for current viewport
  const getLayoutConfig = () => {
    if (viewport.isMobile) {
      return {
        containerClass: "p-4 space-y-6 min-h-screen",
        headerClass: "text-2xl sm:text-3xl",
        buttonClass: "px-6 py-4 text-base min-h-[56px]",
        cardSize: "w-20 h-30",
        gridClass: {
          single: "flex justify-center py-8",
          "three-card": "grid grid-cols-3 gap-3 max-w-xs mx-auto py-6",
          "celtic-cross": "grid grid-cols-3 gap-2 max-w-sm mx-auto py-4",
        },
        modalClass: "mx-4"
      };
    } else if (viewport.isTablet) {
      return {
        containerClass: "p-6 space-y-8 min-h-screen",
        headerClass: "text-3xl sm:text-4xl",
        buttonClass: "px-8 py-4 text-lg",
        cardSize: "w-24 h-36",
        gridClass: {
          single: "flex justify-center py-10",
          "three-card": "grid grid-cols-3 gap-6 max-w-2xl mx-auto py-8",
          "celtic-cross": "grid grid-cols-5 gap-3 max-w-4xl mx-auto py-6",
        },
        modalClass: "mx-8"
      };
    } else {
      return {
        containerClass: "p-8 space-y-10 min-h-screen",
        headerClass: "text-4xl sm:text-5xl",
        buttonClass: "px-10 py-5 text-xl",
        cardSize: "w-28 h-42",
        gridClass: {
          single: "flex justify-center py-12",
          "three-card": "grid grid-cols-3 gap-8 max-w-4xl mx-auto py-10",
          "celtic-cross": "grid grid-cols-5 gap-4 max-w-6xl mx-auto py-8",
        },
        modalClass: "mx-12"
      };
    }
  };

  const layout = getLayoutConfig();

  return (
    <div className={`relative w-full ${layout.containerClass} ${className}`}>
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black/40" />
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header with enhanced styling */}
      <motion.header
        className="text-center relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className={`${layout.headerClass} font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4`}
          style={{
            textShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
          }}
        >
          ✨ Tarot Reading ✨
        </motion.h1>
        <motion.p 
          className={`text-purple-100/90 ${viewport.isMobile ? "text-base" : "text-lg"} mb-2`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discover cosmic insights through ancient wisdom
        </motion.p>
        
        {/* Session stats for engagement */}
        {tarotSession.sessionStats.totalReadings > 0 && (
          <motion.div 
            className="flex justify-center gap-4 text-sm text-purple-300/80 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span>📊 {tarotSession.sessionStats.totalReadings} readings</span>
            <span>💫 {tarotSession.sessionStats.journalEntries} journal entries</span>
          </motion.div>
        )}
      </motion.header>

      {/* Status Messages with enhanced styling */}
      <AnimatePresence mode="wait">
        {tarotReading.error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm"
          >
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <span className="text-red-200 flex-1">{tarotReading.error}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-red-300 hover:text-red-200 text-sm underline"
            >
              Refresh
            </button>
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm"
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-green-200">✨ Reading saved to your cosmic journal!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spread Selection with enhanced design */}
      <motion.section
        className="space-y-6 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className={`text-purple-100 font-semibold text-center ${viewport.isMobile ? "text-xl" : "text-2xl"}`}>
          Choose Your Cosmic Path
        </h2>
        
        <div className={`grid gap-4 ${viewport.isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
          {availableSpreads.map((spread, index) => (
            <motion.button
              key={spread.id}
              className={`${layout.buttonClass} rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                selectedSpread === spread.id
                  ? `border-purple-400/60 bg-gradient-to-br ${spread.gradient} text-white shadow-lg shadow-purple-500/30`
                  : spread.available
                  ? "border-purple-500/30 bg-purple-900/20 text-purple-100 hover:bg-purple-800/30 hover:border-purple-400/50"
                  : "border-purple-600/20 bg-purple-900/10 text-purple-300/50 cursor-not-allowed"
              }`}
              onClick={() => spread.available && setSelectedSpread(spread.id)}
              disabled={!spread.available || tarotReading.isLoading}
              whileHover={spread.available ? { scale: 1.02, y: -2 } : undefined}
              whileTap={spread.available ? { scale: 0.98 } : undefined}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              aria-label={`Select ${spread.name} spread`}
              role="radio"
              aria-checked={selectedSpread === spread.id}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {spread.icon}
                  <span className="font-bold">{spread.name}</span>
                </div>
                <p className={`opacity-90 ${viewport.isMobile ? "text-sm" : "text-base"}`}>
                  {spread.description}
                </p>
                <div className="flex items-center gap-2 text-xs opacity-75">
                  <span>{spread.cardCount} card{spread.cardCount !== 1 ? 's' : ''}</span>
                  {!spread.available && <span>🔒 Sign in required</span>}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Action Buttons */}
      <motion.div
        className="flex justify-center gap-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Shuffle Button */}
        <motion.button
          className={`${layout.buttonClass} rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 border-2 border-indigo-400/30`}
          onClick={performShuffle}
          disabled={isShuffling || tarotReading.isLoading}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          aria-label="Shuffle the tarot deck"
        >
          <motion.div
            animate={isShuffling ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isShuffling ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
          <span>{isShuffling ? "Shuffling..." : "Shuffle Deck"}</span>
        </motion.button>

        {/* Draw Cards Button */}
        <motion.button
          className={`${layout.buttonClass} rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 border-2 border-pink-400/30`}
          onClick={performReading}
          disabled={tarotReading.isLoading || isShuffling}
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Draw ${selectedSpread === "single" ? "1 card" : selectedSpread === "three-card" ? "3 cards" : "10 cards"} for ${availableSpreads.find(s => s.id === selectedSpread)?.name} reading`}
        >
          {tarotReading.isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Drawing cards...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>
                Draw {selectedSpread === "single" ? "Card" : selectedSpread === "three-card" ? "3 Cards" : "10 Cards"}
              </span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Card Display Area with enhanced presentation */}
      <AnimatePresence mode="wait">
        {tarotReading.drawnCards && tarotReading.drawnCards.length > 0 && (
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            {/* Cards Grid */}
            <div className={layout.gridClass[selectedSpread]}>
              {tarotReading.drawnCards.map((card, index) => {
                const position = selectedSpread === "single" ? "Your Insight" : 
                               selectedSpread === "three-card" ? ["Past", "Present", "Future"][index] :
                               ["Present Situation", "Cross/Challenge", "Distant Past", "Recent Past", "Possible Outcome", "Immediate Future", "Your Approach", "External Influences", "Hopes & Fears", "Final Outcome"][index];
                
                return (
                  <motion.div
                    key={`${card.id}-${index}`}
                    className="relative flex flex-col items-center gap-3"
                    initial={{ opacity: 0, rotateY: 180, y: 50 }}
                    animate={{ opacity: 1, rotateY: 0, y: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100 
                    }}
                  >
                    {/* Position label for multi-card spreads */}
                    {selectedSpread !== "single" && (
                      <motion.div 
                        className={`text-center ${viewport.isMobile ? "text-xs" : "text-sm"} text-purple-200/80 font-medium bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 + 0.3 }}
                      >
                        {position}
                      </motion.div>
                    )}
                    
                    <motion.div
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      style={{
                        filter: flippedCards.has(index) ? "drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))" : "none"
                      }}
                    >
                      <TarotCard
                        frontImage={card.image_url}
                        backImage="/images/tarot/card-back.svg"
                        cardName={card.name}
                        cardMeaning={card.isReversed ? card.meaning_reversed : card.meaning_upright}
                        isFlipped={flippedCards.has(index)}
                        onFlip={() => handleCardFlip(index)}
                        className={`${layout.cardSize} transition-all duration-300`}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* Action buttons for completed reading */}
            {flippedCards.size > 0 && (
              <motion.div
                className="flex justify-center gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {!isGuest && (
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 border border-purple-400/30"
                    onClick={() => setShowSaveModal(true)}
                    disabled={tarotReading.save.loading}
                    aria-label="Save this reading to your journal"
                  >
                    <Save className="w-5 h-5" />
                    Save Reading
                  </button>
                )}
                
                <button
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 border border-blue-400/30"
                  onClick={() => setShowJournalModal(true)}
                  aria-label="Add this reading to your personal journal"
                >
                  <Book className="w-5 h-5" />
                  Journal Entry
                </button>
                
                {tarotSession.sessionStats.totalReadings > 1 && (
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg flex items-center gap-2 border border-indigo-400/30"
                    onClick={() => {/* Navigate to history */}}
                    aria-label="View your reading history"
                  >
                    <History className="w-5 h-5" />
                    View History
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Save Reading Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className={`bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-3xl p-6 max-w-lg w-full border border-purple-400/30 shadow-2xl ${layout.modalClass}`}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Save className="w-6 h-6 text-purple-300" />
                  Save Your Cosmic Reading
                </h3>
                <p className="text-purple-200/80">Preserve this moment of insight</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Eye className="w-4 h-4 inline mr-2" />
                    What question did you ask? (optional)
                  </label>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What guidance were you seeking?"
                    className="w-full px-4 py-3 bg-purple-800/30 text-white rounded-xl border border-purple-500/30 focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Your interpretation *
                  </label>
                  <textarea
                    value={interpretation}
                    onChange={(e) => setInterpretation(e.target.value)}
                    placeholder="What does this reading mean to you? What insights did you gain?"
                    rows={4}
                    className="w-full px-4 py-3 bg-purple-800/30 text-white rounded-xl border border-purple-500/30 focus:border-purple-400 focus:outline-none resize-none backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    <Book className="w-4 h-4 inline mr-2" />
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any other thoughts, feelings, or observations?"
                    rows={2}
                    className="w-full px-4 py-3 bg-purple-800/30 text-white rounded-xl border border-purple-500/30 focus:border-purple-400 focus:outline-none resize-none backdrop-blur-sm"
                  />
                </div>

                {saveError && (
                  <motion.div 
                    className="bg-red-500/20 border border-red-400/30 rounded-xl p-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-red-200 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {saveError}
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 px-4 py-3 bg-purple-700/50 hover:bg-purple-600/50 text-white rounded-xl font-semibold transition-colors border border-purple-500/30"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        Save to Journal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Entry Modal */}
      <AnimatePresence>
        {showJournalModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJournalModal(false)}
          >
            <motion.div
              className={`bg-gradient-to-br from-blue-900/95 to-indigo-900/95 rounded-3xl p-6 max-w-lg w-full border border-blue-400/30 shadow-2xl ${layout.modalClass}`}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Book className="w-6 h-6 text-blue-300" />
                  Personal Journal Entry
                </h3>
                <p className="text-blue-200/80">Capture your thoughts and feelings</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    How does this reading make you feel?
                  </label>
                  <textarea
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    placeholder="Express your thoughts, emotions, and any connections you feel to this reading..."
                    rows={6}
                    className="w-full px-4 py-3 bg-blue-800/30 text-white rounded-xl border border-blue-500/30 focus:border-blue-400 focus:outline-none resize-none backdrop-blur-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 px-4 py-3 bg-blue-700/50 hover:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors border border-blue-500/30"
                    onClick={() => setShowJournalModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    onClick={() => {
                      if (journalEntry.trim()) {
                        tarotSession.addJournalEntry({
                          content: journalEntry,
                          mood: "reflective",
                          tags: [selectedSpread, "reflection"]
                        });
                        setJournalEntry("");
                        setShowJournalModal(false);
                      }
                    }}
                    disabled={!journalEntry.trim()}
                  >
                    <Book className="w-4 h-4" />
                    Add to Journal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />

      {/* Unlock Journey Modal */}
      <UnlockJourneyModal
        isVisible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
      />
    </div>
  );
};