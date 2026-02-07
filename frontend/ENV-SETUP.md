# 🔧 Configuració de Variables d'Entorn

## Variables d'Entorn Disponibles

### `VITE_API_URL`
URL base de l'API backend. Per defecte: `http://localhost:3000/api`

## Configuració

### Desenvolupament Local

Crea un fitxer `.env` a la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Producció

Per producció, crea un fitxer `.env.production`:

```env
VITE_API_URL=https://api.tudomini.com/api
```

## Com Funciona

1. **Vite** carrega les variables d'entorn que comencen amb `VITE_`
2. Les variables estan disponibles a `import.meta.env.VITE_API_URL`
3. Si no existeix, s'utilitza el valor per defecte: `http://localhost:3000/api`

## Seguretat

⚠️ **Important**: Les variables que comencen amb `VITE_` són **públiques** i s'inclouen al bundle final. 

❌ **NO** posis secrets o API keys aquí. Només URLs i configuracions públiques.

## Fitxers

- `.env` - Variables per desenvolupament (no commitejar)
- `.env.example` - Plantilla amb les variables necessàries (sí commitejar)
- `.env.production` - Variables per producció (no commitejar)

## TypeScript

Els tipus estan definits a `src/vite-env.d.ts` per autocompletat i validació de tipus.

