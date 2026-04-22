import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser, resendVerificationEmail } from '../services/authService';

const AUTH_STORAGE_KEY = 'nutracore_auth';

const AuthContext = createContext(null);

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token || null,
      user: parsed?.user || null
    };
  } catch {
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => loadStoredAuth());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authState]);

  useEffect(() => {
    const syncUser = async () => {
      if (!authState.token) return;

      try {
        const response = await getCurrentUser(authState.token);
        if (response?.data) {
          setAuthState((prev) => ({ ...prev, user: response.data }));
        }
      } catch {
        setAuthState({ token: null, user: null });
      }
    };

    syncUser();
  }, [authState.token]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await loginUser(credentials);
      const nextState = {
        token: response.data.token,
        user: response.data.user
      };
      setAuthState(nextState);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const response = await registerUser(payload);
      if (response?.data?.token) {
        const nextState = {
          token: response.data.token,
          user: response.data.user
        };
        setAuthState(nextState);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email) => {
    return resendVerificationEmail(email);
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token),
      isLoading,
      login,
      register,
      resendVerification,
      logout
    }),
    [authState, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
