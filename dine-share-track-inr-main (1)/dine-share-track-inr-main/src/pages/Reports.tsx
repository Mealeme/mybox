
import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePdfExport } from '@/hooks/usePdfExport';
import Layout from '@/components/Layout';
import { Expense, ExpenseCategory, DateRange } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Loader2, FileDown, Check, FileText, Search, Filter, Group, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
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

const Reports: React.FC = () => {
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
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

  // Handle PDF export with username
  const handleExport = () => {
    const dateRange: DateRange = {
      startDate,
      endDate,
    };

    exportToPdf('Dinner Expense Report', {
      dateRange,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      groupId: selectedGroups.length > 0 ? selectedGroups[0] : undefined,
      userName: userProfile.name || 'User',
    });
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  return (
    <Layout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Reports & Export</h1>
          
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

        <Tabs defaultValue="report" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="report">Generate Reports</TabsTrigger>
            <TabsTrigger value="expenses">View Expenses</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          
          <div className="mb-4">
            <Card className="shadow-sm">
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

                  <div className="flex items-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="shrink-0"
                      onClick={toggleSortOrder}
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {sortOrder === 'asc' ? 
                        <ArrowUpAZ className="h-4 w-4" /> : 
                        <ArrowDownAZ className="h-4 w-4" />
                      }
                    </Button>
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
          </div>

          <TabsContent value="report" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="md:col-span-2 lg:col-span-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-food-orange" />
                    Generate Reports
                  </CardTitle>
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
                  </div>
                </CardContent>
              </Card>

              <Card className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 card-3d">
                <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10 rounded-t-lg">
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-muted-foreground">
                      Export your expense data in different formats for your records or
                      further analysis.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">PDF Report</span>
                        <div className="bg-green-100 rounded-full p-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">CSV Export</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="font-medium">Excel Export</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="font-medium">Google Sheets</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-muted-foreground">Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense List</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead onClick={toggleSortOrder} className="cursor-pointer">
                            Date {sortOrder === 'asc' ? '↑' : '↓'}
                          </TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              {format(new Date(expense.date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="capitalize">{expense.category}</TableCell>
                            <TableCell>{expense.description || '-'}</TableCell>
                            <TableCell>{expense.groupId || '-'}</TableCell>
                            <TableCell className="text-right">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-medium">
                          <TableCell colSpan={4} className="text-right">
                            Total
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No expenses found for the selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedExpenses.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                        <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-muted-foreground">Total Transactions</div>
                        <div className="text-2xl font-bold">{sortedExpenses.length}</div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <div className="text-sm text-muted-foreground">Date Range</div>
                        <div className="text-lg font-medium">
                          {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Category Breakdown</h3>
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
                            {Object.entries(
                              sortedExpenses.reduce((acc, expense) => {
                                const { category, amount } = expense;
                                acc[category] = (acc[category] || 0) + amount;
                                return acc;
                              }, {} as Record<string, number>)
                            )
                              .sort(([, a], [, b]) => b - a)
                              .map(([category, amount]) => (
                                <TableRow key={category}>
                                  <TableCell className="capitalize">{category}</TableCell>
                                  <TableCell className="text-right">
                                    ₹{amount.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {((amount / totalAmount) * 100).toFixed(1)}%
                                  </TableCell>
                                </TableRow>
                              ))}
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
