
export const ReaderSpecializations = ['tarot', 'astrology', 'mixed'] as const;
export type ReaderSpecialization = typeof ReaderSpecializations[number];

export const SummaryTypes = ['career', 'relationship', 'personal_growth', 'spiritual', 'general'] as const;
export type SummaryType = typeof SummaryTypes[number];

export const ReadingRequestTypes = ['birth_chart', 'transit', 'tarot_spread', 'mixed'] as const;
export type ReadingRequestType = typeof ReadingRequestTypes[number];

export const PromptTypes = ['reflection', 'multiple-choice', 'scale', 'binary'] as const;
export type PromptType = typeof PromptTypes[number];

export const PersonaInsightSources = ['reading-response', 'behavior', 'preference'] as const;
export type PersonaInsightSource = typeof PersonaInsightSources[number];

export const InteractionSessionReadingTypes = ['tarot', 'astrology', 'mixed'] as const;
export type InteractionSessionReadingType = typeof InteractionSessionReadingTypes[number];

export const MemoryLogNamespaces = ['user-interaction', 'persona-learning', 'reading-context'] as const;
export type MemoryLogNamespace = typeof MemoryLogNamespaces[number];

export const EmotionalStates = ['open', 'guarded', 'curious', 'skeptical', 'engaged'] as const;
export type EmotionalState = typeof EmotionalStates[number];

export const SeekingTypes = ['clarity', 'validation', 'guidance', 'exploration'] as const;
export type SeekingType = typeof SeekingTypes[number];

export const ResponsePatterns = ['thoughtful', 'quick', 'hesitant', 'confident'] as const;
export type ResponsePattern = typeof ResponsePatterns[number];

export const EnergyLevels = ['high', 'medium', 'low'] as const;
export type EnergyLevel = typeof EnergyLevels[number];

export const CosmicIntensities = ['calm', 'active', 'intense', 'transformative'] as const;
export type CosmicIntensity = typeof CosmicIntensities[number];

export const InfluenceTypes = ['enhancing', 'challenging', 'neutral', 'transformative'] as const;
export type InfluenceType = typeof InfluenceTypes[number];

export const CosmicWeatherTypes = ['calm', 'active', 'turbulent', 'transformative', 'eclipse', 'mercury-retrograde', 'full-moon', 'new-moon'] as const;
export type CosmicWeatherType = typeof CosmicWeatherTypes[number];

export const DailySpreadTypes = ['daily_guidance'] as const;
export type DailySpreadType = typeof DailySpreadTypes[number];

export const ArcanaTypes = ['major', 'minor'] as const;
export type ArcanaType = typeof ArcanaTypes[number];

export const TarotCardPositions = ['upright', 'reversed'] as const;
export type TarotCardPosition = typeof TarotCardPositions[number];
