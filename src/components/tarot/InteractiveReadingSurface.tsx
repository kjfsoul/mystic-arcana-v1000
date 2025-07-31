'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Shuffle, Save, Share, RefreshCw, BookOpen, Sparkles, Eye, EyeOff } from 'lucide-react';
import { EnhancedTarotSpreadLayouts, SpreadType } from './EnhancedTarotSpreadLayouts';
import { EnhancedShuffleAnimation } from './EnhancedShuffleAnimation';
import { TarotCard } from '@/types/tarot';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SophiaAgent, 
  SophiaReading, 
  ConversationState, 
  ConversationTurn, 
  ConversationOption,
  InteractiveQuestion 
} from '@/agents/sophia';
import { PersonaLearnerAgent } from '@/agents/PersonaLearner';
import { VirtualReaderDisplay } from '@/components/readers/VirtualReaderDisplay';

interface ReadingSession {
  id: string;
  spreadType: SpreadType;
  cards: TarotCard[];
  timestamp: Date;
  interpretation?: string;
  journalEntry?: string;
  isGuest: boolean;
  sophiaReading?: SophiaReading;
}

interface InteractiveReadingSurfaceProps {
  selectedSpread: SpreadType;
  onReadingComplete?: (session: ReadingSession) => void;
  onBackToSelection?: () => void;
  className?: string;
}

