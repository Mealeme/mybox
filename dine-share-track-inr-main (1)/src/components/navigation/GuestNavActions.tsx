import React from 'react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

interface GuestNavActionsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const GuestNavActions: React.FC<GuestNavActionsProps> = ({ darkMode, setDarkMode }) => {
  return (
    <div className="flex items-center space-x-2">
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      
      {/* Real sign in button - links to the login page */}
      <Button variant="default" asChild>
        <Link to="/">Sign In</Link>
      </Button>
    </div>
  );
};

export default GuestNavActions;
