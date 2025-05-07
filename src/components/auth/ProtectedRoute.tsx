
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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // On mobile, show auth dialog
    if (isMobile) {
      return (
        <>
          <Navigate to="/" replace />
          <AuthDialog
            open={true}
            onOpenChange={setShowAuthDialog}
            initialView="login"
          />
        </>
      );
    }
    
    toast.error('Veuillez vous connecter pour accéder à cette page');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
