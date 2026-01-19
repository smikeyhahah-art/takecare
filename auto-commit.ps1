#!/usr/bin/env powershell
# Auto-commit script for TakeCare game
# This script watches for changes and commits/pushes them to GitHub

param(
    [string]$Message = "Update: Game changes"
)

# Add Git to PATH
$env:PATH = "C:\Program Files\Git\cmd;" + $env:PATH

# Navigate to project directory
$projectPath = "c:\Users\Carl Andrew\Desktop\hy"
Set-Location $projectPath

# Check if there are any changes
$status = & git status --porcelain

if ($status) {
    Write-Host "📝 Changes detected!" -ForegroundColor Green
    Write-Host $status
    
    # Add all changes
    & git add .
    Write-Host "✓ Files staged" -ForegroundColor Green
    
    # Commit changes
    & git commit -m $Message
    Write-Host "✓ Changes committed" -ForegroundColor Green
    
    # Push to GitHub
    & git push origin main
    Write-Host "✓ Pushed to GitHub" -ForegroundColor Green
    Write-Host "🚀 Update complete!" -ForegroundColor Cyan
} else {
    Write-Host "ℹ No changes to commit" -ForegroundColor Yellow
}
