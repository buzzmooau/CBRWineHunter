# CBR Wine Hunter - Current State Summary
*Last Updated: January 21, 2026*

## Project Status: Phase 3 Advanced - 85% Complete ✅

### What's Been Built

#### Infrastructure (Complete)
- ✅ LXC Container 400 (cbr-db): PostgreSQL 15 at 192.168.50.120
- ✅ LXC Container 401 (cbr-app): Application at 192.168.50.121
- ✅ Network configured (192.168.50.0/24)
- ✅ Database schema fully implemented
- ✅ UTF-8 encoding configured for Unicode support

#### Backend (Complete)
- ✅ FastAPI application running on port 8000
- ✅ Database models: Winery, Wine (SQLAlchemy)
- ✅ API endpoints:
  - `/api/wineries/` - List all wineries
  - `/api/wineries/{id}` - Get winery by ID
  - `/api/wineries/slug/{slug}` - Get winery by slug
  - `/api/wines/` - List wines with filtering
  - `/api/wines/{id}` - Get wine by ID
  - `/api/wines/varieties/list` - Get all varieties
  - `/api/wines/vintages/list` - Get all vintages
- ✅ API documentation at http://192.168.50.121:8000/docs

#### Scraper System (Advanced)
- ✅ Enhanced scraper that visits individual product pages
- ✅ Multi-platform support:
  - Shopify stores
  - WooCommerce sites
  - Wix sites (GoDaddy Airo)
  - Custom platforms
- ✅ Advanced features:
  - Bot detection avoidance (realistic browser headers, user agent)
  - Increased timeouts (60s listing, 40s products)
  - Unicode handling (smart quotes, non-breaking spaces)
  - ALL CAPS name conversion to Title Case
  - Variety extraction from 45+ wine varieties
  - Vintage extraction with smart filtering (2010-2030 range)
  - Wine Details section parsing for variety/vintage
  - Price extraction and validation
  - Description filtering (removes shipping text)
  - Non-wine item filtering (subscriptions, vouchers, etc.)
  - Wine name cleanup and variety removal
  - URL deduplication

#### Frontend (Complete)
- ✅ React 18 + Vite + Tailwind CSS
- ✅ Pages:
  - Home page
  - Wineries page (40 wineries displayed)
  - Wines page with advanced filtering (483 wines displayed)
- ✅ Features:
  - Search by name
  - Filter by variety (dropdown)
  - Filter by vintage (dropdown)
  - Filter by price range (min/max)
  - Filter by winery (dropdown showing all 40)
  - "Show All" button
  - Next/Previous pagination with page indicators
  - Wine cards with variety tags and vintage badges
  - Direct "Buy" links to winery product pages
  - Responsive design

#### Data (Current - Massive Progress!)
- ✅ 40 wineries imported with shop URLs
- ✅ **483 wines scraped from 34 wineries (85% complete!)**
- ✅ Average 14.2 wines per winery

### Wineries Successfully Scraped (34)

#### 20 Wines Each (6 wineries):
1. Barton Estate Winery
2. Capital Wines
3. Lerida Estate Wines
4. Murrumbateman Winery
5. Nick O'Leary Wines
6. Wimbaliri Wines

#### 19 Wines Each (3 wineries):
7. Gundog Estate
8. McKellar Ridge Wines
9. Mount Majura Vineyard

#### 15-18 Wines (7 wineries):
10. Collector Wines (18)
11. Lake George Winery (18)
12. Jeir Creek Wines (17)
13. Ravensworth Wines (16)
14. Four Winds Vineyard (15)
15. Sapling Yard Wines (15)
16. Tallagandra Hill Winery (15)

#### 12-14 Wines (7 wineries):
17. Clonakilla (14)
18. Dionysus Winery (14)
19. Corang Estate (13)
20. Long Rail Gully Wines (13)
21. Shaw Wines (13)
22. Eden Road Wines (12)
23. Intrepidus Wines (12)
24. Surveyors Hill Vineyards (12)

#### 10-11 Wines (6 wineries):
25. Quarry Hill (11)
26. Brindabella Hills (10)
27. Contentious Character (10)
28. Pankhurst Wines (10)
29. Poachers Vineyard (10)
30. Vineyard 1207 (10)

