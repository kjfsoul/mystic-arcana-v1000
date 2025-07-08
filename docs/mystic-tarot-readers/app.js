// Application State
let currentPersona = null;
let selectedSpread = null;
let currentReading = null;
let audioEnabled = true;
let sessionCount = 1;
let readingHistory = [];

// Tarot Card Data
const tarotCards = [
    {"id": "fool", "name": "The Fool", "arcana": "major", "number": 0, "upright": "New beginnings, innocence, spontaneity, free spirit", "reversed": "Recklessness, taken advantage of, inconsideration", "element": "air", "keywords": ["beginnings", "journey", "potential", "freedom"]},
    {"id": "magician", "name": "The Magician", "arcana": "major", "number": 1, "upright": "Manifestation, resourcefulness, power, inspired action", "reversed": "Manipulation, poor planning, untapped talents", "element": "air", "keywords": ["manifestation", "power", "skill", "concentration"]},
    {"id": "high_priestess", "name": "The High Priestess", "arcana": "major", "number": 2, "upright": "Intuition, sacred knowledge, divine feminine, subconscious", "reversed": "Secrets, disconnected from intuition, withdrawal", "element": "water", "keywords": ["intuition", "mystery", "subconscious", "wisdom"]},
    {"id": "empress", "name": "The Empress", "arcana": "major", "number": 3, "upright": "Femininity, beauty, nature, nurturing, abundance", "reversed": "Creative block, dependence on others", "element": "earth", "keywords": ["abundance", "nurturing", "fertility", "creation"]},
    {"id": "emperor", "name": "The Emperor", "arcana": "major", "number": 4, "upright": "Authority, establishment, structure, father figure", "reversed": "Tyranny, rigidity, coldness", "element": "fire", "keywords": ["authority", "structure", "control", "stability"]},
    {"id": "hierophant", "name": "The Hierophant", "arcana": "major", "number": 5, "upright": "Spiritual wisdom, religious beliefs, conformity, tradition", "reversed": "Personal beliefs, freedom, challenging the status quo", "element": "earth", "keywords": ["tradition", "conformity", "morality", "ethics"]},
    {"id": "lovers", "name": "The Lovers", "arcana": "major", "number": 6, "upright": "Love, harmony, relationships, values alignment", "reversed": "Self-love, disharmony, imbalance, misalignment", "element": "air", "keywords": ["love", "union", "relationships", "choices"]},
    {"id": "chariot", "name": "The Chariot", "arcana": "major", "number": 7, "upright": "Control, willpower, success, determination", "reversed": "Self-discipline, opposition, lack of direction", "element": "water", "keywords": ["willpower", "determination", "control", "success"]},
    {"id": "strength", "name": "Strength", "arcana": "major", "number": 8, "upright": "Strength, courage, persuasion, influence, compassion", "reversed": "Self doubt, low energy, raw emotion", "element": "fire", "keywords": ["courage", "persuasion", "influence", "compassion"]},
    {"id": "hermit", "name": "The Hermit", "arcana": "major", "number": 9, "upright": "Soul searching, introspection, inner guidance", "reversed": "Isolation, loneliness, withdrawal", "element": "earth", "keywords": ["introspection", "searching", "guidance", "solitude"]},
    {"id": "wheel", "name": "Wheel of Fortune", "arcana": "major", "number": 10, "upright": "Good luck, karma, life cycles, destiny, turning point", "reversed": "Bad luck, lack of control, clinging to control", "element": "fire", "keywords": ["fortune", "karma", "cycle", "destiny"]},
    {"id": "justice", "name": "Justice", "arcana": "major", "number": 11, "upright": "Justice, fairness, truth, cause and effect, law", "reversed": "Unfairness, lack of accountability, dishonesty", "element": "air", "keywords": ["justice", "balance", "fairness", "truth"]},
    {"id": "hanged_man", "name": "The Hanged Man", "arcana": "major", "number": 12, "upright": "Suspension, restriction, letting go, sacrifice", "reversed": "Martyrdom, indecision, delay", "element": "water", "keywords": ["suspension", "sacrifice", "letting go", "new perspective"]},
    {"id": "death", "name": "Death", "arcana": "major", "number": 13, "upright": "Endings, beginnings, change, transformation", "reversed": "Resistance to change, personal transformation", "element": "water", "keywords": ["transformation", "endings", "change", "rebirth"]},
    {"id": "temperance", "name": "Temperance", "arcana": "major", "number": 14, "upright": "Balance, moderation, patience, purpose", "reversed": "Imbalance, excess, self-healing, re-alignment", "element": "fire", "keywords": ["balance", "moderation", "patience", "healing"]},
    {"id": "devil", "name": "The Devil", "arcana": "major", "number": 15, "upright": "Shadow self, attachment, addiction, restriction", "reversed": "Releasing limiting beliefs, exploring dark thoughts", "element": "earth", "keywords": ["bondage", "addiction", "sexuality", "materialism"]},
    {"id": "tower", "name": "The Tower", "arcana": "major", "number": 16, "upright": "Sudden change, upheaval, chaos, revelation", "reversed": "Personal transformation, fear of change", "element": "fire", "keywords": ["upheaval", "sudden change", "chaos", "revelation"]},
    {"id": "star", "name": "The Star", "arcana": "major", "number": 17, "upright": "Hope, faith, purpose, renewal, spirituality", "reversed": "Lack of faith, despair, self-trust", "element": "air", "keywords": ["hope", "faith", "spirituality", "renewal"]},
    {"id": "moon", "name": "The Moon", "arcana": "major", "number": 18, "upright": "Illusion, fear, anxiety, subconscious, intuition", "reversed": "Release of fear, repressed emotion, inner confusion", "element": "water", "keywords": ["illusion", "intuition", "subconscious", "mystery"]},
    {"id": "sun", "name": "The Sun", "arcana": "major", "number": 19, "upright": "Positivity, fun, warmth, success, vitality", "reversed": "Inner child, feeling down, overly optimistic", "element": "fire", "keywords": ["joy", "success", "positivity", "vitality"]},
    {"id": "judgement", "name": "Judgement", "arcana": "major", "number": 20, "upright": "Judgement, rebirth, inner calling, absolution", "reversed": "Self-doubt, inner critic, ignoring the call", "element": "fire", "keywords": ["rebirth", "inner calling", "absolution", "judgement"]},
    {"id": "world", "name": "The World", "arcana": "major", "number": 21, "upright": "Completion, accomplishment, travel, world consciousness", "reversed": "Seeking personal closure, short-cut to success", "element": "earth", "keywords": ["completion", "accomplishment", "fulfillment", "world consciousness"]}
];

