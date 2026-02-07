# 🚀 Executar el Projecte Localment

## Opció 1: Backend amb Docker, Frontend Local (Recomanat per desenvolupament)

### 1. Iniciar Backend i Redis amb Docker

```bash
docker-compose up -d
```

Això iniciarà:
- ✅ Redis (port 6379)
- ✅ Backend API (port 3000)

### 2. Executar Frontend Localment

Obre un terminal nou i executa:

```bash
cd frontend
npm install
npm run dev
```

El frontend estarà disponible a: `http://localhost:5173`

## Opció 2: Tot Local (sense Docker)

### 1. Iniciar Redis

Si tens Redis instal·lat localment:
```bash
redis-server
```

O amb Docker només Redis:
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

### 2. Executar Backend

```bash
npm install
npm run dev
```

### 3. Executar Frontend

```bash
cd frontend
npm install
npm run dev
```

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **API Products**: http://localhost:3000/api/products

## Comandes Útils

```bash
# Veure logs del backend (Docker)
docker-compose logs -f app

# Aturar tot (Docker)
docker-compose down

# Reiniciar backend (Docker)
docker-compose restart app
```

