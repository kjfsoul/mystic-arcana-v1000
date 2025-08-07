
export const SOURCE_TYPES = ['book', 'website', 'expert', 'api', 'dataset', 'oracle', 'tradition'] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const CONCEPT_TYPES = ['tarot_card', 'planet', 'sign', 'house', 'aspect', 'element', 'archetype', 'symbol', 'chakra', 'crystal', 'spread', 'number'] as const;
export type ConceptType = typeof CONCEPT_TYPES[number];

export const ELEMENTAL_ASSOCIATIONS = ['fire', 'water', 'air', 'earth', 'spirit'] as const;
export type ElementalAssociation = typeof ELEMENTAL_ASSOCIATIONS[number];

export const INTERPRETATION_CONTEXT_TYPES = ['upright', 'reversed', 'general', 'love', 'career', 'spiritual', 'health', 'past', 'present', 'future', 'advice', 'obstacle', 'outcome'] as const;
export type InterpretationContextType = typeof INTERPRETATION_CONTEXT_TYPES[number];

export const RELATIONSHIP_TYPES = ['strengthens', 'weakens', 'opposes', 'complements', 'contains', 'part_of', 'similar_to', 'evolved_from', 'rules', 'ruled_by', 'associated_with'] as const;
export type RelationshipType = typeof RELATIONSHIP_TYPES[number];

export const LINEAGE_TYPES = ['source_chain', 'synthesis_process', 'personalization_path', 'ai_reasoning'] as const;
export type LineageType = typeof LINEAGE_TYPES[number];

export const PIPELINE_STATUSES = ['active', 'paused', 'error', 'maintenance'] as const;
export type PipelineStatus = typeof PIPELINE_STATUSES[number];

export const INGESTION_STATUSES = ['running', 'completed', 'failed', 'partial'] as const;
export type IngestionStatus = typeof INGESTION_STATUSES[number];

export const ARCANA_TYPES = ['major_arcana', 'minor_arcana'] as const;
export type ArcanaType = typeof ARCANA_TYPES[number];

export const VERIFICATION_STATUSES = ['pending', 'verified', 'expert_reviewed', 'deprecated', 'draft', 'reviewed', 'validated', 'canonical'] as const;
export type VerificationStatus = typeof VERIFICATION_STATUSES[number];
