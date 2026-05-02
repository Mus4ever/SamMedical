#!/usr/bin/env bash
# ============================================================
# One-shot git setup for the SamMedical project.
# Run this from Git Bash inside the SamMedical folder.
#
# What it does:
#   1. Removes any stale .git from the sandbox
#   2. git init (main branch)
#   3. Configures author (name + email)
#   4. Adds the GitHub remote (SSH)
#   5. Stages everything respecting .gitignore
#   6. Creates the first commit
#   7. Pushes to origin/main
#
# Usage:
#   cd "C:/Users/Gaming/OneDrive/Bureau/SamMedical"
#   bash setup-git.sh
# ============================================================

set -e

REPO_URL="git@github.com:Mus4ever/SamMedical.git"
AUTHOR_NAME="Abdenour Benkorich"
AUTHOR_EMAIL="fiikra.studio@gmail.com"

echo "==> Cleaning any stale .git folder..."
rm -rf .git

echo "==> Initializing git repo..."
git init -b main

echo "==> Configuring author..."
git config user.name  "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"

echo "==> Adding remote: $REPO_URL"
git remote add origin "$REPO_URL"

echo "==> Staging files..."
git add .

echo "==> Creating first commit..."
git commit -m "Initial commit: project skeleton + auth backend (Layers 1-2)

- Folder layout (backend, frontend, database)
- PostgreSQL schema (4 tables, 8 indexes, updated_at trigger)
- Seed admin user with real bcrypt hash (password: Admin@1234)
- Backend deps: Express, Supabase JS, Twilio, Resend, bcrypt, JWT
- Backend Layer 2: env validator, db pool, auth middleware,
  error handler, login/me/change-password endpoints, hash-password CLI
- Frontend skeleton: Vite + React + Tailwind + i18next config
- PWA manifest, .gitignore, README, full Supabase setup guide"

echo "==> Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Repo is live at https://github.com/Mus4ever/SamMedical"
