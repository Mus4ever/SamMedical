# ============================================================
# One-shot git setup for the SamMedical project (PowerShell).
# Run this from PowerShell inside the SamMedical folder.
#
# Usage:
#   cd "C:\Users\Gaming\OneDrive\Bureau\SamMedical"
#   .\setup-git.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$RepoUrl     = "git@github.com:Mus4ever/SamMedical.git"
$AuthorName  = "Abdenour Benkorich"
$AuthorEmail = "fiikra.studio@gmail.com"

Write-Host "==> Cleaning any stale .git folder..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
}

Write-Host "==> Initializing git repo..." -ForegroundColor Cyan
git init -b main

Write-Host "==> Configuring author..." -ForegroundColor Cyan
git config user.name  $AuthorName
git config user.email $AuthorEmail

Write-Host "==> Adding remote: $RepoUrl" -ForegroundColor Cyan
git remote add origin $RepoUrl

Write-Host "==> Staging files..." -ForegroundColor Cyan
git add .

Write-Host "==> Creating first commit..." -ForegroundColor Cyan
$msg = @"
Initial commit: project skeleton + auth backend (Layers 1-2)

- Folder layout (backend, frontend, database)
- PostgreSQL schema (4 tables, 8 indexes, updated_at trigger)
- Seed admin user with real bcrypt hash (password: Admin@1234)
- Backend deps: Express, Supabase JS, Twilio, Resend, bcrypt, JWT
- Backend Layer 2: env validator, db pool, auth middleware,
  error handler, login/me/change-password endpoints, hash-password CLI
- Frontend skeleton: Vite + React + Tailwind + i18next config
- PWA manifest, .gitignore, README, full Supabase setup guide
"@
git commit -m $msg

Write-Host "==> Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Done! Repo is live at https://github.com/Mus4ever/SamMedical" -ForegroundColor Green
