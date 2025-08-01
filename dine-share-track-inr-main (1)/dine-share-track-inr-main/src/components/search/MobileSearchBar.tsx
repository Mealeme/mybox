
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce, filterExpensesBySearchTerm } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';

interface MobileSearchBarProps {
  onClose: () => void;
  mode: 'dark' | 'light';
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({ onClose, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{text: string; category: string; amount?: number}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(searchQuery, 200);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const { toast } = useToast();

  useEffect(() => {
    // Focus input when component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show suggestions instead of immediate navigation if there are suggestions
    if (suggestions.length > 0 && searchQuery.trim()) {
      setShowSuggestions(true);
    } else if (searchQuery.trim()) {
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
      
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"`,
      });
      
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: {text: string; category: string}) => {
    setSearchQuery(suggestion.text);
    navigate(`/reports?search=${encodeURIComponent(suggestion.text)}&category=${suggestion.category}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[100] p-3 flex flex-col">
      <form onSubmit={handleSubmit} className="mb-2">
        <div className="flex items-center">
          <Input
            ref={searchInputRef}
            id="mobile-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses, groups..."
            className="flex-grow"
            autoFocus
          />
          <Button 
            size="icon" 
            variant="ghost" 
            type="button"
            className="ml-2" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className={`rounded-md shadow-lg border w-full ${
            mode === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          {suggestions.map((suggestion, i) => (
            <div 
              key={i}
              className={`px-3 py-3 cursor-pointer flex items-center justify-between ${
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
  );
};

export default MobileSearchBar;
