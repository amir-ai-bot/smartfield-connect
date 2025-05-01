
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Don't redirect while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error('Veuillez vous connecter pour accéder à cette page');
    return <Navigate to="/" replace />;
  }

  if (!isAdmin()) {
    toast.error('Accès réservé aux administrateurs');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
