import {
  DrawCardsRequest,
  DrawCardsResponse,
  GetReadingsRequest,
  GetReadingsResponse,
  SaveReadingRequest,
  SaveReadingResponse,
  ShuffleRequest,
  ShuffleResponse,
  tarotAPI,
} from "@/services/tarot/TarotAPIClient";
import { useCallback, useState } from "react";

export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for drawing tarot cards
 */
export function useDrawCards() {
  const [state, setState] = useState<APIState<DrawCardsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const drawCards = useCallback(async (request: DrawCardsRequest) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await tarotAPI.drawCards(request);

      if (response.success) {
        setState({ data: response, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "Failed to draw cards",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, drawCards };
}

/**
 * Hook for shuffling tarot deck
 */
export function useShuffleDeck() {
  const [state, setState] = useState<APIState<ShuffleResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const shuffleDeck = useCallback(async (request?: ShuffleRequest) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await tarotAPI.shuffleDeck(request);

      if (response.success) {
        setState({ data: response, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "Failed to shuffle deck",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, shuffleDeck };
}

/**
 * Hook for saving tarot readings
 */
export function useSaveReading() {
  const [state, setState] = useState<APIState<SaveReadingResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const saveReading = useCallback(async (request: SaveReadingRequest) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await tarotAPI.saveReading(request);

      if (response.success) {
        setState({ data: response, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "Failed to save reading",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  return { ...state, saveReading };
}

/**
 * Hook for fetching tarot readings
 */
export function useGetReadings() {
  const [state, setState] = useState<APIState<GetReadingsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const getReadings = useCallback(async (params?: GetReadingsRequest) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await tarotAPI.getReadings(params);

      if (response.success) {
        setState({ data: response, loading: false, error: null });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || "Failed to fetch readings",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const deleteReading = useCallback(
    async (id: string, userId: string) => {
      try {
        const response = await tarotAPI.deleteReading(id, userId);

        if (response.success) {
          // Refresh readings after deletion
          const currentParams = state.data?.readings ? { userId } : undefined;
          await getReadings(currentParams);
        }

        return response;
      } catch (error) {
        console.error("Delete reading error:", error);
        throw error;
      }
    },
    [getReadings, state.data]
  );

  return { ...state, getReadings, deleteReading };
}

/**
 * Hook for managing reading statistics
 */
export interface ReadingStatsResponse {
  success: boolean;
  stats: {
    totalReadings: number;
    publicReadings: number;
    privateReadings: number;
    mostCommonSpread?: string;
    mostCommonTag?: string;
    [key: string]: unknown;
  } | null;
  error?: string;
}

export function useReadingStats(userId?: string) {
  const [state, setState] = useState<APIState<ReadingStatsResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const getStats = useCallback(
    async (uid?: string) => {
      const userIdToUse = uid || userId;
      if (!userIdToUse) {
        setState({ data: null, loading: false, error: "User ID required" });
        return;
      }

      setState({ data: null, loading: true, error: null });

      try {
        const response = await tarotAPI.getReadingStats(userIdToUse);

        if (response.success) {
          setState({
            data: {
              success: response.success,
              stats: response.stats ?? null,
              error: response.error,
            },
            loading: false,
            error: null,
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: response.error || "Failed to fetch statistics",
          });
        }

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    },
    [userId]
  );

  return { ...state, getStats };
}

/**
 * Combined hook for complete tarot reading workflow
 */
export function useTarotReading() {
  const draw = useDrawCards();
  const shuffle = useShuffleDeck();
  const save = useSaveReading();
  const readings = useGetReadings();

  const [currentDrawId, setCurrentDrawId] = useState<string | null>(null);
  const [drawnCards, setDrawnCards] = useState<
    DrawCardsResponse["cards"] | null
  >(null);

  const performReading = useCallback(
    async (
      spreadType: "single" | "three-card" | "celtic-cross",
      userId?: string
    ) => {
      try {
        // 1. Shuffle the deck
        await shuffle.shuffleDeck({ algorithm: "fisher-yates" });

        // 2. Draw cards based on spread
        const cardCount =
          spreadType === "single" ? 1 : spreadType === "three-card" ? 3 : 10;
        const drawResult = await draw.drawCards({
          count: cardCount,
          spread: spreadType,
          allowReversed: true,
          userId,
        });

        if (drawResult.success) {
          // Handle the actual API response structure
          const apiResponse = drawResult as unknown as {
            success: boolean;
            data?: {
              cards: typeof drawResult.cards;
              metadata: { drawId: string };
            };
          };
          if (apiResponse.data?.cards) {
            setCurrentDrawId(apiResponse.data.metadata.drawId);
            setDrawnCards(apiResponse.data.cards);
          } else {
            // Fallback to the expected interface structure
            setCurrentDrawId(drawResult.drawId);
            setDrawnCards(drawResult.cards);
          }
        }

        return drawResult;
      } catch (error) {
        console.error("Perform reading error:", error);
        throw error;
      }
    },
    [draw, shuffle]
  );

  const saveCurrentReading = useCallback(
    async (
      userId: string,
      interpretation: string,
      question?: string,
      notes?: string,
      tags?: string[]
    ) => {
      if (!drawnCards || !currentDrawId) {
        throw new Error("No active reading to save");
      }

      const spreadType =
        drawnCards.length === 1
          ? "single"
          : drawnCards.length === 3
          ? "three-card"
          : "celtic-cross";

      const result = await save.saveReading({
        userId,
        spreadType,
        cards: drawnCards.map((card) => ({
          id: card.id,
          name: card.name,
          position: card.position || "Unknown",
          isReversed: card.isReversed,
          meaning: card.isReversed
            ? card.meaning_reversed
            : card.meaning_upright,
          frontImage: card.image_url,
        })),
        interpretation,
        question,
        notes,
        drawId: currentDrawId,
        tags,
        isPublic: false,
      });

      if (result.success) {
        // Clear current reading state after successful save
        setCurrentDrawId(null);
        setDrawnCards(null);
      }

      return result;
    },
    [drawnCards, currentDrawId, save]
  );

  return {
    // States
    isLoading:
      draw.loading || shuffle.loading || save.loading || readings.loading,
    error: draw.error || shuffle.error || save.error || readings.error,
    currentDrawId,
    drawnCards,

    // Actions
    performReading,
    saveCurrentReading,
    getReadingHistory: readings.getReadings,
    deleteReading: readings.deleteReading,

    // Individual states for fine control
    draw,
    shuffle,
    save,
    readings,
  };
}
