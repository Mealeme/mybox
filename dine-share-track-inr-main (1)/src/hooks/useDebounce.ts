import { useState, useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

// Helper function to check if a string contains a substring (case insensitive)
export function containsText(text: string, searchQuery: string): boolean {
  if (!text || !searchQuery) return false;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

// Helper function to filter expenses by search term
export function filterExpensesBySearchTerm(expenses: any[], searchTerm: string): any[] {
  if (!searchTerm) return [];
  if (!expenses?.length) return [];
  
  const searchLower = searchTerm.toLowerCase();
  const searchTerms = searchLower.split(/\s+/).filter(term => term);
  
  // If no valid search terms, return empty array
  if (searchTerms.length === 0) return [];
  
  // First try for exact matches
  const exactMatches = expenses.filter(expense => {
    const description = (expense.description || '').toLowerCase();
    const category = (expense.category || '').toLowerCase();
    const amount = expense.amount?.toString() || '';
    const groupId = (expense.groupId || '').toLowerCase();
    
    return (
      description === searchLower ||
      category === searchLower ||
      amount === searchTerm ||
      groupId === searchLower
    );
  });
  
  // If we have exact matches, return those first
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // Otherwise do partial matching even with partial terms
  return expenses.filter(expense => {
    const description = (expense.description || '').toLowerCase();
    const category = (expense.category || '').toLowerCase();
    const amount = expense.amount?.toString() || '';
    const groupId = (expense.groupId || '').toLowerCase();
    
    // For a single search term, just check if it appears anywhere
    if (searchTerms.length === 1) {
      const term = searchTerms[0];
      return (
        description.includes(term) ||
        category.includes(term) ||
        amount.includes(term) ||
        groupId.includes(term)
      );
    } 
    
    // For multiple search terms, check if any term matches any field
    return searchTerms.some(term => 
      description.includes(term) ||
      category.includes(term) ||
      amount.includes(term) ||
      groupId.includes(term)
    );
  })
  .sort((a, b) => {
    // Sort by relevance (exact matches first, then partial matches)
    const aDescription = (a.description || '').toLowerCase();
    const bDescription = (b.description || '').toLowerCase();
    const aCategory = (a.category || '').toLowerCase();
    const bCategory = (b.category || '').toLowerCase();
    
    // Score the relevance - higher score = better match
    let aScore = 0;
    let bScore = 0;
    
    // Exact description match is best
    if (aDescription === searchLower) aScore += 10;
    if (bDescription === searchLower) bScore += 10;
    
    // Description contains term is good
    if (aDescription.includes(searchLower)) aScore += 5;
    if (bDescription.includes(searchLower)) bScore += 5;
    
    // Category match is also good
    if (aCategory === searchLower) aScore += 4;
    if (bCategory === searchLower) bScore += 4;
    
    // Category contains term is decent
    if (aCategory.includes(searchLower)) aScore += 3;
    if (bCategory.includes(searchLower)) bScore += 3;
    
    // Compare scores first
    if (aScore !== bScore) return bScore - aScore;
    
    // If scores are equal, sort by date (newest first)
    const aDate = new Date(a.date || 0).getTime();
    const bDate = new Date(b.date || 0).getTime();
    return bDate - aDate;
  })
  .slice(0, 10); // Show more results to give users more options
}
