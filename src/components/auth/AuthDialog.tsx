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
import Alert from '@/components/ui/alert';

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";
};

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email';

export function AuthDialog({
  open,
  onOpenChange,
  defaultTab = "login",
}: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "signup" | "forgot-password" | "reset-password" | "verify-email">(defaultTab);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [email, setEmail] = useState("");

  const handleSuccess = (successMessage?: string) => {
    if (successMessage) {
      setMessage(successMessage);
      setMessageType("success");
    }
    // After successful operation, decide where to go next
    if (tab === "signup") {
      setTab("verify-email");
    } else if (tab === "forgot-password") {
      setMessage("Instructions de réinitialisation envoyées à votre email.");
      setTab("login");
    } else if (tab === "reset-password") {
      setMessage("Mot de passe réinitialisé avec succès.");
      setTab("login");
    } else if (tab === "verify-email") {
      setMessage("Email vérifié avec succès.");
      setTab("login");
    } else {
      onOpenChange(false);
    }
  };

  const handleLogin = () => {
    setTab("login");
  };

  const handleSignup = () => {
    setTab("signup");
  };

  const handleForgotPassword = () => {
    setTab("forgot-password");
  };

  const handleResetPassword = () => {
    setTab("reset-password");
  };

  const handleVerifyEmail = () => {
    setTab("verify-email");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {message && (
          <Alert
            variant={messageType === "success" ? "default" : "destructive"}
            className="mb-4"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {tab === "login" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Connexion</DialogTitle>
              <DialogDescription>
                Connectez-vous à votre compte
              </DialogDescription>
            </DialogHeader>
            <LoginForm
              onSuccess={handleSuccess}
              onSignup={handleSignup}
              onForgotPassword={handleForgotPassword}
            />
          </div>
        )}

        {tab === "signup" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Création de compte</DialogTitle>
              <DialogDescription>
                Créez un compte pour accéder à toutes les fonctionnalités
              </DialogDescription>
            </DialogHeader>
            <SignupForm
              onSuccess={() => handleSuccess("Compte créé avec succès. Veuillez vérifier votre email.")}
              onBackToLogin={handleLogin}
            />
          </div>
        )}

        {tab === "forgot-password" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Mot de passe oublié</DialogTitle>
              <DialogDescription>
                Nous vous enverrons un lien pour réinitialiser votre mot de passe
              </DialogDescription>
            </DialogHeader>
            <ForgotPasswordForm
              onSuccess={(email) => {
                setEmail(email);
                handleSuccess("Instructions envoyées à votre email");
              }}
              onBackToLogin={handleLogin}
            />
          </div>
        )}

        {tab === "reset-password" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Réinitialisation du mot de passe</DialogTitle>
              <DialogDescription>
                Entrez votre nouveau mot de passe
              </DialogDescription>
            </DialogHeader>
            <ResetPasswordForm
              onSuccess={() => handleSuccess("Mot de passe réinitialisé avec succès")}
              onBackToLogin={handleLogin}
            />
          </div>
        )}

        {tab === "verify-email" && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Vérification d'email</DialogTitle>
              <DialogDescription>
                Veuillez vérifier votre email
              </DialogDescription>
            </DialogHeader>
            <VerifyEmailForm
              onSuccess={() => handleSuccess("Email vérifié avec succès")}
              onBackToLogin={handleLogin}
              email={email}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AuthDialog;
