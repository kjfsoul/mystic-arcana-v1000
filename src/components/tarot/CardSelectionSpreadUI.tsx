'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Zap, Star, Moon, Crown, Wand2, Play } from 'lucide-react';
import { SpreadType } from './EnhancedTarotSpreadLayouts';
// TODO: Implement TarotCard type for card previews
// import { TarotCard } from '@/types/tarot';
interface SpreadConfig {
  cardCount: number;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  preview: string[];
  keywords: string[];
}
interface CardSelectionSpreadUIProps {
  onSpreadSelected: (spreadType: SpreadType) => void;
  onReadingStart: (spreadType: SpreadType) => void;
  selectedSpread?: SpreadType;
  isAuthenticated?: boolean;
  className?: string;
}
export const CardSelectionSpreadUI: React.FC<CardSelectionSpreadUIProps> = ({
  onSpreadSelected,
  onReadingStart,
  selectedSpread = 'three-card',
  isAuthenticated = false,
  className = ''
}) => {
  const [hoveredSpread, setHoveredSpread] = useState<SpreadType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  // TODO: Implement preview functionality
  // const [showPreview, setShowPreview] = useState(false);
  // Enhanced spread configurations with detailed metadata
  const spreadConfigs: Record<SpreadType, SpreadConfig> = {
    'single': {
      cardCount: 1,
      title: 'Single Card Guidance',
      icon: Star,
      description: 'Quick cosmic insight for immediate clarity',
      difficulty: 'beginner',
      timeEstimate: '2 min',
      preview: ['Present Situation'],
      keywords: ['clarity', 'guidance', 'focus', 'immediate']
    },
    'three-card': {
      cardCount: 3,
      title: 'Past-Present-Future',
      icon: Sparkles,
      description: 'Timeline reading revealing your path',
      difficulty: 'beginner',
      timeEstimate: '5 min',
      preview: ['Past Foundation', 'Present Moment', 'Future Potential'],
      keywords: ['timeline', 'journey', 'progression', 'clarity']
    },
    'celtic-cross': {
      cardCount: 10,
      title: 'Celtic Cross',
      icon: Zap,
      description: 'Comprehensive life analysis and deep insight',
      difficulty: 'advanced',
      timeEstimate: '15 min',
      preview: ['Present', 'Challenge', 'Past', 'Future', 'Crown', 'Foundation', 'Self', 'Environment', 'Hopes/Fears', 'Outcome'],
      keywords: ['comprehensive', 'detailed', 'life-path', 'transformation']
    },
    'horseshoe': {
      cardCount: 5,
      title: 'Horseshoe Spread',
      icon: Moon,
      description: 'Balanced perspective on current situation',
      difficulty: 'intermediate',
      timeEstimate: '8 min',
      preview: ['Past Influences', 'Present', 'Hidden Factors', 'Advice', 'Likely Outcome'],
      keywords: ['balance', 'perspective', 'guidance', 'practical']
    },
    'relationship': {
      cardCount: 5,
      title: 'Relationship Reading',
      icon: Heart,
      description: 'Love, connection, and partnership insights',
      difficulty: 'intermediate',
      timeEstimate: '10 min',
      preview: ['You', 'Them', 'Connection', 'Challenges', 'Potential'],
      keywords: ['love', 'partnership', 'connection', 'harmony']
    },
    'custom': {
      cardCount: 7,
      title: 'Custom Spread',
      icon: Crown,
      description: 'Personalized layout for specific questions',
      difficulty: 'advanced',
      timeEstimate: '12 min',
      preview: ['Custom Position 1', 'Custom Position 2', '...'],
      keywords: ['personalized', 'flexible', 'specific', 'tailored']
    }
  };
  // Handle spread selection with smooth animations
 
  const handleSpreadSelect = useCallback((spreadType: SpreadType) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    onSpreadSelected(spreadType);
    
    // Reset animation after completion
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating, onSpreadSelected]);
  // Handle reading start with cosmic effects
 
  const handleStartReading = useCallback(() => {
    if (!selectedSpread || isAnimating) return;
    
    setIsAnimating(true);
    onReadingStart(selectedSpread);
  }, [selectedSpread, isAnimating, onReadingStart]);
  // Keyboard navigation support
 
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedSpread) return;
      
      const spreads = Object.keys(spreadConfigs) as SpreadType[];
      const currentIndex = spreads.indexOf(selectedSpread);
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp': {
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : spreads.length - 1;
          handleSpreadSelect(spreads[prevIndex]);
          break;
        }
        case 'ArrowRight':
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = currentIndex < spreads.length - 1 ? currentIndex + 1 : 0;
          handleSpreadSelect(spreads[nextIndex]);
          break;
        }
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleStartReading();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSpread, handleSpreadSelect, handleStartReading]);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-purple-400 bg-purple-500/20';
    }
  };
  const getAuthenticationRequirement = (spreadType: SpreadType) => {
    if (isAuthenticated) return null;
    
    const guestAllowed = ['single'];
    return guestAllowed.includes(spreadType) ? null : 'authentication';
  };
  return (
    <div className={`relative w-full max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header Section */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Choose Your Cosmic Reading
        </motion.h2>
        <p className="text-purple-300 text-lg">
          Select a spread that resonates with your spiritual journey
        </p>
      </motion.div>
      {/* Spread Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(spreadConfigs).map(([type, config], index) => {
          const Icon = config.icon;
          const isSelected = selectedSpread === type;
          const isHovered = hoveredSpread === type;
          const authRequirement = getAuthenticationRequirement(type as SpreadType);
          const isLocked = authRequirement === 'authentication';
          
          return (
            <motion.div
              key={type}
              className={`relative group cursor-pointer ${isLocked ? 'opacity-60' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredSpread(type as SpreadType)}
              onHoverEnd={() => setHoveredSpread(null)}
              onClick={() => !isLocked && handleSpreadSelect(type as SpreadType)}
            >
              {/* Card Container */}
              <motion.div
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'border-purple-400 bg-purple-500/20 shadow-2xl shadow-purple-500/30'
                    : isHovered
                    ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-purple-600/30 bg-purple-900/20 hover:border-purple-500/50'
                }`}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                animate={isSelected ? {
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)'
                  ]
                } : {}}
                transition={isSelected ? { duration: 2, repeat: Infinity } : {}}
              >
                {/* Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-yellow-300 text-sm font-medium">
                        Sign In Required
                      </p>
                    </div>
                  </div>
                )}
                {/* Background Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl"
                  animate={isSelected ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0.1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Header */}
                <div className="relative z-20 flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500/30' : 'bg-purple-600/20'}`}
                      animate={isSelected ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-300' : 'text-purple-400'}`} />
                    </motion.div>
                    <div>
                      <h3 className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-purple-300'}`}>
                        {config.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(config.difficulty)}`}>
                          {config.difficulty}
                        </span>
                        <span className="text-purple-400 text-xs">
                          {config.timeEstimate}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Count Badge */}
                  <motion.div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isSelected 
                        ? 'bg-purple-400 text-white' 
                        : 'bg-purple-600/30 text-purple-300'
                    }`}
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {config.cardCount} {config.cardCount === 1 ? 'card' : 'cards'}
                  </motion.div>
                </div>
                {/* Description */}
                <p className={`text-sm mb-4 ${isSelected ? 'text-purple-200' : 'text-purple-400'}`}>
                  {config.description}
                </p>
                {/* Keywords */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {config.keywords.slice(0, 3).map((keyword, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-cyan-500/20 text-cyan-300' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      #{keyword}
                    </span>
                  ))}
                </div>
                {/* Preview Positions */}
                <AnimatePresence>
                  {(isHovered || isSelected) && (
                    <motion.div
                      className="border-t border-purple-500/30 pt-4 mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-xs font-medium text-purple-300 mb-2">Position Preview:</h4>
                      <div className="space-y-1">
                        {config.preview.slice(0, 3).map((position, i) => (
                          <motion.div
                            key={i}
                            className="text-xs text-purple-400 flex items-center space-x-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>{position}</span>
                          </motion.div>
                        ))}
                        {config.preview.length > 3 && (
                          <div className="text-xs text-purple-500">
                            +{config.preview.length - 3} more positions
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      {/* Selected Spread Details */}
      <AnimatePresence>
        {selectedSpread && (
          <motion.div
            className="bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-lg rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {spreadConfigs[selectedSpread].title}
                </h3>
                <p className="text-purple-300 mb-3">
                  {spreadConfigs[selectedSpread].description}
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {spreadConfigs[selectedSpread].keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Start Reading Button */}
              <motion.button
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl shadow-purple-500/30 flex items-center space-x-3 group"
                onClick={handleStartReading}
                disabled={isAnimating}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  background: [
                    'linear-gradient(45deg, #8b5cf6, #ec4899, #06b6d4)',
                    'linear-gradient(45deg, #ec4899, #06b6d4, #8b5cf6)',
                    'linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Play className="w-5 h-5 group-hover:animate-pulse" />
                <span>Begin Reading</span>
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Keyboard Navigation Hint */}
      <motion.div
        className="text-center text-purple-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Use arrow keys to navigate • Enter to start reading • Escape to reset
      </motion.div>
    </div>
  );
};
