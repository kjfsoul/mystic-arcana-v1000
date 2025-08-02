'use client';
 
import { useState, useEffect, useCallback } from 'react';
import { TarotCardData } from '../lib/tarot/TarotEngine';
import { TarotCard } from '@/types/tarot';
interface DeckInfo {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}
interface DeckStats {
  totalCards: number;
  majorArcana: number;
  minorArcana: number;
  suits: {
    cups: number;
    pentacles: number;
    swords: number;
    wands: number;
  };
}
interface TarotDeckResponse {
  deck: DeckInfo;
  cards: TarotCard[];
  stats: DeckStats;
}
interface UseTarotDeckState {
  cards: TarotCard[];
  deck: DeckInfo | null;
  stats: DeckStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  shuffleCards: () => TarotCard[];
  drawCards: (count: number) => TarotCard[];
  getCardById: (id: string) => TarotCard | undefined;
  majorArcana: TarotCard[];
  minorArcana: TarotCard[];
}
const RIDER_WAITE_DECK_ID = '00000000-0000-0000-0000-000000000001';
/**
 * Custom hook for fetching tarot deck data from the Tarot Data Engine API
 * 
 * Replaces hardcoded RIDER_WAITE_DECK imports with dynamic API calls
 * Includes loading states, error handling, and caching
 */
export const useTarotDeck = (deckId: string = RIDER_WAITE_DECK_ID): UseTarotDeckState => {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [stats, setStats] = useState<DeckStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
 
  const fetchDeck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tarot/deck/${deckId}`, {
        headers: {
          'Cache-Control': 'max-age=3600' // Cache for 1 hour
        }
      });
      
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
      
      // Initialize shuffle order
      setShuffledOrder(data.cards.map((_, index) => index));
      
      console.log(`✨ Loaded ${data.cards.length} cards from ${data.deck.name}`);
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
  // Fisher-Yates shuffle algorithm for better randomness
 
  const shuffleArray = useCallback((array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);
 
  const shuffleCards = useCallback((): TarotCard[] => {
    if (cards.length === 0) return [];
    
    const newOrder = shuffleArray(shuffledOrder);
    setShuffledOrder(newOrder);
    
    const shuffled = newOrder.map(index => cards[index]);
    console.log('🔀 Cards shuffled using cosmic randomness');
    return shuffled;
  }, [cards, shuffledOrder, shuffleArray]);
 
  const drawCards = useCallback((count: number): TarotCard[] => {
    if (cards.length === 0 || count <= 0) return [];
    
    // Ensure we have enough cards
    const availableCount = Math.min(count, cards.length);
    
    // Use current shuffle order or create new one
    const currentOrder = shuffledOrder.length === cards.length 
      ? shuffledOrder 
      : shuffleArray(cards.map((_, index) => index));
    
    const drawnIndices = currentOrder.slice(0, availableCount);
    const drawnCards = drawnIndices.map(index => {
      const card = cards[index];
      // Add random reversal (30% chance)
      return {
        ...card,
        isReversed: Math.random() < 0.3
      };
    });
    console.log(`🎴 Drew ${drawnCards.length} cards from the cosmic deck`);
    return drawnCards;
  }, [cards, shuffledOrder, shuffleArray]);
 
  const getCardById = useCallback((id: string): TarotCard | undefined => {
    return cards.find(card => card.id === id);
  }, [cards]);
  // Memoized filtered arrays
  const majorArcana = cards.filter(card => card.arcana === 'major');
  const minorArcana = cards.filter(card => card.arcana === 'minor');
 
  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);
  return {
    cards,
    deck,
    stats,
    loading,
    error,
    refetch: fetchDeck,
    shuffleCards,
    drawCards,
    getCardById,
    majorArcana,
    minorArcana
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
