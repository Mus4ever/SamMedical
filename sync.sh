#!/usr/bin/env bash
# ============================================================
# sync.sh — one-shot git sync (add + commit + pull --rebase + push)
#
# Usage:
#   ./sync.sh "your commit message"
#
# Examples:
#   ./sync.sh "Layer 3 complete"
#   ./sync.sh "Fixed login validation"
#
# Run with Git Bash on Windows or any bash on Linux/macOS.
# ============================================================

set -e

MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "ERROR: commit message is required."
  echo "Usage: ./sync.sh \"your message\""
  exit 1
fi

echo ""
echo "==> Current changes:"
git status --short

if [ -z "$(git status --porcelain)" ]; then
  echo ""
  echo "Nothing to commit. Working tree is clean."
  echo "Pulling latest from remote anyway..."
  git pull --rebase
  exit 0
fi

# Safety: refuse to commit any .env file (except .env.example)
if git status --porcelain | grep -E '\.env(\s|$)' | grep -v '\.env\.example' >/dev/null; then
  echo ""
  echo "❌ ERROR: .env files about to be committed!"
  git status --porcelain | grep -E '\.env(\s|$)' | grep -v '\.env\.example'
  echo ""
  echo "These contain secrets — never push them."
  exit 1
fi

echo ""
echo "==> Staging all changes..."
git add .

echo ""
echo "==> Committing: $MESSAGE"
git commit -m "$MESSAGE"

echo ""
echo "==> Pulling latest from origin (rebase)..."
if ! git pull --rebase; then
  echo ""
  echo "❌ Rebase failed (probably a conflict)."
  echo "Resolve manually then run: git rebase --continue && git push"
  exit 1
fi

echo ""
echo "==> Pushing to GitHub..."
git push

echo ""
echo "✅ Done! Changes are live at https://github.com/Mus4ever/SamMedical"
