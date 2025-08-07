/**
 * LOVE-FOCUSED KNOWLEDGE POOL PROMPTS
 * Specialized prompts for Luna's emotional wellness and relationship readings
 */
/* eslint-disable @typescript-eslint/no-unused-vars */

export interface LovePrompt {
  id: string;
  category: 'love_style' | 'emotional_needs' | 'compatibility' | 'shadow_work' | 'healing';
  trigger: string; // Astrological condition that triggers this prompt
  prompt: string;
  followUp?: string[];
  keywords: string[];
  tone: 'gentle' | 'nurturing' | 'curious' | 'healing' | 'empowering';
}

export const LOVE_PROMPTS: LovePrompt[] = [
  // LOVE STYLE PROMPTS
  {
    id: 'venus_aries_boldness',
    category: 'love_style',
    trigger: 'Venus in Aries',
    prompt: 'Your Aries Venus loves with fire and courage, dear one. You are drawn to the thrill of new connection and the excitement of pursuit. How does this bold energy feel in your heart right now? Are you honoring your need for passionate, direct love?',
    followUp: [
      'What ignites the flame of attraction for you most powerfully?',
      'How do you balance your independent spirit with intimate partnership?'
    ],
    keywords: ['boldness', 'passion', 'independence', 'direct love'],
    tone: 'empowering'
  },
  {
    id: 'venus_taurus_devotion',
    category: 'love_style',
    trigger: 'Venus in Taurus',
    prompt: 'Your Taurus Venus seeks love that feels like coming home - steady, sensual, and deeply rooted. You treasure loyalty and the slow, sweet unfolding of affection. What does emotional security look like in your heart\'s vision? How do you nurture the garden of love?',
    followUp: [
      'What sensual expressions of love speak most deeply to your soul?',
      'How do you create safety for both yourself and your beloved?'
    ],
    keywords: ['security', 'sensuality', 'loyalty', 'steady love'],
    tone: 'nurturing'
  },
  {
    id: 'venus_gemini_connection',
    category: 'love_style',
    trigger: 'Venus in Gemini',
    prompt: 'Your Gemini Venus delights in the dance of minds and the music of conversation. You fall in love with wit, curiosity, and the endless variety that connection can offer. How does your heart seek mental stimulation in relationships? What conversations make your soul sparkle?',
    followUp: [
      'What topics or ideas create the deepest intimacy for you?',
      'How do you balance your need for variety with commitment?'
    ],
    keywords: ['mental connection', 'variety', 'communication', 'curiosity'],
    tone: 'curious'
  },

  // EMOTIONAL NEEDS PROMPTS
  {
    id: 'moon_cancer_nurturing',
    category: 'emotional_needs',
    trigger: 'Moon in Cancer',
    prompt: 'Your Cancer Moon holds an ocean of feeling, sweet soul. You need love that feels like the safest harbor - protective, nurturing, and unconditionally accepting. How do you honor your deep sensitivity as a gift rather than a burden? What would make your heart feel most held?',
    followUp: [
      'What childhood dreams of love still live in your heart?',
      'How do you create the emotional safety you long for?'
    ],
    keywords: ['nurturing', 'safety', 'emotional depth', 'protection'],
    tone: 'gentle'
  },
  {
    id: 'moon_leo_appreciation',
    category: 'emotional_needs',
    trigger: 'Moon in Leo',
    prompt: 'Your Leo Moon needs love that sees and celebrates the magnificent light within you. You flourish when appreciated, admired, and encouraged to shine your brightest. How do you ask for the recognition your heart craves? What makes you feel most radiant in love?',
    followUp: [
      'In what ways do you most love to be celebrated by your beloved?',
      'How do you balance receiving admiration with giving it generously?'
    ],
    keywords: ['appreciation', 'celebration', 'radiance', 'recognition'],
    tone: 'empowering'
  },
  {
    id: 'moon_scorpio_intensity',
    category: 'emotional_needs',
    trigger: 'Moon in Scorpio',
    prompt: 'Your Scorpio Moon seeks love that dares to dive into the depths, beloved. Surface connections cannot satisfy your soul - you need intimacy that transforms, passion that heals, and trust that goes bone-deep. How do you honor your need for profound emotional connection?',
    followUp: [
      'What does true emotional intimacy look like for your heart?',
      'How do you navigate the intensity of your feelings in relationships?'
    ],
    keywords: ['intensity', 'transformation', 'deep intimacy', 'trust'],
    tone: 'healing'
  },

  // COMPATIBILITY PROMPTS
  {
    id: 'fire_water_balance',
    category: 'compatibility',
    trigger: 'Fire Venus with Water Moon or vice versa',
    prompt: 'Your heart holds both fire and water, creating beautiful steam when balanced, or conflict when overwhelmed. The passion of fire can warm water\'s depths, while water can cool fire\'s intensity. How do you honor both the flame of desire and the ocean of feeling within you?',
    followUp: [
      'When do you feel most balanced between passion and tenderness?',
      'What helps you integrate these different emotional languages?'
    ],
    keywords: ['balance', 'fire and water', 'integration', 'emotional complexity'],
    tone: 'healing'
  },
  {
    id: 'earth_air_grounding',
    category: 'compatibility',
    trigger: 'Earth Venus with Air Moon or vice versa',
    prompt: 'You blend the wisdom of earth with the freedom of air - practicality dances with ideas, stability reaches toward inspiration. This combination offers both grounding and flight. How do you weave together your need for security with your love of mental exploration?',
    followUp: [
      'What grounds you when your thoughts take flight in love?',
      'How do you share both practical care and intellectual connection?'
    ],
    keywords: ['grounding', 'mental freedom', 'practical love', 'stability'],
    tone: 'nurturing'
  },

  // SHADOW WORK PROMPTS
  {
    id: 'venus_saturn_fear',
    category: 'shadow_work',
    trigger: 'Venus square or opposition Saturn',
    prompt: 'Your heart has learned to build walls where it once dreamed of bridges. Saturn\'s lessons in love can feel heavy, but they also teach the most enduring truths about worthy affection. What fears about love are ready to be witnessed with compassion rather than judgment?',
    followUp: [
      'What stories about love did you learn that no longer serve you?',
      'How might your past disappointments be protecting a tender truth?'
    ],
    keywords: ['fear', 'protection', 'walls', 'worthiness'],
    tone: 'healing'
  },
  {
    id: 'venus_pluto_intensity',
    category: 'shadow_work',
    trigger: 'Venus conjunct, square, or opposition Pluto',
    prompt: 'Your heart knows love as transformation, not just comfort. You are drawn to connections that change you, that reveal hidden depths, that ask you to surrender and be reborn. How do you embrace this intensity while maintaining your center? What does healthy intensity look like?',
    followUp: [
      'Where do you feel the line between healthy intensity and obsession?',
      'What aspects of yourself emerge only in deep relationship?'
    ],
    keywords: ['transformation', 'intensity', 'depth', 'surrender'],
    tone: 'healing'
  },
  {
    id: 'moon_chiron_wounded_healer',
    category: 'shadow_work',
    trigger: 'Moon conjunct, square, or opposition Chiron',
    prompt: 'Your emotional wounds carry the seeds of your greatest compassion. Where your heart has been broken open, light can enter - both for your own healing and for offering sanctuary to others. How are you learning to tend your tender places with the same love you give others?',
    followUp: [
      'What emotional wound is becoming your source of wisdom?',
      'How do you practice gentleness with your own healing process?'
    ],
    keywords: ['wounded healer', 'compassion', 'tender places', 'healing'],
    tone: 'gentle'
  },

  // HEALING PROMPTS
  {
    id: 'new_moon_intentions',
    category: 'healing',
    trigger: 'New Moon in Venus-ruled signs (Taurus/Libra)',
    prompt: 'The new moon whispers of fresh beginnings in your heart\'s garden. This is sacred time for planting seeds of love - both for yourself and in your relationships. What intentions want to grow in the fertile darkness of this lunar embrace? What love are you calling forth?',
    followUp: [
      'What patterns in love are you ready to release?',
      'What new ways of loving want to emerge through you?'
    ],
    keywords: ['new beginnings', 'intentions', 'planting seeds', 'growth'],
    tone: 'empowering'
  },
  {
    id: 'full_moon_release',
    category: 'healing',
    trigger: 'Full Moon in emotional signs (Cancer/Scorpio/Pisces)',
    prompt: 'The full moon illuminates what is ready to be released from your heart\'s chambers. Old griefs, outdated fears, patterns that no longer serve your highest love - all can be offered to this silver light for transformation. What are you ready to let go of with gratitude?',
    followUp: [
      'What emotional pattern feels complete and ready for release?',
      'How can you honor what you\'re releasing while welcoming what\'s emerging?'
    ],
    keywords: ['release', 'illumination', 'letting go', 'transformation'],
    tone: 'healing'
  },
  {
    id: 'venus_return_renewal',
    category: 'healing',
    trigger: 'Venus return (every 8 months)',
    prompt: 'Venus returns to kiss the same degree where she danced at your birth, bringing gifts of renewal in love and beauty. This is your personal love new year, sweet one. What has your heart learned since her last visit? What new chapters in love are ready to unfold?',
    followUp: [
      'How has your understanding of love evolved recently?',
      'What aspects of beauty and pleasure want more space in your life?'
    ],
    keywords: ['renewal', 'love cycles', 'evolution', 'beauty'],
    tone: 'empowering'
  }
];

