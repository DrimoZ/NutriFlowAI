import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const TOKEN_KEY = 'token';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem(TOKEN_KEY));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persistToken = (nextToken: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persistToken(data.accessToken);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const inferredName = email.split('@')[0]?.trim() || 'New User';
      await api.post('/auth/register', { email, password, name: name?.trim() || inferredName });
      return login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  return { login, register, logout, loading, isAuthed: !!token };
}
