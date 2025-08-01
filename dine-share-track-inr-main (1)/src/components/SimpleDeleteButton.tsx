import React, { useEffect } from 'react';

interface SimpleDeleteButtonProps {
  expenseId: string;
}

// This component uses the most direct approach possible
const SimpleDeleteButton: React.FC<SimpleDeleteButtonProps> = ({ expenseId }) => {
  // Direct deletion function
  const deleteItem = () => {
    try {
      // 1. Get all expenses from localStorage
      const rawData = localStorage.getItem('expenses');
      
      // 2. Check if we have data
      if (!rawData) {
        alert('No expenses found');
        return;
      }
      
      // 3. Parse the JSON data
      const expenses = JSON.parse(rawData);
      
      // 4. Filter out the expense to delete
      const remaining = expenses.filter((exp: any) => exp.id !== expenseId);
      
      // 5. Save the updated array back to localStorage
      localStorage.setItem('expenses', JSON.stringify(remaining));
      
      // 6. Show success message
      alert('Expense deleted successfully');
      
      // 7. Force page refresh to show the update
      window.location.href = window.location.href;
    } catch (err) {
      // Show error if anything fails
      console.error('Delete error:', err);
      alert('Error deleting expense: ' + err);
    }
  };

  return (
    <button
      style={{
        background: 'red',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onClick={deleteItem}
    >
      🗑️ DELETE
    </button>
  );
};

export default SimpleDeleteButton; 