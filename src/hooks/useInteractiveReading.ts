'use client';

import { useState, useCallback, useRef } from 'react';
import { InteractionPrompt, UserResponse, InteractionSession } from '@/types/UserInteraction';
import { memoryLogger } from '@/lib/mem/memoryLogger';
import { PersonaLearnerAgent } from '@/agents/PersonaLearner';
import { InteractionSessionReadingType, PromptType, PersonaInsightSource } from '@/constants/EventTypes';

interface UseInteractiveReadingOptions {
  userId: string;
  sessionId: string;
  readerId: string;
  readingType: InteractionSessionReadingType;
  // eslint-disable-next-line no-unused-vars
  onInsightGenerated?: (insights: string[], traits: string[]) => void;
}

export const useInteractiveReading = ({
  userId,
  sessionId,
  readerId,
  readingType,
  onInsightGenerated
}: UseInteractiveReadingOptions) => {
  const [currentPrompt, setCurrentPrompt] = useState<InteractionPrompt | null>(null);
  const [promptQueue, setPromptQueue] = useState<InteractionPrompt[]>([]);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sessionRef = useRef<InteractionSession>({
    sessionId,
    userId,
    readerId,
    readingType,
    startTime: new Date().toISOString(),
    prompts: [],
    responses: [],
    insights: [],
    memoryKeys: []
  });

  const personaLearner = useRef(new PersonaLearnerAgent());

  const queuePrompt = useCallback((prompt: InteractionPrompt) => {
    setPromptQueue(prev => [...prev, prompt]);
    sessionRef.current.prompts.push(prompt);
  }, []);

  const showNextPrompt = useCallback(() => {
    if (promptQueue.length > 0 && !currentPrompt) {
      const nextPrompt = promptQueue[0];
      setPromptQueue(prev => prev.slice(1));
      setCurrentPrompt(nextPrompt);
    }
  }, [promptQueue, currentPrompt]);

  const handleResponse = useCallback(async (response: UserResponse) => {
    setIsProcessing(true);
    
    try {
      // Store response
      setResponses(prev => [...prev, response]);
      sessionRef.current.responses.push(response);

      // Log to memory system
      await memoryLogger.logInteraction(response);

      // Process with PersonaLearner
      const promptType = currentPrompt?.type || 'unknown';
      const { insights, traits } = await personaLearner.current.processInteractiveResponse(
        userId,
        sessionId,
        promptType,
        response.response,
        response.responseTime,
        response.metadata
      );

      // Store insights in session
      const personaInsights = insights.map((insight, index) => ({
        trait: traits[index] || 'general',
        confidence: 0.8,
        source: PersonaInsightSource.READING_RESPONSE,
        timestamp: new Date().toISOString(),
        context: insight
      }));

      sessionRef.current.insights.push(...personaInsights);

      // Callback for real-time insights
      if (onInsightGenerated && (insights.length > 0 || traits.length > 0)) {
        onInsightGenerated(insights, traits);
      }

      // Clear current prompt
      setCurrentPrompt(null);

      // Auto-show next prompt after delay
      setTimeout(() => {
        showNextPrompt();
      }, 2000);

    } catch (error) {
      console.error('Error processing interactive response:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentPrompt, userId, sessionId, onInsightGenerated, showNextPrompt]);

  const endSession = useCallback(async () => {
    try {
      sessionRef.current.endTime = new Date().toISOString();
      await memoryLogger.logSession(sessionRef.current);
      
      // Clear state
      setCurrentPrompt(null);
      setPromptQueue([]);
    } catch (error) {
      console.error('Error ending interactive session:', error);
    }
  }, []);

  const skipCurrentPrompt = useCallback(() => {
    setCurrentPrompt(null);
    setTimeout(showNextPrompt, 500);
  }, [showNextPrompt]);

  const generateContextualPrompts = useCallback((
    context: {
      cardName?: string;
      cardMeaning?: string;
      position?: string;
      spreadType?: string;
      transitAspect?: string;
    }
  ): InteractionPrompt[] => {
    const prompts: InteractionPrompt[] = [];

    if (context.cardName && readingType === InteractionSessionReadingType.TAROT) {
      // Card-specific reflection prompt
      prompts.push({
        id: `reflection_${context.cardName}_${Date.now()}`,
        type: PromptType.REFLECTION,
        question: `The ${context.cardName} appeared in your reading. What emotions or thoughts does this card bring up for you?`,
        context: `This card often represents ${context.cardMeaning}`,
        metadata: {
          cardName: context.cardName,
          cardPosition: context.position,
          spreadType: context.spreadType
        }
      });

      // Follow-up binary prompt based on card energy
      const cardEnergy = context.cardMeaning?.toLowerCase() || '';
      if (cardEnergy.includes('change') || cardEnergy.includes('new')) {
        prompts.push({
          id: `binary_change_${Date.now()}`,
          type: PromptType.BINARY,
          question: 'Are you currently going through a significant change in your life?',
          metadata: {
            cardName: context.cardName,
            theme: 'change'
          }
        });
      }
    }

    if (context.transitAspect && readingType === InteractionSessionReadingType.ASTROLOGY) {
      prompts.push({
        id: `astro_reflection_${Date.now()}`,
        type: PromptType.SCALE,
        question: 'How much do you feel this cosmic influence in your life right now?',
        context: `Current transit: ${context.transitAspect}`,
        minValue: 1,
        maxValue: 10,
        labels: {
          min: 'Not at all',
          max: 'Very strongly'
        },
        metadata: {
          transitAspect: context.transitAspect
        }
      });
    }

    return prompts;
  }, [readingType]);

  return {
    // State
    currentPrompt,
    promptQueue: promptQueue.length,
    responses: responses.length,
    isProcessing,

    // Actions
    queuePrompt,
    showNextPrompt,
    handleResponse,
    skipCurrentPrompt,
    endSession,
    generateContextualPrompts,

    // Data
    sessionData: sessionRef.current,
    allResponses: responses
  };
};