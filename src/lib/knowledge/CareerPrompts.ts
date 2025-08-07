/**
 * CAREER-FOCUSED KNOWLEDGE POOL PROMPTS
 * Specialized prompts for Orion's astrology-based career readings
 */

export interface CareerPrompt {
  id: string;
  category: 'career_path' | 'timing' | 'purpose' | 'challenges' | 'strengths';
  trigger: string; // Astrological condition that triggers this prompt
  prompt: string;
  followUp?: string[];
  keywords: string[];
}

export const CAREER_PROMPTS: CareerPrompt[] = [
  // CAREER PATH PROMPTS
  {
    id: 'mc_aries_leadership',
    category: 'career_path',
    trigger: 'midheaven in Aries',
    prompt: 'With your Aries Midheaven, you are called to pioneer and lead. Your professional reputation thrives when you initiate new projects and take bold action. How do you feel about embracing more leadership responsibilities in your current role?',
    followUp: [
      'What entrepreneurial ideas have been stirring in your mind lately?',
      'Where do you see opportunities to be the first or the innovator in your field?'
    ],
    keywords: ['leadership', 'pioneering', 'initiative', 'innovation']
  },
  {
    id: 'mc_taurus_stability',
    category: 'career_path',
    trigger: 'midheaven in Taurus',
    prompt: 'Your Taurus Midheaven suggests a career built on stability, beauty, and tangible results. You excel in roles that offer security while creating lasting value. Are you feeling fulfilled by the stability and growth potential in your current professional situation?',
    followUp: [
      'What aspects of your work bring you the deepest satisfaction?',
      'How important is financial security versus creative fulfillment in your career choices?'
    ],
    keywords: ['stability', 'beauty', 'tangible results', 'security']
  },
  {
    id: 'mc_gemini_communication',
    category: 'career_path',
    trigger: 'midheaven in Gemini',
    prompt: 'With Gemini on your Midheaven, your career success flows through communication, versatility, and intellectual exchange. You thrive in roles that keep you learning and connecting with diverse people. How are you currently utilizing your natural communication gifts?',
    followUp: [
      'What subjects or topics energize you most when you talk about them?',
      'Are you feeling mentally stimulated by your current work challenges?'
    ],
    keywords: ['communication', 'versatility', 'learning', 'networking']
  },

  // TIMING PROMPTS
  {
    id: 'saturn_return_timing',
    category: 'timing',
    trigger: 'Saturn return active',
    prompt: 'You are experiencing your Saturn return - a cosmic restructuring period that occurs roughly every 29 years. This is prime time for making foundational changes to your career path. What professional structures or commitments are you ready to either strengthen or release?',
    followUp: [
      'What career patterns from the past feel ready to evolve?',
      'Where do you need more discipline or commitment in your professional life?'
    ],
    keywords: ['restructuring', 'commitment', 'foundation', 'maturity']
  },
  {
    id: 'jupiter_expansion',
    category: 'timing',
    trigger: 'Jupiter transit to MC or 10th house',
    prompt: 'Jupiter is expanding your professional horizons right now. This is an excellent time for growth, new opportunities, and taking your career to the next level. What expansion or advancement feels most aligned with your vision?',
    followUp: [
      'What opportunities have recently appeared in your professional sphere?',
      'How are you prepared to step into greater visibility or responsibility?'
    ],
    keywords: ['expansion', 'opportunity', 'growth', 'advancement']
  },

  // PURPOSE PROMPTS
  {
    id: 'sun_10th_purpose',
    category: 'purpose',
    trigger: 'Sun in 10th house',
    prompt: 'With your Sun in the 10th house, your core identity is deeply connected to your professional achievements and public recognition. Your life purpose unfolds through your career. Do you feel your current work truly reflects who you are at your core?',
    followUp: [
      'In what ways does your profession allow you to shine authentically?',
      'What legacy do you want to create through your professional contributions?'
    ],
    keywords: ['identity', 'recognition', 'authenticity', 'legacy']
  },
  {
    id: 'sun_6th_service',
    category: 'purpose',
    trigger: 'Sun in 6th house',
    prompt: 'Your Sun in the 6th house reveals a life purpose centered on service, health, and perfecting your craft. You find meaning through work that helps others and contributes to wellbeing. How does your current role allow you to serve others or improve conditions?',
    followUp: [
      'What aspects of helping others bring you the most fulfillment?',
      'Where do you see opportunities to refine or perfect your professional skills?'
    ],
    keywords: ['service', 'health', 'craft', 'improvement']
  },

  // CHALLENGES PROMPTS
  {
    id: 'saturn_square_mc',
    category: 'challenges',
    trigger: 'Saturn square Midheaven',
    prompt: 'Saturn is creating productive tension with your career direction, asking you to build more solid foundations. You may be feeling restricted or facing obstacles, but these challenges are strengthening your professional resilience. What career foundations need reinforcement right now?',
    followUp: [
      'Where do you need to develop more patience with your professional progress?',
      'What skills or qualifications would make you feel more secure in your field?'
    ],
    keywords: ['foundations', 'obstacles', 'resilience', 'patience']
  },

  // STRENGTHS PROMPTS
  {
    id: 'jupiter_trine_mc',
    category: 'strengths',
    trigger: 'Jupiter trine Midheaven',
    prompt: 'Jupiter is flowing harmoniously with your career energy, amplifying your natural talents and opening doors. Your optimism and wisdom are professional assets right now. How can you leverage your current confidence and opportunities for long-term career benefit?',
    followUp: [
      'What natural talents are you being called to develop further?',
      'How can you share your knowledge or experience to benefit others?'
    ],
    keywords: ['talents', 'optimism', 'wisdom', 'opportunities']
  },
  {
    id: 'mars_10th_drive',
    category: 'strengths',
    trigger: 'Mars in 10th house',
    prompt: 'Mars in your 10th house gives you powerful drive and ambition in your career. You have the energy to overcome obstacles and the courage to take professional risks. How are you channeling this dynamic energy in your current professional pursuits?',
    followUp: [
      'What professional challenges are you most excited to tackle?',
      'Where do you feel called to take bold action in your career?'
    ],
    keywords: ['drive', 'ambition', 'courage', 'action']
  }
];

