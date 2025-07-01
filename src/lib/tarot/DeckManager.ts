import { supabase } from "../../lib/supabase";
import { TarotDeck, TarotDeckFilter } from "../../types/tarot";

export class DeckManager {
  static async fetchDeck(deckId: string): Promise<TarotDeck> {
    const { data, error } = await supabase
      .from("tarot_decks")
      .select("*")
      .single()
      .match({ id: deckId });

    if (error) throw new Error(`Deck fetch failed: ${error.message}`);
    if (!data) throw new Error("Deck not found");
    return data;
  }

  static async listDecks(
    userId: string,
    filters: Partial<TarotDeckFilter> = {}
  ): Promise<TarotDeck[]> {
    const { data } = await supabase
      .from("tarot_decks")
      .select("*")
      .filter("is_active", "eq", true)
      .filter("type", "in", ["core", "seasonal"])
      .filter("uploaded_by", "eq", userId)
      .or("type", "eq", "core")
      .applyFilters(filters);

    return data || [];
  }

  static async activateDeck(userId: string, deckId: string): Promise<void> {
    await supabase
      .from("user_preferences")
      .update({ active_tarot_deck: deckId })
      .match({ user_id: userId });
  }
}