// Persona Data
const personas = {
    luna: {
        id: "luna",
        name: "Luna the Mystic",
        description: "Ethereal cosmic wisdom flowing like moonbeams",
        style: "intuitive and mystical",
        voice: { rate: 0.8, pitch: 1.2 },
        sessions: 127,
        positive_feedback: 89,
        evolution_stage: "deepening intuitive connections",
        intro: "Greetings, dear seeker. I am Luna, guardian of the cosmic mysteries. The moon's wisdom flows through me, illuminating the hidden paths of your soul's journey."
    },
    sage: {
        id: "sage",
        name: "Sage the Scholar",
        description: "Ancient wisdom grounded in tarot tradition",
        style: "traditional and scholarly",
        voice: { rate: 0.9, pitch: 0.9 },
        sessions: 156,
        positive_feedback: 94,
        evolution_stage: "integrating modern perspectives with ancient wisdom",
        intro: "Welcome, student of the mysteries. I am Sage, keeper of ancient wisdom. Through centuries of study, I have learned to read the sacred symbols that guide your path."
    },
    river: {
        id: "river",
        name: "River the Empath",
        description: "Gentle healing energy flowing like water",
        style: "nurturing and emotional",
        voice: { rate: 0.85, pitch: 1.1 },
        sessions: 203,
        positive_feedback: 97,
        evolution_stage: "developing deeper emotional resonance",
        intro: "Hello, beautiful soul. I am River, flowing with compassion and understanding. Let me guide you through the gentle currents of your heart's wisdom."
    },
    phoenix: {
        id: "phoenix",
        name: "Phoenix the Transformer",
        description: "Fiery energy of transformation and rebirth",
        style: "bold and transformative",
        voice: { rate: 1.0, pitch: 0.95 },
        sessions: 98,
        positive_feedback: 91,
        evolution_stage: "learning to balance intensity with compassion",
        intro: "Rise up, warrior of change! I am Phoenix, forged in the flames of transformation. Together, we shall ignite the power within you to create the life you deserve."
    }
};

