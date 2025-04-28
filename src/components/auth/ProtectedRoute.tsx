
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import AuthDialog from '@/components/auth/AuthDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Don't redirect while checking authentication
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    // On mobile, show auth dialog instead of just redirecting
    if (isMobile) {
      // Show toast on mobile
      toast.info('Veuillez vous connecter pour accéder à cette page');
      
      // Show the auth dialog
      return (
        <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentification requise</h2>
            <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page</p>
          </div>
          
          <AuthDialog 
            open={true} 
            onOpenChange={(open) => {
              if (!open) {
                // Redirect to home if dialog is closed
                window.location.href = '/';
              }
            }}
            initialView="login"
          />
        </div>
      );
    }
    
    // Default behavior for desktop
    toast.info('Veuillez vous connecter pour accéder à cette page');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
