# ============================================================
# sync.ps1 — one-shot git sync (add + commit + pull --rebase + push)
#
# Usage:
#   .\sync.ps1 "your commit message"
#
# Examples:
#   .\sync.ps1 "Layer 3 complete"
#   .\sync.ps1 "Fixed bug in login validation"
#
# What it does (in order):
#   1. Shows you what files changed
#   2. Stages everything (respecting .gitignore)
#   3. Commits with your message
#   4. Pulls latest from remote (rebase to avoid merge commits)
#   5. Pushes to GitHub
#
# Safety checks:
#   - Refuses to commit if .env files are accidentally staged
#   - Refuses if no message was given
#   - Stops on any error (won't silently push half-broken state)
# ============================================================

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Message
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "ERROR: commit message is required." -ForegroundColor Red
    Write-Host "Usage: .\sync.ps1 ""your message""" -ForegroundColor Yellow
    exit 1
}

# ---- 1. Show current state ----
Write-Host ""
Write-Host "==> Current changes:" -ForegroundColor Cyan
git status --short

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
    Write-Host ""
    Write-Host "Nothing to commit. Working tree is clean." -ForegroundColor Yellow
    Write-Host "Pulling latest from remote anyway..." -ForegroundColor Cyan
    git pull --rebase
    exit 0
}

# ---- 2. Safety: never commit .env files ----
$envFiles = git status --porcelain | Where-Object { $_ -match '\.env(\s|$)' -and $_ -notmatch '\.env\.example' }
if ($envFiles) {
    Write-Host ""
    Write-Host "ERROR: .env files about to be committed!" -ForegroundColor Red
    Write-Host $envFiles
    Write-Host ""
    Write-Host "These files contain secrets and should never be on GitHub." -ForegroundColor Yellow
    Write-Host "Check your .gitignore and 'git rm --cached <file>' if needed." -ForegroundColor Yellow
    exit 1
}

# ---- 3. Stage everything ----
Write-Host ""
Write-Host "==> Staging all changes..." -ForegroundColor Cyan
git add .

# ---- 4. Commit ----
Write-Host ""
Write-Host "==> Committing: $Message" -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed. Aborting." -ForegroundColor Red
    exit 1
}

# ---- 5. Pull (rebase) — pulls any remote work and replays yours on top ----
Write-Host ""
Write-Host "==> Pulling latest from origin (rebase)..." -ForegroundColor Cyan
git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Rebase failed (probably a conflict)." -ForegroundColor Red
    Write-Host "Resolve conflicts manually, then run:" -ForegroundColor Yellow
    Write-Host "    git rebase --continue" -ForegroundColor White
    Write-Host "    git push" -ForegroundColor White
    exit 1
}

# ---- 6. Push ----
Write-Host ""
Write-Host "==> Pushing to GitHub..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done! Changes are live on GitHub." -ForegroundColor Green
Write-Host "https://github.com/Mus4ever/SamMedical" -ForegroundColor White
