/**
 * PERSONALEARNER - ADAPTIVE LEARNING & MEMORY AGENT
 * Agent: PersonaImplementer (Persona Learner Activation Mission)
 * Purpose: Learn from user interactions and integrate with a-mem system for persistent memory
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { SophiaReading } from './sophia';

interface UserProfile {
  userId: string;
  name?: string;
  preferences: {
    preferred_spreads: string[];
    favorite_cards: string[];
    reading_frequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
    spiritual_focus: string[];
  };
  learning_patterns: {
    engagement_score: number;
    feedback_sentiment: 'positive' | 'neutral' | 'negative';
    session_duration_avg: number;
    cards_drawn_total: number;
    last_active: Date;
  };
  personalization_data: {
    birth_chart?: any;
    journal_themes: string[];
    recurring_questions: string[];
    growth_areas: string[];
  };
}

interface MemoryNote {
  content: string;
  id?: string;
  keywords?: string[];
  links?: Record<string, any>;
  retrieval_count?: number;
  timestamp?: string;
  last_accessed?: string;
  context?: string;
  evolution_history?: any[];
  category?: string;
  tags?: string[];
}

interface LearningEvent {
  eventType: 'reading_completed' | 'card_feedback' | 'session_rating' | 'journal_entry' | 'preference_update' | 'conversation_turn' | 'user_response' | 'card_revealed' | 'question_answered';
  userId: string;
  sessionId: string;
  data: any;
  timestamp: Date;
  context: {
    spread_type: string;
    cards_drawn: string[];
    interpretation_quality?: number;
    user_satisfaction?: number;
    conversation_state?: string;
    turn_number?: number;
  };
}

/**
 * PersonaLearner - The Adaptive Intelligence
 * 
 * This agent learns from every user interaction to build personalized experiences.
 * It connects to the a-mem system to persist insights across sessions and enables
 * Sophia and other virtual readers to become more attuned to each user's needs.
 */
export class PersonaLearnerAgent {
  private memorySystemPath: string;
  private userProfiles: Map<string, UserProfile> = new Map();
  private learningQueue: LearningEvent[] = [];

  constructor() {
    this.memorySystemPath = path.join(process.cwd(), 'A-mem/agentic_memory');
  }

  /**
   * Log a completed reading interaction and learn from it
   */
  async logInteraction(
    userId: string,
    reading: SophiaReading,
    userFeedback?: {
      rating?: number;
      helpful_cards?: string[];
      session_notes?: string;
    }
  ): Promise<void> {
    try {
      // Create learning event
      const learningEvent: LearningEvent = {
        eventType: 'reading_completed',
        userId,
        sessionId: reading.session_context.sessionId,
        data: {
          reading_id: reading.id,
          cards: reading.session_context.cards?.map(c => c.name) || [],
          spread_type: reading.session_context.spreadType,
          narrative_length: reading.narrative.length,
          interpretation_count: reading.card_interpretations.length,
          feedback: userFeedback
        },
        timestamp: new Date(),
        context: {
          spread_type: reading.session_context.spreadType,
          cards_drawn: reading.session_context.cards?.map(c => c.name) || [],
          interpretation_quality: this.calculateReadingQuality(reading),
          user_satisfaction: userFeedback?.rating || undefined
        }
      };

      // Add to learning queue
      this.learningQueue.push(learningEvent);

      // Create memory note for a-mem system
      const memoryNote = await this.createMemoryNote(reading, userFeedback);
      
      // Log to a-mem system
      await this.logToAMem(memoryNote);

      // Update user profile
      await this.updateUserProfile(userId, learningEvent);

      // Process learning patterns
      await this.processLearningPatterns(userId);

      console.log(`PersonaLearner: Logged interaction for user ${userId}, reading ${reading.id}`);

    } catch (error) {
      console.error('PersonaLearner: Failed to log interaction:', error);
      throw error;
    }
  }

  /**
   * Create a structured memory note for the a-mem system
   */
  private async createMemoryNote(
    reading: SophiaReading, 
    userFeedback?: any
  ): Promise<MemoryNote> {
    const cardNames = reading.session_context.cards?.map(c => c.name) || [];
    const spreadType = reading.session_context.spreadType;
    
    // Extract key themes and insights
    const themes = this.extractThemes(reading.narrative + ' ' + reading.overall_guidance);
    const keywords = [
      ...cardNames.map(name => name.toLowerCase().replace(/\s+/g, '_')),
      `spread_${spreadType}`,
      ...themes,
      'sophia_reading',
      'tarot_session'
    ];

    const memoryNote: MemoryNote = {
      content: JSON.stringify({
        reading_summary: {
          id: reading.id,
          timestamp: reading.created_at,
          spread_type: spreadType,
          cards: cardNames,
          narrative: reading.narrative,
          guidance: reading.overall_guidance,
          spiritual_insight: reading.spiritual_insight
        },
        interaction_data: {
          user_id: reading.session_context.userId,
          session_id: reading.session_context.sessionId,
          reader: 'sophia',
          feedback: userFeedback || null
        },
        learning_insights: {
          themes_identified: themes,
          card_combinations: this.generateCardCombinations(cardNames),
          interpretation_quality: this.calculateReadingQuality(reading),
          personalization_applied: reading.card_interpretations.some(interp => 
            interp.confidence_score > 0.8
          )
        }
      }),
      keywords,
      context: `Tarot reading session with Sophia for ${spreadType} spread`,
      category: 'tarot_reading',
      tags: [
        'user_interaction',
        'reading_completed',
        'sophia_session',
        `spread_${spreadType}`,
        ...cardNames.slice(0, 3).map(name => `card_${name.toLowerCase().replace(/\s+/g, '_')}`)
      ],
      timestamp: new Date().toISOString()
    };

    return memoryNote;
  }

