
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Group, Expense, ExpenseCategory, SplitDetail } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'other', label: 'Other' },
];

const splitTypes = [
  { value: 'equal', label: 'Equal split' },
  { value: 'unequal', label: 'Unequal amounts' },
  { value: 'percentage', label: 'By percentage' },
  { value: 'shares', label: 'By shares' },
];

const SplitExpenseForm: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', []);
  const { toast } = useToast();
  
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('lunch');
  const [description, setDescription] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [splitType, setSplitType] = useState<string>('equal');
  const [memberSplits, setMemberSplits] = useState<Record<string, string>>({});
  const [memberShares, setMemberShares] = useState<Record<string, string>>({}); 
  const [memberPercentages, setMemberPercentages] = useState<Record<string, string>>({});
  
  const selectedGroup = groups.find(group => group.id === selectedGroupId);
  
  // Initialize member splits when group or split type changes
  useEffect(() => {
    if (selectedGroup) {
      const initialSplits: Record<string, string> = {};
      const initialShares: Record<string, string> = {};
      const initialPercentages: Record<string, string> = {};
      
      selectedGroup.members.forEach(member => {
        // For equal splits, pre-calculate the amount
        if (splitType === 'equal' && amount) {
          const equalAmount = (Number(amount) / selectedGroup.members.length).toFixed(2);
          initialSplits[member.id] = equalAmount;
        } else {
          initialSplits[member.id] = '';
        }
        
        // Initialize shares (default: 1 share per person)
        initialShares[member.id] = '1';
        
        // Initialize percentages (default: equal percentage for everyone)
        const equalPercentage = (100 / selectedGroup.members.length).toFixed(1);
        initialPercentages[member.id] = equalPercentage;
      });
      
      setMemberSplits(initialSplits);
      setMemberShares(initialShares);
      setMemberPercentages(initialPercentages);
    }
  }, [selectedGroupId, splitType, amount, selectedGroup]);
  
  // Recalculate equal splits when amount or group changes
  useEffect(() => {
    if (splitType === 'equal' && selectedGroup && amount) {
      const equalAmount = (Number(amount) / selectedGroup.members.length).toFixed(2);
      const newSplits: Record<string, string> = {};
      
      selectedGroup.members.forEach(member => {
        newSplits[member.id] = equalAmount;
      });
      
      setMemberSplits(newSplits);
    }
  }, [amount, selectedGroup, splitType]);
  
  // Update actual amounts when shares change
  useEffect(() => {
    if (splitType === 'shares' && selectedGroup && amount) {
      const totalShares = Object.values(memberShares)
        .reduce((sum, share) => sum + (Number(share) || 0), 0);
      
      if (totalShares > 0) {
        const newSplits: Record<string, string> = {};
        
        selectedGroup.members.forEach(member => {
          const memberShare = Number(memberShares[member.id]) || 0;
          const memberAmount = (Number(amount) * (memberShare / totalShares)).toFixed(2);
          newSplits[member.id] = memberAmount;
        });
        
        setMemberSplits(newSplits);
      }
    }
  }, [memberShares, amount, splitType, selectedGroup]);
  
  // Update actual amounts when percentages change
  useEffect(() => {
    if (splitType === 'percentage' && selectedGroup && amount) {
      const totalPercentage = Object.values(memberPercentages)
        .reduce((sum, percentage) => sum + (Number(percentage) || 0), 0);
      
      const newSplits: Record<string, string> = {};
      
      selectedGroup.members.forEach(member => {
        const memberPercentage = Number(memberPercentages[member.id]) || 0;
        const memberAmount = (Number(amount) * (memberPercentage / 100)).toFixed(2);
        newSplits[member.id] = memberAmount;
      });
      
      setMemberSplits(newSplits);
    }
  }, [memberPercentages, amount, splitType, selectedGroup]);
  
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
    
    if (!selectedGroupId) {
      toast({
        title: "No group selected",
        description: "Please select a group for this expense",
        variant: "destructive",
      });
      return;
    }
    
    // Validate that splits add up correctly
    const totalSplitAmount = Object.values(memberSplits)
      .reduce((sum, splitAmount) => sum + (Number(splitAmount) || 0), 0);
    
    const amountDifference = Math.abs(Number(amount) - totalSplitAmount);
    
    if (amountDifference > 0.01) {
      toast({
        title: "Split amounts don't match",
        description: `Split total (₹${totalSplitAmount.toFixed(2)}) doesn't match expense amount (₹${amount})`,
        variant: "destructive",
      });
      return;
    }
    
    // Create split details
    const splitDetails: SplitDetail[] = [];
    
    if (selectedGroup) {
      selectedGroup.members.forEach(member => {
        const splitAmount = Number(memberSplits[member.id]) || 0;
        
        if (splitAmount > 0) {
          splitDetails.push({
            memberId: member.id,
            amount: splitAmount,
            paid: false,
            sharePercentage: splitType === 'percentage' ? Number(memberPercentages[member.id]) : undefined,
            shares: splitType === 'shares' ? Number(memberShares[member.id]) : undefined
          });
        }
      });
    }
    
    const newExpense: Expense = {
      id: uuidv4(),
      amount: Number(amount),
      category,
      description,
      date: new Date().toISOString(),
      groupId: selectedGroupId,
      splitDetails
    };
    
    // Add the expense
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    // Update group member balances
    updateGroupBalances(selectedGroupId, splitDetails);
    
    // Reset form
    setAmount('');
    setCategory('lunch');
    setDescription('');
    setSplitType('equal');
    
    toast({
      title: "Split expense added",
      description: `₹${amount} split among ${splitDetails.length} members`,
    });
  };
  
  const updateGroupBalances = (groupId: string, splitDetails: SplitDetail[]) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMembers = group.members.map(member => {
          const memberSplit = splitDetails.find(detail => detail.memberId === member.id);
          const splitAmount = memberSplit ? memberSplit.amount : 0;
          
          // Update the balance
          // Negative amount means they owe money, positive means they are owed money
          return {
            ...member,
            balance: member.balance - splitAmount
          };
        });
        
        return {
          ...group,
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
  };
  
  const handleShareChange = (memberId: string, value: string) => {
    setMemberShares(prev => ({
      ...prev,
      [memberId]: value
    }));
  };
  
  const handlePercentageChange = (memberId: string, value: string) => {
    setMemberPercentages(prev => ({
      ...prev,
      [memberId]: value
    }));
  };
  
  const handleUnqualSplitChange = (memberId: string, value: string) => {
    setMemberSplits(prev => ({
      ...prev,
      [memberId]: value
    }));
  };
  
  // Calculate totals for validation
  const totalPercentage = selectedGroup 
    ? Object.values(memberPercentages).reduce((sum, val) => sum + (Number(val) || 0), 0)
    : 0;
  
  const totalSplitAmount = selectedGroup
    ? Object.values(memberSplits).reduce((sum, val) => sum + (Number(val) || 0), 0)
    : 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Add Split Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount (₹)</Label>
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
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g. Dinner at restaurant"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
          
          {selectedGroup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="split-type">How to split?</Label>
                <Select value={splitType} onValueChange={setSplitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select split type" />
                  </SelectTrigger>
                  <SelectContent>
                    {splitTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="text-sm font-medium mb-2">Split Details</div>
                
                <ScrollArea className="h-[200px] pr-3">
                  <div className="space-y-3">
                    {splitType === 'equal' && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Each person pays ₹{(Number(amount) / selectedGroup.members.length).toFixed(2)}
                      </div>
                    )}
                    
                    {selectedGroup.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex-1">{member.name}</div>
                        
                        {splitType === 'equal' && (
                          <div className="text-right">
                            ₹{memberSplits[member.id] || '0.00'}
                          </div>
                        )}
                        
                        {splitType === 'unequal' && (
                          <div className="w-24">
                            <Input
                              type="number"
                              value={memberSplits[member.id] || ''}
                              onChange={(e) => handleUnqualSplitChange(member.id, e.target.value)}
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              className="text-right"
                            />
                          </div>
                        )}
                        
                        {splitType === 'percentage' && (
                          <div className="w-24 flex items-center">
                            <Input
                              type="number"
                              value={memberPercentages[member.id] || ''}
                              onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                              placeholder="0"
                              step="0.1"
                              min="0"
                              max="100"
                              className="text-right"
                            />
                            <span className="ml-1">%</span>
                          </div>
                        )}
                        
                        {splitType === 'shares' && (
                          <div className="w-24 flex items-center gap-2">
                            <Input
                              type="number"
                              value={memberShares[member.id] || ''}
                              onChange={(e) => handleShareChange(member.id, e.target.value)}
                              placeholder="1"
                              step="1"
                              min="0"
                              className="text-right"
                            />
                            <div className="text-xs text-muted-foreground w-16 text-right">
                              ₹{memberSplits[member.id] || '0.00'}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <div className="text-sm">Total:</div>
                  <div className={`font-medium ${Math.abs(Number(amount) - totalSplitAmount) > 0.01 ? 'text-red-500' : ''}`}>
                    ₹{totalSplitAmount.toFixed(2)}
                  </div>
                </div>
                
                {splitType === 'percentage' && (
                  <div className="flex justify-between items-center mt-2 text-sm">
                    <div>Total percentage:</div>
                    <div className={totalPercentage !== 100 ? 'text-red-500' : ''}>
                      {totalPercentage.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-food-green hover:bg-food-green/90"
            disabled={!selectedGroupId || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
          >
            Add Split Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SplitExpenseForm;