// Spread Configurations
const spreads = {
    three_card: {
        id: "three_card",
        name: "Past, Present, Future",
        positions: 3,
        layout: "linear",
        descriptions: ["Past influences and foundation", "Current situation and energies", "Future potential and outcome"]
    },
    celtic_cross: {
        id: "celtic_cross",
        name: "Celtic Cross",
        positions: 10,
        layout: "cross",
        descriptions: ["Current situation", "Challenge/Cross", "Distant past/Foundation", "Recent past", "Possible outcome", "Near future", "Your approach", "External influences", "Hopes and fears", "Final outcome"]
    },
    relationship: {
        id: "relationship",
        name: "Relationship Reading",
        positions: 7,
        layout: "heart",
        descriptions: ["You", "Your partner", "The relationship", "Strengths", "Challenges", "What you bring", "Guidance"]
    },
    decision: {
        id: "decision",
        name: "Decision Making",
        positions: 5,
        layout: "diamond",
        descriptions: ["Current situation", "Option A", "Option B", "What you need to know", "Best path forward"]
    }
};

// DOM Elements
const personaSelection = document.getElementById('persona-selection');
const readingInterface = document.getElementById('reading-interface');
const cardInterface = document.getElementById('card-interface');
const interpretationArea = document.getElementById('interpretation-area');
const currentPersonaName = document.getElementById('current-persona-name');
const sessionCountElement = document.getElementById('session-count');
const audioToggle = document.getElementById('audio-toggle');
const playIntro = document.getElementById('play-intro');
const audioIndicator = document.getElementById('audio-indicator');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateSessionCount();
    updateEvolutionDisplay();
    loadReadingHistory();
});

// Event Listeners
function initializeEventListeners() {
    // Persona selection
    document.querySelectorAll('.persona-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const personaCard = this.closest('.persona-card');
            const personaId = personaCard.dataset.persona;
            selectPersona(personaId);
        });
    });

    // Audio toggle
    audioToggle.addEventListener('click', toggleAudio);

    // Play introduction
    playIntro.addEventListener('click', playPersonaIntro);

    // Change persona
    document.getElementById('change-persona').addEventListener('click', function() {
        personaSelection.classList.remove('hidden');
        readingInterface.classList.add('hidden');
    });

    // Spread selection
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectSpread(this.dataset.spread);
        });
    });

    // Shuffle button
    document.getElementById('shuffle-btn').addEventListener('click', shuffleAndDraw);

    // Deck pile click
    document.getElementById('deck-pile').addEventListener('click', shuffleAndDraw);

    // Read aloud
    document.getElementById('read-aloud').addEventListener('click', readInterpretationAloud);

    // Save reading
    document.getElementById('save-reading').addEventListener('click', saveReading);

    // Feedback buttons
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            submitFeedback(this.dataset.rating);
        });
    });

    // New reading
    document.getElementById('new-reading').addEventListener('click', startNewReading);

    // View history
    document.getElementById('view-history').addEventListener('click', viewHistory);
}

