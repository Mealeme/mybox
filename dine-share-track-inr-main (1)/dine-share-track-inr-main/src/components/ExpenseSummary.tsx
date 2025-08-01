
import React, { useMemo, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, ExpenseCategory } from '@/data/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

// Helper to group expenses by category
const groupByCategory = (expenses: Expense[]) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, { name: string; value: number }>);
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

const COLORS = ['#FF7E45', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722', '#607D8B'];

const ExpenseSummary: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  // Add state to track changes in local storage
  const [localStorageUpdate, setLocalStorageUpdate] = useState<number>(Date.now());
  
  // Monitor for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const currentExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      setExpenses(currentExpenses);
      setLocalStorageUpdate(Date.now());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check for updates every 250ms - faster refresh rate
    const interval = setInterval(() => {
      try {
        const storedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        if (JSON.stringify(storedExpenses) !== JSON.stringify(expenses)) {
          setExpenses(storedExpenses);
          setLocalStorageUpdate(Date.now());
        }
      } catch (error) {
        console.error("Error checking for expense updates:", error);
      }
    }, 250);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [expenses, setExpenses]);
  
  // Force fresh calculations every time by adding a timestamp to useMemo deps
  const forceRefresh = useMemo(() => Date.now(), [expenses, localStorageUpdate]);
  
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, forceRefresh]);
  
  const today = new Date();
  const todaysExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date).toDateString();
      return expenseDate === today.toDateString();
    });
  }, [expenses, today, forceRefresh]);
  
  const todayTotal = useMemo(() => {
    return todaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [todaysExpenses, forceRefresh]);
  
  const categoryData = useMemo(() => {
    const grouped = groupByCategory(expenses);
    return Object.values(grouped);
  }, [expenses, forceRefresh]);
  
  const dailyData = useMemo(() => {
    return groupByDay(expenses, 7);
  }, [expenses, forceRefresh]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayTotal.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">{today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="daily">Daily Trend</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              {categoryData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}-${forceRefresh}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No expense data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="daily" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              {dailyData.some(day => day.amount > 0) ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Bar dataKey="amount" fill="#FF7E45" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">No expense data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseSummary;
