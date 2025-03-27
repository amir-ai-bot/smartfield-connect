
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import UserProfileButton from '@/components/auth/UserProfileButton';
import AuthDialog from '@/components/auth/AuthDialog';
import LogoImg from '../assets/logo.png'; // Changed to a relative path in the assets folder

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    setAuthDialogOpen(true);
    closeMenu();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <img src={LogoImg} alt="Agri Mobile" className="h-8 w-auto" />
            <span className="font-display text-xl font-bold text-agri-green-600 hidden sm:inline-block">Agri Mobile</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-1">
            <NavLinks isActive={isActive} closeMenu={closeMenu} isAdmin={isAdmin} />
          </div>

          {/* Auth button or user profile */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <UserProfileButton />
            ) : (
              <Button 
                onClick={handleLoginClick} 
                className="bg-agri-green-500 hover:bg-agri-green-600 text-white"
              >
                Connexion
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden focus:outline-none" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <NavLinks isActive={isActive} closeMenu={closeMenu} isAdmin={isAdmin} isMobile />
            
            {/* Auth button for mobile */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  onClick={handleLoginClick} 
                  className="w-full bg-agri-green-500 hover:bg-agri-green-600 text-white"
                >
                  Connexion
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthDialog 
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />
    </nav>
  );
};

interface NavLinksProps {
  isActive: (path: string) => boolean;
  closeMenu: () => void;
  isAdmin: () => boolean;
  isMobile?: boolean;
}

const NavLinks = ({ isActive, closeMenu, isAdmin, isMobile }: NavLinksProps) => {
  const linkStyle = (path: string) => isActive(path) ? "bg-agri-green-50 text-agri-green-600" : "text-gray-700 hover:text-agri-green-600";
  const navItemClass = isMobile 
    ? "block px-4 py-2 rounded-md font-medium" 
    : "px-3 py-2 rounded-md text-sm font-medium";

  return (
    <>
      <Link 
        to="/dashboard" 
        className={`${navItemClass} ${linkStyle('/dashboard')}`}
        onClick={closeMenu}
      >
        Tableau de bord
      </Link>
      <Link 
        to="/projects" 
        className={`${navItemClass} ${linkStyle('/projects')}`}
        onClick={closeMenu}
      >
        Projets
      </Link>
      <Link 
        to="/suppliers" 
        className={`${navItemClass} ${linkStyle('/suppliers')}`}
        onClick={closeMenu}
      >
        Fournisseurs
      </Link>
      <Link 
        to="/weather" 
        className={`${navItemClass} ${linkStyle('/weather')}`}
        onClick={closeMenu}
      >
        Météo
      </Link>
      <Link 
        to="/conversations" 
        className={`${navItemClass} ${linkStyle('/conversations')}`}
        onClick={closeMenu}
      >
        Messages
      </Link>
      {isAdmin() && (
        <Link 
          to="/admin" 
          className={`${navItemClass} ${linkStyle('/admin')}`}
          onClick={closeMenu}
        >
          Administration
        </Link>
      )}
    </>
  );
};

export default Navbar;