export class LovePromptSelector {
  static selectPromptsForChart(
    venusSign: string,
    venusHouse: number,
    moonSign: string,
    moonHouse: number,
    majorAspects: string[],
    currentTransits: string[] = []
  ): LovePrompt[] {
    const selectedPrompts: LovePrompt[] = [];

    // Select Venus sign prompt
    const venusPrompt = LOVE_PROMPTS.find(p => 
      p.trigger.toLowerCase().includes(`venus in ${venusSign.toLowerCase()}`)
    );
    if (venusPrompt) selectedPrompts.push(venusPrompt);

    // Select Moon sign prompt
    const moonPrompt = LOVE_PROMPTS.find(p => 
      p.trigger.toLowerCase().includes(`moon in ${moonSign.toLowerCase()}`)
    );
    if (moonPrompt) selectedPrompts.push(moonPrompt);

    // Select aspect prompts
    majorAspects.forEach(aspect => {
      const aspectPrompt = LOVE_PROMPTS.find(p => 
        p.trigger.toLowerCase().includes(aspect.toLowerCase())
      );
      if (aspectPrompt && !selectedPrompts.includes(aspectPrompt)) {
        selectedPrompts.push(aspectPrompt);
      }
    });

    // Select transit prompts
    currentTransits.forEach(transit => {
      const transitPrompt = LOVE_PROMPTS.find(p => 
        p.trigger.toLowerCase().includes(transit.toLowerCase())
      );
      if (transitPrompt && !selectedPrompts.includes(transitPrompt)) {
        selectedPrompts.push(transitPrompt);
      }
    });

    // Ensure diverse categories
    const categories = ['love_style', 'emotional_needs', 'shadow_work', 'healing'];
    categories.forEach(category => {
      if (!selectedPrompts.find(p => p.category === category)) {
        const categoryPrompts = LOVE_PROMPTS.filter(p => p.category === category);
        if (categoryPrompts.length > 0) {
          const randomPrompt = categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
          selectedPrompts.push(randomPrompt);
        }
      }
    });

    return selectedPrompts.slice(0, 5); // Limit to 5 prompts max
  }

