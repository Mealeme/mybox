
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Index = () => {
  const { user, isAuthenticated, isLoading, signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-food-orange"></div>
      </div>
    );
  }
  
  // If the user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSignIn = () => {
    setIsSigningIn(true);
    signIn();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to MealSync</CardTitle>
          <CardDescription>
            Sign in to track and share your meal expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button 
            className="w-full" 
            onClick={handleSignIn} 
            disabled={isSigningIn}
          >
            {isSigningIn ? "Signing in..." : "Sign In (Demo)"}
          </Button>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            This is a demo login. Click the button to sign in with a demo account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
