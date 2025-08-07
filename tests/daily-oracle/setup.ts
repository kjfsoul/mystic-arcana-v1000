import "@testing-library/jest-dom";

// Mock environment variables
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY = "test_key";
process.env.ANTHROPIC_API_KEY = "test_anthropic_key";
process.env.OPENAI_API_KEY = "test_openai_key";

// Global test configuration
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset fetch mock
  global.fetch = jest.fn();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Date.now for consistent testing
const mockDate = new Date("2025-07-26T12:00:00Z");
jest.spyOn(global, "Date").mockImplementation(() => mockDate);

// Mock Math.random for consistent testing
Math.random = jest.fn(() => 0.5);

// Global test utilities
global.testUtils = {
  createMockBirthData: () => ({
    name: "Test User",
    date: new Date("1990-07-26T14:30:00Z"),
    city: "Test City",
    country: "Test Country",
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: "America/Los_Angeles",
  }),

  createMockTarotCard: (name = "Test Card", orientation = "upright") => ({
    name,
    orientation,
    meaning: `Test meaning for ${name}`,
    interpretation: `Test interpretation for ${name}`,
    archetypal_energy: `Test energy for ${name}`,
  }),

  createMockHoroscope: (sign = "leo") => ({
    db_identifier: `DB_ENTRY_072625_horoscope_${sign}`,
    sign,
    daily: `Test daily horoscope for ${sign}`,
    love: `Test love horoscope for ${sign}`,
    career: `Test career horoscope for ${sign}`,
    mood: `Test mood for ${sign}`,
    self_growth: `Test growth for ${sign}`,
  }),

  createMockCompatibility: (
    sign1 = "leo",
    sign2 = "sagittarius",
    type = "positive",
  ) => ({
    db_identifier: `DB_ENTRY_072625_compatibility_${sign1}_${sign2}`,
    signs: [sign1, sign2],
    type,
    description: `Test ${type} compatibility between ${sign1} and ${sign2}`,
    compatibility_score: type === "positive" ? 85 : 45,
  }),

  createMockCosmicFocus: () => ({
    db_identifier: "DB_ENTRY_072625_cosmic_focus",
    title: "Test Cosmic Alignment",
    description: "Test cosmic description",
    scientific_meaning: "Test scientific meaning",
    mythic_significance: "Test mythic significance",
    practical_application: "Test practical application",
  }),
};

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockBirthData: () => any;
        createMockTarotCard: (name?: string, orientation?: string) => any;
        createMockHoroscope: (sign?: string) => any;
        createMockCompatibility: (
          sign1?: string,
          sign2?: string,
          type?: string,
        ) => any;
        createMockCosmicFocus: () => any;
      };
    }
  }
}
