import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import SharedExpense from '@/components/SharedExpense';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useExpenses } from '@/hooks/useExpenses';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, PieChart, ArrowUpRight, Calendar, Clock, TrendingUp, WalletCards, Plus, X, Trash2, Edit2, ChevronDown, Filter, Search, Info, ChevronUp, Utensils, Coffee, Cookie, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { MagicHover } from '@/components/ui/magic-hover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseCategory, Expense } from '@/data/types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, differenceInDays } from 'date-fns';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';

const Dashboard: React.FC = () => {
  const { expenses, addExpense, deleteExpense, updateExpense } = useExpenses();
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState(0);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const navigate = useNavigate();
  
  // New expense form state
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'dinner' as ExpenseCategory,
    date: new Date().toISOString().slice(0, 10)
  });
  
  // Edit expense form state
  const [editExpense, setEditExpense] = useState({
    amount: '',
    description: '',
    category: 'dinner' as ExpenseCategory,
    date: ''
  });
  
  // Example statistics (can be replaced with real calculations)
  const stats = {
    totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    avgPerDay: expenses.length > 0 
      ? (expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2) 
      : 0,
    mostExpensive: expenses.length > 0 
      ? Math.max(...expenses.map(exp => exp.amount)) 
      : 0,
    mostCommonCategory: expenses.length > 0 
      ? Object.entries(
          expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A'
  };

  // Demo mode - no welcome notification needed

  // Force refresh whenever expenses change
  useEffect(() => {
    setLastUpdated(Date.now());
  }, [expenses]);
  
  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      } 
    })
  };
  
  // Handle expense form change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle edit form change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditExpense(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setNewExpense(prev => ({ ...prev, category: value as ExpenseCategory }));
  };
  
  // Handle edit category selection
  const handleEditCategoryChange = (value: string) => {
    setEditExpense(prev => ({ ...prev, category: value as ExpenseCategory }));
  };
  
  // Handle form submission
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    // Create new expense object
    addExpense({
      amount,
      description: newExpense.description,
      category: newExpense.category,
      date: new Date(newExpense.date).toISOString()
    });
    
    // Reset form and close dialog
    setNewExpense({
      amount: '',
      description: '',
      category: 'dinner' as ExpenseCategory,
      date: new Date().toISOString().slice(0, 10)
    });
    setIsAddExpenseOpen(false);
    
    // No notification needed
  };

  // Handle edit form submission
  const handleSubmitEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseToEdit) return;
    
    const amount = parseFloat(editExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    // Update expense
    updateExpense(expenseToEdit.id, {
      amount,
      description: editExpense.description,
      category: editExpense.category,
      date: new Date(editExpense.date).toISOString()
    });
    
    // Reset form and close dialog
    setExpenseToEdit(null);
    setIsEditExpenseOpen(false);
    
    // No notification needed
  };

  // Handle expense deletion
  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      const success = deleteExpense(expenseToDelete.id);
      // No notification needed for success or failure
      setExpenseToDelete(null);
      setIsDeleteAlertOpen(false);
    }
  };
  
  // Show delete confirmation
  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteAlertOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (expense: Expense) => {
    setExpenseToEdit(expense);
    setEditExpense({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: new Date(expense.date).toISOString().slice(0, 10)
    });
    setIsEditExpenseOpen(true);
  };

  // Toggle expense details expansion
  const toggleExpenseDetails = (id: string) => {
    if (expandedExpenseId === id) {
      setExpandedExpenseId(null);
    } else {
      setExpandedExpenseId(id);
    }
  };

  // Prepare data for trend chart - daily expenses for the last 30 days
  const trendData = useMemo(() => {
    // Get date range - last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    // Create array with all dates
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Map expenses to dates
    return dateRange.map(date => {
      const dailyExpenses = expenses.filter(expense => 
        isSameDay(parseISO(expense.date), date)
      );
      
      const total = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        date: format(date, 'MMM dd'),
        amount: total,
        fullDate: date
      };
    });
  }, [expenses]);

  // Prepare data for category breakdown
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (categoryTotals[expense.category]) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        categoryTotals[expense.category] = expense.amount;
      }
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [expenses]);

  // Prepare data for time distribution (expenses by day of week)
  const timeDistributionData = useMemo(() => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    
    expenses.forEach(expense => {
      const date = parseISO(expense.date);
      const dayOfWeek = date.getDay();
      dayTotals[dayOfWeek] += expense.amount;
    });
    
    return daysOfWeek.map((day, index) => ({
      day,
      amount: dayTotals[index]
    }));
  }, [expenses]);

  // Custom color palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B', '#54C5EB'];

  // Pie chart active sector rendering
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-midAngle * Math.PI / 180);
    const cos = Math.cos(-midAngle * Math.PI / 180);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`₹${value.toLocaleString('en-IN')} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };
  
  // Filter expenses for the recent transactions section
  const filteredTransactions = useMemo(() => {
    const sorted = [...expenses].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (categoryFilter === 'all') {
      return sorted;
    }
    
    return sorted.filter(expense => expense.category === categoryFilter);
  }, [expenses, categoryFilter]);
  
  // Get category icon based on category
const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
    case 'lunch':
    case 'dinner':
      return <Utensils className="h-4 w-4" />;
    case 'breakfast':
      return <Coffee className="h-4 w-4" />;
    case 'snacks':
      return <Cookie className="h-4 w-4" />;
    case 'beverages':
      return <Coffee className="h-4 w-4" />;
    case 'groceries':
      return <ShoppingBag className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

  // Get category color
const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
    case 'lunch':
      return 'from-amber-500 to-orange-500';
    case 'dinner':
      return 'from-indigo-500 to-purple-600';
    case 'breakfast':
      return 'from-blue-500 to-cyan-500';
    case 'snacks':
      return 'from-lime-500 to-green-500';
    case 'beverages':
      return 'from-rose-500 to-pink-600';
    case 'groceries':
      return 'from-emerald-500 to-teal-600';
    default:
      return 'from-gray-500 to-slate-600';
  }
};
  
  // Handle navigation to Transactions page
  const navigateToTransactions = () => {
    navigate('/transactions');
  };

  return (
    <Layout>
          <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Your financial overview at a glance</p>
          </div>
          <div className="flex gap-2 items-center">
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md backdrop-blur-sm border border-border/50 shadow-lg">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Create a new expense with date selection
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitExpense}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount (₹)
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Lunch with friends"
                        value={newExpense.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select 
                        value={newExpense.category} 
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                          <SelectItem value="groceries">Groceries</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={newExpense.date}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsAddExpenseOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90">Add Expense</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" className="text-sm flex items-center gap-2 bg-primary/5 hover:bg-primary/10">
              <Clock className="h-4 w-4" />
              Last updated {new Date(lastUpdated).toLocaleTimeString()}
            </Button>
          </div>
                      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Total Spent", 
              value: `₹${stats.totalSpent.toLocaleString('en-IN')}`, 
              description: "Overall spending", 
              icon: <WalletCards className="h-5 w-5 text-white" />,
              color: "from-blue-500 to-indigo-600"
            },
            { 
              title: "Avg. Per Transaction", 
              value: `₹${stats.avgPerDay}`, 
              description: "Average expense", 
              icon: <TrendingUp className="h-5 w-5 text-white" />,
              color: "from-green-500 to-emerald-600"
            },
            { 
              title: "Highest Expense", 
              value: `₹${stats.mostExpensive.toLocaleString('en-IN')}`, 
              description: "Most expensive transaction", 
              icon: <ArrowUpRight className="h-5 w-5 text-white" />,
              color: "from-red-500 to-rose-600"
            },
            { 
              title: "Popular Category", 
              value: stats.mostCommonCategory, 
              description: "Most frequent category", 
              icon: <Calendar className="h-5 w-5 text-white" />,
              color: "from-purple-500 to-violet-600" 
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <MagicHover variant="primary" className="overflow-hidden border-none rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      <p className="text-xs text-white/70 mt-1">{stat.description}</p>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-md">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </MagicHover>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:w-[400px] p-1 bg-muted/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <PieChart className="h-4 w-4" />
              <span>Breakdown</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Card */}
              <MagicHover variant="secondary" className="col-span-2 border-none rounded-lg shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pb-2 pt-6">
                  <CardTitle>Expense Trend</CardTitle>
                  <CardDescription>Your spending pattern over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-80 pt-6">
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => value}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                          labelFormatter={(label) => `Date: ${label}`}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            backdropFilter: 'blur(8px)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name="Expenses"
                          stroke="#0088FE"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          dot={{ strokeWidth: 1, r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No expense data to display</p>
                    </div>
                  )}
                </CardContent>
              </MagicHover>

              {/* Share & Download */}
              <div className="col-span-1">
                <SharedExpense expenses={expenses} />
              </div>
            </div>
            
            {/* Recent Transactions */}
            <MagicHover variant="shine" className="border-none rounded-lg shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-border/30">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest expenses</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1 bg-background/80 backdrop-blur-sm"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {categoryFilter !== 'all' ? (
                          <Badge className="ml-1 bg-primary/80">{categoryFilter}</Badge>
                        ) : (
                          <span>Filter</span>
                        )}
                          </Button>
                        </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 backdrop-blur-sm border border-border/50 shadow-lg bg-background/80">
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                            All Categories
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('lunch')}>
                            Lunch
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('dinner')}>
                            Dinner
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('breakfast')}>
                            Breakfast
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('snacks')}>
                            Snacks
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('beverages')}>
                            Beverages
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('groceries')}>
                            Groceries
                          </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCategoryFilter('other')}>
                            Other
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                        <Button 
                    variant="outline" 
                          size="sm" 
                    className="flex items-center gap-1 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsAddExpenseOpen(true)}
                        >
                    <Plus className="h-3.5 w-3.5" />
                    Add Expense
                        </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredTransactions.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {filteredTransactions.slice(0, 5).map((expense, index) => (
                      <Collapsible 
                        key={expense.id}
                        open={expandedExpenseId === expense.id}
                        onOpenChange={() => {}}
                      >
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-transparent hover:bg-muted/30 transition-colors group"
                        >
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => toggleExpenseDetails(expense.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColor(expense.category)} text-white shadow-md`}>
                                {getCategoryIcon(expense.category)}
                              </div>
                              <div>
                                <p className="font-medium">{expense.description || expense.category}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(expense.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">₹{expense.amount.toLocaleString('en-IN')}</p>
                              <div className="flex items-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 hover:bg-blue-500/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(expense);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(expense);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    {expandedExpenseId === expense.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="p-4 pt-0 bg-muted/10 backdrop-blur-sm">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Category</p>
                                  <p className="font-medium capitalize">{expense.category}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Date</p>
                                  <p className="font-medium">{new Date(expense.date).toLocaleDateString(undefined, { 
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                  })}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Amount</p>
                                  <p className="font-medium">₹{expense.amount.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Time Added</p>
                                  <p className="font-medium">{new Date(expense.date).toLocaleTimeString()}</p>
                                </div>
                                {expense.description && (
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Description</p>
                                    <p className="font-medium">{expense.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </motion.div>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                      <Filter className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {categoryFilter !== 'all' 
                        ? `No transactions found in the "${categoryFilter}" category` 
                        : "No transactions to display"}
                    </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                      onClick={() => setIsAddExpenseOpen(true)}
                        >
                      Add an Expense
                        </Button>
                    </div>
                  )}
              </CardContent>
              {filteredTransactions.length > 0 && (
                <CardFooter className="justify-center border-t border-border/30 p-4">
                  <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={navigateToTransactions}>
                    View All Transactions
                  </Button>
                </CardFooter>
              )}
            </MagicHover>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MagicHover variant="primary" className="border-none rounded-lg shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500/5 to-violet-500/5 pb-2 pt-6">
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Your expenses by category</CardDescription>
                </CardHeader>
                <CardContent className="h-80 pt-6">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          iconSize={10}
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{ paddingLeft: '20px' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No category data to display</p>
          </div>
                  )}
                </CardContent>
              </MagicHover>

              <MagicHover variant="secondary" className="border-none rounded-lg shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 pb-2 pt-6">
                  <CardTitle>Time Distribution</CardTitle>
                  <CardDescription>When you spend the most</CardDescription>
                </CardHeader>
                <CardContent className="h-80 pt-6">
                  {timeDistributionData.some(item => item.amount > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timeDistributionData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 30,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="day" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                            backdropFilter: 'blur(8px)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <Bar 
                          dataKey="amount" 
                          name="Amount" 
                          radius={[4, 4, 0, 0]}
                        >
                          {timeDistributionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>No time distribution data to display</p>
                    </div>
                  )}
                </CardContent>
              </MagicHover>
        </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="backdrop-blur-sm border border-border/50 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense
              {expenseToDelete && (
                <span className="block mt-2 font-medium">
                  {expenseToDelete.description || expenseToDelete.category} - ₹{expenseToDelete.amount.toLocaleString('en-IN')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm border border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the details of your expense
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEditExpense}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">
                  Amount (₹)
                </Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editExpense.amount}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
                  </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  name="description"
                  placeholder="Lunch with friends"
                  value={editExpense.description}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                />
                    </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select 
                  value={editExpense.category} 
                  onValueChange={handleEditCategoryChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={editExpense.date}
                  onChange={handleEditInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
          <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEditExpenseOpen(false)}>
              Cancel
            </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90">Update Expense</Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Dashboard;