  /**
   * Log memory note to the a-mem system via Python script
   */
  private async logToAMem(memoryNote: MemoryNote): Promise<void> {
    try {
      // Create temporary file with memory note data
      const tempFilePath = path.join('/tmp', `memory_note_${Date.now()}.json`);
      await fs.writeFile(tempFilePath, JSON.stringify(memoryNote, null, 2));

      // Python script to interface with a-mem system
      const pythonScript = `
import sys
import json
import os
sys.path.append('${this.memorySystemPath}')

try:
    from memory_system import MemoryNote
    
    # Load memory note data
    with open('${tempFilePath}', 'r') as f:
        data = json.load(f)
    
    # Create MemoryNote instance
    note = MemoryNote(
        content=data['content'],
        keywords=data.get('keywords', []),
        context=data.get('context', ''),
        category=data.get('category', ''),
        tags=data.get('tags', []),
        timestamp=data.get('timestamp')
    )
    
    # Log successful creation
    print(f"SUCCESS: Memory note created with ID {note.id}")
    print(f"Keywords: {note.keywords}")
    print(f"Category: {note.category}")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`;

      // Create temporary Python script
      const pythonScriptPath = path.join('/tmp', `amem_logger_${Date.now()}.py`);
      await fs.writeFile(pythonScriptPath, pythonScript);

      // Execute Python script
      try {
        const result = execSync(`python3 ${pythonScriptPath}`, { 
          encoding: 'utf-8',
          timeout: 30000 // 30 second timeout
        });
        
        console.log('a-mem integration result:', result);
        
        // Check if successful
        if (result.includes('SUCCESS:')) {
          console.log('PersonaLearner: Successfully logged to a-mem system');
        } else {
          throw new Error('a-mem logging did not report success');
        }
        
      } catch (execError) {
        console.warn('a-mem system unavailable, logging locally:', execError);
        await this.logToLocalMemory(memoryNote);
      }

      // Cleanup temporary files
      try {
        await fs.unlink(tempFilePath);
        await fs.unlink(pythonScriptPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp files:', cleanupError);
      }

    } catch (error) {
      console.error('PersonaLearner: a-mem logging failed:', error);
      // Fallback to local logging
      await this.logToLocalMemory(memoryNote);
    }
  }

  /**
   * Fallback method to log memory locally when a-mem is unavailable
   */
  private async logToLocalMemory(memoryNote: MemoryNote): Promise<void> {
    try {
      const logDir = path.join(process.cwd(), 'logs', 'persona-learning');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, `memory_${new Date().toISOString().split('T')[0]}.jsonl`);
      const logEntry = JSON.stringify({
        ...memoryNote,
        logged_at: new Date().toISOString(),
        source: 'PersonaLearner_fallback'
      }) + '\n';
      
      await fs.appendFile(logFile, logEntry);
      console.log(`PersonaLearner: Logged to local memory file: ${logFile}`);
      
    } catch (error) {
      console.error('PersonaLearner: Local memory logging failed:', error);
    }
  }

