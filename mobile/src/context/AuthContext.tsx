import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/tokenStorage';
import { setUnauthorizedHandler } from '../api/client';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean; // true while checking for a persisted token on app start
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app start, check if we already have a valid token stored
    (async () => {
      const token = await tokenStorage.get();
      setIsAuthenticated(!!token);
      setIsLoading(false);
    })();

    // If any API call gets a 401, log the user out app-wide
    setUnauthorizedHandler(() => setIsAuthenticated(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken } = await authApi.login(email, password);
    await tokenStorage.set(accessToken);
    setIsAuthenticated(true);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { accessToken } = await authApi.signup(email, password, name);
    await tokenStorage.set(accessToken);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await tokenStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}