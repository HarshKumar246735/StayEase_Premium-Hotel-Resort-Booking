
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the login session when the application loads.
  useEffect(() => {
  let alive = true;

  const restoreSession = async () => {
    try {
      const { data } = await api.get('/auth/me');

      if (alive) {
        setUser(data.user ?? null);
      }
    } catch (error) {
      if (alive) {
        setUser(null);
      }

      // A 401 is expected when no user is logged in.
      if (error.response?.status !== 401) {
        console.error('Session restoration failed:', error.message);
      }
    } finally {
      if (alive) {
        setLoading(false);
      }
    }
  };

  restoreSession();

  return () => {
    alive = false;
  };
}, []);

  // Log in an existing user.
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });

    setUser(data.user);
    return data.user;
  }, []);

  // Register a new user.
  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);

    setUser(data.user);
    return data.user;
  }, []);

  // Log out the current user.
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

