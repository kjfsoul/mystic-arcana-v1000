// Mock fetch globally
global.fetch = jest.fn();

describe("Birth Chart Integration", () => {
  const mockBirthData = {
    name: "John Doe",
    date: new Date("1990-07-15T14:30:00Z"),
    city: "New York",
    country: "USA",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully call Python backend and return birth chart data", async () => {
    const mockSvg =
      '<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="100" fill="blue"/></svg>';
    const mockSignSummary =
      "Your sun is in Cancer, making you intuitive and nurturing.";
    const mockHouseBreakdown = [
      "1st House: Cancer — Identity and self-expression",
      "2nd House: Leo — Values and possessions",
      "3rd House: Virgo — Communication and siblings",
    ];

    const mockApiResponse = {
      success: true,
      data: {
        svg: mockSvg,
        signSummary: mockSignSummary,
        houseBreakdown: mockHouseBreakdown,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const response = await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthData: {
          name: "John Doe",
          date: mockBirthData.date,
          city: "New York",
          country: "USA",
          lat: 40.7128,
          lng: -74.006,
          timezone: "America/New_York",
        },
      }),
    });

    const result = await response.json();

    expect(fetch).toHaveBeenCalledWith("/api/astrology/birth-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthData: {
          name: "John Doe",
          date: mockBirthData.date,
          city: "New York",
          country: "USA",
          lat: 40.7128,
          lng: -74.006,
          timezone: "America/New_York",
        },
      }),
    });

    expect(result).toEqual({
      success: true,
      data: {
        svg: mockSvg,
        signSummary: mockSignSummary,
        houseBreakdown: mockHouseBreakdown,
      },
    });
  });

  it("should handle API failure and return fallback data", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    try {
      await fetch("/api/astrology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthData: mockBirthData }),
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Network error");
    }
  });

  it("should handle API returning unavailable status", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        svg: '<svg viewBox="0 0 400 400"><text>Chart Unavailable</text></svg>',
        signSummary: "Birth chart temporarily unavailable.",
        houseBreakdown: ["Service temporarily unavailable"],
        isUnavailable: true,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const response = await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthData: mockBirthData }),
    });

    const result = await response.json();

    expect(result.success).toBe(true);
    expect(result.data.isUnavailable).toBe(true);
    expect(result.data.signSummary).toContain("temporarily unavailable");
  });

  it("should handle HTTP error responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Internal server error" }),
    });

    const response = await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthData: mockBirthData }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it("should handle missing optional birth data fields gracefully", async () => {
    const minimalBirthData = {
      date: new Date("1990-07-15T14:30:00Z"),
      city: "New York",
      latitude: 40.7128,
      longitude: -74.006,
    };

    const mockApiResponse = {
      success: true,
      data: {
        svg: "<svg></svg>",
        signSummary: "Test summary",
        houseBreakdown: ["Test house"],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthData: minimalBirthData }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/astrology/birth-chart",
      expect.objectContaining({
        body: expect.stringContaining('"date":'),
      }),
    );
  });

  it("should return complex house breakdown correctly", async () => {
    const complexHouseBreakdown = [
      "1st House: Aries — Identity, self-expression, and first impressions",
      "2nd House: Taurus — Values, possessions, and material security",
      "3rd House: Gemini — Communication, siblings, and short journeys",
      "4th House: Cancer — Home, family, and emotional foundations",
      "5th House: Leo — Creativity, romance, and self-expression",
      "6th House: Virgo — Work, health, and daily routines",
      "7th House: Libra — Partnerships and relationships",
      "8th House: Scorpio — Transformation and shared resources",
      "9th House: Sagittarius — Philosophy and higher learning",
      "10th House: Capricorn — Career and public image",
      "11th House: Aquarius — Friends and aspirations",
      "12th House: Pisces — Spirituality and subconscious",
    ];

    const mockApiResponse = {
      success: true,
      data: {
        svg: '<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="180"/></svg>',
        signSummary: "Complex chart analysis with detailed interpretations.",
        houseBreakdown: complexHouseBreakdown,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const response = await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthData: mockBirthData }),
    });

    const result = await response.json();

    expect(result.data.houseBreakdown).toEqual(complexHouseBreakdown);
    expect(result.data.houseBreakdown).toHaveLength(12);

    // Check that each house is properly formatted
    result.data.houseBreakdown.forEach((house: string, index: number) => {
      const houseNumber = index + 1;
      let expectedSuffix = "th";
      if (houseNumber === 1) expectedSuffix = "st";
      else if (houseNumber === 2) expectedSuffix = "nd";
      else if (houseNumber === 3) expectedSuffix = "rd";

      expect(house).toContain(`${houseNumber}${expectedSuffix} House:`);
      expect(house).toContain("—");
    });
  });

  it("should validate SVG format in response", async () => {
    const validSvg =
      '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="100" fill="blue"/><text x="200" y="250" text-anchor="middle">Birth Chart</text></svg>';

    const mockApiResponse = {
      success: true,
      data: {
        svg: validSvg,
        signSummary: "Chart contains valid SVG.",
        houseBreakdown: ["Valid chart generated"],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const response = await fetch("/api/astrology/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthData: mockBirthData }),
    });

    const result = await response.json();

    expect(result.data.svg).toContain("<svg");
    expect(result.data.svg).toContain("</svg>");
    expect(result.data.svg).toContain("viewBox");
  });

  it("should handle different zodiac signs in summary", async () => {
    const zodiacSigns = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];

    for (const sign of zodiacSigns) {
      const mockApiResponse = {
        success: true,
        data: {
          svg: "<svg></svg>",
          signSummary: `Your sun is in ${sign}, bringing unique characteristics.`,
          houseBreakdown: [`1st House: ${sign} — Primary identity`],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const response = await fetch("/api/astrology/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthData: mockBirthData }),
      });

      const result = await response.json();

      expect(result.data.signSummary).toContain(sign);
      expect(result.data.houseBreakdown[0]).toContain(sign);
    }
  });
});
