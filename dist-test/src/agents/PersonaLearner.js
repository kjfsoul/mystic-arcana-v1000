import axios from "axios";
/**
 * PersonaLearner - The Adaptive Intelligence
 *
 * This agent learns from every user interaction to build personalized experiences.
 * It connects to the a-mem system to persist insights across sessions and enables
 * Sophia and other virtual readers to become more attuned to each user's needs.
 */
export class PersonaLearnerAgent {
  constructor() {
    this.userProfiles = new Map();
    this.learningQueue = [];
    this.supermemoryMcpUrl =
      process.env.SUPERMEMORY_MCP_URL || "http://localhost:4001";
  }
  /**
   * Log a completed reading interaction and learn from it
   */
  async logInteraction(userId, session, userFeedback) {
    try {
      // Create learning event
      const learningEvent = {
        eventType: "reading_completed",
        userId,
        sessionId: session.sessionId,
        data: {
          reading_id: session.sessionId, // Use session ID as reading ID
          cards: session.cards.map((c) => c.name),
          spread_type: session.spreadType,
          narrative_length: 0, // No narrative in ConversationSession
          interpretation_count: session.cardInterpretations.length,
          feedback: userFeedback,
        },
        timestamp: new Date(),
        context: {
          spread_type: session.spreadType,
          cards_drawn: session.cards.map((c) => c.name),
          interpretation_quality: 0, // No quality in ConversationSession
          user_satisfaction: userFeedback?.rating || undefined,
        },
      };
      // Add to learning queue
      this.learningQueue.push(learningEvent);
      // Create a SophiaReading object for the memory note
      const reading = {
        id: session.sessionId,
        narrative: "", // No narrative in ConversationSession
        card_interpretations: session.cardInterpretations,
        overall_guidance: "", // No overall guidance in ConversationSession
        spiritual_insight: "", // No spiritual insight in ConversationSession
        reader_signature: "Sophia ✨",
        session_context: session.context,
        created_at: session.startTime,
      };
      // Create memory note for a-mem system
      const memoryNote = await this.createMemoryNote(reading, userFeedback);
      // Log to a-mem system
      await this.logToAMem(memoryNote, userId, session.sessionId);
      // Update user profile
      await this.updateUserProfile(userId, learningEvent);
      // Process learning patterns
      await this.processLearningPatterns(userId);
      console.log(
        `PersonaLearner: Logged interaction for user ${userId}, reading ${reading.id}`,
      );
    } catch (error) {
      console.error("PersonaLearner: Failed to log interaction:", error);
      throw error;
    }
  }
  /**
   * Create a structured memory note for the a-mem system
   */
  async createMemoryNote(reading, userFeedback) {
    const cardNames = reading.session_context.cards?.map((c) => c.name) || [];
    const spreadType = reading.session_context.spreadType;
    // Extract key themes and insights
    const themes = this.extractThemes(
      reading.narrative + " " + reading.overall_guidance,
    );
    const keywords = [
      ...cardNames.map((name) => name.toLowerCase().replace(/\s+/g, "_")),
      `spread_${spreadType}`,
      ...themes,
      "sophia_reading",
      "tarot_session",
    ];
    const memoryNote = {
      content: JSON.stringify({
        reading_summary: {
          id: reading.id,
          timestamp: reading.created_at,
          spread_type: spreadType,
          cards: cardNames,
          narrative: reading.narrative,
          guidance: reading.overall_guidance,
          spiritual_insight: reading.spiritual_insight,
        },
        interaction_data: {
          user_id: reading.session_context.userId,
          session_id: reading.session_context.sessionId,
          reader: "sophia",
          feedback: userFeedback || null,
        },
        learning_insights: {
          themes_identified: themes,
          card_combinations: this.generateCardCombinations(cardNames),
          interpretation_quality: 0, // No quality in ConversationSession
          personalization_applied: reading.card_interpretations.some(
            (interp) => interp.confidence_score > 0.8,
          ),
        },
      }),
      keywords,
      context: `Tarot reading session with Sophia for ${spreadType} spread`,
      category: "tarot_reading",
      tags: [
        "user_interaction",
        "reading_completed",
        "sophia_session",
        `spread_${spreadType}`,
        ...cardNames
          .slice(0, 3)
          .map((name) => `card_${name.toLowerCase().replace(/\s+/g, "_")}`),
      ],
      timestamp: new Date().toISOString(),
    };
    return memoryNote;
  }
  /**
   * Log memory note to the a-mem system via Python script
   */
  async logToAMem(memoryNote, userId, sessionId) {
    try {
      const payload = {
        userId: userId,
        entryType: memoryNote.category || "general_memory",
        data: JSON.parse(memoryNote.content),
        synthesisPrompt: memoryNote.context,
      };
      const response = await axios.post(
        `${this.supermemoryMcpUrl}/record`,
        payload,
      );
      if (response.status === 201) {
        console.log("PersonaLearner: Successfully logged to Supermemory MCP");
      } else {
        throw new Error(
          `Supermemory MCP logging failed with status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error("PersonaLearner: Supermemory MCP logging failed:", error);
      // Fallback to local logging if MCP is unavailable or fails
      // await this.logToLocalMemory(memoryNote);
    }
  }
  /**
   * Update user profile based on learning event
   */
  async updateUserProfile(userId, event) {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        preferences: {
          preferred_spreads: [],
          favorite_cards: [],
          reading_frequency: "occasional",
          spiritual_focus: [],
        },
        learning_patterns: {
          engagement_score: 0.5,
          feedback_sentiment: "neutral",
          session_duration_avg: 0,
          cards_drawn_total: 0,
          last_active: new Date(),
        },
        personalization_data: {
          journal_themes: [],
          recurring_questions: [],
          growth_areas: [],
        },
      };
    }
    // Update based on the learning event
    if (event.eventType === "reading_completed") {
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
        profile.learning_patterns.engagement_score =
          currentScore * 0.8 + newScore * 0.2;
        // Update feedback sentiment
        if (event.context.user_satisfaction >= 4) {
          profile.learning_patterns.feedback_sentiment = "positive";
        } else if (event.context.user_satisfaction <= 2) {
          profile.learning_patterns.feedback_sentiment = "negative";
        }
      }
    }
    this.userProfiles.set(userId, profile);
  }
  /**
   * Process learning patterns to identify insights
   */
  async processLearningPatterns(userId) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;
    const recentEvents = this.learningQueue.filter(
      (event) =>
        event.userId === userId &&
        event.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    );
    // Identify patterns
    const spreadPreferences = this.analyzeSpreadPreferences(recentEvents);
    const cardAffinities = this.analyzeCardAffinities(recentEvents);
    const engagementPatterns = this.analyzeEngagementPatterns(recentEvents);
    // Log insights
    console.log(`PersonaLearner: User ${userId} patterns:`, {
      spread_preferences: spreadPreferences,
      card_affinities: cardAffinities,
      engagementLevel: engagementPatterns.average_satisfaction,
    });
  }
  /**
   * Get personalization recommendations for a user
   */
  async getPersonalizationRecommendations(userId) {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return {
        recommended_spreads: ["three-card"],
        card_preferences: [],
        personalized_themes: [],
        engagementLevel: "medium",
      };
    }
    const engagementLevel =
      profile.learning_patterns.engagement_score > 0.7
        ? "high"
        : profile.learning_patterns.engagement_score > 0.4
          ? "medium"
          : "low";
    return {
      recommended_spreads: profile.preferences.preferred_spreads.slice(0, 3),
      card_preferences: profile.preferences.favorite_cards.slice(0, 5),
      personalized_themes: profile.personalization_data.growth_areas,
      engagementLevel,
    };
  }
  /**
   * Helper methods for analysis
   */
  extractThemes(text) {
    const commonThemes = [
      "transformation",
      "growth",
      "love",
      "spirituality",
      "wisdom",
      "change",
      "journey",
      "balance",
      "intuition",
      "strength",
      "clarity",
      "healing",
    ];
    return commonThemes.filter((theme) => text.toLowerCase().includes(theme));
  }
  generateCardCombinations(cardNames) {
    const combinations = [];
    for (let i = 0; i < cardNames.length - 1; i++) {
      combinations.push(`${cardNames[i]}+${cardNames[i + 1]}`);
    }
    return combinations;
  }
  calculateReadingQuality(reading) {
    let quality = 0.5; // Base quality
    // Narrative length indicates depth
    if (reading.narrative.length > 500) quality += 0.2;
    // Multiple interpretations show thoroughness
    if (reading.card_interpretations.length > 2) quality += 0.1;
    // High confidence interpretations indicate good data
    const avgConfidence =
      reading.card_interpretations.reduce(
        (sum, interp) => sum + interp.confidence_score,
        0,
      ) / reading.card_interpretations.length;
    quality += avgConfidence * 0.2;
    return Math.min(quality, 1.0);
  }
  analyzeSpreadPreferences(events) {
    const spreadCounts = {};
    events.forEach((event) => {
      const spread = event.context.spread_type;
      spreadCounts[spread] = (spreadCounts[spread] || 0) + 1;
    });
    return spreadCounts;
  }
  analyzeCardAffinities(events) {
    const cardCounts = {};
    events.forEach((event) => {
      event.context.cards_drawn.forEach((card) => {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
      });
    });
    return cardCounts;
  }
  analyzeEngagementPatterns(events) {
    const satisfactionScores = events
      .map((e) => e.context.user_satisfaction)
      .filter((score) => score !== undefined);
    const averageSatisfaction =
      satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) /
          satisfactionScores.length
        : 0;
    return {
      average_satisfaction: averageSatisfaction,
      session_count: events.length,
      feedback_rate: satisfactionScores.length / events.length,
    };
  }
  /**
   * Retrieve user memories from Supermemory MCP for personalization
   */
  async retrieveUserMemories(userId) {
    try {
      console.log(
        `PersonaLearner: Retrieving memories for user ${userId} from Supermemory MCP`,
      );
      const response = await axios.get(
        `${this.supermemoryMcpUrl}/journey/${userId}`,
      );
      if (response.status === 200) {
        const journeyEntries = response.data.journey;
        console.log(
          `PersonaLearner: Retrieved ${journeyEntries.length} memories for user ${userId} from Supermemory MCP`,
        );
        // Map journey entries to MemoryNote format
        return journeyEntries.map((entry) => ({
          content: JSON.stringify(entry.data),
          id: entry.id,
          keywords: [], // Supermemory doesn't store keywords directly, can be derived from data
          context: entry.synthesis_prompt,
          category: entry.entry_type,
          tags: [], // Supermemory doesn't store tags directly
          timestamp: entry.created_at,
          retrieval_count: 0, // Not tracked by Supermemory
          last_accessed: entry.created_at, // Use created_at as last_accessed for now
        }));
      } else {
        throw new Error(
          `Supermemory MCP retrieval failed with status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(
        "PersonaLearner: Failed to retrieve user memories from Supermemory MCP:",
        error,
      );
      return [];
    }
  }
  /**
   * Progressive Reveal System - Check and increment engagement level
   */
  async checkAndIncrementEngagementLevel(userId) {
    if (!userId) {
      console.log(
        "PersonaLearner: Skipping engagement level check for guest user",
      );
      return { levelIncreased: false, newLevel: 1, previousLevel: 1 };
    }
    try {
      console.log(
        `PersonaLearner: Checking engagement level for user ${userId}`,
      );
      // Step 1: Get current engagement level from database
      const currentLevel = await this.getCurrentEngagementLevel(userId);
      // Step 2: Retrieve user's interaction history
      const userMemories = await this.retrieveUserMemories(userId);
      // Step 3: Analyze interaction patterns and calculate metrics
      const engagementMetrics = this.analyzeEngagementMetrics(userMemories);
      // Step 4: Check against engagement thresholds
      const newLevel = this.calculateNewEngagementLevel(
        engagementMetrics,
        currentLevel,
      );
      // Step 5: Update database if level increased
      if (newLevel > currentLevel) {
        const updated = await this.updateEngagementLevel(userId, newLevel);
        if (updated) {
          const thresholdName = this.getThresholdName(newLevel);
          console.log(
            `PersonaLearner: User ${userId} leveled up from ${currentLevel} to ${newLevel} (${thresholdName})`,
          );
          return {
            levelIncreased: true,
            newLevel,
            previousLevel: currentLevel,
            thresholdMet: thresholdName,
          };
        }
      }
      return {
        levelIncreased: false,
        newLevel: currentLevel,
        previousLevel: currentLevel,
      };
    } catch (error) {
      console.error("PersonaLearner: Failed to check engagement level:", error);
      return { levelIncreased: false, newLevel: 1, previousLevel: 1 };
    }
  }
  /**
   * Get current engagement level from database
   */
  async getCurrentEngagementLevel(userId) {
    try {
      // This would normally query Supabase, but for testing we'll use localStorage
      const storedLevel = localStorage?.getItem(`engagementLevel_${userId}`);
      return storedLevel ? parseInt(storedLevel) : 1;
    } catch (error) {
      console.warn(
        "PersonaLearner: Could not retrieve current engagement level:",
        error,
      );
      return 1; // Default to level 1
    }
  }
  /**
   * Analyze user memories to calculate engagement metrics
   */
  analyzeEngagementMetrics(userMemories) {
    let completedReadings = 0;
    let conversationTurns = 0;
    let questionsAnswered = 0;
    const uniqueSessions = new Set();
    let totalEngagement = 0;
    let engagementCount = 0;
    userMemories.forEach((memory) => {
      try {
        if (memory.content && typeof memory.content === "string") {
          const memoryData = JSON.parse(memory.content);
          // Count completed readings
          if (memoryData.reading_summary) {
            completedReadings++;
            const sessionId =
              memoryData.reading_summary.session_id ||
              memoryData.interaction_data?.session_id;
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
            if (
              typeof memoryData.engagement_metrics.dialogue_length === "number"
            ) {
              totalEngagement += Math.min(
                memoryData.engagement_metrics.dialogue_length / 100,
                5,
              ); // Normalize
              engagementCount++;
            }
          }
        }
      } catch (parseError) {
        // Skip malformed memory entries
      }
    });
    const avgEngagement =
      engagementCount > 0 ? totalEngagement / engagementCount : 0;
    // Calculate consistency score based on session frequency
    const consistencyScore = Math.min(uniqueSessions.size / 10, 1); // Max at 10 sessions
    return {
      completedReadings,
      conversationTurns,
      questionsAnswered,
      sessionCount: uniqueSessions.size,
      engagementScore: avgEngagement,
      consistencyScore,
    };
  }
  /**
   * Calculate new engagement level based on metrics
   */
  calculateNewEngagementLevel(metrics, currentLevel) {
    // Engagement thresholds (cumulative)
    const thresholds = [
      {
        level: 1,
        readings: 0,
        turns: 0,
        questions: 0,
        description: "Novice Seeker",
      },
      {
        level: 2,
        readings: 3,
        turns: 10,
        questions: 2,
        description: "Curious Student",
      },
      {
        level: 3,
        readings: 10,
        turns: 30,
        questions: 8,
        description: "Dedicated Practitioner",
      },
      {
        level: 4,
        readings: 25,
        turns: 75,
        questions: 20,
        description: "Enlightened Seeker",
      },
      {
        level: 5,
        readings: 50,
        turns: 150,
        questions: 40,
        description: "Master Oracle",
      },
    ];
    // Find the highest level the user qualifies for
    let qualifiedLevel = 1;
    for (const threshold of thresholds) {
      const meetsReadings = metrics.completedReadings >= threshold.readings;
      const meetsTurns = metrics.conversationTurns >= threshold.turns;
      const meetsQuestions = metrics.questionsAnswered >= threshold.questions;
      // Must meet at least 2 out of 3 criteria, or have exceptional performance in one area
      const criteriaCount = [meetsReadings, meetsTurns, meetsQuestions].filter(
        Boolean,
      ).length;
      const exceptionalReadings =
        metrics.completedReadings >= threshold.readings * 1.5;
      const exceptionalTurns =
        metrics.conversationTurns >= threshold.turns * 1.5;
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
  async updateEngagementLevel(userId, newLevel) {
    try {
      // For testing, store in localStorage
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(`engagementLevel_${userId}`, newLevel.toString());
      }
      // In production, this would call the Supabase function
      // const { error } = await supabase.rpc('increment_reader_engagementLevel', {
      //   user_id: userId,
      //   new_level: newLevel
      // });
      console.log(
        `PersonaLearner: Updated engagement level for user ${userId} to ${newLevel}`,
      );
      return true;
    } catch (error) {
      console.error(
        "PersonaLearner: Failed to update engagement level:",
        error,
      );
      return false;
    }
  }
  /**
   * Get threshold name for level
   */
  getThresholdName(level) {
    const names = {
      1: "Novice Seeker",
      2: "Curious Student",
      3: "Dedicated Practitioner",
      4: "Enlightened Seeker",
      5: "Master Oracle",
    };
    return names[level] || "Unknown Level";
  }
  /**
   * Get detailed engagement analysis for user
   */
  async getEngagementAnalysis(userId) {
    if (!userId) {
      return {
        currentLevel: 1,
        levelName: "Guest User",
        metrics: {},
        nextThreshold: undefined,
        progressToNext: 0,
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
        { level: 5, readings: 50, turns: 150, questions: 40 },
      ];
      const nextThreshold = thresholds.find((t) => t.level > currentLevel);
      let progressToNext = 0;
      if (nextThreshold) {
        const readingProgress =
          metrics.completedReadings / nextThreshold.readings;
        const turnProgress = metrics.conversationTurns / nextThreshold.turns;
        const questionProgress =
          metrics.questionsAnswered / nextThreshold.questions;
        progressToNext =
          Math.max(readingProgress, turnProgress, questionProgress) * 100;
      }
      return {
        currentLevel,
        levelName: this.getThresholdName(currentLevel),
        metrics,
        nextThreshold,
        progressToNext: Math.min(progressToNext, 100),
      };
    } catch (error) {
      console.error(
        "PersonaLearner: Failed to get engagement analysis:",
        error,
      );
      return {
        currentLevel: 1,
        levelName: "Novice Seeker",
        metrics: {},
        nextThreshold: undefined,
        progressToNext: 0,
      };
    }
  }
  /**
   * Get learning statistics for monitoring
   */
  getStats() {
    const lastActivity =
      this.learningQueue.length > 0
        ? this.learningQueue[this.learningQueue.length - 1].timestamp
        : null;
    const interactionEvents = this.learningQueue.filter((e) =>
      [
        "conversation_turn",
        "user_response",
        "card_revealed",
        "question_answered",
      ].includes(e.eventType),
    ).length;
    const conversationTurns = this.learningQueue.filter(
      (e) => e.eventType === "conversation_turn",
    ).length;
    return {
      total_users: this.userProfiles.size,
      total_events: this.learningQueue.length,
      memory_notes_logged: this.learningQueue.length, // Assuming 1:1 ratio for now
      last_activity: lastActivity,
      interaction_events: interactionEvents,
      conversation_turns: conversationTurns,
    };
  }
  /**
   * Interactive Learning Hooks for Real-time Events
   */
  /**
   * Log a conversation turn for learning
   */
  async logConversationTurn(
    userId,
    sessionId,
    conversationState,
    turnNumber,
    sophiaDialogue,
    userResponse,
    revealedCard,
  ) {
    if (!userId) return; // Skip for guest users
    try {
      const learningEvent = {
        eventType: "conversation_turn",
        userId,
        sessionId,
        data: {
          conversation_state: conversationState,
          turn_number: turnNumber,
          sophia_dialogue: sophiaDialogue,
          user_response: userResponse,
          revealed_card: revealedCard,
          dialogue_length: sophiaDialogue.length,
          has_user_response: !!userResponse,
        },
        timestamp: new Date(),
        context: {
          spread_type: "conversation_active",
          cards_drawn: revealedCard ? [revealedCard.card.name] : [],
          conversation_state: conversationState,
          turn_number: turnNumber,
        },
      };
      this.learningQueue.push(learningEvent);
      // Create focused memory note for this turn
      const memoryNote = await this.createConversationMemoryNote(learningEvent);
      await this.logToAMem(
        memoryNote,
        learningEvent.userId,
        learningEvent.sessionId,
      );
      console.log(
        `PersonaLearner: Logged conversation turn ${turnNumber} for user ${userId}`,
      );
    } catch (error) {
      console.error("PersonaLearner: Failed to log conversation turn:", error);
    }
  }
  /**
   * Log user response patterns for preference learning
   */
  async logUserResponse(userId, sessionId, responseText, responseContext) {
    if (!userId) return;
    try {
      const learningEvent = {
        eventType: "user_response",
        userId,
        sessionId,
        data: {
          response_text: responseText,
          response_length: responseText.length,
          options_count: responseContext.options_presented.length,
          response_time: responseContext.response_time_ms,
          response_style: this.analyzeResponseStyle(responseText),
          selected_from_options:
            responseContext.options_presented.includes(responseText),
        },
        timestamp: new Date(),
        context: {
          spread_type: "user_interaction",
          cards_drawn: [],
          conversation_state: responseContext.conversation_state,
        },
      };
      this.learningQueue.push(learningEvent);
      // Update user profile with response patterns
      await this.updateResponsePatterns(userId, learningEvent);
      console.log(`PersonaLearner: Logged user response for user ${userId}`);
    } catch (error) {
      console.error("PersonaLearner: Failed to log user response:", error);
    }
  }
  /**
   * Log card reveal engagement for timing optimization
   */
  async logCardReveal(
    userId,
    sessionId,
    cardName,
    cardIndex,
    engagementMetrics,
  ) {
    if (!userId) return;
    try {
      const learningEvent = {
        eventType: "card_revealed",
        userId,
        sessionId,
        data: {
          card_name: cardName,
          card_index: cardIndex,
          engagementLevel: this.calculateEngagementLevel(engagementMetrics),
          interaction_metrics: engagementMetrics,
        },
        timestamp: new Date(),
        context: {
          spread_type: "card_interaction",
          cards_drawn: [cardName],
        },
      };
      this.learningQueue.push(learningEvent);
      console.log(`PersonaLearner: Logged card reveal for ${cardName}`);
    } catch (error) {
      console.error("PersonaLearner: Failed to log card reveal:", error);
    }
  }
  /**
   * Log interactive question responses for personalization
   */
  async logQuestionResponse(
    userId,
    sessionId,
    question,
    response,
    questionContext,
  ) {
    if (!userId) return;
    try {
      const learningEvent = {
        eventType: "question_answered",
        userId,
        sessionId,
        data: {
          question,
          response,
          question_type: questionContext.question_type,
          related_card: questionContext.related_card,
          response_sentiment: this.analyzeResponseSentiment(response),
          provides_new_insight: this.assessInsightValue(response),
        },
        timestamp: new Date(),
        context: {
          spread_type: "question_interaction",
          cards_drawn: questionContext.related_card
            ? [questionContext.related_card]
            : [],
        },
      };
      this.learningQueue.push(learningEvent);
      // Create memory note for valuable insights
      if (learningEvent.data.provides_new_insight) {
        const memoryNote = await this.createQuestionMemoryNote(learningEvent);
        await this.logToAMem(
          memoryNote,
          learningEvent.userId,
          learningEvent.sessionId,
        );
      }
      console.log(
        `PersonaLearner: Logged question response for user ${userId}`,
      );
    } catch (error) {
      console.error("PersonaLearner: Failed to log question response:", error);
    }
  }
  /**
   * Helper methods for interactive learning
   */
  async createConversationMemoryNote(event) {
    return {
      content: JSON.stringify({
        conversation_data: {
          user_id: event.userId,
          session_id: event.sessionId,
          turn_number: event.data.turn_number,
          conversation_state: event.data.conversation_state,
          sophia_dialogue: event.data.sophia_dialogue,
          user_response: event.data.user_response,
          revealed_card: event.data.revealed_card,
        },
        engagement_metrics: {
          dialogue_length: event.data.dialogue_length,
          has_user_response: event.data.has_user_response,
          response_quality: event.data.user_response
            ? this.analyzeResponseStyle(event.data.user_response)
            : null,
        },
      }),
      keywords: [
        "conversation_turn",
        `state_${event.data.conversation_state}`,
        `turn_${event.data.turn_number}`,
        event.data.revealed_card
          ? `card_${event.data.revealed_card.card.name.toLowerCase().replace(/\s+/g, "_")}`
          : "",
        "sophia_interaction",
      ].filter(Boolean),
      context: `Conversation turn ${event.data.turn_number} in state ${event.data.conversation_state}`,
      category: "conversation_learning",
      tags: ["real_time_learning", "conversation_turn", "sophia_interaction"],
      timestamp: new Date().toISOString(),
    };
  }
  async createQuestionMemoryNote(event) {
    return {
      content: JSON.stringify({
        question_data: {
          user_id: event.userId,
          session_id: event.sessionId,
          question: event.data.question,
          response: event.data.response,
          question_type: event.data.question_type,
          related_card: event.data.related_card,
        },
        insight_analysis: {
          response_sentiment: event.data.response_sentiment,
          insight_value: event.data.provides_new_insight,
          potential_themes: this.extractThemes(event.data.response),
        },
      }),
      keywords: [
        "interactive_question",
        `type_${event.data.question_type}`,
        event.data.related_card
          ? `card_${event.data.related_card.toLowerCase().replace(/\s+/g, "_")}`
          : "",
        "user_insight",
      ].filter(Boolean),
      context: `Interactive question of type ${event.data.question_type}`,
      category: "personalization_insight",
      tags: ["interactive_learning", "user_insight", "personalization_data"],
      timestamp: new Date().toISOString(),
    };
  }
  analyzeResponseStyle(response) {
    const length = response.length;
    const emotionalWords = [
      "feel",
      "heart",
      "soul",
      "love",
      "fear",
      "hope",
      "dream",
    ];
    const analyticalWords = [
      "think",
      "analyze",
      "consider",
      "logic",
      "reason",
      "because",
    ];
    const hasEmotionalWords = emotionalWords.some((word) =>
      response.toLowerCase().includes(word),
    );
    const hasAnalyticalWords = analyticalWords.some((word) =>
      response.toLowerCase().includes(word),
    );
    if (length < 50) return "concise";
    if (hasEmotionalWords) return "emotional";
    if (hasAnalyticalWords) return "analytical";
    return "detailed";
  }
  analyzeResponseSentiment(response) {
    const positiveWords = [
      "good",
      "great",
      "love",
      "happy",
      "excited",
      "wonderful",
      "amazing",
    ];
    const negativeWords = [
      "bad",
      "hate",
      "sad",
      "worried",
      "terrible",
      "awful",
      "frustrated",
    ];
    const positiveCount = positiveWords.filter((word) =>
      response.toLowerCase().includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      response.toLowerCase().includes(word),
    ).length;
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }
  calculateEngagementLevel(metrics) {
    let score = 0;
    if (metrics.clicked) score += 2;
    if (metrics.interpretation_read) score += 3;
    if (metrics.hover_time_ms && metrics.hover_time_ms > 2000) score += 1;
    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  }
  assessInsightValue(response) {
    // Simple heuristic: longer responses with personal references likely contain insights
    return (
      response.length > 100 &&
      (response.toLowerCase().includes("i ") ||
        response.toLowerCase().includes("my ") ||
        response.toLowerCase().includes("me "))
    );
  }
  async updateResponsePatterns(userId, event) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;
    // Track response patterns
    const responseStyle = event.data.response_style;
    const responseTime = event.data.response_time;
    // Update personalization data based on response patterns
    if (responseStyle === "emotional") {
      if (
        !profile.personalization_data.growth_areas.includes(
          "emotional_guidance",
        )
      ) {
        profile.personalization_data.growth_areas.push("emotional_guidance");
      }
    } else if (responseStyle === "analytical") {
      if (
        !profile.personalization_data.growth_areas.includes("practical_wisdom")
      ) {
        profile.personalization_data.growth_areas.push("practical_wisdom");
      }
    }
    this.userProfiles.set(userId, profile);
  }
}
