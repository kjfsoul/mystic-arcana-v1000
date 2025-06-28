-- Ephemeris caching system for astronomical calculations
CREATE TABLE IF NOT EXISTS ephemeris_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    julian_day DECIMAL(15,8) NOT NULL,
    planet INTEGER NOT NULL,
    planet_name VARCHAR(20) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    distance DECIMAL(15,6) NOT NULL,
    speed_longitude DECIMAL(10,6) NOT NULL,
    speed_latitude DECIMAL(10,6) NOT NULL,
    speed_distance DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(julian_day, planet)
);

-- Index for fast lookups
CREATE INDEX idx_ephemeris_julian_planet ON ephemeris_cache(julian_day, planet);

-- User birth charts storage
CREATE TABLE IF NOT EXISTS user_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    birth_date TIMESTAMPTZ NOT NULL,
    birth_location JSONB NOT NULL, -- {city, country, lat, lng, timezone}
    julian_day DECIMAL(15,8) NOT NULL,
    chart_data JSONB NOT NULL, -- Complete chart: planets, houses, aspects
    svg_chart TEXT, -- Kerykeion-generated SVG
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_charts_user_id ON user_charts(user_id);

-- Generated horoscopes cache
CREATE TABLE IF NOT EXISTS horoscope_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zodiac_sign VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    transit_data JSONB NOT NULL,
    horoscope_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(zodiac_sign, date)
);

-- Index for horoscope lookups
CREATE INDEX idx_horoscope_cache_sign_date ON horoscope_cache(zodiac_sign, date);

-- Synastry (compatibility) calculations cache
CREATE TABLE IF NOT EXISTS synastry_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_chart_id UUID REFERENCES user_charts(id),
    user2_chart_id UUID REFERENCES user_charts(id),
    composite_chart JSONB NOT NULL,
    synastry_aspects JSONB NOT NULL,
    compatibility_score INTEGER,
    analysis_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_chart_id, user2_chart_id)
);

-- Location geocoding cache
CREATE TABLE IF NOT EXISTS location_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(255) NOT NULL,
    formatted_address VARCHAR(500),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    country VARCHAR(100),
    state VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(search_query)
);

-- Index for location searches
CREATE INDEX idx_location_cache_query ON location_cache(search_query);

-- RLS Policies
ALTER TABLE user_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE synastry_cache ENABLE ROW LEVEL SECURITY;

-- Users can only see their own charts
CREATE POLICY "Users can view own charts" ON user_charts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charts" ON user_charts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts" ON user_charts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can see synastry where they are involved
CREATE POLICY "Users can view own synastry" ON synastry_cache
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_charts WHERE id IN (user1_chart_id, user2_chart_id)
        )
    );

-- Public tables (cached data)
CREATE POLICY "Public can view ephemeris cache" ON ephemeris_cache
    FOR SELECT USING (true);

CREATE POLICY "Public can view location cache" ON location_cache
    FOR SELECT USING (true);

CREATE POLICY "Public can view horoscope cache" ON horoscope_cache
    FOR SELECT USING (true);