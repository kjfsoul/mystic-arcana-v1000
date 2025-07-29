-- =====================================================
-- MYSTIC ARCANA KNOWLEDGE POOL SCHEMA
-- Migration: 20250729_create_knowledge_pool.sql
-- Purpose: Create structured database for tarot interpretations and astrological insights
-- Agent: SystemDesigner (Knowledge Ingestion Mission)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- TAROT INTERPRETATIONS TABLE
-- Stores detailed card meanings, position contexts, and personalization hooks
-- =====================================================

CREATE TABLE IF NOT EXISTS tarot_interpretations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Card Identification
    card_name text NOT NULL,
    card_number text,
    arcana_type text NOT NULL CHECK (arcana_type IN ('major', 'minor')),
    suit text CHECK (suit IN ('cups', 'wands', 'swords', 'pentacles', 'trump')),
    
    -- Core Meanings
    keywords text[] DEFAULT '{}',
    fortune_telling text[] DEFAULT '{}',
    meanings_light text[] DEFAULT '{}',
    meanings_shadow text[] DEFAULT '{}',
    archetype text,
    
    -- Esoteric Associations
    hebrew_alphabet text,
    numerology text,
    elemental text,
    mythical_spiritual text,
    questions_to_ask text[] DEFAULT '{}',
    
    -- Position-Specific Interpretations
    spread_type text NOT NULL,
    position_name text NOT NULL,
    position_index integer,
    base_meaning text NOT NULL,
    contextual_nuances text,
    
    -- Personalization Hooks
    personalization_hooks jsonb DEFAULT '[]',
    conditional_logic text[] DEFAULT '{}',
    
    -- Guidance and Actions
    actionable_reflection text,
    gentle_guidance text,
    
    -- Database Metadata
    db_entry_id text UNIQUE,
    content_tags text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Search and AI Features
    meaning_embedding vector(1536), -- For semantic search
    interpretation_quality_score decimal(3,2) DEFAULT 0.0,
    
    -- Constraints
    UNIQUE(card_name, spread_type, position_name)
);

-- =====================================================
-- ASTROLOGICAL INSIGHTS TABLE
-- Stores planetary transits, aspects, and interpretations
-- =====================================================

CREATE TABLE IF NOT EXISTS astrological_insights (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Astrological Element Identification
    element_type text NOT NULL CHECK (element_type IN ('transit', 'aspect', 'natal_placement', 'synastry', 'progression')),
    element_name text NOT NULL,
    element_description text,
    
    -- Planetary Information
    primary_planet text,
    secondary_planet text,
    aspect_type text,
    aspect_degree decimal(5,2),
    sign_placement text,
    house_placement integer CHECK (house_placement BETWEEN 1 AND 12),
    
    -- Timing Information
    exact_date date,
    orb_range decimal(3,1),
    duration_days integer,
    retrograde_motion boolean DEFAULT false,
    
    -- Core Interpretation
    archetypal_energy text NOT NULL,
    base_meaning text NOT NULL,
    contextual_influences text,
    
    -- User Personalization
    natal_chart_considerations jsonb DEFAULT '{}',
    personalization_conditions text[] DEFAULT '{}',
    
    -- Guidance
    spiritual_wisdom text,
    practical_advice text,
    emotional_guidance text,
    timing_energy text,
    
    -- Database Metadata
    db_entry_id text UNIQUE,
    keywords text[] DEFAULT '{}',
    related_transits text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Search Features
    interpretation_embedding vector(1536),
    relevance_score decimal(3,2) DEFAULT 0.0
);

-- =====================================================
-- DAILY COSMIC INSIGHTS TABLE
-- Stores daily database enrichment entries with complete cosmic context
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_cosmic_insights (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Date and Focus
    insight_date date NOT NULL UNIQUE,
    database_focus text NOT NULL,
    focus_category text NOT NULL,
    
    -- Astrological Context
    moon_sign text,
    moon_phase text,
    moon_illumination decimal(4,1),
    sun_sign text,
    active_aspects jsonb DEFAULT '[]',
    special_events text[] DEFAULT '{}',
    numerology_value integer,
    
    -- Content
    structured_interpretation jsonb NOT NULL,
    blog_post_content text NOT NULL,
    blog_post_title text NOT NULL,
    seo_keywords text[] DEFAULT '{}',
    
    -- Social Media Content
    social_content jsonb DEFAULT '{}',
    
    -- Metadata
    content_quality_score decimal(3,2) DEFAULT 0.0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- CARD COMBINATIONS TABLE
-- Stores interpretations for multi-card combinations
-- =====================================================

CREATE TABLE IF NOT EXISTS card_combinations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Combination Identification
    primary_card text NOT NULL,
    secondary_card text,
    tertiary_card text,
    combination_size integer NOT NULL DEFAULT 2,
    
    -- Context
    spread_type text NOT NULL,
    position_context text,
    narrative_theme text,
    
    -- Interpretation
    synthesized_meaning text NOT NULL,
    potential_conflicts text,
    harmony_aspects text,
    overall_guidance text,
    
    -- Personalization
    conditional_interpretations jsonb DEFAULT '{}',
    user_journey_stage text,
    
    -- Metadata
    db_entry_id text UNIQUE,
    keywords text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Search
    combination_embedding vector(1536),
    
    -- Constraints
    CHECK (combination_size >= 2 AND combination_size <= 10),
    UNIQUE(primary_card, secondary_card, tertiary_card, spread_type, position_context)
);

