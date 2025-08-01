
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce, filterExpensesBySearchTerm } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense } from '@/data/types';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'dark' | 'light';
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{text: string; category: string; amount?: number}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 200);
  const { toast } = useToast();
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [open]);

  // Handle clicks outside of suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on search query
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 1) {
      // Filter expenses by search term
      const filteredExpenses = filterExpensesBySearchTerm(expenses, debouncedQuery);
      
      // Convert to suggestions format
      const expenseSuggestions = filteredExpenses.map(expense => ({
        text: expense.description || `${expense.category} expense`,
        category: expense.category,
        amount: expense.amount,
      }));
      
      setSuggestions(expenseSuggestions);
      setShowSuggestions(expenseSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery, expenses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Show only suggestions if there are any rather than navigating directly
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      // Navigate to search results only if no suggestions or user explicitly clicks search
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
      
      // Close dialog
      onOpenChange(false);
      
      // Show toast
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"`,
      });
    }
  };

  const handleSuggestionClick = (suggestion: {text: string; category: string}) => {
    setSearchQuery(suggestion.text);
    navigate(`/reports?search=${encodeURIComponent(suggestion.text)}&category=${suggestion.category}`);
    setShowSuggestions(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md fixed top-4 mx-auto">
        <DialogHeader>
          <DialogTitle>Search Expenses</DialogTitle>
          <DialogDescription>
            Search for expenses by description, category, or amount
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4 mt-2">
          <div className="relative">
            <Input 
              ref={searchInputRef}
              placeholder="Search expenses, groups, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg border z-50 ${
                  mode === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {suggestions.map((suggestion, i) => (
                  <div 
                    key={i}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                      mode === 'dark'
                        ? 'hover:bg-gray-700 text-white' 
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search className={`h-4 w-4 mr-2 ${
                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <span>{suggestion.text}</span>
                    </div>
                    <div className="flex items-center">
                      {suggestion.amount !== undefined && (
                        <span className={`text-xs mr-2 font-medium ${
                          mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          ₹{suggestion.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className={`text-xs mr-2 px-2 py-1 rounded-full ${
                        mode === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {suggestion.category}
                      </span>
                      <ArrowRight className={`h-4 w-4 ${
                        mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Search</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
