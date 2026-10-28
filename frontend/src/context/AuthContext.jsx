import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('academic_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('academic_token', data.data.token);
      localStorage.setItem('academic_user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('academic_token');
    localStorage.removeItem('academic_user');
    setUser(null);
  };

  const updateUser = (next) => {
    localStorage.setItem('academic_user', JSON.stringify(next));
    setUser(next);
  };

  const value = useMemo(() => ({ user, loading, login, logout, updateUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