-- =====================================================
-- PERSONALIZATION PATTERNS TABLE
-- Stores user-specific interpretation patterns and preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS personalization_patterns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Pattern Identification
    pattern_type text NOT NULL CHECK (pattern_type IN ('natal_influence', 'reading_history', 'journal_theme', 'preference')),
    pattern_name text NOT NULL,
    pattern_description text,
    
    -- Conditions
    trigger_conditions jsonb NOT NULL,
    astrological_requirements jsonb DEFAULT '{}',
    card_requirements jsonb DEFAULT '{}',
    
    -- Modifications
    interpretation_adjustments jsonb NOT NULL,
    guidance_modifications text,
    recommended_actions text[] DEFAULT '{}',
    
    -- App Integration
    suggested_features text[] DEFAULT '{}',
    meditation_tracks text[] DEFAULT '{}',
    journal_prompts text[] DEFAULT '{}',
    
    -- Metadata
    effectiveness_score decimal(3,2) DEFAULT 0.0,
    usage_frequency integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(pattern_type, pattern_name)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tarot Interpretations Indexes
CREATE INDEX idx_tarot_interpretations_card_name ON tarot_interpretations(card_name);
CREATE INDEX idx_tarot_interpretations_spread_position ON tarot_interpretations(spread_type, position_name);
CREATE INDEX idx_tarot_interpretations_arcana ON tarot_interpretations(arcana_type);
CREATE INDEX idx_tarot_interpretations_tags ON tarot_interpretations USING GIN(content_tags);
CREATE INDEX idx_tarot_interpretations_keywords ON tarot_interpretations USING GIN(keywords);
CREATE INDEX idx_tarot_interpretations_embedding ON tarot_interpretations USING ivfflat (meaning_embedding vector_cosine_ops) WITH (lists = 100);

-- Astrological Insights Indexes
CREATE INDEX idx_astrological_insights_element ON astrological_insights(element_type, element_name);
CREATE INDEX idx_astrological_insights_planets ON astrological_insights(primary_planet, secondary_planet);
CREATE INDEX idx_astrological_insights_date ON astrological_insights(exact_date);
CREATE INDEX idx_astrological_insights_keywords ON astrological_insights USING GIN(keywords);
CREATE INDEX idx_astrological_insights_embedding ON astrological_insights USING ivfflat (interpretation_embedding vector_cosine_ops) WITH (lists = 100);

-- Daily Cosmic Insights Indexes
CREATE INDEX idx_daily_cosmic_insights_date ON daily_cosmic_insights(insight_date);
CREATE INDEX idx_daily_cosmic_insights_category ON daily_cosmic_insights(focus_category);
CREATE INDEX idx_daily_cosmic_insights_moon ON daily_cosmic_insights(moon_sign, moon_phase);

-- Card Combinations Indexes
CREATE INDEX idx_card_combinations_primary ON card_combinations(primary_card);
CREATE INDEX idx_card_combinations_spread ON card_combinations(spread_type);
CREATE INDEX idx_card_combinations_size ON card_combinations(combination_size);
CREATE INDEX idx_card_combinations_embedding ON card_combinations USING ivfflat (combination_embedding vector_cosine_ops) WITH (lists = 100);

-- Personalization Patterns Indexes
CREATE INDEX idx_personalization_patterns_type ON personalization_patterns(pattern_type);
CREATE INDEX idx_personalization_patterns_conditions ON personalization_patterns USING GIN(trigger_conditions);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tarot_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrological_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cosmic_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalization_patterns ENABLE ROW LEVEL SECURITY;

-- Public read access for interpretation data
CREATE POLICY "Public read access for tarot interpretations" 
    ON tarot_interpretations FOR SELECT 
    USING (true);

CREATE POLICY "Public read access for astrological insights" 
    ON astrological_insights FOR SELECT 
    USING (true);

CREATE POLICY "Public read access for daily cosmic insights" 
    ON daily_cosmic_insights FOR SELECT 
    USING (true);

CREATE POLICY "Public read access for card combinations" 
    ON card_combinations FOR SELECT 
    USING (true);

