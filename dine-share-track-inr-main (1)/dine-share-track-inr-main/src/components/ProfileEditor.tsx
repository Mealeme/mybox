
import React, { useState, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; 
import { UserProfile } from '@/data/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  Camera, 
  Check, 
  Mail, 
  Phone, 
  User, 
  Key, 
  Shield, 
  Trash2, 
  Clock,
  LogOut
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/components/auth/AuthProvider';
import { Separator } from '@/components/ui/separator';

const defaultProfile: UserProfile = {
  id: uuidv4(),
  name: 'User',
  email: '',
  phone: '',
};

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useLocalStorage<UserProfile>('user-profile', defaultProfile);
  const { toast } = useToast();
  const { signOut } = useAuth();
  
  const [name, setName] = useState<string>(profile.name);
  const [email, setEmail] = useState<string>(profile.email);
  const [phone, setPhone] = useState<string>(profile.phone);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // For password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // For delete account confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      setProfile({
        ...profile,
        name,
        email,
        phone,
      });
      
      setIsSaving(false);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    }, 600);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    
    // Simulating password change
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
    }, 800);
  };
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfile({
        ...profile,
        avatar: result,
      });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated",
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation failed",
        description: "Please type DELETE to confirm account deletion",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate account deletion
    setIsSaving(true);
    setTimeout(() => {
      // Clear user data
      localStorage.removeItem('user-profile');
      
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully",
      });
      
      // Sign out the user
      signOut();
    }, 1000);
  };
  
  const getAccountAge = () => {
    // For demo purposes, generate a random account age
    const months = Math.floor(Math.random() * 24) + 1;
    return `${months} month${months === 1 ? '' : 's'}`;
  };
  
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="profile">
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="account">
          <Key className="h-4 w-4 mr-2" />
          Account
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <Card className="w-full overflow-hidden animate-fade-in border border-slate-200 shadow-lg rounded-xl">
          <CardHeader className="relative p-0 h-32 bg-gradient-to-r from-food-orange to-food-yellow">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl transition-transform hover:scale-105">
                  <AvatarImage src={profile.avatar} className="object-cover" />
                  <AvatarFallback className="bg-food-green text-white text-2xl">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button 
                  className="absolute bottom-0 right-0 bg-food-green text-white p-2 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-20 pb-6 px-8">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center text-sm font-semibold text-slate-700">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="transition-all focus:ring-food-orange"
                    disabled={!isEditing && !isSaving}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-sm font-semibold text-slate-700">
                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all focus:ring-food-orange"
                    disabled={!isEditing && !isSaving}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center text-sm font-semibold text-slate-700">
                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="transition-all focus:ring-food-orange"
                    disabled={!isEditing && !isSaving}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="transition-all"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="transition-all"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-food-green hover:bg-food-green/90 transition-all"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Check className="mr-2 h-4 w-4" /> Save Changes
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card className="w-full border border-slate-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-food-green" />
              Security Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter a new password"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Key className="mr-2 h-4 w-4" /> Change Password
                    </span>
                  )}
                </Button>
              </div>
            </form>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Login Sessions</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-slate-500">Started: {new Date().toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="account">
        <Card className="w-full border border-slate-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-food-blue" />
              Account Management
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="bg-slate-50 p-4 rounded-md mt-2 space-y-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="text-sm text-slate-600">Account age:</span>
                  <span className="ml-2 font-medium">{getAccountAge()}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-slate-500" />
                  <span className="text-sm text-slate-600">User ID:</span>
                  <span className="ml-2 font-medium">{profile.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
              <div className="bg-red-50 p-4 rounded-md mt-2 border border-red-100">
                <h4 className="font-medium flex items-center">
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  Delete Account
                </h4>
                <p className="text-sm text-slate-600 mt-1 mb-3">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="text-sm text-slate-500 flex justify-center border-t pt-4">
            <div className="text-center">
              <p>For account-related help, contact support@dinesharetrack.com</p>
            </div>
          </CardFooter>
        </Card>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500">Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Label htmlFor="confirmDelete" className="text-sm font-medium">
                To confirm, type "DELETE" in the field below
              </Label>
              <Input
                id="confirmDelete"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount} 
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileEditor;