#### 6-9 Wines (5 wineries):
31. Mallaluka Wines (8)
32. Helm Wines (7)
33. Yarrh Wines (7)
34. The Vintner's Daughter (6)

### Wineries NOT Yet Scraped (6)

**Need Special Handling:**
- Gallagher Wines (ID 11)
- Kyeema Wines (ID 16)
- Lark Hill Winery (ID 18) - Square.site platform (very slow)
- Norton Road Wines (ID 26) - GoDaddy Airo (heavily JS, requires manual)
- Sassafras Wines (ID 32)

**No Online Shop:**
- Wallaroo Wines (ID 38) - Marked inactive, no e-commerce

### Known Issues & Solutions Implemented

#### Scraper Improvements Made
1. ✅ **Bot Detection**: Added realistic browser headers, Australian locale, timezone
2. ✅ **Timeouts**: Increased to 60s for listing pages, 40s for products
3. ✅ **ALL CAPS Names**: Automatic conversion to Title Case
4. ✅ **Variety Extraction**: Expanded to 45+ varieties including less common ones
5. ✅ **Vintage Priority**: Wine Details section → Name → URL (filtered 2010-2030)
6. ✅ **URL Deduplication**: Removes query params before scraping
7. ✅ **Non-wine Filtering**: Filters subscriptions, vouchers, gift cards
8. ✅ **Multiple Selectors**: Handles h1, h2, h1.name, [data-hook="product-title"]
9. ✅ **Screen Reader Elements**: Skips sr-only class elements

#### Platform-Specific Solutions
- ✅ **Shopify**: Standard product URL patterns working
- ✅ **WooCommerce**: Wine Details table parsing implemented
- ✅ **Wix/GoDaddy Airo**: [data-hook="product-title"] selector added
- ✅ **Custom Sites**: h1.name selector for Shaw Wines type sites
- ✅ **Square.site**: Known timeout issues (platform too slow)

### File Locations

#### Key Backend Files
```
/opt/CBRWineHunter/backend/
├── app/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Settings (uses .env)
│   ├── database.py                # SQLAlchemy engine (UTF-8 configured)
│   ├── models/
│   │   ├── winery.py             # Winery model
│   │   └── wine.py               # Wine model
│   ├── routers/
│   │   ├── wineries.py           # Winery API endpoints
│   │   └── wines.py              # Wine API endpoints
│   └── scrapers/
│       ├── base_scraper.py       # Base scraper with utilities
│       ├── generic_scraper.py    # Original simple scraper
│       └── enhanced_scraper.py   # Enhanced scraper (visits product pages)
├── .env                          # Environment configuration
├── scrape_and_save.py           # Script to scrape and save wines
├── test_enhanced_scraper.py     # Test scraper on one winery
└── requirements.txt             # Python dependencies
```

#### Key Frontend Files
```
/opt/CBRWineHunter/frontend/
├── src/
│   ├── App.jsx                   # Main app with routing
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── WineriesPage.jsx
│   │   └── WinesPage.jsx
│   ├── components/
│   │   ├── WineryCard.jsx
│   │   └── WineCard.jsx
│   └── services/
│       ├── api.js                # Axios config
│       ├── wineryService.js      # Winery API calls
│       └── wineService.js        # Wine API calls
├── .env                          # VITE_API_URL=http://192.168.50.121:8000/api
└── package.json
```

### Scripts & Commands

#### Start Services
```bash
# Backend (on CT 401)
cd /opt/CBRWineHunter/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (on CT 401, separate terminal)
cd /opt/CBRWineHunter/frontend
npm run dev
```

#### Scraping Commands
```bash
# Test a winery (doesn't save)
python test_enhanced_scraper.py <winery_id>

# Scrape and save a winery
python scrape_and_save.py <winery_id>

# Check wine count
python3 -c "
from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT COUNT(*) FROM wines'))
    print(f'Total wines: {result.fetchone()[0]}')
"
```

