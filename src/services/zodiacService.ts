export interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
}

const ZODIAC_SIGNS: Record<string, ZodiacSign> = {
  aries: {
    name: 'Aries',
    symbol: '♈',
    element: 'fire',
    quality: 'cardinal',
    rulingPlanet: 'Mars',
    dateRange: 'March 21 - April 19',
    traits: ['ambitious', 'energetic', 'pioneering', 'competitive', 'direct']
  },
  taurus: {
    name: 'Taurus',
    symbol: '♉',
    element: 'earth',
    quality: 'fixed',
    rulingPlanet: 'Venus',
    dateRange: 'April 20 - May 20',
    traits: ['reliable', 'patient', 'practical', 'devoted', 'stable']
  },
  gemini: {
    name: 'Gemini',
    symbol: '♊',
    element: 'air',
    quality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 - June 20',
    traits: ['curious', 'adaptable', 'quick-witted', 'social', 'versatile']
  },
  cancer: {
    name: 'Cancer',
    symbol: '♋',
    element: 'water',
    quality: 'cardinal',
    rulingPlanet: 'Moon',
    dateRange: 'June 21 - July 22',
    traits: ['intuitive', 'emotional', 'nurturing', 'protective', 'empathetic']
  },
  leo: {
    name: 'Leo',
    symbol: '♌',
    element: 'fire',
    quality: 'fixed',
    rulingPlanet: 'Sun',
    dateRange: 'July 23 - August 22',
    traits: ['confident', 'generous', 'creative', 'dramatic', 'warm-hearted']
  },
  virgo: {
    name: 'Virgo',
    symbol: '♍',
    element: 'earth',
    quality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'August 23 - September 22',
    traits: ['analytical', 'practical', 'methodical', 'kind', 'hardworking']
  },
  libra: {
    name: 'Libra',
    symbol: '♎',
    element: 'air',
    quality: 'cardinal',
    rulingPlanet: 'Venus',
    dateRange: 'September 23 - October 22',
    traits: ['diplomatic', 'fair-minded', 'social', 'idealistic', 'gracious']
  },
  scorpio: {
    name: 'Scorpio',
    symbol: '♏',
    element: 'water',
    quality: 'fixed',
    rulingPlanet: 'Pluto',
    dateRange: 'October 23 - November 21',
    traits: ['intense', 'passionate', 'resourceful', 'brave', 'magnetic']
  },
  sagittarius: {
    name: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    quality: 'mutable',
    rulingPlanet: 'Jupiter',
    dateRange: 'November 22 - December 21',
    traits: ['optimistic', 'freedom-loving', 'jovial', 'adventurous', 'philosophical']
  },
  capricorn: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    quality: 'cardinal',
    rulingPlanet: 'Saturn',
    dateRange: 'December 22 - January 19',
    traits: ['ambitious', 'disciplined', 'practical', 'prudent', 'responsible']
  },
  aquarius: {
    name: 'Aquarius',
    symbol: '♒',
    element: 'air',
    quality: 'fixed',
    rulingPlanet: 'Uranus',
    dateRange: 'January 20 - February 18',
    traits: ['independent', 'progressive', 'original', 'humanitarian', 'uncompromising']
  },
  pisces: {
    name: 'Pisces',
    symbol: '♓',
    element: 'water',
    quality: 'mutable',
    rulingPlanet: 'Neptune',
    dateRange: 'February 19 - March 20',
    traits: ['compassionate', 'artistic', 'intuitive', 'gentle', 'wise']
  }
};

