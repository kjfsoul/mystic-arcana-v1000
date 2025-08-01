'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Lightbulb, 
  Heart, 
  Briefcase, 
  Sparkles, 
  Moon, 
  Sun, 
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  Share,
  Download,
  Eye,
  Brain,
  Compass
} from 'lucide-react';
import { TarotCard } from '@/types/tarot';
import { SpreadType } from './EnhancedTarotSpreadLayouts';

interface InterpretationContext {
  spread: SpreadType;
  position: number;
  isReversed: boolean;
  adjacentCards?: TarotCard[];
  overallTheme?: string;
}

interface DynamicInterpretationPanelProps {
  selectedCard?: TarotCard;
  selectedPosition?: number;
  allCards: TarotCard[];
  spreadType: SpreadType;
  onCardSelect?: (card: TarotCard, position: number) => void;
  onClose?: () => void;
  className?: string;
}

interface InterpretationSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  relevance: number; // 0-1 scale
}

export const DynamicInterpretationPanel: React.FC<DynamicInterpretationPanelProps> = ({
  selectedCard,
  selectedPosition = 0,
  allCards,
  spreadType,
  onCardSelect,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'meaning' | 'context' | 'guidance' | 'connections'>('meaning');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showReversedMeaning, setShowReversedMeaning] = useState(false);
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core-meaning']));

  // Position meanings for different spreads
  const positionMeanings = {
    'single': ['Your guidance'],
    'three-card': ['Past influences', 'Present moment', 'Future potential'],
    'celtic-cross': [
      'Present situation',
      'Challenge/Opportunity',
      'Distant past',
      'Recent past', 
      'Possible outcome',
      'Near future',
      'Your approach',
      'External influences',
      'Hopes and fears',
      'Final outcome'
    ],
    'horseshoe': [
      'Past influences',
      'Present situation', 
      'Hidden factors',
      'Guidance offered',
      'Likely outcome'
    ],
    'relationship': [
      'Your energy',
      'Their energy',
      'Connection between you',
      'Challenges to address',
      'Relationship potential'
    ],
    'custom': ['Custom position']
  };

  // Generate dynamic interpretation sections
// eslint-disable-next-line react-hooks/exhaustive-deps
  const interpretationSections = useMemo((): InterpretationSection[] => {
    if (!selectedCard) return [];

    const context: InterpretationContext = {
      spread: spreadType,
      position: selectedPosition,
      isReversed: selectedCard.isReversed || false,
      adjacentCards: allCards.filter((_, index) => index !== selectedPosition),
      overallTheme: determineOverallTheme(allCards)
    };

    return [
      {
        id: 'core-meaning',
        title: 'Core Meaning',
        icon: Book,
        content: generateCoreMeaning(selectedCard, context),
        relevance: 1.0
      },
      {
        id: 'position-context',
        title: 'Position Context',
        icon: Compass,
        content: generatePositionContext(selectedCard, context),
        relevance: 0.9
      },
      {
        id: 'emotional-guidance',
        title: 'Emotional Guidance', 
        icon: Heart,
        content: generateEmotionalGuidance(selectedCard, context),
        relevance: 0.8
      },
      {
        id: 'practical-advice',
        title: 'Practical Advice',
        icon: Lightbulb,
        content: generatePracticalAdvice(selectedCard, context),
        relevance: 0.85
      },
      {
        id: 'career-insights',
        title: 'Career & Goals',
        icon: Briefcase,
        content: generateCareerInsights(selectedCard, context),
        relevance: 0.7
      },
      {
        id: 'spiritual-wisdom',
        title: 'Spiritual Wisdom',
        icon: Star,
        content: generateSpiritualWisdom(selectedCard, context),
        relevance: 0.75
      },
      {
        id: 'shadow-aspects',
        title: 'Shadow & Challenges',
        icon: Moon,
        content: generateShadowAspects(selectedCard, context),
        relevance: 0.6
      },
      {
        id: 'timing-energy',
        title: 'Timing & Energy',
        icon: Sun,
        content: generateTimingEnergy(selectedCard, context),
        relevance: 0.65
      }
    ].sort((a, b) => b.relevance - a.relevance);
  }, [selectedCard, selectedPosition, allCards, spreadType]);

  // Helper function to determine overall theme
  function determineOverallTheme(cards: TarotCard[]): string {
    const majorArcanaCount = cards.filter(card => card.arcana_type === 'major').length;
    const totalCards = cards.length;
    
    if (majorArcanaCount / totalCards > 0.6) {
      return 'spiritual-transformation';
    } else if (cards.some(card => card.suit === 'hearts' || card.suit === 'cups')) {
      return 'emotional-journey';
    } else if (cards.some(card => card.suit === 'pentacles' || card.suit === 'coins')) {
      return 'material-focus';
    } else {
      return 'balanced-reading';
    }
  }

  // Content generation functions
  function generateCoreMeaning(card: TarotCard, context: InterpretationContext): string {
    const baseMeaning = context.isReversed ? card.meaning.reversed : card.meaning.upright;
    const keywords = card.keywords ? card.keywords.join(', ') : '';
    
    return `${baseMeaning}\n\nKey themes: ${keywords}\n\n${context.isReversed ? 'In its reversed position, this card suggests a need to look inward and address internal blocks or resistance to the card\'s upright energy.' : 'In its upright position, this card\'s energy flows freely and encourages you to embrace its positive aspects.'}`;
  }

  function generatePositionContext(card: TarotCard, context: InterpretationContext): string {
    const positionName = positionMeanings[context.spread]?.[context.position] || `Position ${context.position + 1}`;
    const baseMeaning = context.isReversed ? card.meaning.reversed : card.meaning.upright;
    
    return `As the "${positionName}" in your ${context.spread.replace('-', ' ')} spread, ${card.name} ${context.isReversed ? '(reversed)' : ''} suggests: ${baseMeaning}\n\nThis position represents a crucial aspect of your current situation and offers specific guidance for this area of your life.`;
  }

  function generateEmotionalGuidance(card: TarotCard, context: InterpretationContext): string {
    const emotionalKeywords = ['love', 'fear', 'joy', 'anxiety', 'peace', 'anger', 'compassion', 'grief'];
    const cardKeywords = card.keywords ? card.keywords.filter(k => emotionalKeywords.some(ek => k.toLowerCase().includes(ek))) : [];
    
    const baseGuidance = `${card.name} invites you to explore your emotional landscape with curiosity and compassion.`;
    
    if (context.isReversed) {
      return `${baseGuidance} In its reversed position, this card may indicate emotional blocks or the need to process difficult feelings. Take time for inner healing and self-reflection.`;
    } else {
      return `${baseGuidance} This card encourages emotional growth and suggests that your feelings are valid guides in this situation.`;
    }
  }

  function generatePracticalAdvice(card: TarotCard, context: InterpretationContext): string {
    const practicalActions = [
      'Consider taking concrete steps toward your goals',
      'Focus on practical solutions to current challenges', 
      'Trust your intuition while making logical decisions',
      'Seek balance between action and reflection',
      'Pay attention to timing and opportunities'
    ];
    
    const randomAdvice = practicalActions[Math.floor(Math.random() * practicalActions.length)];
    return `${card.name} suggests: ${randomAdvice}. ${context.isReversed ? 'However, be aware of potential obstacles or the need to adjust your approach.' : 'The energy is favorable for moving forward with confidence.'}`;
  }

  function generateCareerInsights(card: TarotCard, context: InterpretationContext): string {
    if (card.arcana === 'major') {
      return `Major Arcana cards in career readings often indicate significant professional transformation or calling. ${card.name} suggests this is a pivotal time for your professional growth and development.`;
    } else {
      const suitInsights = {
        'wands': 'creativity, passion, and new ventures',
        'swords': 'communication, strategy, and intellectual challenges', 
        'cups': 'relationships, teamwork, and emotional intelligence',
        'pentacles': 'material success, stability, and practical achievements'
      };
      
      const insight = suitInsights[card.suit as keyof typeof suitInsights] || 'professional development';
      return `In your career, this card emphasizes ${insight}. ${context.isReversed ? 'Consider what internal or external factors might be blocking your professional progress.' : 'The energy supports growth and advancement in this area.'}`;
    }
  }

  function generateSpiritualWisdom(card: TarotCard, context: InterpretationContext): string {
    const spiritualThemes = [
      'divine timing and trust in the universe',
      'inner wisdom and intuitive guidance',
      'connection to your higher self',
      'lessons from the soul\'s journey',
      'spiritual growth and awakening'
    ];
    
    const theme = spiritualThemes[Math.floor(Math.random() * spiritualThemes.length)];
    return `From a spiritual perspective, ${card.name} speaks to ${theme}. ${context.isReversed ? 'This may be a time for inner reflection and spiritual healing.' : 'You are supported by spiritual forces and encouraged to trust your path.'}`;
  }

  function generateShadowAspects(card: TarotCard, context: InterpretationContext): string {
    return `Every card contains both light and shadow aspects. ${card.name} may reveal hidden fears, limiting beliefs, or unconscious patterns that need attention. ${context.isReversed ? 'The reversed position suggests these shadow aspects are particularly active now.' : 'Acknowledge these aspects with compassion while focusing on growth and integration.'}`;
  }

  function generateTimingEnergy(card: TarotCard, context: InterpretationContext): string {
    const timingMap = {
      'wands': 'spring energy - time for new beginnings and quick action',  
      'cups': 'summer energy - emotional fulfillment and relationship focus',
      'swords': 'autumn energy - mental clarity and decisive communication',
      'pentacles': 'winter energy - patience, persistence, and material manifestation'
    };
    
    const timing = timingMap[card.suit as keyof typeof timingMap] || 'divine timing at work';
    return `The energy of ${card.name} suggests ${timing}. ${context.isReversed ? 'There may be delays or a need to slow down and reassess timing.' : 'The cosmic timing supports your intentions and actions.'}`;
  }

  // Audio narration (placeholder)
// eslint-disable-next-line react-hooks/exhaustive-deps
  const playAudio = useCallback((text: string) => {
    if (isAudioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, [isAudioEnabled]);

  // Section management
// eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleBookmark = useCallback((sectionId: string) => {
    setBookmarkedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  if (!selectedCard) {
    return (
      <motion.div
        className={`flex items-center justify-center h-64 text-purple-400 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-4">
          <Eye className="w-12 h-12 mx-auto opacity-50" />
          <p>Select a card to explore its meaning</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-lg rounded-2xl border border-purple-500/30 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-16 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg"
              whileHover={{ scale: 1.05, rotateY: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {selectedCard.card_number || selectedCard.name.charAt(0)}
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>{selectedCard.name}</span>
                {selectedCard.isReversed && (
                  <motion.div
                    className="text-yellow-400"
                    animate={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.div>
                )}
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-purple-300 text-sm">
                  {positionMeanings[spreadType]?.[selectedPosition] || `Position ${selectedPosition + 1}`}
                </span>
                <span className="text-purple-400 text-sm">•</span>
                <span className="text-purple-300 text-sm capitalize">
                  {selectedCard.arcana} Arcana
                </span>
                {selectedCard.suit && (
                  <>
                    <span className="text-purple-400 text-sm">•</span>
                    <span className="text-purple-300 text-sm capitalize">
                      {selectedCard.suit}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              className={`p-2 rounded-lg transition-colors ${isAudioEnabled ? 'bg-purple-600 text-white' : 'bg-purple-600/30 text-purple-300'}`}
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>
            {onClose && (
              <motion.button
                className="p-2 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-purple-900/50 rounded-lg p-1">
          {[
            { id: 'meaning', label: 'Meaning', icon: Book },
            { id: 'context', label: 'Context', icon: Compass },
            { id: 'guidance', label: 'Guidance', icon: Lightbulb },
            { id: 'connections', label: 'Connections', icon: Brain }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-purple-600/50'
              }`}
              onClick={() => setActiveTab(id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'meaning' && (
              <div className="space-y-6">
                {interpretationSections.slice(0, 4).map((section) => (
                  <motion.div
                    key={section.id}
                    className="bg-purple-900/30 rounded-lg border border-purple-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 text-left"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <section.icon className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-white">{section.title}</span>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full ${
                                i < section.relevance * 5 ? 'bg-purple-400' : 'bg-purple-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className={`p-1 rounded ${bookmarkedSections.has(section.id) ? 'text-yellow-400' : 'text-purple-400'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(section.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Bookmark className="w-4 h-4" />
                        </motion.button>
                        <ChevronRight 
                          className={`w-5 h-5 text-purple-400 transition-transform ${
                            expandedSections.has(section.id) ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.has(section.id) && (
                        <motion.div
                          className="px-4 pb-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-purple-200 leading-relaxed whitespace-pre-line">
                            {section.content}
                          </p>
                          {isAudioEnabled && (
                            <motion.button
                              className="mt-3 flex items-center space-x-2 text-purple-400 hover:text-purple-300 text-sm"
                              onClick={() => playAudio(section.content)}
                              whileHover={{ scale: 1.05 }}
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Listen</span>
                            </motion.button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'context' && (
              <div className="space-y-4">
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                    <Compass className="w-5 h-5 text-purple-400" />
                    <span>Spread Context</span>
                  </h3>
                  <p className="text-purple-200 leading-relaxed">
                    {generatePositionContext(selectedCard, {
                      spread: spreadType,
                      position: selectedPosition,
                      isReversed: selectedCard.isReversed || false
                    })}
                  </p>
                </div>
                
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Card Navigation</h3>
                  <div className="flex items-center justify-between">
                    <motion.button
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600/30 rounded-lg text-purple-300 hover:bg-purple-600/50 transition-colors"
                      onClick={() => {
                        const prevIndex = selectedPosition > 0 ? selectedPosition - 1 : allCards.length - 1;
                        onCardSelect?.(allCards[prevIndex], prevIndex);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </motion.button>
                    
                    <span className="text-purple-400 text-sm">
                      {selectedPosition + 1} of {allCards.length}
                    </span>
                    
                    <motion.button
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600/30 rounded-lg text-purple-300 hover:bg-purple-600/50 transition-colors"
                      onClick={() => {
                        const nextIndex = selectedPosition < allCards.length - 1 ? selectedPosition + 1 : 0;
                        onCardSelect?.(allCards[nextIndex], nextIndex);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guidance' && (
              <div className="space-y-4">
                {interpretationSections.filter(s => ['emotional-guidance', 'practical-advice', 'spiritual-wisdom'].includes(s.id)).map((section) => (
                  <div key={section.id} className="bg-purple-900/30 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                      <section.icon className="w-5 h-5 text-purple-400" />
                      <span>{section.title}</span>
                    </h3>
                    <p className="text-purple-200 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-white mb-4">Card Relationships</h3>
                <div className="grid grid-cols-2 gap-4">
                  {allCards.filter((_, index) => index !== selectedPosition).slice(0, 4).map((card, index) => (
                    <motion.button
                      key={card.id}
                      className="bg-purple-900/30 rounded-lg p-3 text-left hover:bg-purple-600/30 transition-colors"
                      onClick={() => onCardSelect?.(card, allCards.indexOf(card))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <h4 className="font-medium text-white text-sm">{card.name}</h4>
                      <p className="text-purple-300 text-xs mt-1">
                        {positionMeanings[spreadType]?.[allCards.indexOf(card)] || `Position ${allCards.indexOf(card) + 1}`}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600/30 rounded-lg text-purple-300 hover:bg-purple-600/50 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600/30 rounded-lg text-purple-300 hover:bg-purple-600/50 transition-colors text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
        
        <div className="text-purple-400 text-xs">
          {bookmarkedSections.size} bookmarked
        </div>
      </div>
    </motion.div>
  );
};