import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseCategory, Expense } from '@/data/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, ArrowUpDown, Eye, Trash2, Edit2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Transactions: React.FC = () => {
  const { expenses, deleteExpense } = useExpenses();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  // Get all unique categories from expenses
  const categories = useMemo(() => {
    const uniqueCategories = new Set<ExpenseCategory>();
    expenses.forEach(expense => uniqueCategories.add(expense.category));
    return Array.from(uniqueCategories);
  }, [expenses]);

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(expense => 
        expense.description?.toLowerCase().includes(term) || 
        expense.category.toLowerCase().includes(term) || 
        expense.amount.toString().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      } else if (sortBy === 'category') {
        return sortOrder === 'desc' 
          ? b.category.localeCompare(a.category)
          : a.category.localeCompare(b.category);
      }
      return 0;
    });
    
    return result;
  }, [expenses, categoryFilter, searchTerm, sortBy, sortOrder]);

  // Toggle sort order
  const toggleSort = (column: 'date' | 'amount' | 'category') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Toggle expense details
  const toggleExpenseDetails = (id: string) => {
    setExpandedExpenseId(expandedExpenseId === id ? null : id);
  };

  // Handle expense deletion
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast({
      title: "Expense deleted",
      description: "The expense has been removed successfully"
    });
  };

  // Get appropriate category badge color
  const getCategoryColor = (category: ExpenseCategory) => {
    switch(category) {
      case 'lunch': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'dinner': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'breakfast': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'snacks': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'groceries': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'beverages': return 'bg-pink-500/10 text-pink-500 border-pink-500/30';
      case 'other': return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
            <p className="text-muted-foreground">
              View and manage all your expense transactions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-9 w-full md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ExpenseCategory | 'all')}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {categoryFilter !== 'all' ? (
                    <Badge variant="outline" className={getCategoryColor(categoryFilter as ExpenseCategory)}>
                      {categoryFilter}
                    </Badge>
                  ) : (
                    <span>All Categories</span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center">
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filteredAndSortedExpenses.length} transactions found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAndSortedExpenses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort('date')}
                        className="flex items-center gap-1 -ml-4 font-medium"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                        {sortBy === 'date' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort('category')}
                        className="flex items-center gap-1 -ml-4 font-medium"
                      >
                        Category
                        <ArrowUpDown className="h-3 w-3" />
                        {sortBy === 'category' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSort('amount')}
                        className="flex items-center gap-1 ml-auto font-medium"
                      >
                        Amount
                        <ArrowUpDown className="h-3 w-3" />
                        {sortBy === 'amount' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.description || <span className="text-muted-foreground italic">No description</span>}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{expense.amount.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => toggleExpenseDetails(expense.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  className="text-red-600 cursor-pointer"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expandable detail row */}
                      {expandedExpenseId === expense.id && (
                        <TableRow>
                          <TableCell colSpan={5} className="p-0">
                            <div className="bg-muted/10 p-4 text-sm">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <div className="text-muted-foreground">Added on</div>
                                  <div className="font-medium">{new Date(expense.date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Time</div>
                                  <div className="font-medium">{new Date(expense.date).toLocaleTimeString()}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Category</div>
                                  <div className="font-medium capitalize">{expense.category}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Amount</div>
                                  <div className="font-medium">₹{expense.amount.toLocaleString('en-IN')}</div>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <div className="text-muted-foreground">Description</div>
                                  <div className="font-medium">{expense.description || "No description provided"}</div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground opacity-25 mb-4" />
                <h3 className="font-medium text-lg mb-1">No transactions found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || categoryFilter !== 'all' ? 
                    "Try adjusting your search or filters" : 
                    "You don't have any transactions yet"}
                </p>
                
                {searchTerm || categoryFilter !== 'all' ? (
                  <div className="flex justify-center gap-3">
                    {categoryFilter !== 'all' && (
                      <Button variant="outline" onClick={() => setCategoryFilter('all')}>
                        Clear Category Filter
                      </Button>
                    )}
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Transactions; 