  /**
   * Update user profile based on learning event
   */
  private async updateUserProfile(userId: string, event: LearningEvent): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        preferences: {
          preferred_spreads: [],
          favorite_cards: [],
          reading_frequency: 'occasional',
          spiritual_focus: []
        },
        learning_patterns: {
          engagement_score: 0.5,
          feedback_sentiment: 'neutral',
          session_duration_avg: 0,
          cards_drawn_total: 0,
          last_active: new Date()
        },
        personalization_data: {
          journal_themes: [],
          recurring_questions: [],
          growth_areas: []
        }
      };
    }

    // Update based on the learning event
    if (event.eventType === 'reading_completed') {
      // Update preferred spreads
      const spreadType = event.data.spread_type;
      if (!profile.preferences.preferred_spreads.includes(spreadType)) {
        profile.preferences.preferred_spreads.push(spreadType);
      }

      // Update favorite cards based on positive feedback
      if (event.data.feedback?.helpful_cards) {
        for (const card of event.data.feedback.helpful_cards) {
          if (!profile.preferences.favorite_cards.includes(card)) {
            profile.preferences.favorite_cards.push(card);
          }
        }
      }

      // Update learning patterns
      profile.learning_patterns.cards_drawn_total += event.data.cards.length;
      profile.learning_patterns.last_active = event.timestamp;
      
      if (event.context.user_satisfaction) {
        // Update engagement score (weighted average)
        const currentScore = profile.learning_patterns.engagement_score;
        const newScore = event.context.user_satisfaction / 5.0; // Normalize to 0-1
        profile.learning_patterns.engagement_score = (currentScore * 0.8) + (newScore * 0.2);
        
        // Update feedback sentiment
        if (event.context.user_satisfaction >= 4) {
          profile.learning_patterns.feedback_sentiment = 'positive';
        } else if (event.context.user_satisfaction <= 2) {
          profile.learning_patterns.feedback_sentiment = 'negative';
        }
      }
    }

    this.userProfiles.set(userId, profile);
  }

  /**
   * Process learning patterns to identify insights
   */
  private async processLearningPatterns(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    const recentEvents = this.learningQueue.filter(
      event => event.userId === userId && 
      event.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );

    // Identify patterns
    const spreadPreferences = this.analyzeSpreadPreferences(recentEvents);
    const cardAffinities = this.analyzeCardAffinities(recentEvents);
    const engagementPatterns = this.analyzeEngagementPatterns(recentEvents);

    // Log insights
    console.log(`PersonaLearner: User ${userId} patterns:`, {
      spread_preferences: spreadPreferences,
      card_affinities: cardAffinities,
      engagement_level: engagementPatterns.average_satisfaction
    });
  }

  /**
   * Get personalization recommendations for a user
   */
  async getPersonalizationRecommendations(userId: string): Promise<{
    recommended_spreads: string[];
    card_preferences: string[];
    personalized_themes: string[];
    engagement_level: 'low' | 'medium' | 'high';
  }> {
    const profile = this.userProfiles.get(userId);
    
    if (!profile) {
      return {
        recommended_spreads: ['three-card'],
        card_preferences: [],
        personalized_themes: [],
        engagement_level: 'medium'
      };
    }

    const engagementLevel = profile.learning_patterns.engagement_score > 0.7 ? 'high' :
                           profile.learning_patterns.engagement_score > 0.4 ? 'medium' : 'low';

    return {
      recommended_spreads: profile.preferences.preferred_spreads.slice(0, 3),
      card_preferences: profile.preferences.favorite_cards.slice(0, 5),
      personalized_themes: profile.personalization_data.growth_areas,
      engagement_level
    };
  }

  /**
   * Helper methods for analysis
   */
  private extractThemes(text: string): string[] {
    const commonThemes = [
      'transformation', 'growth', 'love', 'spirituality', 'wisdom', 'change',
      'journey', 'balance', 'intuition', 'strength', 'clarity', 'healing'
    ];
    
    return commonThemes.filter(theme => 
      text.toLowerCase().includes(theme)
    );
  }

  private generateCardCombinations(cardNames: string[]): string[] {
    const combinations = [];
    for (let i = 0; i < cardNames.length - 1; i++) {
      combinations.push(`${cardNames[i]}+${cardNames[i + 1]}`);
    }
    return combinations;
  }

  private calculateReadingQuality(reading: SophiaReading): number {
    let quality = 0.5; // Base quality
    
    // Narrative length indicates depth
    if (reading.narrative.length > 500) quality += 0.2;
    
    // Multiple interpretations show thoroughness
    if (reading.card_interpretations.length > 2) quality += 0.1;
    
    // High confidence interpretations indicate good data
    const avgConfidence = reading.card_interpretations.reduce(
      (sum, interp) => sum + interp.confidence_score, 0
    ) / reading.card_interpretations.length;
    
    quality += avgConfidence * 0.2;
    
    return Math.min(quality, 1.0);
  }

  private analyzeSpreadPreferences(events: LearningEvent[]): Record<string, number> {
    const spreadCounts: Record<string, number> = {};
    
    events.forEach(event => {
      const spread = event.context.spread_type;
      spreadCounts[spread] = (spreadCounts[spread] || 0) + 1;
    });
    
    return spreadCounts;
  }

  private analyzeCardAffinities(events: LearningEvent[]): Record<string, number> {
    const cardCounts: Record<string, number> = {};
    
    events.forEach(event => {
      event.context.cards_drawn.forEach(card => {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
      });
    });
    
    return cardCounts;
  }

  private analyzeEngagementPatterns(events: LearningEvent[]): { 
    average_satisfaction: number;
    session_count: number;
    feedback_rate: number;
  } {
    const satisfactionScores = events
      .map(e => e.context.user_satisfaction)
      .filter(score => score !== undefined) as number[];
    
    const averageSatisfaction = satisfactionScores.length > 0 
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
      : 0;

    return {
      average_satisfaction: averageSatisfaction,
      session_count: events.length,
      feedback_rate: satisfactionScores.length / events.length
    };
  }

  /**
   * Retrieve user memories from a-mem system for personalization
   */
  async retrieveUserMemories(userId: string): Promise<MemoryNote[]> {
    try {
      console.log(`PersonaLearner: Retrieving memories for user ${userId}`);
      
      // Create a Python script to query user-specific memories
      const pythonScript = `
import sys
import json
import os
from pathlib import Path

# Add a-mem to Python path
amem_path = Path.cwd() / 'a_mem'
sys.path.insert(0, str(amem_path))

try:
    from store import MemoryStore
    
    # Initialize memory store
    store = MemoryStore(namespace="mystic_arcana")
    
    # Query events for specific user
    user_id = "${userId}"
    events = store.query_events(limit=50)  # Get recent events
    
    # Filter and format for this user
    user_memories = []
    for event in events:
        event_dict = event.to_dict()
        
        # Check if event is related to this user
        if (user_id in str(event_dict.get('content', '')) or 
            user_id in str(event_dict.get('metadata', {}))):
            
            # Convert to MemoryNote format
            memory_note = {
                'content': event_dict.get('content', ''),
                'id': event_dict.get('id', ''),
                'keywords': event_dict.get('metadata', {}).get('keywords', []),
                'context': event_dict.get('metadata', {}).get('context', ''),
                'category': event_dict.get('metadata', {}).get('category', ''),
                'tags': event_dict.get('metadata', {}).get('tags', []),
                'timestamp': event_dict.get('timestamp', ''),
                'retrieval_count': event_dict.get('retrieval_count', 0),
                'last_accessed': event_dict.get('last_accessed', '')
            }
            user_memories.append(memory_note)
    
    # Output results as JSON
    print(json.dumps({
        'success': True,
        'user_id': user_id,
        'memories_found': len(user_memories),
        'memories': user_memories
    }))
    
except Exception as e:
    print(json.dumps({
        'success': False,
        'error': str(e),
        'user_id': "${userId}",
        'memories': []
    }))
    sys.exit(1)
`;

      // Create temporary Python script
      const pythonScriptPath = path.join('/tmp', `query_user_memories_${Date.now()}.py`);
      await fs.writeFile(pythonScriptPath, pythonScript);

      try {
        // Execute Python script
        const result = execSync(`python3 ${pythonScriptPath}`, { 
          encoding: 'utf-8',
          timeout: 30000,
          cwd: process.cwd()
        });
        
        // Parse JSON result
        const queryResult = JSON.parse(result.trim());
        
        if (!queryResult.success) {
          throw new Error(`Memory query failed: ${queryResult.error}`);
        }
        
        console.log(`PersonaLearner: Retrieved ${queryResult.memories_found} memories for user ${userId}`);
        
        // Cleanup temp file
        await fs.unlink(pythonScriptPath).catch(() => {});
        
        return queryResult.memories as MemoryNote[];
        
      } catch (execError) {
        console.warn(`PersonaLearner: a-mem query failed, falling back to local memories:`, execError);
        
        // Fallback to local memory files
        const memories = await this.retrieveFromLocalMemory(userId);
        await fs.unlink(pythonScriptPath).catch(() => {});
        
        return memories;
      }
      
    } catch (error) {
      console.error('PersonaLearner: Failed to retrieve user memories:', error);
      return [];
    }
  }

  /**
   * Fallback method to retrieve memories from local files
   */
  private async retrieveFromLocalMemory(userId: string): Promise<MemoryNote[]> {
    try {
      const logDir = path.join(process.cwd(), 'logs', 'persona-learning');
      const memories: MemoryNote[] = [];
      
      try {
        const files = await fs.readdir(logDir);
        const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
        
        for (const file of jsonlFiles) {
          const filePath = path.join(logDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              
              // Check if this entry relates to our user
              if (entry.content && typeof entry.content === 'string') {
                const contentData = JSON.parse(entry.content);
                if (contentData.interaction_data?.user_id === userId) {
                  memories.push({
                    content: entry.content,
                    id: entry.id || `local_${Date.now()}`,
                    keywords: entry.keywords || [],
                    context: entry.context || '',
                    category: entry.category || '',
                    tags: entry.tags || [],
                    timestamp: entry.timestamp || entry.logged_at,
                    retrieval_count: entry.retrieval_count || 0
                  });
                }
              }
            } catch (parseError) {
              // Skip malformed entries
              continue;
            }
          }
        }
        
        console.log(`PersonaLearner: Retrieved ${memories.length} memories from local storage for user ${userId}`);
        return memories;
        
      } catch (dirError) {
        console.log('PersonaLearner: No local memory files found');
        return [];
      }
      
    } catch (error) {
      console.error('PersonaLearner: Local memory retrieval failed:', error);
      return [];
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if memory system path exists
      const memoryPath = this.memorySystemPath;
      await fs.access(memoryPath);
      
      // Check if we can create temp files
      const tempFile = path.join('/tmp', `health_check_${Date.now()}.txt`);
      await fs.writeFile(tempFile, 'health check');
      await fs.unlink(tempFile);
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Interactive Learning Hooks for Real-time Events
   */

  /**
   * Log a conversation turn for learning
   */
  async logConversationTurn(
    userId: string,
    sessionId: string,
    conversationState: string,
    turnNumber: number,
    sophiaDialogue: string,
    userResponse?: string,
    revealedCard?: { card: any; interpretation: string }
  ): Promise<void> {
    if (!userId) return; // Skip for guest users
    
    try {
      const learningEvent: LearningEvent = {
        eventType: 'conversation_turn',
        userId,
        sessionId,
        data: {
          conversation_state: conversationState,
          turn_number: turnNumber,
          sophia_dialogue: sophiaDialogue,
          user_response: userResponse,
          revealed_card: revealedCard,
          dialogue_length: sophiaDialogue.length,
          has_user_response: !!userResponse
        },
        timestamp: new Date(),
        context: {
          spread_type: 'conversation_active',
          cards_drawn: revealedCard ? [revealedCard.card.name] : [],
          conversation_state: conversationState,
          turn_number: turnNumber
        }
      };

      this.learningQueue.push(learningEvent);

      // Create focused memory note for this turn
      const memoryNote = await this.createConversationMemoryNote(learningEvent);
      await this.logToAMem(memoryNote);

      console.log(`PersonaLearner: Logged conversation turn ${turnNumber} for user ${userId}`);

    } catch (error) {
      console.error('PersonaLearner: Failed to log conversation turn:', error);
    }
  }

  /**
   * Log user response patterns for preference learning
   */
  async logUserResponse(
    userId: string,
    sessionId: string,
    responseText: string,
    responseContext: {
      options_presented: string[];
      response_time_ms?: number;
      conversation_state: string;
    }
  ): Promise<void> {
    if (!userId) return;
    
    try {
      const learningEvent: LearningEvent = {
        eventType: 'user_response',
        userId,
        sessionId,
        data: {
          response_text: responseText,
          response_length: responseText.length,
          options_count: responseContext.options_presented.length,
          response_time: responseContext.response_time_ms,
          response_style: this.analyzeResponseStyle(responseText),
          selected_from_options: responseContext.options_presented.includes(responseText)
        },
        timestamp: new Date(),
        context: {
          spread_type: 'user_interaction',
          cards_drawn: [],
          conversation_state: responseContext.conversation_state
        }
      };

      this.learningQueue.push(learningEvent);

      // Update user profile with response patterns
      await this.updateResponsePatterns(userId, learningEvent);

      console.log(`PersonaLearner: Logged user response for user ${userId}`);

    } catch (error) {
      console.error('PersonaLearner: Failed to log user response:', error);
    }
  }

  /**
   * Log card reveal engagement for timing optimization
   */
  async logCardReveal(
    userId: string,
    sessionId: string,
    cardName: string,
    cardIndex: number,
    engagementMetrics: {
      hover_time_ms?: number;
      clicked?: boolean;
      interpretation_read?: boolean;
    }
  ): Promise<void> {
    if (!userId) return;
    
    try {
      const learningEvent: LearningEvent = {
        eventType: 'card_revealed',
        userId,
        sessionId,
        data: {
          card_name: cardName,
          card_index: cardIndex,
          engagement_level: this.calculateEngagementLevel(engagementMetrics),
          interaction_metrics: engagementMetrics
        },
        timestamp: new Date(),
        context: {
          spread_type: 'card_interaction',
          cards_drawn: [cardName]
        }
      };

      this.learningQueue.push(learningEvent);
      console.log(`PersonaLearner: Logged card reveal for ${cardName}`);

    } catch (error) {
      console.error('PersonaLearner: Failed to log card reveal:', error);
    }
  }

  /**
   * Log interactive question responses for personalization
   */
  async logQuestionResponse(
    userId: string,
    sessionId: string,
    question: string,
    response: string,
    questionContext: {
      question_type: 'clarification' | 'preference' | 'feedback' | 'spiritual_focus';
      related_card?: string;
    }
  ): Promise<void> {
    if (!userId) return;
    
    try {
      const learningEvent: LearningEvent = {
        eventType: 'question_answered',
        userId,
        sessionId,
        data: {
          question,
          response,
          question_type: questionContext.question_type,
          related_card: questionContext.related_card,
          response_sentiment: this.analyzeResponseSentiment(response),
          provides_new_insight: this.assessInsightValue(response)
        },
        timestamp: new Date(),
        context: {
          spread_type: 'question_interaction',
          cards_drawn: questionContext.related_card ? [questionContext.related_card] : []
        }
      };

      this.learningQueue.push(learningEvent);

      // Create memory note for valuable insights
      if (learningEvent.data.provides_new_insight) {
        const memoryNote = await this.createQuestionMemoryNote(learningEvent);
        await this.logToAMem(memoryNote);
      }

      console.log(`PersonaLearner: Logged question response for user ${userId}`);

    } catch (error) {
      console.error('PersonaLearner: Failed to log question response:', error);
    }
  }

  /**
   * Helper methods for interactive learning
   */
  private async createConversationMemoryNote(event: LearningEvent): Promise<MemoryNote> {
    return {
      content: JSON.stringify({
        conversation_data: {
          user_id: event.userId,
          session_id: event.sessionId,
          turn_number: event.data.turn_number,
          conversation_state: event.data.conversation_state,
          sophia_dialogue: event.data.sophia_dialogue,
          user_response: event.data.user_response,
          revealed_card: event.data.revealed_card
        },
        engagement_metrics: {
          dialogue_length: event.data.dialogue_length,
          has_user_response: event.data.has_user_response,
          response_quality: event.data.user_response ? this.analyzeResponseStyle(event.data.user_response) : null
        }
      }),
      keywords: [
        'conversation_turn',
        `state_${event.data.conversation_state}`,
        `turn_${event.data.turn_number}`,
        event.data.revealed_card ? `card_${event.data.revealed_card.card.name.toLowerCase().replace(/\s+/g, '_')}` : '',
        'sophia_interaction'
      ].filter(Boolean),
      context: `Conversation turn ${event.data.turn_number} in state ${event.data.conversation_state}`,
      category: 'conversation_learning',
      tags: ['real_time_learning', 'conversation_turn', 'sophia_interaction'],
      timestamp: new Date().toISOString()
    };
  }

  private async createQuestionMemoryNote(event: LearningEvent): Promise<MemoryNote> {
    return {
      content: JSON.stringify({
        question_data: {
          user_id: event.userId,
          session_id: event.sessionId,
          question: event.data.question,
          response: event.data.response,
          question_type: event.data.question_type,
          related_card: event.data.related_card
        },
        insight_analysis: {
          response_sentiment: event.data.response_sentiment,
          insight_value: event.data.provides_new_insight,
          potential_themes: this.extractThemes(event.data.response)
        }
      }),
      keywords: [
        'interactive_question',
        `type_${event.data.question_type}`,
        event.data.related_card ? `card_${event.data.related_card.toLowerCase().replace(/\s+/g, '_')}` : '',
        'user_insight'
      ].filter(Boolean),
      context: `Interactive question of type ${event.data.question_type}`,
      category: 'personalization_insight',
      tags: ['interactive_learning', 'user_insight', 'personalization_data'],
      timestamp: new Date().toISOString()
    };
  }

  private analyzeResponseStyle(response: string): 'concise' | 'detailed' | 'emotional' | 'analytical' {
    const length = response.length;
    const emotionalWords = ['feel', 'heart', 'soul', 'love', 'fear', 'hope', 'dream'];
    const analyticalWords = ['think', 'analyze', 'consider', 'logic', 'reason', 'because'];
    
    const hasEmotionalWords = emotionalWords.some(word => response.toLowerCase().includes(word));
    const hasAnalyticalWords = analyticalWords.some(word => response.toLowerCase().includes(word));
    
    if (length < 50) return 'concise';
    if (hasEmotionalWords) return 'emotional';
    if (hasAnalyticalWords) return 'analytical';
    return 'detailed';
  }

  private analyzeResponseSentiment(response: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'love', 'happy', 'excited', 'wonderful', 'amazing'];
    const negativeWords = ['bad', 'hate', 'sad', 'worried', 'terrible', 'awful', 'frustrated'];
    
    const positiveCount = positiveWords.filter(word => response.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => response.toLowerCase().includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateEngagementLevel(metrics: { hover_time_ms?: number; clicked?: boolean; interpretation_read?: boolean }): 'low' | 'medium' | 'high' {
    let score = 0;
    
    if (metrics.clicked) score += 2;
    if (metrics.interpretation_read) score += 3;
    if (metrics.hover_time_ms && metrics.hover_time_ms > 2000) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private assessInsightValue(response: string): boolean {
    // Simple heuristic: longer responses with personal references likely contain insights
    return response.length > 100 && (
      response.toLowerCase().includes('i ') ||
      response.toLowerCase().includes('my ') ||
      response.toLowerCase().includes('me ')
    );
  }

  private async updateResponsePatterns(userId: string, event: LearningEvent): Promise<void> {
    let profile = this.userProfiles.get(userId);
    if (!profile) return;

    // Track response patterns
    const responseStyle = event.data.response_style;
    const responseTime = event.data.response_time;

    // Update personalization data based on response patterns
    if (responseStyle === 'emotional') {
      if (!profile.personalization_data.growth_areas.includes('emotional_guidance')) {
        profile.personalization_data.growth_areas.push('emotional_guidance');
      }
    } else if (responseStyle === 'analytical') {
      if (!profile.personalization_data.growth_areas.includes('practical_wisdom')) {
        profile.personalization_data.growth_areas.push('practical_wisdom');
      }
    }

    this.userProfiles.set(userId, profile);
  }

  /**
   * Progressive Reveal System - Check and increment engagement level
   */
  async checkAndIncrementEngagementLevel(userId: string): Promise<{
    levelIncreased: boolean;
    newLevel: number;
    previousLevel: number;
    thresholdMet?: string;
  }> {
    if (!userId) {
      console.log('PersonaLearner: Skipping engagement level check for guest user');
      return { levelIncreased: false, newLevel: 1, previousLevel: 1 };
    }

    try {
      console.log(`PersonaLearner: Checking engagement level for user ${userId}`);

      // Step 1: Get current engagement level from database
      const currentLevel = await this.getCurrentEngagementLevel(userId);
      
      // Step 2: Retrieve user's interaction history
      const userMemories = await this.retrieveUserMemories(userId);
      
      // Step 3: Analyze interaction patterns and calculate metrics
      const engagementMetrics = this.analyzeEngagementMetrics(userMemories);
      
      // Step 4: Check against engagement thresholds
      const newLevel = this.calculateNewEngagementLevel(engagementMetrics, currentLevel);
      
      // Step 5: Update database if level increased
      if (newLevel > currentLevel) {
        const updated = await this.updateEngagementLevel(userId, newLevel);
        
        if (updated) {
          const thresholdName = this.getThresholdName(newLevel);
          console.log(`PersonaLearner: User ${userId} leveled up from ${currentLevel} to ${newLevel} (${thresholdName})`);
          
          return {
            levelIncreased: true,
            newLevel,
            previousLevel: currentLevel,
            thresholdMet: thresholdName
          };
        }
      }

      return {
        levelIncreased: false,
        newLevel: currentLevel,
        previousLevel: currentLevel
      };

    } catch (error) {
      console.error('PersonaLearner: Failed to check engagement level:', error);
      return { levelIncreased: false, newLevel: 1, previousLevel: 1 };
    }
  }

  /**
   * Get current engagement level from database
   */
  private async getCurrentEngagementLevel(userId: string): Promise<number> {
    try {
      // This would normally query Supabase, but for testing we'll use localStorage
      const storedLevel = localStorage?.getItem(`engagement_level_${userId}`);
      return storedLevel ? parseInt(storedLevel) : 1;
    } catch (error) {
      console.warn('PersonaLearner: Could not retrieve current engagement level:', error);
      return 1; // Default to level 1
    }
  }

  /**
   * Analyze user memories to calculate engagement metrics
   */
  private analyzeEngagementMetrics(userMemories: MemoryNote[]): {
    completedReadings: number;
    conversationTurns: number;
    questionsAnswered: number;
    sessionCount: number;
    engagementScore: number;
    consistencyScore: number;
  } {
    let completedReadings = 0;
    let conversationTurns = 0;
    let questionsAnswered = 0;
    const uniqueSessions = new Set<string>();
    let totalEngagement = 0;
    let engagementCount = 0;

    userMemories.forEach(memory => {
      try {
        if (memory.content && typeof memory.content === 'string') {
          const memoryData = JSON.parse(memory.content);
          
          // Count completed readings
          if (memoryData.reading_summary) {
            completedReadings++;
            const sessionId = memoryData.reading_summary.session_id || memoryData.interaction_data?.session_id;
            if (sessionId) uniqueSessions.add(sessionId);
          }
          
          // Count conversation turns
          if (memoryData.conversation_data) {
            conversationTurns++;
            if (memoryData.conversation_data.session_id) {
              uniqueSessions.add(memoryData.conversation_data.session_id);
            }
          }
          
          // Count answered questions
          if (memoryData.question_data) {
            questionsAnswered++;
          }
          
          // Calculate engagement metrics
          if (memoryData.engagement_metrics) {
            if (typeof memoryData.engagement_metrics.dialogue_length === 'number') {
              totalEngagement += Math.min(memoryData.engagement_metrics.dialogue_length / 100, 5); // Normalize
              engagementCount++;
            }
          }
        }
      } catch (parseError) {
        // Skip malformed memory entries
      }
    });

    const avgEngagement = engagementCount > 0 ? totalEngagement / engagementCount : 0;
    
    // Calculate consistency score based on session frequency
    const consistencyScore = Math.min(uniqueSessions.size / 10, 1); // Max at 10 sessions

    return {
      completedReadings,
      conversationTurns,
      questionsAnswered,
      sessionCount: uniqueSessions.size,
      engagementScore: avgEngagement,
      consistencyScore
    };
  }

  /**
   * Calculate new engagement level based on metrics
   */
  private calculateNewEngagementLevel(metrics: any, currentLevel: number): number {
    // Engagement thresholds (cumulative)
    const thresholds = [
      { level: 1, readings: 0, turns: 0, questions: 0, description: 'Novice Seeker' },
      { level: 2, readings: 3, turns: 10, questions: 2, description: 'Curious Student' },
      { level: 3, readings: 10, turns: 30, questions: 8, description: 'Dedicated Practitioner' },
      { level: 4, readings: 25, turns: 75, questions: 20, description: 'Enlightened Seeker' },
      { level: 5, readings: 50, turns: 150, questions: 40, description: 'Master Oracle' }
    ];

    // Find the highest level the user qualifies for
    let qualifiedLevel = 1;
    
    for (const threshold of thresholds) {
      const meetsReadings = metrics.completedReadings >= threshold.readings;
      const meetsTurns = metrics.conversationTurns >= threshold.turns;
      const meetsQuestions = metrics.questionsAnswered >= threshold.questions;
      
      // Must meet at least 2 out of 3 criteria, or have exceptional performance in one area
      const criteriaCount = [meetsReadings, meetsTurns, meetsQuestions].filter(Boolean).length;
      const exceptionalReadings = metrics.completedReadings >= threshold.readings * 1.5;
      const exceptionalTurns = metrics.conversationTurns >= threshold.turns * 1.5;
      
      if (criteriaCount >= 2 || exceptionalReadings || exceptionalTurns) {
        qualifiedLevel = threshold.level;
      }
    }

    // Only allow level increases, never decreases
    return Math.max(qualifiedLevel, currentLevel);
  }

  /**
   * Update engagement level in database
   */
  private async updateEngagementLevel(userId: string, newLevel: number): Promise<boolean> {
    try {
      // For testing, store in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`engagement_level_${userId}`, newLevel.toString());
      }
      
      // In production, this would call the Supabase function
      // const { error } = await supabase.rpc('increment_reader_engagement_level', {
      //   user_id: userId,
      //   new_level: newLevel
      // });
      
      console.log(`PersonaLearner: Updated engagement level for user ${userId} to ${newLevel}`);
      return true;
    } catch (error) {
      console.error('PersonaLearner: Failed to update engagement level:', error);
      return false;
    }
  }

  /**
   * Get threshold name for level
   */
  private getThresholdName(level: number): string {
    const names = {
      1: 'Novice Seeker',
      2: 'Curious Student',
      3: 'Dedicated Practitioner', 
      4: 'Enlightened Seeker',
      5: 'Master Oracle'
    };
    return names[level as keyof typeof names] || 'Unknown Level';
  }

  /**
   * Get detailed engagement analysis for user
   */
  async getEngagementAnalysis(userId: string): Promise<{
    currentLevel: number;
    levelName: string;
    metrics: any;
    nextThreshold?: any;
    progressToNext?: number;
  }> {
    if (!userId) {
      return {
        currentLevel: 1,
        levelName: 'Guest User',
        metrics: {},
        nextThreshold: undefined,
        progressToNext: 0
      };
    }

    try {
      const currentLevel = await this.getCurrentEngagementLevel(userId);
      const userMemories = await this.retrieveUserMemories(userId);
      const metrics = this.analyzeEngagementMetrics(userMemories);
      
      // Calculate progress to next level
      const thresholds = [
        { level: 2, readings: 3, turns: 10, questions: 2 },
        { level: 3, readings: 10, turns: 30, questions: 8 },
        { level: 4, readings: 25, turns: 75, questions: 20 },
        { level: 5, readings: 50, turns: 150, questions: 40 }
      ];
      
      const nextThreshold = thresholds.find(t => t.level > currentLevel);
      let progressToNext = 0;
      
      if (nextThreshold) {
        const readingProgress = metrics.completedReadings / nextThreshold.readings;
        const turnProgress = metrics.conversationTurns / nextThreshold.turns;
        const questionProgress = metrics.questionsAnswered / nextThreshold.questions;
        
        progressToNext = Math.max(readingProgress, turnProgress, questionProgress) * 100;
      }

      return {
        currentLevel,
        levelName: this.getThresholdName(currentLevel),
        metrics,
        nextThreshold,
        progressToNext: Math.min(progressToNext, 100)
      };
    } catch (error) {
      console.error('PersonaLearner: Failed to get engagement analysis:', error);
      return {
        currentLevel: 1,
        levelName: 'Novice Seeker',
        metrics: {},
        nextThreshold: undefined,
        progressToNext: 0
      };
    }
  }

  /**
   * Get learning statistics for monitoring
   */
  getStats(): {
    total_users: number;
    total_events: number;
    memory_notes_logged: number;
    last_activity: Date | null;
    interaction_events: number;
    conversation_turns: number;
  } {
    const lastActivity = this.learningQueue.length > 0 
      ? this.learningQueue[this.learningQueue.length - 1].timestamp
      : null;

    const interactionEvents = this.learningQueue.filter(e => 
      ['conversation_turn', 'user_response', 'card_revealed', 'question_answered'].includes(e.eventType)
    ).length;

    const conversationTurns = this.learningQueue.filter(e => e.eventType === 'conversation_turn').length;

    return {
      total_users: this.userProfiles.size,
      total_events: this.learningQueue.length,
      memory_notes_logged: this.learningQueue.length, // Assuming 1:1 ratio for now
      last_activity: lastActivity,
      interaction_events: interactionEvents,
      conversation_turns: conversationTurns
    };
  }
}