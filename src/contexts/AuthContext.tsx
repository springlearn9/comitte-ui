import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { sessionRefresh } from '../utils/sessionRefresh';

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  sessionTimeRemaining: number; // in seconds
  refreshSession: () => void; // Called by services on successful API calls
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Session timeout in milliseconds (300 seconds)
const SESSION_TIMEOUT_MS = 300 * 1000;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(SESSION_TIMEOUT_MS / 1000);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    authService.logout();
    window.location.href = '/auth/signin';
  }, []);

  const resetTimeout = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();
    setSessionTimeRemaining(SESSION_TIMEOUT_MS / 1000);

    // Set timeout that will trigger logout
    timeoutRef.current = setTimeout(() => {
      console.log('Session timeout - logging out due to inactivity');
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData && authService.isAuthenticated()) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        authService.logout();
      }
      setLoading(false);
    };

    initAuth();
    
    // Register session refresh callback
    sessionRefresh.setCallback(resetTimeout);
    
    return () => {
      sessionRefresh.clear();
    };
  }, []); // Remove resetTimeout dependency to prevent re-initialization

  // Set up session timeout when user is authenticated
  useEffect(() => {
    if (!user) {
      // Clean up timeout if user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setSessionTimeRemaining(SESSION_TIMEOUT_MS / 1000);
      return;
    }

    // Set initial timeout
    resetTimeout();

    // Update countdown every second
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((SESSION_TIMEOUT_MS - elapsed) / 1000));
      setSessionTimeRemaining(remaining);
      
      if (remaining === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, resetTimeout]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
      setUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    sessionTimeRemaining,
    refreshSession: resetTimeout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};