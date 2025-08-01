
export type ExpenseCategory = 
  | 'lunch' 
  | 'dinner' 
  | 'breakfast' 
  | 'snacks' 
  | 'beverages' 
  | 'groceries' 
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  tags?: string[];
  groupId?: string; // Reference to a group if this is a group expense
  groupName?: string; // Name of the group for display purposes
  splitDetails?: SplitDetail[]; // Details about how the expense is split
}

export interface SplitDetail {
  memberId: string;
  amount: number;
  paid: boolean;
  sharePercentage?: number; // For percentage-based splits
  shares?: number; // For share-based splits
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number; // Positive means they are owed money, negative means they owe money
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DebtSimplification {
  from: string;
  to: string;
  amount: number;
}
