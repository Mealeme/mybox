
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Home, Users, BarChart, User, Settings as SettingsIcon, Search, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface MobileNavMenuProps {
  toggleMobileSearch: () => void;
  signOut: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ toggleMobileSearch, signOut }) => {
  return (
    <div className="sm:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-scale-in">
          <Link to="/dashboard">
            <DropdownMenuItem className="cursor-pointer">
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/groups">
            <DropdownMenuItem className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>Groups</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/reports">
            <DropdownMenuItem className="cursor-pointer">
              <BarChart className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/profile">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <Link to="/settings">
            <DropdownMenuItem className="cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={toggleMobileSearch}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MobileNavMenu;
