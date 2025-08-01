import { useState, useEffect, useCallback } from 'react';

// Type for event data
interface StorageEvent {
  key: string | null;
  newValue: string | null;
  oldValue: string | null;
  storageArea: Storage | null;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Function to manually refresh value from localStorage
  const refreshValue = useCallback(() => {
    setStoredValue(readValue());
  }, [readValue]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T) => {
    try {
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(value));
      // Save state
      setStoredValue(value);
      
      // Trigger a custom event to notify other components using the same key
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('local-storage-update', { 
          detail: { key, newValue: value } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for localStorage changes in other windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    // Listen for custom events within the same window
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.newValue);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange as any);
      window.addEventListener('local-storage-update', handleCustomEvent as any);
    }

    // Initial read from localStorage
    setStoredValue(readValue());

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange as any);
        window.removeEventListener('local-storage-update', handleCustomEvent as any);
      }
    };
  }, [key, readValue]);

  return [storedValue, setValue, refreshValue];
}