export const InteractiveReadingSurface: React.FC<InteractiveReadingSurfaceProps> = ({
  selectedSpread,
  onReadingComplete,
  onBackToSelection,
  className = ''
}) => {
  // State management - Enhanced for conversational flow
  const [phase, setPhase] = useState<'preparation' | 'shuffling' | 'drawing' | 'revealing' | 'conversation' | 'interpreting' | 'complete'>('preparation');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [currentSession, setCurrentSession] = useState<ReadingSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Additional state for legacy Sophia reading display
  const [sophiaReading, setSophiaReading] = useState<SophiaReading | null>(null);
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [showAllMeanings, setShowAllMeanings] = useState(false);
  const [cardInterpretations, setCardInterpretations] = useState<Record<number, string>>({});
  
  // Conversational state
  const [conversationState, setConversationState] = useState<ConversationState>(ConversationState.AWAITING_DRAW);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<ConversationTurn | null>(null);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [finalReading, setFinalReading] = useState<SophiaReading | null>(null);
  
  // Progressive Reveal System state
  const [engagementLevelUp, setEngagementLevelUp] = useState<{
    show: boolean;
    newLevel: number;
    thresholdMet: string;
  } | null>(null);
  
  // Agent instances
  const sophiaAgent = new SophiaAgent();
  const personaLearner = new PersonaLearnerAgent();
  
  // Refs and animations
  const surfaceRef = useRef<HTMLDivElement>(null);
  const shuffleControls = useAnimation();
  
  // Auth context
  const { user, isAuthenticated } = useAuth();

  // Spread configuration mapping
  const spreadRequirements = {
    'single': 1,
    'three-card': 3,
    'celtic-cross': 10,
    'horseshoe': 5,
    'relationship': 5,
    'custom': 7
  };

  // Initialize reading session
  useEffect(() => {
    const sessionId = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: ReadingSession = {
      id: sessionId,
      spreadType: selectedSpread,
      cards: [],
      timestamp: new Date(),
      isGuest: !isAuthenticated
    };
    setCurrentSession(newSession);
  }, [selectedSpread, isAuthenticated]);

  // API call to draw cards
  const drawCardsFromAPI = useCallback(async (spreadType: SpreadType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread: spreadType,
          count: spreadRequirements[spreadType],
          allowReversed: true,
          userId: user?.id || null
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to draw cards');
      }

      return data.data.cards;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to cosmic energies';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle shuffle completion and card drawing
  const handleShuffleComplete = useCallback(async () => {
    try {
      setPhase('drawing');
      const cards = await drawCardsFromAPI(selectedSpread);
      
      setDrawnCards(cards);
      setPhase('revealing');
      
      // Update session
      if (currentSession) {
        const updatedSession = { ...currentSession, cards };
        setCurrentSession(updatedSession);
      }
      
      // Auto-start revealing after a brief pause
      setTimeout(() => {
        setRevealedCards(new Set([0])); // Reveal first card
      }, 800);
      
    } catch (err) {
      setPhase('preparation');
      console.error('Failed to draw cards:', err);
    }
  }, [selectedSpread, drawCardsFromAPI, currentSession]);

  // Handle individual card reveal
  const handleCardReveal = useCallback((card: TarotCard, index: number) => {
    setRevealedCards(prev => new Set([...prev, index]));
    
    // Generate basic interpretation for the card
    const interpretation = generateCardInterpretation(card, index, selectedSpread);
    setCardInterpretations(prev => ({ ...prev, [index]: interpretation }));
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(75);
    }
    
    // Check if all cards are revealed
    const totalCards = spreadRequirements[selectedSpread];
    if (revealedCards.size + 1 >= totalCards) {
      setTimeout(() => setPhase('interpreting'), 1000);
    }
  }, [revealedCards.size, selectedSpread]);

  // Generate contextual card interpretation
  const generateCardInterpretation = (card: TarotCard, position: number, spread: SpreadType): string => {
    const positionMeanings = {
      'single': ['This card represents the universe\'s guidance for you right now.'],
      'three-card': [
        'This card reveals the foundations and influences from your past.',
        'This card illuminates your current situation and energy.',
        'This card shows the potential path ahead and future possibilities.'
      ],
      'celtic-cross': [
        'Your present situation and current focus.',
        'The challenge or opportunity crossing your path.',
        'Distant past influences and foundations.',
        'Recent past events affecting you now.',
        'Possible outcomes if current path continues.',
        'Immediate future and next steps.',
        'Your approach and inner resources.',
        'External influences and environment.',
        'Your hopes, fears, and subconscious.',
        'The ultimate outcome and resolution.'
      ]
    };

    const positionContext = positionMeanings[spread]?.[position] || `Position ${position + 1} guidance:`;
    const meaning = card.isReversed ? card.meaning_reversed : card.meaning_upright;
    
    return `${positionContext} ${meaning}`;
  };

  // Conversational Flow Methods
  
  /**
   * Start the conversational reading flow
   */
  const startConversation = useCallback(async () => {
    if (!currentSession || drawnCards.length === 0) return;
    
    try {
      setIsProcessingTurn(true);
      setPhase('conversation');
      
      const context = {
        userId: user?.id,
        spreadType: selectedSpread,
        sessionId: currentSession.id,
        timestamp: new Date()
      };

      const turn = await sophiaAgent.processReadingTurn(
        currentSession.id,
        ConversationState.AWAITING_DRAW,
        undefined,
        drawnCards,
        context
      );

      setCurrentTurn(turn);
      setConversationState(turn.newState);
      setConversationHistory([turn]);
      
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Unable to begin the reading conversation. Please try again.');
    } finally {
      setIsProcessingTurn(false);
    }
  }, [currentSession, drawnCards, selectedSpread, user?.id, sophiaAgent]);

  /**
   * Process user input and advance conversation
   */
  const handleUserInput = useCallback(async (userInput: string) => {
    if (!currentSession || isProcessingTurn) return;
    
    const responseStartTime = Date.now();
    
    try {
      setIsProcessingTurn(true);
      
      // Log user response for learning (authenticated users only)
      if (user?.id && currentTurn?.options) {
        await personaLearner.logUserResponse(
          user.id,
          currentSession.id,
          userInput,
          {
            options_presented: currentTurn.options.map(opt => opt.text),
            response_time_ms: Date.now() - responseStartTime,
            conversation_state: conversationState
          }
        );
      }
      
      const turn = await sophiaAgent.processReadingTurn(
        currentSession.id,
        conversationState,
        userInput
      );

      setCurrentTurn(turn);
      setConversationState(turn.newState);
      setConversationHistory(prev => [...prev, turn]);
      
      // Log conversation turn for learning (authenticated users only)
      if (user?.id) {
        await personaLearner.logConversationTurn(
          user.id,
          currentSession.id,
          turn.newState,
          conversationHistory.length + 1,
          turn.sophiaDialogue,
          userInput,
          turn.revealedCard
        );
      }
      
      // If we have a final reading, update phase
      if (turn.finalReading) {
        setFinalReading(turn.finalReading);
        setPhase('complete');
      }
      
      // Update revealed cards if a card was revealed in this turn
      if (turn.revealedCard) {
        const cardIndex = drawnCards.findIndex(card => card.name === turn.revealedCard!.card.name);
        if (cardIndex !== -1) {
          setRevealedCards(prev => new Set([...prev, cardIndex]));
          
          // Log card reveal engagement (authenticated users only)
          if (user?.id) {
            await personaLearner.logCardReveal(
              user.id,
              currentSession.id,
              turn.revealedCard.card.name,
              cardIndex,
              {
                clicked: true,
                interpretation_read: true
              }
            );
          }
        }
      }
      
    } catch (error) {
      console.error('Failed to process conversation turn:', error);
      setError('Unable to process your response. Please try again.');
    } finally {
      setIsProcessingTurn(false);
    }
  }, [currentSession, conversationState, isProcessingTurn, sophiaAgent, drawnCards, user, currentTurn, personaLearner, conversationHistory.length]);

  /**
   * Handle saving the conversational reading with engagement level check
   */
  const handleSaveConversationalReading = useCallback(async () => {
    if (!finalReading || !user?.id) return;

    try {
      const response = await fetch('/api/tarot/save-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getAccessToken()}`
        },
        body: JSON.stringify({
          userId: user.id,
          spreadType: selectedSpread,
          cards: drawnCards.map(card => ({
            id: card.id,
            name: card.name,
            position: drawnCards.indexOf(card).toString(),
            isReversed: card.isReversed,
            meaning: card.isReversed ? card.meaning_reversed : card.meaning_upright
          })),
          interpretation: finalReading.overall_guidance,
          question: '',
          notes: 'Conversational reading with Sophia',
          cosmicInfluence: finalReading.spiritual_insight,
          drawId: currentSession?.id,
          isPublic: false,
          tags: ['sophia', 'conversational', selectedSpread]
        })
      });

      if (response.ok) {
        setShowSaveModal(false);
        
        // Check and increment engagement level after successful save
        await checkEngagementLevel();
        
        // Optionally show success message
      } else {
        throw new Error('Failed to save reading');
      }
    } catch (error) {
      console.error('Failed to save conversational reading:', error);
      setError('Unable to save your reading. Please try again.');
    }
  }, [finalReading, user, selectedSpread, drawnCards, currentSession]);

  /**
   * Check and increment user engagement level (Progressive Reveal System)
   */
  const checkEngagementLevel = useCallback(async () => {
    if (!user?.id) return; // Skip for guest users
    
    try {
      console.log('InteractiveReadingSurface: Checking engagement level after reading completion');
      
      const result = await personaLearner.checkAndIncrementEngagementLevel(user.id);
      
      if (result.levelIncreased) {
        console.log(`InteractiveReadingSurface: User leveled up! ${result.previousLevel} → ${result.newLevel} (${result.thresholdMet})`);
        
        // Show level up notification
        setEngagementLevelUp({
          show: true,
          newLevel: result.newLevel,
          thresholdMet: result.thresholdMet || 'Level Up!'
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setEngagementLevelUp(null);
        }, 5000);
      } else {
        console.log(`InteractiveReadingSurface: No level increase. Current level: ${result.newLevel}`);
      }
    } catch (error) {
      console.error('InteractiveReadingSurface: Failed to check engagement level:', error);
    }
  }, [personaLearner, user?.id]);

  // Auto-start conversation when cards are drawn
  useEffect(() => {
    if (phase === 'drawing' && drawnCards.length === spreadRequirements[selectedSpread]) {
      // Wait a moment for cards to be displayed, then start conversation
      const timer = setTimeout(() => {
        startConversation();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [phase, drawnCards.length, selectedSpread, startConversation]);

  // Handle save reading with PersonaLearner integration
  const handleSaveReading = useCallback(async (journalEntry?: string, userFeedback?: any) => {
    if (!currentSession) return;
    
    const sessionWithJournal = {
      ...currentSession,
      journalEntry,
      interpretation: sophiaReading ? 
        `${sophiaReading.narrative}\n\n${sophiaReading.overall_guidance}\n\n${sophiaReading.spiritual_insight}` :
        Object.values(cardInterpretations).join('\n\n'),
      cards: drawnCards,
      sophiaReading
    };
    
    // Log interaction with PersonaLearner for learning (authenticated users only)
    if (sophiaReading && user?.id) {
      try {
        await personaLearner.logInteraction(
          user.id,
          sophiaReading,
          userFeedback
        );
        console.log('PersonaLearner: Interaction logged successfully');
      } catch (error) {
        console.warn('PersonaLearner: Failed to log interaction:', error);
        // Continue with save even if logging fails
      }
    } else if (!user?.id) {
      console.log('PersonaLearner: Skipping interaction logging for guest user');
    }
    
    // Save to localStorage for guest users or API for authenticated users
    if (isAuthenticated && user) {
      try {
        // TODO: Implement API call to save reading
        console.log('Saving to user account:', sessionWithJournal);
        
        // Check engagement level after successful save
        await checkEngagementLevel();
        
      } catch (err) {
        console.error('Failed to save reading:', err);
      }
    } else {
      // Save to localStorage for guest users
      const guestReadings = JSON.parse(localStorage.getItem('guestReadings') || '[]');
      guestReadings.push(sessionWithJournal);
      localStorage.setItem('guestReadings', JSON.stringify(guestReadings.slice(-10))); // Keep last 10
    }
    
    onReadingComplete?.(sessionWithJournal);
    setShowSaveModal(false);
  }, [currentSession, cardInterpretations, drawnCards, isAuthenticated, user, onReadingComplete, sophiaReading, personaLearner]);

  // Auto-reveal cards in sequence and generate Sophia reading
  useEffect(() => {
    if (phase === 'revealing' && drawnCards.length > 0) {
      const totalCards = drawnCards.length;
      let currentCard = 0;
      
      const revealInterval = setInterval(() => {
        if (currentCard < totalCards) {
          setRevealedCards(prev => new Set([...prev, currentCard]));
          currentCard++;
        } else {
          clearInterval(revealInterval);
          setTimeout(async () => {
            setPhase('interpreting');
            await generateSophiaReading();
          }, 1000);
        }
      }, 1200);
      
      return () => clearInterval(revealInterval);
    }
  }, [phase, drawnCards.length]);

  // Generate Sophia reading from Knowledge Pool
  const generateSophiaReading = async () => {
    if (!drawnCards.length || !currentSession) return;
    
    setIsGeneratingReading(true);
    
    try {
      const readingContext = {
        userId: user?.id,
        spreadType: selectedSpread,
        sessionId: currentSession.id,
        timestamp: new Date(),
        astrological_context: {
          // TODO: Add astrological context if available
        }
      };
      
      const reading = await sophiaAgent.getReading(
        drawnCards,
        selectedSpread,
        readingContext
      );
      
      setSophiaReading(reading);
      
      // Update session with Sophia reading
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          sophiaReading: reading,
          interpretation: reading.narrative + '\n\n' + reading.overall_guidance
        };
        setCurrentSession(updatedSession);
      }
      
    } catch (error) {
      console.error('Failed to generate Sophia reading:', error);
      // Fallback to basic interpretations if Sophia reading fails
      const fallbackInterpretations: Record<number, string> = {};
      drawnCards.forEach((card, index) => {
        fallbackInterpretations[index] = generateCardInterpretation(card, index, selectedSpread);
      });
      setCardInterpretations(fallbackInterpretations);
    } finally {
      setIsGeneratingReading(false);
    }
  };

  // Phase-specific renders
  const renderPreparation = () => (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="space-y-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Prepare Your Mind
        </motion.h2>
        <p className="text-purple-300 text-lg max-w-2xl mx-auto">
          Take a moment to center yourself and focus on your question. 
          The cards will reveal what you need to know.
        </p>
      </div>
      
      {/* Meditation Timer */}
      <motion.div
        className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-purple-300 font-semibold mb-4">
          {selectedSpread.replace('-', ' ').toUpperCase()} SPREAD
        </h3>
        <p className="text-purple-400 text-sm mb-6">
          {spreadRequirements[selectedSpread]} cards will be drawn to guide your path
        </p>
        
        <motion.button
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl shadow-purple-500/30 w-full flex items-center justify-center space-x-3"
          onClick={() => setPhase('shuffling')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shuffle className="w-5 h-5" />
          <span>Begin Shuffling</span>
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderShuffling = () => (
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="space-y-4">
        <motion.h2 
          className="text-2xl md:text-3xl font-semibold text-purple-300"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Shuffling Cosmic Energies...
        </motion.h2>
        <p className="text-purple-400">
          The universe is aligning the perfect cards for your reading
        </p>
      </div>
      
      <EnhancedShuffleAnimation
        isShuffling={true}
        onShuffleStart={() => {}}
        onShuffleComplete={handleShuffleComplete}
        size="large"
        cardCount={78}
        showCardPreview={true}
      />
    </motion.div>
  );

  const renderReading = () => (
    <div className="w-full">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Your {selectedSpread.replace('-', ' ')} Reading
        </h2>
        <p className="text-purple-300">
          {phase === 'conversation' ? 'In conversation with Sophia' : `${revealedCards.size} of ${drawnCards.length} cards revealed`}
        </p>
      </motion.div>

      {/* Conversational Reading Display */}
      {phase === 'conversation' && currentTurn && (
        <motion.div
          className="mb-8 bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6"
          data-testid="conversation-phase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-purple-300 font-semibold">Sophia</h3>
              <p className="text-purple-400 text-sm">
                {conversationState === ConversationState.AWAITING_DRAW ? 'Drawing cards...' : 
                 conversationState === ConversationState.REVEALING_CARD_1 ? 'Revealing first card...' :
                 conversationState === ConversationState.REVEALING_CARD_2 ? 'Revealing second card...' :
                 conversationState === ConversationState.REVEALING_CARD_3 ? 'Revealing third card...' :
                 conversationState === ConversationState.CARD_INTERPRETATION ? 'Interpreting your cards...' :
                 conversationState === ConversationState.ASKING_QUESTION ? 'Learning about you...' :
                 conversationState === ConversationState.AWAITING_USER_RESPONSE ? 'Waiting for your response...' :
                 conversationState === ConversationState.PROVIDING_GUIDANCE ? 'Sharing guidance...' :
                 conversationState === ConversationState.FINAL_SYNTHESIS ? 'Weaving your reading together...' :
                 'In conversation with you'}
              </p>
            </div>
          </div>
          
          {/* Sophia's Dialogue */}
          <div className="space-y-4 text-purple-200">
            <div className="bg-purple-800/20 rounded-lg p-4">
              <p className="leading-relaxed">{currentTurn.sophiaDialogue}</p>
            </div>
            
            {/* Show revealed card info if present */}
            {currentTurn.revealedCard && (
              <motion.div
                className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-lg p-4 border border-purple-500/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-black" />
                  </div>
                  <h4 className="text-purple-300 font-medium">
                    {currentTurn.revealedCard.card.name}
                  </h4>
                </div>
                <p className="text-purple-200 text-sm leading-relaxed">
                  {currentTurn.revealedCard.interpretation}
                </p>
              </motion.div>
            )}
            
            {/* Interactive Question Display */}
            {currentTurn.interactiveQuestion && (
              <motion.div
                className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h4 className="text-cyan-300 font-medium mb-2">
                  {currentTurn.interactiveQuestion.question}
                </h4>
                <p className="text-cyan-200 text-sm">
                  {currentTurn.interactiveQuestion.context}
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Interactive Options */}
          {currentTurn.options && currentTurn.options.length > 0 && !isProcessingTurn && (
            <motion.div
              className="mt-6 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <h4 className="text-purple-300 font-medium">Choose your response:</h4>
              <div className="grid gap-3">
                {currentTurn.options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="bg-purple-700/30 hover:bg-purple-600/40 border border-purple-500/50 text-purple-200 p-4 rounded-lg text-left transition-all duration-200 group"
                    onClick={() => handleUserInput(option.text)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + (index * 0.1) }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="leading-relaxed">{option.text}</span>
                      <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                        →
                      </div>
                    </div>
                    {option.hint && (
                      <p className="text-purple-400 text-sm mt-2 opacity-75">
                        {option.hint}
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Processing State */}
          {isProcessingTurn && (
            <motion.div
              className="mt-6 flex items-center justify-center space-x-3 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-purple-300 text-sm">Sophia is reflecting on your response...</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Sophia Reading Display */}
      {sophiaReading && phase === 'interpreting' && (
        <motion.div
          className="mb-8 bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-purple-300 font-semibold">Sophia's Wisdom</h3>
              <p className="text-purple-400 text-sm">Reading from the Knowledge Pool</p>
            </div>
          </div>
          
          <div className="space-y-4 text-purple-200">
            <div className="bg-purple-800/20 rounded-lg p-4">
              <h4 className="text-purple-300 font-medium mb-2">Your Reading</h4>
              <p className="leading-relaxed">{sophiaReading.narrative}</p>
            </div>
            
            {showAllMeanings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="bg-purple-800/20 rounded-lg p-4">
                  <h4 className="text-purple-300 font-medium mb-2">Guidance</h4>
                  <p className="leading-relaxed">{sophiaReading.overall_guidance}</p>
                </div>
                
                <div className="bg-purple-800/20 rounded-lg p-4">
                  <h4 className="text-purple-300 font-medium mb-2">Spiritual Insight</h4>
                  <p className="leading-relaxed">{sophiaReading.spiritual_insight}</p>
                </div>
                
                {sophiaReading.card_interpretations.length > 0 && (
                  <div className="bg-purple-800/20 rounded-lg p-4">
                    <h4 className="text-purple-300 font-medium mb-3">Individual Card Meanings</h4>
                    <div className="space-y-3">
                      {sophiaReading.card_interpretations.map((interp, index) => (
                        <div key={index} className="border-l-2 border-purple-500 pl-3">
                          <p className="text-sm text-purple-400 mb-1">
                            {drawnCards[index]?.name} - {interp.confidence_score > 0.8 ? 'High' : 'Standard'} Confidence
                          </p>
                          <p className="text-purple-200 text-sm leading-relaxed">
                            {interp.personalized_guidance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            <div className="text-right">
              <p className="text-purple-400 text-sm italic">
                {sophiaReading.reader_signature}
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Loading state for Sophia reading */}
      {isGeneratingReading && (
        <motion.div
          className="mb-8 bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div
              className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-purple-300">Sophia is channeling wisdom from the Knowledge Pool...</p>
          </div>
        </motion.div>
      )}

      {/* Spread Layout - Show during revealing/interpreting phases, hide during conversation */}
      {phase !== 'conversation' && (
        <EnhancedTarotSpreadLayouts
          spreadType={selectedSpread}
          cards={drawnCards}
          onCardClick={handleCardReveal}
          isRevealing={phase === 'revealing' || phase === 'interpreting'}
          showBioluminescence={true}
          isMobile={false}
        />
      )}
      
      {/* Conversation Phase Card Display */}
      {phase === 'conversation' && drawnCards.length > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {drawnCards.map((card, index) => (
              <motion.div
                key={`conversation-card-${index}`}
                className={`relative aspect-[2/3] rounded-lg overflow-hidden ${
                  revealedCards.has(index) 
                    ? 'bg-gradient-to-br from-purple-800 to-pink-800' 
                    : 'bg-purple-900/50'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: revealedCards.has(index) ? 1 : 0.3, 
                  scale: revealedCards.has(index) ? 1 : 0.9 
                }}
                transition={{ delay: index * 0.1 }}
              >
                {revealedCards.has(index) ? (
                  <div className="p-3 h-full flex flex-col">
                    <h4 className="text-purple-200 font-medium text-sm mb-2 text-center">
                      {card.name}
                    </h4>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-black" />
                      </div>
                    </div>
                    <p className="text-purple-300 text-xs text-center mt-2">
                      {card.arcana_type === 'major' ? 'Major Arcana' : `${card.suit} - Minor`}
                    </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-purple-400/30 rounded-lg"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      {(phase === 'interpreting' || phase === 'complete') && (
        <motion.div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 flex items-center space-x-4 shadow-2xl">
            {phase === 'interpreting' && (
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                onClick={() => setShowAllMeanings(!showAllMeanings)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showAllMeanings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAllMeanings ? 'Hide' : 'Show'} Meanings</span>
              </motion.button>
            )}
            
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              onClick={() => {
                if (phase === 'complete' && finalReading) {
                  handleSaveConversationalReading();
                } else {
                  setShowSaveModal(true);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              <span>Save Reading</span>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
              onClick={onBackToSelection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Reading</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderCompleteReading = () => (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Your Complete Reading
        </h2>
        <p className="text-purple-300">
          Sophia's personalized guidance for your {selectedSpread.replace('-', ' ')} spread
        </p>
      </motion.div>

      {/* Final Reading Display */}
      {finalReading && (
        <motion.div
          className="mb-8 bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-purple-300 font-semibold text-lg">Your Personalized Reading</h3>
              <p className="text-purple-400 text-sm">Guided by {finalReading.reader_signature}</p>
            </div>
          </div>
          
          <div className="space-y-6 text-purple-200">
            {/* Reading Narrative */}
            <div className="bg-purple-800/20 rounded-lg p-5">
              <h4 className="text-purple-300 font-medium mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Your Reading
              </h4>
              <p className="leading-relaxed text-lg">{finalReading.narrative}</p>
            </div>
            
            {/* Overall Guidance */}
            <div className="bg-pink-800/20 rounded-lg p-5">
              <h4 className="text-pink-300 font-medium mb-3">Guidance & Wisdom</h4>
              <p className="leading-relaxed">{finalReading.overall_guidance}</p>
            </div>
            
            {/* Spiritual Insight */}
            <div className="bg-cyan-800/20 rounded-lg p-5">
              <h4 className="text-cyan-300 font-medium mb-3">Spiritual Insight</h4>
              <p className="leading-relaxed">{finalReading.spiritual_insight}</p>
            </div>
            
            {/* Individual Card Interpretations */}
            {finalReading.card_interpretations.length > 0 && (
              <div className="bg-purple-800/20 rounded-lg p-5">
                <h4 className="text-purple-300 font-medium mb-4">Individual Card Wisdom</h4>
                <div className="space-y-4">
                  {finalReading.card_interpretations.map((interp, index) => (
                    <motion.div
                      key={index}
                      className="border-l-3 border-purple-500 pl-4 py-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-purple-300 font-medium">
                          {drawnCards[index]?.name}
                        </h5>
                        <span className="text-xs text-purple-400 bg-purple-800/30 px-2 py-1 rounded">
                          {interp.confidence_score > 0.8 ? 'High Confidence' : 'Standard'}
                        </span>
                      </div>
                      <p className="text-purple-200 text-sm leading-relaxed mb-2">
                        {interp.personalized_guidance}
                      </p>
                      {interp.practical_advice && (
                        <p className="text-purple-300 text-xs italic">
                          💫 {interp.practical_advice}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Conversation History Summary */}
            {conversationHistory.length > 0 && (
              <motion.div
                className="bg-indigo-800/20 rounded-lg p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-indigo-300 font-medium mb-3">Your Journey with Sophia</h4>
                <p className="text-indigo-200 text-sm mb-3">
                  This reading evolved through {conversationHistory.length} meaningful exchanges
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {conversationHistory.slice(-3).map((turn, index) => (
                    <div key={index} className="text-indigo-200 text-xs p-2 bg-indigo-900/20 rounded">
                      <p className="opacity-75">"{turn.sophiaDialogue.substring(0, 100)}..."</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Cards Display */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-purple-300 font-medium mb-4 text-center">Your Cards</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {drawnCards.map((card, index) => (
            <motion.div
              key={`final-card-${index}`}
              className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-purple-800 to-pink-800 p-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="h-full flex flex-col">
                <h5 className="text-purple-200 font-medium text-sm mb-2 text-center">
                  {card.name}
                </h5>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                </div>
                <p className="text-purple-300 text-xs text-center mt-2">
                  {card.arcana_type === 'major' ? 'Major Arcana' : `${card.suit} - Minor`}
                </p>
                {card.isReversed && (
                  <p className="text-pink-300 text-xs text-center mt-1">Reversed</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  // Error state
  if (error) {
    return (
      <div className="text-center space-y-6 py-12">
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔮
        </motion.div>
        <h3 className="text-xl font-semibold text-red-300">
          Cosmic Connection Disrupted
        </h3>
        <p className="text-purple-400 max-w-md mx-auto">
          {error}
        </p>
        <motion.button
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          onClick={() => {
            setError(null);
            setPhase('preparation');
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <div ref={surfaceRef} className={`relative w-full min-h-screen ${className}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

      {/* Sophia Virtual Reader Display - Fixed Position */}
      {(phase === 'revealing' || phase === 'interpreting' || phase === 'conversation' || phase === 'complete') && (
        <motion.div 
          className="fixed top-20 left-6 z-20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
        >
          <VirtualReaderDisplay
            readerId="sophia"
            size="medium"
            showLevel={true}
            showProgress={false}
            className="shadow-2xl"
          />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {phase === 'preparation' && (
            <motion.div key="preparation">
              {renderPreparation()}
            </motion.div>
          )}
          {phase === 'shuffling' && (
            <motion.div key="shuffling">
              {renderShuffling()}
            </motion.div>
          )}
          {(phase === 'revealing' || phase === 'interpreting' || phase === 'conversation') && drawnCards.length > 0 && (
            <motion.div key="reading" className="w-full">
              {renderReading()}
            </motion.div>
          )}
          {phase === 'complete' && (
            <motion.div key="complete">
              {renderCompleteReading()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-purple-900/80 backdrop-blur-lg rounded-2xl p-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-purple-300 font-medium">
                Drawing cards from the cosmic deck...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Modal - Placeholder for now */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              className="bg-purple-900/90 backdrop-blur-lg rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Save Your Reading</h3>
              <p className="text-purple-300 mb-6">
                {isAuthenticated 
                  ? 'This reading will be saved to your account.'
                  : 'As a guest, your reading will be saved locally.'
                }
              </p>
              <div className="flex space-x-4">
                <motion.button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-colors"
                  onClick={() => handleSaveReading()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Reading
                </motion.button>
                <motion.button
                  className="px-6 py-3 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/20 transition-colors"
                  onClick={() => setShowSaveModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive Reveal Level Up Notification */}
      <AnimatePresence>
        {engagementLevelUp && engagementLevelUp.show && (
          <motion.div
            className="fixed top-6 right-6 z-50 max-w-sm"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="bg-gradient-to-r from-purple-800 to-pink-800 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Sophia Reveals Herself!</h4>
                  <p className="text-purple-200 text-sm">Level {engagementLevelUp.newLevel}</p>
                </div>
              </div>
              <p className="text-purple-200 text-sm mb-3">
                You've become a <span className="font-semibold text-gold-300">{engagementLevelUp.thresholdMet}</span>! 
                Sophia trusts you more and reveals more of herself.
              </p>
              <div className="flex justify-between items-center">
                <p className="text-purple-300 text-xs">
                  Continue your journey to see her fully revealed form
                </p>
                <motion.button
                  className="text-purple-300 hover:text-white text-xs"
                  onClick={() => setEngagementLevelUp(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ×
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};