
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't redirect while checking authentication
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    toast.info('Veuillez vous connecter pour accéder à cette page');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
