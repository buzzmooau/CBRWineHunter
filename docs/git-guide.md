# Git Setup Guide for CBR Wine Hunter

## Step 1: Install Git (if not already installed)

Check if Git is installed:
```bash
git --version
```

If not installed:
```bash
sudo apt update
sudo apt install git -y
```

## Step 2: Configure Git with Your Identity

This tells Git who you are (shows up in commits):

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

**Important:** Use the same email as your GitHub account!

Check it worked:
```bash
git config --global --list
```

## Step 3: Set Up VS Code as Your Git Editor (Optional but Recommended)

```bash
git config --global core.editor "code --wait"
```

## Step 4: Create a Directory for Your Project

```bash
cd ~                          # Go to your home directory
mkdir -p Projects             # Create a Projects folder
cd Projects                   # Enter it
```

## Step 5: Clone Your GitHub Repository

This downloads your empty repo from GitHub to your computer:

```bash
git clone https://github.com/buzzmooau/CBRWineHunter.git
cd CBRWineHunter
```

You should now see:
```bash
~/Projects/CBRWineHunter$ 
```

Check the connection:
```bash
git remote -v
```

You should see:
```
origin  https://github.com/buzzmooau/CBRWineHunter.git (fetch)
origin  https://github.com/buzzmooau/CBRWineHunter.git (push)
```

## Step 6: Create a Development Branch

We'll keep `main` for stable releases and work on a `dev` branch:

```bash
git checkout -b dev
```

This creates and switches to a new branch called `dev`.

Check which branch you're on:
```bash
git branch
```

You should see:
```
* dev
  main
```

The `*` shows you're currently on `dev`.

## Step 7: Open the Project in VS Code

```bash
code .
```

This opens VS Code in your project directory.

---

## Basic Git Workflow You'll Use

### The Typical Cycle:

1. **Make changes** to files in VS Code
2. **Check what changed**:
   ```bash
   git status
   ```
3. **Stage files** (prepare them for commit):
   ```bash
   git add .                    # Add all changes
   # OR
   git add path/to/file.py     # Add specific file
   ```
4. **Commit** (save the changes):
   ```bash
   git commit -m "Brief description of what you did"
   ```
5. **Push** to GitHub (upload your saves):
   ```bash
   git push origin dev
   ```

### Example Workflow:

```bash
# You've added some files that Claude created
git status                                    # See what changed
git add .                                     # Stage all changes
git commit -m "[init] Add project structure"  # Save with message
git push origin dev                           # Upload to GitHub
```

---

## VS Code Git Integration (Easier Way!)

VS Code has a visual interface for Git:

### Left Sidebar - Source Control Icon:
1. Click the branch icon (third from top)
2. You'll see all changed files
3. Click `+` next to a file to stage it (or `+` next to "Changes" to stage all)
4. Type your commit message in the box at the top
5. Click the checkmark ✓ to commit
6. Click the three dots `...` → "Push" to upload to GitHub

### Bottom Left - Branch Name:
- Shows current branch (should say `dev`)
- Click it to switch branches

---

## Essential Git Commands Cheat Sheet

### Checking Status:
```bash
git status                    # What's changed?
git log --oneline            # Recent commits
git branch                   # List branches
```

### Making Changes:
```bash
git add filename             # Stage specific file
git add .                    # Stage all changes
git commit -m "message"      # Commit with message
git push origin dev          # Push to GitHub
```

### Getting Updates:
```bash
git pull origin dev          # Download latest from GitHub
```

### Branching:
```bash
git checkout -b feature-name    # Create new branch
git checkout dev                # Switch to dev branch
git branch -d feature-name      # Delete branch (when done)
```

### Undo Things (Be Careful!):
```bash
git restore filename         # Discard changes to file
git restore --staged filename # Unstage file
git reset --soft HEAD~1      # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (delete changes!)
```

---

## Our Project Git Strategy (Simplified)

Since this is your first project, let's keep it simple:

### Two Branches:
- **`main`** - Only working, tested code (production-ready)
- **`dev`** - Your active development (where you work)

