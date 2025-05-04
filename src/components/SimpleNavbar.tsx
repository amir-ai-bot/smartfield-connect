import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';
import AuthDialog from '@/components/auth/AuthDialog';

const SimpleNavbar: React.FC = () => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-agri-green-500 font-medium' : 'text-gray-600';
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="h-10 w-10 bg-agri-green-500 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={logo}
                  alt="AgriTech Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">AgriTech</span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link to="/" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/')}`}>
                {t('home')}
              </Link>
              <Link to="/projects" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/projects')}`}>
                {t('projects')}
              </Link>
              <Link to="/suppliers" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/suppliers')}`}>
                {t('suppliers')}
              </Link>
              <button
                className={`hover:text-agri-green-500 transition duration-300 ${isActive('/meteo')} text-left`}
                onClick={() => {
                  console.log('Meteo button clicked');
                  console.log('Current pathname:', location.pathname);
                  navigate('/meteo');
                }}
              >
                {t('weather')}
              </button>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/profile')}`}>
                    {t('profile')}
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/admin')}`}>
                      <Settings className="inline-block h-5 w-5 mr-1 align-text-top" />
                      <span>{t('admin')}</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="hover:text-agri-green-500 transition duration-300 flex items-center"
                  >
                    <LogOut className="inline-block h-5 w-5 mr-1 align-text-top" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-agri-green-500 hover:bg-agri-green-600 text-white py-2 px-4 rounded-full transition duration-300"
                >
                  {t('login')}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
    </>
  );
};

export default SimpleNavbar;
