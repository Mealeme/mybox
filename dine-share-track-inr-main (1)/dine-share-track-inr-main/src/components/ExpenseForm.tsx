import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense, ExpenseCategory } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'other', label: 'Other' },
];

interface ExpenseFormProps {
  onExpenseAdded?: (expense: Expense) => void;
  expenseToEdit?: Expense | null;
  onCancelEdit?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded, expenseToEdit, onCancelEdit }) => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('lunch');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Effect to handle editing expenses
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setDate(new Date(expenseToEdit.date));
      setIsEditing(true);
      setCurrentExpenseId(expenseToEdit.id);
    }
  }, [expenseToEdit]);

  const resetForm = () => {
    setAmount('');
    setCategory('lunch');
    setDescription('');
    setDate(new Date());
    setIsEditing(false);
    setCurrentExpenseId(null);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    const newOrUpdatedExpense: Expense = {
      id: isEditing && currentExpenseId ? currentExpenseId : uuidv4(),
      amount: Number(amount),
      category,
      description,
      date: date.toISOString(),
    };
    
    if (isEditing && currentExpenseId) {
      // Update existing expense
      const updatedExpenses = expenses.map(exp => 
        exp.id === currentExpenseId ? newOrUpdatedExpense : exp
      );
      
      setExpenses(updatedExpenses);
      
      toast({
        title: "Expense updated",
        description: `₹${amount} for ${category} has been updated`,
      });
      
      if (onExpenseAdded) {
        onExpenseAdded(newOrUpdatedExpense);
      }
    } else {
      // Add new expense
      const updatedExpenses = [...expenses, newOrUpdatedExpense];
      setExpenses(updatedExpenses);
      
      toast({
        title: "Expense added",
        description: `₹${amount} added for ${category}`,
      });
      
      if (onExpenseAdded) {
        onExpenseAdded(newOrUpdatedExpense);
      }
    }
    
    // Reset form
    resetForm();
  };

  const handleEditExpense = (expense: Expense) => {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description);
    setDate(new Date(expense.date));
    setIsEditing(true);
    setCurrentExpenseId(expense.id);
    
    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      const updatedExpenses = expenses.filter(expense => expense.id !== expenseToDelete);
      setExpenses(updatedExpenses);
      
      toast({
        title: "Expense deleted",
        description: "The expense has been removed",
      });
      
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };
  
  return (
    <>
      <Card className="w-full transform transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10 rounded-t-lg">
          <CardTitle className="text-lg font-medium">
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value: ExpenseCategory) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g. Lunch at office canteen"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-food-green hover:bg-food-green/90">
                {isEditing ? "Update Expense" : "Add Expense"}
              </Button>
              
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ExpenseForm;
