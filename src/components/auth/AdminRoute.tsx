
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  // Don't redirect while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
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
