/**
 * SOPHIA CLIENT - Client-side version of the Virtual Reader
 * For use in browser components without server-side dependencies
 */
export interface SophiaMessage {
  type: "greeting" | "insight" | "guidance" | "farewell";
  message: string;
  emotion?: "neutral" | "excited" | "contemplative" | "encouraging";
}
export class SophiaAgentClient {
  private greetings = [
    "Welcome, seeker. I am Sophia, your guide through the cosmic mysteries.",
    "The universe has brought us together. I am Sophia, here to illuminate your path.",
    "Greetings, dear one. I sense you seek wisdom from the cards.",
    "Welcome to this sacred space. I am Sophia, your mystic companion.",
  ];
  private cardRevealMessages = [
    "Ah, the {card} reveals itself in the position of {position}.",
    "The {card} speaks of {meaning}.",
    "I sense powerful energies from the {card}. {context}",
    "The universe has chosen the {card} for your {position}. Listen to its wisdom.",
    "{card} emerges from the cosmic tapestry, bringing {meaning}.",
  ];
  private spreadInsights = {
    single: [
      "This single card holds the key to your current situation.",
      "Focus on this card's message - it contains all you need to know right now.",
      "The universe speaks clearly through this singular wisdom.",
    ],
    "three-card": [
      "Past, present, and future align to show your journey.",
      "These three cards weave a story of transformation.",
      "The temporal trinity reveals your path through time.",
    ],
    "celtic-cross": [
      "The Celtic Cross unveils the deeper patterns at play.",
      "Ten cards create a map of your spiritual landscape.",
      "This ancient spread reveals both challenges and opportunities.",
    ],
  };
  getGreeting(): SophiaMessage {
    return {
      type: "greeting",
      message:
        this.greetings[Math.floor(Math.random() * this.greetings.length)],
      emotion: "encouraging",
    };
  }
  getCardRevealMessage(
    cardName: string,
    position: string,
    isReversed: boolean,
  ): SophiaMessage {
    const templates = this.cardRevealMessages;
    const template = templates[Math.floor(Math.random() * templates.length)];

    const meaning = isReversed
      ? "challenges and inner reflection"
      : "opportunities and forward movement";

    const context = isReversed
      ? "Its reversed position suggests a need for introspection."
      : "Its upright position brings positive energy.";

    const message = template
      .replace("{card}", cardName)
      .replace("{position}", position)
      .replace("{meaning}", meaning)
      .replace("{context}", context);

    return {
      type: "insight",
      message,
      emotion: isReversed ? "contemplative" : "excited",
    };
  }
  getSpreadInsight(spreadType: string): SophiaMessage {
    const insights = this.spreadInsights[
      spreadType as keyof typeof this.spreadInsights
    ] || ["The cards are aligning to reveal your truth."];

    return {
      type: "guidance",
      message: insights[Math.floor(Math.random() * insights.length)],
      emotion: "contemplative",
    };
  }
  getReadingComplete(): SophiaMessage {
    const messages = [
      "The cards have spoken. May their wisdom guide your path.",
      "Your reading is complete. Remember, you have the power to shape your destiny.",
      "The cosmic messages have been delivered. Walk forward with clarity and purpose.",
      "The universe has shared its secrets. Trust in the journey ahead.",
    ];

    return {
      type: "farewell",
      message: messages[Math.floor(Math.random() * messages.length)],
      emotion: "encouraging",
    };
  }
  getSaveReadingPrompt(): SophiaMessage {
    return {
      type: "guidance",
      message:
        "Would you like to save this reading to your cosmic journal? Your insights will be preserved for future reflection.",
      emotion: "neutral",
    };
  }
}
