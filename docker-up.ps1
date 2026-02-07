# Script per iniciar tot amb Docker Compose
Write-Host "🐳 Iniciant projecte amb Docker Compose..." -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "🔍 Verificant Docker..." -ForegroundColor Yellow
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no respon"
    }
    Write-Host "✅ Docker està en execució" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error: Docker Desktop no està en execució!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Solució:" -ForegroundColor Yellow
    Write-Host "   1. Obre Docker Desktop des del menú d'inici" -ForegroundColor White
    Write-Host "   2. Espera que aparegui l'icona de Docker a la barra de tasques" -ForegroundColor White
    Write-Host "   3. Torna a executar aquest script" -ForegroundColor White
    Write-Host ""
    Write-Host "   O executa manualment:" -ForegroundColor Yellow
    Write-Host "   docker-compose up --build -d" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Verificar docker-compose
Write-Host "🔍 Verificant docker-compose..." -ForegroundColor Yellow
try {
    $null = docker-compose version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "docker-compose no disponible"
    }
    Write-Host "✅ docker-compose disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: docker-compose no està disponible!" -ForegroundColor Red
    Write-Host "   Prova amb: docker compose up --build -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Construint i iniciant serveis..." -ForegroundColor Cyan

# Intentar amb docker-compose primer, si falla provar amb docker compose
try {
    docker-compose up --build -d
    if ($LASTEXITCODE -ne 0) {
        throw "docker-compose failed"
    }
} catch {
    Write-Host "   Provant amb 'docker compose' (versió nova)..." -ForegroundColor Yellow
    docker compose up --build -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Error iniciant els serveis!" -ForegroundColor Red
        Write-Host "   Verifica que Docker Desktop estigui completament iniciat." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "⏳ Esperant que els serveis estiguin llests..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📊 Estat dels contenidors:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "📋 Logs de l'aplicació:" -ForegroundColor Cyan
Write-Host "   Per veure els logs: docker-compose logs -f app" -ForegroundColor Yellow
Write-Host "   Per aturar: docker-compose down" -ForegroundColor Yellow
Write-Host ""

# Mostrar logs inicials
docker-compose logs --tail=50 app

