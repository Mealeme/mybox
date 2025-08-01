import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import GroupManagement from '@/components/GroupManagement';
import SplitExpenseForm from '@/components/SplitExpenseForm';
import DebtOverview from '@/components/DebtOverview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Users, Receipt, ReceiptText, ArrowLeftRight, Wallet, BadgeIndianRupee, 
  Banknote, PlusCircle, UserPlus, Clock, ScanBarcode, Share2, Download, Copy,
  MessageSquare, Mail, FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Group, UserProfile } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { usePdfExport } from '@/hooks/usePdfExport';

const Groups: React.FC = () => {
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', []);
  const [userProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [activeTab, setActiveTab] = useState('groups');
  const [showAnimation, setShowAnimation] = useState(true);
  const { toast } = useToast();
  const { exportToPdf, isExporting } = usePdfExport();
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [showShareMessage, setShowShareMessage] = useState(false);
  
  // New group states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  
  // Animation control
  useEffect(() => {
    // Reset animation state when tab changes
    setShowAnimation(true);
    
    // Turn off animations after they've played
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Calculate total money owed/owing
  const totalBalances = groups.reduce((acc, group) => {
    group.members.forEach(member => {
      acc.total += Math.abs(member.balance);
      if (member.balance < 0) {
        acc.owed += Math.abs(member.balance);
      } else if (member.balance > 0) {
        acc.owing += member.balance;
      }
    });
    return acc;
  }, { total: 0, owed: 0, owing: 0 });

  // Handle create group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new group with the current user as a member
    const newGroup: Group = {
      id: uuidv4(),
      name: newGroupName,
      description: newGroupDescription,
      members: [
        {
          id: userProfile?.id || uuidv4(),
          name: userProfile?.name || 'You',
          email: userProfile?.email || '',
          avatar: userProfile?.avatar,
          balance: 0
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Group created",
      description: `${newGroupName} has been created successfully`,
    });
  };

  // Generate summary text for sharing
  const generateSummaryText = () => {
    let text = `🍽️ DineShare Balance Summary\n`;
    text += `${new Date().toLocaleString()}\n\n`;
    
    if (totalBalances.owing > 0) {
      text += `You are owed: ₹${totalBalances.owing.toFixed(2)}\n`;
    }
    if (totalBalances.owed > 0) {
      text += `You owe: ₹${totalBalances.owed.toFixed(2)}\n`;
    }
    text += `Net balance: ₹${(totalBalances.owing - totalBalances.owed).toFixed(2)}\n\n`;
    
    if (groups.length > 0) {
      text += `Group breakdown:\n`;
      groups.forEach(group => {
        const owedInGroup = group.members.filter(m => m.balance < 0).reduce((sum, m) => sum + Math.abs(m.balance), 0);
        const owingInGroup = group.members.filter(m => m.balance > 0).reduce((sum, m) => sum + m.balance, 0);
        
        text += `\n${group.name}:\n`;
        if (owingInGroup > 0) {
          text += `- You are owed: ₹${owingInGroup.toFixed(2)}\n`;
        }
        if (owedInGroup > 0) {
          text += `- You owe: ₹${owedInGroup.toFixed(2)}\n`;
        }
        
        // List individual debts
        group.members.forEach(member => {
          if (member.balance !== 0 && member.name !== 'You' && member.name !== userProfile?.name) {
            if (member.balance < 0) {
              text += `  • ${member.name} owes you ₹${Math.abs(member.balance).toFixed(2)}\n`;
            } else {
              text += `  • You owe ${member.name} ₹${member.balance.toFixed(2)}\n`;
            }
          }
        });
      });
    }
    
    return text;
  };

  // Share functions
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateSummaryText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
    
    toast({
      title: "Share via WhatsApp",
      description: "WhatsApp sharing opened in a new window",
    });
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('DineShare Balance Summary');
    const body = encodeURIComponent(generateSummaryText());
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Share via Email",
      description: "Email client opened with balance summary",
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generateSummaryText())
      .then(() => {
        setShowShareMessage(true);
        setTimeout(() => setShowShareMessage(false), 2000);
        
        toast({
          title: "Copied to clipboard",
          description: "Balance summary has been copied to clipboard",
        });
      })
      .catch(err => {
        toast({
          title: "Copy failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const handleExportPdf = () => {
    try {
      const summary = generateSummaryText();
      console.log("[PDF Export] Generating balance summary with content length:", summary.length);
      
      exportToPdf('DineShare Balance Summary', {
        dateRange: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        userName: userProfile?.name || 'User',
        customContent: summary,
      });
      
      toast({
        title: "Export initiated",
        description: "Your PDF is being generated",
      });
    } catch (error) {
      console.error("[PDF Export] Error in export handler:", error);
      toast({
        title: "Export failed",
        description: "There was an error preparing the PDF export",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-food-green to-food-blue rounded-lg p-2.5 shadow-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Groups & Split Expenses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your groups and track shared expenses
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* Create Group Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-food-green to-food-blue hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Family, Roommates, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="group-description">Description (Optional)</Label>
                  <Textarea
                    id="group-description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="What's this group for?"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleCreateGroup}>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Split Expense Dialog */}
          <Dialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-food-orange to-food-yellow hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-md"
                disabled={groups.length === 0}
              >
                <ReceiptText className="h-4 w-4 mr-2" />
                Split Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Split an Expense</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <SplitExpenseForm onComplete={() => setIsSplitDialogOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Share & Download Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
                <span>Share via WhatsApp</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareEmail} className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4 text-blue-600" />
                <span>Share via Email</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy to clipboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPdf} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4 text-red-600" />
                <span>Download as PDF</span>
                {isExporting && <span className="ml-2 animate-spin">◌</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Badge variant="outline" className="px-3 py-1 border-food-green/30 bg-food-green/10 text-food-green">
            <Users className="h-3.5 w-3.5 mr-1" /> {groups.length} Groups
          </Badge>
          
          {totalBalances.total > 0 && (
            <Badge variant="outline" className="px-3 py-1 border-food-orange/30 bg-food-orange/10 text-food-orange">
              <Banknote className="h-3.5 w-3.5 mr-1" /> ₹{totalBalances.total.toFixed(2)} in Transactions
            </Badge>
          )}
        </div>
      </motion.div>
      
      {/* Notification for clipboard copy */}
      {showShareMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-lg z-50"
        >
          Balance summary copied to clipboard!
        </motion.div>
      )}
      
      <Tabs defaultValue="groups" className="space-y-6" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="groups" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-food-green/20 data-[state=active]:to-food-blue/20">
            <Users className="h-4 w-4 mr-2" />
            Your Groups
          </TabsTrigger>
          <TabsTrigger value="balances" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-food-orange/20 data-[state=active]:to-food-yellow/20">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Balances & Debts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-6">
          {groups.length > 0 ? (
            <motion.div 
              initial={showAnimation ? { opacity: 0, y: 10 } : false}
              animate={showAnimation ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.4 }}
              className="grid gap-6 md:grid-cols-3 lg:grid-cols-3"
            >
              <div className="space-y-6 md:col-span-2">
                <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-food-green" />
                      Manage Your Groups
                    </CardTitle>
                    <CardDescription>
                      Create and manage groups for splitting expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <GroupManagement />
                  </CardContent>
                </Card>
              </div>
              
              <motion.div
                initial={showAnimation ? { opacity: 0, x: 20 } : false}
                animate={showAnimation ? { opacity: 1, x: 0 } : false}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10">
                    <CardTitle className="flex items-center gap-2">
                      <ReceiptText className="h-5 w-5 text-food-orange" />
                      Quick Split
                    </CardTitle>
                    <CardDescription>
                      Split a new expense among group members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-food-orange/5 rounded-full inline-flex mx-auto">
                        <ScanBarcode className="h-12 w-12 text-food-orange/70" />
                      </div>
                      <h3 className="text-lg font-medium">Split a New Expense</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Quickly split bills, dinners, or any shared expense with your group members
                      </p>
                      
                      <Button 
                        onClick={() => setIsSplitDialogOpen(true)}
                        className="w-full bg-gradient-to-r from-food-orange to-food-yellow hover:opacity-90 transition-all duration-300"
                      >
                        <ReceiptText className="h-4 w-4 mr-2" />
                        Split Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Share Card */}
                <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-700/50">
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      Share & Download
                    </CardTitle>
                    <CardDescription>
                      Share your balance summary with others
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 p-4">
                    <Button 
                      variant="outline" 
                      className="flex flex-col h-auto py-4 gap-2 hover:bg-green-50 dark:hover:bg-green-950/20"
                      onClick={handleShareWhatsApp}
                    >
                      <MessageSquare className="h-6 w-6 text-green-600" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col h-auto py-4 gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      onClick={handleShareEmail}
                    >
                      <Mail className="h-6 w-6 text-blue-600" />
                      <span className="text-xs">Email</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col h-auto py-4 gap-2"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-6 w-6" />
                      <span className="text-xs">Copy Text</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col h-auto py-4 gap-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={handleExportPdf}
                      disabled={isExporting}
                    >
                      <FileText className="h-6 w-6 text-red-600" />
                      <span className="text-xs">PDF Export</span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={showAnimation ? { opacity: 0, y: 10 } : false}
              animate={showAnimation ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center">
                  <div className="bg-muted rounded-full p-4 mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Groups Yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Create your first group to start tracking shared expenses and splitting bills with friends, family, or roommates.
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-food-green to-food-blue hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 shadow-md">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Your First Group
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="balances">
          <motion.div
            initial={showAnimation ? { opacity: 0, y: 10 } : false}
            animate={showAnimation ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-food-green/5 to-food-blue/10 border border-food-green/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-food-green/10 rounded-full">
                      <BadgeIndianRupee className="h-5 w-5 text-food-green" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">You are owed</p>
                      <p className="text-2xl font-bold text-food-green">₹{totalBalances.owing.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        across {groups.filter(g => g.members.some(m => m.balance > 0)).length} groups
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-food-orange/5 to-food-yellow/10 border border-food-orange/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-food-orange/10 rounded-full">
                      <Receipt className="h-5 w-5 text-food-orange" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">You owe</p>
                      <p className="text-2xl font-bold text-food-orange">₹{totalBalances.owed.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        across {groups.filter(g => g.members.some(m => m.balance < 0)).length} groups
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <Banknote className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Balance</p>
                      <p className={`text-2xl font-bold ${totalBalances.owing - totalBalances.owed > 0 ? 'text-food-green' : 'text-food-orange'}`}>
                        ₹{(totalBalances.owing - totalBalances.owed).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        updated {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Debt overview with updated UI */}
            <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-food-orange/10 to-food-yellow/10">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-food-orange" />
                  Debt Overview
                </CardTitle>
                <CardDescription>
                  Simplified view of who owes what to whom
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-4">
                <DebtOverview />
              </CardContent>
              <CardFooter className="border-t bg-muted/30 py-3 px-6">
                <div className="w-full flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">Live Data</Badge>
                </div>
              </CardFooter>
            </Card>
            
            {/* Group-specific balances */}
            {groups.length > 0 && (
              <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-food-blue/10 to-food-green/10">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-food-blue" />
                    Group Balances
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of balances by group
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {groups.map(group => {
                      // Calculate group totals
                      const groupTotal = group.members.reduce((sum, member) => sum + Math.abs(member.balance), 0);
                      const owedInGroup = group.members.filter(m => m.balance < 0).reduce((sum, m) => sum + Math.abs(m.balance), 0);
                      const owingInGroup = group.members.filter(m => m.balance > 0).reduce((sum, m) => sum + m.balance, 0);
                      
                      return (
                        <motion.div 
                          key={group.id}
                          whileHover={{ y: -2 }}
                          className="p-4 border rounded-lg hover:border-food-blue/30 hover:bg-food-blue/5 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-food-blue/20 text-food-blue">
                                  {group.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <h3 className="font-medium">{group.name}</h3>
                            </div>
                            
                            <Badge className="bg-food-blue/10 text-food-blue border-food-blue/20 hover:bg-food-blue/20">
                              {group.members.length} members
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Total transactions</span>
                              <span className="font-medium">₹{groupTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">You owe</span>
                              <span className="font-medium text-food-orange">₹{owedInGroup.toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">You are owed</span>
                              <span className="font-medium text-food-green">₹{owingInGroup.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="w-full h-2 bg-muted rounded-full mt-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-food-orange to-food-yellow"
                              style={{ width: `${(owedInGroup / (owedInGroup + owingInGroup)) * 100}%` }}
                            />
                          </div>
                          
                          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                            <span>Last transaction: {new Date(group.updatedAt).toLocaleDateString()}</span>
                            <span>{Math.round((new Date().getTime() - new Date(group.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Activity Timeline */}
            {groups.length > 0 && (
              <Card className="overflow-hidden border border-border/50 hover:shadow-md transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-food-green/10 to-food-blue/10">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-food-green" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest group transactions and settlements
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/20 space-y-6 py-2">
                    {groups
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 5)
                      .map((group, index) => (
                        <div key={group.id} className="relative">
                          <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-food-blue -ml-7 mt-1"></div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-food-blue/10 text-food-blue">
                                {new Date(group.updatedAt).toLocaleDateString()}
                              </Badge>
                              <span className="text-sm font-medium">{group.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Group balance updated - {group.members.length} members affected
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(group.updatedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                    {groups.length > 0 && (
                      <div className="relative">
                        <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-food-green -ml-7 mt-1"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-food-green/10 text-food-green">
                              {new Date().toLocaleDateString()}
                            </Badge>
                            <span className="text-sm font-medium">Real-time Data Update</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            All balances refreshed and synchronized
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date().toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Groups;
