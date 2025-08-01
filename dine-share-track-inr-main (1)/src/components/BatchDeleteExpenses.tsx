import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface BatchDeleteExpensesProps {
  selectedIds: string[];
  disabled?: boolean;
  onDeleted?: () => void;
  onCancel?: () => void;
}

const BatchDeleteExpenses: React.FC<BatchDeleteExpensesProps> = ({
  selectedIds,
  disabled = false,
  onDeleted,
  onCancel,
}) => {
  const { deleteBatchExpenses } = useExpenses();
  const [open, setOpen] = useState(false);

  const handleDeleteClick = () => {
    setOpen(true);
  };

  const confirmDelete = () => {
    deleteBatchExpenses(selectedIds);
    setOpen(false);
    if (onDeleted) onDeleted();
  };

  const handleCancel = () => {
    setOpen(false);
    if (onCancel) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={handleDeleteClick}
          disabled={disabled || selectedIds.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete ({selectedIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Multiple Expenses</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedIds.length} expense{selectedIds.length > 1 ? 's' : ''}? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={confirmDelete}
          >
            Delete Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchDeleteExpenses; 