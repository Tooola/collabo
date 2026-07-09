import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      api('GET', '/me').then(res => {
        if (res.ok) setUser(res.data.user);
        else { setAuthToken(null); setUser(null); }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    const res = await api('POST', '/login', { email, password, role });
    if (!res.ok) return { success: false, error: res.data.error || res.data.message };
    if (res.data.requireOtp) return { requireOtp: true };
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return { success: true };
  }, []);

  const verifyOtp = useCallback(async (email, password, role, otp) => {
    const res = await api('POST', '/verify-otp', { email, password, role, otp });
    if (!res.ok) return { success: false, error: res.data.error || res.data.message };
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await api('POST', '/logout');
    setAuthToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
