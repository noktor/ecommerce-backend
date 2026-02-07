# Script per verificar l'estat de Docker
Write-Host "Verificant estat de Docker..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker està instal·lat
Write-Host "1. Verificant instal·lació de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   OK $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Docker no està instal·lat!" -ForegroundColor Red
    exit 1
}

# Verificar si Docker daemon està en execució
Write-Host ""
Write-Host "2. Verificant Docker daemon..." -ForegroundColor Yellow
try {
    $null = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK Docker daemon està en execució" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: Docker daemon NO està en execució!" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Solució:" -ForegroundColor Yellow
        Write-Host "   - Obre Docker Desktop" -ForegroundColor White
        Write-Host "   - Espera que aparegui l'icona a la barra de tasques" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "   ERROR: Docker daemon NO està en execució!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Solució:" -ForegroundColor Yellow
    Write-Host "   - Obre Docker Desktop" -ForegroundColor White
    Write-Host "   - Espera que aparegui l'icona a la barra de tasques" -ForegroundColor White
    exit 1
}

# Verificar docker-compose
Write-Host ""
Write-Host "3. Verificant Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK docker-compose disponible" -ForegroundColor Green
        Write-Host "   $composeVersion" -ForegroundColor Gray
    } else {
        # Provar amb la versió nova
        $composeVersion = docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   OK docker compose disponible (versió nova)" -ForegroundColor Green
            Write-Host "   $composeVersion" -ForegroundColor Gray
        } else {
            throw "No disponible"
        }
    }
} catch {
    Write-Host "   WARNING: docker-compose no trobat, però pots usar 'docker compose'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OK Tot està llest per executar Docker!" -ForegroundColor Green
Write-Host ""
Write-Host "   Executa:" -ForegroundColor Yellow
Write-Host '   .\docker-up.ps1' -ForegroundColor White
Write-Host "   o" -ForegroundColor Gray
Write-Host '   npm run docker:up' -ForegroundColor White
