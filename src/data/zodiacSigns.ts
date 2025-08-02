import { ZodiacInfo, ZodiacSign } from '@/types/horoscope';
export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacInfo> = {
  aries: {
    sign: 'aries',
    name: 'Aries',
    symbol: 'Ram',
    element: 'fire',
    quality: 'cardinal',
    rulingPlanet: 'Mars',
    dateRange: 'Mar 21 - Apr 19',
    emoji: '♈'
  },
  taurus: {
    sign: 'taurus',
    name: 'Taurus',
    symbol: 'Bull',
    element: 'earth',
    quality: 'fixed',
    rulingPlanet: 'Venus',
    dateRange: 'Apr 20 - May 20',
    emoji: '♉'
  },
  gemini: {
    sign: 'gemini',
    name: 'Gemini',
    symbol: 'Twins',
    element: 'air',
    quality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 - Jun 20',
    emoji: '♊'
  },
  cancer: {
    sign: 'cancer',
    name: 'Cancer',
    symbol: 'Crab',
    element: 'water',
    quality: 'cardinal',
    rulingPlanet: 'Moon',
    dateRange: 'Jun 21 - Jul 22',
    emoji: '♋'
  },
  leo: {
    sign: 'leo',
    name: 'Leo',
    symbol: 'Lion',
    element: 'fire',
    quality: 'fixed',
    rulingPlanet: 'Sun',
    dateRange: 'Jul 23 - Aug 22',
    emoji: '♌'
  },
  virgo: {
    sign: 'virgo',
    name: 'Virgo',
    symbol: 'Virgin',
    element: 'earth',
    quality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'Aug 23 - Sep 22',
    emoji: '♍'
  },
  libra: {
    sign: 'libra',
    name: 'Libra',
    symbol: 'Scales',
    element: 'air',
    quality: 'cardinal',
    rulingPlanet: 'Venus',
    dateRange: 'Sep 23 - Oct 22',
    emoji: '♎'
  },
  scorpio: {
    sign: 'scorpio',
    name: 'Scorpio',
    symbol: 'Scorpion',
    element: 'water',
    quality: 'fixed',
    rulingPlanet: 'Pluto',
    dateRange: 'Oct 23 - Nov 21',
    emoji: '♏'
  },
  sagittarius: {
    sign: 'sagittarius',
    name: 'Sagittarius',
    symbol: 'Archer',
    element: 'fire',
    quality: 'mutable',
    rulingPlanet: 'Jupiter',
    dateRange: 'Nov 22 - Dec 21',
    emoji: '♐'
  },
  capricorn: {
    sign: 'capricorn',
    name: 'Capricorn',
    symbol: 'Goat',
    element: 'earth',
    quality: 'cardinal',
    rulingPlanet: 'Saturn',
    dateRange: 'Dec 22 - Jan 19',
    emoji: '♑'
  },
  aquarius: {
    sign: 'aquarius',
    name: 'Aquarius',
    symbol: 'Water Bearer',
    element: 'air',
    quality: 'fixed',
    rulingPlanet: 'Uranus',
    dateRange: 'Jan 20 - Feb 18',
    emoji: '♒'
  },
  pisces: {
    sign: 'pisces',
    name: 'Pisces',
    symbol: 'Fish',
    element: 'water',
    quality: 'mutable',
    rulingPlanet: 'Neptune',
    dateRange: 'Feb 19 - Mar 20',
    emoji: '♓'
  }
};
