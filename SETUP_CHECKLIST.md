# CBR Wine Hunter - Initial Setup Checklist

Use this checklist to track your progress through the initial setup.

## Phase 1: Git & GitHub Setup

- [ ] Git installed on local machine
- [ ] Git configured with name and email
- [ ] GitHub repository cloned to `~/Projects/CBRWineHunter`
- [ ] Development branch (`dev`) created
- [ ] VS Code installed and configured
- [ ] VS Code extensions installed (Python, ES7 React snippets)

## Phase 2: Get Initial Code

- [ ] Downloaded all files from Claude's outputs
- [ ] Copied files to local repository
- [ ] Reviewed project structure
- [ ] Made first commit: `[init] Initial project structure`
- [ ] Pushed to GitHub successfully
- [ ] Verified files appear on GitHub

## Phase 3: LXC Container Setup

### Database Container (PostgreSQL)

- [ ] Reviewed `scripts/setup/setup-lxc-db.sh`
- [ ] Updated network configuration (IP address, gateway)
- [ ] Chosen available container ID
- [ ] Run setup script
- [ ] Container created successfully
- [ ] PostgreSQL installed and running
- [ ] Database `cbr_wine_hunter` created
- [ ] User `wineuser` created
- [ ] Changed database password to secure value
- [ ] Copied schema.sql to container
- [ ] Applied database schema
- [ ] Verified tables created (`\dt` in psql)
- [ ] Tested connection from app container

### Application Container

- [ ] Reviewed `scripts/setup/setup-lxc-app.sh`
- [ ] Updated network configuration (IP address, gateway)
- [ ] Chosen available container ID
- [ ] Run setup script
- [ ] Container created successfully
- [ ] Python 3.11+ installed
- [ ] Node.js 20+ installed
- [ ] PostgreSQL client installed
- [ ] System dependencies for Playwright installed
- [ ] Application directory created at `/opt/CBRWineHunter`

## Phase 4: Backend Setup

- [ ] Entered application container
- [ ] Cloned GitHub repository to `/opt/CBRWineHunter`
- [ ] Created Python virtual environment
- [ ] Activated virtual environment
- [ ] Installed Python dependencies (`requirements.txt`)
- [ ] Installed Playwright browsers
- [ ] Created `.env` file from `.env.example`
- [ ] Updated DATABASE_URL with correct password and IP
- [ ] Generated SECRET_KEY
- [ ] Configured other environment variables
- [ ] Tested database connection
- [ ] Started backend with `uvicorn`
- [ ] Accessed API docs at `/docs`
- [ ] Health check endpoint working

## Phase 5: Frontend Setup

- [ ] Navigated to `/opt/CBRWineHunter/frontend`
- [ ] Ran `npm install`
- [ ] Created frontend `.env` file
- [ ] Set VITE_API_URL to backend address
- [ ] Started frontend with `npm run dev`
- [ ] Accessed frontend in browser
- [ ] Frontend shows "Connected!" status
- [ ] Verified API connection working

## Phase 6: Verification

- [ ] Backend running and accessible
- [ ] Frontend running and accessible
- [ ] Frontend can communicate with backend
- [ ] Database connection working
- [ ] No error messages in logs
- [ ] Both services restart without issues

## Phase 7: Documentation Review

- [ ] Read through `docs/setup.md`
- [ ] Read through `docs/git-guide.md`
- [ ] Read through `SPECS.md`
- [ ] Understand project structure
- [ ] Understand git workflow
- [ ] Bookmarked useful documentation

## Notes Section

Record any issues, IP addresses, passwords (securely!), or other important info:

```
Database Container IP: ___________________
App Container IP: ___________________
Database Password: (stored securely in password manager)
Backend URL: http://___________________:8000
Frontend URL: http://___________________:5173

Issues encountered:
1. 
2.
3.

Solutions applied:
1.
2.
3.
```

## Next Steps (After Checklist Complete)

- [ ] Import winery data from Excel file
- [ ] Create first scraper configuration
- [ ] Test scraping a single winery
- [ ] Review flagged products
- [ ] Start frontend development
- [ ] Create wine listing components

## Success Criteria

You've successfully completed setup when:

✅ You can access the backend API documentation
✅ You can access the frontend in your browser
✅ The frontend shows "Connected!" to the backend
✅ You can query the database from the app container
✅ All services restart without errors
✅ You've successfully committed and pushed to GitHub

---

**Congratulations!** Once this checklist is complete, you're ready to start building features! 🎉

## Getting Help

If you get stuck on any step:
1. Check the error message carefully
2. Review the relevant documentation
3. Search for the error online
4. Ask Claude for help with the specific error

Remember: It's normal to encounter issues during setup. Take your time and work through them systematically.
