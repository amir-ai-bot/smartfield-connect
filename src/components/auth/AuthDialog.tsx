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
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import VerifyEmailForm from '@/components/auth/VerifyEmailForm';
import { useAuth } from '@/contexts/AuthContext';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email';
};

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email';

const AuthDialog: React.FC<AuthDialogProps> = ({ 
  open, 
  onOpenChange,
  initialView = 'login'
}) => {
  const { user } = useAuth();
  const [view, setView] = useState<AuthView>(initialView);
  const [tempEmail, setTempEmail] = useState<string>('');

  // Reset view when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Wait for closing animation to complete before resetting view
      setTimeout(() => setView(initialView), 300);
    }
    onOpenChange(open);
  };

  const handleSwitchToForgotPassword = () => {
    setView('forgot-password');
  };

  const handleSwitchToResetPassword = (email?: string) => {
    if (email) setTempEmail(email);
    setView('reset-password');
  };

  const handleSwitchToVerifyEmail = (email?: string) => {
    if (email) setTempEmail(email);
    setView('verify-email');
  };

  const titles = {
    'login': 'Connexion',
    'signup': 'Inscription',
    'forgot-password': 'Mot de passe oublié',
    'reset-password': 'Nouveau mot de passe',
    'verify-email': 'Vérification email'
  };

  const descriptions = {
    'login': 'Connectez-vous pour accéder à votre compte.',
    'signup': 'Créez un compte pour commencer à utiliser l\'application.',
    'forgot-password': 'Recevez un code pour réinitialiser votre mot de passe.',
    'reset-password': 'Entrez le code reçu et votre nouveau mot de passe.',
    'verify-email': 'Vérifiez votre adresse email pour sécuriser votre compte.'
  };

  const renderForm = () => {
    switch (view) {
      case 'login':
        return (
          <LoginForm 
            onSuccess={() => onOpenChange(false)} 
            onSwitchToSignup={() => setView('signup')}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
      case 'signup':
        return (
          <SignupForm 
            onSuccess={() => onOpenChange(false)} 
            onSwitchToLogin={() => setView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            onSuccess={() => handleSwitchToResetPassword()} 
            onBackToLogin={() => setView('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm 
            onSuccess={() => setView('login')}
          />
        );
      case 'verify-email':
        return (
          <VerifyEmailForm
            email={tempEmail || user?.email || ''}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        );
      default:
        return (
          <LoginForm 
            onSuccess={() => onOpenChange(false)} 
            onSwitchToSignup={() => setView('signup')}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{titles[view]}</DialogTitle>
          <DialogDescription>{descriptions[view]}</DialogDescription>
        </DialogHeader>

        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
