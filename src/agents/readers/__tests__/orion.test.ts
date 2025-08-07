import { OrionReader, ORION_PERSONA } from '../orion';
import { ReadingRequest } from '@/types/ReaderPersona';
import { BirthData } from '@/types/astrology';
import { ReaderSpecialization, SummaryType as SummaryTypeEnum, ReadingRequestType } from '@/constants/EventTypes';
import { Planet, AspectType } from '@/constants/AstrologyConstants';

// Mock the Swiss Ephemeris Calculator
jest.mock('@/lib/astrology/SwissEphemerisShim', () => ({
  SwissEphemerisCalculator: jest.fn().mockImplementation(() => ({
    calculateBirthChart: jest.fn().mockResolvedValue({
      planets: [
        { planet: 'sun', house: 10, sign: 'leo', degree: 15 },
        { planet: 'saturn', house: 6, sign: 'capricorn', degree: 22 },
        { planet: 'jupiter', house: 2, sign: 'sagittarius', degree: 8 }
      ],
      houses: [
        { house: 1, sign: 'scorpio', degree: 0 },
        { house: 2, sign: 'sagittarius', degree: 0 },
        { house: 10, sign: 'leo', degree: 0 }
      ]
    }),
    calculateTransits: jest.fn().mockResolvedValue({
      transits: [
        { planet: 'jupiter', aspect: 'trine', target: 'mc', orb: 2 }
      ]
    }),
  }))
}));

// Mock the Career Interpreter
jest.mock('@/lib/astrology/interpretations/career', () => ({
  CareerInterpreter: {
    analyzeCareerPath: jest.fn().mockReturnValue({
      primaryPath: 'Leadership and creative expression in entertainment or performance',
      strengths: ['Natural leadership abilities', 'Creative expression', 'Public recognition'],
      challenges: ['Need to develop discipline in daily routines'],
      timing: 'Jupiter\'s current influence suggests expansion and new opportunities',
      guidance: 'Focus on aligning your career with your authentic self and creative expression',
      keywords: ['leadership', 'creativity', 'recognition', 'performance'],
      confidence: 0.85
    })
  }
}));

