/**
 * Mystic Arcana Agents Index
 * Central registry of all AI agents in the system
 */

// Core Intelligence Agents
export { SophiaAgent } from "./sophia";
export { PersonaLearnerAgent } from "./PersonaLearner";
export { DataOracleAgent } from "./DataOracle";
export { ContentIngestorAgent } from "./content-ingestor";

// Specialized Utility Agents
export { AstrologyGuruAgent } from "./astrology-guru";
export { LunarTransitNarratorAgent } from "./lunar-transit-narrator";
export { PersonalizationOrchestratorAgent } from "./personalization-orchestrator";
export { UXNarratorAgent } from "./ux-narrator";
export { ValidationRunnerAgent } from "./validation-runner";
export { TarotDeckSeederAgent } from "./tarot-deck-seeder";

// Supporting Modules
export { default as DataOracleWebScraper } from "./DataOracle-WebScraper";

// Agent Registry
export const AGENT_REGISTRY = {
  // Primary Intelligence Layer
  sophia: {
    name: "Sophia",
    class: "SophiaAgent",
    archetype: "The Wise Woman, The Keeper of Ancient Knowledge",
    capabilities: [
      "spiritual_synthesis",
      "narrative_weaving",
      "compassionate_guidance",
    ],
    status: "active",
  },
  "persona-learner": {
    name: "PersonaLearner",
    class: "PersonaLearnerAgent",
    archetype: "The Memory Keeper, The Pattern Recognizer",
    capabilities: [
      "user_memory_storage",
      "personalization_learning",
      "pattern_recognition",
    ],
    status: "active",
  },
  "data-oracle": {
    name: "DataOracle",
    class: "DataOracleAgent",
    archetype: "The Omniscient Librarian, The Keeper of All Knowledge",
    capabilities: [
      "automated_data_harvesting",
      "knowledge_graph_construction",
      "semantic_relationship_mapping",
      "multi_source_synthesis",
      "explainable_ai_lineage",
      "quality_validation",
    ],
    status: "active",
  },

  // Specialized Support Layer
  "content-ingestor": {
    name: "ContentIngestor",
    class: "ContentIngestorAgent",
    archetype: "The Information Harvester",
    capabilities: [
      "source_crawling",
      "content_extraction",
      "knowledge_structuring",
    ],
    status: "development",
  },
  "astrology-guru": {
    name: "AstrologyGuru",
    class: "AstrologyGuruAgent",
    archetype: "The Cosmic Calculator",
    capabilities: [
      "ephemeris_calculation",
      "chart_generation",
      "transit_analysis",
    ],
    status: "active",
  },
  "lunar-narrator": {
    name: "LunarTransitNarrator",
    class: "LunarTransitNarratorAgent",
    archetype: "The Moon Whisperer",
    capabilities: ["lunar_phase_tracking", "moon_transit_narration"],
    status: "active",
  },
  "personalization-orchestrator": {
    name: "PersonalizationOrchestrator",
    class: "PersonalizationOrchestratorAgent",
    archetype: "The Experience Curator",
    capabilities: ["user_journey_optimization", "experience_personalization"],
    status: "active",
  },
  "ux-narrator": {
    name: "UXNarrator",
    class: "UXNarratorAgent",
    archetype: "The Interface Storyteller",
    capabilities: ["ui_enhancement", "narrative_integration"],
    status: "active",
  },
  "validation-runner": {
    name: "ValidationRunner",
    class: "ValidationRunnerAgent",
    archetype: "The Quality Guardian",
    capabilities: ["data_validation", "system_testing", "quality_assurance"],
    status: "active",
  },
  "tarot-deck-seeder": {
    name: "TarotDeckSeeder",
    class: "TarotDeckSeederAgent",
    archetype: "The Deck Keeper",
    capabilities: ["deck_management", "card_data_seeding"],
    status: "active",
  },
} as const;

// Agent Status Types
export type AgentStatus =
  | "active"
  | "development"
  | "maintenance"
  | "deprecated";

export interface AgentInfo {
  name: string;
  class: string;
  archetype: string;
  capabilities: string[];
  status: AgentStatus;
}

// Utility functions
export function getActiveAgents(): Record<string, AgentInfo> {
  return Object.fromEntries(
    Object.entries(AGENT_REGISTRY).filter(
      ([, info]) => info.status === "active",
    ),
  );
}

export function getAgentsByCapability(
  capability: string,
): Record<string, AgentInfo> {
  return Object.fromEntries(
    Object.entries(AGENT_REGISTRY).filter(([, info]) =>
      info.capabilities.includes(capability),
    ),
  );
}

export function getAgentCount(): {
  total: number;
  active: number;
  development: number;
  maintenance: number;
  deprecated: number;
} {
  const counts = {
    total: Object.keys(AGENT_REGISTRY).length,
    active: 0,
    development: 0,
    maintenance: 0,
    deprecated: 0,
  };

  Object.values(AGENT_REGISTRY).forEach((agent) => {
    counts[agent.status]++;
  });

  return counts;
}