-- Admin write access (service role only)
CREATE POLICY "Admin write access for tarot interpretations" 
    ON tarot_interpretations FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin write access for astrological insights" 
    ON astrological_insights FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin write access for daily cosmic insights" 
    ON daily_cosmic_insights FOR ALL 
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin write access for card combinations" 
    ON card_combinations FOR ALL 
    USING (auth.role() = 'service_role');

-- User-specific access for personalization patterns
CREATE POLICY "Users can read their own personalization patterns" 
    ON personalization_patterns FOR SELECT 
    USING (true); -- Will be user-specific when we add user_id column

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_tarot_interpretations_updated_at 
    BEFORE UPDATE ON tarot_interpretations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_astrological_insights_updated_at 
    BEFORE UPDATE ON astrological_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_cosmic_insights_updated_at 
    BEFORE UPDATE ON daily_cosmic_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_combinations_updated_at 
    BEFORE UPDATE ON card_combinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalization_patterns_updated_at 
    BEFORE UPDATE ON personalization_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEARCH AND AI HELPER FUNCTIONS
-- =====================================================

-- Function to find similar interpretations using vector search
CREATE OR REPLACE FUNCTION find_similar_interpretations(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    interpretation_id uuid,
    card_name text,
    spread_type text,
    position_name text,
    base_meaning text,
    similarity float
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        id,
        card_name,
        spread_type,
        position_name,
        base_meaning,
        1 - (meaning_embedding <=> query_embedding) AS similarity
    FROM tarot_interpretations
    WHERE 1 - (meaning_embedding <=> query_embedding) > match_threshold
    ORDER BY meaning_embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to get personalized interpretation
CREATE OR REPLACE FUNCTION get_personalized_interpretation(
    p_card_name text,
    p_spread_type text,
    p_position_name text,
    p_user_data jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    base_interpretation text,
    personalized_guidance text,
    recommended_actions text[],
    suggested_features text[]
)
LANGUAGE SQL
STABLE
AS $$
    WITH base_interp AS (
        SELECT 
            base_meaning,
            actionable_reflection,
            gentle_guidance,
            personalization_hooks
        FROM tarot_interpretations
        WHERE card_name = p_card_name 
        AND spread_type = p_spread_type 
        AND position_name = p_position_name
        LIMIT 1
    ),
    applicable_patterns AS (
        SELECT 
            guidance_modifications,
            recommended_actions,
            suggested_features
        FROM personalization_patterns
        WHERE pattern_type IN ('natal_influence', 'preference')
        -- Pattern matching logic would go here based on p_user_data
        LIMIT 3
    )
    SELECT 
        bi.base_meaning,
        COALESCE(bi.gentle_guidance, bi.actionable_reflection),
        array_agg(DISTINCT ap.recommended_actions) FILTER (WHERE ap.recommended_actions IS NOT NULL),
        array_agg(DISTINCT ap.suggested_features) FILTER (WHERE ap.suggested_features IS NOT NULL)
    FROM base_interp bi
    LEFT JOIN applicable_patterns ap ON true
    GROUP BY bi.base_meaning, bi.gentle_guidance, bi.actionable_reflection;
$$;

-- =====================================================
-- INITIAL DATA VALIDATION
-- =====================================================

-- Add constraints to ensure data quality
ALTER TABLE tarot_interpretations 
ADD CONSTRAINT check_interpretation_quality 
CHECK (char_length(base_meaning) >= 50);

ALTER TABLE astrological_insights 
ADD CONSTRAINT check_insight_quality 
CHECK (char_length(base_meaning) >= 30);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE tarot_interpretations IS 'Comprehensive tarot card interpretations with position context and personalization hooks';
COMMENT ON TABLE astrological_insights IS 'Astrological transit and aspect interpretations with timing and personalization';
COMMENT ON TABLE daily_cosmic_insights IS 'Daily database enrichment entries with complete cosmic context and content';
COMMENT ON TABLE card_combinations IS 'Multi-card combination interpretations for complex readings';
COMMENT ON TABLE personalization_patterns IS 'User-specific interpretation patterns based on natal charts and preferences';

COMMENT ON COLUMN tarot_interpretations.personalization_hooks IS 'JSON array of conditional personalization logic for individual users';
COMMENT ON COLUMN astrological_insights.natal_chart_considerations IS 'JSON object describing how this insight interacts with various natal placements';
COMMENT ON COLUMN daily_cosmic_insights.structured_interpretation IS 'Complete structured interpretation following the enrichment format';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Knowledge Pool Schema created successfully!';
    RAISE NOTICE 'Tables created: tarot_interpretations, astrological_insights, daily_cosmic_insights, card_combinations, personalization_patterns';
    RAISE NOTICE 'Indexes, RLS policies, and utility functions added';
    RAISE NOTICE 'Ready for data ingestion via scripts/ingest-knowledge-pool.ts';
END $$;