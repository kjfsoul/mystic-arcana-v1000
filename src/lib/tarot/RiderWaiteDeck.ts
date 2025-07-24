import { TarotCardData } from './TarotEngine';

// Complete 78-Card Rider-Waite Tarot Deck Definition
export const RIDER_WAITE_DECK: TarotCardData[] = [
  // MAJOR ARCANA (22 cards)
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
  {
    id: '11-justice',
    name: 'Justice',
    arcana: 'major',
    number: 11,
    frontImage: '/tarot/deck-rider-waite/major/11-justice.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Justice, fairness, truth, cause and effect, law',
      reversed: 'Unfairness, lack of accountability, dishonesty',
      keywords: ['justice', 'fairness', 'truth', 'law']
    },
    description: 'Justice represents fairness, truth, and the law of cause and effect.'
  },
  {
    id: '12-hanged-man',
    name: 'The Hanged Man',
    arcana: 'major',
    number: 12,
    frontImage: '/tarot/deck-rider-waite/major/12-hanged-man.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Surrender, letting go, new perspective',
      reversed: 'Delays, resistance, stalling',
      keywords: ['surrender', 'letting go', 'pause', 'new perspective']
    },
    description: 'The Hanged Man represents surrender and gaining new perspective through letting go.'
  },
  {
    id: '13-death',
    name: 'Death',
    arcana: 'major',
    number: 13,
    frontImage: '/tarot/deck-rider-waite/major/13-death.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Endings, beginnings, change, transformation',
      reversed: 'Resistance to change, personal transformation, inner purging',
      keywords: ['transformation', 'endings', 'change', 'transition']
    },
    description: 'Death represents transformation and the natural cycle of endings and beginnings.'
  },
  {
    id: '14-temperance',
    name: 'Temperance',
    arcana: 'major',
    number: 14,
    frontImage: '/tarot/deck-rider-waite/major/14-temperance.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Balance, moderation, patience, purpose',
      reversed: 'Imbalance, excess, self-healing, re-alignment',
      keywords: ['balance', 'moderation', 'patience', 'purpose']
    },
    description: 'Temperance represents balance, moderation, and finding your purpose through patience.'
  },
  {
    id: '15-devil',
    name: 'The Devil',
    arcana: 'major',
    number: 15,
    frontImage: '/tarot/deck-rider-waite/major/15-devil.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Shadow self, attachment, addiction, restriction',
      reversed: 'Releasing limiting beliefs, exploring dark thoughts, detachment',
      keywords: ['bondage', 'addiction', 'sexuality', 'materialism']
    },
    description: 'The Devil represents bondage to material things and the shadow aspects of ourselves.'
  },
  {
    id: '16-tower',
    name: 'The Tower',
    arcana: 'major',
    number: 16,
    frontImage: '/tarot/deck-rider-waite/major/16-tower.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Sudden change, upheaval, chaos, revelation, awakening',
      reversed: 'Personal transformation, fear of change, averting disaster',
      keywords: ['sudden change', 'upheaval', 'chaos', 'revelation']
    },
    description: 'The Tower represents sudden change and the breakdown of old structures.'
  },
  {
    id: '17-star',
    name: 'The Star',
    arcana: 'major',
    number: 17,
    frontImage: '/tarot/deck-rider-waite/major/17-star.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Hope, faith, purpose, renewal, spirituality',
      reversed: 'Lack of faith, despair, self-trust, disconnection',
      keywords: ['hope', 'faith', 'purpose', 'renewal']
    },
    description: 'The Star represents hope, faith, and spiritual guidance after difficult times.'
  },
  {
    id: '18-moon',
    name: 'The Moon',
    arcana: 'major',
    number: 18,
    frontImage: '/tarot/deck-rider-waite/major/18-moon.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Illusion, fear, anxiety, subconscious, intuition',
      reversed: 'Release of fear, repressed emotion, inner confusion',
      keywords: ['illusion', 'fear', 'anxiety', 'intuition']
    },
    description: 'The Moon represents illusion, intuition, and the mysterious realm of the subconscious.'
  },
  {
    id: '19-sun',
    name: 'The Sun',
    arcana: 'major',
    number: 19,
    frontImage: '/tarot/deck-rider-waite/major/19-sun.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Optimism, fun, warmth, success, positivity',
      reversed: 'Inner child, feeling down, overly optimistic',
      keywords: ['optimism', 'fun', 'warmth', 'success']
    },
    description: 'The Sun represents joy, success, and the radiant energy of achievement.'
  },
  {
    id: '20-judgement',
    name: 'Judgement',
    arcana: 'major',
    number: 20,
    frontImage: '/tarot/deck-rider-waite/major/20-judgement.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Judgement, rebirth, inner calling, absolution',
      reversed: 'Self-doubt, inner critic, ignoring the call',
      keywords: ['judgement', 'rebirth', 'inner calling', 'absolution']
    },
    description: 'Judgement represents rebirth, spiritual awakening, and answering your higher calling.'
  },
  {
    id: '21-world',
    name: 'The World',
    arcana: 'major',
    number: 21,
    frontImage: '/tarot/deck-rider-waite/major/21-world.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Completion, integration, accomplishment, travel',
      reversed: 'Seeking personal closure, short-cut to success',
      keywords: ['completion', 'integration', 'accomplishment', 'travel']
    },
    description: 'The World represents completion, fulfillment, and the successful end of a journey.'
  },

  // MINOR ARCANA - CUPS (14 cards)
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
  {
    id: 'three-cups',
    name: 'Three of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    frontImage: '/tarot/deck-rider-waite/minor/three-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Celebration, friendship, creativity, collaborations',
      reversed: 'Independence, alone time, hardcore partying, three\'s a crowd',
      keywords: ['celebration', 'friendship', 'creativity', 'collaboration']
    },
    description: 'The Three of Cups represents celebration, friendship, and creative collaboration.'
  },
  {
    id: 'four-cups',
    name: 'Four of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    frontImage: '/tarot/deck-rider-waite/minor/four-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Meditation, contemplation, apathy, reevaluation',
      reversed: 'Retreat, withdrawal, checking in with yourself',
      keywords: ['meditation', 'contemplation', 'apathy', 'reevaluation']
    },
    description: 'The Four of Cups represents meditation, contemplation, and emotional reevaluation.'
  },
  {
    id: 'five-cups',
    name: 'Five of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    frontImage: '/tarot/deck-rider-waite/minor/five-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Regret, failure, disappointment, pessimism',
      reversed: 'Personal setbacks, self-forgiveness, moving on',
      keywords: ['regret', 'failure', 'disappointment', 'pessimism']
    },
    description: 'The Five of Cups represents regret, disappointment, and learning from loss.'
  },
  {
    id: 'six-cups',
    name: 'Six of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    frontImage: '/tarot/deck-rider-waite/minor/six-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Revisiting the past, childhood memories, innocence, joy',
      reversed: 'Living in the past, forgiveness, lacking playfulness',
      keywords: ['nostalgia', 'childhood', 'innocence', 'joy']
    },
    description: 'The Six of Cups represents nostalgia, childhood memories, and innocent joy.'
  },
  {
    id: 'seven-cups',
    name: 'Seven of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    frontImage: '/tarot/deck-rider-waite/minor/seven-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Opportunities, choices, wishful thinking, illusion',
      reversed: 'Alignment, personal values, overwhelmed by choices',
      keywords: ['opportunities', 'choices', 'wishful thinking', 'illusion']
    },
    description: 'The Seven of Cups represents choices, opportunities, and the need for focus.'
  },
  {
    id: 'eight-cups',
    name: 'Eight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    frontImage: '/tarot/deck-rider-waite/minor/eight-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Disappointment, abandonment, withdrawal, escapism',
      reversed: 'Trying one more time, indecision, aimless drifting',
      keywords: ['disappointment', 'abandonment', 'withdrawal', 'escapism']
    },
    description: 'The Eight of Cups represents walking away from disappointment to seek fulfillment.'
  },
  {
    id: 'nine-cups',
    name: 'Nine of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    frontImage: '/tarot/deck-rider-waite/minor/nine-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Contentment, satisfaction, gratitude, wish come true',
      reversed: 'Inner happiness, materialism, dissatisfaction',
      keywords: ['contentment', 'satisfaction', 'gratitude', 'wish']
    },
    description: 'The Nine of Cups represents contentment, satisfaction, and wishes fulfilled.'
  },
  {
    id: 'ten-cups',
    name: 'Ten of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    frontImage: '/tarot/deck-rider-waite/minor/ten-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Divine love, blissful relationships, harmony, alignment',
      reversed: 'Disconnection, misaligned values, struggling relationships',
      keywords: ['divine love', 'blissful relationships', 'harmony', 'alignment']
    },
    description: 'The Ten of Cups represents emotional fulfillment and harmonious relationships.'
  },
  {
    id: 'page-cups',
    name: 'Page of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 11,
    frontImage: '/tarot/deck-rider-waite/minor/page-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Creative opportunities, intuitive messages, curiosity, possibility',
      reversed: 'New ideas, doubting intuition, creative blocks',
      keywords: ['creative opportunities', 'intuitive messages', 'curiosity', 'possibility']
    },
    description: 'The Page of Cups represents creative opportunities and intuitive messages.'
  },
  {
    id: 'knight-cups',
    name: 'Knight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 12,
    frontImage: '/tarot/deck-rider-waite/minor/knight-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Creativity, romance, charm, imagination, beauty',
      reversed: 'Overactive imagination, unrealistic, jealous, moody',
      keywords: ['creativity', 'romance', 'charm', 'imagination']
    },
    description: 'The Knight of Cups represents romance, creativity, and following your heart.'
  },
  {
    id: 'queen-cups',
    name: 'Queen of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 13,
    frontImage: '/tarot/deck-rider-waite/minor/queen-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Compassionate, caring, emotionally stable, intuitive, in flow',
      reversed: 'Inner feelings, self-care, self-love, codependency',
      keywords: ['compassionate', 'caring', 'emotionally stable', 'intuitive']
    },
    description: 'The Queen of Cups represents emotional maturity, compassion, and intuitive wisdom.'
  },
  {
    id: 'king-cups',
    name: 'King of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 14,
    frontImage: '/tarot/deck-rider-waite/minor/king-cups.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Emotionally balanced, compassionate, generous, diplomatic',
      reversed: 'Self-compassion, inner feelings, moodiness, emotionally manipulative',
      keywords: ['emotionally balanced', 'compassionate', 'generous', 'diplomatic']
    },
    description: 'The King of Cups represents emotional mastery and compassionate leadership.'
  },

  // MINOR ARCANA - PENTACLES (14 cards)
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
  {
    id: 'two-pentacles',
    name: 'Two of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    frontImage: '/tarot/deck-rider-waite/minor/two-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Multiple priorities, time management, prioritization, adaptability',
      reversed: 'Over-committed, disorganization, reprioritization',
      keywords: ['multiple priorities', 'time management', 'prioritization', 'adaptability']
    },
    description: 'The Two of Pentacles represents balance, adaptability, and managing multiple priorities.'
  },
  {
    id: 'three-pentacles',
    name: 'Three of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    frontImage: '/tarot/deck-rider-waite/minor/three-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Teamwork, collaboration, learning, implementation',
      reversed: 'Disharmony, misalignment, working alone',
      keywords: ['teamwork', 'collaboration', 'learning', 'implementation']
    },
    description: 'The Three of Pentacles represents teamwork, collaboration, and shared learning.'
  },
  {
    id: 'four-pentacles',
    name: 'Four of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    frontImage: '/tarot/deck-rider-waite/minor/four-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Saving money, security, conservatism, scarcity, control',
      reversed: 'Over-spending, greed, self-protection',
      keywords: ['saving money', 'security', 'conservatism', 'control']
    },
    description: 'The Four of Pentacles represents financial security, conservatism, and control over resources.'
  },
  {
    id: 'five-pentacles',
    name: 'Five of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    frontImage: '/tarot/deck-rider-waite/minor/five-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Financial loss, poverty, lack mindset, isolation, worry',
      reversed: 'Recovery from financial loss, spiritual poverty',
      keywords: ['financial loss', 'poverty', 'lack mindset', 'isolation']
    },
    description: 'The Five of Pentacles represents financial hardship and the need for support.'
  },
  {
    id: 'six-pentacles',
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    frontImage: '/tarot/deck-rider-waite/minor/six-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Giving, receiving, sharing wealth, generosity, charity',
      reversed: 'Self-care, unpaid debts, one-sided charity',
      keywords: ['giving', 'receiving', 'sharing wealth', 'generosity']
    },
    description: 'The Six of Pentacles represents generosity, charity, and the balance of giving and receiving.'
  },
  {
    id: 'seven-pentacles',
    name: 'Seven of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    frontImage: '/tarot/deck-rider-waite/minor/seven-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Sustainable results, long-term view, perseverance, investment',
      reversed: 'Lack of long-term vision, limited success or reward',
      keywords: ['sustainable results', 'long-term view', 'perseverance', 'investment']
    },
    description: 'The Seven of Pentacles represents patience, perseverance, and long-term investment.'
  },
  {
    id: 'eight-pentacles',
    name: 'Eight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    frontImage: '/tarot/deck-rider-waite/minor/eight-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Apprenticeship, repetitive tasks, mastery, skill development',
      reversed: 'Lack of focus, perfectionism, misdirected activity',
      keywords: ['apprenticeship', 'repetitive tasks', 'mastery', 'skill development']
    },
    description: 'The Eight of Pentacles represents dedication to craft, skill development, and mastery.'
  },
  {
    id: 'nine-pentacles',
    name: 'Nine of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    frontImage: '/tarot/deck-rider-waite/minor/nine-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Abundance, luxury, self-sufficiency, financial independence',
      reversed: 'Self-worth, over-investment in work, hustling',
      keywords: ['abundance', 'luxury', 'self-sufficiency', 'financial independence']
    },
    description: 'The Nine of Pentacles represents luxury, self-sufficiency, and financial independence.'
  },
  {
    id: 'ten-pentacles',
    name: 'Ten of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    frontImage: '/tarot/deck-rider-waite/minor/ten-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Wealth, financial security, family, long-term success',
      reversed: 'The dark side of wealth, financial failure or loss',
      keywords: ['wealth', 'financial security', 'family', 'long-term success']
    },
    description: 'The Ten of Pentacles represents wealth, family legacy, and long-term financial security.'
  },
  {
    id: 'page-pentacles',
    name: 'Page of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 11,
    frontImage: '/tarot/deck-rider-waite/minor/page-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Manifestation, financial opportunity, skill development',
      reversed: 'Lack of progress, procrastination, learn from failure',
      keywords: ['manifestation', 'financial opportunity', 'skill development']
    },
    description: 'The Page of Pentacles represents new opportunities for learning and financial growth.'
  },
  {
    id: 'knight-pentacles',
    name: 'Knight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 12,
    frontImage: '/tarot/deck-rider-waite/minor/knight-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Hard work, productivity, routine, conservatism',
      reversed: 'Self-discipline, boredom, feeling stuck, perfectionism',
      keywords: ['hard work', 'productivity', 'routine', 'conservatism']
    },
    description: 'The Knight of Pentacles represents dedication, hard work, and methodical progress.'
  },
  {
    id: 'queen-pentacles',
    name: 'Queen of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 13,
    frontImage: '/tarot/deck-rider-waite/minor/queen-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Nurturing, practical, providing financially, a working parent',
      reversed: 'Self-care, work-home imbalance',
      keywords: ['nurturing', 'practical', 'providing financially', 'working parent']
    },
    description: 'The Queen of Pentacles represents nurturing abundance, practical wisdom, and resourcefulness.'
  },
  {
    id: 'king-pentacles',
    name: 'King of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 14,
    frontImage: '/tarot/deck-rider-waite/minor/king-pentacles.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Financial success, business acumen, security, leadership',
      reversed: 'Financial failure, lack of ambition, bribery, corruption',
      keywords: ['financial success', 'business acumen', 'security', 'leadership']
    },
    description: 'The King of Pentacles represents financial mastery, business success, and generous leadership.'
  },

  // MINOR ARCANA - SWORDS (14 cards)
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
  {
    id: 'two-swords',
    name: 'Two of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    frontImage: '/tarot/deck-rider-waite/minor/two-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Difficult decisions, weighing up options, an impasse, avoidance',
      reversed: 'Indecision, confusion, information overload',
      keywords: ['difficult decisions', 'weighing options', 'impasse', 'avoidance']
    },
    description: 'The Two of Swords represents difficult decisions and the need to choose a path forward.'
  },
  {
    id: 'three-swords',
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    frontImage: '/tarot/deck-rider-waite/minor/three-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Heartbreak, emotional pain, sorrow, grief, hurt',
      reversed: 'Negative self-talk, releasing pain, optimism, forgiveness',
      keywords: ['heartbreak', 'emotional pain', 'sorrow', 'grief']
    },
    description: 'The Three of Swords represents heartbreak, grief, and emotional pain that leads to growth.'
  },
  {
    id: 'four-swords',
    name: 'Four of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    frontImage: '/tarot/deck-rider-waite/minor/four-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Rest, relaxation, meditation, contemplation, recuperation',
      reversed: 'Exhaustion, burn-out, deep contemplation, stagnation',
      keywords: ['rest', 'relaxation', 'meditation', 'contemplation']
    },
    description: 'The Four of Swords represents rest, meditation, and the need for mental recuperation.'
  },
  {
    id: 'five-swords',
    name: 'Five of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    frontImage: '/tarot/deck-rider-waite/minor/five-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Conflict, disagreements, competition, defeat, winning at all costs',
      reversed: 'Reconciliation, making amends, past resentment',
      keywords: ['conflict', 'disagreements', 'competition', 'defeat']
    },
    description: 'The Five of Swords represents conflict, competition, and the cost of winning at any price.'
  },
  {
    id: 'six-swords',
    name: 'Six of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    frontImage: '/tarot/deck-rider-waite/minor/six-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Transition, change, rite of passage, releasing baggage',
      reversed: 'Personal transition, resistance to change, unfinished business',
      keywords: ['transition', 'change', 'rite of passage', 'releasing baggage']
    },
    description: 'The Six of Swords represents transition, moving forward, and leaving the past behind.'
  },
  {
    id: 'seven-swords',
    name: 'Seven of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    frontImage: '/tarot/deck-rider-waite/minor/seven-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Betrayal, deception, getting away with something, acting strategically',
      reversed: 'Imposter syndrome, self-deceit, keeping secrets',
      keywords: ['betrayal', 'deception', 'getting away', 'strategic action']
    },
    description: 'The Seven of Swords represents deception, strategy, and getting away with something.'
  },
  {
    id: 'eight-swords',
    name: 'Eight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    frontImage: '/tarot/deck-rider-waite/minor/eight-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Negative thoughts, self-imposed restriction, imprisonment, victim mentality',
      reversed: 'Self-limiting beliefs, inner critic, releasing negative thoughts',
      keywords: ['negative thoughts', 'restriction', 'imprisonment', 'victim mentality']
    },
    description: 'The Eight of Swords represents mental imprisonment and self-imposed limitations.'
  },
  {
    id: 'nine-swords',
    name: 'Nine of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    frontImage: '/tarot/deck-rider-waite/minor/nine-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Anxiety, worry, fear, depression, nightmares',
      reversed: 'Inner turmoil, deep-seated fears, secrets, releasing worry',
      keywords: ['anxiety', 'worry', 'fear', 'depression']
    },
    description: 'The Nine of Swords represents anxiety, worry, and the dark night of the soul.'
  },
  {
    id: 'ten-swords',
    name: 'Ten of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    frontImage: '/tarot/deck-rider-waite/minor/ten-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Painful endings, deep wounds, betrayal, loss, crisis',
      reversed: 'Recovery, regeneration, resisting an inevitable end',
      keywords: ['painful endings', 'deep wounds', 'betrayal', 'loss']
    },
    description: 'The Ten of Swords represents painful endings and the promise of new beginnings.'
  },
  {
    id: 'page-swords',
    name: 'Page of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 11,
    frontImage: '/tarot/deck-rider-waite/minor/page-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'New ideas, curiosity, thirst for knowledge, new ways of communicating',
      reversed: 'Self-expression, all talk and no action, haphazard action',
      keywords: ['new ideas', 'curiosity', 'thirst for knowledge', 'communication']
    },
    description: 'The Page of Swords represents curiosity, new ideas, and the thirst for knowledge.'
  },
  {
    id: 'knight-swords',
    name: 'Knight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 12,
    frontImage: '/tarot/deck-rider-waite/minor/knight-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Ambitious, action-oriented, driven to succeed, fast-thinking',
      reversed: 'Restless, unfocused, impulsive, burn-out',
      keywords: ['ambitious', 'action-oriented', 'driven', 'fast-thinking']
    },
    description: 'The Knight of Swords represents ambition, action, and swift movement toward goals.'
  },
  {
    id: 'queen-swords',
    name: 'Queen of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 13,
    frontImage: '/tarot/deck-rider-waite/minor/queen-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Independent, unbiased judgement, clear boundaries, direct communication',
      reversed: 'Overly emotional, easily influenced, bitchy, cold-hearted',
      keywords: ['independent', 'unbiased judgement', 'clear boundaries', 'direct communication']
    },
    description: 'The Queen of Swords represents independence, clear thinking, and direct communication.'
  },
  {
    id: 'king-swords',
    name: 'King of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 14,
    frontImage: '/tarot/deck-rider-waite/minor/king-swords.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Mental clarity, intellectual power, authority, truth',
      reversed: 'Quiet power, inner truth, misuse of power, manipulation',
      keywords: ['mental clarity', 'intellectual power', 'authority', 'truth']
    },
    description: 'The King of Swords represents intellectual mastery, authority, and the pursuit of truth.'
  },

  // MINOR ARCANA - WANDS (14 cards)
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
  },
  {
    id: 'two-wands',
    name: 'Two of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    frontImage: '/tarot/deck-rider-waite/minor/two-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Future planning, making decisions, leaving comfort zone',
      reversed: 'Personal goals, inner alignment, fear of unknown',
      keywords: ['future planning', 'making decisions', 'leaving comfort zone']
    },
    description: 'The Two of Wands represents planning for the future and making important decisions.'
  },
  {
    id: 'three-wands',
    name: 'Three of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    frontImage: '/tarot/deck-rider-waite/minor/three-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Progress, expansion, foresight, overseas opportunities',
      reversed: 'Playing small, lack of foresight, unexpected delays',
      keywords: ['progress', 'expansion', 'foresight', 'overseas opportunities']
    },
    description: 'The Three of Wands represents progress, expansion, and looking toward the future.'
  },
  {
    id: 'four-wands',
    name: 'Four of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    frontImage: '/tarot/deck-rider-waite/minor/four-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Celebration, joy, harmony, relaxation, homecoming',
      reversed: 'Personal celebration, inner harmony, conflict with others',
      keywords: ['celebration', 'joy', 'harmony', 'relaxation']
    },
    description: 'The Four of Wands represents celebration, harmony, and joyful milestones.'
  },
  {
    id: 'five-wands',
    name: 'Five of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    frontImage: '/tarot/deck-rider-waite/minor/five-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Conflict, disagreements, competition, tension, diversity',
      reversed: 'Inner conflict, conflict avoidance, tension release',
      keywords: ['conflict', 'disagreements', 'competition', 'tension']
    },
    description: 'The Five of Wands represents conflict, competition, and diverse viewpoints.'
  },
  {
    id: 'six-wands',
    name: 'Six of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    frontImage: '/tarot/deck-rider-waite/minor/six-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Success, public recognition, progress, self-confidence',
      reversed: 'Private achievement, personal definition of success, fall from grace',
      keywords: ['success', 'public recognition', 'progress', 'self-confidence']
    },
    description: 'The Six of Wands represents success, achievement, and public recognition.'
  },
  {
    id: 'seven-wands',
    name: 'Seven of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    frontImage: '/tarot/deck-rider-waite/minor/seven-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Challenge, competition, protection, perseverance',
      reversed: 'Exhaustion, giving up, overwhelmed',
      keywords: ['challenge', 'competition', 'protection', 'perseverance']
    },
    description: 'The Seven of Wands represents standing your ground and defending your position.'
  },
  {
    id: 'eight-wands',
    name: 'Eight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    frontImage: '/tarot/deck-rider-waite/minor/eight-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Swiftness, speed, progress, movement, quick decisions',
      reversed: 'Delays, frustration, resisting change, internal alignment',
      keywords: ['swiftness', 'speed', 'progress', 'movement']
    },
    description: 'The Eight of Wands represents swift action, rapid progress, and forward momentum.'
  },
  {
    id: 'nine-wands',
    name: 'Nine of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    frontImage: '/tarot/deck-rider-waite/minor/nine-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Resilience, courage, persistence, test of faith, boundaries',
      reversed: 'Inner resources, struggle, overwhelm, defensive, paranoia',
      keywords: ['resilience', 'courage', 'persistence', 'test of faith']
    },
    description: 'The Nine of Wands represents resilience, persistence, and defending your accomplishments.'
  },
  {
    id: 'ten-wands',
    name: 'Ten of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    frontImage: '/tarot/deck-rider-waite/minor/ten-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Burden, extra responsibility, hard work, completion',
      reversed: 'Doing it all, carrying the burden, delegation, release',
      keywords: ['burden', 'extra responsibility', 'hard work', 'completion']
    },
    description: 'The Ten of Wands represents burden, responsibility, and approaching completion.'
  },
  {
    id: 'page-wands',
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 11,
    frontImage: '/tarot/deck-rider-waite/minor/page-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Inspiration, ideas, discovery, limitless potential, free spirit',
      reversed: 'Newly formed ideas, redirecting energy, self-limiting beliefs',
      keywords: ['inspiration', 'ideas', 'discovery', 'limitless potential']
    },
    description: 'The Page of Wands represents inspiration, discovery, and limitless potential.'
  },
  {
    id: 'knight-wands',
    name: 'Knight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 12,
    frontImage: '/tarot/deck-rider-waite/minor/knight-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Action, impulsiveness, adventure, energy, fearlessness',
      reversed: 'Passion project, haste, scattered energy, delays, frustration',
      keywords: ['action', 'impulsiveness', 'adventure', 'energy']
    },
    description: 'The Knight of Wands represents impulsive action, adventure, and fearless energy.'
  },
  {
    id: 'queen-wands',
    name: 'Queen of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 13,
    frontImage: '/tarot/deck-rider-waite/minor/queen-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Courage, confidence, independence, social butterfly, determination',
      reversed: 'Self-respect, self-confidence, introverted, re-establish sense of self',
      keywords: ['courage', 'confidence', 'independence', 'social butterfly']
    },
    description: 'The Queen of Wands represents confidence, courage, and vibrant social energy.'
  },
  {
    id: 'king-wands',
    name: 'King of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 14,
    frontImage: '/tarot/deck-rider-waite/minor/king-wands.jpg',
    backImage: '/images/tarot/card-back.svg',
    meaning: {
      upright: 'Natural leader, vision, entrepreneur, honour',
      reversed: 'Impulsiveness, haste, ruthless, high expectations',
      keywords: ['natural leader', 'vision', 'entrepreneur', 'honour']
    },
    description: 'The King of Wands represents leadership, vision, and entrepreneurial spirit.'
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