import React, { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Group, DebtSimplification } from '@/data/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BadgeIndianRupee } from 'lucide-react';

const DebtOverview: React.FC<{ groupId?: string }> = ({ groupId }) => {
  const [groups] = useLocalStorage<Group[]>('groups', []);
  
  // If groupId is provided, show for that group only, otherwise show overall
  const relevantGroups = groupId 
    ? groups.filter(group => group.id === groupId)
    : groups;
  
  const simplifiedDebts = useMemo(() => {
    if (relevantGroups.length === 0) return [];
    
    // Collect all members across groups (or just the specific group)
    const allMembers = new Map();
    
    relevantGroups.forEach(group => {
      group.members.forEach(member => {
        if (allMembers.has(member.id)) {
          // If member exists in multiple groups, sum their balances
          const existingMember = allMembers.get(member.id);
          allMembers.set(member.id, {
            ...existingMember,
            balance: existingMember.balance + member.balance
          });
        } else {
          allMembers.set(member.id, { ...member });
        }
      });
    });
    
    // Separate into creditors (positive balance) and debtors (negative balance)
    const creditors = Array.from(allMembers.values())
      .filter(member => member.balance > 0)
      .sort((a, b) => b.balance - a.balance);
      
    const debtors = Array.from(allMembers.values())
      .filter(member => member.balance < 0)
      .sort((a, b) => a.balance - b.balance); // Sort from most negative to least
    
    // Simplify debts
    const simplifiedDebts: DebtSimplification[] = [];
    
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      // Get the absolute debt amount (negative balance becomes positive)
      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;
      
      // The transfer amount is the smaller of the two
      const transferAmount = Math.min(debtAmount, creditAmount);
      
      // Add to simplified debts
      simplifiedDebts.push({
        from: debtor.id,
        to: creditor.id,
        amount: transferAmount
      });
      
      // Update balances
      debtor.balance += transferAmount; // Reduce debt (it's negative)
      creditor.balance -= transferAmount; // Reduce credit
      
      // Remove members with zero balance
      if (Math.abs(debtor.balance) < 0.01) debtors.shift();
      if (Math.abs(creditor.balance) < 0.01) creditors.shift();
    }
    
    return simplifiedDebts;
  }, [relevantGroups]);
  
  // Get member information by ID
  const getMemberInfo = (memberId: string) => {
    for (const group of relevantGroups) {
      const member = group.members.find(m => m.id === memberId);
      if (member) return member;
    }
    return null;
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {groupId ? 'Group Balances' : 'Overall Balances'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {simplifiedDebts.length > 0 ? (
          <div className="space-y-4">
            {simplifiedDebts.map((debt, index) => {
              const fromMember = getMemberInfo(debt.from);
              const toMember = getMemberInfo(debt.to);
              
              if (!fromMember || !toMember) return null;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-100 text-red-800 text-xs">
                        {getInitials(fromMember.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{fromMember.name}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">owes</div>
                    <div className="flex items-center text-sm font-medium">
                      <BadgeIndianRupee className="h-3 w-3 mr-1" /> 
                      {debt.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{toMember.name}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-800 text-xs">
                        {getInitials(toMember.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Everyone is settled up! No debts to show.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtOverview;
