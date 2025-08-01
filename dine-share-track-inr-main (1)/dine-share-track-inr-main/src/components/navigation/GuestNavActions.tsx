
import React from 'react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';

interface GuestNavActionsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const GuestNavActions: React.FC<GuestNavActionsProps> = ({ darkMode, setDarkMode }) => {
  const { signIn } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <Button variant="default" onClick={signIn}>Sign In with Cognito</Button>
    </div>
  );
};

export default GuestNavActions;
