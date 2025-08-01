import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Save, 
  Edit2, 
  X, 
  Shield,
  LogOut,
  Trash,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Coffee,
  Users2,
  BookOpen
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the user profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  avatar?: string;
  bio?: string;
  lastUpdated?: number; // Adding timestamp for tracking updates
  location?: string;
  website?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

// Gender options
const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
  { value: 'Other', label: 'Other' }
];

// Create default profile
const createDefaultProfile = (email?: string): UserProfile => ({
  id: uuidv4(),
  name: 'User',
  email: email || '',
  phone: '',
  dob: '',
  gender: '',
  bio: '',
  location: '',
  website: '',
  occupation: '',
  education: '',
  interests: [],
  socialLinks: {}
});

// Create a custom event for avatar updates
const AVATAR_UPDATED_EVENT = 'avatar_updated';

const ModernProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userEmail = user?.email || '';
  const avatarStorageKey = `user-avatar-${userEmail}`;
  const profileStorageKey = `user-profile-${userEmail}`;
  
  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // State for profile data
  const [profile, setProfile] = useState<UserProfile>(createDefaultProfile(userEmail));
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  
  // Avatar state
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  
  // Dialog states
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Inside the ModernProfile component, add new state variables
  const [activeTab, setActiveTab] = useState("personal");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // Load profile data when component mounts
  useEffect(() => {
    if (!userEmail) return;
    
    try {
      // Load profile data
      const storedProfile = localStorage.getItem(profileStorageKey);
      
      // Load avatar separately
      const storedAvatar = localStorage.getItem(avatarStorageKey);
      if (storedAvatar) {
        setAvatar(storedAvatar);
      }
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile;
        
        // Ensure email matches current user
        if (parsedProfile.email !== userEmail) {
          parsedProfile.email = userEmail;
          localStorage.setItem(profileStorageKey, JSON.stringify(parsedProfile));
        }
        
        // If there's stored avatar, use that instead of what might be in the profile
        if (storedAvatar) {
          parsedProfile.avatar = storedAvatar;
        }
        
        setProfile(parsedProfile);
        setEditedProfile(parsedProfile);
        
        // If there's a date stored, set it
        if (parsedProfile.dob) {
          const dobDate = new Date(parsedProfile.dob);
          if (!isNaN(dobDate.getTime())) {
            setDate(dobDate);
          }
        }
      } else {
        // Create new profile if none exists
        const newProfile = createDefaultProfile(userEmail);
        localStorage.setItem(profileStorageKey, JSON.stringify(newProfile));
        setProfile(newProfile);
        setEditedProfile(newProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      const newProfile = createDefaultProfile(userEmail);
      localStorage.setItem(profileStorageKey, JSON.stringify(newProfile));
      setProfile(newProfile);
      setEditedProfile(newProfile);
      
      toast({
        title: "Error loading profile",
        description: "There was an error loading your profile. A new profile has been created.",
        variant: "destructive"
      });
    }
  }, [userEmail, profileStorageKey, avatarStorageKey, toast]);

  // Save profile changes
  const saveProfile = () => {
    try {
      // Update timestamp
      const updatedProfile = {
        ...editedProfile,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Dispatch event to notify other components
      if (updatedProfile.avatar !== profile.avatar) {
        const event = new CustomEvent(AVATAR_UPDATED_EVENT, { 
          detail: { 
            avatar: updatedProfile.avatar,
            email: userEmail
          } 
        });
        window.dispatchEvent(event);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile changes.",
        variant: "destructive"
      });
    }
  };

  // Function to update avatar everywhere
  const updateAvatar = (avatarData: string | undefined) => {
    // Update in localStorage separately
    if (avatarData) {
      localStorage.setItem(avatarStorageKey, avatarData);
    } else {
      localStorage.removeItem(avatarStorageKey);
    }
    
    // Update local state
    setAvatar(avatarData);
    setEditedProfile(prev => ({...prev, avatar: avatarData}));
    
    // Also update the main profile if not in edit mode
    if (!isEditing) {
      setProfile(prev => ({...prev, avatar: avatarData}));
    }
    
    // Dispatch event to notify other components
    const event = new CustomEvent(AVATAR_UPDATED_EVENT, { 
      detail: { 
        avatar: avatarData,
        email: userEmail
      } 
    });
    window.dispatchEvent(event);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  // Handle avatar upload
  const handleAvatarUpload = () => {
    avatarInputRef.current?.click();
  };
  
  // Remove avatar
  const handleRemoveAvatar = () => {
    updateAvatar(undefined);
    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed."
    });
  };

  // Process file upload for avatar
  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAvatarLoading(true);
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image less than 5MB.",
          variant: "destructive"
        });
        setIsAvatarLoading(false);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateAvatar(base64String);
        setIsAvatarLoading(false);
        
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated."
        });
      };
      
      reader.onerror = () => {
        setIsAvatarLoading(false);
        toast({
          title: "Error",
          description: "Failed to read the image file.",
          variant: "destructive"
        });
      };
      
      reader.readAsDataURL(file);
    }
    
    // Clear the input value so the same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setEditedProfile({
        ...editedProfile,
        dob: selectedDate.toISOString().split('T')[0]
      });
    }
    setDateDialogOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate avatar fallback from name
  const getNameInitial = () => {
    return profile.name.charAt(0).toUpperCase() || userEmail.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Card className="overflow-hidden">
          {/* Simple Header */}
          <div className="relative">
            <div className="h-32 sm:h-40 md:h-48 lg:h-56 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full -top-24 -right-24 blur-3xl"></div>
              <div className="absolute w-96 h-96 bg-pink-600/20 rounded-full -bottom-32 -left-20 blur-3xl"></div>
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djRtMCAtMThWMTRjMC0xLjEtLjktMi0yLTJzLTIgLjktMiAydjJoNE0xNCAzNGgyVjE0aC0ydjIweiIvPjwvZz48L3N2Zz4=')]"></div>
              
              {/* Overlay gradient for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10"></div>
            </div>
            
            {/* Profile Header - Positioned over the bottom of header */}
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 mb-4 gap-6">
                <div className="relative">
                  <div className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-xl">
                    <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-white dark:border-gray-800 shadow-inner relative 
                      bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      {isAvatarLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full z-10">
                          <div className="w-10 h-10 border-4 border-t-transparent border-food-orange rounded-full animate-spin"></div>
                        </div>
                      )}
                      <AvatarImage 
                        src={editedProfile.avatar} 
                        alt={profile.name}
                        className="object-cover w-full h-full z-0"
                      />
                      <AvatarFallback className="text-5xl bg-gradient-to-br from-food-orange via-orange-500 to-food-green text-white">
                        {getNameInitial()}
                      </AvatarFallback>
                      
                      {/* Add subtle inner shadow for depth */}
                      <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
                      
                      {/* Add shine effect */}
                      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-30">
                        <div className="w-[200%] h-[200%] -left-1/2 -top-1/2 absolute bg-gradient-to-br from-white via-transparent to-transparent rotate-12"></div>
                      </div>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute -bottom-2 right-2 flex gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="rounded-full bg-white hover:bg-gray-100 shadow-md backdrop-blur-sm border-2 border-gray-100"
                          onClick={handleAvatarUpload}
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                        {editedProfile.avatar && (
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="rounded-full bg-white hover:bg-red-50 text-red-500 shadow-md backdrop-blur-sm border-2 border-gray-100"
                            onClick={handleRemoveAvatar}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-start space-y-1 pt-2 sm:pt-0">
                  {isEditing ? (
                    <Input 
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                      className="text-2xl md:text-3xl font-bold bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {profile.location && (
                      <div className="flex items-center mr-4">
                        <MapPin className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.occupation && (
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                        <span>{profile.occupation}</span>
                      </div>
                    )}
                  </div>
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {interest}
                        </span>
                      ))}
                      {profile.interests.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                          +{profile.interests.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 sm:mt-0 mb-2 sm:mb-8">
                  {isEditing ? (
                    <>
                      <Button onClick={saveProfile} variant="default" className="shadow-md">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" className="ml-2">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md transition-all"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Tabs and Profile Content */}
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-4 mb-4">
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="text-xs sm:text-sm">
                <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
              <TabsTrigger value="interests" className="text-xs sm:text-sm">
                <Heart className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Interests</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm">
                <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
            </TabsList>
            
            <CardContent className="p-4 sm:p-6 pt-2">
              <TabsContent value="personal" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-green-500/10 rounded-full blur-xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                              <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Email</Label>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">{profile.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                              <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Phone</Label>
                              {isEditing ? (
                                <Input 
                                  value={editedProfile.phone}
                                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                                  placeholder="Your phone number"
                                  className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.phone || 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Date of Birth</Label>
                              {isEditing ? (
                                <Popover open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700"
                                    >
                                      {date ? format(date, 'PPP') : <span className="text-gray-400 dark:text-gray-500">Pick a date</span>}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={date}
                                      onSelect={handleDateSelect}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.dob ? format(new Date(profile.dob), 'PPP') : 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                              <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Gender</Label>
                              {isEditing ? (
                                <Select 
                                  value={editedProfile.gender} 
                                  onValueChange={(value) => setEditedProfile({...editedProfile, gender: value})}
                                >
                                  <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {genderOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.gender || 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30 transition-colors">
                              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Location</Label>
                              {isEditing ? (
                                <Input 
                                  value={editedProfile.location || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                                  placeholder="Your location"
                                  className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.location || 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                              <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Website</Label>
                              {isEditing ? (
                                <Input 
                                  value={editedProfile.website || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
                                  placeholder="Your website URL"
                                  className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                                />
                              ) : (
                                profile.website ? (
                                  <a 
                                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                  >
                                    {profile.website}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-1">
                                      <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                                    </svg>
                                  </a>
                                ) : (
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"></div>
                    <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-amber-500/10 rounded-full blur-xl"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                          <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Professional Information</h3>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                              <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Occupation</Label>
                              {isEditing ? (
                                <Input 
                                  value={editedProfile.occupation || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, occupation: e.target.value})}
                                  placeholder="Your occupation"
                                  className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                                />
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.occupation || 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10 p-3 -mx-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                              <GraduationCap className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Education</Label>
                              {isEditing ? (
                                <Input 
                                  value={editedProfile.education || ''}
                                  onChange={(e) => setEditedProfile({...editedProfile, education: e.target.value})}
                                  placeholder="Your education"
                                  className="border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500"
                                />
                              ) : (
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {profile.education || 
                                    <span className="text-gray-400 dark:text-gray-500 italic text-xs">Not provided</span>
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl"></div>
                  <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-xl">
                        <BookOpen className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">About Me</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Bio</Label>
                          <span className="text-xs text-gray-400">{editedProfile.bio?.length || 0} characters</span>
                        </div>
                        <div className="relative group">
                          <textarea
                            id="bio"
                            className="w-full min-h-[250px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 resize-none transition-all"
                            value={editedProfile.bio || ''}
                            onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                            placeholder="Tell us about yourself, your background, interests, and what you'd like others to know about you..."
                          />
                          <div className="absolute inset-0 pointer-events-none border border-cyan-500 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                          A brief description about yourself. This helps others get to know you better.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-cyan-50/50 to-emerald-50/50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-6 rounded-xl min-h-[250px] border border-gray-100 dark:border-gray-800 relative group hover:border-cyan-200 dark:hover:border-cyan-900 transition-colors shadow-inner">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isEditing && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm h-8 w-8 p-0 rounded-full shadow-md hover:shadow-lg transition-all"
                              onClick={() => {
                                setIsEditing(true);
                                setActiveTab("about");
                              }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span className="sr-only">Edit Bio</span>
                            </Button>
                          )}
                        </div>
                        
                        {profile.bio ? (
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[220px] text-center">
                            <div className="p-4 bg-gradient-to-br from-cyan-100 to-emerald-100 dark:from-cyan-800/30 dark:to-emerald-800/30 rounded-full mb-3 shadow-sm">
                              <BookOpen className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">No bio provided yet.</p>
                            {!isEditing && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 border-cyan-200 hover:border-cyan-500 dark:border-cyan-900 dark:hover:border-cyan-700 transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                                onClick={() => {
                                  setIsEditing(true);
                                  setActiveTab("about");
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                Add bio
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interests" className="mt-0">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-pink-500/10 rounded-full blur-xl"></div>
                  <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-rose-500/10 rounded-full blur-xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
                        <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Interests & Hobbies</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-pink-100 dark:group-hover:bg-pink-900/30 transition-colors">
                            <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Your Interests</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {editedProfile.interests?.map((interest, index) => (
                                <div key={index} className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 dark:text-pink-300 rounded-full px-3 py-1 text-sm flex items-center border border-pink-200 dark:border-pink-900/30 shadow-sm">
                                  {interest}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 ml-1 text-pink-400 hover:text-pink-700 dark:text-pink-400"
                                    onClick={() => {
                                      const newInterests = [...(editedProfile.interests || [])];
                                      newInterests.splice(index, 1);
                                      setEditedProfile({...editedProfile, interests: newInterests});
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                placeholder="Add a new interest"
                                className="flex-1 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-pink-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newInterest.trim()) {
                                    e.preventDefault();
                                    const newInterests = [...(editedProfile.interests || []), newInterest.trim()];
                                    setEditedProfile({...editedProfile, interests: newInterests});
                                    setNewInterest('');
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                className="border-pink-200 hover:border-pink-500 dark:border-pink-900 dark:hover:border-pink-700 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
                                onClick={() => {
                                  if (newInterest.trim()) {
                                    const newInterests = [...(editedProfile.interests || []), newInterest.trim()];
                                    setEditedProfile({...editedProfile, interests: newInterests});
                                    setNewInterest('');
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Press Enter or click Add to add a new interest
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl min-h-[200px] border border-gray-100 dark:border-gray-800 relative group hover:border-pink-200 dark:hover:border-pink-900 transition-colors shadow-inner">
                        {profile.interests && profile.interests.length > 0 ? (
                          <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {profile.interests.map((interest, index) => (
                                <div key={index} className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-700 dark:text-pink-300 rounded-full px-3 py-1 text-sm border border-pink-200 dark:border-pink-900/30 shadow-sm">
                                  {interest}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[150px] text-center">
                            <div className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-800/30 dark:to-rose-800/30 rounded-full mb-3 shadow-sm">
                              <Heart className="h-8 w-8 text-pink-500 dark:text-pink-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-3">No interests added yet.</p>
                            {!isEditing && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 border-pink-200 hover:border-pink-500 dark:border-pink-900 dark:hover:border-pink-700 transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                                onClick={() => {
                                  setIsEditing(true);
                                  setActiveTab("interests");
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                Add interests
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="account" className="mt-0">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md hover:shadow-lg transition-all relative overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl"></div>
                  <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-violet-500/10 rounded-full blur-xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                        <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account Management</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="group transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 p-4 -mx-3 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Account Security</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Manage your account security settings
                            </p>
                            <div className="space-y-3">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start border-indigo-200 hover:border-indigo-500 dark:border-indigo-900 dark:hover:border-indigo-700 transition-colors shadow-sm hover:shadow-md">
                                    <LogOut className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                    Sign Out
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Sign out</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to sign out of your account?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 p-4 -mx-3 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <Users2 className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Profile Visibility</Label>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              Control who can see your profile information
                            </p>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-800 dark:text-amber-300 rounded-lg text-sm border border-amber-200 dark:border-amber-900/30 shadow-inner">
                              <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
                                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                Your basic profile information is visible to other users in your groups.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="group transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10 p-4 -mx-3 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <Coffee className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 block">Last Activity</Label>
                            <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                              {profile.lastUpdated ? (
                                <>
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  Profile last updated: {format(new Date(profile.lastUpdated), 'PPP')}
                                </>
                              ) : (
                                <>
                                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  No recent activity
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          {/* Floating Edit Button */}
          {!isEditing && (
            <div className="absolute bottom-4 right-4">
              <Button 
                onClick={() => setIsEditing(true)} 
                size="sm"
                className="shadow-md rounded-full px-4"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
          
          {/* Floating Save/Cancel Buttons when Editing */}
          {isEditing && (
            <div className="sticky bottom-4 flex justify-center pb-4">
              <div className="bg-background/80 backdrop-blur-sm shadow-lg rounded-full flex p-1">
                <Button onClick={saveProfile} variant="default" className="rounded-full px-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={cancelEditing} variant="ghost" className="rounded-full px-4 ml-2">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />
    </Layout>
  );
};

export default ModernProfile; 