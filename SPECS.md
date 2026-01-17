# CBR Wine Hunter - Complete Project Specification

## Project Overview
A web application that aggregates wine listings from 40+ Canberra Region wineries, enabling users to search and discover wines by variety, vintage, price, and location.

---

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Task Scheduling**: APScheduler
- **Web Scraping**: 
  - Playwright (JavaScript-heavy sites)
  - BeautifulSoup4 (HTML parsing)
  - httpx (HTTP requests)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 5+
- **State Management**: React Context + Hooks
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet
- **HTTP Client**: Axios

### Infrastructure
- **Container 1 (Database)**: PostgreSQL 15 on Debian 12 LXC
- **Container 2 (Application)**: Python 3.11 + Node.js 20 on Debian 12 LXC
- **Reverse Proxy**: Nginx (optional, for production)

### External Services (Free Tier)
- **Geocoding**: Nominatim (OpenStreetMap) - Free, no API key
- **Map Tiles**: OpenStreetMap - Free

---

## Database Schema

### Tables

#### `wineries`
```sql
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
```

#### `wines`
```sql
CREATE TABLE wines (
    id SERIAL PRIMARY KEY,
    winery_id INTEGER REFERENCES wineries(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    variety VARCHAR(100),
    vintage VARCHAR(10),
    price DECIMAL(10,2),
    description TEXT,
    product_url TEXT,
    image_url TEXT,
    alcohol_content VARCHAR(20),
    bottle_size VARCHAR(50),
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
```

#### `scraper_configs`
```sql
CREATE TABLE scraper_configs (
    id SERIAL PRIMARY KEY,
    winery_id INTEGER REFERENCES wineries(id) ON DELETE CASCADE,
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
```

#### `scrape_logs`
```sql
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
```

#### `price_history`
```sql
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    wine_id INTEGER REFERENCES wines(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_history_wine ON price_history(wine_id);
CREATE INDEX idx_price_history_date ON price_history(recorded_at);
```

---

## API Endpoints

### Wine Endpoints

#### `GET /api/wines`
Search and filter wines
**Query Parameters:**
- `variety` (string, optional) - Filter by variety
- `vintage` (string, optional) - Filter by vintage
- `min_price` (float, optional) - Minimum price
- `max_price` (float, optional) - Maximum price
- `winery_id` (int, optional) - Filter by winery
- `search` (string, optional) - Full-text search
- `sort_by` (string, optional) - Sort field (price, name, vintage, winery)
- `sort_order` (string, optional) - asc/desc
- `limit` (int, default 50)
- `offset` (int, default 0)

**Response:**
```json
{
  "total": 150,
  "wines": [
    {
      "id": 1,
      "name": "Reserve Shiraz",
      "variety": "Shiraz",
      "vintage": "2021",
      "price": 45.00,
      "winery": {
        "id": 5,
        "name": "Clonakilla",
        "slug": "clonakilla"
      },
      "product_url": "https://...",
      "image_url": "https://...",
      "description": "..."
    }
  ]
}
```

#### `GET /api/wines/{id}`
Get single wine details

#### `GET /api/wines/varieties`
Get list of all varieties with counts

#### `GET /api/wines/vintages`
Get list of all vintages with counts

### Winery Endpoints

#### `GET /api/wineries`
Get all wineries
**Query Parameters:**
- `has_wines` (bool, optional) - Only wineries with available wines

**Response:**
```json
{
  "wineries": [
    {
      "id": 1,
      "name": "Clonakilla",
      "slug": "clonakilla",
      "latitude": -35.123456,
      "longitude": 149.123456,
      "wine_count": 12,
      "opening_hours": {...},
      "address": "...",
      "phone": "...",
      "image_url": "..."
    }
  ]
}
```

#### `GET /api/wineries/{id}`
Get single winery details with all wines

#### `GET /api/wineries/{id}/wines`
Get wines for specific winery

### Admin Endpoints (Protected)

