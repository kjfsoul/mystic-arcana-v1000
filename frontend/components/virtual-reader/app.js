// Tarot Application Data and State Management
class TarotApp {
  constructor() {
    this.initializeData();
    this.userProfile = {};
    this.currentReading = {};
    this.readingHistory = [];
    this.currentStep = 1;
    this.selectedCards = [];
    this.currentSpread = null;
    this.feedbackData = {};
    this.init();
  }

  initializeData() {
    this.majorArcana = [
      {
        id: 0,
        name: "The Fool",
        keywords: ["new beginnings", "innocence", "adventure", "leap of faith"],
        meanings: {
          upright: "New beginnings, spontaneity, innocence",
          reversed: "Recklessness, taken advantage of, inconsistency",
        },
      },
      {
        id: 1,
        name: "The Magician",
        keywords: ["manifestation", "willpower", "desire", "creation"],
        meanings: {
          upright: "Manifestation, resourcefulness, power",
          reversed: "Manipulation, poor planning, untapped talents",
        },
      },
      {
        id: 2,
        name: "The High Priestess",
        keywords: [
          "intuition",
          "sacred knowledge",
          "divine feminine",
          "subconscious mind",
        ],
        meanings: {
          upright: "Intuition, sacred knowledge, divine feminine",
          reversed: "Secrets, disconnected from intuition, withdrawal",
        },
      },
      {
        id: 3,
        name: "The Empress",
        keywords: ["femininity", "beauty", "nature", "abundance"],
        meanings: {
          upright: "Femininity, beauty, nature, abundance",
          reversed: "Creative block, dependence on others",
        },
      },
      {
        id: 4,
        name: "The Emperor",
        keywords: ["authority", "structure", "control", "fatherhood"],
        meanings: {
          upright: "Authority, establishment, structure",
          reversed: "Tyranny, rigidity, coldness",
        },
      },
      {
        id: 5,
        name: "The Hierophant",
        keywords: [
          "spiritual wisdom",
          "religious beliefs",
          "conformity",
          "tradition",
        ],
        meanings: {
          upright: "Spiritual wisdom, religious beliefs, conformity",
          reversed: "Personal beliefs, freedom, challenging the status quo",
        },
      },
      {
        id: 6,
        name: "The Lovers",
        keywords: ["love", "harmony", "relationships", "choices"],
        meanings: {
          upright: "Love, harmony, relationships, values alignment",
          reversed: "Disharmony, imbalance, misalignment of values",
        },
      },
      {
        id: 7,
        name: "The Chariot",
        keywords: ["control", "willpower", "success", "determination"],
        meanings: {
          upright: "Control, willpower, success, determination",
          reversed: "Lack of control, lack of direction, aggression",
        },
      },
      {
        id: 8,
        name: "Strength",
        keywords: ["strength", "courage", "persuasion", "influence"],
        meanings: {
          upright: "Strength, courage, persuasion, influence",
          reversed: "Self doubt, low energy, raw emotion",
        },
      },
      {
        id: 9,
        name: "The Hermit",
        keywords: [
          "soul searching",
          "seeking inner guidance",
          "looking inward",
        ],
        meanings: {
          upright: "Soul searching, seeking inner guidance, looking inward",
          reversed: "Isolation, loneliness, withdrawal",
        },
      },
      {
        id: 10,
        name: "Wheel of Fortune",
        keywords: ["good luck", "karma", "life cycles", "destiny"],
        meanings: {
          upright: "Good luck, karma, life cycles, destiny",
          reversed: "Bad luck, lack of control, clinging to control",
        },
      },
      {
        id: 11,
        name: "Justice",
        keywords: ["justice", "fairness", "truth", "cause and effect"],
        meanings: {
          upright: "Justice, fairness, truth, cause and effect",
          reversed: "Unfairness, lack of accountability, dishonesty",
        },
      },
      {
        id: 12,
        name: "The Hanged Man",
        keywords: ["surrender", "letting go", "new perspective"],
        meanings: {
          upright: "Surrender, letting go, new perspective",
          reversed: "Delays, resistance, stalling",
        },
      },
      {
        id: 13,
        name: "Death",
        keywords: ["endings", "change", "transformation", "transition"],
        meanings: {
          upright: "Endings, change, transformation, transition",
          reversed:
            "Resistance to change, personal transformation, inner purging",
        },
      },
      {
        id: 14,
        name: "Temperance",
        keywords: ["balance", "moderation", "patience", "purpose"],
        meanings: {
          upright: "Balance, moderation, patience, purpose",
          reversed: "Imbalance, excess, self-healing, re-alignment",
        },
      },
      {
        id: 15,
        name: "The Devil",
        keywords: ["shadow self", "attachment", "addiction", "restriction"],
        meanings: {
          upright: "Shadow self, attachment, addiction, restriction",
          reversed:
            "Releasing limiting beliefs, exploring dark thoughts, detachment",
        },
      },
      {
        id: 16,
        name: "The Tower",
        keywords: ["sudden change", "upheaval", "chaos", "revelation"],
        meanings: {
          upright: "Sudden change, upheaval, chaos, revelation",
          reversed:
            "Personal transformation, fear of change, averting disaster",
        },
      },
      {
        id: 17,
        name: "The Star",
        keywords: ["hope", "faith", "purpose", "renewal"],
        meanings: {
          upright: "Hope, faith, purpose, renewal",
          reversed: "Lack of faith, despair, self-trust, disconnection",
        },
      },
      {
        id: 18,
        name: "The Moon",
        keywords: ["illusion", "fear", "anxiety", "subconscious"],
        meanings: {
          upright: "Illusion, fear, anxiety, subconscious",
          reversed: "Release of fear, repressed emotion, inner confusion",
        },
      },
      {
        id: 19,
        name: "The Sun",
        keywords: ["positivity", "fun", "warmth", "success"],
        meanings: {
          upright: "Positivity, fun, warmth, success",
          reversed: "Inner child, feeling down, overly optimistic",
        },
      },
      {
        id: 20,
        name: "Judgement",
        keywords: ["judgement", "rebirth", "inner calling", "absolution"],
        meanings: {
          upright: "Judgement, rebirth, inner calling, absolution",
          reversed: "Self-doubt, inner critic, ignoring the call",
        },
      },
      {
        id: 21,
        name: "The World",
        keywords: ["completion", "accomplishment", "travel", "fulfillment"],
        meanings: {
          upright: "Completion, accomplishment, travel, fulfillment",
          reversed: "Seeking personal closure, short-cut to success, delays",
        },
      },
    ];

    this.spreads = {
      "Celtic Cross": {
        positions: 10,
        positionsMeaning: [
          "Present situation",
          "Challenge/Cross",
          "Distant past/Foundation",
          "Recent past",
          "Possible outcome",
          "Near future",
          "Your approach",
          "External influences",
          "Hopes and fears",
          "Final outcome",
        ],
        complexity: "Advanced",
        readingTime: "30-45 minutes",
      },
      "Three Card": {
        positions: 3,
        positionsMeaning: ["Past", "Present", "Future"],
        complexity: "Beginner",
        readingTime: "10-15 minutes",
      },
      Relationship: {
        positions: 7,
        positionsMeaning: [
          "You",
          "Your partner",
          "The relationship",
          "Strengths",
          "Challenges",
          "Advice",
          "Outcome",
        ],
        complexity: "Intermediate",
        readingTime: "20-30 minutes",
      },
      "Career Path": {
        positions: 5,
        positionsMeaning: [
          "Current situation",
          "Hidden influences",
          "Guidance",
          "Possible outcome",
          "Advice",
        ],
        complexity: "Intermediate",
        readingTime: "15-25 minutes",
      },
      "Daily Guidance": {
        positions: 1,
        positionsMeaning: ["Today's message"],
        complexity: "Beginner",
        readingTime: "5 minutes",
      },
    };

    this.userLevels = {
      Beginner: {
        recommendedSpreads: ["Daily Guidance", "Three Card"],
        explanationDepth: "detailed",
        keywordsShown: true,
        reversedCards: false,
      },
      Intermediate: {
        recommendedSpreads: ["Three Card", "Relationship", "Career Path"],
        explanationDepth: "moderate",
        keywordsShown: true,
        reversedCards: true,
      },
      Advanced: {
        recommendedSpreads: ["Celtic Cross", "Relationship", "Career Path"],
        explanationDepth: "concise",
        keywordsShown: false,
        reversedCards: true,
      },
    };

    this.moodSpreads = {
      Contemplative: ["Celtic Cross", "Daily Guidance"],
      Anxious: ["Three Card", "Daily Guidance"],
      Curious: ["Daily Guidance", "Three Card"],
      Focused: ["Career Path"],
      Romantic: ["Relationship"],
      Uncertain: ["Three Card", "Daily Guidance"],
    };
  }

