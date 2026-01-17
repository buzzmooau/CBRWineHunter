# CBR Wine Hunter - Quick Start

This is your **roadmap** to getting the CBR Wine Hunter project up and running.

## 📋 What You Have

Claude has created a complete initial project structure for you with:

- ✅ Backend skeleton (FastAPI with Python)
- ✅ Frontend skeleton (React with Vite + Tailwind)
- ✅ Database schema (PostgreSQL)
- ✅ LXC setup scripts
- ✅ Configuration files
- ✅ Documentation

## 🎯 Your Mission

Get this project running on your Proxmox infrastructure so you can start building features.

## 🗺️ The Journey (3-Hour Setup)

### Part 1: Git & GitHub (30 minutes)

**Goal**: Get the code into your local repository

1. **Read**: `docs/git-guide.md` - Learn Git basics
2. **Setup**: Configure Git on your machine
3. **Clone**: Your GitHub repository
4. **Copy**: All files from this package into your repo
5. **Commit**: Your first commit!
6. **Push**: To GitHub

**Guide**: `FIRST_COMMIT_GUIDE.md`

### Part 2: LXC Containers (1 hour)

**Goal**: Create database and application containers

1. **Database Container**: Run `scripts/setup/setup-lxc-db.sh`
   - PostgreSQL 15 installed
   - Database created
   - Password secured

2. **App Container**: Run `scripts/setup/setup-lxc-app.sh`
   - Python 3.11 installed
   - Node.js 20 installed
   - Ready for development

**Guide**: `docs/setup.md` (Steps 1-2)

### Part 3: Backend Setup (45 minutes)

**Goal**: Get the API running

1. Clone repository into app container
2. Create Python virtual environment
3. Install dependencies
4. Configure `.env` file
5. Apply database schema
6. Start the backend
7. Test at `/docs`

**Guide**: `docs/setup.md` (Step 3)

### Part 4: Frontend Setup (30 minutes)

**Goal**: Get the web interface running

1. Install Node dependencies
2. Configure frontend `.env`
3. Start the development server
4. See it in your browser!

**Guide**: `docs/setup.md` (Step 4)

### Part 5: Verification (15 minutes)

**Goal**: Confirm everything works

1. Backend accessible
2. Frontend accessible
3. They can talk to each other
4. Database connection works

**Guide**: `docs/setup.md` (Step 5)

## 📚 Key Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| `FIRST_COMMIT_GUIDE.md` | Make your first Git commit | RIGHT NOW |
| `docs/git-guide.md` | Learn Git basics | Before committing |
| `docs/setup.md` | Complete setup instructions | During setup |
| `SETUP_CHECKLIST.md` | Track your progress | During setup |
| `SPECS.md` | Full project specifications | After setup |
| `README.md` | Project overview | Anytime |

## 🎬 Start Here

**Your first three steps:**

1. **Read** `docs/git-guide.md` (Steps 1-7)
2. **Complete** `FIRST_COMMIT_GUIDE.md`
3. **Follow** `docs/setup.md`

Use `SETUP_CHECKLIST.md` to track your progress!

## 🆘 Common Questions

**Q: Where should I start?**
A: Start with the Git setup and first commit. Get your code into GitHub first!

**Q: Do I need to do this all in one sitting?**
A: No! You can take breaks. Git saves your progress.

**Q: What if I get stuck?**
A: Check the documentation, search for the error, or ask Claude for help.

**Q: Can I change the IP addresses in the scripts?**
A: Yes! You SHOULD change them to match your network.

**Q: What if I don't have Proxmox?**
A: You can adapt this to run on any Linux system. The core code is portable.

## ⚡ Quick Commands Reference

**Git**
```bash
git status                    # See what changed
git add .                     # Stage all changes
git commit -m "message"       # Save changes
git push origin dev           # Upload to GitHub
```

**Backend**
```bash
source venv/bin/activate      # Enter Python environment
uvicorn app.main:app --reload # Start backend
```

**Frontend**
```bash
npm run dev                   # Start frontend
```

**Database**
```bash
psql -h IP -U wineuser -d cbr_wine_hunter  # Connect to database
```

## 🎯 Success Looks Like

You'll know setup is complete when:

1. ✅ Your code is on GitHub
2. ✅ Backend shows Swagger docs at `/docs`
3. ✅ Frontend shows "Connected!" message
4. ✅ You can query the database
5. ✅ No error messages anywhere

## 🚀 After Setup

Once everything is running, you'll:

1. Import the 40 wineries from the Excel file
2. Create scraper configurations
3. Test scraping a few wineries
4. Build the wine search interface
5. Add the interactive map
6. Keep building features!

## 💡 Pro Tips

- **Save often**: Commit your changes frequently
- **Read error messages**: They usually tell you what's wrong
- **Test incrementally**: Don't change too much at once
- **Use the checklist**: It helps you stay organized
- **Ask for help**: Claude is here to assist!

## 📞 Getting Help

If something doesn't work:

1. **Check the error message** - Read it carefully
2. **Check the docs** - Specific section for your issue
3. **Check the checklist** - Did you miss a step?
4. **Search online** - Someone probably had this error
5. **Ask Claude** - Copy/paste the error message

## 🎉 Ready?

Take a deep breath. You've got this!

**Start with**: `docs/git-guide.md` Steps 1-7

Then come back and follow `FIRST_COMMIT_GUIDE.md`

Good luck! 🍷

---

*Remember: Every developer was a beginner once. Taking it step-by-step is the way to go!*
