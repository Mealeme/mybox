import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useExpenses } from '@/hooks/useExpenses';
import { useToast } from '@/components/ui/use-toast';
import { Search, ArrowRight, Calendar, Tag, CreditCard, Filter, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense } from '@/data/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSearchSuggestions, SearchSuggestion } from './simpleSuggestions';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'dark' | 'light';
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange, mode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { expenses } = useExpenses();
  
  // New state for filters
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 10000]);
  
  // Get unique categories from expenses
  const categories = [...new Set(expenses.map(expense => expense.category))];

  // Show recent transactions when dialog opens
  useEffect(() => {
    if (open) {
      // Show 5 most recent transactions
      const recentTransactions = expenses
        .sort((a, b) => {
          const dateA = new Date(a.date || 0);
          const dateB = new Date(b.date || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5)
        .map(expense => ({
          text: expense.description || `${expense.category} expense`,
          category: expense.category,
          amount: expense.amount,
          date: expense.date
        }));
        
      setSuggestions(recentTransactions);
      setShowSuggestions(true);
    }
  }, [open, expenses]);

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
      setShowFilters(false);
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

  // Update suggestions on search query changes
  useEffect(() => {
    if (searchQuery) {
      // First try filtering actual expenses
      const filteredExpenses = expenses
        .filter(expense => {
          const searchLower = searchQuery.toLowerCase();
          return (
            (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
            expense.category.toLowerCase().includes(searchLower) ||
            expense.amount.toString().includes(searchQuery)
          );
        })
        .slice(0, 5)
        .map(expense => ({
          text: expense.description || `${expense.category} expense`,
          category: expense.category,
          amount: expense.amount,
          date: expense.date
        }));
        
      if (filteredExpenses.length > 0) {
        setSuggestions(filteredExpenses);
      } else {
        // Fallback to generated suggestions if no actual expenses match
        const searchResults = getSearchSuggestions(searchQuery);
        setSuggestions(searchResults);
      }
      setShowSuggestions(true);
    }
  }, [searchQuery, expenses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results
    navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    onOpenChange(false);
    
    // Show toast
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"`,
    });
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    navigate(`/reports?search=${encodeURIComponent(suggestion.text)}&category=${encodeURIComponent(suggestion.category)}`);
    setShowSuggestions(false);
    onOpenChange(false);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setDateFilter("");
    setAmountRange([0, 10000]);
    setActiveTab("all");
  };

  // Handle input changes directly
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md fixed top-[10%] left-[50%] -translate-x-[50%] z-[999]">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between">
            <span>Search</span>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={showFilters ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={toggleFilters}
              >
                <Filter className="h-3 w-3 mr-1" />
                Filters
              </Badge>
              {(categoryFilter || dateFilter || amountRange[0] > 0 || amountRange[1] < 10000) && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Search for expenses by description, category, or amount
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="space-y-4 mt-2">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                ref={searchInputRef}
                placeholder="Search expenses, groups, etc..."
                value={searchQuery}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 h-10 rounded-full border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-food-orange/80"
                autoComplete="off"
                autoFocus
              />
            </div>
            
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded">
              Query: "{searchQuery}", Results: {suggestions.length}
            </div>
            
            {/* Always show suggestions when search dialog is open */}
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl border z-[9999] max-h-[300px] overflow-y-auto backdrop-blur-md bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700"
              style={{
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Section header for suggestions */}
              <div className="px-4 py-2 sticky top-0 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b">
                <span className="text-xs font-medium">
                  {searchQuery ? 'Search Results' : 'Recent Transactions'}
                </span>
              </div>

              {suggestions.length > 0 ? (
                // Show suggestions
                suggestions.map((suggestion, i) => (
                  <div 
                    key={i}
                    className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                      mode === 'dark'
                        ? 'hover:bg-gray-700/90 text-white border-b border-gray-700' 
                        : 'hover:bg-gray-50 text-gray-800 border-b border-gray-100'
                    } ${i === suggestions.length - 1 ? 'border-b-0' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <Search className={`h-4 w-4 mr-3 flex-shrink-0 ${
                        mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                      <div className="truncate">
                        <span className="block font-medium truncate">{suggestion.text}</span>
                        {suggestion.date && (
                          <span className={`text-xs flex items-center mt-0.5 ${
                            mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(suggestion.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center ml-4 flex-shrink-0">
                      {suggestion.amount !== undefined && (
                        <span className={`text-sm font-medium px-2 py-1 rounded-md mr-2 ${
                          mode === 'dark' 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          ₹{suggestion.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                      <Badge variant="outline" className={`mr-2 ${
                        mode === 'dark' 
                          ? 'border-gray-600 bg-gray-700/50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        {suggestion.category}
                      </Badge>
                      <ArrowRight className={`h-4 w-4 ${
                        mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  No matches found. Try a different search term.
                </div>
              )}

              {/* View All link */}
              <div 
                className={`px-4 py-2 cursor-pointer text-center ${
                  mode === 'dark'
                    ? 'hover:bg-gray-700/90 text-food-orange border-t border-gray-700' 
                    : 'hover:bg-gray-50 text-food-orange border-t border-gray-100'
                }`}
                onClick={() => {
                  navigate(`/reports?search=${encodeURIComponent(searchQuery.trim() || 'recent')}`);
                  onOpenChange(false);
                }}
              >
                <span className="text-sm font-medium">View All Expenses</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-food-orange hover:bg-food-orange/90">Search</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
