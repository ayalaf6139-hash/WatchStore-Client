import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../auth/AuthContext';

const STATUS_LABELS = {
  Pending: 'ממתינה',
  Approved: 'אושרה',
  Rejected: 'נדחתה',
  Cancelled: 'בוטלה',
  Completed: 'הושלמה'
};

// חנות רואה רק את ההזמנות שלה, Admin רואה את כולן - הסינון נעשה בשרת
export default function OrdersPage() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!orders) return <p className="muted">טוען...</p>;
  if (orders.length === 0) return <p className="muted">אין הזמנות עדיין.</p>;

  return (
    <table className="orders">
      <thead>
        <tr>
          <th>#</th>
          {isAdmin && <th>חנות</th>}
          <th>תאריך</th>
          <th>פריטים</th>
          <th>סה"כ</th>
          <th>סטטוס</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>{o.id}</td>
            {isAdmin && <td>{o.storeId}</td>}
            <td>{new Date(o.orderDate + 'Z').toLocaleString('he-IL')}</td>
            <td>{o.items.map((i) => `${i.productName} × ${i.quantity}`).join(', ')}</td>
            <td>₪{o.totalPrice.toLocaleString()}</td>
            <td>{STATUS_LABELS[o.status] ?? o.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