  init() {
    this.bindEvents();
    this.showScreen("landing");
  }

  bindEvents() {
    // Star rating events
    document.querySelectorAll(".star-rating").forEach((rating) => {
      rating.addEventListener("click", (e) => {
        if (e.target.classList.contains("star")) {
          this.setRating(rating, e.target.dataset.rating);
        }
      });
    });

    // Experience card selection
    document.querySelectorAll(".experience-card").forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".experience-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        this.userProfile.level = card.dataset.level;
        this.updateNavigationButtons();
      });
    });

    // Mood selection
    document.querySelectorAll(".mood-card").forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".mood-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        this.userProfile.mood = card.dataset.mood;
        this.updateNavigationButtons();
      });
    });

    // Preference checkboxes
    document.querySelectorAll(".preference-item input").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.userProfile.preferences = this.userProfile.preferences || [];
        if (checkbox.checked) {
          this.userProfile.preferences.push(checkbox.value);
        } else {
          this.userProfile.preferences = this.userProfile.preferences.filter(
            (p) => p !== checkbox.value,
          );
        }
        this.updateNavigationButtons();
      });
    });
  }

  showScreen(screenId) {
    document
      .querySelectorAll(".screen")
      .forEach((screen) => screen.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");

    // Initialize screen-specific content
    if (screenId === "dashboard") {
      this.initializeDashboard();
    } else if (screenId === "spread-selection") {
      this.initializeSpreadSelection();
    } else if (screenId === "card-selection") {
      this.initializeCardSelection();
    }
  }

  // Profile Creation Wizard
  nextStep() {
    if (this.currentStep < 3) {
      // Validate current step
      if (!this.validateCurrentStep()) {
        return;
      }

      this.currentStep++;
      this.updateWizardStep();
    } else {
      // Complete profile creation
      this.completeProfileCreation();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWizardStep();
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.userProfile.level;
      case 2:
        return (
          this.userProfile.preferences &&
          this.userProfile.preferences.length > 0
        );
      case 3:
        return this.userProfile.mood;
      default:
        return true;
    }
  }

  updateWizardStep() {
    // Hide all wizard content
    document.querySelectorAll(".wizard-content").forEach((content) => {
      content.classList.add("hidden");
    });

    // Show current step content
    document
      .getElementById(`step-${this.currentStep}`)
      .classList.remove("hidden");

    // Update step indicators
    document.querySelectorAll(".step").forEach((step, index) => {
      step.classList.remove("active", "completed");
      if (index + 1 === this.currentStep) {
        step.classList.add("active");
      } else if (index + 1 < this.currentStep) {
        step.classList.add("completed");
      }
    });

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prevBtn) prevBtn.disabled = this.currentStep === 1;

    const isValid = this.validateCurrentStep();
    if (nextBtn) nextBtn.disabled = !isValid;

    if (nextBtn) {
      if (this.currentStep === 3) {
        nextBtn.textContent = "Complete Profile";
      } else {
        nextBtn.textContent = "Next";
      }
    }
  }

  completeProfileCreation() {
    this.userProfile.createdAt = new Date().toISOString();
    this.showScreen("dashboard");
  }

  // Dashboard Management
  initializeDashboard() {
    this.updateWelcomeMessage();
    this.loadRecommendedSpread();
    this.loadSpreadOptions();
    this.loadReadingHistory();
    this.updateInsights();
  }

  updateWelcomeMessage() {
    const message = document.getElementById("welcome-message");
    if (message) {
      const timeOfDay = this.getTimeOfDay();
      const mood = this.userProfile.mood || "seeker";
      message.textContent = `Good ${timeOfDay}, ${mood} soul. Ready for guidance?`;
    }
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  loadRecommendedSpread() {
    const container = document.getElementById("recommended-spread");
    if (container) {
      const recommended = this.getRecommendedSpread();

      container.innerHTML = `
                <h4>${recommended.name}</h4>
                <p>${recommended.description}</p>
                <div class="spread-meta">
                    <span>⏱️ ${this.spreads[recommended.name].readingTime}</span>
                    <span>🎯 ${this.spreads[recommended.name].complexity}</span>
                </div>
            `;
    }
  }

  getRecommendedSpread() {
    const levelSpreads = this.userLevels[this.userProfile.level]
      ?.recommendedSpreads || ["Daily Guidance"];
    const moodSpreads = this.moodSpreads[this.userProfile.mood] || [
      "Daily Guidance",
    ];

    // Find intersection of level and mood spreads
    const intersection = levelSpreads.filter((spread) =>
      moodSpreads.includes(spread),
    );
    const recommended =
      intersection.length > 0 ? intersection[0] : levelSpreads[0];

    return {
      name: recommended,
      description: this.getSpreadDescription(recommended),
    };
  }

  getSpreadDescription(spreadName) {
    const descriptions = {
      "Daily Guidance": "Perfect for daily insight and reflection",
      "Three Card": "Explore past, present, and future connections",
      Relationship: "Understand the dynamics of your connections",
      "Career Path": "Navigate your professional journey",
      "Celtic Cross": "Deep, comprehensive life exploration",
    };
    return descriptions[spreadName] || "Discover what the cards reveal";
  }

  loadSpreadOptions() {
    const container = document.getElementById("spread-options");
    if (container) {
      const availableSpreads =
        this.userLevels[this.userProfile.level]?.recommendedSpreads ||
        Object.keys(this.spreads);

      container.innerHTML = "";
      availableSpreads.forEach((spreadName) => {
        const option = document.createElement("div");
        option.className = "spread-option";
        option.innerHTML = `
                    <strong>${spreadName}</strong>
                    <small>${this.spreads[spreadName].readingTime}</small>
                `;
        option.addEventListener("click", () => this.selectSpread(spreadName));
        container.appendChild(option);
      });
    }
  }

  loadReadingHistory() {
    const container = document.getElementById("reading-history");
    if (container) {
      if (this.readingHistory.length === 0) {
        container.innerHTML =
          '<p class="text-secondary">Your journey begins here</p>';
      } else {
        container.innerHTML = this.readingHistory
          .slice(-3)
          .map(
            (reading) => `
                    <div class="history-item">
                        <strong>${reading.spreadName}</strong>
                        <small>${new Date(reading.date).toLocaleDateString()}</small>
                    </div>
                `,
          )
          .join("");
      }
    }
  }

  updateInsights() {
    const readingCount = document.getElementById("reading-count");
    const favoriteSpread = document.getElementById("favorite-spread");
    const journeyStage = document.getElementById("journey-stage");

    if (readingCount) readingCount.textContent = this.readingHistory.length;
    if (favoriteSpread) favoriteSpread.textContent = this.getFavoriteSpread();
    if (journeyStage) journeyStage.textContent = this.getJourneyStage();
  }

  getFavoriteSpread() {
    if (this.readingHistory.length === 0) return "-";
    const spreadCounts = {};
    this.readingHistory.forEach((reading) => {
      spreadCounts[reading.spreadName] =
        (spreadCounts[reading.spreadName] || 0) + 1;
    });
    return Object.keys(spreadCounts).reduce((a, b) =>
      spreadCounts[a] > spreadCounts[b] ? a : b,
    );
  }

  getJourneyStage() {
    const count = this.readingHistory.length;
    if (count === 0) return "Beginning";
    if (count < 5) return "Exploring";
    if (count < 15) return "Deepening";
    return "Mastering";
  }

  // Spread Selection
  initializeSpreadSelection() {
    const container = document.getElementById("spreads-grid");
    if (container) {
      container.innerHTML = "";

      const availableSpreads =
        this.userLevels[this.userProfile.level]?.recommendedSpreads ||
        Object.keys(this.spreads);
      const recommended = this.getRecommendedSpread().name;

      availableSpreads.forEach((spreadName) => {
        const spread = this.spreads[spreadName];
        const card = document.createElement("div");
        card.className = `spread-card ${spreadName === recommended ? "recommended" : ""}`;
        card.innerHTML = `
                    <h3>${spreadName}</h3>
                    <div class="spread-meta">
                        <span>${spread.complexity}</span>
                        <span>${spread.readingTime}</span>
                    </div>
                    <div class="spread-positions">
                        ${Array(spread.positions)
                          .fill(0)
                          .map(() => '<div class="position-dot"></div>')
                          .join("")}
                    </div>
                    <p>${this.getSpreadDescription(spreadName)}</p>
                    ${spreadName === recommended ? '<div class="status status--success">Recommended</div>' : ""}
                `;
        card.addEventListener("click", () => this.selectSpread(spreadName));
        container.appendChild(card);
      });
    }
  }

  selectSpread(spreadName) {
    this.currentSpread = spreadName;
    this.showScreen("card-selection");
  }

  // Card Selection
  initializeCardSelection() {
    const spread = this.spreads[this.currentSpread];
    const instruction = document.getElementById("selection-instruction");
    if (instruction) {
      instruction.textContent = `Select ${spread.positions} card${spread.positions > 1 ? "s" : ""} for your ${this.currentSpread} reading`;
    }

    this.selectedCards = [];
    this.createCardDeck();
    this.updateProgress();
  }

  createCardDeck() {
    const container = document.getElementById("card-deck");
    if (container) {
      container.innerHTML = "";

      // Create shuffled deck
      const deck = [...this.majorArcana].sort(() => Math.random() - 0.5);

      deck.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.className = "tarot-card";
        cardElement.innerHTML = `
                    <div class="card-back">✨</div>
                    <div class="card-front">
                        <h4>${card.name}</h4>
                    </div>
                `;
        cardElement.addEventListener("click", () =>
          this.selectCard(card, cardElement),
        );
        container.appendChild(cardElement);
      });
    }
  }

  selectCard(card, element) {
    const spread = this.spreads[this.currentSpread];

    if (this.selectedCards.length >= spread.positions) {
      return;
    }

    if (element.classList.contains("selected")) {
      return;
    }

    element.classList.add("selected");
    this.selectedCards.push({
      card: card,
      position: this.selectedCards.length,
      reversed:
        this.userLevels[this.userProfile.level]?.reversedCards &&
        Math.random() < 0.3,
    });

    this.updateSelectedCards();
    this.updateProgress();

    if (this.selectedCards.length === spread.positions) {
      const revealBtn = document.getElementById("reveal-btn");
      if (revealBtn) revealBtn.disabled = false;
    }
  }

  updateSelectedCards() {
    const container = document.getElementById("selected-cards");
    if (container) {
      const spread = this.spreads[this.currentSpread];

      container.innerHTML = "";
      this.selectedCards.forEach((selection) => {
        const cardElement = document.createElement("div");
        cardElement.className = "selected-card";
        cardElement.innerHTML = `
                    <div class="position-label">${spread.positionsMeaning[selection.position]}</div>
                    <h4>${selection.card.name}</h4>
                    ${selection.reversed ? "<small>Reversed</small>" : ""}
                `;
        container.appendChild(cardElement);
      });
    }
  }

  updateProgress() {
    const spread = this.spreads[this.currentSpread];
    const progress = (this.selectedCards.length / spread.positions) * 100;
    const progressBar = document.getElementById("card-progress");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  revealCards() {
    this.generateReading();
    this.showScreen("reading-display");
  }

  // Reading Generation
  generateReading() {
    const spread = this.spreads[this.currentSpread];
    const level = this.userLevels[this.userProfile.level];

    this.currentReading = {
      spread: this.currentSpread,
      cards: this.selectedCards,
      date: new Date().toISOString(),
      interpretations: this.generateInterpretations(level),
    };

    this.displayReading();
  }

  generateInterpretations(level) {
    return this.selectedCards.map((selection) => {
      const interpretation = this.getCardInterpretation(
        selection.card,
        selection.reversed,
        level,
      );
      return {
        ...selection,
        interpretation: interpretation,
      };
    });
  }

  getCardInterpretation(card, reversed, level) {
    const meaning = reversed ? card.meanings.reversed : card.meanings.upright;
    const keywords = card.keywords;

    let interpretation = meaning;

    // Adapt interpretation based on user level
    if (level.explanationDepth === "detailed") {
      interpretation = this.expandInterpretation(meaning, keywords, "detailed");
    } else if (level.explanationDepth === "moderate") {
      interpretation = this.expandInterpretation(meaning, keywords, "moderate");
    }

    return {
      main: interpretation,
      keywords: level.keywordsShown ? keywords : [],
      reversed: reversed,
    };
  }

  expandInterpretation(meaning, keywords, depth) {
    const contexts = [
      "This suggests a time of",
      "You may find yourself",
      "The universe is guiding you toward",
      "Consider how this energy manifests as",
      "This card encourages you to embrace",
    ];

    if (depth === "detailed") {
      const context = contexts[Math.floor(Math.random() * contexts.length)];
      return `${meaning}. ${context} ${keywords.join(", ")}. Take time to reflect on how these energies are currently influencing your life path.`;
    } else if (depth === "moderate") {
      return `${meaning}. ${keywords.slice(0, 2).join(" and ")} are key themes to focus on.`;
    }

    return meaning;
  }

  displayReading() {
    const title = document.getElementById("reading-title");
    const subtitle = document.getElementById("reading-subtitle");
    const content = document.getElementById("reading-content");

    if (title) title.textContent = `${this.currentSpread} Reading`;
    if (subtitle)
      subtitle.textContent = `Tailored for ${this.userProfile.level} level - ${this.userProfile.mood} energy`;

    if (content) {
      content.innerHTML = "";
      const spread = this.spreads[this.currentSpread];

      this.currentReading.interpretations.forEach((interpretation, index) => {
        const interpretationElement = document.createElement("div");
        interpretationElement.className = "card-interpretation slide-up";
        interpretationElement.innerHTML = `
                    <div class="interpretation-card">
                        <h4>${interpretation.card.name}</h4>
                        ${interpretation.reversed ? "<small>Reversed</small>" : ""}
                    </div>
                    <div class="interpretation-content">
                        <h4>${spread.positionsMeaning[index]}</h4>
                        <p class="interpretation-text">${interpretation.interpretation.main}</p>
                        ${
                          interpretation.interpretation.keywords.length > 0
                            ? `
                            <div class="keywords">
                                ${interpretation.interpretation.keywords.map((keyword) => `<span class="keyword">${keyword}</span>`).join("")}
                            </div>
                        `
                            : ""
                        }
                    </div>
                `;
        content.appendChild(interpretationElement);
      });
    }
  }

  // Deeper Exploration
  exploreDeeper() {
    const exploration = this.generateDeeperExploration();
    const container = document.getElementById("exploration-content");
    if (container) {
      container.innerHTML = exploration;
    }
    this.showScreen("deeper-exploration");
  }

  generateDeeperExploration() {
    const combinations = this.analyzeCardCombinations();
    const questions = this.generateFollowUpQuestions();

    return `
            <div class="card">
                <div class="card__body">
                    <h3>Card Combinations</h3>
                    <p>${combinations}</p>
                </div>
            </div>
            <div class="card">
                <div class="card__body">
                    <h3>Reflection Questions</h3>
                    <ul>
                        ${questions.map((q) => `<li>${q}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
  }

  analyzeCardCombinations() {
    if (this.selectedCards.length < 2) {
      return "Single card readings offer focused insight into the present moment.";
    }

    const first = this.selectedCards[0].card;
    const second = this.selectedCards[1].card;

    return `The combination of ${first.name} and ${second.name} suggests a powerful interplay between ${first.keywords[0]} and ${second.keywords[0]}. This pairing often indicates a period of transformation where these energies must be balanced.`;
  }

  generateFollowUpQuestions() {
    const questions = [
      "How do these themes currently manifest in your daily life?",
      "What actions can you take to align with this guidance?",
      "Which aspects of this reading resonate most strongly with you?",
      "What patterns do you notice across your recent readings?",
      "How might this guidance influence your decisions moving forward?",
    ];

    return questions.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  returnToReading() {
    this.showScreen("reading-display");
  }

  // Feedback and Learning
  completeReading() {
    this.showScreen("feedback");
  }

  setRating(ratingElement, value) {
    const stars = ratingElement.querySelectorAll(".star");
    stars.forEach((star, index) => {
      star.classList.toggle("active", index < value);
    });

    const ratingType = ratingElement.id.replace("-rating", "");
    this.feedbackData[ratingType] = parseInt(value);
  }

  submitFeedback() {
    const commentsEl = document.getElementById("feedback-comments");
    this.feedbackData.comments = commentsEl ? commentsEl.value : "";
    this.feedbackData.readingId = this.currentReading.date;

    // Add reading to history
    this.readingHistory.push({
      ...this.currentReading,
      feedback: this.feedbackData,
    });

    // Process feedback for learning
    this.processFeedback();

    this.showScreen("results");
  }

  processFeedback() {
    const avgAccuracy = this.feedbackData.accuracy || 3;
    const avgRelevance = this.feedbackData.relevance || 3;

    // Simple learning algorithm - adjust recommendations based on feedback
    if (avgAccuracy >= 4 && avgRelevance >= 4) {
      // Positive feedback - reinforce current approach
      this.userProfile.confidence = (this.userProfile.confidence || 0) + 0.1;
    } else if (avgAccuracy <= 2 || avgRelevance <= 2) {
      // Negative feedback - adjust approach
      this.userProfile.needsAdjustment = true;
    }

    this.generateResults();
  }

  generateResults() {
    const summary = document.getElementById("reading-summary");
    const recommendations = document.getElementById("recommendations");

    if (summary) {
      summary.innerHTML = `
                <p>Your ${this.currentSpread} reading explored themes of ${this.currentReading.interpretations.map((i) => i.card.keywords[0]).join(", ")}.</p>
                <p>Based on your feedback, this reading ${this.feedbackData.accuracy >= 4 ? "strongly resonated" : "provided some insights"} with your current situation.</p>
            `;
    }

    if (recommendations) {
      recommendations.innerHTML = this.generatePersonalizedRecommendations();
    }
  }

  generatePersonalizedRecommendations() {
    const recs = [];

    // Based on feedback
    if (this.feedbackData.accuracy >= 4) {
      recs.push("✨ Continue exploring similar spread patterns");
    }

    if (this.feedbackData.relevance <= 2) {
      recs.push("🎯 Try focusing on more specific questions");
    }

    // Based on reading history
    if (this.readingHistory.length >= 3) {
      recs.push("📈 Consider upgrading to more complex spreads");
    }

    // Based on mood and preferences
    if (this.userProfile.mood === "Anxious") {
      recs.push("🌙 Daily Guidance readings might help with anxiety");
    }

    if (recs.length === 0) {
      recs.push("🌟 Keep exploring - your journey is unique");
    }

    return recs.map((rec) => `<p>${rec}</p>`).join("");
  }

  // Utility Functions
  startRecommendedReading() {
    const recommended = this.getRecommendedSpread();
    this.selectSpread(recommended.name);
  }

  startNewReading() {
    this.selectedCards = [];
    this.currentReading = {};
    this.feedbackData = {};
    this.showScreen("spread-selection");
  }
}

// Initialize app immediately and make it globally accessible
let app = new TarotApp();

// Global Functions for HTML event handlers
function showScreen(screenId) {
  if (app) {
    app.showScreen(screenId);
  }
}

function nextStep() {
  if (app) {
    app.nextStep();
  }
}

function previousStep() {
  if (app) {
    app.previousStep();
  }
}

function startRecommendedReading() {
  if (app) {
    app.startRecommendedReading();
  }
}

function revealCards() {
  if (app) {
    app.revealCards();
  }
}

function exploreDeeper() {
  if (app) {
    app.exploreDeeper();
  }
}

function completeReading() {
  if (app) {
    app.completeReading();
  }
}

function returnToReading() {
  if (app) {
    app.returnToReading();
  }
}

function submitFeedback() {
  if (app) {
    app.submitFeedback();
  }
}

function startNewReading() {
  if (app) {
    app.startNewReading();
  }
}
