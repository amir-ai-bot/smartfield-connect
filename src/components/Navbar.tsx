
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import BottomNavbar from './BottomNavbar';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
                  <button onClick={handleLogout} className="hover:text-agri-green-500 transition duration-300">
                    <LogOut className="inline-block h-5 w-5 mr-1 align-text-top" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link to="/auth" className="bg-agri-green-500 hover:bg-agri-green-600 text-white py-2 px-4 rounded-full transition duration-300">
                  {t('login')}
                </Link>
              )}
              <LanguageSwitcher />
            </nav>
          ) : (
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <button onClick={toggleMenu} className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isMobile && (
        <div className={`md:hidden fixed top-0 left-0 w-full h-full bg-white z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
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
                  <button onClick={() => { closeMenu(); handleLogout(); }} className="hover:text-agri-green-500 transition duration-300">
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={closeMenu} className="bg-agri-green-500 hover:bg-agri-green-600 text-white py-2 px-4 rounded-full transition duration-300">
                  {t('login')}
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
      
      {isMobile && <BottomNavbar />}
    </header>
  );
};

export default Navbar;
