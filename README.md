# CBR Wine Hunter

A web application that aggregates wine listings from 40+ Canberra Region wineries, making it easy to discover and compare wines across the region.

## Features

- 🍷 **Search & Filter**: Find wines by variety, vintage, price, and winery
- 🗺️ **Interactive Map**: Explore wineries on a map of the Canberra region
- 🔄 **Daily Updates**: Automatically scrapes winery websites for latest prices and new releases
- 📱 **Responsive Design**: Works beautifully on desktop and mobile

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, PostgreSQL
- **Frontend**: React 18, Vite, Tailwind CSS
- **Scraping**: Playwright, BeautifulSoup4
- **Maps**: Leaflet with OpenStreetMap

## Project Structure

```
CBRWineHunter/
├── backend/          # Python FastAPI backend & scraper
├── frontend/         # React frontend application
├── scripts/          # Setup and deployment scripts
├── docs/            # Documentation
└── data/            # Initial data files
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Git

### Setup

See [docs/setup.md](docs/setup.md) for detailed setup instructions.

**Quick version:**

1. Clone the repository
2. Set up database (see scripts/setup/)
3. Set up backend (see backend/README.md)
4. Set up frontend (see frontend/README.md)

## Development Status

This project is currently in active development.

- [x] Project structure
- [ ] Database setup
- [ ] Backend API
- [ ] Scraper framework
- [ ] Frontend interface
- [ ] Map integration
- [ ] Production deployment

## Documentation

- [Setup Guide](docs/setup.md) - Complete setup instructions
- [API Documentation](docs/api.md) - API endpoints and usage
- [Deployment Guide](docs/deployment.md) - Production deployment
- [Project Specifications](SPECS.md) - Detailed project specs

## Contributing

This is a personal hobby project, but suggestions and feedback are welcome!

## License

MIT License - See LICENSE file for details

## Contact

For questions or feedback, please open an issue on GitHub.

---

*Built with ❤️ for the Canberra wine community*
