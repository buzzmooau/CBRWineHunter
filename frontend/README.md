# CBR Wine Hunter - Frontend

React frontend application for the CBR Wine Hunter project.

## Features

- Wine search and filtering interface
- Interactive map of Canberra wineries
- Responsive design for mobile and desktop
- Real-time wine availability

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet + React-Leaflet

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── WineCard.jsx
│   │   ├── WineFilter.jsx
│   │   ├── WineryMarker.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── WineDetailPage.jsx
│   │   ├── MapPage.jsx
│   │   ├── WineryPage.jsx
│   │   └── AdminPage.jsx
│   ├── services/           # API service functions
│   │   ├── api.js
│   │   ├── wineService.js
│   │   └── wineryService.js
│   ├── hooks/              # Custom React hooks
│   │   ├── useWines.js
│   │   └── useWineries.js
│   ├── utils/              # Utility functions
│   │   └── helpers.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   └── favicon.ico
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Development

### Running the Dev Server

The development server includes:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Automatic error overlay

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Code Style

This project uses:
- ESLint for code linting
- Tailwind CSS for styling (utility-first)

### Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript for type checking
- Follow the single responsibility principle

## Styling with Tailwind CSS

This project uses Tailwind CSS for styling. Common classes:

```jsx
// Container
<div className="container mx-auto px-4">

// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Button
<button className="bg-wine-burgundy text-white px-4 py-2 rounded hover:bg-wine-deep-red">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Custom Theme Colors

Defined in `tailwind.config.js`:

- `wine-burgundy` - Primary burgundy color
- `wine-deep-red` - Deep red accent
- `wine-rose` - Rose pink
- `wine-gold` - Gold accent
- `wine-cream` - Cream background
- `wine-charcoal` - Dark gray text

## Routing

The app uses React Router for navigation:

- `/` - Home page with wine search
- `/wine/:id` - Wine detail page
- `/winery/:slug` - Winery detail page
- `/map` - Interactive map
- `/admin` - Admin dashboard (protected)

## API Integration

All API calls go through the `services/` directory:

```javascript
import { getWines, getWineById } from './services/wineService';

// In component
const wines = await getWines({ variety: 'Shiraz', maxPrice: 30 });
const wine = await getWineById(123);
```

## State Management

This project uses React Context and hooks for state management. No external library like Redux is needed for the initial version.

## Map Integration

The map uses Leaflet with React-Leaflet:

```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[-35.2809, 149.1300]} zoom={10}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  <Marker position={[-35.2809, 149.1300]}>
    <Popup>Winery Name</Popup>
  </Marker>
</MapContainer>
```

## Environment Variables

Available environment variables:

- `VITE_API_URL` - Backend API URL (required)

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in `dist/`:

- Minified JavaScript and CSS
- Code splitting for better performance
- Asset optimization
- Tree shaking to remove unused code

## Deployment

The `dist/` folder can be deployed to:

- Static hosting (Netlify, Vercel, GitHub Pages)
- Your own web server with Nginx
- Docker container

For Nginx deployment, serve the `dist/` folder and configure:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Troubleshooting

### Port Already in Use

If port 5173 is in use:
```bash
npm run dev -- --port 3000
```

### API Connection Issues

Check that:
1. Backend is running
2. `VITE_API_URL` is correct in `.env`
3. CORS is configured on backend

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Performance Optimization

- Use lazy loading for routes
- Optimize images
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Testing

(Testing setup to be added in future)

```bash
npm run test
```

## Contributing

When adding new features:
1. Create a new branch
2. Follow component structure
3. Use Tailwind for styling
4. Test on mobile and desktop
5. Run linter before committing

## License

MIT License - See LICENSE file in root directory
