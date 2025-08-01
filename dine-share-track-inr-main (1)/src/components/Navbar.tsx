import React, { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';
import { useAuth } from '@/components/auth/AmplifyAuthProvider';
import { motion } from 'framer-motion';

// Import our component files
import NavbarBrand from './navigation/NavbarBrand';
import DesktopNavLinks from './navigation/DesktopNavLinks';
import MobileNavMenu from './navigation/MobileNavMenu';
import UserMenuDropdown from './navigation/UserMenuDropdown';
import ThemeToggle from './navigation/ThemeToggle';
import GuestNavActions from './navigation/GuestNavActions';
import MobileSearchBar from '@/components/search/MobileSearchBar';
import NotificationsDropdown from './navigation/NotificationsDropdown';

// Define the avatar update event
const AVATAR_UPDATED_EVENT = 'avatar_updated';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [profile, setProfile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const { user, signOut } = useAuth();
  const userEmail = user?.email || '';
  
  // Mobile search functionality
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchBtnHover, setSearchBtnHover] = useState(false);
  
  // Track when avatar changes to force re-render of components
  const [avatarKey, setAvatarKey] = useState(Date.now());
  
  // Listen for avatar updates to force re-renders
  useEffect(() => {
    const handleAvatarUpdate = () => {
      // Update the key to force re-renders
      setAvatarKey(Date.now());
    };
    
    window.addEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener(AVATAR_UPDATED_EVENT, handleAvatarUpdate as EventListener);
    };
  }, []);
  
  // Force reload of profile data on navigation and when user changes
  useEffect(() => {
    if (!userEmail) return;
    
    // Read user-specific profile if available
    const userSpecificKey = `user-profile-${userEmail}`;
    const storedUserProfile = localStorage.getItem(userSpecificKey);
    
    if (storedUserProfile) {
      try {
        const parsedProfile = JSON.parse(storedUserProfile);
        setProfile(parsedProfile);
      } catch (e) {
        console.error("Failed to parse stored user profile", e);
      }
    } else {
      // Fallback to general profile storage
      const storedProfile = localStorage.getItem('user-profile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile(parsedProfile);
        } catch (e) {
          console.error("Failed to parse stored profile", e);
        }
      }
    }
  }, [userEmail, setProfile, avatarKey]);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };
  
  return (
    <header 
      className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      {/* Mobile Search Bar (Overlay) */}
      {mobileSearchOpen && (
        <MobileSearchBar 
          onClose={() => setMobileSearchOpen(false)} 
          mode={darkMode ? 'dark' : 'light'} 
        />
      )}
      
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left side - Mobile menu only */}
        <div className="flex items-center space-x-2">
          {/* Mobile Menu - Far left */}
          {user && (
            <MobileNavMenu 
              toggleMobileSearch={toggleMobileSearch} 
              signOut={signOut} 
              key={`mobile-menu-${avatarKey}`} // Force re-render when avatar changes
            />
          )}
        </div>
        
        {/* Center - Brand logo and name */}
        <div className="flex-1 flex justify-center">
          <NavbarBrand />
        </div>
        
        {user ? (
          <>
            <DesktopNavLinks openSearch={() => {}} />
            
            <div className="flex items-center space-x-3">
              {/* Mobile search button */}
              <motion.div 
                className="sm:hidden"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setSearchBtnHover(true)}
                onHoverEnd={() => setSearchBtnHover(false)}
              >
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center rounded-full bg-gradient-to-r from-food-orange to-orange-500 text-white shadow-md hover:shadow-lg transition-shadow"
                  onClick={toggleMobileSearch}
                >
                  <div className="relative">
                    <Search className="h-4 w-4 mr-1 transition-transform" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={searchBtnHover ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="h-2 w-2 absolute -top-1 -right-1 text-yellow-200" />
                    </motion.div>
                  </div>
                  <span className="text-xs">Search</span>
                </Button>
              </motion.div>
              
              {/* Notifications dropdown - Now visible on all screen sizes */}
              <NotificationsDropdown />
              
              <UserMenuDropdown 
                profile={profile} 
                userEmail={user.email} 
                signOut={signOut} 
                key={`user-menu-${avatarKey}`} // Force re-render when avatar changes
              />
            </div>
          </>
        ) : (
          <GuestNavActions darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </nav>
    </header>
  );
};

export default Navbar;
