import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tarot/deck/[deckId]
 *
 * Fetches all cards for a given deck from the database.
 * This endpoint serves the Tarot Data Engine by providing dynamic card data
 * to replace hardcoded arrays in the frontend.
 *
 * Features:
 * - Public access (no authentication required)
 * - Data transformation to match frontend TarotCardData interface
 * - Comprehensive error handling
 * - Performance optimized with single query
 * - Statistics included for frontend consumption
 *
 * @param deckId - UUID of the deck to fetch cards for
 * @returns JSON response with deck info, all cards, and statistics
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  const startTime = Date.now();

  try {
    const { deckId } = await params;

    // Validate deck ID format (basic UUID check)
    if (!deckId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deckId)) {
      console.warn(`[Tarot API] Invalid deck ID format: ${deckId}`);
      return NextResponse.json(
        {
          error: 'Invalid deck ID format',
          message: 'Deck ID must be a valid UUID',
          code: 'INVALID_DECK_ID'
        },
        { status: 400 }
      );
    }

    console.log(`[Tarot API] Fetching deck: ${deckId}`);

    const supabase = await createClient();

    // First, get the deck information
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, name, description, image_url, is_active')
      .eq('id', deckId)
      .eq('is_active', true)
      .single();

    if (deckError || !deck) {
      console.error(`[Tarot API] Deck fetch error for ${deckId}:`, deckError);
      return NextResponse.json(
        {
          error: 'Deck not found or inactive',
          message: 'The requested deck does not exist or has been deactivated',
          code: 'DECK_NOT_FOUND',
          deckId
        },
        { status: 404 }
      );
    }

    // Then, get all cards for this deck
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        id,
        name,
        card_number,
        suit,
        arcana_type,
        meaning_upright,
        meaning_reversed,
        image_url,
        keywords
      `)
      .eq('deck_id', deckId)
      .order('arcana_type', { ascending: true })
      .order('card_number', { ascending: true });

    if (cardsError) {
      console.error(`[Tarot API] Cards fetch error for deck ${deckId}:`, cardsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch cards',
          message: 'Unable to retrieve cards for this deck',
          code: 'CARDS_FETCH_ERROR',
          deckId
        },
        { status: 500 }
      );
    }

    // Transform the data to match the frontend format
    const transformedCards = cards?.map(card => ({
      id: `${card.card_number}-${card.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      name: card.name,
      arcana: card.arcana_type,
      suit: card.suit,
      number: card.card_number,
      frontImage: card.image_url,
      backImage: '/images/tarot/card-back.svg', // Standard back image
      meaning: {
        upright: card.meaning_upright,
        reversed: card.meaning_reversed,
        keywords: card.keywords || []
      },
      description: `${card.name} represents ${card.meaning_upright.toLowerCase()}.`
    })) || [];

    // Group cards by arcana type for easier frontend consumption
    const majorArcana = transformedCards.filter(card => card.arcana === 'major');
    const minorArcana = transformedCards.filter(card => card.arcana === 'minor');
    
    const response = {
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        imageUrl: deck.image_url
      },
      cards: transformedCards,
      stats: {
        totalCards: transformedCards.length,
        majorArcana: majorArcana.length,
        minorArcana: minorArcana.length,
        suits: {
          cups: transformedCards.filter(card => card.suit === 'cups').length,
          pentacles: transformedCards.filter(card => card.suit === 'pentacles').length,
          swords: transformedCards.filter(card => card.suit === 'swords').length,
          wands: transformedCards.filter(card => card.suit === 'wands').length
        }
      }
    };

    const responseTime = Date.now() - startTime;
    console.log(`[Tarot API] Successfully fetched deck ${deckId} with ${transformedCards.length} cards in ${responseTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // Cache for 1 hour
        'X-Response-Time': `${responseTime}ms`,
        'X-Cards-Count': transformedCards.length.toString()
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`[Tarot API] Unexpected error in deck API (${responseTime}ms):`, error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