export class CareerPromptSelector {
  static selectPromptsForChart(
    midheavenSign: string,
    tenthHousePlanets: string[],
    majorTransits: string[],
    sunHouse?: number
  ): CareerPrompt[] {
    const selectedPrompts: CareerPrompt[] = [];

    // Select MC sign prompt
    const mcPrompt = CAREER_PROMPTS.find(p => 
      p.trigger.toLowerCase().includes(`midheaven in ${midheavenSign.toLowerCase()}`)
    );
    if (mcPrompt) selectedPrompts.push(mcPrompt);

    // Select Sun house prompt
    if (sunHouse) {
      const sunPrompt = CAREER_PROMPTS.find(p => 
        p.trigger.includes(`Sun in ${sunHouse}th house`)
      );
      if (sunPrompt) selectedPrompts.push(sunPrompt);
    }

    // Select planet prompts for 10th house
    tenthHousePlanets.forEach(planet => {
      const planetPrompt = CAREER_PROMPTS.find(p => 
        p.trigger.toLowerCase().includes(`${planet.toLowerCase()} in 10th house`)
      );
      if (planetPrompt) selectedPrompts.push(planetPrompt);
    });

    // Select transit prompts
    majorTransits.forEach(transit => {
      const transitPrompt = CAREER_PROMPTS.find(p => 
        p.trigger.toLowerCase().includes(transit.toLowerCase())
      );
      if (transitPrompt) selectedPrompts.push(transitPrompt);
    });

    // Ensure we have at least one prompt from each category if possible
    const categories = ['career_path', 'timing', 'purpose', 'challenges', 'strengths'];
    categories.forEach(category => {
      if (!selectedPrompts.find(p => p.category === category)) {
        const fallbackPrompt = CAREER_PROMPTS.find(p => p.category === category);
        if (fallbackPrompt && !selectedPrompts.includes(fallbackPrompt)) {
          selectedPrompts.push(fallbackPrompt);
        }
      }
    });

    return selectedPrompts.slice(0, 5); // Limit to 5 prompts max
  }

  static getPromptsByCategory(category: CareerPrompt['category']): CareerPrompt[] {
    return CAREER_PROMPTS.filter(p => p.category === category);
  }

  static getPromptById(id: string): CareerPrompt | undefined {
    return CAREER_PROMPTS.find(p => p.id === id);
  }

  static searchPromptsByKeyword(keyword: string): CareerPrompt[] {
    const lowercaseKeyword = keyword.toLowerCase();
    return CAREER_PROMPTS.filter(p => 
      p.keywords.some(k => k.toLowerCase().includes(lowercaseKeyword)) ||
      p.prompt.toLowerCase().includes(lowercaseKeyword)
    );
  }
}