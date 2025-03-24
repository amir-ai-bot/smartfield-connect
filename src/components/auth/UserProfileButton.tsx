
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import AuthDialog from '@/components/auth/AuthDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

const UserProfileButton = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'signup'>('login');

  const openLoginDialog = () => {
    setAuthDialogView('login');
    setAuthDialogOpen(true);
  };

  const openSignupDialog = () => {
    setAuthDialogView('signup');
    setAuthDialogOpen(true);
  };

  // If not authenticated, show login/signup buttons
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openLoginDialog}
            className="hidden md:flex"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Connexion
          </Button>
          <Button
            size="sm"
            onClick={openSignupDialog}
            className="hidden md:flex"
          >
            S'inscrire
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openLoginDialog}
            className="md:hidden"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>

        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen}
          initialView={authDialogView}
        />
      </>
    );
  }

  // If authenticated, show user dropdown
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <span className="font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
              {isAdmin() && (
                <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 mt-1 inline-block w-fit">
                  Administrateur
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin() && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Administration</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserProfileButton;
