import { createContext, useContext, useState } from 'react';
import { api, loadAuth, saveAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = loadAuth();
    // token שפג תוקפו לא שווה כלום - מתחילים מחדש
    return stored && new Date(stored.expiresAt) > new Date() ? stored : null;
  });

  const apply = (response) => {
    saveAuth(response);
    setAuth(response);
  };

  const value = {
    auth,
    isAdmin: auth?.role === 'Admin',
    login: async (username, password) => apply(await api.login(username, password)),
    register: async (data) => apply(await api.register(data)),
    logout: () => apply(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
