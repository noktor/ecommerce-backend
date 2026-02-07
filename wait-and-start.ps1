# Espera que Docker estigui disponible i després inicia tot

Write-Host "⏳ Esperant que Docker Desktop s'iniciï..." -ForegroundColor Yellow
Write-Host "   (Això pot trigar 30-60 segons)" -ForegroundColor Gray
Write-Host ""

$maxWait = 90
$waited = 0
$dockerReady = $false

while ($waited -lt $maxWait -and -not $dockerReady) {
    Start-Sleep -Seconds 3
    $waited += 3
    try {
        docker ps 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "✅ Docker està en execució!" -ForegroundColor Green
            Write-Host ""
        }
    } catch {
        # Continuar esperant
    }
    if ($waited % 9 -eq 0) {
        Write-Host "   Encara esperant... ($waited segons)" -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "❌ Docker no s'ha iniciat després de $maxWait segons" -ForegroundColor Red
    Write-Host "   Si us plau, inicia Docker Desktop manualment i executa:" -ForegroundColor Yellow
    Write-Host "   .\start-all.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "🐳 Iniciant Redis..." -ForegroundColor Cyan
docker-compose up -d redis

Write-Host "⏳ Esperant que Redis estigui llest..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$redisReady = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        $result = docker exec redis redis-cli ping 2>&1
        if ($result -match "PONG") {
            $redisReady = $true
            Write-Host "✅ Redis està funcionant!" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar
    }
    Start-Sleep -Seconds 1
}

if (-not $redisReady) {
    Write-Host "⚠️  Redis encara no respon, però continuem..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Verificant dependències..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instal·lant dependències..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🚀 Iniciant l'aplicació..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

npm run dev