  static selectCompatibilityPrompts(
    person1Venus: string,
    person1Moon: string,
    person2Venus: string,
    person2Moon: string,
    synastryAspects: string[]
  ): LovePrompt[] {
    const prompts: LovePrompt[] = [];

    // Element compatibility prompts
    const person1VenusElement = this.getElementForSign(person1Venus);
    const person2VenusElement = this.getElementForSign(person2Venus);
    const person1MoonElement = this.getElementForSign(person1Moon);
    
    // Fire + Water combination
    if ((person1VenusElement === 'fire' && person1MoonElement === 'water') ||
        (person1VenusElement === 'water' && person1MoonElement === 'fire')) {
      const fireWaterPrompt = LOVE_PROMPTS.find(p => p.id === 'fire_water_balance');
      if (fireWaterPrompt) prompts.push(fireWaterPrompt);
    }

    // Earth + Air combination
    if ((person1VenusElement === 'earth' && person1MoonElement === 'air') ||
        (person1VenusElement === 'air' && person1MoonElement === 'earth')) {
      const earthAirPrompt = LOVE_PROMPTS.find(p => p.id === 'earth_air_grounding');
      if (earthAirPrompt) prompts.push(earthAirPrompt);
    }

    return prompts.slice(0, 3);
  }

  static getPromptsByCategory(category: LovePrompt['category']): LovePrompt[] {
    return LOVE_PROMPTS.filter(p => p.category === category);
  }

  static getPromptsByTone(tone: LovePrompt['tone']): LovePrompt[] {
    return LOVE_PROMPTS.filter(p => p.tone === tone);
  }

  static searchPromptsByKeyword(keyword: string): LovePrompt[] {
    const lowercaseKeyword = keyword.toLowerCase();
    return LOVE_PROMPTS.filter(p => 
      p.keywords.some(k => k.toLowerCase().includes(lowercaseKeyword)) ||
      p.prompt.toLowerCase().includes(lowercaseKeyword)
    );
  }

  private static getElementForSign(sign: string): 'fire' | 'earth' | 'air' | 'water' {
    const elements = {
      aries: 'fire', leo: 'fire', sagittarius: 'fire',
      taurus: 'earth', virgo: 'earth', capricorn: 'earth',
      gemini: 'air', libra: 'air', aquarius: 'air',
      cancer: 'water', scorpio: 'water', pisces: 'water'
    } as const;

    return elements[sign.toLowerCase() as keyof typeof elements] || 'fire';
  }
}