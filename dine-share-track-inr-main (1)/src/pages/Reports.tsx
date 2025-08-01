import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useExpenses } from '@/hooks/useExpenses';
import Layout from '@/components/Layout';
import { Expense, ExpenseCategory, DateRange } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, subMonths, subYears, differenceInDays } from 'date-fns';
import { Loader2, FileDown, Check, FileText, Search, Filter, Group, ArrowDownAZ, ArrowUpAZ, BarChart3, PieChart, TrendingUp, Calendar, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

const Reports: React.FC = () => {
  const { expenses } = useExpenses();
  const [userProfile] = useLocalStorage('userProfile', { name: 'User', email: '', phone: '' });
  const { exportToPdf, isExporting } = usePdfExport();
  
  // Filter states
  const [startDate, setStartDate] = useState<string>(
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('report');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [showAnimation, setShowAnimation] = useState(true);

  // Animation control
  useEffect(() => {
    // Reset animation state when tab changes
    setShowAnimation(true);
    
    // Turn off animations after they've played
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTab, chartType]);

  // Predefined time periods
  const timeOptions = [
    { label: 'Last 7 days', value: 'week' },
    { label: 'Last 30 days', value: 'month' },
    { label: 'Last 3 months', value: 'quarter' },
    { label: 'Last year', value: 'year' },
    { label: 'All time', value: 'all' },
    { label: 'Custom range', value: 'custom' },
  ];

  const [timePeriod, setTimePeriod] = useState('month');

  // Category options
  const categories: { value: ExpenseCategory; label: string }[] = [
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'groceries', label: 'Groceries' },
    { value: 'other', label: 'Other' },
  ];

  // Extract unique groups from expenses
  const availableGroups = useMemo(() => {
    const groups = expenses
      .filter(expense => expense.groupId)
      .map(expense => ({ 
        id: expense.groupId, 
        name: expense.groupId || 'Unknown Group' 
      }));
    
    // Remove duplicates
    return Array.from(new Map(groups.map(group => [group.id, group])).values());
  }, [expenses]);

  // Filter expenses based on all criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // Set to end of day
      
      // Filter by date range
      if (expenseDate < startDateObj || expenseDate > endDateObj) {
        return false;
      }
      
      // Filter by categories if any selected
      if (selectedCategories.length > 0 && !selectedCategories.includes(expense.category)) {
        return false;
      }
      
      // Filter by groups if any selected
      if (selectedGroups.length > 0 && (!expense.groupId || !selectedGroups.includes(expense.groupId))) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          expense.description?.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower) ||
          (expense.groupId || '').toLowerCase().includes(searchLower) ||
          new Date(expense.date).toLocaleDateString().includes(searchTerm)
        );
      }
      
      return true;
    });
  }, [expenses, startDate, endDate, selectedCategories, searchTerm, selectedGroups]);

  // Sort expenses by date
  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredExpenses, sortOrder]);

  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);

    const today = new Date();
    let newStartDate;

    switch (value) {
      case 'week':
        newStartDate = subDays(today, 7);
        break;
      case 'month':
        newStartDate = subDays(today, 30);
        break;
      case 'quarter':
        newStartDate = subMonths(today, 3);
        break;
      case 'year':
        newStartDate = subYears(today, 1);
        break;
      case 'all':
        // Find the earliest expense date or default to one year ago
        if (expenses.length > 0) {
          const dates = expenses.map(exp => new Date(exp.date).getTime());
          newStartDate = new Date(Math.min(...dates));
        } else {
          newStartDate = subYears(today, 1);
        }
        break;
      default: // 'custom' or fallback
        return; // Don't change the dates for custom
    }

    setStartDate(format(newStartDate, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
  };

  // Toggle category selection
  const handleCategoryChange = (category: ExpenseCategory, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  // Toggle group selection
  const handleGroupChange = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // State for watermark settings
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [useWatermark, setUseWatermark] = useState<boolean>(false);

  // Handle PDF export with username
  const handleExport = () => {
    const dateRange: DateRange = {
      startDate,
      endDate,
    };

    // Configure watermark options if enabled
    const watermarkOptions = useWatermark ? {
      text: watermarkText,
      opacity: 0.25,
      fontSize: 60,
      color: '#888888',
      rotation: -45,
      repeat: true
    } : undefined;

    exportToPdf('Dinner Expense Report', {
      dateRange,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      groupId: selectedGroups.length > 0 ? selectedGroups[0] : undefined,
      userName: userProfile.name || 'User',
      watermarkOptions
    });
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  // Prepare data for charts
  const categoryChartData = useMemo(() => {
    const categoryTotals = sortedExpenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sortedExpenses]);

  // Prepare daily expense data for line chart
  const dailyExpenseData = useMemo(() => {
    const dailyData: Record<string, number> = {};
    
    // Initialize all dates in range with 0
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = differenceInDays(end, start) + 1;
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dailyData[dateKey] = 0;
    }
    
    // Fill with actual expense data
    sortedExpenses.forEach(expense => {
      const expenseDate = format(new Date(expense.date), 'yyyy-MM-dd');
      if (dailyData[expenseDate] !== undefined) {
        dailyData[expenseDate] += expense.amount;
      }
    });
    
    // Convert to array for recharts
    return Object.entries(dailyData)
      .map(([date, amount]) => ({
        date: format(new Date(date), 'MMM dd'),
        amount,
        fullDate: date
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [sortedExpenses, startDate, endDate]);

  // Category colors for pie chart
  const CATEGORY_COLORS = {
    lunch: '#FF7E45',  // food-orange
    dinner: '#FFC107', // food-yellow
    breakfast: '#2196F3', // food-blue
    snacks: '#4CAF50', // food-green
    beverages: '#9C27B0', // purple
    groceries: '#009688', // teal
    other: '#607D8B'  // blue-gray
  };

  // Get color for category
  const getCategoryColor = (category: string): string => {
    return (CATEGORY_COLORS as Record<string, string>)[category] || '#607D8B';
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-food-orange to-food-yellow rounded-lg p-2.5 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Export</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Analyze your expenses and export data for the selected period
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="shrink-0"
                    onClick={toggleSortOrder}
                  >
                    {sortOrder === 'asc' ? 
                      <ArrowUpAZ className="h-4 w-4" /> : 
                      <ArrowDownAZ className="h-4 w-4" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          
          <Menubar className="border-none">
            <MenubarMenu>
              <MenubarTrigger className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                <Search className="h-5 w-5" />
              </MenubarTrigger>
              <MenubarContent align="end" className="w-72">
                <div className="p-2">
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
        </motion.div>

        <Tabs defaultValue="report" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="report" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-food-orange/20 data-[state=active]:to-food-yellow/20">
              <FileText className="h-4 w-4 mr-2" />
              Generate Reports
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-food-green/20 data-[state=active]:to-food-blue/20">
              <Filter className="h-4 w-4 mr-2" />
              View Expenses
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-food-blue/20 data-[state=active]:to-food-green/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
          </TabsList>
          
          <motion.div 
            initial={showAnimation ? { opacity: 0, y: 10 } : false}
            animate={showAnimation ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Card className="shadow-sm border border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="time-period">Time Period</Label>
                    <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                      <SelectTrigger id="time-period" className="mt-1">
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {timePeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-end">
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <TabsContent value="report" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div 
                initial={showAnimation ? { opacity: 0, y: 20 } : false}
                animate={showAnimation ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.4 }}
                className="md:col-span-2 lg:col-span-2"
              >
                <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-border/50">
                <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-food-orange" />
                    Generate Reports
                  </CardTitle>
                    <CardDescription>
                      Customize and export your expense data to PDF
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categories</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {categories.map((category) => (
                            <div
                              key={category.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`category-${category.value}`}
                                checked={selectedCategories.includes(category.value)}
                                onCheckedChange={(checked) =>
                                  handleCategoryChange(category.value, checked === true)
                                }
                                className="data-[state=checked]:bg-food-orange data-[state=checked]:border-food-orange"
                              />
                              <Label
                                htmlFor={`category-${category.value}`}
                                className="text-sm font-normal"
                              >
                                {category.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {availableGroups.length > 0 && (
                        <div className="space-y-2">
                          <Label>Groups</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {availableGroups.map((group) => (
                              <div
                                key={group.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`group-${group.id}`}
                                  checked={selectedGroups.includes(group.id)}
                                  onCheckedChange={(checked) =>
                                    handleGroupChange(group.id, checked === true)
                                  }
                                  className="data-[state=checked]:bg-food-green data-[state=checked]:border-food-green"
                                />
                                <Label
                                  htmlFor={`group-${group.id}`}
                                  className="text-sm font-normal"
                                >
                                  {group.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Watermark options */}
                    <div className="border rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox 
                          id="use-watermark" 
                          checked={useWatermark}
                          onCheckedChange={(checked) => setUseWatermark(checked as boolean)}
                        />
                        <Label 
                          htmlFor="use-watermark" 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Add watermark to PDF
                        </Label>
                      </div>
                      
                      {useWatermark && (
                        <div className="grid gap-2">
                          <Label htmlFor="watermark-text">Watermark Text</Label>
                          <Input
                            id="watermark-text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="Enter watermark text"
                            className="mb-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            This text will appear as a diagonal watermark across each page of the PDF.
                          </p>
                        </div>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                    <Button
                      onClick={handleExport}
                      className="w-full bg-gradient-to-r from-food-orange to-food-yellow hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-4 w-4" />
                          Export to PDF
                        </>
                      )}
                    </Button>
                      </motion.div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              <motion.div 
                initial={showAnimation ? { opacity: 0, y: 20 } : false}
                animate={showAnimation ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-3d h-full border border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-food-green" />
                      Export Options
                    </CardTitle>
                    <CardDescription>
                      Choose a format for your data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">
                      Export your expense data in different formats for your records or
                      further analysis.
                    </p>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-3 py-3 rounded-md bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-900/50">
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 dark:bg-green-800 rounded-full p-1">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        <span className="font-medium">PDF Report</span>
                          </div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-3 border-b">
                          <span className="font-medium flex items-center gap-2">
                            <div className="opacity-50">
                              <FileDown className="h-4 w-4" />
                            </div>
                            CSV Export
                          </span>
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-none">Coming Soon</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-3 border-b">
                          <span className="font-medium flex items-center gap-2">
                            <div className="opacity-50">
                              <FileDown className="h-4 w-4" />
                            </div>
                            Excel Export
                          </span>
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-none">Coming Soon</Badge>
                      </div>
                        
                        <div className="flex items-center justify-between py-3 px-3">
                          <span className="font-medium flex items-center gap-2">
                            <div className="opacity-50">
                              <FileDown className="h-4 w-4" />
                      </div>
                            Google Sheets
                          </span>
                          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-none">Coming Soon</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <motion.div
              initial={showAnimation ? { opacity: 0, y: 10 } : false}
              animate={showAnimation ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-food-green" />
                    Expense List
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of your filtered expenses
                  </CardDescription>
              </CardHeader>
                <CardContent className="pt-6">
                {sortedExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                            <TableHead 
                              onClick={toggleSortOrder} 
                              className="cursor-pointer flex items-center gap-1"
                            >
                              <Calendar className="h-4 w-4" />
                              Date {sortOrder === 'asc' ? 
                                <ArrowUpAZ className="h-3.5 w-3.5 ml-1" /> : 
                                <ArrowDownAZ className="h-3.5 w-3.5 ml-1" />
                              }
                          </TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                          {sortedExpenses.map((expense, index) => (
                            <motion.tr
                              key={expense.id}
                              initial={showAnimation ? { opacity: 0, y: 10 } : false}
                              animate={showAnimation ? { opacity: 1, y: 0 } : false}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className="[&>td]:border-b [&>td]:py-3"
                            >
                            <TableCell>
                              {format(new Date(expense.date), 'MMM dd, yyyy')}
                            </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className="capitalize flex items-center gap-1"
                                  style={{ borderColor: getCategoryColor(expense.category) + '40' }}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                                  />
                                  {expense.category}
                                </Badge>
                              </TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                              <TableCell>
                                {expense.groupId ? (
                                  <Badge variant="secondary" className="bg-food-blue/10 text-food-blue font-normal">
                                    {expense.groupId}
                                  </Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </TableCell>
                            </motion.tr>
                        ))}
                          <TableRow className="font-medium bg-muted/30">
                          <TableCell colSpan={4} className="text-right">
                            Total
                          </TableCell>
                            <TableCell className="text-right text-lg font-bold text-food-orange">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <div className="bg-muted rounded-full p-4 mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Expenses Found</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-md">
                        No expenses match your current filters. Try adjusting your date range or search criteria.
                      </p>
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {sortedExpenses.length > 0 ? (
              <motion.div 
                initial={showAnimation ? { opacity: 0, y: 10 } : false}
                animate={showAnimation ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-food-blue/10 to-food-green/10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Expense Trends</CardTitle>
                      <CardDescription>Daily expense pattern over time</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`${chartType === 'line' ? 'bg-background/80' : ''}`}
                              onClick={() => setChartType('line')}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Line Chart</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`${chartType === 'bar' ? 'bg-background/80' : ''}`}
                              onClick={() => setChartType('bar')}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bar Chart</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[300px] w-full">
                      {chartType === 'bar' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dailyExpenseData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }} 
                              angle={-45} 
                              textAnchor="end" 
                              tickMargin={10}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="p-2 bg-background border rounded shadow-md">
                                      <p className="font-medium text-sm">{payload[0].payload.date}</p>
                                      <p className="text-sm">₹{payload[0].value.toLocaleString('en-IN')}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="amount" 
                              fill="#FF7E45" 
                              radius={[4, 4, 0, 0]}
                              animationDuration={800}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyExpenseData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }} 
                              angle={-45} 
                              textAnchor="end" 
                              tickMargin={10}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="p-2 bg-background border rounded shadow-md">
                                      <p className="font-medium text-sm">{payload[0].payload.date}</p>
                                      <p className="text-sm">₹{payload[0].value.toLocaleString('en-IN')}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="amount" 
                              stroke="#FF7E45" 
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#FF7E45", strokeWidth: 1, stroke: "#fff" }}
                              activeDot={{ r: 6, fill: "#FF7E45", strokeWidth: 1, stroke: "#fff" }}
                              animationDuration={800}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10">
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Distribution by expense category</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            innerRadius={30}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => {
                              const percentValue = percent !== undefined ? Number(percent) : 0;
                              return `${name} (${Math.round(percentValue * 100)}%)`;
                            }}
                            animationDuration={800}
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="p-2 bg-background border rounded shadow-md">
                                    <p className="font-medium text-sm capitalize">{payload[0].name}</p>
                                    <p className="text-sm">₹{payload[0].value.toLocaleString('en-IN')}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {((Number(payload[0].value) / totalAmount) * 100).toFixed(1)}% of total
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    No expenses found for the selected filters. Try adjusting your date range or filters to see expense data.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="bg-gradient-to-r from-food-green/5 to-food-blue/5">
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Overview of your expense data</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {sortedExpenses.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div 
                        initial={showAnimation ? { scale: 0.9, opacity: 0 } : false}
                        animate={showAnimation ? { scale: 1, opacity: 1 } : false}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-food-orange/10 to-food-yellow/10 border border-food-orange/20 flex flex-col"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-1">Total Expenses</div>
                        <div className="text-3xl font-bold text-food-orange">₹{totalAmount.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(startDate), 'MMM dd')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                      </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={showAnimation ? { scale: 0.9, opacity: 0 } : false}
                        animate={showAnimation ? { scale: 1, opacity: 1 } : false}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-food-green/10 to-food-blue/10 border border-food-green/20 flex flex-col"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-1">Total Transactions</div>
                        <div className="text-3xl font-bold text-food-green">{sortedExpenses.length}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {selectedCategories.length > 0 ? `${selectedCategories.length} categories selected` : 'All categories'}
                      </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={showAnimation ? { scale: 0.9, opacity: 0 } : false}
                        animate={showAnimation ? { scale: 1, opacity: 1 } : false}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="p-6 rounded-xl bg-gradient-to-br from-food-blue/10 to-food-green/10 border border-food-blue/20 flex flex-col"
                      >
                        <div className="text-sm font-medium text-muted-foreground mb-1">Average Per Day</div>
                        <div className="text-3xl font-bold text-food-blue">
                          ₹{(totalAmount / Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {differenceInDays(new Date(endDate), new Date(startDate)) + 1} days in range
                      </div>
                      </motion.div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Category Breakdown</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">% of Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categoryChartData.map((item) => {
                              const percentage = (item.value / totalAmount) * 100;
                              return (
                                <TableRow key={item.name}>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: getCategoryColor(item.name) }}></div>
                                      <span className="capitalize">{item.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ₹{item.value.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <span>{percentage.toFixed(1)}%</span>
                                      <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${percentage}%`,
                                            backgroundColor: getCategoryColor(item.name)
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No expenses found for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
