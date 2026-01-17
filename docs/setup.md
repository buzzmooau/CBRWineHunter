# CBR Wine Hunter - Setup Guide

Complete guide to setting up the CBR Wine Hunter development environment.

## Prerequisites

- Proxmox VE server with LXC support
- Debian 12 LXC templates downloaded
- Basic command line knowledge
- Git installed on your development machine

## Architecture Overview

The project uses a two-container architecture:

```
┌──────────────────────────────────────────┐
│         LXC Container 200 (DB)           │
│          PostgreSQL 15                   │
│      IP: 192.168.1.200 (example)         │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│       LXC Container 201 (App)            │
│   Python 3.11 + Node.js 20               │
│   FastAPI Backend + React Frontend       │
│      IP: 192.168.1.201 (example)         │
└──────────────────────────────────────────┘
```

## Step 1: Database Container Setup

### 1.1 Create PostgreSQL LXC Container

On your Proxmox host, run:

```bash
cd /path/to/CBRWineHunter/scripts/setup
chmod +x setup-lxc-db.sh

# Edit the script to set your network configuration
nano setup-lxc-db.sh

# Run the setup
./setup-lxc-db.sh
```

**Important**: Edit these variables in the script before running:
- `CT_ID` - Choose an available container ID
- `IP_ADDRESS` - Set to match your network
- `GATEWAY` - Set your network gateway
- `PASSWORD` - Set a secure root password

### 1.2 Secure the Database

Enter the database container:

```bash
pct enter 200  # Use your container ID
```

Change the database password:

```bash
su - postgres
psql
ALTER USER wineuser WITH PASSWORD 'your_very_secure_password';
\q
exit
```

### 1.3 Apply Database Schema

Copy the schema file to the container:

```bash
# On Proxmox host
pct push 200 schema.sql /tmp/schema.sql
```

Enter the container and apply schema:

```bash
pct enter 200
su - postgres
psql -d cbr_wine_hunter -f /tmp/schema.sql
\q
exit
```

Verify tables were created:

```bash
su - postgres
psql -d cbr_wine_hunter -c "\dt"
```

You should see all the tables (wineries, wines, scraper_configs, etc.)

## Step 2: Application Container Setup

### 2.1 Create Application LXC Container

On your Proxmox host, run:

```bash
cd /path/to/CBRWineHunter/scripts/setup
chmod +x setup-lxc-app.sh

# Edit the script to set your network configuration
nano setup-lxc-app.sh

# Run the setup
./setup-lxc-app.sh
```

### 2.2 Clone the Repository

Enter the application container:

```bash
pct enter 201  # Use your container ID
```

Clone the repository:

```bash
cd /opt
git clone https://github.com/buzzmooau/CBRWineHunter.git
cd CBRWineHunter
```

## Step 3: Backend Setup

### 3.1 Create Python Virtual Environment

```bash
cd /opt/CBRWineHunter/backend
python3 -m venv venv
source venv/bin/activate
```

### 3.2 Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3 Install Playwright Browsers

```bash
playwright install chromium
```

### 3.4 Configure Environment

Create `.env` file:

```bash
cd /opt/CBRWineHunter
cp .env.example .env
nano .env
```

Update these critical values:

```bash
# Database connection
DATABASE_URL=postgresql://wineuser:your_secure_password@192.168.1.200:5432/cbr_wine_hunter

# Generate a secret key
SECRET_KEY=$(openssl rand -hex 32)

# Other settings
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development
```

### 3.5 Test Database Connection

```bash
cd /opt/CBRWineHunter/backend
source venv/bin/activate
python3 -c "from app.database import engine; print(engine.connect())"
```

If successful, you should see a connection object.

### 3.6 Run the Backend

```bash
cd /opt/CBRWineHunter/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Test the API:

```bash
# From another terminal
curl http://192.168.1.201:8000
```

You should see a JSON response with status "healthy".

## Step 4: Frontend Setup

### 4.1 Install Node Dependencies

In a new terminal, enter the container:

```bash
pct enter 201
cd /opt/CBRWineHunter/frontend
npm install
```

### 4.2 Configure Frontend Environment

Create frontend `.env` file:

```bash
cd /opt/CBRWineHunter/frontend
nano .env
```

Add:

```bash
VITE_API_URL=http://192.168.1.201:8000/api
```

### 4.3 Run the Frontend

```bash
npm run dev
```

The frontend will be available at: http://192.168.1.201:5173

## Step 5: Verify Everything Works

### 5.1 Test Backend

Open browser to: `http://192.168.1.201:8000/docs`

You should see the FastAPI Swagger documentation.

### 5.2 Test Frontend

Open browser to: `http://192.168.1.201:5173`

You should see the CBR Wine Hunter homepage and "Connected!" status.

### 5.3 Test Database

In the app container:

```bash
psql -h 192.168.1.200 -U wineuser -d cbr_wine_hunter
```

Enter the password when prompted. You should connect successfully.

```sql
\dt  -- List tables
\q   -- Quit
```

## Development Workflow

### Starting the Services

**Terminal 1 - Backend:**
```bash
pct enter 201
cd /opt/CBRWineHunter/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
pct enter 201
cd /opt/CBRWineHunter/frontend
npm run dev
```

### Stopping the Services

Press `Ctrl+C` in each terminal.

## Common Issues and Solutions

### Issue: Can't connect to database

**Solution:**
1. Check PostgreSQL is running: `pct exec 200 systemctl status postgresql`
2. Verify IP address is correct in DATABASE_URL
3. Check firewall rules allow connections
4. Verify pg_hba.conf allows connections from app container

### Issue: Playwright fails to launch browser

**Solution:**
```bash
playwright install chromium
apt-get install -y libgbm1 libasound2
```

### Issue: Frontend can't reach backend

**Solution:**
1. Check backend is running
2. Verify VITE_API_URL in frontend/.env
3. Check CORS settings in backend config

### Issue: Permission denied errors

**Solution:**
```bash
chown -R root:root /opt/CBRWineHunter
chmod +x scripts/setup/*.sh
```

## Next Steps

Now that your environment is set up:

1. ✅ **Read** [API Documentation](api.md)
2. ✅ **Import** winery data (see scripts/data/)
3. ✅ **Configure** scraper configs for wineries
4. ✅ **Test** scraping a few wineries
5. ✅ **Build** frontend components

## Backup and Restore

### Backup Database

```bash
pct exec 200 -- su - postgres -c "pg_dump cbr_wine_hunter > /tmp/backup.sql"
pct pull 200 /tmp/backup.sql ./backup.sql
```

### Restore Database

```bash
pct push 200 ./backup.sql /tmp/backup.sql
pct exec 200 -- su - postgres -c "psql cbr_wine_hunter < /tmp/backup.sql"
```

## Security Checklist

- [ ] Changed default root passwords on both containers
- [ ] Changed database password from default
- [ ] Generated strong SECRET_KEY for API
- [ ] Configured firewall rules
- [ ] PostgreSQL only accepts connections from app container
- [ ] No sensitive data in .env files (use .env, not .env.example)
- [ ] .env files are in .gitignore

## Support

If you encounter issues:
1. Check the logs in `/var/log/`
2. Review the [Project Specifications](../SPECS.md)
3. Check GitHub issues
4. Review the backend and frontend README files

## Production Deployment

See [Deployment Guide](deployment.md) for production setup instructions.
