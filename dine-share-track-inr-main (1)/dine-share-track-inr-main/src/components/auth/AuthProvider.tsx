
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserInfo = {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: UserInfo | null;
  isLoading: boolean;
  signOut: () => void;
  signIn: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user for testing purposes
const DEMO_USER: UserInfo = {
  sub: 'demo-user-123',
  email: 'demo@example.com',
  name: 'Demo User',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in local storage
    const checkAuth = () => {
      try {
        setIsLoading(true);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const signIn = () => {
    // For demo purposes, just set the demo user
    localStorage.setItem('user', JSON.stringify(DEMO_USER));
    setUser(DEMO_USER);
    
    // Redirect to dashboard after successful login
    if (window.location.pathname === '/') {
      window.location.href = '/dashboard';
    }
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signOut,
        signIn,
        isAuthenticated: !!user,
      }}
    >
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
