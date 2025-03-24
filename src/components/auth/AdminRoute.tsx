
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

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
