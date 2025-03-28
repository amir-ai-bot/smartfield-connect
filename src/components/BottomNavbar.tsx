import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sprout, ShoppingCart, Cloud, User, LogOut } from 'lucide-react';

// Add useAuth import
import { useAuth } from '@/contexts/AuthContext';

const BottomNavbar = () => {
  const { pathname } = useLocation();
  // Add this line to get the logout function
  const { logout, isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around p-2">
        <Link to="/" className={`flex flex-col items-center py-2 px-3 ${isActive('/') ? 'text-agri-green-500' : 'text-gray-500'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Accueil</span>
        </Link>
        
        <Link to="/projects" className={`flex flex-col items-center py-2 px-3 ${isActive('/projects') ? 'text-agri-green-500' : 'text-gray-500'}`}>
          <Sprout className="h-6 w-6" />
          <span className="text-xs mt-1">Projets</span>
        </Link>
        
        <Link to="/suppliers" className={`flex flex-col items-center py-2 px-3 ${isActive('/suppliers') ? 'text-agri-green-500' : 'text-gray-500'}`}>
          <ShoppingCart className="h-6 w-6" />
          <span className="text-xs mt-1">Marchands</span>
        </Link>
        
        <Link to="/weather" className={`flex flex-col items-center py-2 px-3 ${isActive('/weather') ? 'text-agri-green-500' : 'text-gray-500'}`}>
          <Cloud className="h-6 w-6" />
          <span className="text-xs mt-1">Météo</span>
        </Link>
        
        {isAuthenticated ? (
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-3 text-gray-500"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs mt-1">Déconnexion</span>
          </button>
        ) : (
          <Link to="/profile" className={`flex flex-col items-center py-2 px-3 ${isActive('/profile') ? 'text-agri-green-500' : 'text-gray-500'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profil</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNavbar;
