import { useState, useCallback, useEffect } from 'react';
import { Expense } from '@/data/types';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNotifications } from '@/lib/NotificationsContext';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';

export function useExpenses() {
  const { isDemo, user } = useAuth();
  
  // Generate a unique storage key for each user based on their userId
  const userStorageKey = user && !isDemo ? `expenses_${user.userId}` : 'expenses_temp';
  
  // Use the user-specific storage key
  const [expenses, setExpenses, refreshExpenses] = useLocalStorage<Expense[]>(userStorageKey, []);
  
  // Demo expenses are only kept in memory and never saved to localStorage
  // Always initialize with empty array to ensure fresh demo experience
  const [demoExpenses, setDemoExpenses] = useState<Expense[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  // Clear demo expenses when entering demo mode
  useEffect(() => {
    if (isDemo) {
      // Reset demo expenses to empty array whenever demo mode is activated
      setDemoExpenses([]);
    }
  }, [isDemo]);

  // Update storage key if user changes
  useEffect(() => {
    if (!isDemo && user) {
      // Handle migration of data from old 'expenses' key to user-specific key
      const oldData = localStorage.getItem('expenses');
      const newKey = `expenses_${user.userId}`;
      
      // Check if we need to migrate data (user has old data but no personalized data yet)
      if (oldData && !localStorage.getItem(newKey)) {
        try {
          console.log('Migrating expense data to user-specific storage');
          
          // Parse the old data
          const oldExpenses = JSON.parse(oldData);
          
          // Add userId to each expense
          const migratedExpenses = oldExpenses.map((expense: Expense) => ({
            ...expense,
            userId: user.userId
          }));
          
          // Save to the new key
          localStorage.setItem(newKey, JSON.stringify(migratedExpenses));
          
          // Don't delete old data in case multiple users share the browser
          console.log('Migration complete');
        } catch (error) {
          console.error('Error migrating expense data:', error);
        }
      }
      
      // Refresh expenses with the new key
      refreshExpenses();
    }
  }, [user, isDemo, refreshExpenses]);

  // Helper function to get the correct expenses based on demo mode
  const getActiveExpenses = useCallback(() => {
    return isDemo ? demoExpenses : expenses;
  }, [isDemo, demoExpenses, expenses]);

  // Helper function to save expenses based on demo mode
  const saveActiveExpenses = useCallback((newExpenses: Expense[]) => {
    if (isDemo) {
      // For demo users, only update the state, don't save to localStorage
      setDemoExpenses(newExpenses);
    } else {
      // For regular users, update state and localStorage with user-specific key
      setExpenses(newExpenses);
    }
    setLastUpdated(Date.now());
  }, [isDemo, setExpenses]);

  // Add a new expense
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    try {
      // Create a new expense with a unique ID
      const newExpense = {
        ...expense,
        id: uuidv4(),
        userId: user?.userId, // Add user ID to expense for additional security
      };
      
      // Get current active expenses
      const currentExpenses = getActiveExpenses();
      
      // Add the new expense
      const updatedExpenses = [...currentExpenses, newExpense];
      
      // Save the updated expenses
      saveActiveExpenses(updatedExpenses);
      
      // Create notification for adding expense
      addNotification({
        title: "New expense added",
        message: `You added ₹${expense.amount} for ${expense.description || expense.category}`,
        category: "expense",
        read: false
      });
      
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      return null;
    }
  }, [getActiveExpenses, saveActiveExpenses, toast, addNotification, user]);

  // Update an existing expense
  const updateExpense = useCallback((id: string, updatedData: Partial<Omit<Expense, 'id'>>) => {
    try {
      // Get current active expenses
      const currentExpenses = getActiveExpenses();
      
      // Find the expense to update
      const expenseToUpdate = currentExpenses.find((e: Expense) => e.id === id);
      
      if (!expenseToUpdate) {
        throw new Error('Expense not found');
      }
      
      // Update the expense
      const updatedExpense = {
        ...expenseToUpdate,
        ...updatedData
      };
      
      // Replace the old expense with the updated one
      const updatedExpenses = currentExpenses.map((e: Expense) => 
        e.id === id ? updatedExpense : e
      );
      
      // Save the updated expenses
      saveActiveExpenses(updatedExpenses);
      
      // Create notification for updating expense
      addNotification({
        title: "Expense updated",
        message: `You updated the expense of ₹${updatedExpense.amount} for ${updatedExpense.description || updatedExpense.category}`,
        category: "expense",
        read: false
      });
      
      return updatedExpense;
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  }, [getActiveExpenses, saveActiveExpenses, toast, addNotification]);

  // Delete a single expense
  const deleteExpense = useCallback((id: string) => {
    try {
      // Get current active expenses
      const currentExpenses = getActiveExpenses();
      
      // Find the expense to delete
      const expenseToDelete = currentExpenses.find((e: Expense) => e.id === id);
      
      if (!expenseToDelete) {
        throw new Error('Expense not found');
      }
      
      // Filter out the expense to delete
      const updatedExpenses = currentExpenses.filter((e: Expense) => e.id !== id);
      
      // Save the updated expenses
      saveActiveExpenses(updatedExpenses);
      
      // Create notification for deleting expense
      addNotification({
        title: "Expense deleted",
        message: `You deleted the expense of ₹${expenseToDelete.amount} for ${expenseToDelete.description || expenseToDelete.category}`,
        category: "expense",
        read: false
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteExpense:', error);
      return false;
    }
  }, [getActiveExpenses, saveActiveExpenses, toast, addNotification]);

  // Delete multiple expenses at once
  const deleteBatchExpenses = useCallback((ids: string[]) => {
    try {
      // Get current active expenses
      const currentExpenses = getActiveExpenses();
      
      // Filter out the expenses to delete
      const updatedExpenses = currentExpenses.filter((e: Expense) => !ids.includes(e.id));
      
      // Save the updated expenses
      saveActiveExpenses(updatedExpenses);
      
      // Create notification for batch deleting expenses
      addNotification({
        title: "Multiple expenses deleted",
        message: `You deleted ${ids.length} expenses in a batch operation`,
        category: "expense",
        read: false
      });
      
      return true;
    } catch (error) {
      console.error('Error batch deleting expenses:', error);
      return false;
    }
  }, [getActiveExpenses, saveActiveExpenses, toast, addNotification]);
  
  // Get a specific expense by ID
  const getExpenseById = useCallback((id: string) => {
    const activeExpenses = getActiveExpenses();
    return activeExpenses.find(expense => expense.id === id) || null;
  }, [getActiveExpenses]);
  
  // Force refresh expenses from storage
  const refreshData = useCallback(() => {
    if (!isDemo) {
      refreshExpenses();
    }
    setLastUpdated(Date.now());
  }, [isDemo, refreshExpenses]);

  return {
    expenses: getActiveExpenses(),
    lastUpdated,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteBatchExpenses,
    getExpenseById,
    refreshData,
    userStorageKey, // Export this for debugging
  };
} 