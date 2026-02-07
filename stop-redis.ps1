# Script per aturar Redis
# Executa amb: .\stop-redis.ps1

Write-Host "🛑 Aturant Redis..." -ForegroundColor Cyan

docker stop redis

Write-Host "✅ Redis aturat" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Per eliminar el contenidor: docker rm redis" -ForegroundColor Yellow