#### `POST /api/admin/scrape/trigger`
Manually trigger scrape for specific winery or all

#### `GET /api/admin/scrape/logs`
Get scrape logs with filtering

#### `GET /api/admin/scrape/flagged`
Get products flagged for review

#### `PUT /api/admin/wines/{id}/approve`
Approve a flagged wine

#### `POST /api/admin/wineries`
Add new winery

#### `PUT /api/admin/scraper-configs/{id}`
Update scraper configuration

---

## Scraper Architecture

### Plugin System

Each winery has a scraper configuration stored in `scraper_configs` table:

```json
{
  "platform_type": "shopify",
  "requires_javascript": true,
  "product_list_url": "https://example.com/collections/all",
  "selectors": {
    "product_cards": ".product-card",
    "name": "h3.product-title",
    "price": ".price-item--regular",
    "link": "a.product-link",
    "variety": null,
    "vintage": null,
    "description": ".product-description"
  },
  "pagination_config": {
    "type": "load_more",
    "button_selector": ".load-more-button",
    "max_pages": 10
  },
  "extraction_rules": {
    "variety_from_name": {
      "regex": "\\b(Shiraz|Riesling|Chardonnay|Pinot Noir|Cabernet Sauvignon)\\b",
      "case_insensitive": true
    },
    "vintage_from_name": {
      "regex": "\\b(20\\d{2}|NV)\\b"
    },
    "price_cleanup": {
      "remove": ["$", ",", "AUD"],
      "type": "float"
    }
  }
}
```

### Scraper Flow

```
1. Load scraper config for winery
2. Determine if JavaScript rendering needed
3. Fetch product listing page
4. Extract product links/data
5. For each product:
   a. Visit product page (if needed)
   b. Extract: name, variety, vintage, price, description
   c. Apply extraction rules
   d. Validate data quality
   e. Flag for review if uncertain
6. Compare with existing database
7. Update/Add/Remove wines
8. Log results
```

### Fallback Strategies

**Missing Product URL:**
- Use shop_url from winery table
- Mark in database as "no_direct_link"

**Missing Variety:**
- Extract from wine name using regex
- Use common variety keywords
- Flag for manual review if can't determine

**Missing Vintage:**
- Extract from name using regex
- Check for "NV" (Non-Vintage)
- Flag for manual review

**Missing Price:**
- Flag for manual review (critical field)
- Don't add to database without price

**Scrape Failure:**
- Log error with details
- Send notification
- Retry once after 5 minutes
- If still fails, flag winery for manual check

### Quality Checks

Before adding/updating a wine:
1. Name must be present and > 3 characters
2. Price must be > 0 and < 10000
3. If variety extracted, must match known varieties
4. If vintage extracted, must be 1900-2030 or "NV"
5. Product URL must be valid HTTP(S) or null

### Flagging Logic

Flag for review when:
- Variety couldn't be extracted from name
- Vintage is ambiguous (multiple years in name)
- Price seems unusual (> $500 or < $5)
- Description is missing
- Wine name is very short (< 5 chars) or very long (> 200 chars)

---

## Frontend Structure

### Pages

1. **Home/Search Page** (`/`)
   - Wine search/filter interface
   - Results grid with infinite scroll
   - Quick filters (variety, price range)

2. **Wine Detail Page** (`/wine/:id`)
   - Wine details
   - Winery information
   - Link to winery website/product page
   - Price history graph (optional)

3. **Map Page** (`/map`)
   - Interactive map of Canberra region
   - Winery markers
   - Filter by available wines
   - Click marker → winery popup → view wines

4. **Winery Detail Page** (`/winery/:slug`)
   - Winery information
   - All wines from this winery
   - Map showing location
   - Opening hours, contact info

5. **Admin Dashboard** (`/admin`) (Protected)
   - Scrape status overview
   - Flagged products for review
   - Trigger manual scrapes
   - View logs
   - Add/edit wineries

### Components

