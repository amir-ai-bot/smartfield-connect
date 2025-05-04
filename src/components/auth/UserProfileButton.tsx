
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogIn, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileButtonProps {
  onOpenAuthDialog?: () => void;
}

export function UserProfileButton({ onOpenAuthDialog }: UserProfileButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate('/');
      window.location.reload(); // Force reload to reset all state
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Return Login button if not authenticated
  if (!isAuthenticated) {
    return (
      <Button variant="outline" onClick={onOpenAuthDialog} className="flex items-center">
        <LogIn className="mr-2 h-4 w-4" />
        <span>Connexion</span>
      </Button>
    );
  }

  // Return user dropdown if authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={(user?.display_name || user?.name || "User") + ' profile'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {(user?.display_name || user?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user?.display_name || user?.name || user?.email}</span>
            <span className="text-xs text-gray-500 truncate">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/dashboard">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut} 
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserProfileButton;
