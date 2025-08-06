
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types';
import { BASE_URL } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Normalizar role a lowercase
      parsed.role = parsed.role?.toLowerCase();
      setUser(parsed);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
          const data = await res.json();
          // data: { user, token }
          // Normalizar role a lowercase para frontend
          const normalizedUser = { ...data.user, role: data.user.role.toLowerCase() } as AuthUser;
          setUser(normalizedUser);
          localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
          localStorage.setItem('token', data.token);
          return true;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
