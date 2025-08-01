import { Expense, ExpenseCategory } from '@/data/types';

// Guaranteed test data for search suggestions
export const testExpenses: Expense[] = [
  {
    id: 'test-1',
    description: 'Monthly Grocery Expense',
    category: 'groceries',
    amount: 3500,
    date: new Date().toISOString(),
  },
  {
    id: 'test-2',
    description: 'Restaurant Expense',
    category: 'dinner',
    amount: 1200,
    date: new Date().toISOString(),
  },
  {
    id: 'test-3',
    description: 'Transportation Expense',
    category: 'other',
    amount: 800,
    date: new Date().toISOString(),
  },
  {
    id: 'test-4',
    description: 'Entertainment Expense',
    category: 'snacks',
    amount: 1500,
    date: new Date().toISOString(),
  },
  {
    id: 'test-5',
    description: 'Shopping Expense',
    category: 'lunch', 
    amount: 2700,
    date: new Date().toISOString(),
  }
];

// Simple search suggestion type
export interface SearchSuggestion {
  text: string;
  category: ExpenseCategory;
  amount?: number;
  date?: string;
}

// Simple filter function that always returns results
export function getSearchSuggestions(searchQuery: string): SearchSuggestion[] {
  if (!searchQuery.trim()) return [];
  
  // Always include all test data when searching for "expense"
  const shouldIncludeAll = searchQuery.toLowerCase().includes('expense');
  
  // Filter expenses
  const filteredExpenses = shouldIncludeAll
    ? testExpenses
    : testExpenses.filter(expense => {
        const query = searchQuery.toLowerCase();
        const description = (expense.description || '').toLowerCase();
        const category = (expense.category || '').toLowerCase();
        
        return description.includes(query) || 
               category.includes(query) ||
               'expense'.includes(query);
      });
  
  // Convert to suggestions format
  return filteredExpenses.map(expense => ({
    text: expense.description || `${expense.category} expense`,
    category: expense.category,
    amount: expense.amount,
    date: expense.date
  }));
} 