- `WineCard` - Display wine in grid
- `WineFilter` - Filter sidebar/panel
- `WineryMarker` - Map marker for winery
- `WineryPopup` - Map popup with winery info
- `PriceRange` - Price range slider
- `VarietySelector` - Multi-select for varieties
- `VintageSelector` - Multi-select for vintages
- `SearchBar` - Full-text search input
- `SortDropdown` - Sort options

### Color Scheme (Wine-Themed)

```css
/* Primary Colors */
--wine-burgundy: #722F37;
--wine-deep-red: #8B3A3A;
--wine-rose: #C77B7B;

/* Accent Colors */
--wine-gold: #D4AF37;
--wine-cream: #F5F5DC;
--wine-charcoal: #36454F;

/* Neutral */
--white: #FFFFFF;
--light-gray: #F8F9FA;
--medium-gray: #6C757D;
--dark-gray: #343A40;

/* Functional */
--success: #28A745;
--warning: #FFC107;
--error: #DC3545;
```

### Typography
- **Headers**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, readable)

---

## Deployment Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://wineuser:password@lxc-db:5432/cbr_wine_hunter

# API
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=bcrypt-hash-here

# Scraper
SCRAPER_SCHEDULE_HOUR=3  # 3 AM daily
SCRAPER_PARALLEL_WORKERS=3
SCRAPER_REQUEST_TIMEOUT=30
SCRAPER_USER_AGENT=CBRWineHunter/1.0

# External Services
GEOCODING_SERVICE=nominatim
GEOCODING_EMAIL=your-email@example.com  # Required by Nominatim

