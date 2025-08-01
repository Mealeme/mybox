import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Expense } from '@/data/types';

interface ExpenseDeleteButtonProps {
  expenseId: string;
}

const ExpenseDeleteButton: React.FC<ExpenseDeleteButtonProps> = ({ expenseId }) => {
  const { toast } = useToast();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Deleting expense with ID:', expenseId);
    
    try {
      // Get current expenses from localStorage
      const rawData = localStorage.getItem('expenses');
      if (!rawData) {
        console.log('No expenses found in localStorage');
        return;
      }
      
      // Parse the data
      const expenses = JSON.parse(rawData);
      console.log('Found expenses:', expenses.length);
      
      // Filter out the expense to delete
      const updatedExpenses = expenses.filter((expense: Expense) => expense.id !== expenseId);
      console.log('Expenses after filtering:', updatedExpenses.length);
      
      // Save back to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      console.log('Saved updated expenses to localStorage');
      
      // Show success toast
      toast({
        title: "Expense deleted",
        description: "The expense has been removed",
        duration: 2000,
      });
      
      // Force page reload to ensure UI is updated
      window.location.reload();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      className="h-10 px-4 rounded-md flex items-center gap-2 text-base font-medium"
      onClick={handleDelete}
    >
      <Trash className="h-5 w-5" />
      DELETE
    </Button>
  );
};

export default ExpenseDeleteButton; 