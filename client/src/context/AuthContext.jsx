import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, toApiError } from '../api/client';

const USER_KEY = 'ems_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });
  // Blocks route rendering until we know whether the stored token is still good.
  const [initialising, setInitialising] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: toApiError(error) };
    }
  }, []);

  // Verify a token restored from localStorage before trusting it.
  useEffect(() => {
    if (!token) {
      setInitialising(false);
      return;
    }
    let cancelled = false;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setInitialising(false);
      });
    return () => {
      cancelled = true;
    };
    // Runs once on mount — a fresh login already returns a verified user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The axios interceptor fires this when any request comes back 401.
  useEffect(() => {
    window.addEventListener('authExpired', logout);
    return () => window.removeEventListener('authExpired', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), initialising, login, logout }),
    [token, user, initialising, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
