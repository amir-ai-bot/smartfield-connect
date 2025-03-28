
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, MessageSquare, HelpCircle, Heart } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const UserProfileButton = () => {
  const { user, logout, isAdmin } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  if (!user) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={() => setShowAuthDialog(true)}
          className="whitespace-nowrap"
        >
          Se connecter
        </Button>
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          initialView="login"
        />
      </div>
    );
  }

  return (
    <div ref={dropdownRef}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 z-50">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer" onClick={() => setDropdownOpen(false)}>
              <User className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/conversations" className="cursor-pointer" onClick={() => setDropdownOpen(false)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Mes conversations</span>
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link to="/favorites" className="cursor-pointer" onClick={() => setDropdownOpen(false)}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Fournisseurs favoris</span>
            </Link>
          </DropdownMenuItem>
          
          {isAdmin() && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer" onClick={() => setDropdownOpen(false)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Administration</span>
              </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild>
            <a 
              href="mailto:yassindhibi100@gmail.com" 
              className="cursor-pointer"
              onClick={() => setDropdownOpen(false)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Support</span>
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => {
              logout();
              setDropdownOpen(false);
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileButton;
