import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface QuickDeleteProps {
  id: string;
  onDelete: (id: string) => void;
}

const QuickDelete: React.FC<QuickDeleteProps> = ({ id, onDelete }) => {
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Quick delete clicked for ID:', id);
    
    try {
      onDelete(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Error",
        description: "Failed to delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      className="h-8 px-2 rounded-md flex items-center gap-1"
      onClick={handleClick}
    >
      <Trash className="h-4 w-4" />
      <span className="text-xs font-medium">Delete</span>
    </Button>
  );
};

export default QuickDelete; 