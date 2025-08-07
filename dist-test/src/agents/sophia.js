import { createClient } from "../lib/supabase/server.js";
import { PersonaLearnerAgent } from "./PersonaLearner.js";
// Conversational State Machine Enums
export var ConversationState;
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
})(ConversationState || (ConversationState = {}));
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
export class SophiaAgent {
    // Fixed: Remove duplicate constructors
    constructor() {
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
        this.personaLearner = new PersonaLearnerAgent();
        this.conversationSessions = new Map();
        this.initializeSupabase();
    }
    // Fixed: Remove duplicate function
    async initializeSupabase() {
        this.supabase = await createClient();
    }
    /**
     * Generate a complete personalized reading by querying the Knowledge Pool
     * and synthesizing interpretations through Sophia's wise perspective
     */
    async getReading(cards, spreadType, context) {
        try {
            // First, retrieve user memories for personalization
            let userMemories = [];
            if (context.userId) {
                try {
                    userMemories = await this.personaLearner.retrieveUserMemories(context.userId);
                    console.log(`Sophia: Retrieved ${userMemories.length} memories for user ${context.userId}`);
                }
                catch (memoryError) {
                    console.warn("Sophia: Could not retrieve user memories, proceeding with base reading:", memoryError);
                }
            }
            // Query Knowledge Pool for each card's interpretation
            const cardInterpretations = [];
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const positionName = this.getPositionName(spreadType, i);
                // Fetch base interpretation from Knowledge Pool
                const { data: interpretationData, error } = await this.supabase
                    .from("tarot_interpretations")
                    .select("*")
                    .eq("card_name", card.name)
                    .eq("spread_type", spreadType)
                    .eq("position_name", positionName)
                    .single();
                if (error) {
                    console.warn(`No specific interpretation found for ${card.name} in ${positionName}, using fallback`);
                }
                // Create personalized interpretation with user memories
                const interpretation = await this.createPersonalizedInterpretation(card, interpretationData, positionName, context, i, userMemories);
                cardInterpretations.push(interpretation);
            }
            // Synthesize overall reading narrative with memory context
            const narrative = await this.synthesizeNarrative(cards, cardInterpretations, spreadType, context, userMemories);
            const overallGuidance = await this.synthesizeOverallGuidance(cardInterpretations, context, userMemories);
            const spiritualInsight = await this.generateSpiritualInsight(cards, context, userMemories);
            // Fixed: Replace deprecated substr with substring
            const reading = {
                id: `sophia_reading_${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 11)}`,
                narrative,
                card_interpretations: cardInterpretations,
                overall_guidance: overallGuidance,
                spiritual_insight: spiritualInsight,
                reader_signature: this.generateReaderSignature(),
                session_context: context,
                created_at: new Date(),
            };
            return reading;
        }
        catch (error) {
            console.error("Sophia reading generation failed:", error);
            throw new Error(`Unable to channel the cosmic wisdom at this time: ${error}`);
        }
    }
    /**
     * Process a turn in the conversational reading flow
     * This is the main method for the Living Oracle Initiative
     */
    async processReadingTurn(sessionId, currentState, userInput, cards, context) {
        try {
            let session = this.conversationSessions.get(sessionId);
            // Initialize session if this is the first turn
            if (!session && currentState === ConversationState.AWAITING_DRAW) {
                if (!cards || !context) {
                    throw new Error("Cards and context required for new session");
                }
                session = {
                    sessionId,
                    userId: context.userId,
                    spreadType: context.spreadType,
                    cards,
                    currentState: ConversationState.AWAITING_DRAW,
                    currentCardIndex: 0,
                    userResponses: [],
                    cardInterpretations: [],
                    startTime: new Date(),
                    context,
                };
                this.conversationSessions.set(sessionId, session);
            }
            if (!session) {
                throw new Error(`Session ${sessionId} not found`);
            }
            // Record user input if provided
            if (userInput) {
                session.userResponses.push({
                    state: currentState,
                    input: userInput,
                    timestamp: new Date(),
                });
            }
            // Process the current state and determine the next action
            return await this.processStateTransition(session, userInput);
        }
        catch (error) {
            console.error("Sophia conversation turn failed:", error);
            throw new Error(`Unable to process the cosmic conversation: ${error}`);
        }
    }
    /**
     * Process state transitions in the conversation flow
     */
    async processStateTransition(session, userInput) {
        switch (session.currentState) {
            case ConversationState.AWAITING_DRAW:
                return await this.handleAwaitingDraw(session);
            case ConversationState.REVEALING_CARD_1:
            case ConversationState.REVEALING_CARD_2:
            case ConversationState.REVEALING_CARD_3:
                return await this.handleRevealingCard(session);
            case ConversationState.INTERPRETING_CARD_1:
            case ConversationState.INTERPRETING_CARD_2:
            case ConversationState.INTERPRETING_CARD_3:
                return await this.handleInterpretingCard(session);
            case ConversationState.AWAITING_INPUT_1:
            case ConversationState.AWAITING_INPUT_2:
            case ConversationState.AWAITING_INPUT_3:
                return await this.handleAwaitingInput(session, userInput);
            case ConversationState.INTERACTIVE_QUESTION_1:
            case ConversationState.INTERACTIVE_QUESTION_2:
                return await this.handleInteractiveQuestion(session, userInput);
            case ConversationState.FINAL_SYNTHESIS:
                return await this.handleFinalSynthesis(session);
            default:
                throw new Error(`Unknown conversation state: ${session.currentState}`);
        }
    }
    /**
     * Handle the initial draw state
     */
    async handleAwaitingDraw(session) {
        const signaturePhrase = this.personality.signature_phrases[Math.floor(Math.random() * this.personality.signature_phrases.length)];
        session.currentState = ConversationState.REVEALING_CARD_1;
        this.conversationSessions.set(session.sessionId, session);
        return {
            dialogue: `Welcome, beautiful soul. ${signaturePhrase} as we begin this sacred journey together. I have drawn three cards that hold the wisdom you seek. Let us unveil them one by one, allowing each to speak its truth in its own time.`,
            newState: ConversationState.REVEALING_CARD_1,
            options: [
                { id: "begin", text: "Begin the reading", value: "begin" },
                { id: "pause", text: "Take a moment first", value: "pause" },
            ],
        };
    }
    /**
     * Handle revealing a card
     */
    async handleRevealingCard(session) {
        const cardIndex = this.getCurrentCardIndex(session.currentState);
        const card = session.cards[cardIndex];
        const positionName = this.getPositionName(session.spreadType, cardIndex);
        let dialogue = "";
        let nextState;
        if (cardIndex === 0) {
            dialogue = `I now reveal your first card: **${card.name}** in the position of ${positionName}. `;
            dialogue += `The energy of this card fills the space between us. Take a moment to feel its presence.`;
            nextState = ConversationState.INTERPRETING_CARD_1;
        }
        else if (cardIndex === 1) {
            dialogue = `Your second card emerges: **${card.name}** in the position of ${positionName}. `;
            dialogue += `See how it dances with the wisdom of your first card, creating a deeper tapestry of meaning.`;
            nextState = ConversationState.INTERPRETING_CARD_2;
        }
        else {
            dialogue = `And now, your final card is revealed: **${card.name}** in the position of ${positionName}. `;
            dialogue += `The trinity is complete. Feel how all three cards now speak as one unified voice.`;
            nextState = ConversationState.INTERPRETING_CARD_3;
        }
        session.currentState = nextState;
        session.currentCardIndex = cardIndex;
        this.conversationSessions.set(session.sessionId, session);
        return {
            dialogue,
            newState: nextState,
            revealedCard: {
                card,
                position: positionName,
            },
            options: [
                { id: "continue", text: "Continue", value: "continue" },
                { id: "reflect", text: "Let me reflect on this", value: "reflect" },
            ],
        };
    }
    /**
     * Handle interpreting a card
     */
    async handleInterpretingCard(session) {
        const cardIndex = this.getCurrentCardIndex(session.currentState);
        const card = session.cards[cardIndex];
        const positionName = this.getPositionName(session.spreadType, cardIndex);
        // Retrieve user memories for personalization
        let userMemories = [];
        if (session.userId) {
            try {
                userMemories = await this.personaLearner.retrieveUserMemories(session.userId);
            }
            catch (memoryError) {
                console.warn("Could not retrieve user memories:", memoryError);
            }
        }
        // Query Knowledge Pool for card interpretation
        const { data: interpretationData, error } = await this.supabase
            .from("tarot_interpretations")
            .select("*")
            .eq("card_name", card.name)
            .eq("spread_type", session.spreadType)
            .eq("position_name", positionName)
            .single();
        if (error) {
            console.warn(`No specific interpretation found for ${card.name} in ${positionName}`);
        }
        // Create personalized interpretation
        const interpretation = await this.createPersonalizedInterpretation(card, interpretationData, positionName, session.context, cardIndex, userMemories);
        session.cardInterpretations[cardIndex] = interpretation;
        const dialogue = interpretation.personalized_guidance;
        let nextState;
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
        return {
            dialogue,
            newState: nextState,
            revealedCard: {
                card,
                position: positionName,
                interpretation,
            },
            options: [
                { id: "tell_more", text: "Tell me more", value: "tell_more" },
                { id: "continue", text: "Continue to next step", value: "continue" },
                { id: "reflect", text: "I need to reflect on this", value: "reflect" },
            ],
        };
    }
    /**
     * Handle awaiting user input
     */
    async handleAwaitingInput(session, userInput) {
        const cardIndex = this.getCurrentCardIndex(session.currentState);
        if (!userInput) {
            throw new Error("User input required for this state");
        }
        let dialogue = "";
        let nextState;
        if (userInput === "tell_more") {
            const card = session.cards[cardIndex];
            const interpretation = session.cardInterpretations[cardIndex];
            dialogue = `${interpretation.spiritual_wisdom} ${interpretation.practical_advice}`;
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
        // Create interactive question for deeper engagement
        const interactiveQuestion = this.createInteractiveQuestion(session.cards[cardIndex], session.cardInterpretations[cardIndex]);
        session.currentState = nextState;
        this.conversationSessions.set(session.sessionId, session);
        return {
            dialogue: dialogue + " " + interactiveQuestion.question,
            newState: nextState,
            interactiveQuestion,
            options: interactiveQuestion.options,
        };
    }
    /**
     * Handle interactive question responses and log to PersonaLearner
     */
    async handleInteractiveQuestion(session, userInput) {
        if (!userInput) {
            throw new Error("User input required for interactive question");
        }
        const cardIndex = this.getCurrentCardIndex(session.currentState);
        const card = session.cards[cardIndex];
        const interpretation = session.cardInterpretations[cardIndex];
        // Log the interaction to PersonaLearner for a-mem storage
        if (session.userId) {
            try {
                const mockReading = {
                    id: `interactive_${session.sessionId}_card_${cardIndex}`,
                    narrative: `Interactive question response for ${card.name}`,
                    card_interpretations: [interpretation],
                    overall_guidance: `User responded: ${userInput}`,
                    spiritual_insight: "Interactive engagement deepens understanding",
                    reader_signature: "Sophia ✨",
                    session_context: session.context,
                    created_at: new Date(),
                };
                const mockSession = {
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
                await this.personaLearner.logInteraction(session.userId, mockSession, {
                    rating: 5, // Assume positive engagement
                    helpful_cards: [card.name],
                    session_notes: `Interactive response: ${userInput} for card ${card.name}`,
                });
                console.log(`Logged interactive response for user ${session.userId}: ${userInput}`);
            }
            catch (error) {
                console.warn("Failed to log interactive response:", error);
            }
        }
        let dialogue = this.generateResponseToInteractiveAnswer(card, userInput);
        let nextState;
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
        return {
            dialogue,
            newState: nextState,
            options: [{ id: "continue", text: "Continue", value: "continue" }],
        };
    }
    /**
     * Handle final synthesis of the three-card reading
     */
    async handleFinalSynthesis(session) {
        // Create complete reading for final synthesis
        const userMemories = [];
        if (session.userId) {
            try {
                const memories = await this.personaLearner.retrieveUserMemories(session.userId);
                userMemories.push(...memories);
            }
            catch (error) {
                console.warn("Could not retrieve user memories for synthesis:", error);
            }
        }
        const narrative = await this.synthesizeNarrative(session.cards, session.cardInterpretations, session.spreadType, session.context, userMemories);
        const overallGuidance = await this.synthesizeOverallGuidance(session.cardInterpretations, session.context, userMemories);
        const spiritualInsight = await this.generateSpiritualInsight(session.cards, session.context, userMemories);
        const finalReading = {
            id: `sophia_conversation_${session.sessionId}`,
            narrative,
            card_interpretations: session.cardInterpretations,
            overall_guidance: overallGuidance,
            spiritual_insight: spiritualInsight,
            reader_signature: this.generateReaderSignature(),
            session_context: session.context,
            created_at: new Date(),
        };
        session.currentState = ConversationState.READING_COMPLETE;
        this.conversationSessions.set(session.sessionId, session);
        const dialogue = `As our sacred conversation draws to a close, I offer you this synthesis of all that has emerged:\n\n${overallGuidance}\n\n${spiritualInsight}`;
        return {
            dialogue,
            newState: ConversationState.READING_COMPLETE,
            finalReading,
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
        };
    }
    /**
     * Helper method to get current card index from state
     */
    getCurrentCardIndex(state) {
        if (state.includes("_1"))
            return 0;
        if (state.includes("_2"))
            return 1;
        if (state.includes("_3"))
            return 2;
        return 0;
    }
    /**
     * Helper method to get interactive question state
     */
    getInteractiveQuestionState(cardIndex) {
        if (cardIndex === 0)
            return ConversationState.INTERACTIVE_QUESTION_1;
        if (cardIndex === 1)
            return ConversationState.INTERACTIVE_QUESTION_2;
        return ConversationState.FINAL_SYNTHESIS; // No interactive question for 3rd card
    }
    /**
     * Create interactive questions based on card themes
     */
    createInteractiveQuestion(card, interpretation) {
        const cardQuestions = {
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
                question: `How strongly does the spiritual message of ${card.name} speak to your current life situation?`,
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
                question: `Does the practical guidance of ${card.name} align with your current needs?`,
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
    }
    /**
     * Generate personalized response to interactive answer
     */
    generateResponseToInteractiveAnswer(card, userInput) {
        const responseMap = {
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
    }
    /**
     * Create a personalized interpretation for a single card
     */
    async createPersonalizedInterpretation(card, knowledgePoolData, positionName, context, cardIndex, userMemories = []) {
        // Base interpretation from Knowledge Pool or fallback
        const baseInterpretation = knowledgePoolData?.base_meaning ||
            this.generateFallbackInterpretation(card, positionName);
        // Extract personalization hooks if available
        const personalizationHooks = knowledgePoolData?.personalization_hooks || [];
        // Generate Sophia's personalized guidance with memory synthesis
        const personalizedGuidance = await this.generateSophiaGuidance(card, baseInterpretation, positionName, context, personalizationHooks, userMemories);
        // Extract spiritual wisdom and practical advice
        const spiritualWisdom = knowledgePoolData?.spiritual_wisdom ||
            this.generateSpiritualWisdom(card, positionName);
        const practicalAdvice = knowledgePoolData?.actionable_reflection ||
            this.generatePracticalAdvice(card, positionName);
        // Generate Sophia's reader notes
        const readerNotes = this.generateReaderNotes(card, knowledgePoolData, context);
        // Calculate confidence score based on data availability
        const confidenceScore = this.calculateConfidenceScore(knowledgePoolData, context);
        // Source references
        const sourceReferences = [
            "Mystic Arcana Knowledge Pool",
            knowledgePoolData?.db_entry_id || "Sophia's Ancient Wisdom",
            "Rider-Waite Tarot Tradition",
        ];
        return {
            base_interpretation: baseInterpretation,
            personalized_guidance: personalizedGuidance,
            spiritual_wisdom: spiritualWisdom,
            practical_advice: practicalAdvice,
            reader_notes: readerNotes,
            confidence_score: confidenceScore,
            source_references: sourceReferences,
        };
    }
    /**
     * Generate Sophia's signature guidance style with memory synthesis
     */
    async generateSophiaGuidance(card, baseInterpretation, positionName, context, personalizationHooks, userMemories = []) {
        const signaturePhrase = this.personality.signature_phrases[Math.floor(Math.random() * this.personality.signature_phrases.length)];
        // Analyze user memories for relevant patterns
        const memoryInsights = this.analyzeUserMemories(card, userMemories);
        // Weave Sophia's enhanced voice into the interpretation with rich personalization
        let guidance = `✨ **Beloved Soul**, ${signaturePhrase.toLowerCase()} as **${card.name}** emerges in your **${positionName}**.\n\n`;
        // Add temporal/cosmic context for deeper resonance
        const temporalInsights = this.generateTemporalInsights();
        guidance += `🌙 **Cosmic Timing**: ${temporalInsights} This celestial moment amplifies ${card.name}'s profound message.\n\n`;
        // Add memory-aware context with deeper personalization
        if (memoryInsights.previousEncounters.length > 0) {
            const cardHistory = memoryInsights.previousEncounters[0];
            guidance += `🔮 **Sacred Recognition**: Our soul's journey together reveals **${card.name}** returning to you, `;
            guidance += `resonant with your previous exploration of themes including ${cardHistory.themes.join(", ")}. `;
            guidance += `The universe invites you to revisit these sacred patterns with the wisdom you've gained since our last encounter.\n\n`;
        }
        else {
            guidance += `🌟 **First Sacred Encounter**: This marks **${card.name}**'s inaugural appearance in our mystical work together, `;
            guidance += `signaling a significant new chapter unfolding in your spiritual evolution. Pay special attention to this divine initiation.\n\n`;
        }
        // Add enhanced archetypal interpretation
        const archetypeEnergy = this.getArchetypeEnergy(card);
        guidance += `💜 **Archetypal Essence**: ${archetypeEnergy.message} `;
        guidance += `**${card.name}** embodies the divine energy of *${archetypeEnergy.essence}*, `;
        guidance += `${archetypeEnergy.positionalMeaning}\n\n`;
        // Add base interpretation with enhanced mystical context
        guidance += `🌙 **Core Divine Message**: ${baseInterpretation}\n\n`;
        // Synthesize memory patterns with deeper psychological insight
        if (memoryInsights.recurringThemes.length > 0) {
            const primaryTheme = memoryInsights.recurringThemes[0];
            guidance += `🔄 **Soul Pattern Recognition**: Your readings consistently illuminate the sacred theme of **${primaryTheme}**. `;
            guidance += `${card.name} now appears as your spiritual teacher, offering divine keys to transform this recurring pattern `;
            guidance += `into conscious mastery. The universe doesn't simply repeat lessons—it deepens and refines them for your highest growth.\n\n`;
        }
        // Add specific memory synthesis for common patterns
        if (memoryInsights.progressionPattern) {
            guidance += `${memoryInsights.progressionPattern} `;
        }
        // Add personalization if available
        if (personalizationHooks.length > 0) {
            const relevantHook = personalizationHooks[0]; // Use first hook for now
            if (relevantHook.interpretation) {
                guidance += `Your soul's journey suggests that ${relevantHook.interpretation.toLowerCase()}. `;
            }
        }
        // Add Sophia's empowerment with memory awareness
        if (userMemories.length > 0) {
            guidance += `As I reflect on our journey together, I see how much you've grown in understanding. `;
            guidance += `Trust in this continued evolution, for each reading builds upon the last. `;
        }
        else {
            guidance += `Remember, dear one, that you carry within you all the wisdom needed to navigate this path. `;
            guidance += `Trust in the unfolding of your spiritual evolution. `;
        }
        return guidance;
    }
    /**
     * Analyze user memories for relevant patterns and insights
     */
    analyzeUserMemories(currentCard, userMemories) {
        const insights = {
            previousEncounters: [],
            recurringThemes: [],
            progressionPattern: null,
        };
        if (userMemories.length === 0)
            return insights;
        // Analyze each memory for card patterns
        for (const memory of userMemories) {
            try {
                if (memory.content && typeof memory.content === "string") {
                    const memoryData = JSON.parse(memory.content);
                    const readingSummary = memoryData.reading_summary;
                    if (readingSummary && readingSummary.cards) {
                        // Check if current card appeared before
                        if (readingSummary.cards.includes(currentCard.name)) {
                            const themes = memoryData.learning_insights?.themes_identified || [];
                            insights.previousEncounters.push({
                                card: currentCard.name,
                                themes,
                                timestamp: readingSummary.timestamp || memory.timestamp,
                            });
                        }
                        // Collect themes for pattern analysis
                        if (memoryData.learning_insights?.themes_identified) {
                            insights.recurringThemes.push(...memoryData.learning_insights.themes_identified);
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
        const themeCounts = {};
        insights.recurringThemes.forEach((theme) => {
            themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
        insights.recurringThemes = Object.entries(themeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([theme]) => theme);
        // Generate progression pattern for specific card combinations
        if (insights.previousEncounters.length > 0 && userMemories.length > 1) {
            insights.progressionPattern = this.generateProgressionPattern(currentCard, userMemories);
        }
        return insights;
    }
    /**
     * Generate progression pattern narrative based on user's reading history
     */
    generateProgressionPattern(currentCard, userMemories) {
        // Look for meaningful patterns between cards
        const progressionMappings = {
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
            const recentCards = userMemories
                .map((memory) => {
                if (memory.content && typeof memory.content === "string") {
                    const data = JSON.parse(memory.content);
                    return data.reading_summary?.cards || [];
                }
                return [];
            })
                .flat()
                .filter(Boolean);
            for (const previousCard of recentCards) {
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
    }
    /**
     * Synthesize overall narrative connecting all cards
     */
    async synthesizeNarrative(cards, interpretations, spreadType, context, userMemories = []) {
        let narrative = `Beloved seeker, as I gaze upon your ${spreadType.replace("-", " ")} spread, `;
        narrative += `I see a beautiful tapestry of wisdom woven by the cosmic forces. `;
        // Opening based on spread type
        // Fixed: Added missing 'custom' property
        const spreadIntroductions = {
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
            narrative += `${cards[0].name} speaks to you with singular clarity, `;
            narrative += `offering the precise guidance your soul needs at this moment.`;
        }
        else if (cards.length === 3) {
            narrative += `I see how ${cards[0].name} has shaped your journey, `;
            narrative += `leading to the current energy of ${cards[1].name}, `;
            narrative += `which now opens the path toward ${cards[2].name}.`;
        }
        else {
            // Multi-card synthesis
            const majorArcana = cards.filter((c) => c.arcana === "major");
            const minorArcana = cards.filter((c) => c.arcana === "minor");
            if (majorArcana.length > 0) {
                narrative += `The presence of ${majorArcana.length > 1 ? "Major Arcana cards" : "the Major Arcana"} `;
                narrative += `signals that significant spiritual themes are at play. `;
            }
            if (minorArcana.length > 0) {
                narrative += `The Minor Arcana cards speak to the practical aspects of your journey, `;
                narrative += `offering concrete guidance for your daily path.`;
            }
        }
        narrative += "\n\nLet me share what the cards reveal...";
        return narrative;
    }
    /**
     * Synthesize overall guidance from all interpretations
     */
    async synthesizeOverallGuidance(interpretations, context, userMemories = []) {
        let guidance = `As I weave together the wisdom of your spread, several key themes emerge. `;
        // Extract common themes
        const themes = this.extractCommonThemes(interpretations);
        if (themes.length > 0) {
            guidance += `The cards speak consistently of ${themes.join(", ")}, `;
            guidance += `suggesting these are the areas where the universe seeks your attention. `;
        }
        // Add overall empowerment
        guidance += `\n\nRemember, precious soul, that you are both the author and the hero of your story. `;
        guidance += `These cards do not dictate your future—they illuminate the path you are already walking `;
        guidance += `and empower you to walk it with greater consciousness and grace. `;
        guidance += `\n\nTrust in your inner wisdom, for it resonates with the same cosmic intelligence `;
        guidance += `that speaks through these ancient symbols. Your journey is unfolding exactly as it should.`;
        return guidance;
    }
    /**
     * Generate spiritual insight connecting to user's deeper journey
     */
    async generateSpiritualInsight(cards, context, userMemories = []) {
        let insight = `On a deeper spiritual level, this reading reveals that you are being called `;
        insight += `to embrace a new level of consciousness and self-understanding. `;
        // Look for spiritual patterns
        const spiritualCards = cards.filter((card) => [
            "The High Priestess",
            "The Hermit",
            "The Star",
            "The Moon",
            "The Sun",
            "Judgment",
            "The World",
        ].includes(card.name));
        if (spiritualCards.length > 0) {
            insight += `The presence of ${spiritualCards[0].name} `;
            insight += `particularly emphasizes the spiritual dimensions of your current experience. `;
        }
        insight += `\n\nThe universe is inviting you to trust in the perfect timing of your awakening. `;
        insight += `Every experience, every challenge, every moment of joy is part of your soul\'s `;
        insight += `carefully orchestrated curriculum for growth and expansion.`;
        return insight;
    }
    /**
     * Generate Sophia's signature for the reading
     */
    generateReaderSignature() {
        const signatures = [
            "With infinite love and cosmic blessings, Sophia ✨",
            "In sacred service to your highest good, Sophia 🌙",
            "Walking beside you on the path of wisdom, Sophia 💫",
            "Channeling ancient wisdom for your journey, Sophia 🔮",
            "With deep reverence for your spiritual path, Sophia ⭐",
        ];
        return signatures[Math.floor(Math.random() * signatures.length)];
    }
    /**
     * Helper method to get position name for a given spread and index
     */
    getPositionName(spreadType, index) {
        // Fixed: Added missing 'custom' property
        const positions = {
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
        const spreadPositions = positions[spreadType] || ["Position"];
        return spreadPositions[index] || `Position ${index + 1}`;
    }
    /**
     * Generate fallback interpretation when Knowledge Pool data is unavailable
     */
    generateFallbackInterpretation(card, positionName) {
        const meaning = card.isReversed
            ? card.meaning.reversed ||
                "This card's reversed energy asks for inner reflection"
            : card.meaning.upright || "This card brings positive energy to your path";
        return (`In the ${positionName} position, ${card.name} speaks to ${meaning.toLowerCase()}. ` +
            `The ancient wisdom of this card invites you to consider how its energy applies to this aspect of your journey.`);
    }
    /**
     * Generate spiritual wisdom for a card
     */
    generateSpiritualWisdom(card, positionName) {
        return (`${card.name} carries the spiritual teaching that every experience serves your highest evolution. ` +
            `In the ${positionName}, this card reminds you that you are exactly where you need to be for your soul\'s growth.`);
    }
    /**
     * Generate practical advice for a card
     */
    generatePracticalAdvice(card, positionName) {
        return (`Consider how the energy of ${card.name} can be practically applied in your daily life. ` +
            `Take one small action today that honors the wisdom this card offers in your ${positionName}.`);
    }
    /**
     * Generate reader notes about the interpretation
     */
    generateReaderNotes(card, knowledgePoolData, context) {
        let notes = `Sophia\'s Notes: ${card.name} appeared with `;
        if (knowledgePoolData) {
            notes += `rich Knowledge Pool guidance, offering deep personalized insight. `;
        }
        else {
            notes += `the pure energy of ancient wisdom, speaking directly to your soul. `;
        }
        if (card.isReversed) {
            notes += `The reversed position suggests a need for inner reflection and patience with your growth process.`;
        }
        else {
            notes += `The upright position indicates flowing energy and positive manifestation potential.`;
        }
        return notes;
    }
    /**
     * Calculate confidence score based on available data
     */
    calculateConfidenceScore(knowledgePoolData, context) {
        let score = 0.6; // Base confidence
        if (knowledgePoolData)
            score += 0.3; // Knowledge Pool data available
        if (context.userId)
            score += 0.1; // User context available
        if (knowledgePoolData?.personalization_hooks?.length > 0)
            score += 0.1; // Personalization available
        return Math.min(score, 1.0);
    }
    /**
     * Extract common themes from multiple interpretations
     */
    extractCommonThemes(interpretations) {
        const themes = [];
        // Simple keyword analysis - could be enhanced with NLP
        const commonWords = [
            "growth",
            "transformation",
            "love",
            "wisdom",
            "change",
            "journey",
            "spiritual",
        ];
        for (const theme of commonWords) {
            const count = interpretations.filter((interp) => interp.personalized_guidance.toLowerCase().includes(theme) ||
                interp.spiritual_wisdom.toLowerCase().includes(theme)).length;
            if (count >= Math.ceil(interpretations.length / 2)) {
                themes.push(theme);
            }
        }
        return themes.slice(0, 3); // Return top 3 themes
    }
    /**
     * Get Sophia's personality information for external use
     */
    getPersonality() {
        return this.personality;
    }
    /**
     * Health check method
     */
    async healthCheck() {
        try {
            const { data, error } = await this.supabase
                .from("tarot_interpretations")
                .select("count", { count: "exact", head: true });
            return !error;
        }
        catch {
            return false;
        }
    }
    /**
     * Generate temporal insights based on current cosmic timing
     */
    generateTemporalInsights() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const moonPhase = this.getMoonPhase(now);
        let insight = "";
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
    }
    /**
     * Get moon phase for temporal insights
     */
    getMoonPhase(date) {
        // Simplified lunar cycle calculation (approximation)
        const dayOfMonth = date.getDate();
        if (dayOfMonth <= 7)
            return 'new';
        if (dayOfMonth <= 14)
            return 'waxing';
        if (dayOfMonth <= 21)
            return 'full';
        return 'waning';
    }
    /**
     * Get archetypal energy information for a card
     */
    getArchetypeEnergy(card) {
        // Major Arcana archetypes
        const majorArchetypes = {
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
        const suitArchetypes = {
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
    }
    /**
     * Generate growth trajectory insights based on card and memories
     */
    generateGrowthTrajectoryInsight(card, positionName, userMemories) {
        const growthThemes = [
            "Your soul is expanding into greater self-awareness and spiritual maturity",
            "This moment marks a significant evolution in your consciousness and personal power",
            "You are being called to integrate past lessons into present wisdom",
            "Your spiritual journey is entering a new phase of deeper understanding",
            "The universe is preparing you for a higher level of spiritual service"
        ];
        const baseInsight = growthThemes[Math.floor(Math.random() * growthThemes.length)];
        if (userMemories.length > 0) {
            return `${baseInsight}. Your previous readings show a pattern of growing spiritual sophistication, and ${card.name} now appears to accelerate this beautiful evolution.`;
        }
        return `${baseInsight}. ${card.name} in your ${positionName} signals that you are ready for this next level of spiritual understanding.`;
    }
    /**
     * Generate integration guidance for practical application
     */
    generateIntegrationGuidance(card, positionName) {
        const practices = [
            "Spend time in quiet meditation with this card's image, allowing its energy to speak directly to your soul",
            "Journal about how this card's message connects to your current life circumstances",
            "Create a sacred ritual or ceremony to honor the wisdom this card brings",
            "Carry the essence of this card's teaching with you throughout your day",
            "Share this card's wisdom with others who might benefit from its message"
        ];
        const selectedPractice = practices[Math.floor(Math.random() * practices.length)];
        return `${selectedPractice}. Let ${card.name}'s presence in your ${positionName} guide you toward conscious integration of this divine wisdom into your daily spiritual practice.`;
    }
    /**
     * Generate a personalized blessing based on card and user history
     */
    generatePersonalBlessing(card, userMemories) {
        const blessings = [
            "May you walk forward with the confidence that the universe fully supports your highest good",
            "Trust that your path is sacred and your spiritual growth brings light to the world",
            "Know that you are deeply loved by the divine forces that guide your journey",
            "Embrace this moment as a gift from your higher self to your earthly experience",
            "Remember that every challenge is an opportunity for deeper wisdom and greater compassion"
        ];
        const blessing = blessings[Math.floor(Math.random() * blessings.length)];
        if (userMemories.length > 0) {
            return `${blessing}. Our continued work together is a testament to your dedication to spiritual growth and truth.`;
        }
        return `${blessing}. I am honored to be part of your sacred journey of discovery.`;
    }
}
