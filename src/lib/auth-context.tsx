'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_CREATORS } from './seed-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, fullName: string, role: UserRole, companyName?: string) => Promise<boolean>;
  logout: () => void;
  loginAsDemoBrand: () => void;
  loginAsDemoCreator: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, UserProfile> = {
  brand: {
    id: 'brand-nike-demo',
    email: 'creative@apexathletics.com',
    role: 'brand',
    full_name: 'Apex Athletics Studio',
    company_name: 'Apex Athletics',
    avatar_url: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80',
    created_at: '2026-01-10T10:00:00Z',
  },
  creator: {
    id: 'c1111111-1111-4111-8111-111111111111',
    email: 'elena@rostovafilms.ai',
    role: 'creator',
    full_name: 'Elena Rostova',
    company_name: 'Rostova AI Studios',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    created_at: '2026-01-15T10:00:00Z',
  },
};

const AUTH_STORAGE_KEY = 'cc_ai_auth_user_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to demo brand so reviewers can immediately interact
        setUser(DEMO_USERS.brand);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.brand));
      }
    } catch (e) {
      console.error('Error reading auth state:', e);
      setUser(DEMO_USERS.brand);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, forcedRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const lowerEmail = email.toLowerCase().trim();
      let matchedUser: UserProfile;

      if (lowerEmail.includes('creator') || lowerEmail.includes('elena') || forcedRole === 'creator') {
        matchedUser = DEMO_USERS.creator;
      } else if (lowerEmail.includes('brand') || forcedRole === 'brand') {
        matchedUser = DEMO_USERS.brand;
      } else {
        // Dynamic fallback user
        matchedUser = {
          id: `u-${Date.now()}`,
          email: lowerEmail,
          role: forcedRole || 'brand',
          full_name: lowerEmail.split('@')[0],
          created_at: new Date().toISOString(),
        };
      }

      setUser(matchedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    fullName: string,
    role: UserRole,
    companyName?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: `u-${Date.now()}`,
        email: email.toLowerCase().trim(),
        role,
        full_name: fullName,
        company_name: companyName,
        avatar_url:
          role === 'creator'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const loginAsDemoBrand = () => {
    setUser(DEMO_USERS.brand);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.brand));
  };

  const loginAsDemoCreator = () => {
    setUser(DEMO_USERS.creator);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.creator));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        signup,
        logout,
        loginAsDemoBrand,
        loginAsDemoCreator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
