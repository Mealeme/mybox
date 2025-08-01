
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserProfile } from '@/data/types';
import { useAuth } from '@/components/auth/AuthProvider';
import SearchDialog from './search/SearchDialog';
import MobileSearchBar from './search/MobileSearchBar';

// Import our new component files
import NavbarBrand from './navigation/NavbarBrand';
import DesktopNavLinks from './navigation/DesktopNavLinks';
import MobileNavMenu from './navigation/MobileNavMenu';
import UserMenuDropdown from './navigation/UserMenuDropdown';
import ThemeToggle from './navigation/ThemeToggle';
import GuestNavActions from './navigation/GuestNavActions';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [profile] = useLocalStorage<UserProfile | null>('user-profile', null);
  const { user, signOut } = useAuth();
  
  // Search functionality
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
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
  
  const openSearchBelow = (event: React.MouseEvent) => {
    // Prevent the default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Open the search dialog
    setSearchOpen(true);
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
        <NavbarBrand />
        
        {user ? (
          <>
            <DesktopNavLinks openSearch={openSearchBelow} />
            
            <div className="flex items-center space-x-3">
              {/* Mobile search button */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={toggleMobileSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              
              <UserMenuDropdown 
                profile={profile} 
                userEmail={user.email} 
                signOut={signOut} 
              />
              
              <MobileNavMenu 
                toggleMobileSearch={toggleMobileSearch} 
                signOut={signOut} 
              />
            </div>
          </>
        ) : (
          <GuestNavActions darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </nav>
      
      {/* Desktop Search Dialog */}
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        mode={darkMode ? 'dark' : 'light'}
      />
    </header>
  );
};

export default Navbar;
