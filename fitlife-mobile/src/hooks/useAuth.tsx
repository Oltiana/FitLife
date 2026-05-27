import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage } from '../storage/tokenStorage';
import { authApi } from '../api/authApi';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: object, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await tokenStorage.getToken();
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (token: string, refreshToken: string, user: object, role: string) => {
    await tokenStorage.saveAuth(token, refreshToken, user, role);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    await tokenStorage.clearAuth();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;