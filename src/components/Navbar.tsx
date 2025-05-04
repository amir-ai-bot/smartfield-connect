import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';
import BottomNavbar from './BottomNavbar';
import LanguageSwitcher from './LanguageSwitcher';
import AuthDialog from '@/components/auth/AuthDialog';

const Navbar = () => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-agri-green-500' : 'text-gray-500';
  };

  const openAuthDialog = () => {
    setShowAuthDialog(true);
  };

  return (
    <header className={isScrolled ? "fixed w-full z-50 bg-white shadow-md animate-in fade-in slide-in-from-top-2 transition-all duration-300" : "fixed w-full z-50 bg-white shadow-sm transition-all duration-300"}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 bg-agri-green-500 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={logo} 
                alt="AgriTech Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="ml-2 text-xl font-display font-bold text-gray-900">AgriTech</span>
          </Link>
          
          {!isMobile ? (
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/')}`}>{t('home')}</Link>
              <Link to="/projects" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/projects')}`}>{t('projects')}</Link>
              <Link to="/suppliers" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/suppliers')}`}>{t('suppliers')}</Link>
              <Link to="/weather" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/weather')}`}>{t('weather')}</Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/profile')}`}>{t('profile')}</Link>
                  {isAdmin() && (
                    <Link to="/admin" className={`hover:text-agri-green-500 transition duration-300 ${isActive('/admin')}`}>
                      <Settings className="inline-block h-5 w-5 mr-1 align-text-top" />
                      <span>{t('admin')}</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="hover:text-agri-green-500 transition duration-300 flex items-center">
                    <LogOut className="inline-block h-5 w-5 mr-1 align-text-top" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={openAuthDialog} 
                  className="bg-agri-green-500 hover:bg-agri-green-600 text-white py-2 px-4 rounded-full transition duration-300"
                >
                  {t('login')}
                </button>
              )}
              <LanguageSwitcher />
            </nav>
          ) : (
            <div className="md:hidden">
              <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            <div className="p-4 flex justify-end">
              <button onClick={closeMenu} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col items-center space-y-4 p-4">
              <Link to="/" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/')}`}>{t('home')}</Link>
              <Link to="/projects" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/projects')}`}>{t('projects')}</Link>
              <Link to="/suppliers" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/suppliers')}`}>{t('suppliers')}</Link>
              <Link to="/weather" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/weather')}`}>{t('weather')}</Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/profile')}`}>{t('profile')}</Link>
                  {isAdmin() && (
                    <Link to="/admin" onClick={closeMenu} className={`hover:text-agri-green-500 transition duration-300 ${isActive('/admin')}`}>
                      <Settings className="inline-block h-5 w-5 mr-1 align-text-top" />
                      <span>{t('admin')}</span>
                    </Link>
                  )}
                  <button 
                    onClick={() => { closeMenu(); handleLogout(); }} 
                    className="hover:text-agri-green-500 transition duration-300 w-full text-center"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { closeMenu(); openAuthDialog(); }} 
                  className="bg-agri-green-500 hover:bg-agri-green-600 text-white py-2 px-4 rounded-full transition duration-300 w-full"
                >
                  {t('login')}
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
      
      {/* Add AuthDialog component */}
      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="login"
      />
      
      {isMobile && <BottomNavbar />}
    </header>
  );
};

export default Navbar;
