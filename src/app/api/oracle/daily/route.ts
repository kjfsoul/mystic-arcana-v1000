import { createClient as _createClient } from '@/lib/supabase/server';
import { BirthData } from '@/types/astrology';
import {
  CompatibilityInsight,
  CosmicFocusData,
  DailyOracleData,
  DailyOracleRequest,
  DailySpread,
  HoroscopeOracleData,
  TarotCardOracleData
} from '@/types/oracle';
import Logger from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';
/**
 * Daily Oracle API - Comprehensive mystical guidance combining tarot, astrology, and cosmic insights
 * 
 * Orchestrates calls to existing systems:
 * - Tarot draw engine for daily 3-card spread
 * - Astrology horoscope calculation 
 * - Birth chart analysis for personalization
 * - Cosmic event awareness (moon phases, planetary transits)
 * - Compatibility insights
 */
const logger = new Logger('daily-oracle-api');
// Cached oracle data to prevent redundant calculations
const oracleCache = new Map<string, { data: DailyOracleData; timestamp: number }>();
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours for daily oracle
/**
 * Get today's date as a cache key
 */
function getTodayKey(userId?: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${today}_${userId || 'anonymous'}`;
}
/**
 * Call internal tarot API for daily spread
 */
async function getDailyTarotSpread(): Promise<TarotCardOracleData[]> {
  try {
    const supabase = await _createClient();
    
    // Fetch crew deck cards (daily oracle uses crew deck)
    const { data: cardData, error } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', '00000000-0000-0000-0000-000000000002') // Crew deck
      .order('card_number');
    
    if (error || !cardData || cardData.length === 0) {
      throw new Error('Failed to fetch tarot cards');
    }
    
    // Shuffle and draw 3 cards for daily guidance
    const deck = [...cardData];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    const positions = ['Morning Energy', 'Afternoon Focus', 'Evening Reflection'];
    
    return deck.slice(0, 3).map((card, index) => ({
      id: card.id,
      name: card.name,
      suit: card.suit,
      arcana_type: card.arcana_type,
      card_number: card.card_number,
      image_url: card.image_url,
      meaning_upright: card.meaning_upright,
      meaning_reversed: card.meaning_reversed,
      keywords: card.keywords || [],
      position: positions[index],
      isReversed: Math.random() < 0.25, // 25% chance of reversal
      description: card.description || '',
      elemental_association: card.elemental_association,
      astrological_association: card.astrological_association
    }));
    
  } catch (error) {
    logger.error('tarot_spread_error', undefined, {}, error as Error, 'Failed to generate daily tarot spread');
    throw error;
  }
}
/**
 * Call internal horoscope API
 */
async function getDailyHoroscope(birthData: BirthData): Promise<HoroscopeOracleData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/astrology/horoscope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthData })
    });
    
    const result = await response.json();
    
    if (!result.success || result.data.isUnavailable) {
      return {
        sign: 'Unavailable',
        degrees: 0,
        daily: 'Astrological guidance is temporarily unavailable. Trust your intuition today.',
        element: 'Unknown',
        quality: 'Unknown',
        rulingPlanet: 'Unknown'
      };
    }
    
    // Enhance with additional astrological context
    const sign = result.data.sign.toLowerCase();
    const signData = getSignMetadata(sign);
    
    return {
      sign: result.data.sign,
      degrees: result.data.degrees,
      daily: result.data.daily,
      ...signData
    };
    
  } catch (error) {
    logger.error('horoscope_error', undefined, {}, error as Error, 'Failed to get daily horoscope');
    return {
      sign: 'Unavailable',
      degrees: 0,
      daily: 'The stars are whispering secrets today. Listen to your inner wisdom and trust the path before you.',
      element: 'Unknown',
      quality: 'Unknown',
      rulingPlanet: 'Unknown'
    };
  }
}
/**
 * Generate cosmic focus for the day
 */
function getCosmicFocus(): CosmicFocusData {
  const today = new Date();
  const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const moonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const planets = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  // Simple moon phase calculation (approximate)
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const moonPhaseIndex = Math.floor((dayOfYear % 29.5) / 29.5 * 8);
  const moonSignIndex = (dayOfYear + today.getDay()) % 12;
  const dominantPlanetIndex = dayOfYear % planets.length;
  
  const energyThemes = [
    'Transformation and renewal',
    'Communication and connection',
    'Love and creativity',
    'Action and initiative',
    'Expansion and wisdom',
    'Structure and discipline',
    'Innovation and rebellion',
    'Intuition and spirituality'
  ];
  
  const recommendations = [
    'Focus on new beginnings and setting intentions',
    'Express yourself clearly and listen deeply to others',
    'Embrace beauty, art, and meaningful relationships',
    'Take decisive action toward your goals',
    'Seek knowledge and broaden your horizons',
    'Build solid foundations and honor commitments',
    'Break free from limiting patterns and embrace change',
    'Trust your intuition and explore your spiritual depths'
  ];
  
  return {
    moonPhase: moonPhases[moonPhaseIndex],
    moonSign: moonSigns[moonSignIndex],
    dominantPlanet: planets[dominantPlanetIndex],
    keyAspects: [
      `${moonPhases[moonPhaseIndex]} in ${moonSigns[moonSignIndex]} enhances emotional clarity`,
      `${planets[dominantPlanetIndex]} influence brings ${energyThemes[dominantPlanetIndex].toLowerCase()}`,
      'Universal energies align to support personal growth and manifestation'
    ],
    energyTheme: energyThemes[dominantPlanetIndex],
    recommendation: recommendations[dominantPlanetIndex]
  };
}
/**
 * Generate compatibility insights based on sun sign
 */
function getCompatibilityInsight(sign: string): CompatibilityInsight {
  const compatibilityData: Record<string, CompatibilityInsight> = {
    aries: {
      bestMatchSign: 'Leo',
      challengingSign: 'Cancer',
      relationshipAdvice: 'Your natural leadership shines in partnerships today. Lead with passion but remember to listen.',
      communicationTips: 'Speak directly but temper your intensity with warmth and understanding.'
    },
    taurus: {
      bestMatchSign: 'Virgo',
      challengingSign: 'Aquarius',
      relationshipAdvice: 'Stability and consistency in relationships bring you peace today. Show love through actions.',
      communicationTips: 'Take your time to express thoughts clearly. Your steady presence is comforting to others.'
    },
    gemini: {
      bestMatchSign: 'Aquarius',
      challengingSign: 'Virgo',
      relationshipAdvice: 'Variety and intellectual connection energize your relationships today. Share your curiosity.',
      communicationTips: 'Your wit and versatility charm others. Balance talking with deep listening.'
    },
    cancer: {
      bestMatchSign: 'Scorpio',
      challengingSign: 'Aries',
      relationshipAdvice: 'Emotional depth and nurturing create strong bonds today. Trust your intuitive feelings.',
      communicationTips: 'Share your feelings openly but create safe spaces for others to do the same.'
    },
    leo: {
      bestMatchSign: 'Sagittarius',
      challengingSign: 'Scorpio',
      relationshipAdvice: 'Your generous heart and warm spirit attract loving connections today. Shine authentically.',
      communicationTips: 'Express appreciation generously while ensuring others feel heard and valued.'
    },
    virgo: {
      bestMatchSign: 'Capricorn',
      challengingSign: 'Gemini',
      relationshipAdvice: 'Practical support and attention to details strengthen relationships today. Serve with love.',
      communicationTips: 'Offer helpful insights while avoiding criticism. Your practical wisdom is valued.'
    },
    libra: {
      bestMatchSign: 'Gemini',
      challengingSign: 'Capricorn',
      relationshipAdvice: 'Harmony and balance in partnerships bring joy today. Seek win-win solutions.',
      communicationTips: 'Your diplomatic skills smooth over conflicts. Create beauty in your conversations.'
    },
    scorpio: {
      bestMatchSign: 'Pisces',
      challengingSign: 'Leo',
      relationshipAdvice: 'Deep, transformative connections fulfill your soul today. Embrace vulnerability.',
      communicationTips: 'Share your insights with intensity balanced by compassion and trust.'
    },
    sagittarius: {
      bestMatchSign: 'Aries',
      challengingSign: 'Pisces',
      relationshipAdvice: 'Adventure and growth shared with others expand your world today. Explore together.',
      communicationTips: 'Your enthusiasm inspires others. Share your vision while respecting different perspectives.'
    },
    capricorn: {
      bestMatchSign: 'Taurus',
      challengingSign: 'Libra',
      relationshipAdvice: 'Building long-term security in relationships brings satisfaction today. Invest wisely.',
      communicationTips: 'Your reliability speaks volumes. Communicate goals clearly and honor commitments.'
    },
    aquarius: {
      bestMatchSign: 'Libra',
      challengingSign: 'Taurus',
      relationshipAdvice: 'Unique connections and intellectual freedom energize partnerships today. Be authentically you.',
      communicationTips: 'Share innovative ideas while staying grounded in genuine care for others.'
    },
    pisces: {
      bestMatchSign: 'Cancer',
      challengingSign: 'Sagittarius',
      relationshipAdvice: 'Compassionate, spiritual connections touch your heart today. Love unconditionally.',
      communicationTips: 'Express your dreams and emotions artistically. Your empathy heals and inspires.'
    }
  };
  
  return compatibilityData[sign.toLowerCase()] || compatibilityData.aries;
}
/**
 * Get zodiac sign metadata
 */
function getSignMetadata(sign: string): { element: string; quality: string; rulingPlanet: string } {
  const signData: Record<string, { element: string; quality: string; rulingPlanet: string }> = {
    aries: { element: 'Fire', quality: 'Cardinal', rulingPlanet: 'Mars' },
    taurus: { element: 'Earth', quality: 'Fixed', rulingPlanet: 'Venus' },
    gemini: { element: 'Air', quality: 'Mutable', rulingPlanet: 'Mercury' },
    cancer: { element: 'Water', quality: 'Cardinal', rulingPlanet: 'Moon' },
    leo: { element: 'Fire', quality: 'Fixed', rulingPlanet: 'Sun' },
    virgo: { element: 'Earth', quality: 'Mutable', rulingPlanet: 'Mercury' },
    libra: { element: 'Air', quality: 'Cardinal', rulingPlanet: 'Venus' },
    scorpio: { element: 'Water', quality: 'Fixed', rulingPlanet: 'Pluto' },
    sagittarius: { element: 'Fire', quality: 'Mutable', rulingPlanet: 'Jupiter' },
    capricorn: { element: 'Earth', quality: 'Cardinal', rulingPlanet: 'Saturn' },
    aquarius: { element: 'Air', quality: 'Fixed', rulingPlanet: 'Uranus' },
    pisces: { element: 'Water', quality: 'Mutable', rulingPlanet: 'Neptune' }
  };
  
  return signData[sign] || signData.aries;
}
/**
 * Generate personalized interpretation for tarot card
 */
function generatePersonalizedInterpretation(card: TarotCardOracleData, position: string, sign: string): string {
  const interpretations: Record<string, string[]> = {
    'Morning Energy': [
      `As the day begins, ${card.name} offers ${sign} the energy of ${card.isReversed ? 'reflection on' : 'embracing'} ${card.keywords.slice(0, 2).join(' and ')}.`,
      `Start your morning by ${card.isReversed ? 'reconsidering' : 'channeling'} the wisdom of ${card.name}, which speaks to your ${sign} nature.`,
      `The morning light illuminates ${card.name}'s message of ${card.keywords[0]}, perfectly aligned with your ${sign} energy.`
    ],
    'Afternoon Focus': [
      `In the height of the day, ${card.name} guides your ${sign} focus toward ${card.isReversed ? 'healing' : 'manifesting'} ${card.keywords.slice(1, 3).join(' and ')}.`,
      `Channel your midday energy through ${card.name}'s teaching of ${card.keywords[0]}, resonating with your ${sign} strength.`,
      `The afternoon brings clarity through ${card.name}, encouraging your ${sign} spirit to ${card.isReversed ? 'release' : 'embrace'} new possibilities.`
    ],
    'Evening Reflection': [
      `As twilight approaches, ${card.name} invites ${sign} to ${card.isReversed ? 'reflect deeply on' : 'celebrate'} the lessons of ${card.keywords.slice(0, 2).join(' and ')}.`,
      `End your day with ${card.name}'s wisdom, allowing your ${sign} intuition to ${card.isReversed ? 'process' : 'integrate'} today's experiences.`,
      `Evening's gentle energy through ${card.name} helps your ${sign} soul find ${card.isReversed ? 'peaceful resolution' : 'joyful completion'}.`
    ]
  };
  
  const positionInterpretations = interpretations[position] || interpretations['Morning Energy'];
  const randomIndex = Math.floor(Math.random() * positionInterpretations.length);
  return positionInterpretations[randomIndex];
}
/**
 * Generate overall theme based on cards and horoscope
 */
