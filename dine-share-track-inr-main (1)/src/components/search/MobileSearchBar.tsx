import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search, TrendingUp, Clock, BarChart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './search-bar';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/data/types';
import { filterExpensesBySearchTerm } from '@/hooks/useDebounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface MobileSearchBarProps {
  onClose: () => void;
  mode: 'dark' | 'light';
}

interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  color: string;
}

const MobileSearchBar: React.FC<MobileSearchBarProps> = ({ onClose, mode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { expenses } = useExpenses();
  const [recentSearches] = useLocalStorage<string[]>('recent-searches', []);
  
  const handleSearch = (query: string) => {
    navigate(`/reports?search=${encodeURIComponent(query)}`);
    onClose();
  };

  const quickLinks: QuickLinkProps[] = [
    { 
      icon: <TrendingUp className="h-5 w-5" />, 
      label: "Expense Reports", 
      path: "/reports",
      color: "bg-gradient-to-r from-orange-400 to-red-500"
    },
    { 
      icon: <Clock className="h-5 w-5" />, 
      label: "Recent Activity", 
      path: "/dashboard",
      color: "bg-gradient-to-r from-blue-400 to-indigo-500"
    },
    { 
      icon: <BarChart className="h-5 w-5" />, 
      label: "All Reports", 
      path: "/reports?view=all",
      color: "bg-gradient-to-r from-emerald-400 to-teal-500"
    },
    { 
      icon: <Users className="h-5 w-5" />, 
      label: "My Groups", 
      path: "/groups",
      color: "bg-gradient-to-r from-purple-400 to-pink-500"
    }
  ];

  const handleQuickLinkClick = (path: string) => {
    navigate(path);
    onClose();
  };

  // Get popular categories for the tabs
  const categories = [...new Set(expenses.map(expense => expense.category))].slice(0, 5);

  return (
    <motion.div 
      className="fixed inset-0 bg-white dark:bg-gray-900 z-[200] flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-food-orange bg-clip-text text-transparent">
          MealSync Search
        </h2>
          <Button 
            size="icon" 
            variant="ghost" 
            type="button"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      
      <div className="p-4 flex-grow flex flex-col">
        {/* Search Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <SearchBar 
            placeholder="Search expenses, groups..." 
            onSearch={handleSearch} 
            mode={mode} 
          />
        </div>
      
        {/* Categories Tab */}
        <div className="mb-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-lg h-10">
              <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
              <TabsTrigger value="recent" className="rounded-lg text-xs">Recent</TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-lg text-xs">Favorites</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Quick Links */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((link, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleQuickLinkClick(link.path)}
                className={`${link.color} p-4 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="text-white flex flex-col items-center text-center">
                  <div className="mb-1">{link.icon}</div>
                  <div className="text-sm font-medium">{link.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Popular Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Popular Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, i) => (
              <motion.div
              key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-food-orange/10 hover:text-food-orange hover:border-food-orange/30 transition-colors"
                  onClick={() => {
                    navigate(`/reports?category=${encodeURIComponent(category)}`);
                    onClose();
                  }}
                >
                  <Search className="h-3 w-3 mr-1" />
                  {category}
                </Badge>
              </motion.div>
            ))}
              </div>
              </div>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      navigate(`/reports?search=${encodeURIComponent(search)}`);
                      onClose();
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center mt-auto mb-4 text-xs text-gray-500 dark:text-gray-400">
          <p>Try searching by description, category, or amount</p>
        </div>
    </div>
    </motion.div>
  );
};

export default MobileSearchBar;
