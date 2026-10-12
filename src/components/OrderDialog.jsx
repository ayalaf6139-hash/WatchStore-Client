import { useState } from 'react';
import { api } from '../services/api';
import WatchImage from './WatchImage';

// מסך 3: בחירת כמות וביצוע הזמנה.
// מסך 4: כשהשרת מחזיר 409 - הודעה ברורה שהמלאי נתפס על ידי משתמש אחר
export default function OrderDialog({ product, onClose, onChanged, onOrdered }) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(null); // { kind: 'success' | 'conflict' | 'error', message }
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);

    try {
      const order = await api.createOrder(product.id, Number(quantity));
      setStatus({ kind: 'success', message: `ההזמנה #${order.id} נקלטה. סה"כ ₪${order.totalPrice.toLocaleString()}` });
      onChanged();
    } catch (err) {
      if (err.status === 409) {
        setStatus({ kind: 'conflict', message: err.message, correlationId: err.body?.correlationId });
        // המלאי השתנה - מרעננים את הרשימה כדי להציג את המצב האמיתי
        onChanged();
      } else {
        setStatus({ kind: 'error', message: err.message });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="card dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-head">
          <WatchImage brand={product.brand} size={64} />
          <div>
            <h3>{product.brand} {product.name}</h3>
            <div className="muted">
              ₪{product.wholesalePrice.toLocaleString()} ליחידה · במלאי (בזמן הטעינה): {product.stockQuantity}
            </div>
          </div>
        </div>

        {status?.kind === 'conflict' ? (
          <div className="conflict">
            <div className="conflict-title">⚠️ 409 Conflict</div>
            <p>{status.message}</p>
            {status.correlationId && <small className="muted">מזהה בקשה: {status.correlationId}</small>}
            <div className="actions">
              <button className="primary" onClick={() => setStatus(null)}>נסה שוב</button>
              <button onClick={onClose}>סגור</button>
            </div>
          </div>
        ) : status?.kind === 'success' ? (
          <>
            <div className="alert success">{status.message}</div>
            <div className="actions">
              <button className="primary" onClick={() => { onClose(); onOrdered(); }}>להזמנות שלי</button>
              <button onClick={onClose}>סגור</button>
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <label>
              כמות
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            {status?.kind === 'error' && <div className="alert error">{status.message}</div>}
            <div className="actions">
              <button type="submit" className="primary" disabled={busy}>
                {busy ? 'שולח...' : 'ביצוע הזמנה'}
              </button>
              <button type="button" onClick={onClose}>ביטול</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