# Frontend
VITE_API_URL=http://your-domain:8000/api

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/cbr-wine-hunter/app.log
```

### Directory Structure

```
/opt/cbr-wine-hunter/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── winery.py
│   │   │   ├── wine.py
│   │   │   └── scraper.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── wines.py
│   │   │   ├── wineries.py
│   │   │   └── admin.py
│   │   ├── scrapers/
│   │   │   ├── __init__.py
│   │   │   ├── base_scraper.py
│   │   │   ├── shopify_scraper.py
│   │   │   ├── wix_scraper.py
│   │   │   ├── generic_scraper.py
│   │   │   └── scheduler.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── wine_service.py
│   │   │   ├── winery_service.py
│   │   │   └── geocoding_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── extraction.py
│   │       └── validation.py
│   ├── alembic/
│   │   └── versions/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── scripts/
│   ├── setup_db.sh
│   ├── backup_db.sh
│   └── import_wineries.py
├── data/
│   └── wineries.csv  # Initial winery data
├── logs/
└── .env
```

---

## Development Phases

### Phase 1: Infrastructure Setup (Week 1)

**LXC Setup:**
1. Create PostgreSQL LXC container
2. Create Application LXC container
3. Configure networking between containers
4. Set up basic security (firewall rules)

**Database:**
1. Install PostgreSQL 15
2. Create database and user
3. Run initial schema creation
4. Test connection from app container

**Backend Foundation:**
1. Install Python 3.11, pip, virtualenv
2. Initialize FastAPI project structure
3. Set up Alembic for migrations
4. Create first migration (schema)
5. Implement database connection pooling
6. Create health check endpoint
7. Test API is accessible

**Frontend Foundation:**
1. Install Node.js 20 and npm
2. Initialize Vite + React project
3. Install Tailwind CSS
4. Create basic routing structure
5. Test frontend serves correctly

**Deliverable:** Running API + Frontend skeleton, database ready

### Phase 2: Core Data Models & Import (Week 2)

**Data Models:**
1. Implement SQLAlchemy models for all tables
2. Create Pydantic schemas for API validation
3. Write database seeding scripts

**Winery Import:**
1. Parse Excel file with 40 wineries
2. Create script to import wineries into database
3. Geocode winery addresses using Nominatim
4. Verify all wineries imported correctly

**Basic API Endpoints:**
1. GET /api/wineries (list all)
2. GET /api/wineries/{id} (single winery)
3. GET /api/wines (with basic filtering)

**Frontend:**
1. Create winery listing page
2. Create basic wine listing page
3. Implement API service layer

**Deliverable:** All wineries in database, viewable via API and frontend

### Phase 3: Scraper Framework (Week 3)

**Core Scraper:**
1. Implement base scraper class
2. Implement Playwright integration
3. Implement BeautifulSoup parsing
4. Create extraction utilities (variety, vintage, price)
5. Implement validation logic
6. Create flagging system

**Platform-Specific Scrapers:**
1. Shopify scraper (handles ~8 wineries)
2. Wix scraper (handles ~1 winery)
3. Generic scraper with configurable selectors

**Testing:**
1. Create scraper configs for 5 diverse wineries
2. Test each scraper manually
3. Verify data quality
4. Check flagging logic works

**Admin Interface:**
1. Manual scrape trigger endpoint
2. View scrape logs endpoint
3. Basic admin page to trigger scrapes

**Deliverable:** Working scraper for 5 wineries, wines in database

### Phase 4: Full Scraper Deployment (Week 4)

**Scraper Expansion:**
1. Create configs for remaining 35 wineries
2. Test each winery individually
3. Refine extraction rules based on results
4. Handle edge cases

**Monitoring:**
1. Implement scrape logging
2. Create flagged product review interface
3. Add error notifications
4. Track success/failure rates

**Scheduler:**
1. Implement APScheduler integration
2. Set up daily scrape at 3 AM
3. Test scheduled runs
4. Verify database updates correctly

**Deliverable:** All 40 wineries scraping successfully daily

### Phase 5: Search & Filter Features (Week 5)

**Backend:**
1. Implement full-text search
2. Add variety filtering
3. Add vintage filtering
4. Add price range filtering
5. Add sorting options
6. Optimize queries with proper indexes

**Frontend:**
1. Build comprehensive filter sidebar
2. Implement variety multi-select
3. Implement vintage multi-select
4. Create price range slider
5. Add search bar
6. Add sort dropdown
7. Implement pagination or infinite scroll
8. Show result counts

**Wine Detail Page:**
1. Full wine information display
2. Link to winery
3. Link to product page
4. Price history graph (if time permits)

**Deliverable:** Fully functional search and filter system

### Phase 6: Map Integration (Week 6)

**Backend:**
1. Ensure all wineries have lat/long
2. Create map data endpoint (optimized)
3. Add winery filtering by wine availability

**Frontend:**
1. Integrate Leaflet
2. Display all winery markers
3. Create custom winery marker icons
4. Implement winery popup
5. Add "View Wines" button in popup
6. Filter map by available wines
7. Add location-based search radius (optional)

**Deliverable:** Interactive map showing all wineries

### Phase 7: Admin Dashboard & Review System (Week 7)

**Backend:**
1. Implement admin authentication
2. Flagged products API
3. Product approval endpoint
4. Scraper config CRUD endpoints

**Frontend:**
1. Admin login page
2. Dashboard overview (scrape stats)
3. Flagged products review interface
4. Scraper logs viewer
5. Manual scrape controls
6. Winery management (add/edit)

**Deliverable:** Full admin dashboard for maintenance

### Phase 8: Polish & Optimization (Week 8)

**Performance:**
1. Optimize database queries
2. Add Redis caching (optional)
3. Implement API response caching
4. Optimize frontend bundle size
5. Lazy loading for images
6. Minify and compress assets

**Visual Design:**
1. Refine color scheme
2. Add wine-themed graphics/icons
3. Improve mobile responsiveness
4. Add loading states
5. Add empty states
6. Error handling and user feedback

**Testing:**
1. End-to-end testing
2. Mobile device testing
3. Performance testing
4. Edge case handling

**Documentation:**
1. API documentation
2. Admin user guide
3. Deployment guide
4. Troubleshooting guide

**Deliverable:** Production-ready application

### Phase 9: Deployment to Production (Week 9)

**Production Setup:**
1. Configure production LXC containers
2. Set up systemd services
3. Configure Nginx reverse proxy
4. Set up SSL/TLS certificates
5. Configure backup automation
6. Set up monitoring/alerting

**Data Migration:**
1. Export from dev database
2. Import to production database
3. Verify data integrity

**Launch:**
1. Deploy backend
2. Deploy frontend
3. Configure domain
4. Final testing
5. Go live!

**Deliverable:** Live production site

---

## Security Considerations

1. **Database:**
   - Strong passwords
   - Restrict network access (only from app container)
   - Regular backups
   - Encrypted backups for offsite storage

2. **API:**
   - Admin endpoints require authentication
   - Rate limiting on public endpoints
   - Input validation on all endpoints
   - CORS configuration for frontend

3. **Scraper:**
   - Respect robots.txt
   - Rate limiting between requests
   - User agent identification
   - Handle errors gracefully (don't hammer sites)

4. **Frontend:**
   - No sensitive data in client
   - HTTPS only in production
   - Content Security Policy headers

---

## Monitoring & Maintenance

### Daily Automated Tasks
- Scrape all wineries at 3 AM
- Database backup at 4 AM
- Clean up old scrape logs (keep 90 days)

### Weekly Manual Tasks
- Review flagged products
- Check scrape success rate
- Review error logs

### Monthly Tasks
- Review and update scraper configs
- Check for new wineries to add
- Performance optimization review

### Metrics to Track
- Total wines in database
- Scrape success rate per winery
- Average response time
- User search patterns (which varieties/prices popular)
- Flagged product review backlog

---

## Future Enhancements (Post-MVP)

1. **User Features:**
   - Email alerts for price drops
   - Favorite wines/wineries
   - Wine recommendations
   - Mobile app (React Native)

2. **Data Features:**
   - Wine ratings/reviews
   - Food pairing suggestions
   - Tasting notes
   - Awards and accolades

3. **Business Features:**
   - Affiliate links for purchases
   - Featured wineries
   - Event calendar for cellar door events
   - Wine club memberships aggregation

4. **Technical:**
   - Machine learning for variety detection
   - Image recognition for wine labels
   - Progressive Web App (PWA)
   - GraphQL API option

---

## Success Criteria

The project is successful when:

1. ✅ All 40 wineries are being scraped successfully daily
2. ✅ Users can search for "All Shiraz under $30" and get accurate results
3. ✅ Map shows all wineries with accurate locations
4. ✅ Scraper automatically detects and flags uncertain data
5. ✅ Site loads quickly on mobile and desktop
6. ✅ Admin can review flagged items in < 5 minutes
7. ✅ New wineries can be added in < 10 minutes
8. ✅ Price changes are detected within 24 hours
9. ✅ System runs for 30 days without manual intervention
10. ✅ You can show it to friends and get positive feedback!

---

## Risk Mitigation

**Risk: Winery websites change frequently**
- Mitigation: Monitor scrape logs, flag failures immediately, maintain fallback to shop_url

**Risk: Scraping performance degrades with more wineries**
- Mitigation: Parallel scraping, optimize selectors, use caching

**Risk: Database grows too large**
- Mitigation: Archive old wines, implement data retention policy

**Risk: Legal issues with scraping**
- Mitigation: Respect robots.txt, use reasonable rate limits, link to source, don't reproduce full content

**Risk: You lose interest in manual maintenance**
- Mitigation: Minimize manual work through automation, make admin interface super fast, keep flagging accurate

---

## Next Steps

To begin Phase 1, we need to:

1. Set up the PostgreSQL LXC container
2. Set up the Application LXC container
3. Initialize the Git repository
4. Create the database schema
5. Build the basic FastAPI application
6. Build the basic React frontend

Would you like me to start creating the setup scripts and initial code?
