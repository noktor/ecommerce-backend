# 🚀 Executar Frontend Localment

## Comandes Disponibles

### Des del directori root del projecte:

```bash
# Instal·lar dependències del frontend (només la primera vegada)
pnpm run frontend:install

# Executar frontend en mode desenvolupament
pnpm run frontend:dev
```

### O des del directori frontend:

```bash
cd frontend

# Instal·lar dependències (només la primera vegada)
pnpm install

# Executar en mode desenvolupament
pnpm run dev
```

## Requisits

Abans d'executar el frontend, assegura't que el backend està funcionant:

```bash
# Iniciar backend i Redis amb Docker
docker-compose up -d

# Verificar que està funcionant
docker-compose ps
```

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Products**: http://localhost:3000/api/products

## Hot Reload

El frontend té hot-reload activat, així que qualsevol canvi al codi es reflectirà automàticament al navegador.

