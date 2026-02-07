# 📮 Col·lecció Postman per E-commerce API

## 📥 Importar a Postman

### Opció 1: Importar Col·lecció i Entorn

1. Obre Postman
2. Fes clic a **Import** (botó superior esquerra)
3. Arrossega o selecciona:
   - `E-commerce-API.postman_collection.json` (Col·lecció)
   - `E-commerce-API.postman_environment.json` (Entorn - opcional però recomanat)

### Opció 2: Importar només la Col·lecció

Si només vols la col·lecció sense l'entorn, importa només el fitxer `E-commerce-API.postman_collection.json`.

## 🎯 Endpoints Inclosos

### Health Check
- `GET /health` - Verifica que l'API està funcionant

### Products
- `GET /api/products` - Obté tots els productes
- `GET /api/products?category=Electronics` - Filtra per categoria
- `GET /api/products/:id` - Obté un producte per ID

### Cart
- `GET /api/cart/:customerId` - Obté el carret d'un client
- `POST /api/cart` - Afegeix producte al carret
- `DELETE /api/cart/item` - Elimina un producte del carret

### Orders
- `POST /api/orders` - Crea una nova comanda
- `GET /api/orders/:id` - Obté una comanda per ID

## ⚙️ Variables d'Entorn

La col·lecció utilitza variables per facilitar l'ús:

- `{{base_url}}` - URL base de l'API (per defecte: `http://localhost:3000`)
- `{{customer_id}}` - ID del client (per defecte: `1`)
- `{{product_id}}` - ID del producte (per defecte: `1`)

### Canviar l'Entorn

1. Selecciona l'entorn "E-commerce API - Local" al selector d'entorns (superior dreta)
2. Pots modificar les variables clicant a l'icona de l'ull 👁️
3. O crea un nou entorn per producció/staging

## 🚀 Començar a Provar

1. **Assegura't que el backend està funcionant:**
   ```bash
   docker-compose ps
   # O verifica: http://localhost:3000/health
   ```

2. **Prova el Health Check primer:**
   - Obre "Health Check" a la col·lecció
   - Fes clic a "Send"
   - Hauries de rebre: `{"status":"ok","timestamp":"..."}`

3. **Prova obtenir productes:**
   - Obre "Products > Get All Products"
   - Fes clic a "Send"
   - Hauries de veure una llista de productes

## 📝 Exemples de Request Bodies

### Afegir al Carret
```json
{
  "customerId": "1",
  "productId": "1",
  "quantity": 2
}
```

### Eliminar del Carret
```json
{
  "customerId": "1",
  "productId": "1"
}
```

### Crear Comanda
```json
{
  "customerId": "1",
  "items": [
    {
      "productId": "1",
      "quantity": 1
    },
    {
      "productId": "2",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, Barcelona, Spain"
}
```

## 🔧 Personalitzar

Pots modificar les variables d'entorn per:
- Canviar la URL base (ex: producció)
- Canviar IDs de client/producte per defecte
- Afegir autenticació si s'implementa més endavant

## 📚 Més Informació

- **API Base URL**: http://localhost:3000
- **API Docs**: Pots veure els endpoints a `src/api/routes/`
- **Backend Logs**: `docker-compose logs -f app`

