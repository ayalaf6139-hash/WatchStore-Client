import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../auth/AuthContext';
import WatchImage from '../components/WatchImage';
import OrderDialog from '../components/OrderDialog';

const PAGE_SIZE = 6;

// מסך 2: רשימת שעונים עם חיפוש, מיון ו-pagination שמתבצע בשרת
export default function ProductsPage({ onOrdered }) {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ search: '', sortBy: '', sortDirection: 'asc', page: 1 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError('');

    api.getProducts({ ...query, pageSize: PAGE_SIZE })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err.message));

    return () => { cancelled = true; };
  }, [query, reloadKey]);

  const submitSearch = (e) => {
    e.preventDefault();
    setQuery({ ...query, search, page: 1 });
  };

  const goTo = (page) => setQuery({ ...query, page });

  return (
    <div>
      <form className="toolbar" onSubmit={submitSearch}>
        <input
          placeholder="חיפוש לפי שם, דגם או מותג"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">חיפוש</button>
        <select
          value={`${query.sortBy}|${query.sortDirection}`}
          onChange={(e) => {
            const [sortBy, sortDirection] = e.target.value.split('|');
            setQuery({ ...query, sortBy, sortDirection, page: 1 });
          }}
        >
          <option value="|asc">ללא מיון</option>
          <option value="price|asc">מחיר: מהנמוך</option>
          <option value="price|desc">מחיר: מהגבוה</option>
          <option value="stock|asc">מלאי: מהנמוך</option>
          <option value="name|asc">שם</option>
        </select>
      </form>

      {error && <div className="alert error">{error}</div>}

      {result && (
        <>
          <div className="grid">
            {result.items.map((p) => (
              <div key={p.id} className={`product ${p.isActive ? '' : 'inactive'}`}>
                <WatchImage brand={p.brand} />
                <div className="brand">{p.brand}</div>
                <h3>{p.name}</h3>
                <div className="muted">{p.modelNumber} · {p.categoryName}</div>
                <div className="price">₪{p.wholesalePrice.toLocaleString()}</div>
                <div className={p.stockQuantity <= 2 ? 'stock low' : 'stock'}>
                  במלאי: {p.stockQuantity}
                </div>
                {!isAdmin && (
                  <button
                    className="primary"
                    disabled={p.stockQuantity === 0}
                    onClick={() => setSelected(p)}
                  >
                    {p.stockQuantity === 0 ? 'אזל מהמלאי' : 'הזמנה'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {result.items.length === 0 && <p className="muted">לא נמצאו מוצרים.</p>}

          <div className="pager">
            <button disabled={result.page <= 1} onClick={() => goTo(result.page - 1)}>הקודם</button>
            <span>
              עמוד {result.page} מתוך {Math.max(result.totalPages, 1)} · {result.totalCount} מוצרים
            </span>
            <button disabled={result.page >= result.totalPages} onClick={() => goTo(result.page + 1)}>הבא</button>
          </div>
        </>
      )}

      {selected && (
        <OrderDialog
          product={selected}
          onClose={() => setSelected(null)}
          onChanged={() => setReloadKey((k) => k + 1)}
          onOrdered={onOrdered}
        />
      )}
    </div>
  );
}
