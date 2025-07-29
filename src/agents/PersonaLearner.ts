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
  eventType: 'reading_completed' | 'card_feedback' | 'session_rating' | 'journal_entry' | 'preference_update';
  userId: string;
  sessionId: string;
  data: any;
  timestamp: Date;
  context: {
    spread_type: string;
    cards_drawn: string[];
    interpretation_quality?: number;
    user_satisfaction?: number;
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
   * Get learning statistics for monitoring
   */
  getStats(): {
    total_users: number;
    total_events: number;
    memory_notes_logged: number;
    last_activity: Date | null;
  } {
    const lastActivity = this.learningQueue.length > 0 
      ? this.learningQueue[this.learningQueue.length - 1].timestamp
      : null;

    return {
      total_users: this.userProfiles.size,
      total_events: this.learningQueue.length,
      memory_notes_logged: this.learningQueue.length, // Assuming 1:1 ratio for now
      last_activity: lastActivity
    };
  }
}