
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
}

export function useErrorBoundary() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
  });
  const { toast } = useToast();

  // Auto-dismiss non-critical errors after some time
  useEffect(() => {
    if (errorState.hasError && errorState.error?.name !== 'FatalError') {
      const timer = setTimeout(() => {
        resetError();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [errorState.hasError, errorState.error]);

  const handleError = useCallback((error: Error) => {
    console.error('Error caught by boundary:', error);
    setErrorState({ hasError: true, error });
    
    // Show error toast for better UX
    toast({
      title: 'An error occurred',
      description: error.message || 'Please try again or refresh the page',
      variant: 'destructive',
    });
  }, [toast]);

  const resetError = useCallback(() => {
    setErrorState({ hasError: false, error: null });
  }, []);

  return { 
    ...errorState, 
    handleError, 
    resetError 
  };
}
