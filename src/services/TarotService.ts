import { supabase } from "../lib/supabase/client";
import { TarotReading } from "../lib/tarot/TarotEngine";
export interface DatabaseTarotReading {
  id: string;
  user_id: string;
  spread_type: "single" | "three-card" | "celtic-cross";
  cards_drawn: unknown;
  interpretation_text: string;
  cosmic_influence: unknown | null;
  created_at: string;
}
export class TarotService {
  /**
   * Save a tarot reading to the database using the API route
   */
  static async saveReading(
    reading: TarotReading,
    userId: string,
  ): Promise<{ data: DatabaseTarotReading | null; error: unknown }> {
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { data: null, error: "No authentication token available" };
      }
      // Use the API route instead of direct database access
      const response = await fetch("/api/tarot/save-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId,
          spreadType: reading.spreadType,
          cards: reading.cards.map((card) => ({
            id: card.id,
            name: card.name,
            position: card.position || "",
            isReversed: false, // Add this if your cards have reversal state
            meaning: card.meaning,
            frontImage: card.frontImage,
            backImage: card.backImage,
          })),
          interpretation: reading.interpretation,
          cosmicInfluence: reading.cosmicInfluence,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return {
          data: null,
          error: errorData.error || "Failed to save reading",
        };
      }
      const result = await response.json();

      // Convert API response to match expected format
      const savedReading: DatabaseTarotReading = {
        id: result.readingId,
        user_id: userId,
        spread_type: reading.spreadType,
        cards_drawn: {
          cards: reading.cards,
          positions: reading.positions,
        },
        interpretation_text: reading.interpretation,
        cosmic_influence: reading.cosmicInfluence,
        created_at: result.savedAt,
      };
      return { data: savedReading, error: null };
    } catch (error) {
      console.error("Error saving tarot reading:", error);
      return { data: null, error };
    }
  }
  /**
   * Get user's tarot reading history
   */
  static async getUserReadings(
    userId: string,
    limit: number = 10,
  ): Promise<{ data: DatabaseTarotReading[] | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from("tarot_readings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      return { data, error };
    } catch (error) {
      console.error("Error fetching user readings:", error);
      return { data: null, error };
    }
  }
  /**
   * Get a specific reading by ID
   */
  static async getReadingById(
    readingId: string,
    userId: string,
  ): Promise<{ data: DatabaseTarotReading | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from("tarot_readings")
        .select("*")
        .eq("id", readingId)
        .eq("user_id", userId)
        .single();
      return { data, error };
    } catch (error) {
      console.error("Error fetching reading:", error);
      return { data: null, error };
    }
  }
  /**
   * Delete a reading
   */
  static async deleteReading(
    readingId: string,
    userId: string,
  ): Promise<{ error: unknown }> {
    try {
      const { error } = await supabase
        .from("tarot_readings")
        .delete()
        .eq("id", readingId)
        .eq("user_id", userId);
      return { error };
    } catch (error) {
      console.error("Error deleting reading:", error);
      return { error };
    }
  }
  /**
   * Get reading statistics for a user
   */
  static async getUserReadingStats(userId: string): Promise<{
    data: {
      totalReadings: number;
      readingsBySpread: Record<string, number>;
      recentActivity: DatabaseTarotReading[];
    } | null;
    error: unknown;
  }> {
    try {
      // Get total count and breakdown by spread type
      const { data: readings, error } = await supabase
        .from("tarot_readings")
        .select("spread_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) return { data: null, error };
      if (!readings) return { data: null, error: "No readings found" };
      const totalReadings = readings.length;
      const readingsBySpread = readings.reduce(
        (acc, reading) => {
          acc[reading.spread_type] = (acc[reading.spread_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      // Get recent activity (last 5 readings with full details)
      const { data: recentActivity, error: recentError } = await supabase
        .from("tarot_readings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (recentError) return { data: null, error: recentError };
      return {
        data: {
          totalReadings,
          readingsBySpread,
          recentActivity: recentActivity || [],
        },
        error: null,
      };
    } catch (error) {
      console.error("Error fetching user reading stats:", error);
      return { data: null, error };
    }
  }
}
