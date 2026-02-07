# 🔧 SOLUCIÓ: Problema amb Docker

## ❌ EL PROBLEMA

Quan Docker Desktop s'acaba d'obrir, pot trigar 30-60 segons fins que el **daemon de Docker** estigui completament iniciat. Fins llavors, les comandes `docker ps` o `docker-compose` donen error: "Bad response from Docker engine".

## ✅ LA SOLUCIÓ

### Opció 1: Esperar i executar manualment (Més simple)

1. **Espera 30-60 segons** després d'obrir Docker Desktop
2. **Obre un terminal NOU** (PowerShell o CMD)
3. **Executa**:
   ```bash
   cd C:\Users\Usuario\Downloads\ecommerce-hexagonal-backend
   docker-compose up --build -d
   ```

### Opció 2: Usar el script automàtic

Executa aquesta comanda en un terminal NOU:

```powershell
cd C:\Users\Usuario\Downloads\ecommerce-hexagonal-backend
.\start-now.ps1
```

Aquest script:
- Espera que Docker estigui llest (fins a 60 segons)
- Inicia Redis i l'aplicació automàticament

### Opció 3: Verificar manualment

1. Obre un terminal NOU
2. Executa: `docker ps`
3. Si funciona (no dona error), executa: `docker-compose up --build -d`

## 🎯 PER QUÈ CAL UN TERMINAL NOU?

Quan obres Docker Desktop, el terminal que ja tenies obert pot no detectar el canvi. Un terminal nou detectarà que Docker està en execució.

## 📋 COMANDES ÚTILS

```bash
# Veure si Docker funciona
docker ps

# Iniciar tot
docker-compose up --build -d

# Veure logs
docker-compose logs -f app

# Aturar tot
docker-compose down
```

