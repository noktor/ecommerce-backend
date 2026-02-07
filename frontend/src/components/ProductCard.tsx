import { Product } from '../services/api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px',
      maxWidth: '300px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0 }}>{product.name}</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>{product.category}</p>
      <p>{product.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div>
          <strong style={{ fontSize: '20px', color: '#2563eb' }}>${product.price.toFixed(2)}</strong>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            Stock: {product.stock}
          </p>
        </div>
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={product.stock === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: product.stock > 0 ? '#2563eb' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
            fontSize: '14px'
          }}
        >
          {product.stock > 0 ? 'Afegir al carret' : 'Sense estoc'}
        </button>
      </div>
    </div>
  );
}

