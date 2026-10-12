import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  const { auth, isAdmin, logout } = useAuth();
  const [page, setPage] = useState('products');

  return (
    <div className="app">
      <header>
        <h1>⌚ WatchStore</h1>
        {auth && (
          <nav>
            <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>
              קטלוג
            </button>
            <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>
              {isAdmin ? 'כל ההזמנות' : 'ההזמנות שלי'}
            </button>
            <span className="user">
              {auth.username} ({auth.role === 'Admin' ? 'מנהל' : 'חנות'})
            </span>
            <button onClick={logout}>יציאה</button>
          </nav>
        )}
      </header>

      <main>
        {!auth ? (
          <LoginPage />
        ) : page === 'products' ? (
          <ProductsPage onOrdered={() => setPage('orders')} />
        ) : (
          <OrdersPage />
        )}
      </main>
    </div>
  );
}
