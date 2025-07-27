-- Create astrology caching tables for performance optimization
-- Supports 1-hour TTL for transits and persistent birth chart storage

-- Birth Charts Cache Table
CREATE TABLE IF NOT EXISTS cached_birth_charts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    birth_data_hash TEXT UNIQUE NOT NULL,
    birth_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    chart_data JSONB NOT NULL,
    svg_chart TEXT NOT NULL,
    sign_summary TEXT NOT NULL,
    house_breakdown TEXT[] NOT NULL,
    placidus_method BOOLEAN DEFAULT false,
    calculation_method TEXT NOT NULL,
    cache_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    INDEX(birth_data_hash),
    INDEX(expires_at)
);

-- Transit Data Cache Table  
CREATE TABLE IF NOT EXISTS cached_transit_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date_key TEXT NOT NULL, -- YYYY-MM-DD-HH format
    location_hash TEXT NOT NULL, -- Rounded lat_lng coordinates
    transit_data JSONB NOT NULL,
    cosmic_weather JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    UNIQUE(date_key, location_hash),
    INDEX(date_key),
    INDEX(location_hash),
    INDEX(expires_at)
);

-- Cache Statistics Table
CREATE TABLE IF NOT EXISTS astrology_cache_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    birth_chart_requests INTEGER DEFAULT 0,
    birth_chart_hits INTEGER DEFAULT 0,
    transit_requests INTEGER DEFAULT 0,
    transit_hits INTEGER DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    cache_efficiency DECIMAL(5,2) DEFAULT 0.0,
    average_response_time INTEGER DEFAULT 0, -- milliseconds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Row Level Security (RLS) Policies
ALTER TABLE cached_birth_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_transit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE astrology_cache_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access for authenticated users
CREATE POLICY "Allow read access to cached birth charts"
    ON cached_birth_charts FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow read access to cached transit data"
    ON cached_transit_data FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Allow insert/update for service role only (API writes)
CREATE POLICY "Allow service role to manage birth chart cache"
    ON cached_birth_charts FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to manage transit cache"
    ON cached_transit_data FOR ALL
    USING (auth.role() = 'service_role');

-- Policy: Allow stats read for authenticated users, full access for service role
CREATE POLICY "Allow read access to cache stats"
    ON astrology_cache_stats FOR SELECT
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Allow service role to manage cache stats"
    ON astrology_cache_stats FOR ALL
    USING (auth.role() = 'service_role');

