import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Expense, ExpenseCategory } from '@/data/types';
import { useExpenses } from '@/hooks/useExpenses';
import { ArrowUp, ArrowDown, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Helper to group expenses by category
const groupByCategory = (expenses: Expense[]) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += expense.amount;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);
};

// Helper to group expenses by day
const groupByDay = (expenses: Expense[], days = 7) => {
  const today = new Date();
  const result: Record<string, number> = {};
  
  // Initialize last 7 days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result[dateStr] = 0;
  }
  
  // Sum expenses for each day
  expenses.forEach(expense => {
    if (!expense.date) return; // Skip expenses without dates
    const expenseDate = expense.date.split('T')[0];
    if (result[expenseDate] !== undefined) {
      result[expenseDate] += expense.amount;
    }
  });
  
  return Object.entries(result).map(([date, value]) => ({
    date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    amount: value
  }));
};

// Calculate percentage change
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const COLORS = ['#FF7E45', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#607D8B'];

interface ExpenseSummaryProps {
  forceUpdate?: number;
}

// Insight Card Component
const InsightCard: React.FC<{title: string; value: string; subtitle: string; icon: React.ReactNode; change?: number}> = 
  ({title, value, subtitle, icon, change}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 capitalize">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center mt-3 text-xs",
            change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500"
          )}>
            {change > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : 
             change < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : null}
            <span>{Math.abs(change).toFixed(1)}% {change > 0 ? "increase" : change < 0 ? "decrease" : "change"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ forceUpdate }) => {
  // Use the expenses hook directly to get the latest data
  const { expenses, refreshData } = useExpenses();
  const [updateTrigger, setUpdateTrigger] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to force refresh the component
  const forceRefresh = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      refreshData();
      setUpdateTrigger(Date.now());
      // Use a longer timeout to ensure all data is loaded
      setTimeout(() => setLoading(false), 800);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Could not refresh data. Please try again.");
      setLoading(false);
    }
  }, [refreshData]);
  
  // Force a refresh whenever the component receives new props or expenses change
  useEffect(() => {
    try {
      // Set loading state
      setLoading(true);
      setError(null);
      
      // Refresh the data
      refreshData();
      
      // Create a new update trigger to force remounting of chart components
      const newTrigger = Date.now();
      setUpdateTrigger(newTrigger);
      
      // Use a timeout to ensure state updates have time to propagate
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Error in useEffect:", err);
      setError("Could not load expense data. Please try again.");
      setLoading(false);
    }
  }, [refreshData, forceUpdate]);
  
  // Calculate total spent
  const totalSpent = useMemo(() => {
    try {
      return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    } catch (err) {
      console.error("Error calculating total spent:", err);
      return 0;
    }
  }, [expenses]);
  
  const today = new Date();
  const todaysExpenses = useMemo(() => {
    try {
      return expenses.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date).toDateString();
        return expenseDate === today.toDateString();
      });
    } catch (err) {
      console.error("Error filtering today's expenses:", err);
      return [];
    }
  }, [expenses, today]);
  
  const todayTotal = useMemo(() => {
    try {
      return todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    } catch (err) {
      console.error("Error calculating today's total:", err);
      return 0;
    }
  }, [todaysExpenses]);
  
  // Get yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Calculate yesterday's expenses
  const yesterdayExpenses = useMemo(() => {
    try {
      return expenses.filter(expense => {
        if (!expense.date) return false;
        const expenseDate = new Date(expense.date).toDateString();
        return expenseDate === yesterday.toDateString();
      });
    } catch (err) {
      console.error("Error filtering yesterday's expenses:", err);
      return [];
    }
  }, [expenses, yesterday]);
  
  const yesterdayTotal = useMemo(() => {
    try {
      return yesterdayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    } catch (err) {
      console.error("Error calculating yesterday's total:", err);
      return 0;
    }
  }, [yesterdayExpenses]);
  
  // Calculate daily change percentage
  const dailyChangePercent = useMemo(() => {
    try {
      return calculateChange(todayTotal, yesterdayTotal);
    } catch (err) {
      console.error("Error calculating daily change:", err);
      return 0;
    }
  }, [todayTotal, yesterdayTotal]);
  
  // Use simplified data structures that don't depend on complex chart libraries
  const categoryData = useMemo(() => {
    try {
      const grouped = groupByCategory(expenses);
      return Object.values(grouped);
    } catch (err) {
      console.error("Error grouping by category:", err);
      return [];
    }
  }, [expenses]);
  
  const dailyData = useMemo(() => {
    try {
      return groupByDay(expenses, 7);
    } catch (err) {
      console.error("Error grouping by day:", err);
      return [];
    }
  }, [expenses]);
  
  // Generate unique keys for charts that change when expense data changes
  const visualizationKey = `visualization-${expenses.length}-${updateTrigger}-${new Date().getTime()}`;
  
  // Simplified view - just text and cards, no complex charts
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={forceRefresh}
          className="text-xs"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Charts"}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-4">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={forceRefresh} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-40 bg-muted rounded-md">
          <p className="mb-2">Loading charts...</p>
          <p className="text-xs text-muted-foreground">Please wait while we prepare your expense data</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 bg-muted/30 rounded-md p-6 text-center">
          <p className="text-lg font-medium mb-2">No expense data yet</p>
          <p className="text-sm text-muted-foreground">Add your first expense to see beautiful charts and insights</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard
              title="Total Spent"
              value={`₹${totalSpent.toLocaleString('en-IN')}`}
              icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              subtitle="All time expenses"
            />
            <InsightCard
              title="Today's Expenses"
              value={`₹${todayTotal.toLocaleString('en-IN')}`}
              icon={yesterdayTotal > 0 ? 
                dailyChangePercent > 0 ? <ArrowUp className="h-5 w-5 text-red-500" /> : 
                                          <ArrowDown className="h-5 w-5 text-green-500" /> :
                                          <TrendingUp className="h-5 w-5 text-blue-500" />}
              subtitle={today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
              change={yesterdayTotal > 0 ? dailyChangePercent : undefined}
            />
          </div>
          
          {/* Simplified category display */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10">
              <CardTitle className="text-md">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex justify-between items-center p-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 bg-${COLORS[index % COLORS.length].replace('#', '')}`} 
                           style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="capitalize">{category.name}</span>
                    </div>
                    <span className="font-medium">₹{category.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Simplified daily data display */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10">
              <CardTitle className="text-md">7-Day Spending</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {dailyData.map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-4">
                    <span>{day.date}</span>
                    <span className="font-medium">₹{day.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExpenseSummary;
