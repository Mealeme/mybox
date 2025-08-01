
import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Group, GroupMember, UserProfile } from '@/data/types';
import { PlusCircle, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useLocalStorage<Group[]>('groups', []);
  const [userProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const { toast } = useToast();
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  
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
    setIsDialogOpen(false);
    
    toast({
      title: "Group created",
      description: `${newGroupName} has been created successfully`,
    });
  };
  
  const handleAddMember = (groupId: string) => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast({
        title: "Member details required",
        description: "Please enter name and email for the new member",
        variant: "destructive",
      });
      return;
    }
    
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        // Check if member already exists
        if (group.members.some(member => member.email === newMemberEmail)) {
          toast({
            title: "Member already exists",
            description: "This email is already in the group",
            variant: "destructive",
          });
          return group;
        }
        
        // Add new member
        return {
          ...group,
          members: [
            ...group.members,
            {
              id: uuidv4(),
              name: newMemberName,
              email: newMemberEmail,
              balance: 0
            }
          ],
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    setNewMemberName('');
    setNewMemberEmail('');
    
    toast({
      title: "Member added",
      description: `${newMemberName} has been added to the group`,
    });
  };
  
  const handleRemoveMember = (groupId: string, memberId: string) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.members.filter(member => member.id !== memberId),
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    toast({
      title: "Member removed",
      description: "Member has been removed from the group",
    });
  };
  
  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(group => group.id !== groupId));
    toast({
      title: "Group deleted",
      description: "Group has been deleted successfully",
    });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Groups</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Create Group</span>
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
      </div>
      
      {groups.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map(group => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">{group.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentGroup(group)}
                      >
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{group.name} - Members</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="grid gap-4 mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="member-name">Name</Label>
                              <Input
                                id="member-name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <Label htmlFor="member-email">Email</Label>
                              <Input
                                id="member-email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                placeholder="john@example.com"
                              />
                            </div>
                          </div>
                          <Button onClick={() => handleAddMember(group.id)} className="w-full">
                            Add Member
                          </Button>
                        </div>
                        
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {group.members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                                <div className="flex items-center gap-2">
                                  <Avatar>
                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-xs text-muted-foreground">{member.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">
                                    Balance: <span className={member.balance > 0 ? 'text-green-600' : member.balance < 0 ? 'text-red-600' : ''}>
                                      ₹{member.balance.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  {/* Don't allow removing yourself */}
                                  {member.id !== (userProfile?.id || group.members[0].id) && (
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleRemoveMember(group.id, member.id)}
                                    >
                                      Remove
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        
                        <div className="flex justify-end mt-4">
                          <Button 
                            variant="destructive"
                            onClick={() => handleDeleteGroup(group.id)}
                          >
                            Delete Group
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {group.members.slice(0, 3).map(member => (
                    <Avatar key={member.id} className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {group.members.length > 3 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No Groups Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create a group to split expenses with friends, family or colleagues
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>Create Your First Group</Button>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
