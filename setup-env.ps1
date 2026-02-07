# Script to set up .env file from .env.example
# This ensures credentials are never committed to the repository

if (Test-Path .env) {
    Write-Host "⚠️  .env file already exists. Skipping setup." -ForegroundColor Yellow
    Write-Host "If you want to recreate it, delete .env first and run this script again."
    exit 0
}

if (!(Test-Path .env.example)) {
    Write-Host "❌ .env.example file not found!" -ForegroundColor Red
    Write-Host "Please ensure .env.example exists in the project root."
    exit 1
}

Copy-Item .env.example .env
Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please edit .env and add your MongoDB Atlas credentials:" -ForegroundColor Yellow
Write-Host "   1. Open .env file"
Write-Host "   2. Replace YOUR_USERNAME with your MongoDB username"
Write-Host "   3. Replace YOUR_PASSWORD with your MongoDB password"
Write-Host "   4. Save the file"
Write-Host ""
Write-Host "The .env file is in .gitignore and will NOT be committed to GitHub." -ForegroundColor Cyan

