
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import UserProfileButton from './auth/UserProfileButton';
import { Button } from '@/components/ui/button';
import {
  Menu,
  X,
  Home,
  Bookmark,
  Users,
  LayoutDashboard,
  Book,
  ShieldCheck,
  CloudSun
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check to avoid SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isHydrated) {
    return null; // Return null on first render to avoid hydration mismatch
  }

  const menuItems = [
    { path: '/', label: t('home'), icon: <Home size={16} className="mr-2" /> },
    // Only show Dashboard to authenticated users
    ...(isAuthenticated ? [
      { path: '/dashboard', label: t('dashboard'), icon: <LayoutDashboard size={16} className="mr-2" /> }
    ] : []),
    { path: '/projects', label: t('projects'), icon: <Book size={16} className="mr-2" /> },
    { path: '/suppliers', label: t('suppliers'), icon: <Users size={16} className="mr-2" /> },
    { path: '/weather', label: t('weather'), icon: <CloudSun size={16} className="mr-2" /> },
    
    // Only show admin link to admin users
    ...(isAuthenticated && user?.role === 'admin' ? [
      { path: '/admin', label: t('admin'), icon: <ShieldCheck size={16} className="mr-2" /> }
    ] : [])
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-200",
        isScrolled ? "shadow-md" : ""
      )}
    >
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/agri-logo.png" alt="AgriSmart Logo" className="h-10" />
          <span className="ml-2 font-semibold text-xl text-emerald-800">AgriSmart</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive(item.path)
                  ? "bg-emerald-100 text-emerald-800"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Right side - User actions */}
        <div className="hidden md:flex items-center space-x-2">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <UserProfileButton />
          ) : (
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/login">{t('login')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">{t('signup')}</Link>
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <LanguageSwitcher />
          <UserProfileButton />
          <Button
            variant="ghost"
            className="p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium flex items-center",
                  isActive(item.path)
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => logout()}
                className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                {t('logout')}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
