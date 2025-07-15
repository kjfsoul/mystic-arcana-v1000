/**
 * TarotAPIClient - Production API client for all tarot endpoints
 * Handles all API calls with proper error handling and type safety
 */

export interface DrawCardsRequest {
  count: number;
  deckId?: string;
  spread?: 'single' | 'three-card' | 'celtic-cross';
  allowReversed?: boolean;
  userId?: string;
}

export interface DrawCardsResponse {
  success: boolean;
  cards: DrawnCard[];
  spread?: SpreadInfo;
  drawId: string;
  deckId: string;
  error?: string;
}

export interface DrawnCard {
  id: string;
  name: string;
  card_number: number;
  arcana_type: 'major' | 'minor';
  suit?: string | null;
  meaning_upright: string;
  meaning_reversed: string;
  image_url: string;
  keywords: string[];
  isReversed: boolean;
  drawnAt: string;
  position?: string;
}

export interface SpreadInfo {
  type: string;
  positions: string[];
  description: string;
}

export interface ShuffleRequest {
  deckId?: string;
  algorithm?: 'fisher-yates' | 'riffle' | 'overhand';
  includePreview?: boolean;
  userId?: string;
}

export interface ShuffleResponse {
  success: boolean;
  shuffleId: string;
  deckId: string;
  cardCount: number;
  shuffleState: {
    algorithm: string;
    timestamp: string;
    entropy: number;
  };
  preview?: {
    topCard: DrawnCard;
    middleCard: DrawnCard;
    bottomCard: DrawnCard;
  };
  error?: string;
}

export interface SaveReadingRequest {
  userId: string;
  spreadType: "single" | "three-card" | "celtic-cross";
  cards: Array<{
    id: string;
    name: string;
    position: string;
    isReversed: boolean;
    meaning?: string;
    frontImage?: string;
    backImage?: string;
  }>;
  interpretation: string;
  question?: string;
  notes?: string;
  cosmicInfluence?: Record<string, unknown>;
  drawId?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface SaveReadingResponse {
  success: boolean;
  readingId: string;
  savedAt: string;
  error?: string;
}

export interface GetReadingsRequest {
  id?: string;
  userId?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  spreadType?: "single" | "three-card" | "celtic-cross";
  tags?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sort?: "created_at" | "spread_type";
  order?: "asc" | "desc";
}

export interface GetReadingsResponse {
  success: boolean;
  reading?: TarotReading;
  readings?: TarotReading[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface TarotReading {
  id: string;
  userId: string;
  spreadType: string;
  cards: DrawnCard[];
  positions: string[];
  interpretation: string;
  question?: string;
  notes?: string;
  cosmicInfluence?: Record<string, unknown>;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  drawId?: string;
}

export interface APIError {
  success: false;
  error: string;
  code: string;
  details?: string;
}

export interface GetReadingStatsResponse {
  success: boolean;
  stats?: {
    totalReadings: number;
    publicReadings: number;
    privateReadings: number;
    mostCommonSpread?: string;
    mostCommonTag?: string;
    [key: string]: unknown;
  };
  error?: string;
}

class TarotAPIClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Draw cards from the tarot deck
   */
  async drawCards(request: DrawCardsRequest): Promise<DrawCardsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tarot/draw`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Draw cards error:", error);
      return {
        success: false,
        cards: [],
        drawId: "",
        deckId: "",
        error: error instanceof Error ? error.message : "Failed to draw cards",
      };
    }
  }

  /**
   * Shuffle the tarot deck
   */
  async shuffleDeck(request: ShuffleRequest = {}): Promise<ShuffleResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tarot/shuffle`, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Shuffle deck error:", error);
      return {
        success: false,
        shuffleId: "",
        deckId: "",
        cardCount: 0,
        shuffleState: {
          algorithm: "",
          timestamp: new Date().toISOString(),
          entropy: 0,
        },
        error:
          error instanceof Error ? error.message : "Failed to shuffle deck",
      };
    }
  }

  /**
   * Save a tarot reading
   */
  async saveReading(request: SaveReadingRequest): Promise<SaveReadingResponse> {
    try {
      // Import supabase client dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase');
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      let headers = { ...this.defaultHeaders };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${this.baseUrl}/api/tarot/save-reading`, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Save reading error:", error);
      return {
        success: false,
        readingId: "",
        savedAt: "",
        error:
          error instanceof Error ? error.message : "Failed to save reading",
      };
    }
  }

  /**
   * Get tarot readings
   */
  async getReadings(
    params: GetReadingsRequest = {}
  ): Promise<GetReadingsResponse> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const url = `${this.baseUrl}/api/tarot/get-reading${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.defaultHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Get readings error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get readings",
      };
    }
  }

  /**
   * Delete a reading
   */
  async deleteReading(
    id: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const queryParams = new URLSearchParams({ id, userId });
      const response = await fetch(
        `${this.baseUrl}/api/tarot/get-reading?${queryParams}`,
        {
          method: "DELETE",
          headers: this.defaultHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Delete reading error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete reading",
      };
    }
  }

  /**
   * Get reading statistics for a user
   */
  async getReadingStats(userId: string): Promise<GetReadingStatsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tarot/save-reading?userId=${userId}`,
        {
          method: "GET",
          headers: this.defaultHeaders,
        }
      );

      const data: GetReadingStatsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Get reading stats error:", error);
      return {
        success: false,
        stats: undefined,
        error:
          error instanceof Error ? error.message : "Failed to get statistics",
      };
    }
  }
}

// Export singleton instance
export const tarotAPI = new TarotAPIClient();

// Export class for testing or custom instances
export { TarotAPIClient };
