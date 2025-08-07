/* eslint-disable no-fallthrough, no-sparse-arrays */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SophiaAgent = exports.ConversationState = void 0;
var server_1 = require("../lib/supabase/server");
var PersonaLearner_1 = require("./PersonaLearner");
// Conversational State Machine Enums
var ConversationState;
(function (ConversationState) {
    ConversationState["AWAITING_DRAW"] = "AWAITING_DRAW";
    ConversationState["REVEALING_CARD_1"] = "REVEALING_CARD_1";
    ConversationState["INTERPRETING_CARD_1"] = "INTERPRETING_CARD_1";
    ConversationState["AWAITING_INPUT_1"] = "AWAITING_INPUT_1";
    ConversationState["INTERACTIVE_QUESTION_1"] = "INTERACTIVE_QUESTION_1";
    ConversationState["REVEALING_CARD_2"] = "REVEALING_CARD_2";
    ConversationState["INTERPRETING_CARD_2"] = "INTERPRETING_CARD_2";
    ConversationState["AWAITING_INPUT_2"] = "AWAITING_INPUT_2";
    ConversationState["INTERACTIVE_QUESTION_2"] = "INTERACTIVE_QUESTION_2";
    ConversationState["REVEALING_CARD_3"] = "REVEALING_CARD_3";
    ConversationState["INTERPRETING_CARD_3"] = "INTERPRETING_CARD_3";
    ConversationState["AWAITING_INPUT_3"] = "AWAITING_INPUT_3";
    ConversationState["FINAL_SYNTHESIS"] = "FINAL_SYNTHESIS";
    ConversationState["READING_COMPLETE"] = "READING_COMPLETE";
    // Added missing states
    ConversationState["CARD_INTERPRETATION"] = "CARD_INTERPRETATION";
    ConversationState["ASKING_QUESTION"] = "ASKING_QUESTION";
    ConversationState["AWAITING_USER_RESPONSE"] = "AWAITING_USER_RESPONSE";
    ConversationState["PROVIDING_GUIDANCE"] = "PROVIDING_GUIDANCE";
})(ConversationState || (exports.ConversationState = ConversationState = {}));
/**
 * Sophia - The Weaver of Wisdom
 *
 * Sophia embodies the archetype of the wise woman, the keeper of ancient knowledge
 * who speaks with gentle authority and profound compassion. She specializes in:
 * - Synthesizing knowledge pool interpretations into soulful narratives
 * - Adapting her voice to each user's spiritual journey
 * - Weaving multiple card meanings into coherent wisdom
 * - Providing guidance that honors both tradition and personal growth
 */
