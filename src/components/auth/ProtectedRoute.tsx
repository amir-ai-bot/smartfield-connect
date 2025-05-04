
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';
import AuthDialog from '@/components/auth/AuthDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Don't redirect while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
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
            defaultTab="login"
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
