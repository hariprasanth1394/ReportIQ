import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken, initAuthFromStorage } from '../api/client.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = initAuthFromStorage();
    const storedUser = localStorage.getItem('reporter_user');
    if (stored) setToken(stored);
    if (storedUser) setUser(JSON.parse(storedUser));
    const hydrate = async () => {
      if (stored && !storedUser) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data.user);
          localStorage.setItem('reporter_user', JSON.stringify(res.data.user));
        } catch (err) {
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    setAuthToken(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('reporter_user', JSON.stringify(res.data.user));
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('reporter_user');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
