
import React from 'react';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { UserProfile } from '@/data/types';

interface UserMenuDropdownProps {
  profile: UserProfile | null;
  userEmail?: string;
  signOut: () => void;
}

const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({ profile, userEmail, signOut }) => {
  return (
    <div className="hidden sm:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer transition-all hover:ring-2 hover:ring-food-orange">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback className="bg-food-green text-white">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'M'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="font-medium">
            {userEmail || 'MealSync User'}
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
