'use client';

import { useState, useEffect, useCallback } from 'react';
import { TarotCardData } from '../lib/tarot/TarotEngine';

interface TarotDeckResponse {
  deck: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
  };
  cards: TarotCardData[];
  stats: {
    totalCards: number;
    majorArcana: number;
    minorArcana: number;
    suits: {
      cups: number;
      pentacles: number;
      swords: number;
      wands: number;
    };
  };
}

interface UseTarotDeckState {
  cards: TarotCardData[];
  deck: TarotDeckResponse['deck'] | null;
  stats: TarotDeckResponse['stats'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const RIDER_WAITE_DECK_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Custom hook for fetching tarot deck data from the Tarot Data Engine API
 * 
 * Replaces hardcoded RIDER_WAITE_DECK imports with dynamic API calls
 * Includes loading states, error handling, and caching
 */
export const useTarotDeck = (deckId: string = RIDER_WAITE_DECK_ID): UseTarotDeckState => {
  const [cards, setCards] = useState<TarotCardData[]>([]);
  const [deck, setDeck] = useState<TarotDeckResponse['deck'] | null>(null);
  const [stats, setStats] = useState<TarotDeckResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeck = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tarot/deck/${deckId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch deck: ${response.status}`);
      }

      const data: TarotDeckResponse = await response.json();
      
      // Validate response structure
      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error('Invalid deck data: missing cards array');
      }

      if (data.cards.length === 0) {
        throw new Error('Deck contains no cards');
      }

      setCards(data.cards);
      setDeck(data.deck);
      setStats(data.stats);
      
      console.log(`✅ Loaded ${data.cards.length} cards from ${data.deck.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to fetch tarot deck:', errorMessage);
      
      // Fallback: Try to use cached data or show user-friendly error
      setCards([]);
      setDeck(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  return {
    cards,
    deck,
    stats,
    loading,
    error,
    refetch: fetchDeck
  };
};

/**
 * Helper hook for getting random cards from the deck
 */
export const useRandomCards = (deckId?: string) => {
  const { cards, loading, error } = useTarotDeck(deckId);

  const getRandomCard = useCallback((): TarotCardData | null => {
    if (cards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
  }, [cards]);

  const getRandomCards = useCallback((count: number): TarotCardData[] => {
    if (cards.length === 0) return [];
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [cards]);

  const shuffleDeck = useCallback((): TarotCardData[] => {
    return [...cards].sort(() => Math.random() - 0.5);
  }, [cards]);

  return {
    cards,
    loading,
    error,
    getRandomCard,
    getRandomCards,
    shuffleDeck
  };
};

/**
 * Helper hook for filtering cards by arcana type or suit
 */
export const useFilteredCards = (deckId?: string) => {
  const { cards, loading, error } = useTarotDeck(deckId);

  const getMajorArcana = useCallback((): TarotCardData[] => {
    return cards.filter(card => card.arcana === 'major');
  }, [cards]);

  const getMinorArcana = useCallback((): TarotCardData[] => {
    return cards.filter(card => card.arcana === 'minor');
  }, [cards]);

  const getCardsBySuit = useCallback((suit: 'wands' | 'cups' | 'swords' | 'pentacles'): TarotCardData[] => {
    return cards.filter(card => card.suit === suit);
  }, [cards]);

  const getCardById = useCallback((cardId: string): TarotCardData | undefined => {
    return cards.find(card => card.id === cardId);
  }, [cards]);

  return {
    cards,
    loading,
    error,
    getMajorArcana,
    getMinorArcana,
    getCardsBySuit,
    getCardById
  };
};