-- Functions for cache management

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_astrology_cache()
RETURNS TABLE(birth_charts_cleaned INTEGER, transits_cleaned INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    birth_chart_count INTEGER;
    transit_count INTEGER;
BEGIN
    -- Clean expired birth charts
    DELETE FROM cached_birth_charts WHERE expires_at < NOW();
    GET DIAGNOSTICS birth_chart_count = ROW_COUNT;
    
    -- Clean expired transit data
    DELETE FROM cached_transit_data WHERE expires_at < NOW();
    GET DIAGNOSTICS transit_count = ROW_COUNT;
    
    -- Log cleanup
    INSERT INTO astrology_cache_stats (date, birth_chart_requests, transit_requests)
    VALUES (CURRENT_DATE, birth_chart_count * -1, transit_count * -1)
    ON CONFLICT (date) DO UPDATE SET
        birth_chart_requests = astrology_cache_stats.birth_chart_requests + EXCLUDED.birth_chart_requests,
        transit_requests = astrology_cache_stats.transit_requests + EXCLUDED.transit_requests,
        updated_at = NOW();
    
    RETURN QUERY SELECT birth_chart_count, transit_count;
END;
$$;

-- Function to update cache statistics
CREATE OR REPLACE FUNCTION update_cache_stats(
    p_birth_chart_requests INTEGER DEFAULT 0,
    p_birth_chart_hits INTEGER DEFAULT 0,
    p_transit_requests INTEGER DEFAULT 0,
    p_transit_hits INTEGER DEFAULT 0,
    p_response_time INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO astrology_cache_stats (
        date,
        birth_chart_requests,
        birth_chart_hits,
        transit_requests,
        transit_hits,
        total_requests,
        average_response_time
    )
    VALUES (
        CURRENT_DATE,
        p_birth_chart_requests,
        p_birth_chart_hits,
        p_transit_requests,
        p_transit_hits,
        p_birth_chart_requests + p_transit_requests,
        p_response_time
    )
    ON CONFLICT (date) DO UPDATE SET
        birth_chart_requests = astrology_cache_stats.birth_chart_requests + EXCLUDED.birth_chart_requests,
        birth_chart_hits = astrology_cache_stats.birth_chart_hits + EXCLUDED.birth_chart_hits,
        transit_requests = astrology_cache_stats.transit_requests + EXCLUDED.transit_requests,
        transit_hits = astrology_cache_stats.transit_hits + EXCLUDED.transit_hits,
        total_requests = astrology_cache_stats.total_requests + EXCLUDED.total_requests,
        cache_efficiency = CASE 
            WHEN astrology_cache_stats.total_requests + EXCLUDED.total_requests > 0 THEN
                ((astrology_cache_stats.birth_chart_hits + astrology_cache_stats.transit_hits + EXCLUDED.birth_chart_hits + EXCLUDED.transit_hits)::DECIMAL / 
                 (astrology_cache_stats.total_requests + EXCLUDED.total_requests)::DECIMAL) * 100
            ELSE 0
        END,
        average_response_time = (astrology_cache_stats.average_response_time + EXCLUDED.average_response_time) / 2,
        updated_at = NOW();
END;
$$;

-- Function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    date DATE,
    birth_chart_requests INTEGER,
    birth_chart_hits INTEGER,
    birth_chart_hit_rate DECIMAL(5,2),
    transit_requests INTEGER,
    transit_hits INTEGER,
    transit_hit_rate DECIMAL(5,2),
    total_requests INTEGER,
    overall_cache_efficiency DECIMAL(5,2),
    average_response_time INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.date,
        s.birth_chart_requests,
        s.birth_chart_hits,
        CASE WHEN s.birth_chart_requests > 0 THEN 
            (s.birth_chart_hits::DECIMAL / s.birth_chart_requests::DECIMAL) * 100 
        ELSE 0 END as birth_chart_hit_rate,
        s.transit_requests,
        s.transit_hits,
        CASE WHEN s.transit_requests > 0 THEN 
            (s.transit_hits::DECIMAL / s.transit_requests::DECIMAL) * 100 
        ELSE 0 END as transit_hit_rate,
        s.total_requests,
        s.cache_efficiency as overall_cache_efficiency,
        s.average_response_time
    FROM astrology_cache_stats s
    WHERE s.date >= CURRENT_DATE - INTERVAL '%s days' % days_back
    ORDER BY s.date DESC;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cached_birth_charts_hash ON cached_birth_charts(birth_data_hash);
CREATE INDEX IF NOT EXISTS idx_cached_birth_charts_expires ON cached_birth_charts(expires_at);
CREATE INDEX IF NOT EXISTS idx_cached_transit_data_key ON cached_transit_data(date_key, location_hash);
CREATE INDEX IF NOT EXISTS idx_cached_transit_data_expires ON cached_transit_data(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_stats_date ON astrology_cache_stats(date);

-- Comments for documentation
COMMENT ON TABLE cached_birth_charts IS 'Cached birth chart calculations with 7-day TTL';
COMMENT ON TABLE cached_transit_data IS 'Cached transit data with 1-hour TTL for performance';
COMMENT ON TABLE astrology_cache_stats IS 'Daily cache performance statistics';
COMMENT ON FUNCTION clean_expired_astrology_cache() IS 'Scheduled function to clean expired cache entries';
COMMENT ON FUNCTION update_cache_stats(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) IS 'Update daily cache statistics';
COMMENT ON FUNCTION get_cache_stats(INTEGER) IS 'Retrieve cache performance statistics for analysis';