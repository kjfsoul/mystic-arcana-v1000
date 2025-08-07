export class EmotionalAnalyzer {
  public static analyzeText(text: string): {
    themes: string[];
    sentiment: "positive" | "negative" | "neutral";
  } {
    const themes = this.extractThemes(text);
    const sentiment = this.getSentiment(text);
    return { themes, sentiment };
  }

  private static extractThemes(text: string): string[] {
    const lowerText = text.toLowerCase();
    const themes: string[] = [];
    if (lowerText.includes("love") || lowerText.includes("heart"))
      themes.push("love");
    if (lowerText.includes("sad") || lowerText.includes("cry"))
      themes.push("sadness");
    if (lowerText.includes("happy") || lowerText.includes("joy"))
      themes.push("happiness");
    if (lowerText.includes("angry") || lowerText.includes("frustrated"))
      themes.push("anger");
    if (lowerText.includes("fear") || lowerText.includes("anxious"))
      themes.push("fear");
    if (themes.length === 0) themes.push("general");
    return themes;
  }

  private static getSentiment(
    text: string,
  ): "positive" | "negative" | "neutral" {
    const lowerText = text.toLowerCase();
    const positiveWords = ["love", "happy", "joy", "good", "great"];
    const negativeWords = ["sad", "cry", "angry", "frustrated", "fear", "bad"];

    const hasPositive = positiveWords.some((word) => lowerText.includes(word));
    const hasNegative = negativeWords.some((word) => lowerText.includes(word));

    if (hasPositive && !hasNegative) return "positive";
    if (hasNegative && !hasPositive) return "negative";
    return "neutral";
  }
}