// Persona Selection
function selectPersona(personaId) {
    currentPersona = personas[personaId];
    currentPersonaName.textContent = currentPersona.name;
    
    // Update persona stats
    updatePersonaStats();
    
    // Hide selection, show reading interface
    personaSelection.classList.add('hidden');
    readingInterface.classList.remove('hidden');
    
    // Play intro if audio is enabled
    if (audioEnabled) {
        setTimeout(() => playPersonaIntro(), 500);
    }
}

// Audio Functions
function toggleAudio() {
    audioEnabled = !audioEnabled;
    audioToggle.textContent = audioEnabled ? '🔊 Audio On' : '🔇 Audio Off';
    
    if (!audioEnabled) {
        speechSynthesis.cancel();
        hideAudioIndicator();
    }
}

function playPersonaIntro() {
    if (!audioEnabled || !currentPersona) return;
    
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
        console.log('Speech synthesis not available');
        showTemporaryMessage('Audio playback not available in this environment');
        return;
    }
    
    speak(currentPersona.intro, currentPersona.voice);
}

function speak(text, voice = {}) {
    if (!audioEnabled || !window.speechSynthesis) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voice.rate || 1;
    utterance.pitch = voice.pitch || 1;
    utterance.volume = 0.8;
    
    utterance.onstart = showAudioIndicator;
    utterance.onend = hideAudioIndicator;
    utterance.onerror = function(event) {
        console.log('Speech synthesis error:', event.error);
        hideAudioIndicator();
        showTemporaryMessage('Audio playback encountered an error');
    };
    
    speechSynthesis.speak(utterance);
}

function showAudioIndicator() {
    audioIndicator.classList.remove('hidden');
}

function hideAudioIndicator() {
    audioIndicator.classList.add('hidden');
}

function showTemporaryMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 215, 0, 0.9);
        color: #1a1a2e;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Spread Selection
