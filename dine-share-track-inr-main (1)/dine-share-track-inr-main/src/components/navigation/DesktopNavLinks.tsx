
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, BarChart, User, Settings as SettingsIcon, Search } from 'lucide-react';

interface DesktopNavLinksProps {
  openSearch: (event: React.MouseEvent) => void;
}

const DesktopNavLinks: React.FC<DesktopNavLinksProps> = ({ openSearch }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="hidden sm:flex sm:items-center sm:space-x-1">
      <Link to="/dashboard">
        <Button 
          variant={isActive('/dashboard') ? 'default' : 'ghost'}
          className={`text-sm font-medium flex items-center gap-1 transition-all ${
            isActive('/dashboard') ? 'bg-food-orange/90 text-white' : ''
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </Link>
      <Link to="/groups">
        <Button 
          variant={isActive('/groups') ? 'default' : 'ghost'}
          className={`text-sm font-medium flex items-center gap-1 transition-all ${
            isActive('/groups') ? 'bg-food-orange/90 text-white' : ''
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Groups</span>
        </Button>
      </Link>
      <Link to="/reports">
        <Button 
          variant={isActive('/reports') ? 'default' : 'ghost'}
          className={`text-sm font-medium flex items-center gap-1 transition-all ${
            isActive('/reports') ? 'bg-food-orange/90 text-white' : ''
          }`}
        >
          <BarChart className="h-4 w-4" />
          <span>Reports</span>
        </Button>
      </Link>
      <Link to="/profile">
        <Button 
          variant={isActive('/profile') ? 'default' : 'ghost'}
          className={`text-sm font-medium flex items-center gap-1 transition-all ${
            isActive('/profile') ? 'bg-food-orange/90 text-white' : ''
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Button>
      </Link>
      <Link to="/settings">
        <Button 
          variant={isActive('/settings') ? 'default' : 'ghost'}
          className={`text-sm font-medium flex items-center gap-1 transition-all ${
            isActive('/settings') ? 'bg-food-orange/90 text-white' : ''
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </Link>
      <Button 
        variant="ghost"
        className="text-sm font-medium flex items-center gap-1 transition-all"
        onClick={openSearch}
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </Button>
    </div>
  );
};

export default DesktopNavLinks;
