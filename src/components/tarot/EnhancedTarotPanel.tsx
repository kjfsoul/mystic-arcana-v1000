'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedShuffleAnimation } from './EnhancedShuffleAnimation';
import { EnhancedTarotSpreadLayouts, SpreadType } from './EnhancedTarotSpreadLayouts';
import { useTarotDeck } from '@/hooks/useTarotDeck';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { TarotCard } from '@/types/tarot';
import { Sparkles, Users, Heart, Zap, Star, Moon } from 'lucide-react';

interface EnhancedTarotPanelProps {
  initialSpreadType?: SpreadType;
  showDeckSelection?: boolean;
  socialMediaMode?: boolean; // Optimized for TikTok/Instagram embeds
  onReadingComplete?: (cards: TarotCard[], interpretation: string) => void;
  className?: string;
}

export const EnhancedTarotPanel: React.FC<EnhancedTarotPanelProps> = ({
  initialSpreadType = 'three-card',
  showDeckSelection = true,
  socialMediaMode = false,
  onReadingComplete,
  className = ''
}) => {
  const [selectedSpreadType, setSelectedSpreadType] = useState<SpreadType>(initialSpreadType);
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showSpread, setShowSpread] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('00000000-0000-0000-0000-000000000001');
  const [showSpreadSelector, setShowSpreadSelector] = useState(!socialMediaMode);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const {
    cards,
    deck,
    stats,
    loading,
    error,
    shuffleCards,
    drawCards,
    majorArcana,
    minorArcana
  } = useTarotDeck(selectedDeckId);

  // Spread configurations
  const spreadConfigs = {
    'single': { cardCount: 1, title: 'Single Card', icon: Star, description: 'Quick cosmic guidance' },
    'three-card': { cardCount: 3, title: 'Past-Present-Future', icon: Sparkles, description: 'Timeline reading' },
    'celtic-cross': { cardCount: 10, title: 'Celtic Cross', icon: Zap, description: 'Comprehensive insight' },
    'horseshoe': { cardCount: 5, title: 'Horseshoe Spread', icon: Moon, description: 'Balanced perspective' },
    'relationship': { cardCount: 5, title: 'Relationship', icon: Heart, description: 'Love & connection' },
    'custom': { cardCount: 7, title: 'Custom Spread', icon: Users, description: 'Personalized layout' }
  };

  // Handle shuffle completion
// eslint-disable-next-line react-hooks/exhaustive-deps
  const handleShuffleComplete = useCallback(() => {
    setIsShuffling(false);
    
    // Draw cards based on selected spread
    const config = spreadConfigs[selectedSpreadType];
    const drawn = drawCards(config.cardCount);
    setDrawnCards(drawn);
    setShowSpread(true);
    
    // Start revealing cards after a brief delay
    setTimeout(() => {
      setIsRevealing(true);
    }, 500);
  }, [selectedSpreadType, drawCards]);

  // Handle new reading
// eslint-disable-next-line react-hooks/exhaustive-deps
  const startNewReading = useCallback(() => {
    setDrawnCards([]);
    setShowSpread(false);
    setIsRevealing(false);
    setShowSpreadSelector(!socialMediaMode);
  }, [socialMediaMode]);

  // Handle card click in spread
// eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCardClick = useCallback((card: TarotCard, index: number) => {
    console.log(`Card clicked: ${card.name} at position ${index}`);
    
    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  // Social media optimization - auto-start with popular spreads
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (socialMediaMode && cards.length > 0 && !showSpread) {
      // Auto-select three-card spread for social media
      setSelectedSpreadType('three-card');
      setShowSpreadSelector(false);
    }
  }, [socialMediaMode, cards.length, showSpread]);

  // Loading state
  if (loading) {
    return (
      <div className={`relative w-full min-h-screen flex items-center justify-center ${className}`}>
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="text-purple-300 text-lg font-medium">
            Loading cosmic deck...
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`relative w-full min-h-screen flex items-center justify-center ${className}`}>
        <motion.div
          className="text-center space-y-4 max-w-md mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-400 text-6xl mb-4">🔮</div>
          <div className="text-red-300 text-xl font-medium mb-2">
            Cosmic Connection Lost
          </div>
          <div className="text-purple-300 text-sm mb-6">
            {error}
          </div>
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
          >
            Reconnect to the Universe
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen overflow-hidden ${className}`}>
      {/* Background cosmic effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('/images/stars.png')] opacity-30 animate-pulse" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
          }}
          animate={{
            background: [
              'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 60% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 60%), radial-gradient(circle at 40% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Header */}
        {!socialMediaMode && (
          <motion.div
            className="p-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Mystic Arcana
            </h1>
            <p className="text-purple-300 text-lg">
              {deck?.name || 'Cosmic Tarot Experience'}
            </p>
            {stats && (
              <div className="text-sm text-purple-400 mt-2">
                {stats.totalCards} cards • {stats.majorArcana} Major • {stats.minorArcana} Minor
              </div>
            )}
          </motion.div>
        )}

        {/* Spread selector */}
        <AnimatePresence>
          {showSpreadSelector && (
            <motion.div
              className="px-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-center text-purple-300 mb-6">
                  Choose Your Cosmic Reading
                </h2>
                
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {Object.entries(spreadConfigs).map(([type, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedSpreadType === type;
                    
                    return (
                      <motion.button
                        key={type}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                            : 'border-purple-600/30 bg-purple-900/20 hover:border-purple-500/50 hover:bg-purple-500/10'
                        }`}
                        onClick={() => setSelectedSpreadType(type as SpreadType)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-300' : 'text-purple-400'}`} />
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-purple-300'}`}>
                            {config.title}
                          </span>
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-purple-200' : 'text-purple-400'}`}>
                          {config.description}
                        </div>
                        <div className={`text-xs mt-2 ${isSelected ? 'text-purple-300' : 'text-purple-500'}`}>
                          {config.cardCount} {config.cardCount === 1 ? 'card' : 'cards'}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">
            {!showSpread ? (
              // Shuffle phase
              <motion.div
                key="shuffle"
                className="text-center space-y-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-semibold text-purple-300">
                    {isShuffling ? 'Shuffling Cosmic Energies...' : 'Ready for Your Reading'}
                  </h2>
                  
                  {!isShuffling && (
                    <p className="text-purple-400 text-lg max-w-md mx-auto">
                      Focus your intention and click to shuffle the {spreadConfigs[selectedSpreadType].title.toLowerCase()} spread
                    </p>
                  )}
                </div>

                <EnhancedShuffleAnimation
                  isShuffling={isShuffling}
                  onShuffleStart={() => setIsShuffling(true)}
                  onShuffleComplete={handleShuffleComplete}
                  size={isMobile ? 'medium' : 'large'}
                  cardCount={stats?.totalCards || 78}
                  showCardPreview={!socialMediaMode}
                />

                {/* Spread info */}
                {!isShuffling && (
                  <motion.div
                    className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="text-purple-300 font-medium">
                      {spreadConfigs[selectedSpreadType].title}
                    </div>
                    <div className="text-purple-400 text-sm">
                      {spreadConfigs[selectedSpreadType].description}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              // Spread phase
              <motion.div
                key="spread"
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <EnhancedTarotSpreadLayouts
                  spreadType={selectedSpreadType}
                  cards={drawnCards}
                  onCardClick={handleCardClick}
                  isRevealing={isRevealing}
                  showBioluminescence={true}
                  isMobile={isMobile || socialMediaMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {showSpread && (
            <motion.div
              className="p-6 text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg shadow-purple-500/20"
                onClick={startNewReading}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                ✨ New Reading
              </motion.button>
              
              {!socialMediaMode && (
                <div className="text-purple-400 text-sm">
                  Click cards to explore their meanings
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};