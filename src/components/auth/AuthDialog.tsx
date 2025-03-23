
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: 'login' | 'signup';
};

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onOpenChange,
  initialView = 'login'
}) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);

  // Reset view when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Wait for closing animation to complete before resetting view
      setTimeout(() => setView(initialView), 300);
    }
    onOpenChange(open);
  };

  const titles = {
    login: 'Connexion',
    signup: 'Inscription'
  };

  const descriptions = {
    login: 'Connectez-vous pour accéder à votre compte.',
    signup: 'Créez un compte pour commencer à utiliser l\'application.'
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{titles[view]}</DialogTitle>
          <DialogDescription>{descriptions[view]}</DialogDescription>
        </DialogHeader>

        {view === 'login' ? (
          <LoginForm onSuccess={() => onOpenChange(false)} onSwitchToSignup={() => setView('signup')} />
        ) : (
          <SignupForm onSuccess={() => onOpenChange(false)} onSwitchToLogin={() => setView('login')} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
