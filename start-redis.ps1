# Script per iniciar Redis amb Docker
# Executa amb: .\start-redis.ps1

Write-Host "🐳 Iniciant Redis amb Docker..." -ForegroundColor Cyan

# Verificar si Docker està en execució
try {
    docker ps | Out-Null
    Write-Host "✅ Docker està en execució" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker Desktop no està en execució!" -ForegroundColor Red
    Write-Host "   Si us plau, inicia Docker Desktop i torna a executar aquest script." -ForegroundColor Yellow
    exit 1
}

# Verificar si el contenidor Redis ja existeix
$redisExists = docker ps -a --filter "name=redis" --format "{{.Names}}" | Select-String "redis"

if ($redisExists) {
    Write-Host "📦 Contenidor Redis trobat, iniciant..." -ForegroundColor Yellow
    docker start redis
} else {
    Write-Host "📦 Creant i iniciant contenidor Redis..." -ForegroundColor Yellow
    docker run -d -p 6379:6379 --name redis redis:latest
}

# Esperar una mica perquè Redis s'iniciï
Start-Sleep -Seconds 2

# Verificar que Redis funciona
Write-Host "🔍 Verificant connexió a Redis..." -ForegroundColor Cyan
$result = docker exec redis redis-cli ping 2>&1

if ($result -match "PONG") {
    Write-Host "✅ Redis està funcionant correctament!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informació del contenidor:" -ForegroundColor Cyan
    docker ps --filter "name=redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host ""
    Write-Host "🚀 Ara pots executar: npm run dev" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis s'ha iniciat però no respon encara. Espera uns segons i prova:" -ForegroundColor Yellow
    Write-Host "   docker exec redis redis-cli ping" -ForegroundColor Yellow
}

