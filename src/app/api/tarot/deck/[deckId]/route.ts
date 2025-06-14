import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tarot/deck/[deckId]
 * 
 * Fetches all cards for a given deck from the database.
 * This endpoint is used by the Tarot Reading Room to get card data dynamically.
 * 
 * @param deckId - UUID of the deck to fetch cards for
 * @returns JSON response with deck info and all cards
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    
    // Validate deck ID format (basic UUID check)
    if (!deckId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deckId)) {
      return NextResponse.json(
        { error: 'Invalid deck ID format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, get the deck information
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('id, name, description, image_url, is_active')
      .eq('id', deckId)
      .eq('is_active', true)
      .single();

    if (deckError || !deck) {
      console.error('Deck fetch error:', deckError);
      return NextResponse.json(
        { error: 'Deck not found or inactive' },
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
      console.error('Cards fetch error:', cardsError);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
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

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in deck API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}