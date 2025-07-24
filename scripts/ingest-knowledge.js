/**
 * Astrology Knowledge Ingestion Script (JavaScript)
 * 
 * Creates structured JSON knowledge pool for astrology interpretations.
 * Per Claude Mandates: Uses ContentIngestor pattern to build knowledge base.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AstrologyKnowledgeIngestor {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'data', 'knowledge');
    this.knowledgePool = {
      metadata: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        totalEntries: 0,
        sources: [],
        categories: ['planets', 'signs', 'houses', 'aspects', 'techniques']
      },
      planets: {},
      signs: {},
      houses: {},
      aspects: {},
      techniques: {}
    };
  }

  /**
   * Main ingestion method
   */
  async ingestAllKnowledge() {
    console.log('🔮 Starting Astrology Knowledge Ingestion...');
    
    try {
      // Create output directory
      await fs.mkdir(this.outputDir, { recursive: true });

      // Ingest core astrological knowledge
      await this.ingestPlanetaryKnowledge();
      await this.ingestZodiacSignKnowledge();
      await this.ingestHouseKnowledge();
      await this.ingestAspectKnowledge();
      await this.ingestTechniqueKnowledge();

      // Update metadata
      this.updateMetadata();

      // Export to JSON files
      await this.exportKnowledgePool();

      console.log('✅ Knowledge ingestion completed successfully');
      this.printSummary();

    } catch (error) {
      console.error('❌ Knowledge ingestion failed:', error);
      throw error;
    }
  }

  /**
   * Ingest planetary knowledge
   */
  async ingestPlanetaryKnowledge() {
    console.log('🪐 Ingesting planetary knowledge...');

    const planetData = {
      sun: {
        name: 'Sun',
        symbol: '☉',
        keywords: ['identity', 'ego', 'vitality', 'consciousness', 'life force', 'father'],
        basicMeaning: 'Core identity, ego, vitality, and conscious will',
        positiveTraits: ['confident', 'generous', 'creative', 'noble', 'warm-hearted'],
        challengingTraits: ['egotistical', 'domineering', 'arrogant', 'prideful', 'dramatic'],
        rulerOf: ['Leo'],
        exaltedIn: 'Aries',
        detrimentIn: 'Aquarius',
        fallIn: 'Libra',
        averageSpeed: '1° per day',
        orbitalPeriod: '1 year',
        mythology: 'Apollo, god of light, music, and prophecy',
        modernInterpretation: 'Core self, individuality, creative expression, leadership',
        retrograde: {
          meaning: 'Not applicable',
          frequency: 'Never retrograde',
          interpretation: 'The Sun never goes retrograde from Earth\'s perspective'
        }
      },
      moon: {
        name: 'Moon',
        symbol: '☽',
        keywords: ['emotions', 'intuition', 'mother', 'home', 'past', 'subconscious'],
        basicMeaning: 'Emotional nature, instincts, and subconscious patterns',
        positiveTraits: ['nurturing', 'intuitive', 'compassionate', 'protective', 'empathetic'],
        challengingTraits: ['moody', 'clingy', 'oversensitive', 'reactive', 'insecure'],
        rulerOf: ['Cancer'],
        exaltedIn: 'Taurus',
        detrimentIn: 'Capricorn',
        fallIn: 'Scorpio',
        averageSpeed: '13° per day',
        orbitalPeriod: '28 days',
        mythology: 'Diana/Artemis, goddess of the hunt and moon',
        modernInterpretation: 'Emotional intelligence, intuition, memory, nurturing instinct',
        retrograde: {
          meaning: 'Not applicable',
          frequency: 'Never retrograde',
          interpretation: 'The Moon never goes retrograde from Earth\'s perspective'
        }
      },
      mercury: {
        name: 'Mercury',
        symbol: '☿',
        keywords: ['communication', 'mind', 'learning', 'travel', 'siblings', 'information'],
        basicMeaning: 'Communication, thinking, and information processing',
        positiveTraits: ['intelligent', 'articulate', 'adaptable', 'curious', 'witty'],
        challengingTraits: ['scattered', 'superficial', 'gossipy', 'restless', 'indecisive'],
        rulerOf: ['Gemini', 'Virgo'],
        exaltedIn: 'Virgo',
        detrimentIn: ['Sagittarius', 'Pisces'],
        fallIn: 'Pisces',
        averageSpeed: '1.5° per day',
        orbitalPeriod: '88 days',
        mythology: 'Hermes, messenger of the gods',
        modernInterpretation: 'Cognitive function, communication style, learning process',
        retrograde: {
          meaning: 'Communication and thinking processes turn inward',
          frequency: '3-4 times per year for 3 weeks',
          interpretation: 'Review, revise, and reconsider communication matters'
        }
      },
      venus: {
        name: 'Venus',
        symbol: '♀',
        keywords: ['love', 'beauty', 'harmony', 'values', 'relationships', 'pleasure'],
        basicMeaning: 'Love, beauty, values, and relationship harmony',
        positiveTraits: ['loving', 'artistic', 'harmonious', 'diplomatic', 'charming'],
        challengingTraits: ['vain', 'lazy', 'indulgent', 'possessive', 'superficial'],
        rulerOf: ['Taurus', 'Libra'],
        exaltedIn: 'Pisces',
        detrimentIn: ['Scorpio', 'Aries'],
        fallIn: 'Virgo',
        averageSpeed: '1.2° per day',
        orbitalPeriod: '225 days',
        mythology: 'Aphrodite, goddess of love and beauty',
        modernInterpretation: 'Aesthetic sense, relationship patterns, personal values',
        retrograde: {
          meaning: 'Relationship and value reassessment period',
          frequency: 'Every 18 months for 6 weeks',
          interpretation: 'Reevaluate relationships and personal values'
        }
      },
      mars: {
        name: 'Mars',
        symbol: '♂',
        keywords: ['action', 'energy', 'courage', 'desire', 'anger', 'passion'],
        basicMeaning: 'Drive, energy, assertion, and desire',
        positiveTraits: ['courageous', 'passionate', 'determined', 'pioneering', 'athletic'],
        challengingTraits: ['aggressive', 'impatient', 'impulsive', 'violent', 'reckless'],
        rulerOf: ['Aries', 'Scorpio'],
        exaltedIn: 'Capricorn',
        detrimentIn: ['Libra', 'Taurus'],
        fallIn: 'Cancer',
        averageSpeed: '0.5° per day',
        orbitalPeriod: '2 years',
        mythology: 'Ares, god of war',
        modernInterpretation: 'Motivation, sexual energy, assertiveness, competitive drive',
        retrograde: {
          meaning: 'Energy and action turn inward, passion redirected',
          frequency: 'Every 2 years for 2-3 months',
          interpretation: 'Reassess goals, redirect energy, avoid major initiatives'
        }
      },
      jupiter: {
        name: 'Jupiter',
        symbol: '♃',
        keywords: ['expansion', 'wisdom', 'optimism', 'growth', 'abundance', 'philosophy'],
        basicMeaning: 'Growth, expansion, wisdom, and good fortune',
        positiveTraits: ['optimistic', 'generous', 'wise', 'philosophical', 'jovial'],
        challengingTraits: ['excessive', 'overconfident', 'wasteful', 'preachy', 'lazy'],
        rulerOf: ['Sagittarius', 'Pisces'],
        exaltedIn: 'Cancer',
        detrimentIn: ['Gemini', 'Virgo'],
        fallIn: 'Capricorn',
        averageSpeed: '0.08° per day',
        orbitalPeriod: '12 years',
        mythology: 'Zeus, king of the gods',
        modernInterpretation: 'Personal growth, higher learning, spiritual expansion',
        retrograde: {
          meaning: 'Internal growth and philosophical reflection',
          frequency: 'Once per year for 4 months',
          interpretation: 'Focus on inner wisdom and spiritual development'
        }
      },
      saturn: {
        name: 'Saturn',
        symbol: '♄',
        keywords: ['discipline', 'responsibility', 'limitation', 'structure', 'karma', 'time'],
        basicMeaning: 'Structure, discipline, responsibility, and life lessons',
        positiveTraits: ['disciplined', 'responsible', 'practical', 'persistent', 'wise'],
        challengingTraits: ['rigid', 'pessimistic', 'cold', 'restrictive', 'fearful'],
        rulerOf: ['Capricorn', 'Aquarius'],
        exaltedIn: 'Libra',
        detrimentIn: ['Cancer', 'Leo'],
        fallIn: 'Aries',
        averageSpeed: '0.03° per day',
        orbitalPeriod: '29 years',
        mythology: 'Kronos, god of time',
        modernInterpretation: 'Life structure, career achievement, personal boundaries',
        retrograde: {
          meaning: 'Internal restructuring and karmic review',
          frequency: 'Once per year for 4.5 months',
          interpretation: 'Reassess commitments, restructure life foundations'
        }
      },
      uranus: {
        name: 'Uranus',
        symbol: '♅',
        keywords: ['innovation', 'rebellion', 'freedom', 'change', 'technology', 'revolution'],
        basicMeaning: 'Innovation, rebellion, sudden change, and freedom',
        positiveTraits: ['innovative', 'independent', 'progressive', 'original', 'humanitarian'],
        challengingTraits: ['rebellious', 'erratic', 'unstable', 'detached', 'revolutionary'],
        rulerOf: ['Aquarius'],
        exaltedIn: 'Scorpio',
        detrimentIn: 'Leo',
        fallIn: 'Taurus',
        averageSpeed: '0.01° per day',
        orbitalPeriod: '84 years',
        mythology: 'Ouranos, primordial sky god',
        modernInterpretation: 'Technological innovation, social progress, personal freedom',
        retrograde: {
          meaning: 'Internal revolution and awakening',
          frequency: 'Once per year for 5 months',
          interpretation: 'Inner transformation, breakthrough insights'
        }
      },
      neptune: {
        name: 'Neptune',
        symbol: '♆',
        keywords: ['spirituality', 'illusion', 'dreams', 'compassion', 'sacrifice', 'transcendence'],
        basicMeaning: 'Spirituality, imagination, dreams, and transcendence',
        positiveTraits: ['spiritual', 'compassionate', 'imaginative', 'artistic', 'empathetic'],
        challengingTraits: ['deceptive', 'confused', 'escapist', 'addictive', 'victim-like'],
        rulerOf: ['Pisces'],
        exaltedIn: 'Leo',
        detrimentIn: 'Virgo',
        fallIn: 'Aquarius',
        averageSpeed: '0.006° per day',
        orbitalPeriod: '165 years',
        mythology: 'Poseidon, god of the sea',
        modernInterpretation: 'Spiritual awakening, artistic inspiration, collective unconscious',
        retrograde: {
          meaning: 'Spiritual introspection and disillusionment',
          frequency: 'Once per year for 5-6 months',
          interpretation: 'Clear illusions, deepen spiritual practice'
        }
      },
      pluto: {
        name: 'Pluto',
        symbol: '♇',
        keywords: ['transformation', 'power', 'death', 'rebirth', 'intensity', 'regeneration'],
        basicMeaning: 'Transformation, power, death and rebirth cycles',
        positiveTraits: ['transformative', 'powerful', 'regenerative', 'profound', 'healing'],
        challengingTraits: ['obsessive', 'destructive', 'manipulative', 'controlling', 'vengeful'],
        rulerOf: ['Scorpio'],
        exaltedIn: 'Aries',
        detrimentIn: 'Taurus',
        fallIn: 'Libra',
        averageSpeed: '0.003° per day',
        orbitalPeriod: '248 years',
        mythology: 'Hades, god of the underworld',
        modernInterpretation: 'Psychological transformation, collective evolution, hidden power',
        retrograde: {
          meaning: 'Deep psychological transformation',
          frequency: 'Once per year for 5-6 months',
          interpretation: 'Confront shadow self, deep healing work'
        }
      }
    };

    this.knowledgePool.planets = planetData;
    console.log(`✓ Ingested ${Object.keys(planetData).length} planetary bodies`);
  }

  /**
   * Ingest zodiac sign knowledge
   */
  async ingestZodiacSignKnowledge() {
    console.log('♈ Ingesting zodiac sign knowledge...');

    const signData = {
      aries: {
        name: 'Aries',
        symbol: '♈',
        element: 'Fire',
        modality: 'Cardinal',
        rulingPlanet: 'Mars',
        keywords: ['initiative', 'courage', 'leadership', 'pioneering', 'action'],
        basicMeaning: 'The pioneer and initiator of the zodiac',
        positiveTraits: ['courageous', 'confident', 'energetic', 'pioneering', 'independent'],
        challengingTraits: ['impatient', 'aggressive', 'selfish', 'impulsive', 'hot-tempered'],
        bodyParts: ['head', 'brain', 'eyes'],
        colors: ['red', 'orange'],
        stones: ['diamond', 'ruby'],
        dates: 'March 21 - April 19',
        degree: '0° - 29°',
        mythology: 'The Ram, associated with the Golden Fleece',
        compatibility: {
          bestMatches: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
          challenges: ['Cancer', 'Capricorn']
        }
      },
      taurus: {
        name: 'Taurus',
        symbol: '♉',
        element: 'Earth',
        modality: 'Fixed',
        rulingPlanet: 'Venus',
        keywords: ['stability', 'sensuality', 'persistence', 'material', 'beauty'],
        basicMeaning: 'The builder and maintainer of material security',
        positiveTraits: ['reliable', 'patient', 'practical', 'devoted', 'stable'],
        challengingTraits: ['stubborn', 'possessive', 'materialistic', 'lazy', 'indulgent'],
        bodyParts: ['neck', 'throat', 'thyroid'],
        colors: ['green', 'pink'],
        stones: ['emerald', 'rose quartz'],
        dates: 'April 20 - May 20',
        degree: '30° - 59°',
        mythology: 'The Bull, Zeus in disguise when he abducted Europa',
        compatibility: {
          bestMatches: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
          challenges: ['Leo', 'Aquarius']
        }
      },
      gemini: {
        name: 'Gemini',
        symbol: '♊',
        element: 'Air',
        modality: 'Mutable',
        rulingPlanet: 'Mercury',
        keywords: ['communication', 'versatility', 'curiosity', 'duality', 'learning'],
        basicMeaning: 'The communicator and information gatherer',
        positiveTraits: ['intelligent', 'adaptable', 'curious', 'witty', 'social'],
        challengingTraits: ['superficial', 'inconsistent', 'nervous', 'scattered', 'gossipy'],
        bodyParts: ['hands', 'arms', 'lungs', 'nervous system'],
        colors: ['yellow', 'silver'],
        stones: ['agate', 'citrine'],
        dates: 'May 21 - June 20',
        degree: '60° - 89°',
        mythology: 'The Twins, Castor and Pollux',
        compatibility: {
          bestMatches: ['Libra', 'Aquarius', 'Aries', 'Leo'],
          challenges: ['Virgo', 'Pisces']
        }
      },
      cancer: {
        name: 'Cancer',
        symbol: '♋',
        element: 'Water',
        modality: 'Cardinal',
        rulingPlanet: 'Moon',
        keywords: ['nurturing', 'emotions', 'home', 'family', 'protection', 'intuition'],
        basicMeaning: 'The nurturer and protector of emotional security',
        positiveTraits: ['nurturing', 'protective', 'intuitive', 'loyal', 'empathetic'],
        challengingTraits: ['moody', 'clingy', 'oversensitive', 'pessimistic', 'manipulative'],
        bodyParts: ['chest', 'breasts', 'stomach'],
        colors: ['white', 'silver', 'sea green'],
        stones: ['moonstone', 'pearl'],
        dates: 'June 21 - July 22',
        degree: '90° - 119°',
        mythology: 'The Crab, sent by Hera to distract Hercules',
        compatibility: {
          bestMatches: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
          challenges: ['Aries', 'Libra']
        }
      },
      leo: {
        name: 'Leo',
        symbol: '♌',
        element: 'Fire',
        modality: 'Fixed',
        rulingPlanet: 'Sun',
        keywords: ['creativity', 'confidence', 'leadership', 'drama', 'generosity', 'pride'],
        basicMeaning: 'The performer and leader seeking recognition',
        positiveTraits: ['confident', 'generous', 'creative', 'warm-hearted', 'entertaining'],
        challengingTraits: ['arrogant', 'stubborn', 'self-centered', 'domineering', 'vain'],
        bodyParts: ['heart', 'spine', 'back'],
        colors: ['gold', 'orange', 'yellow'],
        stones: ['ruby', 'peridot'],
        dates: 'July 23 - August 22',
        degree: '120° - 149°',
        mythology: 'The Lion, the Nemean Lion slain by Hercules',
        compatibility: {
          bestMatches: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
          challenges: ['Taurus', 'Scorpio']
        }
      },
      virgo: {
        name: 'Virgo',
        symbol: '♍',
        element: 'Earth',
        modality: 'Mutable',
        rulingPlanet: 'Mercury',
        keywords: ['service', 'perfection', 'analysis', 'health', 'work', 'detail'],
        basicMeaning: 'The perfectionist and servant focused on improvement',
        positiveTraits: ['analytical', 'helpful', 'practical', 'reliable', 'hardworking'],
        challengingTraits: ['critical', 'perfectionist', 'worrying', 'shy', 'overly cautious'],
        bodyParts: ['digestive system', 'intestines', 'spleen'],
        colors: ['navy blue', 'grey', 'brown'],
        stones: ['sapphire', 'carnelian'],
        dates: 'August 23 - September 22',
        degree: '150° - 179°',
        mythology: 'The Virgin, associated with harvest goddess',
        compatibility: {
          bestMatches: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
          challenges: ['Gemini', 'Sagittarius']
        }
      },
      libra: {
        name: 'Libra',
        symbol: '♎',
        element: 'Air',
        modality: 'Cardinal',
        rulingPlanet: 'Venus',
        keywords: ['balance', 'harmony', 'justice', 'partnership', 'beauty', 'diplomacy'],
        basicMeaning: 'The diplomat seeking balance and harmony',
        positiveTraits: ['diplomatic', 'fair-minded', 'social', 'cooperative', 'gracious'],
        challengingTraits: ['indecisive', 'avoids confrontation', 'carries grudges', 'self-pity'],
        bodyParts: ['kidneys', 'lower back', 'buttocks'],
        colors: ['blue', 'pastel shades'],
        stones: ['opal', 'lapis lazuli'],
        dates: 'September 23 - October 22',
        degree: '180° - 209°',
        mythology: 'The Scales, representing justice and balance',
        compatibility: {
          bestMatches: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
          challenges: ['Cancer', 'Capricorn']
        }
      },
      scorpio: {
        name: 'Scorpio',
        symbol: '♏',
        element: 'Water',
        modality: 'Fixed',
        rulingPlanet: 'Pluto',
        traditionalRuler: 'Mars',
        keywords: ['transformation', 'intensity', 'passion', 'mystery', 'power', 'depth'],
        basicMeaning: 'The transformer and investigator of hidden truths',
        positiveTraits: ['passionate', 'resourceful', 'brave', 'determined', 'magnetic'],
        challengingTraits: ['jealous', 'secretive', 'resentful', 'obsessive', 'suspicious'],
        bodyParts: ['reproductive organs', 'pelvis', 'urinary system'],
        colors: ['deep red', 'black', 'maroon'],
        stones: ['topaz', 'obsidian'],
        dates: 'October 23 - November 21',
        degree: '210° - 239°',
        mythology: 'The Scorpion, sent to kill Orion',
        compatibility: {
          bestMatches: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
          challenges: ['Leo', 'Aquarius']
        }
      },
      sagittarius: {
        name: 'Sagittarius',
        symbol: '♐',
        element: 'Fire',
        modality: 'Mutable',
        rulingPlanet: 'Jupiter',
        keywords: ['adventure', 'philosophy', 'freedom', 'truth', 'optimism', 'expansion'],
        basicMeaning: 'The philosopher and adventurer seeking truth and meaning',
        positiveTraits: ['optimistic', 'freedom-loving', 'jovial', 'good-humored', 'honest'],
        challengingTraits: ['impatient', 'promises more than can deliver', 'very direct', 'careless'],
        bodyParts: ['hips', 'thighs', 'liver'],
        colors: ['purple', 'turquoise'],
        stones: ['turquoise', 'amethyst'],
        dates: 'November 22 - December 21',
        degree: '240° - 269°',
        mythology: 'The Archer, Centaur with bow and arrow',
        compatibility: {
          bestMatches: ['Aries', 'Leo', 'Libra', 'Aquarius'],
          challenges: ['Virgo', 'Pisces']
        }
      },
      capricorn: {
        name: 'Capricorn',
        symbol: '♑',
        element: 'Earth',
        modality: 'Cardinal',
        rulingPlanet: 'Saturn',
        keywords: ['ambition', 'discipline', 'responsibility', 'structure', 'achievement', 'authority'],
        basicMeaning: 'The achiever and builder of lasting structures',
        positiveTraits: ['responsible', 'disciplined', 'self-control', 'good managers', 'practical'],
        challengingTraits: ['know-it-all', 'unforgiving', 'condescending', 'expecting the worst'],
        bodyParts: ['bones', 'joints', 'knees'],
        colors: ['brown', 'black', 'dark green'],
        stones: ['garnet', 'onyx'],
        dates: 'December 22 - January 19',
        degree: '270° - 299°',
        mythology: 'The Sea-Goat, half goat half fish',
        compatibility: {
          bestMatches: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
          challenges: ['Aries', 'Libra']
        }
      },
      aquarius: {
        name: 'Aquarius',
        symbol: '♒',
        element: 'Air',
        modality: 'Fixed',
        rulingPlanet: 'Uranus',
        traditionalRuler: 'Saturn',
        keywords: ['innovation', 'independence', 'humanitarian', 'progressive', 'original', 'detached'],
        basicMeaning: 'The innovator and humanitarian working for collective progress',
        positiveTraits: ['progressive', 'original', 'independent', 'humanitarian', 'inventive'],
        challengingTraits: ['runs from emotional expression', 'temperamental', 'uncompromising', 'aloof'],
        bodyParts: ['circulatory system', 'ankles', 'shins'],
        colors: ['blue', 'silver', 'aqua'],
        stones: ['amethyst', 'garnet'],
        dates: 'January 20 - February 18',
        degree: '300° - 329°',
        mythology: 'The Water Bearer, Ganymede serving the gods',
        compatibility: {
          bestMatches: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
          challenges: ['Taurus', 'Scorpio']
        }
      },
      pisces: {
        name: 'Pisces',
        symbol: '♓',
        element: 'Water',
        modality: 'Mutable',
        rulingPlanet: 'Neptune',
        traditionalRuler: 'Jupiter',
        keywords: ['compassion', 'intuition', 'imagination', 'spirituality', 'sacrifice', 'empathy'],
        basicMeaning: 'The mystic and dreamer connecting to universal consciousness',
        positiveTraits: ['compassionate', 'artistic', 'intuitive', 'gentle', 'wise', 'musical'],
        challengingTraits: ['fearful', 'overly trusting', 'sad', 'desire to escape reality', 'victim'],
        bodyParts: ['feet', 'toes', 'lymphatic system'],
        colors: ['sea green', 'lavender', 'purple'],
        stones: ['aquamarine', 'bloodstone'],
        dates: 'February 19 - March 20',
        degree: '330° - 359°',
        mythology: 'The Fish, Aphrodite and Eros escaping Typhon',
        compatibility: {
          bestMatches: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
          challenges: ['Gemini', 'Sagittarius']
        }
      }
    };

    this.knowledgePool.signs = signData;
    console.log(`✓ Ingested ${Object.keys(signData).length} zodiac signs`);
  }

  /**
   * Ingest house system knowledge
   */
  async ingestHouseKnowledge() {
    console.log('🏠 Ingesting house system knowledge...');

    const houseData = {};
    const houseInfo = [
      {
        name: 'Ascendant/Rising',
        naturalSign: 'Aries',
        naturalRuler: 'Mars',
        keywords: ['identity', 'appearance', 'first impressions', 'personality'],
        basicMeaning: 'Personal identity, appearance, and how others see you',
        lifeAreas: ['self-image', 'physical body', 'first impressions', 'approach to life'],
        angularSuccedentCadent: 'Angular'
      },
      {
        name: 'Values and Resources',
        naturalSign: 'Taurus',
        naturalRuler: 'Venus',
        keywords: ['money', 'possessions', 'values', 'self-worth'],
        basicMeaning: 'Personal resources, values, and material security',
        lifeAreas: ['income', 'possessions', 'self-esteem', 'material values'],
        angularSuccedentCadent: 'Succedent'
      },
      {
        name: 'Communication and Learning',
        naturalSign: 'Gemini',
        naturalRuler: 'Mercury',
        keywords: ['communication', 'siblings', 'short trips', 'learning'],
        basicMeaning: 'Communication, learning, and immediate environment',
        lifeAreas: ['siblings', 'neighbors', 'short journeys', 'early education'],
        angularSuccedentCadent: 'Cadent'
      },
      {
        name: 'Home and Family',
        naturalSign: 'Cancer',
        naturalRuler: 'Moon',
        keywords: ['home', 'family', 'roots', 'emotions', 'foundation'],
        basicMeaning: 'Home, family, emotional foundations, and origins',
        lifeAreas: ['family', 'home', 'real estate', 'emotional security'],
        angularSuccedentCadent: 'Angular'
      },
      {
        name: 'Creativity and Romance',
        naturalSign: 'Leo',
        naturalRuler: 'Sun',
        keywords: ['creativity', 'romance', 'children', 'self-expression', 'pleasure'],
        basicMeaning: 'Creative self-expression, romance, and joy',
        lifeAreas: ['children', 'romance', 'creativity', 'hobbies', 'speculation'],
        angularSuccedentCadent: 'Succedent'
      },
      {
        name: 'Health and Service',
        naturalSign: 'Virgo',
        naturalRuler: 'Mercury',
        keywords: ['health', 'work', 'service', 'routine', 'pets'],
        basicMeaning: 'Health, daily work, service, and routine',
        lifeAreas: ['health', 'daily work', 'service to others', 'pets'],
        angularSuccedentCadent: 'Cadent'
      },
      {
        name: 'Partnerships and Marriage',
        naturalSign: 'Libra',
        naturalRuler: 'Venus',
        keywords: ['marriage', 'partnerships', 'open enemies', 'cooperation'],
        basicMeaning: 'Partnerships, marriage, and one-on-one relationships',
        lifeAreas: ['marriage', 'business partnerships', 'open enemies', 'legal matters'],
        angularSuccedentCadent: 'Angular'
      },
      {
        name: 'Transformation and Shared Resources',
        naturalSign: 'Scorpio',
        naturalRuler: 'Pluto',
        keywords: ['transformation', 'shared resources', 'death', 'rebirth', 'taxes'],
        basicMeaning: 'Transformation, shared resources, and deep change',
        lifeAreas: ['taxes', 'insurance', 'inheritance', 'joint finances', 'transformation'],
        angularSuccedentCadent: 'Succedent'
      },
      {
        name: 'Philosophy and Higher Learning',
        naturalSign: 'Sagittarius',
        naturalRuler: 'Jupiter',
        keywords: ['philosophy', 'higher education', 'long journeys', 'spirituality'],
        basicMeaning: 'Higher learning, philosophy, and spiritual expansion',
        lifeAreas: ['higher education', 'philosophy', 'long journeys', 'publishing'],
        angularSuccedentCadent: 'Cadent'
      },
      {
        name: 'Career and Public Image',
        naturalSign: 'Capricorn',
        naturalRuler: 'Saturn',
        keywords: ['career', 'reputation', 'authority', 'public image', 'achievement'],
        basicMeaning: 'Career, reputation, and public standing',
        lifeAreas: ['career', 'reputation', 'authority figures', 'public image'],
        angularSuccedentCadent: 'Angular'
      },
      {
        name: 'Friendships and Aspirations',
        naturalSign: 'Aquarius',
        naturalRuler: 'Uranus',
        keywords: ['friends', 'groups', 'hopes', 'wishes', 'humanitarian causes'],
        basicMeaning: 'Friendships, groups, hopes, and aspirations',
        lifeAreas: ['friends', 'groups', 'hopes and wishes', 'humanitarian causes'],
        angularSuccedentCadent: 'Succedent'
      },
      {
        name: 'Spirituality and Subconscious',
        naturalSign: 'Pisces',
        naturalRuler: 'Neptune',
        keywords: ['spirituality', 'subconscious', 'hidden enemies', 'sacrifice', 'karma'],
        basicMeaning: 'Spirituality, subconscious, and hidden matters',
        lifeAreas: ['spirituality', 'subconscious mind', 'hidden enemies', 'institutions'],
        angularSuccedentCadent: 'Cadent'
      }
    ];

    for (let i = 0; i < 12; i++) {
      const houseNum = i + 1;
      const info = houseInfo[i];
      houseData[`house_${houseNum}`] = {
        number: houseNum,
        name: info.name,
        naturalSign: info.naturalSign,
        naturalRuler: info.naturalRuler,
        keywords: info.keywords,
        basicMeaning: info.basicMeaning,
        lifeAreas: info.lifeAreas,
        angularSuccedentCadent: info.angularSuccedentCadent,
        sources: ['Traditional House System', 'Modern Psychological Astrology']
      };
    }

    this.knowledgePool.houses = houseData;
    console.log('✓ Ingested 12 astrological houses');
  }

  /**
   * Ingest aspect knowledge
   */
  async ingestAspectKnowledge() {
    console.log('🔗 Ingesting aspect knowledge...');

    const aspectData = {
      conjunction: {
        name: 'Conjunction',
        degrees: 0,
        orb: 8,
        nature: 'Neutral',
        keywords: ['unity', 'intensity', 'fusion', 'focus'],
        basicMeaning: 'Planetary energies blend and intensify',
        interpretation: 'Powerful combination of planetary forces, can be harmonious or challenging depending on planets involved',
        inNatalChart: 'Represents core personality themes and intense focus areas',
        inTransits: 'New beginnings and intensified energy in life areas',
        inSynastry: 'Strong attraction and connection between people'
      },
      sextile: {
        name: 'Sextile',
        degrees: 60,
        orb: 6,
        nature: 'Harmonious',
        keywords: ['opportunity', 'harmony', 'cooperation', 'talent'],
        basicMeaning: 'Harmonious energy that requires effort to activate',
        interpretation: 'Opportunities for growth and positive expression with conscious effort',
        inNatalChart: 'Natural talents that can be developed with effort',
        inTransits: 'Opportunities for positive change and growth',
        inSynastry: 'Easy cooperation and mutual support'
      },
      square: {
        name: 'Square',
        degrees: 90,
        orb: 8,
        nature: 'Challenging',
        keywords: ['tension', 'conflict', 'growth', 'motivation'],
        basicMeaning: 'Dynamic tension that motivates action and growth',
        interpretation: 'Challenges that lead to strength and character development',
        inNatalChart: 'Internal tensions that drive personal growth',
        inTransits: 'Challenges and obstacles that promote development',
        inSynastry: 'Tension that can be stimulating or problematic'
      },
      trine: {
        name: 'Trine',
        degrees: 120,
        orb: 8,
        nature: 'Harmonious',
        keywords: ['harmony', 'flow', 'ease', 'talent'],
        basicMeaning: 'Harmonious and flowing energy exchange',
        interpretation: 'Natural talents and easy energy flow between planets',
        inNatalChart: 'Natural gifts and areas of ease in life',
        inTransits: 'Periods of harmony and positive flow',
        inSynastry: 'Natural harmony and understanding between people'
      },
      opposition: {
        name: 'Opposition',
        degrees: 180,
        orb: 8,
        nature: 'Challenging',
        keywords: ['polarity', 'balance', 'awareness', 'projection'],
        basicMeaning: 'Polarity that seeks balance and integration',
        interpretation: 'Opposite energies that need to be balanced and integrated',
        inNatalChart: 'Areas where balance and integration are needed',
        inTransits: 'Culmination points and awareness of opposing forces',
        inSynastry: 'Attraction of opposites, can be balancing or polarizing'
      }
    };

    this.knowledgePool.aspects = aspectData;
    console.log(`✓ Ingested ${Object.keys(aspectData).length} major aspects`);
  }

  /**
   * Ingest technique knowledge
   */
  async ingestTechniqueKnowledge() {
    console.log('🔮 Ingesting technique knowledge...');

    const techniqueData = {
      natal_chart_reading: {
        name: 'Natal Chart Reading',
        category: 'Traditional',
        description: 'Interpretation of birth chart planetary positions and aspects',
        howToUse: 'Analyze planetary positions, signs, houses, and aspects to understand personality and life themes',
        accuracy: 'High for personality traits, moderate for specific events',
        difficulty: 'Intermediate',
        timeRequired: '1-2 hours',
        applications: ['personality analysis', 'life path guidance', 'talent identification'],
        limitations: ['requires accurate birth time', 'interpretive skill needed']
      },
      transit_analysis: {
        name: 'Transit Analysis',
        category: 'Predictive',
        description: 'Analysis of current planetary movements and their effects on natal chart',
        howToUse: 'Compare current planetary positions to natal chart positions',
        accuracy: 'Moderate to high for timing general themes',
        difficulty: 'Intermediate',
        timeRequired: '30-60 minutes',
        applications: ['timing guidance', 'understanding current influences', 'planning decisions'],
        limitations: ['general themes rather than specific events', 'requires natal chart']
      },
      synastry_comparison: {
        name: 'Synastry Comparison',
        category: 'Modern',
        description: 'Comparison of two birth charts to assess relationship compatibility',
        howToUse: 'Compare planetary positions and aspects between two charts',
        accuracy: 'Moderate for relationship dynamics',
        difficulty: 'Advanced',
        timeRequired: '2-3 hours',
        applications: ['relationship compatibility', 'understanding dynamics', 'working through challenges'],
        limitations: ['both birth times needed', 'complex interpretation']
      },
      solar_return: {
        name: 'Solar Return Charts',
        category: 'Predictive',
        description: 'Annual chart cast for the moment the Sun returns to its natal position',
        howToUse: 'Cast chart for Sun return each year, interpret themes for the coming year',
        accuracy: 'Moderate for annual themes',
        difficulty: 'Advanced',
        timeRequired: '1-2 hours',
        applications: ['annual planning', 'understanding yearly themes', 'birthday guidance'],
        limitations: ['one-year timeframe', 'general themes only']
      },
      horary_astrology: {
        name: 'Horary Astrology',
        category: 'Traditional',
        description: 'Answering specific questions by casting a chart for the moment the question is asked',
        howToUse: 'Cast chart for moment of question, apply specific horary rules for interpretation',
        accuracy: 'High for well-formed questions',
        difficulty: 'Advanced',
        timeRequired: '1-2 hours',
        applications: ['answering specific questions', 'finding lost objects', 'decision making'],
        limitations: ['requires specific question format', 'complex rules']
      }
    };

    this.knowledgePool.techniques = techniqueData;
    console.log(`✓ Ingested ${Object.keys(techniqueData).length} astrological techniques`);
  }

  /**
   * Export knowledge pool to JSON files
   */
  async exportKnowledgePool() {
    console.log('📝 Exporting knowledge pool to JSON files...');

    // Export main knowledge pool
    await fs.writeFile(
      path.join(this.outputDir, 'astrology-knowledge-pool.json'),
      JSON.stringify(this.knowledgePool, null, 2),
      'utf8'
    );

    // Export individual category files
    for (const [category, data] of Object.entries(this.knowledgePool)) {
      if (category !== 'metadata') {
        await fs.writeFile(
          path.join(this.outputDir, `${category}.json`),
          JSON.stringify(data, null, 2),
          'utf8'
        );
      }
    }

    console.log('✓ Knowledge pool exported successfully');
  }

  /**
   * Update metadata with current statistics
   */
  updateMetadata() {
    this.knowledgePool.metadata.totalEntries = 
      Object.keys(this.knowledgePool.planets).length +
      Object.keys(this.knowledgePool.signs).length +
      Object.keys(this.knowledgePool.houses).length +
      Object.keys(this.knowledgePool.aspects).length +
      Object.keys(this.knowledgePool.techniques).length;

    this.knowledgePool.metadata.sources = [
      'Traditional Astrology',
      'Modern Synthesis',
      'Cultural Mythology',
      'Astronomical Data',
      'Psychological Astrology'
    ];
  }

  /**
   * Print ingestion summary
   */
  printSummary() {
    console.log('\\n📊 Knowledge Ingestion Summary:');
    console.log('================================');
    console.log(`📅 Generated: ${this.knowledgePool.metadata.generated}`);
    console.log(`📈 Total Entries: ${this.knowledgePool.metadata.totalEntries}`);
    console.log(`🪐 Planets: ${Object.keys(this.knowledgePool.planets).length}`);
    console.log(`♈ Signs: ${Object.keys(this.knowledgePool.signs).length}`);
    console.log(`🏠 Houses: ${Object.keys(this.knowledgePool.houses).length}`);
    console.log(`🔗 Aspects: ${Object.keys(this.knowledgePool.aspects).length}`);
    console.log(`🔮 Techniques: ${Object.keys(this.knowledgePool.techniques).length}`);
    console.log(`📚 Sources: ${this.knowledgePool.metadata.sources.length}`);
    console.log(`📁 Output: ${this.outputDir}`);
    console.log('================================\\n');
  }
}

// Main execution
const ingestor = new AstrologyKnowledgeIngestor();

ingestor.ingestAllKnowledge()
  .then(() => {
    console.log('🎉 Knowledge ingestion completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Knowledge ingestion failed:', error);
    process.exit(1);
  });