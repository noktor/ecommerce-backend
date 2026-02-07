import { useState, useEffect } from 'react';
import { api, Product } from '../services/api';
import { ProductCard } from './ProductCard';

interface ProductListProps {
  onAddToCart: (productId: string) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.products.getAll(category || undefined);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginTop: 0 }}>Products</h1>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', fontSize: '14px' }}
        >
          <option value="">All</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {products.length === 0 ? (
          <p>No products available</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}