### Workflow:
1. Always work on `dev` branch
2. Make commits as you complete features
3. When something is tested and working, merge to `main`
4. Push both branches to GitHub

### When to Commit:
✅ **Good times to commit:**
- Added a new feature that works
- Fixed a bug
- Completed a logical unit of work
- End of coding session (even if not finished)

❌ **Bad times to commit:**
- Code doesn't run at all
- In the middle of typing a function

### Commit Message Format:

We'll use this format:
```
[component] What you did

Examples:
[backend] Add wine model and database schema
[frontend] Create wine search component
[scraper] Implement Shopify scraper
[docs] Update setup instructions
[fix] Fix price extraction bug
[config] Update database connection settings
```

---

## GitHub Desktop (Optional Alternative)

If you find the command line confusing, you can use **GitHub Desktop**:
- Visual interface for Git
- Easier for beginners
- Download: https://desktop.github.com/

But VS Code's Git integration is excellent, so try that first!

---

## Common Scenarios You'll Encounter

### Scenario 1: You Made Changes, Want to Save Them

```bash
git add .
git commit -m "[backend] Add new scraper function"
git push origin dev
```

### Scenario 2: You Want to See What You Changed

```bash
git status              # List changed files
git diff               # See exact changes
git diff filename      # See changes in specific file
```

### Scenario 3: You Messed Up and Want to Start Over

```bash
git status                    # See what changed
git restore filename          # Discard changes to one file
git restore .                 # Discard ALL changes (careful!)
```

### Scenario 4: You're Ready to Move Code from dev to main

```bash
git checkout main             # Switch to main branch
git merge dev                 # Merge dev into main
git push origin main          # Push to GitHub
git checkout dev              # Switch back to dev
```

### Scenario 5: You Want to Pull Claude's Latest Updates

When I create files for you, you'll:
1. Download them from Claude's outputs
2. Copy into your local repo folder
3. Then:
```bash
git add .
git commit -m "[feature] Add Claude's new code"
git push origin dev
```

---

## Git Ignore File

Some files should NEVER be committed to Git:
- Passwords and secrets
- Database files
- Log files
- Temporary files

We'll create a `.gitignore` file that tells Git to ignore these.

---

## Troubleshooting

### "Permission denied" when pushing:
You might need to set up GitHub authentication:
```bash
gh auth login
```
Or use SSH keys (we can set this up if needed).

### "Your branch is behind":
Someone (or you on another machine) pushed changes:
```bash
git pull origin dev
```

### "Merge conflict":
Two versions of the same file conflict. We'll handle this together when it happens.

### "Detached HEAD state":
You accidentally checked out a commit instead of a branch:
```bash
git checkout dev    # Get back to safety
```

---

## Your First Git Actions

Once you've cloned the repo and I've created the initial files:

1. **Check you're on dev branch**:
   ```bash
   git branch
   ```
   If not on `dev`, switch:
   ```bash
   git checkout -b dev
   ```

2. **Copy my files into your repo folder**

3. **Check status**:
   ```bash
   git status
   ```
   You should see all the new files listed in red.

4. **Stage all files**:
   ```bash
   git add .
   ```

5. **Check status again**:
   ```bash
   git status
   ```
   Files should now be green.

6. **Commit**:
   ```bash
   git commit -m "[init] Initial project structure"
   ```

7. **Push to GitHub**:
   ```bash
   git push origin dev
   ```

8. **Check GitHub**:
   Go to https://github.com/buzzmooau/CBRWineHunter
   You should see your files!

---

## Learning Resources

- **GitHub's Official Guide**: https://docs.github.com/en/get-started
- **Interactive Git Tutorial**: https://learngitbranching.js.org/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

## What to Do When You Get Stuck

1. **Don't panic!** Git rarely destroys your work
2. **Check status**: `git status`
3. **Copy the error message** and send it to me
4. **I'll help you fix it**

Git can seem confusing at first, but you'll get the hang of it quickly. The key is to commit often!

---

## Ready to Start?

Once you've completed Steps 1-7 above, let me know and I'll create all the initial project files for you!
