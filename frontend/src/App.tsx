import { useState } from 'react';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { OrderForm } from './components/OrderForm';
import { api, Order } from './services/api';

function App() {
  const [customerId] = useState('1'); // Hardcoded for now
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const handleAddToCart = async (productId: string) => {
    try {
      await api.cart.addItem(customerId, productId, 1);
      console.log('Producte afegit al carret!');
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCheckout = (items: Array<{ productId: string; quantity: number }>) => {
    setOrderItems(items);
    setShowOrderForm(true);
    setShowCart(false);
  };

  const handleOrderCreated = (order: Order) => {
    setCreatedOrder(order);
    setShowOrderForm(false);
    setOrderItems([]);
  };

  if (createdOrder) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#2563eb' }}>✅ Comanda creada amb èxit!</h1>
        <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #2563eb', borderRadius: '8px', display: 'inline-block' }}>
          <p><strong>ID de comanda:</strong> {createdOrder.id}</p>
          <p><strong>Total:</strong> ${createdOrder.total.toFixed(2)}</p>
          <p><strong>Estat:</strong> {createdOrder.status}</p>
          <p><strong>Direcció:</strong> {createdOrder.shippingAddress}</p>
        </div>
        <button
          onClick={() => {
            setCreatedOrder(null);
            setShowCart(false);
          }}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Tornar a la botiga
        </button>
      </div>
    );
  }

  if (showOrderForm) {
    return (
      <div>
        <OrderForm
          customerId={customerId}
          items={orderItems}
          onOrderCreated={handleOrderCreated}
          onCancel={() => {
            setShowOrderForm(false);
            setShowCart(true);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <header style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>🛒 E-commerce Store</h1>
        <button
          onClick={() => setShowCart(!showCart)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'white',
            color: '#2563eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showCart ? 'Veure Productes' : 'Veure Carret'}
        </button>
      </header>
      {showCart ? (
        <Cart customerId={customerId} onCheckout={handleCheckout} />
      ) : (
        <ProductList onAddToCart={handleAddToCart} />
      )}
    </div>
  );
}

export default App;

