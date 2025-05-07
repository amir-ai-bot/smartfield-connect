
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sprout, ShoppingCart, Cloud, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthDialog from '@/components/auth/AuthDialog';

const BottomNavbar = () => {
  const { pathname } = useLocation();
  const { logout, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'text-agri-green-500' : 'text-gray-500';
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

  const openAuthDialog = () => {
    setShowAuthDialog(true);
  };

  return (
    <>
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="flex items-center justify-around p-2">
          <Link to="/" className={`flex flex-col items-center py-2 px-3 ${isActive('/') ? 'text-agri-green-500' : 'text-gray-500'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">{t('home')}</span>
          </Link>
          
          <Link to="/projects" className={`flex flex-col items-center py-2 px-3 ${isActive('/projects') ? 'text-agri-green-500' : 'text-gray-500'}`}>
            <Sprout className="h-6 w-6" />
            <span className="text-xs mt-1">{t('projects')}</span>
          </Link>
          
          <Link to="/suppliers" className={`flex flex-col items-center py-2 px-3 ${isActive('/suppliers') ? 'text-agri-green-500' : 'text-gray-500'}`}>
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs mt-1">{t('suppliers')}</span>
          </Link>
          
          <Link to="/weather" className={`flex flex-col items-center py-2 px-3 ${isActive('/weather') ? 'text-agri-green-500' : 'text-gray-500'}`}>
            <Cloud className="h-6 w-6" />
            <span className="text-xs mt-1">{t('weather')}</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin() && (
                <Link to="/admin" className={`flex flex-col items-center py-2 px-3 ${isActive('/admin') ? 'text-agri-green-500' : 'text-gray-500'}`}>
                  <Settings className="h-6 w-6" />
                  <span className="text-xs mt-1">{t('admin')}</span>
                </Link>
              )}
              {/* Make logout button a Link to fix styling */}
              <button onClick={handleLogout} className="flex flex-col items-center py-2 px-3 text-gray-500 bg-transparent border-none">
                <LogOut className="h-6 w-6" />
                <span className="text-xs mt-1">{t('logout')}</span>
              </button>
            </>
          ) : (
            <button 
              onClick={openAuthDialog} 
              className="flex flex-col items-center py-2 px-3 text-gray-500 bg-transparent border-none"
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">{t('login')}</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Add AuthDialog component */}
      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialView="login"
      />
    </>
  );
};

export default BottomNavbar;
