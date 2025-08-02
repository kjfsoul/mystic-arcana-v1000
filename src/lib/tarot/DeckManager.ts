import { supabase } from "../../lib/supabase";
import { TarotDeck } from "../../types/tarot";
export class DeckManager {
  static async fetchDeck(deckId: string): Promise<TarotDeck> {
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();
    if (error) throw new Error(`Deck fetch failed: ${error.message}`);
    if (!data) throw new Error("Deck not found");
    return data;
  }
  static async listDecks(): Promise<TarotDeck[]> {
    const { data } = await supabase
      .from("decks")
      .select("*")
      .eq("is_active", true);
    return data || [];
  }
  static async activateDeck(userId: string, deckId: string): Promise<void> {
    await supabase
      .from("user_profiles")
      .update({ active_deck_id: deckId })
      .eq("user_id", userId);
  }
}
