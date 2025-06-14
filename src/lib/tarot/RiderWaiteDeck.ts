import { TarotCardData } from './TarotEngine';

// Complete Rider-Waite Tarot Deck Definition
export const RIDER_WAITE_DECK: TarotCardData[] = [
  // Major Arcana
  {
    id: '00-the-fool',
    name: 'The Fool',
    arcana: 'major',
    number: 0,
    frontImage: '/tarot/deck-rider-waite/major/00-the-fool.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'New beginnings, innocence, spontaneity, free spirit',
      reversed: 'Holding back, recklessness, risk-taking',
      keywords: ['beginning', 'journey', 'innocence', 'faith']
    },
    description: 'The Fool represents new beginnings and having faith in the future.'
  },
  {
    id: '01-magician',
    name: 'The Magician',
    arcana: 'major',
    number: 1,
    frontImage: '/tarot/deck-rider-waite/major/01-magician.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Manifestation, resourcefulness, power, inspired action',
      reversed: 'Manipulation, poor planning, untapped talents',
      keywords: ['manifestation', 'power', 'skill', 'concentration']
    },
    description: 'The Magician represents the power to manifest your desires through focused will.'
  },
  {
    id: '02-high-priestess',
    name: 'The High Priestess',
    arcana: 'major',
    number: 2,
    frontImage: '/tarot/deck-rider-waite/major/02-high-priestess.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Intuition, sacred knowledge, divine feminine, subconscious mind',
      reversed: 'Secrets, disconnected from intuition, withdrawal',
      keywords: ['intuition', 'mystery', 'subconscious', 'inner knowing']
    },
    description: 'The High Priestess represents intuitive wisdom and the mysteries of the subconscious.'
  },
  {
    id: '03-empress',
    name: 'The Empress',
    arcana: 'major',
    number: 3,
    frontImage: '/tarot/deck-rider-waite/major/03-empress.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Femininity, beauty, nature, nurturing, abundance',
      reversed: 'Creative block, dependence on others',
      keywords: ['fertility', 'femininity', 'beauty', 'nature']
    },
    description: 'The Empress represents the nurturing, creative force of feminine energy.'
  },
  {
    id: '04-emperor',
    name: 'The Emperor',
    arcana: 'major',
    number: 4,
    frontImage: '/tarot/deck-rider-waite/major/04-emperor.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Authority, establishment, structure, father figure',
      reversed: 'Domination, excessive control, lack of discipline',
      keywords: ['authority', 'structure', 'control', 'father']
    },
    description: 'The Emperor represents masculine authority and the power of structure.'
  },
  {
    id: '05-hierophant',
    name: 'The Hierophant',
    arcana: 'major',
    number: 5,
    frontImage: '/tarot/deck-rider-waite/major/05-hierophant.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Spiritual wisdom, religious beliefs, conformity, tradition',
      reversed: 'Personal beliefs, freedom, challenging the status quo',
      keywords: ['tradition', 'conformity', 'morality', 'ethics']
    },
    description: 'The Hierophant represents spiritual wisdom and traditional values.'
  },
  {
    id: '06-lovers',
    name: 'The Lovers',
    arcana: 'major',
    number: 6,
    frontImage: '/tarot/deck-rider-waite/major/06-lovers.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Love, harmony, relationships, values alignment',
      reversed: 'Self-love, disharmony, imbalance, misalignment',
      keywords: ['love', 'union', 'relationships', 'choices']
    },
    description: 'The Lovers represents deep connections and important choices in relationships.'
  },
  {
    id: '07-chariot',
    name: 'The Chariot',
    arcana: 'major',
    number: 7,
    frontImage: '/tarot/deck-rider-waite/major/07-chariot.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Control, willpower, success, determination',
      reversed: 'Self-discipline, opposition, lack of direction',
      keywords: ['control', 'willpower', 'success', 'determination']
    },
    description: 'The Chariot represents triumph through maintaining focus and determination.'
  },
  {
    id: '08-strength',
    name: 'Strength',
    arcana: 'major',
    number: 8,
    frontImage: '/tarot/deck-rider-waite/major/08-strength.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Strength, courage, persuasion, influence, compassion',
      reversed: 'Self doubt, lack of confidence, inadequacy',
      keywords: ['strength', 'courage', 'patience', 'control']
    },
    description: 'Strength represents inner strength and the power of compassion over force.'
  },
  {
    id: '09-hermit',
    name: 'The Hermit',
    arcana: 'major',
    number: 9,
    frontImage: '/tarot/deck-rider-waite/major/09-hermit.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Soul searching, introspection, inner guidance',
      reversed: 'Isolation, loneliness, withdrawal',
      keywords: ['introspection', 'searching', 'guidance', 'solitude']
    },
    description: 'The Hermit represents the search for inner truth and enlightenment.'
  },
  {
    id: '10-wheel-of-fortune',
    name: 'Wheel of Fortune',
    arcana: 'major',
    number: 10,
    frontImage: '/tarot/deck-rider-waite/major/10-wheel-of-fortune.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Good luck, karma, life cycles, destiny, turning point',
      reversed: 'Bad luck, lack of control, clinging to control',
      keywords: ['fate', 'destiny', 'change', 'cycles']
    },
    description: 'The Wheel of Fortune represents the cycles of life and changing fortunes.'
  },

  // Minor Arcana - Cups
  {
    id: 'ace-cups',
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    frontImage: '/tarot/deck-rider-waite/minor/ace-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Love, new relationships, compassion, creativity',
      reversed: 'Self-love, intuition, repressed emotions',
      keywords: ['love', 'emotion', 'intuition', 'spirituality']
    },
    description: 'The Ace of Cups represents new emotional beginnings and spiritual awakening.'
  },
  {
    id: 'two-cups',
    name: 'Two of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    frontImage: '/tarot/deck-rider-waite/minor/two-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Unified love, partnership, mutual attraction',
      reversed: 'Self-love, break-ups, disharmony',
      keywords: ['partnership', 'unity', 'love', 'attraction']
    },
    description: 'The Two of Cups represents partnership and mutual emotional connection.'
  },

  // Minor Arcana - Pentacles
  {
    id: 'ace-pentacles',
    name: 'Ace of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    frontImage: '/tarot/deck-rider-waite/minor/ace-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Manifestation, new financial opportunity, abundance',
      reversed: 'Lost opportunity, lack of planning, poor financial decisions',
      keywords: ['manifestation', 'prosperity', 'new venture', 'abundance']
    },
    description: 'The Ace of Pentacles represents new opportunities for material success.'
  },

  // Minor Arcana - Swords
  {
    id: 'ace-swords',
    name: 'Ace of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    frontImage: '/tarot/deck-rider-waite/minor/ace-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Breakthrough, clarity, sharp mind',
      reversed: 'Confusion, chaos, lack of clarity',
      keywords: ['breakthrough', 'clarity', 'sharp mind', 'concentration']
    },
    description: 'The Ace of Swords represents mental clarity and breakthrough moments.'
  },

  // Minor Arcana - Wands
  {
    id: 'ace-wands',
    name: 'Ace of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    frontImage: '/tarot/deck-rider-waite/minor/ace-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Inspiration, new opportunities, growth',
      reversed: 'Lack of energy, lack of passion, boredom',
      keywords: ['inspiration', 'power', 'creation', 'beginnings']
    },
    description: 'The Ace of Wands represents creative inspiration and new ventures.'
  }
];

// Helper function to get a random card from the deck
export const getRandomCard = (): TarotCardData => {
  const randomIndex = Math.floor(Math.random() * RIDER_WAITE_DECK.length);
  return RIDER_WAITE_DECK[randomIndex];
};

// Helper function to get multiple random cards
export const getRandomCards = (count: number): TarotCardData[] => {
  const shuffled = [...RIDER_WAITE_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};