function selectSpread(spreadId) {
    selectedSpread = spreads[spreadId];
    
    // Update active spread button
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-spread="${spreadId}"]`).classList.add('active');
    
    // Show card interface
    cardInterface.classList.remove('hidden');
    
    // Create card positions
    createCardPositions();
}

function createCardPositions() {
    const cardPositions = document.getElementById('card-positions');
    cardPositions.innerHTML = '';
    
    for (let i = 0; i < selectedSpread.positions; i++) {
        const position = document.createElement('div');
        position.className = 'card-position';
        position.dataset.position = i;
        
        const label = document.createElement('div');
        label.className = 'position-label';
        label.textContent = selectedSpread.descriptions[i];
        
        position.appendChild(label);
        cardPositions.appendChild(position);
    }
}

// Card Functions
function shuffleAndDraw() {
    if (!selectedSpread) return;
    
    // Shuffle effect
    const deckPile = document.getElementById('deck-pile');
    deckPile.style.animation = 'shuffle 0.5s ease-in-out';
    
    setTimeout(() => {
        deckPile.style.animation = '';
        drawCards();
    }, 500);
}

function drawCards() {
    // Shuffle the deck
    const shuffledDeck = [...tarotCards].sort(() => Math.random() - 0.5);
    
    // Draw cards for each position
    const drawnCards = shuffledDeck.slice(0, selectedSpread.positions);
    
    currentReading = {
        persona: currentPersona.id,
        spread: selectedSpread.id,
        cards: drawnCards,
        timestamp: new Date().toISOString()
    };
    
    // Display cards
    displayCards(drawnCards);
    
    // Generate interpretation
    setTimeout(() => {
        generateInterpretation();
    }, 1000);
}

function displayCards(cards) {
    const positions = document.querySelectorAll('.card-position');
    
    cards.forEach((card, index) => {
        const position = positions[index];
        const cardElement = createCardElement(card, index);
        
        // Add card to position
        position.appendChild(cardElement);
        position.classList.add('filled');
        
        // Add click event for card details
        cardElement.addEventListener('click', () => showCardDetails(card, index));
    });
}

function createCardElement(card, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'tarot-card';
    cardElement.dataset.cardId = card.id;
    
    const cardNumber = document.createElement('div');
    cardNumber.className = 'card-number';
    cardNumber.textContent = card.arcana === 'major' ? card.number : '';
    
    const cardName = document.createElement('div');
    cardName.className = 'card-name';
    cardName.textContent = card.name;
    
    cardElement.appendChild(cardNumber);
    cardElement.appendChild(cardName);
    
    return cardElement;
}

// Interpretation Functions
function generateInterpretation() {
    if (!currentReading) return;
    
    let interpretation = generatePersonaInterpretation();
    
    // Display interpretation
    const interpretationContent = document.getElementById('interpretation-content');
    interpretationContent.innerHTML = interpretation;
    
    // Show interpretation area
    interpretationArea.classList.remove('hidden');
    
    // Scroll to interpretation
    interpretationArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Auto-read if audio is enabled
    if (audioEnabled) {
        setTimeout(() => {
            const textToRead = extractTextFromInterpretation(interpretation);
            speak(textToRead, currentPersona.voice);
        }, 1000);
    }
}

function generatePersonaInterpretation() {
    const { cards } = currentReading;
    const persona = currentPersona;
    
    let interpretation = `<div class="persona-intro">
        <h4>Your ${selectedSpread.name} Reading with ${persona.name}</h4>
        <p>${getPersonaIntroduction()}</p>
    </div>`;
    
    cards.forEach((card, index) => {
        const cardInterpretation = interpretCardByPersona(card, index);
        interpretation += `<div class="card-interpretation">
            <h4>${card.name}</h4>
            <div class="position">${selectedSpread.descriptions[index]}</div>
            <p>${cardInterpretation}</p>
        </div>`;
    });
    
    interpretation += `<div class="reading-summary">
        <h4>Summary</h4>
        <p>${generateSummary()}</p>
    </div>`;
    
    return interpretation;
}

function getPersonaIntroduction() {
    const personas = {
        luna: "The cosmic currents whisper secrets through these sacred cards. Let the moonlight illuminate the hidden meanings within your soul's journey.",
        sage: "Ancient wisdom speaks through these time-honored symbols. Each card carries the weight of centuries of human experience and divine truth.",
        river: "Feel the gentle flow of understanding as these cards reveal the emotional currents moving through your life. Trust in the healing power of this moment.",
        phoenix: "The flames of transformation burn bright in these cards! Prepare to rise from the ashes of your old self and embrace your magnificent potential."
    };
    
    return personas[currentPersona.id] || "The cards have chosen to speak with you today.";
}

function interpretCardByPersona(card, position) {
    const cardMeaning = card.upright;
    const positionMeaning = selectedSpread.descriptions[position];
    
    switch (currentPersona.id) {
        case 'luna':
            return `Like celestial bodies dancing across the night sky, ${card.name} appears in your ${positionMeaning.toLowerCase()} with ethereal grace. The cosmic energy speaks of ${cardMeaning.toLowerCase()}, weaving moonbeams of wisdom through your spiritual tapestry. The universe whispers that this energy flows like silver light, illuminating the path where ${positionMeaning.toLowerCase()} meets divine purpose.`;
            
        case 'sage':
            return `In the ancient tradition of the tarot, ${card.name} holds profound significance when positioned as ${positionMeaning.toLowerCase()}. Historical interpretations reveal that ${cardMeaning.toLowerCase()} represents a fundamental aspect of human experience. The symbolic meaning, rooted in centuries of wisdom, suggests that this card's presence in your ${positionMeaning.toLowerCase()} indicates a time of ${cardMeaning.toLowerCase()}, drawing from the collective unconscious of all who have walked this path before you.`;
            
        case 'river':
            return `Dear heart, ${card.name} flows gently into your ${positionMeaning.toLowerCase()} like a healing stream. Feel how ${cardMeaning.toLowerCase()} brings emotional nourishment to this aspect of your journey. This card embraces you with compassion, reminding you that ${positionMeaning.toLowerCase()} is a sacred space where ${cardMeaning.toLowerCase()} can help you heal and grow. Trust in the gentle wisdom that flows through your heart.`;
            
        case 'phoenix':
            return `BEHOLD! ${card.name} blazes forth in your ${positionMeaning.toLowerCase()} with the fierce power of transformation! The energy of ${cardMeaning.toLowerCase()} ignites your inner fire, demanding that you rise above limitations and claim your destiny. This card doesn't whisper—it ROARS with the message that your ${positionMeaning.toLowerCase()} is ready for the powerful change that ${cardMeaning.toLowerCase()} brings. Embrace this fierce energy and let it fuel your metamorphosis!`;
            
        default:
            return `${card.name} appears in your ${positionMeaning.toLowerCase()}, bringing the energy of ${cardMeaning.toLowerCase()}.`;
    }
}

