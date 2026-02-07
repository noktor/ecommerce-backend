# Script que espera Docker i després inicia tot
Write-Host "Esperant que Docker estigui llest..." -ForegroundColor Yellow

$maxWait = 60
$waited = 0
$dockerReady = $false

while ($waited -lt $maxWait -and -not $dockerReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $result = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "OK Docker està llest!" -ForegroundColor Green
            break
        }
    } catch {
        # Continuar
    }
    if ($waited % 6 -eq 0) {
        Write-Host "Encara esperant... ($waited segons)" -ForegroundColor Gray
    }
}

if (-not $dockerReady) {
    Write-Host "ERROR: Docker no està disponible després de $maxWait segons" -ForegroundColor Red
    Write-Host "Tanca i torna a obrir Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Iniciant Redis i aplicació..." -ForegroundColor Cyan
Write-Host ""

# Provar amb docker-compose primer
try {
    docker-compose up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "OK Tot iniciat!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Veure logs:" -ForegroundColor Yellow
        Write-Host "docker-compose logs -f app" -ForegroundColor Gray
        exit 0
    }
} catch {
    # Continuar
}

# Si falla, provar amb docker compose (versió nova)
Write-Host "Provant amb docker compose..." -ForegroundColor Yellow
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK Tot iniciat!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Veure logs:" -ForegroundColor Yellow
    Write-Host "docker compose logs -f app" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ERROR iniciant serveis" -ForegroundColor Red
    exit 1
}

