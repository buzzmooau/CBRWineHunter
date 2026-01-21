# CBR Wine Hunter - Admin Dashboard

Admin interface for managing wines in the CBR Wine Hunter database.

## Features

- 🔐 HTTP Basic Authentication
- 📋 Wine list with search and filters
- ➕ Add new wines
- ✏️ Edit existing wines
- 🗑️ Delete wines
- 📱 Responsive design

## Setup

### Prerequisites

- Node.js 20+
- Backend API running at http://192.168.50.121:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The admin dashboard will be available at: http://192.168.50.121:5174

### Build for Production

```bash
npm run build
```

## Configuration

Edit `.env` to change the API URL:

```
VITE_API_URL=http://192.168.50.121:8000/api
```

## Usage

1. Navigate to http://192.168.50.121:5174
2. Login with your admin credentials
3. Manage wines from the dashboard

### Default Routes

- `/admin/login` - Login page
- `/admin/wines` - Wine list
- `/admin/wines/new` - Add new wine
- `/admin/wines/:id/edit` - Edit wine

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios

## Authentication

The dashboard uses HTTP Basic Authentication. Credentials are stored in sessionStorage and sent with each API request.

## API Endpoints Used

- `GET /api/wines/` - List wines
- `GET /api/wines/{id}` - Get wine details
- `POST /api/admin/wines` - Create wine
- `PUT /api/admin/wines/{id}` - Update wine
- `DELETE /api/admin/wines/{id}` - Delete wine
- `GET /api/wineries/` - List wineries

## Features

### Wine List
- Search by name
- Filter by winery
- Filter by variety
- View wine details
- Edit and delete actions

### Wine Form
- Select winery from dropdown
- Enter wine details (name, variety, vintage, price)
- Optional fields: description, URLs, alcohol content, bottle size
- Availability toggle
- Form validation

### Authentication
- Session-based login
- Protected routes
- Automatic redirect to login if not authenticated
- Logout functionality

## Development

### Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminWines.jsx
│   │   └── WineForm.jsx
│   ├── services/
│   │   └── adminService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Key Components

**AuthContext**: Manages authentication state and credentials
**ProtectedRoute**: Wrapper for routes requiring authentication
**AdminService**: API client for wine operations
**AdminLogin**: Login form with HTTP Basic Auth
**AdminWines**: Wine list with filters and actions
**WineForm**: Add/edit wine form with validation

## License

MIT
