# Your First Commit - Step by Step Guide

This guide walks you through making your first commit to the CBR Wine Hunter project.

## Prerequisites

- [ ] Git installed and configured
- [ ] GitHub account connected
- [ ] VS Code installed
- [ ] Repository cloned to `~/Projects/CBRWineHunter`

## Step 1: Verify Git is Configured

Open a terminal and run:

```bash
git config --global user.name
git config --global user.email
```

If empty, configure now:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Use the same email as your GitHub account!

## Step 2: Navigate to Your Local Repository

```bash
cd ~/Projects/CBRWineHunter
```

## Step 3: Check Current Status

```bash
git status
```

You should see you're on the `main` branch (or `master`).

## Step 4: Create Development Branch

```bash
git checkout -b dev
```

This creates and switches to a new `dev` branch.

## Step 5: Copy the Project Files

You now need to copy all the files from Claude's output into your repository.

**Option A: Manual Copy**

Download files from Claude's outputs and copy them into your `~/Projects/CBRWineHunter/` directory, preserving the structure.

**Option B: Command Line Copy (if files are in a location)**

```bash
# Example if files are in Downloads/cbr-wine-hunter-initial
cp -r ~/Downloads/cbr-wine-hunter-initial/* ~/Projects/CBRWineHunter/
```

## Step 6: Verify Files Were Copied

```bash
ls -la
```

You should see:
- README.md
- LICENSE
- .gitignore
- .env.example
- backend/
- frontend/
- scripts/
- docs/
- SPECS.md

## Step 7: Check Git Status Again

```bash
git status
```

You should see a long list of "Untracked files" in red.

## Step 8: Stage All Files

### Option A: Using VS Code (Recommended)

1. Open VS Code: `code .`
2. Click the Source Control icon in the left sidebar (3rd icon, looks like a branch)
3. You'll see all new files under "Changes"
4. Click the `+` button next to "Changes" to stage all files
5. All files should now be under "Staged Changes"

### Option B: Using Command Line

```bash
git add .
```

## Step 9: Verify Files Are Staged

```bash
git status
```

All files should now be green and listed under "Changes to be committed".

## Step 10: Commit the Changes

### Option A: Using VS Code

1. In the Source Control panel, find the message box at the top
2. Type: `[init] Initial project structure`
3. Click the checkmark ✓ button (or press Ctrl+Enter)

### Option B: Using Command Line

```bash
git commit -m "[init] Initial project structure"
```

## Step 11: Verify Commit Was Made

```bash
git log --oneline
```

You should see your commit with the message "[init] Initial project structure".

## Step 12: Push to GitHub

### Option A: Using VS Code

1. In the Source Control panel, click the three dots `...` menu
2. Select "Push"
3. If prompted about upstream branch, select "OK" or "Push"

### Option B: Using Command Line

```bash
git push origin dev
```

If this is your first push, you might need:

```bash
git push -u origin dev
```

## Step 13: Verify on GitHub

1. Open your browser
2. Go to: https://github.com/buzzmooau/CBRWineHunter
3. You should see your files!
4. Switch to the `dev` branch using the branch dropdown

## Step 14: Celebrate! 🎉

You've made your first commit to the CBR Wine Hunter project!

## What Just Happened?

1. You created a `dev` branch (your working branch)
2. You added all the initial project files
3. You committed them with a descriptive message
4. You pushed them to GitHub
5. Your project is now backed up in the cloud

## Next Steps

Now you can:
1. Merge `dev` into `main` when you're ready (after testing)
2. Continue development on the `dev` branch
3. Make more commits as you add features

## Common Questions

**Q: Should I commit to `main` or `dev`?**
A: Always work on `dev`. Only merge to `main` when things are tested and working.

**Q: How often should I commit?**
A: Commit whenever you complete a logical unit of work. Could be several times a day!

**Q: What if I make a mistake?**
A: Don't worry! Git makes it hard to lose work. Just ask Claude for help.

**Q: Can I see what changed before committing?**
A: Yes! Use `git diff` or click on files in VS Code to see changes.

## Quick Reference

```bash
# See what changed
git status

# Stage all changes
git add .

# Commit
git commit -m "Your message here"

# Push to GitHub
git push origin dev

# See commit history
git log --oneline

# Switch branches
git checkout branch-name

# Create new branch
git checkout -b new-branch-name
```

## If Something Goes Wrong

**Staged wrong files?**
```bash
git restore --staged filename  # Unstage one file
git restore --staged .         # Unstage everything
```

**Want to undo last commit (keep changes)?**
```bash
git reset --soft HEAD~1
```

**Want to see what you're about to commit?**
```bash
git diff --staged
```

## Getting Help

If you get stuck:
1. Don't panic!
2. Copy the error message
3. Send it to Claude
4. Claude will help you fix it

---

Remember: Git is like a save game system. You can always go back!

Good luck with your first commit! 🚀
