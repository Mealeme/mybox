
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import GroupManagement from '@/components/GroupManagement';
import SplitExpenseForm from '@/components/SplitExpenseForm';
import DebtOverview from '@/components/DebtOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const Groups: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Groups & Split Expenses</h1>
      
      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="mb-2">
          <TabsTrigger value="groups">Your Groups</TabsTrigger>
          <TabsTrigger value="balances">Balances & Debts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-6 md:col-span-2 lg:col-span-2">
              <GroupManagement />
            </div>
            
            <div>
              <SplitExpenseForm />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="balances">
          <DebtOverview />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Groups;