#### Database Commands
```bash
# Connect to database (from MosEspa)
pct exec 400 -- su - postgres -c "psql -d cbr_wine_hunter"

# Common queries
SELECT COUNT(*) FROM wineries;
SELECT COUNT(*) FROM wines;
SELECT w.name, COUNT(wi.id) FROM wineries w 
  LEFT JOIN wines wi ON w.id = wi.winery_id 
  GROUP BY w.name ORDER BY COUNT(wi.id) DESC;
```

### Next Steps (Final Push!)

#### Immediate (Complete Remaining Wineries)
1. Test and scrape remaining 5 wineries (IDs: 11, 16, 18, 26, 32)
2. Identify which ones work with current scraper
3. Document ones that need manual entry
4. Goal: Reach 500+ wines!

#### Future Features (Post-500)
1. **Manual Wine Entry Interface**: For edge cases like Norton Road Wines
2. **Wine Detail Pages**: Click wine to see full information
3. **Multi-select Filters**: Select multiple varieties at once
4. **Sort Options**: By price, name, vintage, winery
5. **Price History Tracking**: Track price changes over time
6. **Automated Daily Scraping**: APScheduler at 3 AM
7. **Admin Dashboard**: For flagged items and scraper management
8. **Interactive Map**: With winery locations
9. **Email Notifications**: For scraper errors and price drops

### Environment Variables

#### Backend .env
```
DATABASE_URL=postgresql://wineuser:20B3ans25@192.168.50.120:5432/cbr_wine_hunter
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=1868594fcf8ecd389d87daa95cb6e48a51e265c5e1a7907d134f6e328066b775
CORS_ORIGINS=["http://192.168.50.121:5173","http://localhost:5173"]
ENVIRONMENT=development
```

#### Frontend .env
```
VITE_API_URL=http://192.168.50.121:8000/api
```

### Testing Strategy

When testing new wineries:
1. Start with `test_enhanced_scraper.py` to see what it finds
2. Check for:
   - Reasonable wine count (5-30 wines typical)
   - Clean names (not "Cart", "Product", etc.)
   - Valid prices (> $5, < $500 typically)
   - Varieties detected
   - Vintages extracted (2010-2030 range)
3. If looks good, use `scrape_and_save.py` to save
4. Check frontend to verify display

### Lessons Learned

1. **Unicode matters**: Always use UTF-8 encoding in database connections
2. **Bot detection is real**: Need realistic headers, user agents, and locale
3. **E-commerce platforms vary**: Each needs specific selector patterns
4. **Name extraction is complex**: Multiple fallback patterns needed
5. **Vintage from URLs is risky**: Product IDs can look like years (e.g., 55132 → 1932)
6. **Wine Details sections are gold**: Most reliable source for variety/vintage
7. **Not everything is wine**: Need comprehensive filtering for subscriptions, vouchers
8. **ALL CAPS is common**: Automatic title casing improves UX
9. **Timeouts happen**: Some sites are just too slow - that's okay
10. **Incremental progress**: Better to save frequently than lose work

### Success Metrics

- ✅ Can scrape 34/40 wineries successfully (85%)
- ✅ Average 14.2 wines per winery
- ✅ 95%+ have variety detected
- ✅ 90%+ have vintage detected
- ✅ 100% have valid prices
- ✅ Working filters in frontend
- ✅ Full API documentation
- ✅ Committed to Git regularly
- ✅ **483 wines aggregated from Canberra region!**

### Git Repository

- Repo: https://github.com/buzzmooau/CBRWineHunter
- Branch: dev (all work happens here)
- Recent major commits:
  - Initial project structure
  - Winery API and frontend display
  - Wine scraper and display with filters
  - Enhanced scraper with 166 wines from 11 wineries
  - Bot detection and timeout improvements
  - Advanced filtering and name cleanup
  - **483 wines from 34 wineries! (Ready to commit)**

---

## Quick Start for Next Session

1. SSH into CT 401: `pct enter 401`
2. Start backend: `cd /opt/CBRWineHunter/backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. Start frontend (new terminal): `cd /opt/CBRWineHunter/frontend && npm run dev`
4. Test next winery: `python test_enhanced_scraper.py <winery_id>`
5. View results: http://192.168.50.121:5173/wines

**Remaining Wineries to Scrape:** Gallagher (11), Kyeema (16), Lark Hill (18), Norton Road (26), Sassafras (32)

Happy scraping! 🍷
