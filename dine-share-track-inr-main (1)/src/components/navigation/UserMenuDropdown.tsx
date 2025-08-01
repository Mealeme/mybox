import React, { useState, useEffect, useRef } from 'react';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { UserProfile } from '@/data/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Define the avatar update event
const AVATAR_UPDATED_EVENT = 'avatar_updated';

interface UserMenuDropdownProps {
  profile: UserProfile | null;
  userEmail?: string;
  signOut: () => void;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({ profile, userEmail, signOut }) => {
  const navigate = useNavigate();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const preloadedImageRef = useRef<HTMLImageElement | null>(null);
  
  // Add state for tracking avatar directly
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(profile?.avatar);
  
  // State for animation
  const [isHovered, setIsHovered] = useState(false);
  
  // Listen for avatar update events from ModernProfile
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      // Check if this update is relevant for this user
      if (event.detail.email === userEmail) {
        setCurrentAvatar(event.detail.avatar);
        // Reset loading states for the new avatar
        setAvatarLoaded(false);
        setAvatarError(false);
      }
    };
    
    // Add event listener with type assertion
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    
    // Also check localStorage for avatar on mount - direct access for fresh data
    if (userEmail) {
      const storedAvatar = localStorage.getItem(`user-avatar-${userEmail}`);
      if (storedAvatar) {
        setCurrentAvatar(storedAvatar);
      }
    }
    
    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    };
  }, [userEmail]);
  
  // Update avatar from profile prop when it changes
  useEffect(() => {
    if (profile?.avatar && profile.avatar !== currentAvatar) {
      setCurrentAvatar(profile.avatar);
      setAvatarLoaded(false);
      setAvatarError(false);
    }
  }, [profile?.avatar, currentAvatar]);
  
  // Preload the avatar image
  useEffect(() => {
    if (currentAvatar) {
      // Reset states for new image
      setAvatarLoaded(false);
      setAvatarError(false);
      
      // Create a new image to preload
      const img = new Image();
      preloadedImageRef.current = img;
      
      // Set up load and error handlers
      img.onload = () => {
        setAvatarLoaded(true);
      };
      
      img.onerror = () => {
        setAvatarError(true);
      };
      
      // Start loading the image
      img.src = currentAvatar;
      
      // Clean up
      return () => {
        if (preloadedImageRef.current) {
          preloadedImageRef.current.onload = null;
          preloadedImageRef.current.onerror = null;
          preloadedImageRef.current = null;
        }
      };
    }
  }, [currentAvatar]);
  
  // Determine whether to show the avatar image or fallback
  const shouldShowAvatar = currentAvatar && avatarLoaded && !avatarError;
  
  return (
    <div className="hidden sm:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Avatar 
              className={cn(
                "cursor-pointer transition-all border-2 border-transparent", 
                isHovered ? "scale-110 border-food-orange" : "",
                "w-10 h-10 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              )}
            >
              {shouldShowAvatar ? (
                <AvatarImage 
                  src={currentAvatar} 
                  alt={profile?.name || 'User avatar'}
                  className="object-cover w-full h-full"
                  style={{ opacity: 1 }}
                  crossOrigin="anonymous"
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-food-orange via-orange-500 to-food-green text-white">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'M'}
              </AvatarFallback>
              
              {/* Add subtle inner shadow for depth */}
              <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
              
              {/* Add shine effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-30">
                <div className={cn(
                  "w-[200%] h-[200%] -left-1/2 -top-1/2 absolute bg-gradient-to-br from-white via-transparent to-transparent",
                  isHovered ? "rotate-45 opacity-80" : "rotate-12 opacity-30",
                  "transition-all duration-300"
                )}></div>
              </div>
            </Avatar>
            
            {/* Online indicator dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-medium">
            {profile?.name || userEmail || 'MealSync User'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>View profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenuDropdown;