describe('OrionReader', () => {
  let orionReader: OrionReader;
  let mockBirthData: BirthData;
  let mockReadingRequest: ReadingRequest;

  beforeEach(() => {
    orionReader = new OrionReader();
    
    mockBirthData = {
      date: '1990-07-15',
      time: '14:30',
      location: 'New York, NY',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    };

    mockReadingRequest = {
      userId: 'user-123',
      readerId: 'orion',
      type: ReadingRequestType.BIRTH_CHART,
      focus: ['career', 'purpose'],
      birthData: mockBirthData
    };
  });

  describe('Persona Configuration', () => {
    it('should have correct persona configuration', () => {
      const persona = orionReader.getPersona();
      
      expect(persona.id).toBe('orion');
      expect(persona.name).toBe('Orion');
      expect(persona.title).toBe('The Astrology Career Guide');
      expect(persona.specialization).toBe(ReaderSpecialization.ASTROLOGY);
    });

    it('should have mentor tone with tactical honesty', () => {
      const persona = orionReader.getPersona();
      
      expect(persona.tone.primary).toBe('mentor');
      expect(persona.tone.secondary).toBe('honest');
      expect(persona.tone.voice).toBe('calm and insightful');
      expect(persona.tone.communication).toBe('tactically honest with gentle authority');
    });

    it('should have astrology expertise focused on career houses', () => {
      const persona = orionReader.getPersona();
      
      expect(persona.expertise.astrology?.houses).toEqual([2, 6, 10]);
      expect(persona.expertise.astrology?.planets).toContain(Planet.SATURN);
      expect(persona.expertise.astrology?.planets).toContain(Planet.JUPITER);
      expect(persona.expertise.astrology?.specializations).toContain('career');
    });

    it('should have three intro messages', () => {
      expect(ORION_PERSONA.introMessages).toHaveLength(3);
      expect(ORION_PERSONA.introMessages[0]).toContain('stars have aligned');
      expect(ORION_PERSONA.introMessages[1]).toContain('birth chart holds');
      expect(ORION_PERSONA.introMessages[2]).toContain('celestial bodies speak');
    });
  });

  describe('Birth Data Validation', () => {
    it('should validate complete birth data', async () => {
      const isValid = await orionReader.validateBirthData(mockBirthData);
      expect(isValid).toBe(true);
    });

    it('should reject incomplete birth data', async () => {
      const incompleteBirthData = {
        date: '1990-07-15',
        time: '',
        location: 'New York, NY'
      };
      
      const isValid = await orionReader.validateBirthData(incompleteBirthData);
      expect(isValid).toBe(false);
    });
  });

  describe('Reading Generation', () => {
    it('should generate a complete reading response', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);

      expect(response.readerId).toBe('orion');
      expect(response.sessionId).toContain('orion_');
      expect(response.interpretation.primary).toContain('Midheaven');
      expect(response.interpretation.insights).toHaveLength(3);
      expect(response.confidence).toBe(0.85);
    });

    it('should throw error when birth data is missing', async () => {
      const requestWithoutBirthData = {
        ...mockReadingRequest,
        birthData: undefined
      };

      await expect(orionReader.generateReading(requestWithoutBirthData))
        .rejects.toThrow('Birth data required for Orion readings');
    });

    it('should select appropriate intro message based on focus', async () => {
      const timingFocusRequest = {
        ...mockReadingRequest,
        focus: ['timing']
      };

      const response = await orionReader.generateReading(timingFocusRequest);
      expect(response.interpretation.primary).toContain('birth chart holds');
    });

    it('should generate follow-up questions', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);
      
      expect(response.followUpQuestions).toBeDefined();
      expect(response.followUpQuestions!.length).toBeGreaterThan(0);
      expect(response.followUpQuestions![0]).toContain('authentic self');
    });

    it('should provide actionable next steps', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);
      
      expect(response.nextSteps).toBeDefined();
      expect(response.nextSteps!.length).toBeGreaterThan(0);
      expect(response.nextSteps![0]).toContain('Reflect on');
    });
  });

  describe('Career Interpretation Integration', () => {
    it('should include midheaven sign in interpretation', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);
      
      expect(response.interpretation.primary).toContain('Leo Midheaven');
    });

    it('should mention 10th house planets when present', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);
      
      expect(response.interpretation.primary).toContain('sun in your 10th house');
    });

    it('should provide timing guidance', async () => {
      const response = await orionReader.generateReading(mockReadingRequest);
      
      expect(response.interpretation.timing).toContain('Jupiter');
      expect(response.interpretation.guidance).toContain('timing');
    });
  });

  describe('Conversational Styles', () => {
    it('should have conversation styles for different triggers', () => {
      const persona = orionReader.getPersona();
      
      const careerUncertaintyStyle = persona.conversationalStyles
        .find(style => style.trigger === 'career_uncertainty');
      
      expect(careerUncertaintyStyle).toBeDefined();
      expect(careerUncertaintyStyle!.phrases).toContain(
        'The cosmos rarely reveals the entire path at once. Let\'s focus on the next clear step.'
      );
    });

    it('should have timing-specific conversation style', () => {
      const persona = orionReader.getPersona();
      
      const timingStyle = persona.conversationalStyles
        .find(style => style.trigger === 'timing_questions');
      
      expect(timingStyle).toBeDefined();
      expect(timingStyle!.tone).toBe('precise guidance');
    });
  });

  describe('Specialization Keywords', () => {
    it('should return relevant specialization keywords', () => {
      const keywords = orionReader.getSpecializationKeywords();
      
      expect(keywords).toContain('career guidance');
      expect(keywords).toContain('birth chart');
      expect(keywords).toContain('midheaven');
      expect(keywords).toContain('saturn return');
      expect(keywords).toContain('jupiter cycle');
    });
  });

  describe('Summary Types', () => {
    it('should have career-focused summary template', () => {
      const persona = orionReader.getPersona();
      const careerSummary = persona.summaryTypes
        .find(summary => summary.type === SummaryTypeEnum.CAREER);
      
      expect(careerSummary).toBeDefined();
      expect(careerSummary!.template).toContain('{MC_SIGN}');
      expect(careerSummary!.template).toContain('{MAJOR_TRANSIT}');
      expect(careerSummary!.focusAreas).toContain('timing');
    });

    it('should have personal growth summary template', () => {
      const persona = orionReader.getPersona();
      const growthSummary = persona.summaryTypes
        .find(summary => summary.type === SummaryTypeEnum.PERSONAL_GROWTH);
      
      expect(growthSummary).toBeDefined();
      expect(growthSummary!.template).toContain('{SUN_HOUSE}');
      expect(growthSummary!.focusAreas).toContain('purpose');
    });
  });

  describe('Action Steps Generation', () => {
    it('should provide emotional wellness action steps', async () => {
      const request: ReadingRequest = {
        userId: 'user-123',
        readerId: 'luna',
        type: ReadingRequestType.BIRTH_CHART,
        focus: ['emotional_wellness'],
        birthData: mockBirthData
      };

      const response = await orionReader.generateReading(request);
      
      expect(response.nextSteps).toBeDefined();
      expect(response.nextSteps!.length).toBeGreaterThan(0);
      expect(response.nextSteps![0]).toContain('Reflect on');
    });

    it('should provide relationship-specific steps for synastry', async () => {
      const synastryRequest: ReadingRequest = {
        userId: 'user-123',
        readerId: 'luna',
        type: ReadingRequestType.SYNASTRY,
        birthData: mockBirthData,
        partnerBirthData: mockPartnerBirthData
      };

      const response = await orionReader.generateReading(synastryRequest);
      
      expect(response.nextSteps!.some(step => 
        step.includes('love languages') || step.includes('appreciating')
      )).toBe(true);
    });
  });
});