/* eslint-disable no-fallthrough */
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaLearnerAgent = void 0;
var axios_1 = require("axios");
/**
 * PersonaLearner - The Adaptive Intelligence
 *
 * This agent learns from every user interaction to build personalized experiences.
 * It connects to the a-mem system to persist insights across sessions and enables
 * Sophia and other virtual readers to become more attuned to each user's needs.
 */
var PersonaLearnerAgent = /** @class */ (function () {
  function PersonaLearnerAgent() {
    this.userProfiles = new Map();
    this.learningQueue = [];
    this.supermemoryMcpUrl =
      process.env.SUPERMEMORY_MCP_URL || "http://localhost:4001";
  }
  /**
   * Log a completed reading interaction and learn from it
   */
  PersonaLearnerAgent.prototype.logInteraction = function (
    userId,
    session,
    userFeedback,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var learningEvent, reading, memoryNote, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, undefined, 6]);
            learningEvent = {
              eventType: "reading_completed",
              userId: userId,
              sessionId: session.sessionId,
              data: {
                reading_id: session.sessionId, // Use session ID as reading ID
                cards: session.cards.map(function (c) {
                  return c.name;
                }),
                spread_type: session.spreadType,
                narrative_length: 0, // No narrative in ConversationSession
                interpretation_count: session.cardInterpretations.length,
                feedback: userFeedback,
              },
              timestamp: new Date(),
              context: {
                spread_type: session.spreadType,
                cards_drawn: session.cards.map(function (c) {
                  return c.name;
                }),
                interpretation_quality: 0, // No quality in ConversationSession
                user_satisfaction:
                  (userFeedback === null || userFeedback === void 0
                    ? void 0
                    : userFeedback.rating) || undefined,
              },
            };
            // Add to learning queue
            this.learningQueue.push(learningEvent);
            reading = {
              id: session.sessionId,
              narrative: "", // No narrative in ConversationSession
              card_interpretations: session.cardInterpretations,
              overall_guidance: "", // No overall guidance in ConversationSession
              spiritual_insight: "", // No spiritual insight in ConversationSession
              reader_signature: "Sophia ✨",
              session_context: session.context,
              created_at: session.startTime,
            };
            return [4 /*yield*/, this.createMemoryNote(reading, userFeedback)];
          case 1:
            memoryNote = _a.sent();
            // Log to a-mem system
            return [4 /*yield*/, this.logToAMem(memoryNote)];
          case 2:
            // Log to a-mem system
            _a.sent();
            // Update user profile
            return [4 /*yield*/, this.updateUserProfile(userId, learningEvent)];
          case 3:
            // Update user profile
            _a.sent();
            // Process learning patterns
            return [4 /*yield*/, this.processLearningPatterns(userId)];
          case 4:
            // Process learning patterns
            _a.sent();
            console.log(
              "PersonaLearner: Logged interaction for user "
                .concat(userId, ", reading ")
                .concat(reading.id),
            );
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            console.error(
              "PersonaLearner: Failed to log interaction:",
              error_1,
            );
            throw error_1;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create a structured memory note for the a-mem system
   */
  PersonaLearnerAgent.prototype.createMemoryNote = function (
    reading,
    userFeedback,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var cardNames, spreadType, themes, keywords, memoryNote;
      var _a;
      return __generator(this, function (_b) {
        cardNames =
          ((_a = reading.session_context.cards) === null || _a === void 0
            ? void 0
            : _a.map(function (c) {
                return c.name;
              })) || [];
        spreadType = reading.session_context.spreadType;
        themes = this.extractThemes(
          reading.narrative + " " + reading.overall_guidance,
        );
        keywords = __spreadArray(
          __spreadArray(
            __spreadArray(
              __spreadArray(
                [],
                cardNames.map(function (name) {
                  return name.toLowerCase().replace(/\s+/g, "_");
                }),
                true,
              ),
              ["spread_".concat(spreadType)],
              false,
            ),
            themes,
            true,
          ),
          ["sophia_reading", "tarot_session"],
          false,
        );
        memoryNote = {
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
                function (interp) {
                  return interp.confidence_score > 0.8;
                },
              ),
            },
          }),
          keywords: keywords,
          context: "Tarot reading session with Sophia for ".concat(
            spreadType,
            " spread",
          ),
          category: "tarot_reading",
          tags: __spreadArray(
            [
              "user_interaction",
              "reading_completed",
              "sophia_session",
              "spread_".concat(spreadType),
            ],
            cardNames.slice(0, 3).map(function (name) {
              return "card_".concat(name.toLowerCase().replace(/\s+/g, "_"));
            }),
            true,
          ),
          timestamp: new Date().toISOString(),
        };
        return [2 /*return*/, memoryNote];
      });
    });
  };
  /**
   * Log memory note to the a-mem system via Python script
   */
  PersonaLearnerAgent.prototype.logToAMem = function (memoryNote) {
    return __awaiter(this, void 0, void 0, function () {
      var payload, response, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            payload = {
              userId: memoryNote.id, // Assuming memoryNote.id can serve as userId for Supermemory
              entryType: memoryNote.category || "general_memory",
              data: JSON.parse(memoryNote.content),
              synthesisPrompt: memoryNote.context,
            };
            return [
              4 /*yield*/,
              axios_1.default.post(
                "".concat(this.supermemoryMcpUrl, "/record"),
                payload,
              ),
            ];
          case 1:
            response = _a.sent();
            if (response.status === 201) {
              console.log(
                "PersonaLearner: Successfully logged to Supermemory MCP",
              );
            } else {
              throw new Error(
                "Supermemory MCP logging failed with status: ".concat(
                  response.status,
                ),
              );
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error(
              "PersonaLearner: Supermemory MCP logging failed:",
              error_2,
            );
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update user profile based on learning event
   */
  PersonaLearnerAgent.prototype.updateUserProfile = function (userId, event) {
    return __awaiter(this, void 0, void 0, function () {
      var profile, spreadType, _i, _a, card, currentScore, newScore;
      var _b;
      return __generator(this, function (_c) {
        profile = this.userProfiles.get(userId);
        if (!profile) {
          profile = {
            userId: userId,
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
          spreadType = event.data.spread_type;
          if (!profile.preferences.preferred_spreads.includes(spreadType)) {
            profile.preferences.preferred_spreads.push(spreadType);
          }
          // Update favorite cards based on positive feedback
          if (
            (_b = event.data.feedback) === null || _b === void 0
              ? void 0
              : _b.helpful_cards
          ) {
            for (
              _i = 0, _a = event.data.feedback.helpful_cards;
              _i < _a.length;
              _i++
            ) {
              card = _a[_i];
              if (!profile.preferences.favorite_cards.includes(card)) {
                profile.preferences.favorite_cards.push(card);
              }
            }
          }
          // Update learning patterns
          profile.learning_patterns.cards_drawn_total +=
            event.data.cards.length;
          profile.learning_patterns.last_active = event.timestamp;
          if (event.context.user_satisfaction) {
            currentScore = profile.learning_patterns.engagement_score;
            newScore = event.context.user_satisfaction / 5.0;
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
        return [2 /*return*/];
      });
    });
  };
  /**
   * Process learning patterns to identify insights
   */
  PersonaLearnerAgent.prototype.processLearningPatterns = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var profile,
        recentEvents,
        spreadPreferences,
        cardAffinities,
        engagementPatterns;
      return __generator(this, function (_a) {
        profile = this.userProfiles.get(userId);
        if (!profile) return [2 /*return*/];
        recentEvents = this.learningQueue.filter(
          function (event) {
            return (
              event.userId === userId &&
              event.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            );
          }, // Last 30 days
        );
        spreadPreferences = this.analyzeSpreadPreferences(recentEvents);
        cardAffinities = this.analyzeCardAffinities(recentEvents);
        engagementPatterns = this.analyzeEngagementPatterns(recentEvents);
        // Log insights
        console.log("PersonaLearner: User ".concat(userId, " patterns:"), {
          spread_preferences: spreadPreferences,
          card_affinities: cardAffinities,
          engagementLevel: engagementPatterns.average_satisfaction,
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get personalization recommendations for a user
   */
  PersonaLearnerAgent.prototype.getPersonalizationRecommendations = function (
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var profile, engagementLevel;
      return __generator(this, function (_a) {
        profile = this.userProfiles.get(userId);
        if (!profile) {
          return [
            2 /*return*/,
            {
              recommended_spreads: ["three-card"],
              card_preferences: [],
              personalized_themes: [],
              engagementLevel: "medium",
            },
          ];
        }
        engagementLevel =
          profile.learning_patterns.engagement_score > 0.7
            ? "high"
            : profile.learning_patterns.engagement_score > 0.4
              ? "medium"
              : "low";
        return [
          2 /*return*/,
          {
            recommended_spreads: profile.preferences.preferred_spreads.slice(
              0,
              3,
            ),
            card_preferences: profile.preferences.favorite_cards.slice(0, 5),
            personalized_themes: profile.personalization_data.growth_areas,
            engagementLevel: engagementLevel,
          },
        ];
      });
    });
  };
  /**
   * Helper methods for analysis
   */
  PersonaLearnerAgent.prototype.extractThemes = function (text) {
    var commonThemes = [
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
    return commonThemes.filter(function (theme) {
      return text.toLowerCase().includes(theme);
    });
  };
  PersonaLearnerAgent.prototype.generateCardCombinations = function (
    cardNames,
  ) {
    var combinations = [];
    for (var i = 0; i < cardNames.length - 1; i++) {
      combinations.push("".concat(cardNames[i], "+").concat(cardNames[i + 1]));
    }
    return combinations;
  };
  PersonaLearnerAgent.prototype.calculateReadingQuality = function (reading) {
    var quality = 0.5; // Base quality
    // Narrative length indicates depth
    if (reading.narrative.length > 500) quality += 0.2;
    // Multiple interpretations show thoroughness
    if (reading.card_interpretations.length > 2) quality += 0.1;
    // High confidence interpretations indicate good data
    var avgConfidence =
      reading.card_interpretations.reduce(function (sum, interp) {
        return sum + interp.confidence_score;
      }, 0) / reading.card_interpretations.length;
    quality += avgConfidence * 0.2;
    return Math.min(quality, 1.0);
  };
  PersonaLearnerAgent.prototype.analyzeSpreadPreferences = function (events) {
    var spreadCounts = {};
    events.forEach(function (event) {
      var spread = event.context.spread_type;
      spreadCounts[spread] = (spreadCounts[spread] || 0) + 1;
    });
    return spreadCounts;
  };
  PersonaLearnerAgent.prototype.analyzeCardAffinities = function (events) {
    var cardCounts = {};
    events.forEach(function (event) {
      event.context.cards_drawn.forEach(function (card) {
        cardCounts[card] = (cardCounts[card] || 0) + 1;
      });
    });
    return cardCounts;
  };
  PersonaLearnerAgent.prototype.analyzeEngagementPatterns = function (events) {
    var satisfactionScores = events
      .map(function (e) {
        return e.context.user_satisfaction;
      })
      .filter(function (score) {
        return score !== undefined;
      });
    var averageSatisfaction =
      satisfactionScores.length > 0
        ? satisfactionScores.reduce(function (sum, score) {
            return sum + score;
          }, 0) / satisfactionScores.length
        : 0;
    return {
      average_satisfaction: averageSatisfaction,
      session_count: events.length,
      feedback_rate: satisfactionScores.length / events.length,
    };
  };
  /**
   * Retrieve user memories from Supermemory MCP for personalization
   */
  PersonaLearnerAgent.prototype.retrieveUserMemories = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var response, journeyEntries, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, undefined, 3]);
            console.log(
              "PersonaLearner: Retrieving memories for user ".concat(
                userId,
                " from Supermemory MCP",
              ),
            );
            return [
              4 /*yield*/,
              axios_1.default.get(
                "".concat(this.supermemoryMcpUrl, "/journey/").concat(userId),
              ),
            ];
          case 1:
            response = _a.sent();
            if (response.status === 200) {
              journeyEntries = response.data.journey;
              console.log(
                "PersonaLearner: Retrieved "
                  .concat(journeyEntries.length, " memories for user ")
                  .concat(userId, " from Supermemory MCP"),
              );
              // Map journey entries to MemoryNote format
              return [
                2 /*return*/,
                journeyEntries.map(function (entry) {
                  return {
                    content: JSON.stringify(entry.data),
                    id: entry.id,
                    keywords: [], // Supermemory doesn't store keywords directly, can be derived from data
                    context: entry.synthesis_prompt,
                    category: entry.entry_type,
                    tags: [], // Supermemory doesn't store tags directly
                    timestamp: entry.created_at,
                    retrieval_count: 0, // Not tracked by Supermemory
                    last_accessed: entry.created_at, // Use created_at as last_accessed for now
                  };
                }),
              ];
            } else {
              throw new Error(
                "Supermemory MCP retrieval failed with status: ".concat(
                  response.status,
                ),
              );
            }
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error(
              "PersonaLearner: Failed to retrieve user memories from Supermemory MCP:",
              error_3,
            );
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Progressive Reveal System - Check and increment engagement level
   */
  PersonaLearnerAgent.prototype.checkAndIncrementEngagementLevel = function (
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var currentLevel,
        userMemories,
        engagementMetrics,
        newLevel,
        updated,
        thresholdName,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId) {
              console.log(
                "PersonaLearner: Skipping engagement level check for guest user",
              );
              return [
                2 /*return*/,
                { levelIncreased: false, newLevel: 1, previousLevel: 1 },
              ];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, undefined, 7]);
            console.log(
              "PersonaLearner: Checking engagement level for user ".concat(
                userId,
              ),
            );
            return [4 /*yield*/, this.getCurrentEngagementLevel(userId)];
          case 2:
            currentLevel = _a.sent();
            return [4 /*yield*/, this.retrieveUserMemories(userId)];
          case 3:
            userMemories = _a.sent();
            engagementMetrics = this.analyzeEngagementMetrics(userMemories);
            newLevel = this.calculateNewEngagementLevel(
              engagementMetrics,
              currentLevel,
            );
            if (!(newLevel > currentLevel)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.updateEngagementLevel(userId, newLevel)];
          case 4:
            updated = _a.sent();
            if (updated) {
              thresholdName = this.getThresholdName(newLevel);
              console.log(
                "PersonaLearner: User "
                  .concat(userId, " leveled up from ")
                  .concat(currentLevel, " to ")
                  .concat(newLevel, " (")
                  .concat(thresholdName, ")"),
              );
              return [
                2 /*return*/,
                {
                  levelIncreased: true,
                  newLevel: newLevel,
                  previousLevel: currentLevel,
                  thresholdMet: thresholdName,
                },
              ];
            }
            _a.label = 5;
          case 5:
            return [
              2 /*return*/,
              {
                levelIncreased: false,
                newLevel: currentLevel,
                previousLevel: currentLevel,
              },
            ];
          case 6:
            error_4 = _a.sent();
            console.error(
              "PersonaLearner: Failed to check engagement level:",
              error_4,
            );
            return [
              2 /*return*/,
              { levelIncreased: false, newLevel: 1, previousLevel: 1 },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get current engagement level from database
   */
  PersonaLearnerAgent.prototype.getCurrentEngagementLevel = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var storedLevel;
      return __generator(this, function (_a) {
        try {
          storedLevel =
            localStorage === null || localStorage === void 0
              ? void 0
              : localStorage.getItem("engagementLevel_".concat(userId));
          return [2 /*return*/, storedLevel ? parseInt(storedLevel) : 1];
        } catch (error) {
          console.warn(
            "PersonaLearner: Could not retrieve current engagement level:",
            error,
          );
          return [2 /*return*/, 1]; // Default to level 1
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Analyze user memories to calculate engagement metrics
   */
  PersonaLearnerAgent.prototype.analyzeEngagementMetrics = function (
    userMemories,
  ) {
    var completedReadings = 0;
    var conversationTurns = 0;
    var questionsAnswered = 0;
    var uniqueSessions = new Set();
    var totalEngagement = 0;
    var engagementCount = 0;
    userMemories.forEach(function (memory) {
      var _a;
      try {
        if (memory.content && typeof memory.content === "string") {
          var memoryData = JSON.parse(memory.content);
          // Count completed readings
          if (memoryData.reading_summary) {
            completedReadings++;
            var sessionId =
              memoryData.reading_summary.session_id ||
              ((_a = memoryData.interaction_data) === null || _a === void 0
                ? void 0
                : _a.session_id);
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
    var avgEngagement =
      engagementCount > 0 ? totalEngagement / engagementCount : 0;
    // Calculate consistency score based on session frequency
    var consistencyScore = Math.min(uniqueSessions.size / 10, 1); // Max at 10 sessions
    return {
      completedReadings: completedReadings,
      conversationTurns: conversationTurns,
      questionsAnswered: questionsAnswered,
      sessionCount: uniqueSessions.size,
      engagementScore: avgEngagement,
      consistencyScore: consistencyScore,
    };
  };
  /**
   * Calculate new engagement level based on metrics
   */
  PersonaLearnerAgent.prototype.calculateNewEngagementLevel = function (
    metrics,
    currentLevel,
  ) {
    // Engagement thresholds (cumulative)
    var thresholds = [
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
    var qualifiedLevel = 1;
    for (
      var _i = 0, thresholds_1 = thresholds;
      _i < thresholds_1.length;
      _i++
    ) {
      var threshold = thresholds_1[_i];
      var meetsReadings = metrics.completedReadings >= threshold.readings;
      var meetsTurns = metrics.conversationTurns >= threshold.turns;
      var meetsQuestions = metrics.questionsAnswered >= threshold.questions;
      // Must meet at least 2 out of 3 criteria, or have exceptional performance in one area
      var criteriaCount = [meetsReadings, meetsTurns, meetsQuestions].filter(
        Boolean,
      ).length;
      var exceptionalReadings =
        metrics.completedReadings >= threshold.readings * 1.5;
      var exceptionalTurns = metrics.conversationTurns >= threshold.turns * 1.5;
      if (criteriaCount >= 2 || exceptionalReadings || exceptionalTurns) {
        qualifiedLevel = threshold.level;
      }
    }
    // Only allow level increases, never decreases
    return Math.max(qualifiedLevel, currentLevel);
  };
  /**
   * Update engagement level in database
   */
  PersonaLearnerAgent.prototype.updateEngagementLevel = function (
    userId,
    newLevel,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        try {
          // For testing, store in localStorage
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(
              "engagementLevel_".concat(userId),
              newLevel.toString(),
            );
          }
          // In production, this would call the Supabase function
          // const { error } = await supabase.rpc('increment_reader_engagementLevel', {
          //   user_id: userId,
          //   new_level: newLevel
          // });
          console.log(
            "PersonaLearner: Updated engagement level for user "
              .concat(userId, " to ")
              .concat(newLevel),
          );
          return [2 /*return*/, true];
        } catch (error) {
          console.error(
            "PersonaLearner: Failed to update engagement level:",
            error,
          );
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Get threshold name for level
   */
  PersonaLearnerAgent.prototype.getThresholdName = function (level) {
    var names = {
      1: "Novice Seeker",
      2: "Curious Student",
      3: "Dedicated Practitioner",
      4: "Enlightened Seeker",
      5: "Master Oracle",
    };
    return names[level] || "Unknown Level";
  };
  /**
   * Get detailed engagement analysis for user
   */
  PersonaLearnerAgent.prototype.getEngagementAnalysis = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var currentLevel_1,
        userMemories,
        metrics,
        thresholds,
        nextThreshold,
        progressToNext,
        readingProgress,
        turnProgress,
        questionProgress,
        error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId) {
              return [
                2 /*return*/,
                {
                  currentLevel: 1,
                  levelName: "Guest User",
                  metrics: {},
                  nextThreshold: undefined,
                  progressToNext: 0,
                },
              ];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, undefined, 5]);
            return [4 /*yield*/, this.getCurrentEngagementLevel(userId)];
          case 2:
            currentLevel_1 = _a.sent();
            return [4 /*yield*/, this.retrieveUserMemories(userId)];
          case 3:
            userMemories = _a.sent();
            metrics = this.analyzeEngagementMetrics(userMemories);
            thresholds = [
              { level: 2, readings: 3, turns: 10, questions: 2 },
              { level: 3, readings: 10, turns: 30, questions: 8 },
              { level: 4, readings: 25, turns: 75, questions: 20 },
              { level: 5, readings: 50, turns: 150, questions: 40 },
            ];
            nextThreshold = thresholds.find(function (t) {
              return t.level > currentLevel_1;
            });
            progressToNext = 0;
            if (nextThreshold) {
              readingProgress =
                metrics.completedReadings / nextThreshold.readings;
              turnProgress = metrics.conversationTurns / nextThreshold.turns;
              questionProgress =
                metrics.questionsAnswered / nextThreshold.questions;
              progressToNext =
                Math.max(readingProgress, turnProgress, questionProgress) * 100;
            }
            return [
              2 /*return*/,
              {
                currentLevel: currentLevel_1,
                levelName: this.getThresholdName(currentLevel_1),
                metrics: metrics,
                nextThreshold: nextThreshold,
                progressToNext: Math.min(progressToNext, 100),
              },
            ];
          case 4:
            error_5 = _a.sent();
            console.error(
              "PersonaLearner: Failed to get engagement analysis:",
              error_5,
            );
            return [
              2 /*return*/,
              {
                currentLevel: 1,
                levelName: "Novice Seeker",
                metrics: {},
                nextThreshold: undefined,
                progressToNext: 0,
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get learning statistics for monitoring
   */
  PersonaLearnerAgent.prototype.getStats = function () {
    var lastActivity =
      this.learningQueue.length > 0
        ? this.learningQueue[this.learningQueue.length - 1].timestamp
        : null;
    var interactionEvents = this.learningQueue.filter(function (e) {
      return [
        "conversation_turn",
        "user_response",
        "card_revealed",
        "question_answered",
      ].includes(e.eventType);
    }).length;
    var conversationTurns = this.learningQueue.filter(function (e) {
      return e.eventType === "conversation_turn";
    }).length;
    return {
      total_users: this.userProfiles.size,
      total_events: this.learningQueue.length,
      memory_notes_logged: this.learningQueue.length, // Assuming 1:1 ratio for now
      last_activity: lastActivity,
      interaction_events: interactionEvents,
      conversation_turns: conversationTurns,
    };
  };
  /**
   * Interactive Learning Hooks for Real-time Events
   */
  /**
   * Log a conversation turn for learning
   */
  PersonaLearnerAgent.prototype.logConversationTurn = function (
    userId,
    sessionId,
    conversationState,
    turnNumber,
    sophiaDialogue,
    userResponse,
    revealedCard,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var learningEvent, memoryNote, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId) return [2 /*return*/]; // Skip for guest users
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, undefined, 5]);
            learningEvent = {
              eventType: "conversation_turn",
              userId: userId,
              sessionId: sessionId,
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
            return [
              4 /*yield*/,
              this.createConversationMemoryNote(learningEvent),
            ];
          case 2:
            memoryNote = _a.sent();
            return [4 /*yield*/, this.logToAMem(memoryNote)];
          case 3:
            _a.sent();
            console.log(
              "PersonaLearner: Logged conversation turn "
                .concat(turnNumber, " for user ")
                .concat(userId),
            );
            return [3 /*break*/, 5];
          case 4:
            error_6 = _a.sent();
            console.error(
              "PersonaLearner: Failed to log conversation turn:",
              error_6,
            );
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log user response patterns for preference learning
   */
  PersonaLearnerAgent.prototype.logUserResponse = function (
    userId,
    sessionId,
    responseText,
    responseContext,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var learningEvent, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, undefined, 4]);
            learningEvent = {
              eventType: "user_response",
              userId: userId,
              sessionId: sessionId,
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
            return [
              4 /*yield*/,
              this.updateResponsePatterns(userId, learningEvent),
            ];
          case 2:
            // Update user profile with response patterns
            _a.sent();
            console.log(
              "PersonaLearner: Logged user response for user ".concat(userId),
            );
            return [3 /*break*/, 4];
          case 3:
            error_7 = _a.sent();
            console.error(
              "PersonaLearner: Failed to log user response:",
              error_7,
            );
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log card reveal engagement for timing optimization
   */
  PersonaLearnerAgent.prototype.logCardReveal = function (
    userId,
    sessionId,
    cardName,
    cardIndex,
    engagementMetrics,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var learningEvent;
      return __generator(this, function (_a) {
        if (!userId) return [2 /*return*/];
        try {
          learningEvent = {
            eventType: "card_revealed",
            userId: userId,
            sessionId: sessionId,
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
          console.log(
            "PersonaLearner: Logged card reveal for ".concat(cardName),
          );
        } catch (error) {
          console.error("PersonaLearner: Failed to log card reveal:", error);
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Log interactive question responses for personalization
   */
  PersonaLearnerAgent.prototype.logQuestionResponse = function (
    userId,
    sessionId,
    question,
    response,
    questionContext,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var learningEvent, memoryNote, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!userId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, undefined, 6]);
            learningEvent = {
              eventType: "question_answered",
              userId: userId,
              sessionId: sessionId,
              data: {
                question: question,
                response: response,
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
            if (!learningEvent.data.provides_new_insight)
              return [3 /*break*/, 4];
            return [4 /*yield*/, this.createQuestionMemoryNote(learningEvent)];
          case 2:
            memoryNote = _a.sent();
            return [4 /*yield*/, this.logToAMem(memoryNote)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            console.log(
              "PersonaLearner: Logged question response for user ".concat(
                userId,
              ),
            );
            return [3 /*break*/, 6];
          case 5:
            error_8 = _a.sent();
            console.error(
              "PersonaLearner: Failed to log question response:",
              error_8,
            );
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Helper methods for interactive learning
   */
  PersonaLearnerAgent.prototype.createConversationMemoryNote = function (
    event,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
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
              "state_".concat(event.data.conversation_state),
              "turn_".concat(event.data.turn_number),
              event.data.revealed_card
                ? "card_".concat(
                    event.data.revealed_card.card.name
                      .toLowerCase()
                      .replace(/\s+/g, "_"),
                  )
                : "",
              "sophia_interaction",
            ].filter(Boolean),
            context: "Conversation turn "
              .concat(event.data.turn_number, " in state ")
              .concat(event.data.conversation_state),
            category: "conversation_learning",
            tags: [
              "real_time_learning",
              "conversation_turn",
              "sophia_interaction",
            ],
            timestamp: new Date().toISOString(),
          },
        ];
      });
    });
  };
  PersonaLearnerAgent.prototype.createQuestionMemoryNote = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
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
              "type_".concat(event.data.question_type),
              event.data.related_card
                ? "card_".concat(
                    event.data.related_card.toLowerCase().replace(/\s+/g, "_"),
                  )
                : "",
              "user_insight",
            ].filter(Boolean),
            context: "Interactive question of type ".concat(
              event.data.question_type,
            ),
            category: "personalization_insight",
            tags: [
              "interactive_learning",
              "user_insight",
              "personalization_data",
            ],
            timestamp: new Date().toISOString(),
          },
        ];
      });
    });
  };
  PersonaLearnerAgent.prototype.analyzeResponseStyle = function (response) {
    var length = response.length;
    var emotionalWords = [
      "feel",
      "heart",
      "soul",
      "love",
      "fear",
      "hope",
      "dream",
    ];
    var analyticalWords = [
      "think",
      "analyze",
      "consider",
      "logic",
      "reason",
      "because",
    ];
    var hasEmotionalWords = emotionalWords.some(function (word) {
      return response.toLowerCase().includes(word);
    });
    var hasAnalyticalWords = analyticalWords.some(function (word) {
      return response.toLowerCase().includes(word);
    });
    if (length < 50) return "concise";
    if (hasEmotionalWords) return "emotional";
    if (hasAnalyticalWords) return "analytical";
    return "detailed";
  };
  PersonaLearnerAgent.prototype.analyzeResponseSentiment = function (response) {
    var positiveWords = [
      "good",
      "great",
      "love",
      "happy",
      "excited",
      "wonderful",
      "amazing",
    ];
    var negativeWords = [
      "bad",
      "hate",
      "sad",
      "worried",
      "terrible",
      "awful",
      "frustrated",
    ];
    var positiveCount = positiveWords.filter(function (word) {
      return response.toLowerCase().includes(word);
    }).length;
    var negativeCount = negativeWords.filter(function (word) {
      return response.toLowerCase().includes(word);
    }).length;
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };
  PersonaLearnerAgent.prototype.calculateEngagementLevel = function (metrics) {
    var score = 0;
    if (metrics.clicked) score += 2;
    if (metrics.interpretation_read) score += 3;
    if (metrics.hover_time_ms && metrics.hover_time_ms > 2000) score += 1;
    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  };
  PersonaLearnerAgent.prototype.assessInsightValue = function (response) {
    // Simple heuristic: longer responses with personal references likely contain insights
    return (
      response.length > 100 &&
      (response.toLowerCase().includes("i ") ||
        response.toLowerCase().includes("my ") ||
        response.toLowerCase().includes("me "))
    );
  };
  PersonaLearnerAgent.prototype.updateResponsePatterns = function (
    userId,
    event,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var profile, responseStyle, responseTime;
      return __generator(this, function (_a) {
        profile = this.userProfiles.get(userId);
        if (!profile) return [2 /*return*/];
        responseStyle = event.data.response_style;
        responseTime = event.data.response_time;
        // Update personalization data based on response patterns
        if (responseStyle === "emotional") {
          if (
            !profile.personalization_data.growth_areas.includes(
              "emotional_guidance",
            )
          ) {
            profile.personalization_data.growth_areas.push(
              "emotional_guidance",
            );
          }
        } else if (responseStyle === "analytical") {
          if (
            !profile.personalization_data.growth_areas.includes(
              "practical_wisdom",
            )
          ) {
            profile.personalization_data.growth_areas.push("practical_wisdom");
          }
        }
        this.userProfiles.set(userId, profile);
        return [2 /*return*/];
      });
    });
  };
  return PersonaLearnerAgent;
})();
exports.PersonaLearnerAgent = PersonaLearnerAgent;
