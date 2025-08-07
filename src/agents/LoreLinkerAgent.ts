import Firecrawl from "firecrawl";
import nlp from "compromise";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

interface LoreLinkerResult {
  summary: string;
  semanticTokens: Record<string, string[]>;
  archetypalTags: string[];
  sourceURL: string;
}

// Use type-safe return object for compromise
type NlpDoc = ReturnType<typeof nlp>;

export class LoreLinkerAgent {
  private crawler: Firecrawl;

  constructor() {
    if (!FIRECRAWL_API_KEY) {
      throw new Error(
        "Firecrawl API key not found. Set FIRECRAWL_API_KEY environment variable.",
      );
    }
    this.crawler = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });
  }

  public async processUrl(url: string): Promise<LoreLinkerResult> {
    const scrapedData = await this.crawler.scrapeUrl(url);

    if (
      !scrapedData ||
      typeof scrapedData !== "object" ||
      !("markdown" in scrapedData) ||
      typeof scrapedData.markdown !== "string"
    ) {
      throw new Error(`Invalid response from Firecrawl for URL: ${url}`);
    }

    const cleanedText = this.cleanMarkdown(scrapedData.markdown);
    const doc = nlp(cleanedText);

    return {
      summary: this.summarize(doc),
      semanticTokens: this.extractSemanticTokens(doc),
      archetypalTags: this.extractArchetypalTags(doc),
      sourceURL: url,
    };
  }

  private cleanMarkdown(markdown: string): string {
    let cleaned = markdown;

    // Remove HTML tags (e.g., <br>, <b>, <a>)
    cleaned = cleaned.replace(/<[^>]*>/g, "");

    // Remove markdown links [text](url) and image markdown ![alt text](url)
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, ""); // Images
    cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, "$1"); // Links (keep text)

    // Remove other common markdown: headers, bold, italics, code blocks, lists
    cleaned = cleaned.replace(/^#+\s.*$/gm, ""); // Headers
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1"); // Bold
    cleaned = cleaned.replace(/\*(.*?)\*/g, "$1"); // Italics
    cleaned = cleaned.replace(/_(.*?)_/g, "$1"); // Italics
    cleaned = cleaned.replace(/`{3}[\s\S]*?`{3}/g, ""); // Code blocks
    cleaned = cleaned.replace(/`(.*?)`/g, "$1"); // Inline code
    cleaned = cleaned.replace(/^[\s]*[-*+]\s/gm, ""); // List items

    // Remove HTML entities (e.g., &amp;, &lt;, &gt;)
    cleaned = cleaned.replace(/&[a-z0-9#]+;/gi, "");

    // Remove any remaining URLs that might not have been caught by markdown link removal
    cleaned = cleaned.replace(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/g, "");

    // Remove reference numbers like [88] or [177] and similar patterns like ["text"]
    cleaned = cleaned.replace(/\[\\"(.*?)\\"\]/g, ""); // Remove ["text"] patterns
    cleaned = cleaned.replace(/\[\d+\]/g, ""); // Remove [88] patterns
    cleaned = cleaned.replace(/\\?\[\d+\\?\]/g, ""); // Remove \[88\] patterns
    cleaned = cleaned.replace(/\\?\[(.*?)\\?\]/g, ""); // Remove \[text\] patterns

    // Normalize whitespace: replace multiple spaces with single space, trim lines
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
  }

  private summarize(doc: NlpDoc): string {
    const sentences: string[] = doc.sentences().out("array");
    if (sentences.length <= 5) return sentences.join(" ");

    const keywords = [
      "astrology",
      "myth",
      "god",
      "goddess",
      "zodiac",
      "planet",
      "star",
      "archetype",
      "celestial",
      "cosmos",
      "spiritual",
      "divination",
      "horoscope",
      "chart",
      "sign",
      "house",
      "aspect",
    ];

    const scored = sentences.map((s: string) => {
      let score = 0;
      const sDoc = nlp(s);

      score += sDoc.people().length * 3;
      score += sDoc.places().length * 3;
      score += sDoc.organizations().length * 3;

      keywords.forEach((k) => {
        if (s.toLowerCase().includes(k)) score += 5;
      });

      if (s.length > 50 && s.length < 200) score += 2;

      return { sentence: s, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected: string[] = [];
    const seenIndices = new Set<number>();

    for (let i = 0; i < scored.length && selected.length < 4; i++) {
      const current = scored[i];
      const index = sentences.indexOf(current.sentence);
      if ([...seenIndices].every((idx) => Math.abs(index - idx) >= 2)) {
        selected.push(current.sentence);
        seenIndices.add(index);
      }
    }

    return selected.join(" ");
  }

  private extractSemanticTokens(doc: NlpDoc): Record<string, string[]> {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "to",
      "of",
      "in",
      "on",
      "at",
      "for",
      "with",
      "as",
      "by",
      "from",
      "up",
      "down",
      "etc",
      "about",
      "above",
      "after",
      "below",
      "between",
      "more",
      "most",
      "some",
      "such",
      "not",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "can",
      "will",
      "just",
      "should",
      "now",
    ]);

    const cleanTokens = (tokens: string[]): string[] => [
      ...new Set(
        tokens
          .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
          .map((w) => {
            const base = nlp(w);
            return (
              base.verbs().toInfinitive().out("text") ||
              base.nouns().toSingular().out("text") ||
              w.toLowerCase()
            );
          }),
      ),
    ];

    return {
      nouns: cleanTokens(doc.nouns().out("array")).slice(0, 15),
      verbs: cleanTokens(doc.verbs().out("array")).slice(0, 10),
      adjectives: cleanTokens(doc.adjectives().out("array")).slice(0, 10),
    };
  }

  private extractArchetypalTags(doc: NlpDoc): string[] {
    const archetypes: Record<string, string[]> = {
      Hero: ["hero", "savior", "quest", "journey", "champion"],
      Shadow: ["shadow", "darkness", "monster"],
      Trickster: ["trickster", "jester", "mischief"],
      Mentor: ["mentor", "sage", "guide"],
      Lover: ["lover", "venus", "desire"],
      Creator: ["creator", "artist", "imagination"],
      Ruler: ["ruler", "king", "emperor"],
      Magician: ["magician", "wizard", "shaman"],
      Innocent: ["innocent", "child", "pure"],
      Explorer: ["explorer", "seeker", "wanderer"],
      Caregiver: ["caregiver", "nurturer", "healer"],
      Rebel: ["rebel", "outlaw", "anarchist"],
      Sage: ["sage", "philosopher", "truth"],
      Jester: ["jester", "comedian", "fool"],
      Orphan: ["orphan", "abandoned", "helpless"],
      Warrior: ["warrior", "fighter", "soldier"],
    };

    const matched = new Set<string>();

    for (const [type, keywords] of Object.entries(archetypes)) {
      const pattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "i");
      if (pattern.test(doc.text())) {
        matched.add(type);
      }
    }

    return matched.size > 0 ? Array.from(matched) : ["General Lore"];
  }
}
