'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'VERIFIER' | 'ORGANIZATION' | 'ADMIN';
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('trashtag_token');
    const savedUser = localStorage.getItem('trashtag_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('trashtag_token', newToken);
    localStorage.setItem('trashtag_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('trashtag_token');
    localStorage.removeItem('trashtag_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

