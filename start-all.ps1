# Script per iniciar tot el projecte (Redis + Aplicació)
# Executa amb: .\start-all.ps1

Write-Host "🚀 Iniciant projecte amb Docker i Redis..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker està en execució
Write-Host "🔍 Verificant Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker està en execució" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker Desktop no està en execució!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Si us plau:" -ForegroundColor Yellow
    Write-Host "   1. Obre Docker Desktop" -ForegroundColor Yellow
    Write-Host "   2. Espera que aparegui l'icona a la barra de tasques" -ForegroundColor Yellow
    Write-Host "   3. Torna a executar aquest script" -ForegroundColor Yellow
    exit 1
}

# Iniciar Redis amb docker-compose
Write-Host ""
Write-Host "🐳 Iniciant Redis amb Docker Compose..." -ForegroundColor Cyan
docker-compose up -d redis

# Esperar que Redis estigui llest
Write-Host "⏳ Esperant que Redis estigui llest..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$redisReady = $false

while ($attempt -lt $maxAttempts -and -not $redisReady) {
    Start-Sleep -Seconds 1
    $attempt++
    try {
        $result = docker exec redis redis-cli ping 2>&1
        if ($result -match "PONG") {
            $redisReady = $true
            Write-Host "✅ Redis està funcionant!" -ForegroundColor Green
        }
    } catch {
        # Continuar intentant
    }
    if ($attempt % 5 -eq 0) {
        Write-Host "   Intentant connexió... ($attempt/$maxAttempts)" -ForegroundColor Gray
    }
}

if (-not $redisReady) {
    Write-Host "⚠️  Redis no respon encara, però continuem..." -ForegroundColor Yellow
}

# Verificar que npm està instal·lat
Write-Host ""
Write-Host "📦 Verificant Node.js i npm..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js o npm no estan instal·lats!" -ForegroundColor Red
    exit 1
}

# Instal·lar dependències si cal
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📥 Instal·lant dependències..." -ForegroundColor Cyan
    npm install
}

# Mostrar estat
Write-Host ""
Write-Host "📊 Estat dels serveis:" -ForegroundColor Cyan
docker ps --filter "name=redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "🎯 Tot està llest! Iniciant l'aplicació..." -ForegroundColor Green
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Executar l'aplicació
npm run dev

