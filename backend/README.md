# CBR Wine Hunter - Backend

FastAPI backend application for the CBR Wine Hunter project.

## Features

- RESTful API for wine and winery data
- Automated web scraping of winery websites
- PostgreSQL database integration
- Admin endpoints for management
- Scheduled daily scraping

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0
- **Scraping**: Playwright + BeautifulSoup4
- **Task Scheduling**: APScheduler

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

For development (includes testing tools):
```bash
pip install -r requirements-dev.txt
```

### 3. Install Playwright Browsers

```bash
playwright install chromium
```

### 4. Configure Environment

Copy the example environment file:
```bash
cp ../.env.example .env
```

Edit `.env` and set your database connection details.

### 5. Initialize Database

See `../scripts/setup/` for database setup scripts.

Run migrations:
```bash
alembic upgrade head
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

API Documentation (Swagger UI): http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database connection & session
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── winery.py
│   │   ├── wine.py
│   │   └── scraper.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── wines.py
│   │   ├── wineries.py
│   │   └── admin.py
│   ├── scrapers/            # Web scraping modules
│   │   ├── __init__.py
│   │   ├── base_scraper.py
│   │   ├── shopify_scraper.py
│   │   ├── wix_scraper.py
│   │   ├── generic_scraper.py
│   │   └── scheduler.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   ├── wine_service.py
│   │   ├── winery_service.py
│   │   └── geocoding_service.py
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── extraction.py
│       └── validation.py
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                   # Test suite
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

## Database Migrations

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Rollback migration

```bash
alembic downgrade -1
```

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## Development

### Code Formatting

Format code with Black:
```bash
black app/
```

Sort imports with isort:
```bash
isort app/
```

### Linting

```bash
flake8 app/
```

### Type Checking

```bash
mypy app/
```

## API Endpoints

### Public Endpoints

- `GET /api/wines` - Search and filter wines
- `GET /api/wines/{id}` - Get wine details
- `GET /api/wines/varieties` - List all varieties
- `GET /api/wines/vintages` - List all vintages
- `GET /api/wineries` - List all wineries
- `GET /api/wineries/{id}` - Get winery details
- `GET /api/wineries/{id}/wines` - Get wines for winery

### Admin Endpoints (Protected)

- `POST /api/admin/scrape/trigger` - Trigger manual scrape
- `GET /api/admin/scrape/logs` - View scrape logs
- `GET /api/admin/scrape/flagged` - View flagged products
- `PUT /api/admin/wines/{id}/approve` - Approve flagged wine
- `POST /api/admin/wineries` - Add new winery
- `PUT /api/admin/scraper-configs/{id}` - Update scraper config

See full API documentation at `/docs` when running the server.

## Scraper System

The scraper system uses a plugin architecture where each winery has a custom configuration.

### Running Manual Scrape

```bash
# From within the app
python -m app.scrapers.run_scraper --winery-id 1

# Or trigger via API
curl -X POST http://localhost:8000/api/admin/scrape/trigger
```

### Adding a New Winery Scraper

1. Add winery to database
2. Create scraper configuration in `scraper_configs` table
3. Test with manual trigger
4. Review flagged products
5. Adjust configuration as needed

## Troubleshooting

### Playwright Issues

If Playwright fails to launch browsers:
```bash
playwright install chromium
```

### Database Connection Issues

Check your DATABASE_URL in `.env`:
```
postgresql://username:password@host:port/database
```

### Import Errors

Make sure you're in the virtual environment:
```bash
source venv/bin/activate
```

## Environment Variables

See `../.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `API_PORT` - Port to run the API (default: 8000)
- `SECRET_KEY` - JWT secret key for authentication
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)

## Logging

Logs are written to:
- Console (stdout)
- File specified in `LOG_FILE` environment variable

Log format includes timestamp, level, and message.

## Contributing

When adding new features:
1. Create a new branch
2. Write tests
3. Update documentation
4. Run code formatting and linting
5. Submit for review

## License

MIT License - See LICENSE file in root directory
