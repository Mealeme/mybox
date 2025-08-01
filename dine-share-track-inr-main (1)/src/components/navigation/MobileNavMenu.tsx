import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Users, BarChart, User, Settings as SettingsIcon, Search, LogOut, Filter, Sparkles, Bell, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications } from '@/lib/NotificationsContext';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';
import { cn } from '@/lib/utils';

// Define the avatar update event
const AVATAR_UPDATED_EVENT = 'avatar_updated';

interface MobileNavMenuProps {
  toggleMobileSearch: () => void;
  signOut: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ toggleMobileSearch, signOut }) => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const userEmail = user?.email || '';
  
  // State for avatar
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Listen for avatar updates
  useEffect(() => {
    // Check localStorage for avatar first
    if (userEmail) {
      const storedAvatar = localStorage.getItem(`user-avatar-${userEmail}`);
      if (storedAvatar) {
        setUserAvatar(storedAvatar);
      }
    }
    
    // Listen for avatar update events
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail.email === userEmail) {
        setUserAvatar(event.detail.avatar);
      }
    };
    
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    };
  }, [userEmail]);
  
  // Preload avatar image
  useEffect(() => {
    if (userAvatar) {
      const img = new Image();
      img.onload = () => setAvatarLoaded(true);
      img.src = userAvatar;
      return () => {
        img.onload = null;
      };
    } else {
      setAvatarLoaded(false);
    }
  }, [userAvatar]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  
  return (
    <div className="sm:hidden mobile-menu-container">
      {/* Menu Trigger */}
      <div className="relative">
        {userAvatar && avatarLoaded ? (
          <Avatar 
            className={cn(
              "h-9 w-9 cursor-pointer transition-all duration-300 shadow-md",
              "border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
              isMenuOpen ? "border-food-orange scale-110" : "border-transparent"
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <AvatarImage 
              src={userAvatar} 
              alt="Menu" 
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-gradient-to-br from-food-orange via-orange-500 to-food-green text-white">
              {userEmail.charAt(0).toUpperCase() || 'M'}
            </AvatarFallback>
            
            {/* Add subtle inner shadow for depth */}
            <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none"></div>
            
            {/* Add shine effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-30">
              <div className={cn(
                "w-[200%] h-[200%] -left-1/2 -top-1/2 absolute bg-gradient-to-br from-white via-transparent to-transparent",
                isMenuOpen ? "rotate-45 opacity-80" : "rotate-12 opacity-30",
                "transition-all duration-300"
              )}></div>
            </div>
          </Avatar>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "rounded-full transition-all duration-300",
              isMenuOpen ? "bg-gray-100 dark:bg-gray-800" : ""
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          {/* Menu Content */}
          <div className={cn(
            "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {/* Search Button */}
              <button
                onClick={() => {
                  toggleMobileSearch();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-food-orange to-orange-500 text-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <Search className="mr-3 h-4 w-4 text-white" />
                  <span className="font-semibold">Search Everything</span>
                </div>
                <div className="relative">
                  <Filter className="h-3 w-3 text-white/80" />
                  <Sparkles className="h-2 w-2 absolute -top-1 -right-1 text-yellow-200" />
                </div>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

              {/* Navigation Links */}
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Home className="mr-3 h-4 w-4 text-food-orange" />
                  <span className="text-gray-900 dark:text-gray-100">Home</span>
                </div>
              </Link>

              <Link to="/groups" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Users className="mr-3 h-4 w-4 text-blue-500" />
                  <span className="text-gray-900 dark:text-gray-100">Groups</span>
                </div>
              </Link>

              <Link to="/reports" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <BarChart className="mr-3 h-4 w-4 text-green-500" />
                  <span className="text-gray-900 dark:text-gray-100">Reports</span>
                </div>
              </Link>

              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <User className="mr-3 h-4 w-4 text-teal-500" />
                  <span className="text-gray-900 dark:text-gray-100">My Profile</span>
                </div>
              </Link>

              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <SettingsIcon className="mr-3 h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-gray-100">Settings</span>
                </div>
              </Link>

              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

              <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                <div className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Info className="mr-3 h-4 w-4 text-food-blue" />
                  <span className="text-gray-900 dark:text-gray-100">About Us</span>
                </div>
              </Link>

              <button
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavMenu;
