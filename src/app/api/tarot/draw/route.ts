import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Logger from '@/utils/logger';
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logger = new Logger('tarot-api');
  try {
    const body = await request.json();
    const { 
      count = 1, 
      deckId = '00000000-0000-0000-0000-000000000001', 
      spread = 'single', 
      allowReversed = true, 
      userId 
    } = body;
    // Validate input parameters
    if (!Number.isInteger(count) || count < 1 || count > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid count parameter. Must be between 1 and 10.',
          code: 'INVALID_COUNT'
        },
        { status: 400 }
      );
    }
    const validSpreads = ['single', 'three-card', 'celtic-cross'];
    if (!validSpreads.includes(spread)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid spread type.',
          code: 'INVALID_SPREAD',
          validSpreads
        },
        { status: 400 }
      );
    }
    // Initialize Supabase client
    const supabase = await createClient();
    // Fetch deck data
    const { data: deckData, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('is_active', true)
      .single();
    if (deckError || !deckData) {
      logger.error('deck_fetch_error', userId, { deckId }, deckError || undefined, 'Failed to fetch deck data');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Deck not found or inactive',
          code: 'DECK_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    // Fetch all cards for the deck
    const { data: cardData, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('card_number');
    if (cardError || !cardData || cardData.length === 0) {
      logger.error('cards_fetch_error', userId, { deckId }, cardError || undefined, 'Failed to fetch cards');
      return NextResponse.json(
        { 
          success: false, 
          error: 'No cards found for deck',
          code: 'NO_CARDS'
        },
        { status: 500 }
      );
    }
    // Validate card count vs spread requirements
    const spreadRequirements = {
      'single': 1,
      'three-card': 3,
      'celtic-cross': 10
    };
    const requiredCount = spreadRequirements[spread as keyof typeof spreadRequirements] || count;
    if (cardData.length < requiredCount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient cards in deck. Need ${requiredCount}, have ${cardData.length}`,
          code: 'INSUFFICIENT_CARDS'
        },
        { status: 500 }
      );
    }
    // Fisher-Yates shuffle algorithm
    const deck = [...cardData];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    // Draw cards
    const drawnCards = deck.slice(0, requiredCount).map((card, index) => {
      const isReversed = allowReversed && Math.random() < 0.3; // 30% chance of reversal
      // Get position name based on spread
      const getPositionName = (spread: string, index: number): string => {
        const positions: Record<string, string[]> = {
          single: ['Present Situation'],
          'three-card': ['Past', 'Present', 'Future'],
          'celtic-cross': [
            'Present Situation',
            'Challenge/Cross',
            'Distant Past/Foundation', 
            'Recent Past',
            'Possible Outcome',
            'Immediate Future',
            'Your Approach',
            'External Influences',
            'Inner Feelings',
            'Final Outcome'
          ]
        };
        const spreadPositions = positions[spread] || positions.single;
        return spreadPositions[index] || `Position ${index + 1}`;
      };
      return {
        id: card.id,
        name: card.name,
        suit: card.suit,
        arcana_type: card.arcana_type,
        card_number: card.card_number,
        image_url: card.image_url,
        meaning_upright: card.meaning_upright,
        meaning_reversed: card.meaning_reversed,
        keywords: card.keywords,
        position: getPositionName(spread, index),
        isReversed,
        description: card.description || '',
        elemental_association: card.elemental_association,
        astrological_association: card.astrological_association
      };
    });
    const fetchTime = Date.now() - startTime;
    const drawId = `draw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Build response
    const response = {
      success: true,
      data: {
        cards: drawnCards,
        metadata: {
          deckId,
          deckName: deckData.name,
          deckDescription: deckData.description,
          spreadType: spread,
          drawId,
          timestamp: new Date().toISOString(),
          cardCount: drawnCards.length,
          allowReversed,
          userId: userId || null
        },
        performance: {
          fetchTimeMs: fetchTime,
          cardsFetched: cardData.length,
          cardsDrawn: drawnCards.length
        }
      }
    };
    logger.info('tarot_draw_success', userId, {
      spread,
      deckId,
      drawId
    }, `Drew ${drawnCards.length} cards`);
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Draw-Time': fetchTime.toString(),
        'X-Draw-ID': drawId,
      },
    });
  } catch (error) {
    logger.error(
      'tarot_draw_error',
      undefined,
      {},
      error as Error,
      'Failed to draw tarot cards.'
    );
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
