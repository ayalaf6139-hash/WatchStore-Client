import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const emptyRegister = {
  username: '',
  password: '',
  storeName: '',
  contactName: '',
  phone: '',
  email: '',
  address: ''
};

// מסך 1: התחברות והרשמה. ה-JWT נשמר ב-localStorage ונשלח ב-header בכל בקשה
export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: 'store1', password: 'Store123!' });
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.username, form.password);
      else await register({ ...registerForm, email: registerForm.email || null });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (state, setState, name, label, type = 'text') => (
    <label>
      {label}
      <input
        type={type}
        value={state[name]}
        onChange={(e) => setState({ ...state, [name]: e.target.value })}
        required={name !== 'email'}
      />
    </label>
  );

  return (
    <div className="card narrow">
      <div className="tabs">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          התחברות
        </button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          הרשמת חנות
        </button>
      </div>

      <form onSubmit={submit}>
        {mode === 'login' ? (
          <>
            {field(form, setForm, 'username', 'שם משתמש')}
            {field(form, setForm, 'password', 'סיסמה', 'password')}
            <p className="hint">דמו: admin / Admin123! · store1, store2 / Store123!</p>
          </>
        ) : (
          <>
            {field(registerForm, setRegisterForm, 'username', 'שם משתמש')}
            {field(registerForm, setRegisterForm, 'password', 'סיסמה (8+ תווים)', 'password')}
            {field(registerForm, setRegisterForm, 'storeName', 'שם החנות')}
            {field(registerForm, setRegisterForm, 'contactName', 'איש קשר')}
            {field(registerForm, setRegisterForm, 'phone', 'טלפון')}
            {field(registerForm, setRegisterForm, 'email', 'אימייל (לא חובה)', 'email')}
            {field(registerForm, setRegisterForm, 'address', 'כתובת')}
          </>
        )}

        {error && <div className="alert error">{error}</div>}

        <button type="submit" className="primary" disabled={busy}>
          {busy ? '...' : mode === 'login' ? 'התחברות' : 'הרשמה'}
        </button>
      </form>
    </div>
  );
}