var SophiaAgent = /** @class */ (function () {
    // Fixed: Remove duplicate constructors
    function SophiaAgent() {
        this.personality = {
            voice: "gentle, wise, compassionate",
            archetype: "The Wise Woman, The Keeper of Ancient Knowledge",
            specialties: [
                "spiritual synthesis",
                "narrative weaving",
                "compassionate guidance",
            ],
            signature_phrases: [
                "The cards whisper ancient truths",
                "Your soul already knows the way",
                "In the tapestry of your journey",
                "The universe conspires in your favor",
                "Trust the wisdom within",
            ],
            tone: "nurturing yet empowering, mystical yet grounded",
        };
        this.personaLearner = new PersonaLearner_1.PersonaLearnerAgent();
        this.conversationSessions = new Map();
        this.initializeSupabase();
    }
    // Fixed: Remove duplicate function
    SophiaAgent.prototype.initializeSupabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        _a.supabase = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a complete personalized reading by querying the Knowledge Pool
     * and synthesizing interpretations through Sophia's wise perspective
     */
    SophiaAgent.prototype.getReading = function (cards, spreadType, context) {
        return __awaiter(this, void 0, void 0, function () {
            var userMemories, memoryError_1, cardInterpretations, i, card, positionName, _a, interpretationData, error, interpretation, narrative, overallGuidance, spiritualInsight, reading, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 13, , 14]);
                        userMemories = [];
                        if (!context.userId) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.personaLearner.retrieveUserMemories(context.userId)];
                    case 2:
                        userMemories = _b.sent();
                        console.log("Sophia: Retrieved ".concat(userMemories.length, " memories for user ").concat(context.userId));
                        return [3 /*break*/, 4];
                    case 3:
                        memoryError_1 = _b.sent();
                        console.warn("Sophia: Could not retrieve user memories, proceeding with base reading:", memoryError_1);
                        return [3 /*break*/, 4];
                    case 4:
                        cardInterpretations = [];
                        i = 0;
                        _b.label = 5;
                    case 5:
                        if (!(i < cards.length)) return [3 /*break*/, 9];
                        card = cards[i];
                        positionName = this.getPositionName(spreadType, i);
                        return [4 /*yield*/, this.supabase
                                .from("tarot_interpretations")
                                .select("*")
                                .eq("card_name", card.name)
                                .eq("spread_type", spreadType)
                                .eq("position_name", positionName)
                                .single()];
                    case 6:
                        _a = _b.sent(), interpretationData = _a.data, error = _a.error;
                        if (error) {
                            console.warn("No specific interpretation found for ".concat(card.name, " in ").concat(positionName, ", using fallback"));
                        }
                        return [4 /*yield*/, this.createPersonalizedInterpretation(card, interpretationData, positionName, context, i, userMemories)];
                    case 7:
                        interpretation = _b.sent();
                        cardInterpretations.push(interpretation);
                        _b.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 5];
                    case 9: return [4 /*yield*/, this.synthesizeNarrative(cards, cardInterpretations, spreadType, context, userMemories)];
                    case 10:
                        narrative = _b.sent();
                        return [4 /*yield*/, this.synthesizeOverallGuidance(cardInterpretations, context, userMemories)];
                    case 11:
                        overallGuidance = _b.sent();
                        return [4 /*yield*/, this.generateSpiritualInsight(cards, context, userMemories)];
                    case 12:
                        spiritualInsight = _b.sent();
                        reading = {
                            id: "sophia_reading_".concat(Date.now(), "_").concat(Math.random()
                                .toString(36)
                                .substring(2, 11)),
                            narrative: narrative,
                            card_interpretations: cardInterpretations,
                            overall_guidance: overallGuidance,
                            spiritual_insight: spiritualInsight,
                            reader_signature: this.generateReaderSignature(),
                            session_context: context,
                            created_at: new Date(),
                        };
                        return [2 /*return*/, reading];
                    case 13:
                        error_1 = _b.sent();
                        console.error("Sophia reading generation failed:", error_1);
                        throw new Error("Unable to channel the cosmic wisdom at this time: ".concat(error_1));
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process a turn in the conversational reading flow
     * This is the main method for the Living Oracle Initiative
     */
    SophiaAgent.prototype.processReadingTurn = function (sessionId, currentState, userInput, cards, context) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        session = this.conversationSessions.get(sessionId);
                        // Initialize session if this is the first turn
                        if (!session && currentState === ConversationState.AWAITING_DRAW) {
                            if (!cards || !context) {
                                throw new Error("Cards and context required for new session");
                            }
                            session = {
                                sessionId: sessionId,
                                userId: context.userId,
                                spreadType: context.spreadType,
                                cards: cards,
                                currentState: ConversationState.AWAITING_DRAW,
                                currentCardIndex: 0,
                                userResponses: [],
                                cardInterpretations: [],
                                startTime: new Date(),
                                context: context,
                            };
                            this.conversationSessions.set(sessionId, session);
                        }
                        if (!session) {
                            throw new Error("Session ".concat(sessionId, " not found"));
                        }
                        // Record user input if provided
                        if (userInput) {
                            session.userResponses.push({
                                state: currentState,
                                input: userInput,
                                timestamp: new Date(),
                            });
                        }
                        return [4 /*yield*/, this.processStateTransition(session, userInput)];
                    case 1: 
                    // Process the current state and determine the next action
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Sophia conversation turn failed:", error_2);
                        throw new Error("Unable to process the cosmic conversation: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process state transitions in the conversation flow
     */
    SophiaAgent.prototype.processStateTransition = function (session, userInput) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = session.currentState;
                        switch (_a) {
                            case ConversationState.AWAITING_DRAW: return [3 /*break*/, 1];
                            case ConversationState.REVEALING_CARD_1: return [3 /*break*/, 3];
                            case ConversationState.REVEALING_CARD_2: return [3 /*break*/, 3];
                            case ConversationState.REVEALING_CARD_3: return [3 /*break*/, 3];
                            case ConversationState.INTERPRETING_CARD_1: return [3 /*break*/, 5];
                            case ConversationState.INTERPRETING_CARD_2: return [3 /*break*/, 5];
                            case ConversationState.INTERPRETING_CARD_3: return [3 /*break*/, 5];
                            case ConversationState.AWAITING_INPUT_1: return [3 /*break*/, 7];
                            case ConversationState.AWAITING_INPUT_2: return [3 /*break*/, 7];
                            case ConversationState.AWAITING_INPUT_3: return [3 /*break*/, 7];
                            case ConversationState.INTERACTIVE_QUESTION_1: return [3 /*break*/, 9];
                            case ConversationState.INTERACTIVE_QUESTION_2: return [3 /*break*/, 9];
                            case ConversationState.FINAL_SYNTHESIS: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.handleAwaitingDraw(session)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.handleRevealingCard(session)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.handleInterpretingCard(session)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.handleAwaitingInput(session, userInput)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.handleInteractiveQuestion(session, userInput)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.handleFinalSynthesis(session)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: throw new Error("Unknown conversation state: ".concat(session.currentState));
                }
            });
        });
    };
    /**
     * Handle the initial draw state
     */
    SophiaAgent.prototype.handleAwaitingDraw = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var signaturePhrase;
            return __generator(this, function (_a) {
                signaturePhrase = this.personality.signature_phrases[Math.floor(Math.random() * this.personality.signature_phrases.length)];
                session.currentState = ConversationState.REVEALING_CARD_1;
                this.conversationSessions.set(session.sessionId, session);
                return [2 /*return*/, {
                        dialogue: "Welcome, beautiful soul. ".concat(signaturePhrase, " as we begin this sacred journey together. I have drawn three cards that hold the wisdom you seek. Let us unveil them one by one, allowing each to speak its truth in its own time."),
                        newState: ConversationState.REVEALING_CARD_1,
                        options: [
                            { id: "begin", text: "Begin the reading", value: "begin" },
                            { id: "pause", text: "Take a moment first", value: "pause" },
                        ],
                    }];
            });
        });
    };
    /**
     * Handle revealing a card
     */
    SophiaAgent.prototype.handleRevealingCard = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var cardIndex, card, positionName, dialogue, nextState;
            return __generator(this, function (_a) {
                cardIndex = this.getCurrentCardIndex(session.currentState);
                card = session.cards[cardIndex];
                positionName = this.getPositionName(session.spreadType, cardIndex);
                dialogue = "";
                if (cardIndex === 0) {
                    dialogue = "I now reveal your first card: **".concat(card.name, "** in the position of ").concat(positionName, ". ");
                    dialogue += "The energy of this card fills the space between us. Take a moment to feel its presence.";
                    nextState = ConversationState.INTERPRETING_CARD_1;
                }
                else if (cardIndex === 1) {
                    dialogue = "Your second card emerges: **".concat(card.name, "** in the position of ").concat(positionName, ". ");
                    dialogue += "See how it dances with the wisdom of your first card, creating a deeper tapestry of meaning.";
                    nextState = ConversationState.INTERPRETING_CARD_2;
                }
                else {
                    dialogue = "And now, your final card is revealed: **".concat(card.name, "** in the position of ").concat(positionName, ". ");
                    dialogue += "The trinity is complete. Feel how all three cards now speak as one unified voice.";
                    nextState = ConversationState.INTERPRETING_CARD_3;
                }
                session.currentState = nextState;
                session.currentCardIndex = cardIndex;
                this.conversationSessions.set(session.sessionId, session);
                return [2 /*return*/, {
                        dialogue: dialogue,
                        newState: nextState,
                        revealedCard: {
                            card: card,
                            position: positionName,
                        },
                        options: [
                            { id: "continue", text: "Continue", value: "continue" },
                            { id: "reflect", text: "Let me reflect on this", value: "reflect" },
                        ],
                    }];
            });
        });
    };
    /**
     * Handle interpreting a card
     */
    SophiaAgent.prototype.handleInterpretingCard = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var cardIndex, card, positionName, userMemories, memoryError_2, _a, interpretationData, error, interpretation, dialogue, nextState;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cardIndex = this.getCurrentCardIndex(session.currentState);
                        card = session.cards[cardIndex];
                        positionName = this.getPositionName(session.spreadType, cardIndex);
                        userMemories = [];
                        if (!session.userId) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.personaLearner.retrieveUserMemories(session.userId)];
                    case 2:
                        userMemories = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        memoryError_2 = _b.sent();
                        console.warn("Could not retrieve user memories:", memoryError_2);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.supabase
                            .from("tarot_interpretations")
                            .select("*")
                            .eq("card_name", card.name)
                            .eq("spread_type", session.spreadType)
                            .eq("position_name", positionName)
                            .single()];
                    case 5:
                        _a = _b.sent(), interpretationData = _a.data, error = _a.error;
                        if (error) {
                            console.warn("No specific interpretation found for ".concat(card.name, " in ").concat(positionName));
                        }
                        return [4 /*yield*/, this.createPersonalizedInterpretation(card, interpretationData, positionName, session.context, cardIndex, userMemories)];
                    case 6:
                        interpretation = _b.sent();
                        session.cardInterpretations[cardIndex] = interpretation;
                        dialogue = interpretation.personalized_guidance;
                        // Determine next state based on current card
                        if (cardIndex === 0) {
                            nextState = ConversationState.AWAITING_INPUT_1;
                        }
                        else if (cardIndex === 1) {
                            nextState = ConversationState.AWAITING_INPUT_2;
                        }
                        else {
                            nextState = ConversationState.AWAITING_INPUT_3;
                        }
                        session.currentState = nextState;
                        this.conversationSessions.set(session.sessionId, session);
                        return [2 /*return*/, {
                                dialogue: dialogue,
                                newState: nextState,
                                revealedCard: {
                                    card: card,
                                    position: positionName,
                                    interpretation: interpretation,
                                },
                                options: [
                                    { id: "tell_more", text: "Tell me more", value: "tell_more" },
                                    { id: "continue", text: "Continue to next step", value: "continue" },
                                    { id: "reflect", text: "I need to reflect on this", value: "reflect" },
                                ],
                            }];
                }
            });
        });
    };
    /**
     * Handle awaiting user input
     */
    SophiaAgent.prototype.handleAwaitingInput = function (session, userInput) {
        return __awaiter(this, void 0, void 0, function () {
            var cardIndex, dialogue, nextState, card, interpretation, interactiveQuestion;
            return __generator(this, function (_a) {
                cardIndex = this.getCurrentCardIndex(session.currentState);
                if (!userInput) {
                    throw new Error("User input required for this state");
                }
                dialogue = "";
                if (userInput === "tell_more") {
                    card = session.cards[cardIndex];
                    interpretation = session.cardInterpretations[cardIndex];
                    dialogue = "".concat(interpretation.spiritual_wisdom, " ").concat(interpretation.practical_advice);
                    nextState = this.getInteractiveQuestionState(cardIndex);
                }
                else if (userInput === "continue") {
                    nextState = this.getInteractiveQuestionState(cardIndex);
                    dialogue =
                        "I sense you are ready to deepen our connection with this card's wisdom.";
                }
                else if (userInput === "reflect") {
                    dialogue =
                        "Take all the time you need, dear one. The cards will wait patiently for your heart to open to their message.";
                    nextState = this.getInteractiveQuestionState(cardIndex);
                }
                else {
                    dialogue = "I feel your energy shifting as you process this wisdom.";
                    nextState = this.getInteractiveQuestionState(cardIndex);
                }
                interactiveQuestion = this.createInteractiveQuestion(session.cards[cardIndex], session.cardInterpretations[cardIndex]);
                session.currentState = nextState;
                this.conversationSessions.set(session.sessionId, session);
                return [2 /*return*/, {
                        dialogue: dialogue + " " + interactiveQuestion.question,
                        newState: nextState,
                        interactiveQuestion: interactiveQuestion,
                        options: interactiveQuestion.options,
                    }];
            });
        });
    };
    /**
     * Handle interactive question responses and log to PersonaLearner
     */
    SophiaAgent.prototype.handleInteractiveQuestion = function (session, userInput) {
        return __awaiter(this, void 0, void 0, function () {
            var cardIndex, card, interpretation, mockReading, mockSession, error_3, dialogue, nextState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!userInput) {
                            throw new Error("User input required for interactive question");
                        }
                        cardIndex = this.getCurrentCardIndex(session.currentState);
                        card = session.cards[cardIndex];
                        interpretation = session.cardInterpretations[cardIndex];
                        if (!session.userId) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        mockReading = {
                            id: "interactive_".concat(session.sessionId, "_card_").concat(cardIndex),
                            narrative: "Interactive question response for ".concat(card.name),
                            card_interpretations: [interpretation],
                            overall_guidance: "User responded: ".concat(userInput),
                            spiritual_insight: "Interactive engagement deepens understanding",
                            reader_signature: "Sophia ✨",
                            session_context: session.context,
                            created_at: new Date(),
                        };
                        mockSession = {
                            sessionId: mockReading.id,
                            userId: mockReading.session_context.userId,
                            spreadType: mockReading.session_context.spreadType,
                            cards: [], // No cards in mock reading
                            currentState: ConversationState.READING_COMPLETE,
                            currentCardIndex: 0,
                            userResponses: [],
                            cardInterpretations: mockReading.card_interpretations,
                            startTime: mockReading.created_at,
                            context: mockReading.session_context,
                        };
                        return [4 /*yield*/, this.personaLearner.logInteraction(session.userId, mockSession, {
                                rating: 5, // Assume positive engagement
                                helpful_cards: [card.name],
                                session_notes: "Interactive response: ".concat(userInput, " for card ").concat(card.name),
                            })];
                    case 2:
                        _a.sent();
                        console.log("Logged interactive response for user ".concat(session.userId, ": ").concat(userInput));
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.warn("Failed to log interactive response:", error_3);
                        return [3 /*break*/, 4];
                    case 4:
                        dialogue = this.generateResponseToInteractiveAnswer(card, userInput);
                        // Determine next state based on current card
                        if (cardIndex === 0) {
                            nextState = ConversationState.REVEALING_CARD_2;
                            dialogue += " Now, let us see what your second card reveals...";
                        }
                        else if (cardIndex === 1) {
                            nextState = ConversationState.REVEALING_CARD_3;
                            dialogue +=
                                " The final card awaits to complete the tapestry of wisdom...";
                        }
                        else {
                            nextState = ConversationState.FINAL_SYNTHESIS;
                            dialogue +=
                                " Now let me weave all three cards together to reveal the complete message...";
                        }
                        session.currentState = nextState;
                        this.conversationSessions.set(session.sessionId, session);
                        return [2 /*return*/, {
                                dialogue: dialogue,
                                newState: nextState,
                                options: [{ id: "continue", text: "Continue", value: "continue" }],
                            }];
                }
            });
        });
    };
    /**
     * Handle final synthesis of the three-card reading
     */
    SophiaAgent.prototype.handleFinalSynthesis = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var userMemories, memories, error_4, narrative, overallGuidance, spiritualInsight, finalReading, dialogue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userMemories = [];
                        if (!session.userId) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.personaLearner.retrieveUserMemories(session.userId)];
                    case 2:
                        memories = _a.sent();
                        userMemories.push.apply(userMemories, memories);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        console.warn("Could not retrieve user memories for synthesis:", error_4);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, this.synthesizeNarrative(session.cards, session.cardInterpretations, session.spreadType, session.context, userMemories)];
                    case 5:
                        narrative = _a.sent();
                        return [4 /*yield*/, this.synthesizeOverallGuidance(session.cardInterpretations, session.context, userMemories)];
                    case 6:
                        overallGuidance = _a.sent();
                        return [4 /*yield*/, this.generateSpiritualInsight(session.cards, session.context, userMemories)];
                    case 7:
                        spiritualInsight = _a.sent();
                        finalReading = {
                            id: "sophia_conversation_".concat(session.sessionId),
                            narrative: narrative,
                            card_interpretations: session.cardInterpretations,
                            overall_guidance: overallGuidance,
                            spiritual_insight: spiritualInsight,
                            reader_signature: this.generateReaderSignature(),
                            session_context: session.context,
                            created_at: new Date(),
                        };
                        session.currentState = ConversationState.READING_COMPLETE;
                        this.conversationSessions.set(session.sessionId, session);
                        dialogue = "As our sacred conversation draws to a close, I offer you this synthesis of all that has emerged:\n\n".concat(overallGuidance, "\n\n").concat(spiritualInsight);
                        return [2 /*return*/, {
                                dialogue: dialogue,
                                newState: ConversationState.READING_COMPLETE,
                                finalReading: finalReading,
                                options: [
                                    {
                                        id: "save_reading",
                                        text: "Save this reading",
                                        value: "save_reading",
                                    },
                                    { id: "reflect", text: "I need time to reflect", value: "reflect" },
                                    {
                                        id: "new_reading",
                                        text: "Start a new reading",
                                        value: "new_reading",
                                    },
                                ],
                            }];
                }
            });
        });
    };
    /**
     * Helper method to get current card index from state
     */
    SophiaAgent.prototype.getCurrentCardIndex = function (state) {
        if (state.includes("_1"))
            return 0;
        if (state.includes("_2"))
            return 1;
        if (state.includes("_3"))
            return 2;
        return 0;
    };
    /**
     * Helper method to get interactive question state
     */
    SophiaAgent.prototype.getInteractiveQuestionState = function (cardIndex) {
        if (cardIndex === 0)
            return ConversationState.INTERACTIVE_QUESTION_1;
        if (cardIndex === 1)
            return ConversationState.INTERACTIVE_QUESTION_2;
        return ConversationState.FINAL_SYNTHESIS; // No interactive question for 3rd card
    };
    /**
     * Create interactive questions based on card themes
     */
    SophiaAgent.prototype.createInteractiveQuestion = function (card, interpretation) {
        var cardQuestions = {
            "The Hermit": {
                question: "Does this card's theme of introspection deeply resonate with you right now?",
                options: [
                    { id: "deeply", text: "Yes, deeply", value: "deeply" },
                    { id: "somewhat", text: "Somewhat", value: "somewhat" },
                    { id: "not_at_all", text: "Not at all", value: "not_at_all" },
                ],
                theme: "introspection",
            },
            "The Tower": {
                question: "Are you currently experiencing or anticipating significant changes in your life?",
                options: [
                    {
                        id: "major_changes",
                        text: "Yes, major changes",
                        value: "major_changes",
                    },
                    {
                        id: "small_shifts",
                        text: "Small shifts only",
                        value: "small_shifts",
                    },
                    {
                        id: "stable_period",
                        text: "Life feels stable",
                        value: "stable_period",
                    },
                ],
                theme: "transformation",
            },
            "The Star": {
                question: "How connected do you feel to your sense of hope and inspiration lately?",
                options: [
                    {
                        id: "very_connected",
                        text: "Very connected",
                        value: "very_connected",
                    },
                    {
                        id: "seeking_hope",
                        text: "Seeking more hope",
                        value: "seeking_hope",
                    },
                    {
                        id: "feeling_lost",
                        text: "Feeling a bit lost",
                        value: "feeling_lost",
                    },
                ],
                theme: "hope",
            },
            "Ace of Swords": {
                question: "Are you experiencing new clarity or breakthrough thoughts recently?",
                options: [
                    {
                        id: "clear_breakthrough",
                        text: "Yes, clear breakthroughs",
                        value: "clear_breakthrough",
                    },
                    {
                        id: "some_clarity",
                        text: "Some new clarity",
                        value: "some_clarity",
                    },
                    {
                        id: "still_confused",
                        text: "Still seeking clarity",
                        value: "still_confused",
                    },
                ],
                theme: "clarity",
            },
        };
        // Return specific question for known cards, or create generic one
        if (cardQuestions[card.name]) {
            return cardQuestions[card.name];
        }
        // Generic question based on card type
        if (card.arcana === "major") {
            return {
                question: "How strongly does the spiritual message of ".concat(card.name, " speak to your current life situation?"),
                options: [
                    {
                        id: "very_relevant",
                        text: "Very relevant",
                        value: "very_relevant",
                    },
                    {
                        id: "somewhat_relevant",
                        text: "Somewhat relevant",
                        value: "somewhat_relevant",
                    },
                    { id: "exploring", text: "Still exploring this", value: "exploring" },
                ],
                theme: "spiritual_relevance",
            };
        }
        else {
            return {
                question: "Does the practical guidance of ".concat(card.name, " align with your current needs?"),
                options: [
                    {
                        id: "perfectly_aligned",
                        text: "Perfectly aligned",
                        value: "perfectly_aligned",
                    },
                    {
                        id: "partially_helpful",
                        text: "Partially helpful",
                        value: "partially_helpful",
                    },
                    {
                        id: "need_different_guidance",
                        text: "Need different guidance",
                        value: "need_different_guidance",
                    },
                ],
                theme: "practical_alignment",
            };
        }
    };
    /**
     * Generate personalized response to interactive answer
     */
    SophiaAgent.prototype.generateResponseToInteractiveAnswer = function (card, userInput) {
        var responseMap = {
            deeply: "I feel the deep resonance between your soul and this card's message. This alignment suggests you are truly ready to receive its wisdom.",
            somewhat: "The subtle connection you feel is the beginning of understanding. Sometimes wisdom reveals itself gradually.",
            not_at_all: "Even when a card's message seems distant, it often carries seeds of truth that will bloom when the time is right.",
            major_changes: "Your awareness of these changes shows you are consciously participating in your transformation journey.",
            small_shifts: "Small shifts often herald greater changes to come. You are being prepared gently.",
            stable_period: "Stability creates the foundation from which meaningful growth can emerge when you are ready.",
            very_connected: "Your strong connection to hope is a precious gift that will guide you through any challenge.",
            seeking_hope: "The very act of seeking hope is itself a form of hope. You are closer than you think.",
            feeling_lost: "In moments of feeling lost, we are actually being called to discover new directions. Trust the process.",
            clear_breakthrough: "These breakthroughs are gifts from your higher wisdom. Honor them by taking inspired action.",
            some_clarity: "Some new clarity builds upon the last. You are gathering the pieces of a greater understanding.",
            still_confused: "Confusion often precedes the greatest insights. Be patient with yourself as clarity emerges.",
            very_relevant: "This strong relevance indicates you are in perfect alignment with this card's timing and message.",
            somewhat_relevant: "The partial relevance suggests there are layers of meaning yet to be discovered.",
            exploring: "Your willingness to explore shows an open heart. This is where wisdom enters.",
            perfectly_aligned: "Perfect alignment is a rare gift. Trust this guidance completely.",
            partially_helpful: "Partial help often leads to complete understanding as you integrate the wisdom.",
            need_different_guidance: "Sometimes we need to hear what we don't expect to find what we truly need.",
        };
        return (responseMap[userInput] ||
            "Your response reveals the unique way you process wisdom. This itself is valuable insight.");
    };
    /**
     * Create a personalized interpretation for a single card
     */
    SophiaAgent.prototype.createPersonalizedInterpretation = function (card_1, knowledgePoolData_1, positionName_1, context_1, cardIndex_1) {
        return __awaiter(this, arguments, void 0, function (card, knowledgePoolData, positionName, context, cardIndex, userMemories) {
            var baseInterpretation, personalizationHooks, personalizedGuidance, spiritualWisdom, practicalAdvice, readerNotes, confidenceScore, sourceReferences;
            if (userMemories === void 0) { userMemories = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        baseInterpretation = (knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.base_meaning) ||
                            this.generateFallbackInterpretation(card, positionName);
                        personalizationHooks = (knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.personalization_hooks) || [];
                        return [4 /*yield*/, this.generateSophiaGuidance(card, baseInterpretation, positionName, context, personalizationHooks, userMemories)];
                    case 1:
                        personalizedGuidance = _a.sent();
                        spiritualWisdom = (knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.spiritual_wisdom) ||
                            this.generateSpiritualWisdom(card, positionName);
                        practicalAdvice = (knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.actionable_reflection) ||
                            this.generatePracticalAdvice(card, positionName);
                        readerNotes = this.generateReaderNotes(card, knowledgePoolData, context);
                        confidenceScore = this.calculateConfidenceScore(knowledgePoolData, context);
                        sourceReferences = [
                            "Mystic Arcana Knowledge Pool",
                            (knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.db_entry_id) || "Sophia's Ancient Wisdom",
                            "Rider-Waite Tarot Tradition",
                        ];
                        return [2 /*return*/, {
                                base_interpretation: baseInterpretation,
                                personalized_guidance: personalizedGuidance,
                                spiritual_wisdom: spiritualWisdom,
                                practical_advice: practicalAdvice,
                                reader_notes: readerNotes,
                                confidence_score: confidenceScore,
                                source_references: sourceReferences,
                            }];
                }
            });
        });
    };
    /**
     * Generate Sophia's signature guidance style with memory synthesis
     */
    SophiaAgent.prototype.generateSophiaGuidance = function (card_1, baseInterpretation_1, positionName_1, context_1, personalizationHooks_1) {
        return __awaiter(this, arguments, void 0, function (card, baseInterpretation, positionName, context, personalizationHooks, userMemories) {
            var signaturePhrase, memoryInsights, guidance, temporalInsights, cardHistory, archetypeEnergy, primaryTheme, relevantHook;
            if (userMemories === void 0) { userMemories = []; }
            return __generator(this, function (_a) {
                signaturePhrase = this.personality.signature_phrases[Math.floor(Math.random() * this.personality.signature_phrases.length)];
                memoryInsights = this.analyzeUserMemories(card, userMemories);
                guidance = "\u2728 **Beloved Soul**, ".concat(signaturePhrase.toLowerCase(), " as **").concat(card.name, "** emerges in your **").concat(positionName, "**.\n\n");
                temporalInsights = this.generateTemporalInsights();
                guidance += "\uD83C\uDF19 **Cosmic Timing**: ".concat(temporalInsights, " This celestial moment amplifies ").concat(card.name, "'s profound message.\n\n");
                // Add memory-aware context with deeper personalization
                if (memoryInsights.previousEncounters.length > 0) {
                    cardHistory = memoryInsights.previousEncounters[0];
                    guidance += "\uD83D\uDD2E **Sacred Recognition**: Our soul's journey together reveals **".concat(card.name, "** returning to you, ");
                    guidance += "resonant with your previous exploration of themes including ".concat(cardHistory.themes.join(", "), ". ");
                    guidance += "The universe invites you to revisit these sacred patterns with the wisdom you've gained since our last encounter.\n\n";
                }
                else {
                    guidance += "\uD83C\uDF1F **First Sacred Encounter**: This marks **".concat(card.name, "**'s inaugural appearance in our mystical work together, ");
                    guidance += "signaling a significant new chapter unfolding in your spiritual evolution. Pay special attention to this divine initiation.\n\n";
                }
                archetypeEnergy = this.getArchetypeEnergy(card);
                guidance += "\uD83D\uDC9C **Archetypal Essence**: ".concat(archetypeEnergy.message, " ");
                guidance += "**".concat(card.name, "** embodies the divine energy of *").concat(archetypeEnergy.essence, "*, ");
                guidance += "".concat(archetypeEnergy.positionalMeaning, "\n\n");
                // Add base interpretation with enhanced mystical context
                guidance += "\uD83C\uDF19 **Core Divine Message**: ".concat(baseInterpretation, "\n\n");
                // Synthesize memory patterns with deeper psychological insight
                if (memoryInsights.recurringThemes.length > 0) {
                    primaryTheme = memoryInsights.recurringThemes[0];
                    guidance += "\uD83D\uDD04 **Soul Pattern Recognition**: Your readings consistently illuminate the sacred theme of **".concat(primaryTheme, "**. ");
                    guidance += "".concat(card.name, " now appears as your spiritual teacher, offering divine keys to transform this recurring pattern ");
                    guidance += "into conscious mastery. The universe doesn't simply repeat lessons\u2014it deepens and refines them for your highest growth.\n\n";
                }
                // Add specific memory synthesis for common patterns
                if (memoryInsights.progressionPattern) {
                    guidance += "".concat(memoryInsights.progressionPattern, " ");
                }
                // Add personalization if available
                if (personalizationHooks.length > 0) {
                    relevantHook = personalizationHooks[0];
                    if (relevantHook.interpretation) {
                        guidance += "Your soul's journey suggests that ".concat(relevantHook.interpretation.toLowerCase(), ". ");
                    }
                }
                // Add Sophia's empowerment with memory awareness
                if (userMemories.length > 0) {
                    guidance += "As I reflect on our journey together, I see how much you've grown in understanding. ";
                    guidance += "Trust in this continued evolution, for each reading builds upon the last. ";
                }
                else {
                    guidance += "Remember, dear one, that you carry within you all the wisdom needed to navigate this path. ";
                    guidance += "Trust in the unfolding of your spiritual evolution. ";
                }
                return [2 /*return*/, guidance];
            });
        });
    };
    /**
     * Analyze user memories for relevant patterns and insights
     */
    SophiaAgent.prototype.analyzeUserMemories = function (currentCard, userMemories) {
        var _a;
        var _b, _c;
        var insights = {
            previousEncounters: [],
            recurringThemes: [],
            progressionPattern: null,
        };
        if (userMemories.length === 0)
            return insights;
        // Analyze each memory for card patterns
        for (var _i = 0, userMemories_1 = userMemories; _i < userMemories_1.length; _i++) {
            var memory = userMemories_1[_i];
            try {
                if (memory.content && typeof memory.content === "string") {
                    var memoryData = JSON.parse(memory.content);
                    var readingSummary = memoryData.reading_summary;
                    if (readingSummary && readingSummary.cards) {
                        // Check if current card appeared before
                        if (readingSummary.cards.includes(currentCard.name)) {
                            var themes = ((_b = memoryData.learning_insights) === null || _b === void 0 ? void 0 : _b.themes_identified) || [];
                            insights.previousEncounters.push({
                                card: currentCard.name,
                                themes: themes,
                                timestamp: readingSummary.timestamp || memory.timestamp,
                            });
                        }
                        // Collect themes for pattern analysis
                        if ((_c = memoryData.learning_insights) === null || _c === void 0 ? void 0 : _c.themes_identified) {
                            (_a = insights.recurringThemes).push.apply(_a, memoryData.learning_insights.themes_identified);
                        }
                    }
                }
            }
            catch (parseError) {
                // Skip malformed memory entries
                continue;
            }
        }
        // Find most common themes
        var themeCounts = {};
        insights.recurringThemes.forEach(function (theme) {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
        insights.recurringThemes = Object.entries(themeCounts)
            .sort(function (_a, _b) {
            var a = _a[1];
            var b = _b[1];
            return b - a;
        })
            .slice(0, 3)
            .map(function (_a) {
            var theme = _a[0];
            return theme;
        });
        // Generate progression pattern for specific card combinations
        if (insights.previousEncounters.length > 0 && userMemories.length > 1) {
            insights.progressionPattern = this.generateProgressionPattern(currentCard, userMemories);
        }
        return insights;
    };
    /**
     * Generate progression pattern narrative based on user's reading history
     */
    SophiaAgent.prototype.generateProgressionPattern = function (currentCard, userMemories) {
        // Look for meaningful patterns between cards
        var progressionMappings = {
            "The Tower": {
                "Ace of Swords": "Remembering our previous discussions around The Tower and the sudden changes you were navigating, this new clarity may be the very tool you need to cut through old ways of thinking and build anew.",
                "The Star": "After the upheaval of The Tower in your previous reading, The Star now brings the hope and healing you've been seeking.",
                "Three of Pentacles": "The foundation-shaking energy of The Tower you experienced before now gives way to collaborative rebuilding.",
            },
            "The Hermit": {
                "The Sun": "Your period of introspection with The Hermit has led to this beautiful emergence into The Sun's radiant clarity.",
                "Two of Cups": "The wisdom you gained during your Hermit journey now blossoms into meaningful connection.",
            },
            Death: {
                "Ace of Wands": "The transformation of Death you've been processing now ignites as pure creative potential in the Ace of Wands.",
                "The Fool": "Having moved through Death's profound transformation, you now step forward as The Fool on a completely new journey.",
            },
        };
        // Try to find patterns in recent memory
        try {
            var recentCards = userMemories
                .map(function (memory) {
                var _a;
                if (memory.content && typeof memory.content === "string") {
                    var data = JSON.parse(memory.content);
                    return ((_a = data.reading_summary) === null || _a === void 0 ? void 0 : _a.cards) || [];
                }
                return [];
            })
                .flat()
                .filter(Boolean);
            for (var _i = 0, recentCards_1 = recentCards; _i < recentCards_1.length; _i++) {
                var previousCard = recentCards_1[_i];
                if (progressionMappings[previousCard] &&
                    progressionMappings[previousCard][currentCard.name]) {
                    return progressionMappings[previousCard][currentCard.name];
                }
            }
        }
        catch (error) {
            // Return empty string if pattern analysis fails
        }
        return "";
    };
    /**
     * Synthesize overall narrative connecting all cards
     */
    SophiaAgent.prototype.synthesizeNarrative = function (cards_1, interpretations_1, spreadType_1, context_1) {
        return __awaiter(this, arguments, void 0, function (cards, interpretations, spreadType, context, userMemories) {
            var narrative, spreadIntroductions, majorArcana, minorArcana;
            if (userMemories === void 0) { userMemories = []; }
            return __generator(this, function (_a) {
                narrative = "Beloved seeker, as I gaze upon your ".concat(spreadType.replace("-", " "), " spread, ");
                narrative += "I see a beautiful tapestry of wisdom woven by the cosmic forces. ";
                spreadIntroductions = {
                    single: "The universe has chosen a single, powerful message for you today.",
                    "three-card": "Your past, present, and future dance together in perfect harmony, each informing the others.",
                    "celtic-cross": "The ancient Celtic Cross reveals the intricate web of influences surrounding your question.",
                    horseshoe: "Like a horseshoe's protective embrace, these cards offer guidance and fortune.",
                    relationship: "The sacred dance of connection unfolds before us, revealing the deeper truths of the heart.",
                    custom: "This custom spread reveals unique insights tailored specifically to your journey.",
                };
                narrative +=
                    spreadIntroductions[spreadType] ||
                        "The cards have arranged themselves in a pattern of profound significance.";
                narrative += "\n\n";
                // Weave card meanings together
                if (cards.length === 1) {
                    narrative += "".concat(cards[0].name, " speaks to you with singular clarity, ");
                    narrative += "offering the precise guidance your soul needs at this moment.";
                }
                else if (cards.length === 3) {
                    narrative += "I see how ".concat(cards[0].name, " has shaped your journey, ");
                    narrative += "leading to the current energy of ".concat(cards[1].name, ", ");
                    narrative += "which now opens the path toward ".concat(cards[2].name, ".");
                }
                else {
                    majorArcana = cards.filter(function (c) { return c.arcana === "major"; });
                    minorArcana = cards.filter(function (c) { return c.arcana === "minor"; });
                    if (majorArcana.length > 0) {
                        narrative += "The presence of ".concat(majorArcana.length > 1 ? "Major Arcana cards" : "the Major Arcana", " ");
                        narrative += "signals that significant spiritual themes are at play. ";
                    }
                    if (minorArcana.length > 0) {
                        narrative += "The Minor Arcana cards speak to the practical aspects of your journey, ";
                        narrative += "offering concrete guidance for your daily path.";
                    }
                }
                narrative += "\n\nLet me share what the cards reveal...";
                return [2 /*return*/, narrative];
            });
        });
    };
    /**
     * Synthesize overall guidance from all interpretations
     */
    SophiaAgent.prototype.synthesizeOverallGuidance = function (interpretations_1, context_1) {
        return __awaiter(this, arguments, void 0, function (interpretations, context, userMemories) {
            var guidance, themes;
            if (userMemories === void 0) { userMemories = []; }
            return __generator(this, function (_a) {
                guidance = "As I weave together the wisdom of your spread, several key themes emerge. ";
                themes = this.extractCommonThemes(interpretations);
                if (themes.length > 0) {
                    guidance += "The cards speak consistently of ".concat(themes.join(", "), ", ");
                    guidance += "suggesting these are the areas where the universe seeks your attention. ";
                }
                // Add overall empowerment
                guidance += "\n\nRemember, precious soul, that you are both the author and the hero of your story. ";
                guidance += "These cards do not dictate your future\u2014they illuminate the path you are already walking ";
                guidance += "and empower you to walk it with greater consciousness and grace. ";
                guidance += "\n\nTrust in your inner wisdom, for it resonates with the same cosmic intelligence ";
                guidance += "that speaks through these ancient symbols. Your journey is unfolding exactly as it should.";
                return [2 /*return*/, guidance];
            });
        });
    };
    /**
     * Generate spiritual insight connecting to user's deeper journey
     */
    SophiaAgent.prototype.generateSpiritualInsight = function (cards_1, context_1) {
        return __awaiter(this, arguments, void 0, function (cards, context, userMemories) {
            var insight, spiritualCards;
            if (userMemories === void 0) { userMemories = []; }
            return __generator(this, function (_a) {
                insight = "On a deeper spiritual level, this reading reveals that you are being called ";
                insight += "to embrace a new level of consciousness and self-understanding. ";
                spiritualCards = cards.filter(function (card) {
                    return [
                        "The High Priestess",
                        "The Hermit",
                        "The Star",
                        "The Moon",
                        "The Sun",
                        "Judgment",
                        "The World",
                    ].includes(card.name);
                });
                if (spiritualCards.length > 0) {
                    insight += "The presence of ".concat(spiritualCards[0].name, " ");
                    insight += "particularly emphasizes the spiritual dimensions of your current experience. ";
                }
                insight += "\n\nThe universe is inviting you to trust in the perfect timing of your awakening. ";
                insight += "Every experience, every challenge, every moment of joy is part of your soul's ";
                insight += "carefully orchestrated curriculum for growth and expansion.";
                return [2 /*return*/, insight];
            });
        });
    };
    /**
     * Generate Sophia's signature for the reading
     */
    SophiaAgent.prototype.generateReaderSignature = function () {
        var signatures = [
            "With infinite love and cosmic blessings, Sophia ✨",
            "In sacred service to your highest good, Sophia 🌙",
            "Walking beside you on the path of wisdom, Sophia 💫",
            "Channeling ancient wisdom for your journey, Sophia 🔮",
            "With deep reverence for your spiritual path, Sophia ⭐",
        ];
        return signatures[Math.floor(Math.random() * signatures.length)];
    };
    /**
     * Helper method to get position name for a given spread and index
     */
    SophiaAgent.prototype.getPositionName = function (spreadType, index) {
        // Fixed: Added missing 'custom' property
        var positions = {
            single: ["Your Guidance"],
            "three-card": ["Past", "Present", "Future"],
            "celtic-cross": [
                "Present",
                "Challenge",
                "Distant Past",
                "Recent Past",
                "Possible Outcome",
                "Near Future",
                "Your Approach",
                "External",
                "Hopes & Fears",
                "Final Outcome",
            ],
            horseshoe: [
                "Past",
                "Present",
                "Hidden Factors",
                "Advice",
                "Likely Outcome",
            ],
            relationship: ["You", "Them", "Connection", "Challenges", "Potential"],
            custom: ["Custom Position 1", "Custom Position 2", "Custom Position 3"],
        };
        var spreadPositions = positions[spreadType] || ["Position"];
        return spreadPositions[index] || "Position ".concat(index + 1);
    };
    /**
     * Generate fallback interpretation when Knowledge Pool data is unavailable
     */
    SophiaAgent.prototype.generateFallbackInterpretation = function (card, positionName) {
        var meaning = card.isReversed
            ? card.meaning.reversed ||
                "This card's reversed energy asks for inner reflection"
            : card.meaning.upright || "This card brings positive energy to your path";
        return ("In the ".concat(positionName, " position, ").concat(card.name, " speaks to ").concat(meaning.toLowerCase(), ". ") +
            "The ancient wisdom of this card invites you to consider how its energy applies to this aspect of your journey.");
    };
    /**
     * Generate spiritual wisdom for a card
     */
    SophiaAgent.prototype.generateSpiritualWisdom = function (card, positionName) {
        return ("".concat(card.name, " carries the spiritual teaching that every experience serves your highest evolution. ") +
            "In the ".concat(positionName, ", this card reminds you that you are exactly where you need to be for your soul's growth."));
    };
    /**
     * Generate practical advice for a card
     */
    SophiaAgent.prototype.generatePracticalAdvice = function (card, positionName) {
        return ("Consider how the energy of ".concat(card.name, " can be practically applied in your daily life. ") +
            "Take one small action today that honors the wisdom this card offers in your ".concat(positionName, "."));
    };
    /**
     * Generate reader notes about the interpretation
     */
    SophiaAgent.prototype.generateReaderNotes = function (card, knowledgePoolData, context) {
        var notes = "Sophia's Notes: ".concat(card.name, " appeared with ");
        if (knowledgePoolData) {
            notes += "rich Knowledge Pool guidance, offering deep personalized insight. ";
        }
        else {
            notes += "the pure energy of ancient wisdom, speaking directly to your soul. ";
        }
        if (card.isReversed) {
            notes += "The reversed position suggests a need for inner reflection and patience with your growth process.";
        }
        else {
            notes += "The upright position indicates flowing energy and positive manifestation potential.";
        }
        return notes;
    };
    /**
     * Calculate confidence score based on available data
     */
    SophiaAgent.prototype.calculateConfidenceScore = function (knowledgePoolData, context) {
        var _a;
        var score = 0.6; // Base confidence
        if (knowledgePoolData)
            score += 0.3; // Knowledge Pool data available
        if (context.userId)
            score += 0.1; // User context available
        if (((_a = knowledgePoolData === null || knowledgePoolData === void 0 ? void 0 : knowledgePoolData.personalization_hooks) === null || _a === void 0 ? void 0 : _a.length) > 0)
            score += 0.1; // Personalization available
        return Math.min(score, 1.0);
    };
    /**
     * Extract common themes from multiple interpretations
     */
    SophiaAgent.prototype.extractCommonThemes = function (interpretations) {
        var themes = [];
        // Simple keyword analysis - could be enhanced with NLP
        var commonWords = [
            "growth",
            "transformation",
            "love",
            "wisdom",
            "change",
            "journey",
            "spiritual",
        ];
        var _loop_1 = function (theme) {
            var count = interpretations.filter(function (interp) {
                return interp.personalized_guidance.toLowerCase().includes(theme) ||
                    interp.spiritual_wisdom.toLowerCase().includes(theme);
            }).length;
            if (count >= Math.ceil(interpretations.length / 2)) {
                themes.push(theme);
            }
        };
        for (var _i = 0, commonWords_1 = commonWords; _i < commonWords_1.length; _i++) {
            var theme = commonWords_1[_i];
            _loop_1(theme);
        }
        return themes.slice(0, 3); // Return top 3 themes
    };
    /**
     * Get Sophia's personality information for external use
     */
    SophiaAgent.prototype.getPersonality = function () {
        return this.personality;
    };
    /**
     * Health check method
     */
    SophiaAgent.prototype.healthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from("tarot_interpretations")
                                .select("count", { count: "exact", head: true })];
                    case 1:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        return [2 /*return*/, !error];
                    case 2:
                        _b = _c.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate temporal insights based on current cosmic timing
     */
    SophiaAgent.prototype.generateTemporalInsights = function () {
        var now = new Date();
        var hour = now.getHours();
        var day = now.getDay();
        var moonPhase = this.getMoonPhase(now);
        var insight = "";
        // Time of day insights
        if (hour >= 5 && hour < 12) {
            insight += "The morning's fresh energy awakens new possibilities. ";
        }
        else if (hour >= 12 && hour < 17) {
            insight += "The afternoon's focused power supports manifestation and action. ";
        }
        else if (hour >= 17 && hour < 21) {
            insight += "The evening's reflective wisdom illuminates deeper understanding. ";
        }
        else {
            insight += "The night's mystical veil reveals hidden truths and inner knowing. ";
        }
        // Moon phase insights
        switch (moonPhase) {
            case 'new':
                insight += "Under the New Moon's blessing, this is a time for planting seeds of intention.";
                break;
            case 'waxing':
                insight += "The Waxing Moon's growing light supports building and expanding your dreams.";
                break;
            case 'full':
                insight += "The Full Moon's radiant power brings completion and profound revelation.";
                break;
            case 'waning':
                insight += "The Waning Moon's gentle release supports letting go and inner healing.";
                break;
        }
        return insight;
    };
    /**
     * Get moon phase for temporal insights
     */
    SophiaAgent.prototype.getMoonPhase = function (date) {
        // Simplified lunar cycle calculation (approximation)
        var dayOfMonth = date.getDate();
        if (dayOfMonth <= 7)
            return 'new';
        if (dayOfMonth <= 14)
            return 'waxing';
        if (dayOfMonth <= 21)
            return 'full';
        return 'waning';
    };
    /**
     * Get archetypal energy information for a card
     */
    SophiaAgent.prototype.getArchetypeEnergy = function (card) {
        // Major Arcana archetypes
        var majorArchetypes = {
            "The Fool": {
                essence: "The Innocent Wanderer",
                message: "Your soul calls you to embrace new beginnings with childlike wonder.",
                positionalMeaning: "representing pure potential and the courage to step into the unknown."
            },
            "The Magician": {
                essence: "The Divine Creator",
                message: "You possess all the tools needed to manifest your deepest desires.",
                positionalMeaning: "channeling focused will and creative power into reality."
            },
            "The High Priestess": {
                essence: "The Sacred Keeper of Mysteries",
                message: "Your intuitive wisdom holds keys to profound spiritual understanding.",
                positionalMeaning: "guiding you to trust the whispers of your inner knowing."
            },
            "Justice": {
                essence: "The Divine Balancer",
                message: "The universe seeks to restore equilibrium through your conscious choices.",
                positionalMeaning: "bringing clarity to moral decisions and karmic resolution."
            }
        };
        // Minor Arcana suit essences
        var suitArchetypes = {
            "cups": {
                essence: "The Heart's Sacred Waters",
                message: "Emotional depths and spiritual love flow through this moment.",
                positionalMeaning: "inviting you to honor your feelings and spiritual connections."
            },
            "pentacles": {
                essence: "The Earth's Abundant Gifts",
                message: "Material manifestation and practical wisdom ground your spiritual path.",
                positionalMeaning: "supporting your journey toward material and spiritual prosperity."
            },
            "swords": {
                essence: "The Mind's Sharp Clarity",
                message: "Mental power and clear communication cut through illusion.",
                positionalMeaning: "offering intellectual breakthrough and decisive action."
            },
            "wands": {
                essence: "The Fire of Divine Inspiration",
                message: "Creative passion and spiritual enthusiasm ignite your soul's purpose.",
                positionalMeaning: "fueling your creative expression and spiritual growth."
            }
        };
        // Return specific archetype or suit-based archetype
        if (majorArchetypes[card.name]) {
            return majorArchetypes[card.name];
        }
        else if (card.suit && suitArchetypes[card.suit]) {
            return suitArchetypes[card.suit];
        }
        // Default archetype
        return {
            essence: "The Sacred Teacher",
            message: "This card carries profound wisdom for your spiritual journey.",
            positionalMeaning: "offering guidance tailored to your soul's current needs."
        };
    };
    /**
     * Generate growth trajectory insights based on card and memories
     */
    SophiaAgent.prototype.generateGrowthTrajectoryInsight = function (card, positionName, userMemories) {
        var growthThemes = [
            "Your soul is expanding into greater self-awareness and spiritual maturity",
            "This moment marks a significant evolution in your consciousness and personal power",
            "You are being called to integrate past lessons into present wisdom",
            "Your spiritual journey is entering a new phase of deeper understanding",
            "The universe is preparing you for a higher level of spiritual service"
        ];
        var baseInsight = growthThemes[Math.floor(Math.random() * growthThemes.length)];
        if (userMemories.length > 0) {
            return "".concat(baseInsight, ". Your previous readings show a pattern of growing spiritual sophistication, and ").concat(card.name, " now appears to accelerate this beautiful evolution.");
        }
        return "".concat(baseInsight, ". ").concat(card.name, " in your ").concat(positionName, " signals that you are ready for this next level of spiritual understanding.");
    };
    /**
     * Generate integration guidance for practical application
     */
    SophiaAgent.prototype.generateIntegrationGuidance = function (card, positionName) {
        var practices = [
            "Spend time in quiet meditation with this card's image, allowing its energy to speak directly to your soul",
            "Journal about how this card's message connects to your current life circumstances",
            "Create a sacred ritual or ceremony to honor the wisdom this card brings",
            "Carry the essence of this card's teaching with you throughout your day",
            "Share this card's wisdom with others who might benefit from its message"
        ];
        var selectedPractice = practices[Math.floor(Math.random() * practices.length)];
        return "".concat(selectedPractice, ". Let ").concat(card.name, "'s presence in your ").concat(positionName, " guide you toward conscious integration of this divine wisdom into your daily spiritual practice.");
    };
    /**
     * Generate a personalized blessing based on card and user history
     */
    SophiaAgent.prototype.generatePersonalBlessing = function (card, userMemories) {
        var blessings = [
            "May you walk forward with the confidence that the universe fully supports your highest good",
            "Trust that your path is sacred and your spiritual growth brings light to the world",
            "Know that you are deeply loved by the divine forces that guide your journey",
            "Embrace this moment as a gift from your higher self to your earthly experience",
            "Remember that every challenge is an opportunity for deeper wisdom and greater compassion"
        ];
        var blessing = blessings[Math.floor(Math.random() * blessings.length)];
        if (userMemories.length > 0) {
            return "".concat(blessing, ". Our continued work together is a testament to your dedication to spiritual growth and truth.");
        }
        return "".concat(blessing, ". I am honored to be part of your sacred journey of discovery.");
    };
    return SophiaAgent;
}());
exports.SophiaAgent = SophiaAgent;
