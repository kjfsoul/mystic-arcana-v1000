export const Planets = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
  "North Node",
  "South Node",
] as const;
export type Planet = (typeof Planets)[number];

export const ZodiacSigns = [
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
] as const;
export type ZodiacSign = (typeof ZodiacSigns)[number];

export const AspectTypes = [
  "Conjunction",
  "Opposition",
  "Trine",
  "Square",
  "Sextile",
  "Quincunx",
  "Semisextile",
  "Semisquare",
  "Sesquiquadrate",
] as const;
export type AspectType = (typeof AspectTypes)[number];

export const HouseSystems = ["Placidus", "Koch", "Equal", "WholeSign"] as const;
export type HouseSystem = (typeof HouseSystems)[number];

export const MoonPhases = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;
export type MoonPhase = (typeof MoonPhases)[number];
