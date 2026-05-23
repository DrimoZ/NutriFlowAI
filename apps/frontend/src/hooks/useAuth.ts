import { useState } from 'react';
import { api } from '../lib/api';
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const login = async (email: string, password: string) => {
    setLoading(true);
    try { const { data } = await api.post('/auth/login', { email, password }); localStorage.setItem('token', data.accessToken); return true; }
    finally { setLoading(false); }
  };
  return { login, loading, isAuthed: !!localStorage.getItem('token') };
}