export const zodiacService = {
  /**
   * Calculate zodiac sign from birth date
   */
  getZodiacSign(birthDate: string): ZodiacSign | null {
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return null;
    }

    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();

    // Determine zodiac sign based on date ranges
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return ZODIAC_SIGNS.aries;
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return ZODIAC_SIGNS.taurus;
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return ZODIAC_SIGNS.gemini;
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return ZODIAC_SIGNS.cancer;
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return ZODIAC_SIGNS.leo;
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return ZODIAC_SIGNS.virgo;
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return ZODIAC_SIGNS.libra;
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return ZODIAC_SIGNS.scorpio;
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return ZODIAC_SIGNS.sagittarius;
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return ZODIAC_SIGNS.capricorn;
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return ZODIAC_SIGNS.aquarius;
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return ZODIAC_SIGNS.pisces;
    }

    return null;
  },

  /**
   * Get all zodiac signs
   */
  getAllSigns(): ZodiacSign[] {
    return Object.values(ZODIAC_SIGNS);
  },

  /**
   * Get zodiac sign by name
   */
  getSignByName(name: string): ZodiacSign | null {
    const lowercaseName = name.toLowerCase();
    return ZODIAC_SIGNS[lowercaseName] || null;
  },

  /**
   * Get signs by element
   */
  getSignsByElement(element: ZodiacSign['element']): ZodiacSign[] {
    return Object.values(ZODIAC_SIGNS).filter(sign => sign.element === element);
  },

  /**
   * Generate personalized daily horoscope based on zodiac sign
   */
  generateDailyHoroscope(sign: ZodiacSign, date: Date = new Date()): string {
    const horoscopes = {
      aries: [
        "Your pioneering spirit shines today. Take initiative in new ventures.",
        "Mars energizes your ambition. Channel your competitive nature productively.",
        "Bold actions lead to breakthrough moments. Trust your instincts."
      ],
      taurus: [
        "Venus brings harmony to your relationships. Focus on beauty and comfort.",
        "Your practical nature guides wise decisions. Slow and steady wins.",
        "Ground yourself in nature. Material stability comes through patience."
      ],
      gemini: [
        "Mercury enhances your communication. Share your brilliant ideas freely.",
        "Curiosity leads to exciting discoveries. Embrace learning opportunities.",
        "Your adaptability is your strength. Navigate changes with grace."
      ],
      cancer: [
        "The Moon illuminates your emotional depths. Trust your intuition.",
        "Nurture yourself and others. Home and family bring comfort.",
        "Your empathy creates meaningful connections. Listen to your heart."
      ],
      leo: [
        "The Sun highlights your natural leadership. Step into the spotlight.",
        "Your creative fire burns bright. Express yourself authentically.",
        "Generosity and warmth attract abundance. Share your gifts freely."
      ],
      virgo: [
        "Mercury sharpens your analytical mind. Details matter today.",
        "Your helpful nature creates positive impact. Serve with purpose.",
        "Methodical approaches yield perfect results. Quality over quantity."
      ],
      libra: [
        "Venus brings balance to all relationships. Seek harmony and beauty.",
        "Your diplomatic skills resolve conflicts. Fair solutions emerge.",
        "Partnership opportunities arise. Collaborate for mutual success."
      ],
      scorpio: [
        "Pluto reveals hidden truths. Transform through deep insights.",
        "Your intensity attracts meaningful connections. Embrace vulnerability.",
        "Magnetic energy draws opportunities. Trust your powerful instincts."
      ],
      sagittarius: [
        "Jupiter expands your horizons. Adventure calls to your spirit.",
        "Philosophical insights guide your path. Seek truth and wisdom.",
        "Optimism opens new doors. Your enthusiasm is contagious."
      ],
      capricorn: [
        "Saturn rewards your discipline. Steady progress builds success.",
        "Your ambition climbs new heights. Responsibility brings respect.",
        "Practical planning ensures long-term achievement. Stay focused."
      ],
      aquarius: [
        "Uranus sparks innovative thinking. Your uniqueness is your power.",
        "Progressive ideas find receptive audiences. Lead positive change.",
        "Independence brings clarity. Trust your original vision."
      ],
      pisces: [
        "Neptune enhances your intuition. Dreams reveal important guidance.",
        "Compassion opens hearts around you. Your empathy heals others.",
        "Artistic inspiration flows freely. Create something beautiful today."
      ]
    };

    const signKey = sign.name.toLowerCase() as keyof typeof horoscopes;
    const messages = horoscopes[signKey] || horoscopes.aries;
    
    // Use date to create consistent daily variation
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % messages.length;
    
    return messages[index];
  }
};