-- CBR Wine Hunter Database Schema
-- PostgreSQL 15+

-- Create database (run this separately as superuser)
-- CREATE DATABASE cbr_wine_hunter;
-- CREATE USER wineuser WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE cbr_wine_hunter TO wineuser;

-- Connect to the database before running the rest
-- \c cbr_wine_hunter

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WINERIES TABLE
-- ============================================================================
CREATE TABLE wineries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    shop_url TEXT NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    opening_hours JSONB,
    description TEXT,
    image_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scraped_at TIMESTAMP
);

CREATE INDEX idx_wineries_slug ON wineries(slug);
CREATE INDEX idx_wineries_location ON wineries(latitude, longitude);
CREATE INDEX idx_wineries_active ON wineries(is_active);

-- ============================================================================
-- WINES TABLE
-- ============================================================================
CREATE TABLE wines (
    id SERIAL PRIMARY KEY,
    winery_id INTEGER NOT NULL REFERENCES wineries(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    variety VARCHAR(100),
    vintage VARCHAR(10),
    price DECIMAL(10,2),
    description TEXT,
    product_url TEXT,
    image_url TEXT,
    alcohol_content VARCHAR(20),
    bottle_size VARCHAR(50) DEFAULT '750ml',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wines_winery ON wines(winery_id);
CREATE INDEX idx_wines_variety ON wines(variety);
CREATE INDEX idx_wines_vintage ON wines(vintage);
CREATE INDEX idx_wines_price ON wines(price);
CREATE INDEX idx_wines_available ON wines(is_available);
CREATE INDEX idx_wines_search ON wines USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- SCRAPER CONFIGS TABLE
-- ============================================================================
CREATE TABLE scraper_configs (
    id SERIAL PRIMARY KEY,
    winery_id INTEGER NOT NULL REFERENCES wineries(id) ON DELETE CASCADE,
    platform_type VARCHAR(50),
    requires_javascript BOOLEAN DEFAULT false,
    product_list_url TEXT,
    product_url_pattern TEXT,
    selectors JSONB,
    pagination_config JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scraper_configs_winery ON scraper_configs(winery_id);
CREATE INDEX idx_scraper_configs_active ON scraper_configs(is_active);

-- ============================================================================
-- SCRAPE LOGS TABLE
-- ============================================================================
CREATE TABLE scrape_logs (
    id SERIAL PRIMARY KEY,
    winery_id INTEGER REFERENCES wineries(id) ON DELETE CASCADE,
    scrape_started_at TIMESTAMP,
    scrape_finished_at TIMESTAMP,
    status VARCHAR(50),
    wines_found INTEGER DEFAULT 0,
    wines_added INTEGER DEFAULT 0,
    wines_updated INTEGER DEFAULT 0,
    wines_removed INTEGER DEFAULT 0,
    error_message TEXT,
    flagged_for_review BOOLEAN DEFAULT false,
    flagged_products JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scrape_logs_winery ON scrape_logs(winery_id);
CREATE INDEX idx_scrape_logs_status ON scrape_logs(status);
CREATE INDEX idx_scrape_logs_flagged ON scrape_logs(flagged_for_review);
CREATE INDEX idx_scrape_logs_created ON scrape_logs(created_at);

-- ============================================================================
-- PRICE HISTORY TABLE
-- ============================================================================
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    wine_id INTEGER NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_wine ON price_history(wine_id);
CREATE INDEX idx_price_history_date ON price_history(recorded_at);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_wineries_updated_at BEFORE UPDATE ON wineries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wines_updated_at BEFORE UPDATE ON wines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraper_configs_updated_at BEFORE UPDATE ON scraper_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for wine listings with winery information
CREATE OR REPLACE VIEW wine_listings AS
SELECT 
    w.id,
    w.name,
    w.variety,
    w.vintage,
    w.price,
    w.description,
    w.product_url,
    w.image_url,
    w.is_available,
    winery.id as winery_id,
    winery.name as winery_name,
    winery.slug as winery_slug,
    winery.latitude as winery_latitude,
    winery.longitude as winery_longitude
FROM wines w
JOIN wineries winery ON w.winery_id = winery.id
WHERE w.is_available = true AND winery.is_active = true;

-- View for winery summary
CREATE OR REPLACE VIEW winery_summary AS
SELECT 
    w.id,
    w.name,
    w.slug,
    w.shop_url,
    w.latitude,
    w.longitude,
    w.image_url,
    w.is_active,
    COUNT(wines.id) as wine_count,
    MIN(wines.price) as min_price,
    MAX(wines.price) as max_price,
    w.last_scraped_at
FROM wineries w
LEFT JOIN wines ON w.id = wines.winery_id AND wines.is_available = true
GROUP BY w.id;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant permissions to wineuser
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wineuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO wineuser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO wineuser;

-- Grant usage on future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wineuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO wineuser;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data
-- INSERT INTO wineries (name, slug, shop_url, latitude, longitude) VALUES
-- ('Test Winery', 'test-winery', 'https://example.com/shop', -35.2809, 149.1300);

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

-- Track schema version
CREATE TABLE schema_version (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version) VALUES ('1.0.0');