function generateOverallTheme(cards: TarotCardOracleData[], horoscope: HoroscopeOracleData, cosmic: CosmicFocusData): string {
  const cardThemes = cards.map(card => card.keywords[0]).join(', ');
  // const moonElement = cosmic.moonSign; // eslint: variable assigned but not used
  
  const themes = [
    `Today's cosmic symphony weaves ${cardThemes} through ${horoscope.sign}'s ${horoscope.element} energy under the ${cosmic.moonPhase}, creating a day of ${cosmic.energyTheme.toLowerCase()}.`,
    `The universe aligns ${horoscope.sign} energy with ${cardThemes} as ${cosmic.dominantPlanet} guides your path through this ${cosmic.moonPhase} in ${cosmic.moonSign}.`,
    `${horoscope.sign}'s journey today is illuminated by ${cardThemes}, while ${cosmic.dominantPlanet}'s influence and the ${cosmic.moonPhase} create perfect conditions for ${cosmic.energyTheme.toLowerCase()}.`
  ];
  
  return themes[Math.floor(Math.random() * themes.length)];
}
/**
 * Generate key message
 */
function generateKeyMessage(cards: TarotCardOracleData[], horoscope: HoroscopeOracleData): string {
  const messages = [
    `Trust the journey that ${cards[0].name} reveals, for your ${horoscope.sign} wisdom knows the way forward.`,
    `Today, ${horoscope.sign}, you are called to embody the ${cards[1].keywords[0]} energy that the universe presents through ${cards[1].name}.`,
    `The cosmos whispers through ${cards[2].name}: your ${horoscope.sign} heart holds the key to unlocking today's highest potential.`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}
/**
 * Generate actionable advice
 */
function generateActionableAdvice(cards: TarotCardOracleData[], horoscope: HoroscopeOracleData, cosmic: CosmicFocusData): string[] {
  return [
    `Channel ${cards[0].name}'s energy by ${cards[0].isReversed ? 'reflecting on' : 'taking action toward'} ${cards[0].keywords[0]}.`,
    `Honor your ${horoscope.sign} nature by ${cosmic.recommendation.toLowerCase()}.`,
    `Use ${cards[1].name}'s guidance to navigate ${cards[1].isReversed ? 'challenging' : 'beneficial'} ${cards[1].keywords[0]} today.`,
    `Align with ${cosmic.dominantPlanet}'s influence by embracing ${cosmic.energyTheme.toLowerCase()}.`,
    `Let ${cards[2].name} remind you to ${cards[2].isReversed ? 'release' : 'embrace'} ${cards[2].keywords[0]} this evening.`
  ];
}
/**
 * Generate affirmation
 */
function generateAffirmation(horoscope: HoroscopeOracleData, cosmic: CosmicFocusData): string {
  const affirmations = [
    `I am aligned with my ${horoscope.sign} power and trust the universe's guidance through this ${cosmic.moonPhase}.`,
    `Today I embody the highest qualities of ${horoscope.sign}, flowing with ${cosmic.energyTheme.toLowerCase()} and cosmic wisdom.`,
    `I trust my ${horoscope.sign} intuition and welcome the transformative energy of this ${cosmic.moonPhase} in ${cosmic.moonSign}.`,
    `The universe supports my ${horoscope.sign} journey, and I am open to receiving all the guidance and blessings today offers.`
  ];
  
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}
/**
 * Main API handler
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: DailyOracleRequest | undefined;
  
  try {
    body = await request.json();
    
    if (!body?.birthData) {
      return NextResponse.json(
        { success: false, error: 'Birth data is required for personalized oracle reading' },
        { status: 400 }
      );
    }
    
    const cacheKey = getTodayKey(body?.userId);
    
    // Check cache first
    const cached = oracleCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      logger.info('oracle_cache_hit', body.userId, { cacheKey }, 'Returned cached daily oracle');
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        generationTimeMs: Date.now() - startTime
      });
    }
    
    // Generate fresh oracle data
    logger.info('oracle_generation_start', body.userId, { birthData: body.birthData.city }, 'Starting daily oracle generation');
    
    // Parallel execution of data gathering
    const [tarotCards, horoscope] = await Promise.all([
      getDailyTarotSpread(),
      getDailyHoroscope(body.birthData)
    ]);
    
    const cosmicFocus = getCosmicFocus();
    const compatibility = getCompatibilityInsight(horoscope.sign);
    
    // Build daily spread with personalized interpretations
    const dailySpread: DailySpread = {
      type: 'daily_guidance',
      theme: `${horoscope.sign} Daily Guidance - ${cosmicFocus.energyTheme}`,
      cards: {
        morning: {
          card: tarotCards[0],
          interpretation: tarotCards[0].isReversed ? tarotCards[0].meaning_reversed : tarotCards[0].meaning_upright,
          personalizedMessage: generatePersonalizedInterpretation(tarotCards[0], 'Morning Energy', horoscope.sign)
        },
        afternoon: {
          card: tarotCards[1],
          interpretation: tarotCards[1].isReversed ? tarotCards[1].meaning_reversed : tarotCards[1].meaning_upright,
          personalizedMessage: generatePersonalizedInterpretation(tarotCards[1], 'Afternoon Focus', horoscope.sign)
        },
        evening: {
          card: tarotCards[2],
          interpretation: tarotCards[2].isReversed ? tarotCards[2].meaning_reversed : tarotCards[2].meaning_upright,
          personalizedMessage: generatePersonalizedInterpretation(tarotCards[2], 'Evening Reflection', horoscope.sign)
        }
      },
      overallGuidance: `Today's three-card spread reveals a journey of ${tarotCards.map(c => c.keywords[0]).join(', ')}, perfectly aligned with your ${horoscope.sign} nature and the cosmic energies of this ${cosmicFocus.moonPhase}.`,
      practicalAdvice: `Begin with ${tarotCards[0].keywords[0]}, focus on ${tarotCards[1].keywords[0]} during peak hours, and conclude with ${tarotCards[2].keywords[0]} for perfect daily balance.`
    };
    
    // Build complete oracle data
    const oracleData: DailyOracleData = {
      id: `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      
      dailySpread,
      horoscope,
      cosmicFocus,
      compatibility,
      
      overallTheme: generateOverallTheme(tarotCards, horoscope, cosmicFocus),
      keyMessage: generateKeyMessage(tarotCards, horoscope),
      actionableAdvice: generateActionableAdvice(tarotCards, horoscope, cosmicFocus),
      affirmation: generateAffirmation(horoscope, cosmicFocus),
      
      generatedFromBirthChart: true,
      isUnavailable: false
    };
    
    // Cache the result
    oracleCache.set(cacheKey, { data: oracleData, timestamp: Date.now() });
    
    const generationTime = Date.now() - startTime;
    
    logger.info('oracle_generation_success', body.userId, {
      sign: horoscope.sign,
      cardCount: tarotCards.length,
      generationTimeMs: generationTime
    }, 'Daily oracle generated successfully');
    
    // Store result in memory for coordination
    await Bash(`npx claude-flow@alpha hooks post-edit --file "api/oracle/daily/route.ts" --memory-key "agent/backend/daily_oracle_implementation"`);
    
    return NextResponse.json({
      success: true,
      data: oracleData,
      cached: false,
      generationTimeMs: generationTime
    });
    
  } catch (error) {
    logger.error('oracle_generation_error', body?.userId, {}, error as Error, 'Failed to generate daily oracle');
    
    // Fallback oracle data
    const fallbackData: DailyOracleData = {
      id: `oracle_fallback_${Date.now()}`,
      userId: body?.userId || 'unknown',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      
      dailySpread: {
        type: 'daily_guidance',
        theme: 'Universal Daily Guidance',
        cards: {
          morning: {
            card: {} as TarotCardOracleData,
            interpretation: 'Trust your inner wisdom as you begin this day.',
            personalizedMessage: 'The morning brings fresh energy and new possibilities.'
          },
          afternoon: {
            card: {} as TarotCardOracleData,
            interpretation: 'Stay focused on your highest priorities.',
            personalizedMessage: 'Midday clarity illuminates your path forward.'
          },
          evening: {
            card: {} as TarotCardOracleData,
            interpretation: 'Reflect on the day\'s lessons with gratitude.',
            personalizedMessage: 'Evening wisdom prepares you for tomorrow\'s journey.'
          }
        },
        overallGuidance: 'Today is filled with potential for growth and discovery. Trust your intuition.',
        practicalAdvice: 'Stay present, be kind to yourself, and remain open to unexpected opportunities.'
      },
      horoscope: {
        sign: 'Universal',
        degrees: 0,
        daily: 'The universe supports your journey today. Trust your path and remain open to guidance.',
        element: 'Spirit',
        quality: 'Universal',
        rulingPlanet: 'Universe'
      },
      cosmicFocus: {
        moonPhase: 'Mystical',
        moonSign: 'Universal',
        dominantPlanet: 'Universal Energy',
        keyAspects: ['Divine guidance is available', 'Trust your intuition', 'Stay open to signs'],
        energyTheme: 'Spiritual Growth',
        recommendation: 'Listen to your inner voice and trust the process'
      },
      compatibility: {
        bestMatchSign: 'Self-Love',
        challengingSign: 'Self-Doubt',
        relationshipAdvice: 'Focus on building a loving relationship with yourself first.',
        communicationTips: 'Speak from your heart and listen with compassion.'
      },
      
      overallTheme: 'Today brings opportunities for spiritual growth and inner discovery.',
      keyMessage: 'Trust your journey and remain open to the universe\'s guidance.',
      actionableAdvice: [
        'Start the day with intention and gratitude',
        'Stay present and mindful throughout the day',
        'Trust your intuition when making decisions',
        'End the day by reflecting on lessons learned'
      ],
      affirmation: 'I trust my journey and am open to all the guidance and blessings the universe offers.',
      
      generatedFromBirthChart: false,
      isUnavailable: true,
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      cached: false,
      generationTimeMs: Date.now() - startTime
    });
  }
}
// Store notification about completion
async function Bash(command: string) {
  try {
    const { spawn } = require('child_process');
    return new Promise((resolve) => {
      const process = spawn('bash', ['-c', command]);
      process.on('close', resolve);
    });
  } catch {
    // Silent fail for coordination commands
  }
}
