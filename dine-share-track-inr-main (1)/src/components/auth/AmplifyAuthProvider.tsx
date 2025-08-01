import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getCurrentUser, signUp, resetPassword, confirmResetPassword, confirmSignUp } from 'aws-amplify/auth';
import { configureAmplify } from '@/integrations/amplify/client';

// Initialize Amplify
configureAmplify();

// Function to clear user profile data from localStorage
const clearUserProfileData = (specificEmail?: string) => {
  // If an email is specified, only clear that user's profile data
  if (specificEmail) {
    console.log(`Clearing profile data for ${specificEmail}`);
    localStorage.removeItem(`user-profile-${specificEmail}`);
    
    // Clear any other profile-related data that might be stored for this user
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(specificEmail)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return;
  }
  
  // Clear all profile data if no specific email is provided
  console.log('Clearing all profile data');
  localStorage.removeItem('user-profile');
  
  // Clear any other profile-related data that might be stored
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('user-') || key.includes('profile'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

type User = {
  username: string;
  userId: string;
  email?: string;
  isDemo?: boolean; // Flag to indicate if this is a demo user
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isDemo: boolean; // Add a flag to easily check if in demo mode
  signOut: () => Promise<void>;
  signInWithEmail: (username: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signUpWithEmail: (username: string, email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  confirmSignUpWithCode: (username: string, code: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  resetPassword: (username: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  confirmPasswordReset: (username: string, code: string, newPassword: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signInWithDemo: () => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo user credentials
const DEMO_USERNAME = 'demo@example.com';
const DEMO_PASSWORD = 'Demo123456!';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousEmail, setPreviousEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          const currentEmail = currentUser.signInDetails?.loginId;
          
          // If the email has changed (different user logged in), clear profile data
          if (previousEmail && previousEmail !== currentEmail) {
            clearUserProfileData();
          }
          
          // Update previous email
          if (currentEmail) {
            setPreviousEmail(currentEmail);
          }
          
          setUser({
            username: currentUser.username,
            userId: currentUser.userId,
            email: currentEmail,
            isDemo: false // Regular users aren't demo users
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [previousEmail]);

  const signInWithEmail = async (username: string, password: string) => {
    try {
      await signIn({ username, password });
      
      // Update current user after successful sign-in
      const currentUser = await getCurrentUser();
      const newEmail = currentUser.signInDetails?.loginId;
      
      // If signing in as a different user, clear previous profile data
      if (previousEmail && previousEmail !== newEmail) {
        console.log(`User changed from ${previousEmail} to ${newEmail}. Cleaning up previous user's data.`);
        // Clear previous user's data
        clearUserProfileData(previousEmail);
      }
      
      // Update previous email
      if (newEmail) {
        setPreviousEmail(newEmail);
        
        // Check if there's any non-specific profile data and clean it
        if (localStorage.getItem('user-profile')) {
          console.log('Found non-specific profile data. Cleaning it up.');
          localStorage.removeItem('user-profile');
          localStorage.removeItem('user-profile-cover');
        }
      }
      
      setUser({
        username: currentUser.username,
        userId: currentUser.userId,
        email: newEmail,
        isDemo: false // Regular users aren't demo users
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error as Error };
    }
  };

  const signUpWithEmail = async (username: string, email: string, password: string) => {
    try {
      // Clear any existing profile data when signing up
      clearUserProfileData();
      
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: true
        }
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error as Error };
    }
  };

  const confirmSignUpWithCode = async (username: string, code: string) => {
    try {
      await confirmSignUp({
        username,
        confirmationCode: code
      });
      
      // Set the previous email to the newly confirmed account
      setPreviousEmail(username);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Confirm sign up error:', error);
      return { success: false, error: error as Error };
    }
  };

  const resetPasswordRequest = async (username: string) => {
    try {
      await resetPassword({ username });
      return { success: true, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error as Error };
    }
  };

  const confirmPasswordReset = async (username: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword
      });
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Confirm password reset error:', error);
      return { success: false, error: error as Error };
    }
  };

  const signInWithDemo = async () => {
    try {
      console.log('Starting demo sign in process...');
      
      // Clear any existing profile data before starting demo
      clearUserProfileData();
      
      // Create a mock demo user with a more descriptive username
      const timestamp = Date.now();
      const mockDemoUser = {
        username: `demo-user-${timestamp}`,
        userId: `demo-${timestamp}`,
        email: 'demo@example.com',
        isDemo: true
      };
      
      // Update previous email
      setPreviousEmail('demo@example.com');
      
      // Set the user directly without calling AWS Cognito
      setUser(mockDemoUser);
      
      console.log('Demo sign in successful with clean account:', mockDemoUser);
      return { success: true, error: null };
    } catch (error) {
      console.error('Demo sign in exception:', error);
      return { success: false, error: error as Error };
    }
  };

  const handleSignOut = async () => {
    try {
      // Capture current user email before signing out
      const currentEmail = user?.email;
      
      // Capture if the user was in demo mode before signing out
      const wasDemo = !!user?.isDemo;
      
      // Don't clear profile data on sign out - preserve user information
      // Only clear profile data for demo users or when explicitly needed
      if (wasDemo) {
        // Clear demo user data since it's temporary
        clearUserProfileData(currentEmail);
      }
      // For real users, we preserve their profile data so it's available when they log back in
      
      // Sign out from Cognito (only for real users)
      if (!wasDemo) {
        await signOut();
      }
      
      // Clear the user state
      setUser(null);
      setPreviousEmail(undefined);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemo: !!user?.isDemo,
        signOut: handleSignOut,
        signInWithEmail,
        signUpWithEmail,
        confirmSignUpWithCode,
        resetPassword: resetPasswordRequest,
        confirmPasswordReset,
        signInWithDemo,
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