function generateSummary() {
    const summaries = {
        luna: "The cosmic dance of these cards reveals a beautiful tapestry of your soul's journey. Trust in the divine timing of the universe as you navigate the path illuminated by lunar wisdom.",
        sage: "Through the lens of ancient wisdom, these cards form a comprehensive narrative of your current spiritual and practical journey. Study their meanings carefully, for they contain keys to understanding your deeper purpose.",
        river: "These cards flow together like a gentle river, carrying you toward emotional healing and deeper self-understanding. Allow their nurturing energy to guide you with compassion and grace.",
        phoenix: "The fire of transformation burns bright through this reading! Each card is a spark igniting your potential for magnificent change. Rise up and claim the powerful destiny that awaits you!"
    };
    
    return summaries[currentPersona.id] || "Your reading reveals important guidance for your journey ahead.";
}

function extractTextFromInterpretation(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function readInterpretationAloud() {
    if (!currentReading || !audioEnabled) return;
    
    const interpretationContent = document.getElementById('interpretation-content');
    const text = extractTextFromInterpretation(interpretationContent.innerHTML);
    speak(text, currentPersona.voice);
}

// Feedback and Evolution
function submitFeedback(rating) {
    if (!currentReading) return;
    
    // Update button state
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Update persona stats
    updatePersonaFeedback(rating);
    
    // Show thank you message
    setTimeout(() => {
        showTemporaryMessage('Thank you for your feedback! Your input helps our personas evolve and improve.');
    }, 500);
}

function updatePersonaFeedback(rating) {
    const persona = personas[currentPersona.id];
    persona.sessions++;
    
    if (rating >= 3) {
        persona.positive_feedback++;
    }
    
    // Update evolution stage based on feedback
    updateEvolutionStage();
    updateEvolutionDisplay();
}

function updateEvolutionStage() {
    const persona = personas[currentPersona.id];
    const positiveRate = (persona.positive_feedback / persona.sessions) * 100;
    
    if (positiveRate >= 95) {
        persona.evolution_stage = "mastering deep connections";
    } else if (positiveRate >= 90) {
        persona.evolution_stage = "refining interpretative skills";
    } else if (positiveRate >= 80) {
        persona.evolution_stage = "developing enhanced empathy";
    }
}

function updatePersonaStats() {
    const persona = personas[currentPersona.id];
    
    // Update stats in persona card if visible
    const personaCard = document.querySelector(`[data-persona="${currentPersona.id}"]`);
    if (personaCard) {
        const stats = personaCard.querySelectorAll('.stat');
        stats[0].textContent = `${persona.sessions} Sessions`;
        stats[1].textContent = `${Math.round((persona.positive_feedback / persona.sessions) * 100)}% Positive`;
        
        const evolutionBadge = personaCard.querySelector('.evolution-badge');
        evolutionBadge.textContent = persona.evolution_stage;
    }
}

function updateEvolutionDisplay() {
    const evolutionDisplay = document.getElementById('evolution-display');
    evolutionDisplay.innerHTML = '';
    
    Object.values(personas).forEach(persona => {
        const evolutionItem = document.createElement('div');
        evolutionItem.className = 'evolution-item';
        evolutionItem.innerHTML = `
            <strong>${persona.name}</strong><br>
            <small>${persona.evolution_stage}</small>
        `;
        evolutionDisplay.appendChild(evolutionItem);
    });
}

// History Functions
function loadReadingHistory() {
    try {
        const storedHistory = localStorage.getItem('tarotReadings');
        if (storedHistory) {
            readingHistory = JSON.parse(storedHistory);
        }
    } catch (error) {
        console.log('Could not load reading history:', error);
        readingHistory = [];
    }
}

function saveReading() {
    if (!currentReading) return;
    
    try {
        readingHistory.push(currentReading);
        localStorage.setItem('tarotReadings', JSON.stringify(readingHistory));
        showTemporaryMessage('Reading saved successfully!');
    } catch (error) {
        console.log('Could not save reading:', error);
        // Fallback to in-memory storage
        readingHistory.push(currentReading);
        showTemporaryMessage('Reading saved to session memory!');
    }
}

function viewHistory() {
    if (readingHistory.length === 0) {
        showTemporaryMessage('No reading history found. Complete a reading to build your history!');
        return;
    }
    
    // Create history modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        color: #FFD700;
        padding: 24px;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 215, 0, 0.3);
    `;
    
    let historyHTML = `<h3>Reading History (${readingHistory.length} sessions)</h3>`;
    
    readingHistory.slice(-10).reverse().forEach((reading, index) => {
        const date = new Date(reading.timestamp).toLocaleDateString();
        const persona = personas[reading.persona];
        const spread = spreads[reading.spread];
        
        historyHTML += `
            <div style="margin-bottom: 16px; padding: 12px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                <strong>${date} - ${persona.name}</strong><br>
                <small>${spread.name}</small><br>
                <small>Cards: ${reading.cards.map(c => c.name).join(', ')}</small>
            </div>
        `;
    });
    
    historyHTML += `
        <div style="text-align: center; margin-top: 16px;">
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="background: #FFD700; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    modalContent.innerHTML = historyHTML;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Utility Functions
function updateSessionCount() {
    sessionCountElement.textContent = `Session: ${sessionCount}`;
}

function startNewReading() {
    // Reset state
    currentReading = null;
    selectedSpread = null;
    
    // Update session count
    sessionCount++;
    updateSessionCount();
    
    // Hide areas
    cardInterface.classList.add('hidden');
    interpretationArea.classList.add('hidden');
    
    // Clear card positions
    const cardPositions = document.getElementById('card-positions');
    cardPositions.innerHTML = '';
    
    // Clear spread selection
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Clear feedback
    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function showCardDetails(card, position) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        color: #FFD700;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        border: 1px solid rgba(255, 215, 0, 0.3);
    `;
    
    modalContent.innerHTML = `
        <h3>${card.name}</h3>
        <p><strong>Position:</strong> ${selectedSpread.descriptions[position]}</p>
        <p><strong>Element:</strong> ${card.element}</p>
        <p><strong>Keywords:</strong> ${card.keywords.join(', ')}</p>
        <p><strong>Upright:</strong> ${card.upright}</p>
        <p><strong>Reversed:</strong> ${card.reversed}</p>
        <div style="text-align: center; margin-top: 16px;">
            <button onclick="this.closest('[style*=\"position: fixed\"]').remove()" 
                    style="background: #FFD700; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Add shuffle animation CSS
const style = document.createElement('style');
style.textContent = `
@keyframes shuffle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(5deg) translateX(5px); }
    50% { transform: rotate(-5deg) translateX(-5px); }
    75% { transform: rotate(3deg) translateX(3px); }
    100% { transform: rotate(0deg); }
}
`;
document.head.appendChild(style);