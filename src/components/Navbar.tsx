
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, MoreVertical } from 'lucide-react';
import UserProfileButton from '@/components/auth/UserProfileButton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll events for styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  // Logo URL
  const logoUrl = 'https://img.freepik.com/premium-vector/agriculture-logo-template-green-hand-leaf_112739-356.jpg';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 h-14 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logoUrl} 
            alt="AgriSmart Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover mr-3" 
          />
          <span className="text-xl md:text-2xl font-bold text-green-700">AgriSmart</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center justify-center space-x-6">
          <Link 
            to="/" 
            className={`text-gray-700 hover:text-green-600 ${
              location.pathname === '/' ? 'font-medium text-green-600' : ''
            }`}
          >
            Accueil
          </Link>
          <Link 
            to="/suppliers" 
            className={`text-gray-700 hover:text-green-600 ${
              location.pathname === '/suppliers' ? 'font-medium text-green-600' : ''
            }`}
          >
            Fournisseurs
          </Link>
          <Link 
            to="/weather" 
            className={`text-gray-700 hover:text-green-600 ${
              location.pathname === '/weather' ? 'font-medium text-green-600' : ''
            }`}
          >
            Météo
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`text-gray-700 hover:text-green-600 ${
                  location.pathname === '/dashboard' ? 'font-medium text-green-600' : ''
                }`}
              >
                Tableau de bord
              </Link>
              <Link 
                to="/projects" 
                className={`text-gray-700 hover:text-green-600 ${
                  location.pathname === '/projects' ? 'font-medium text-green-600' : ''
                }`}
              >
                Projets
              </Link>
              <Link 
                to="/conversations" 
                className={`text-gray-700 hover:text-green-600 ${
                  location.pathname.includes('/conversations') ? 'font-medium text-green-600' : ''
                }`}
              >
                Messages
              </Link>
            </>
          )}
          {isAuthenticated && isAdmin() && (
            <Link 
              to="/admin" 
              className={`text-gray-700 hover:text-green-600 ${
                location.pathname === '/admin' ? 'font-medium text-green-600' : ''
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right side - user and theme */}
        <div className="flex items-center space-x-4">
          <UserProfileButton />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                <span>{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
              }`}
            >
              Accueil
            </Link>
            <Link 
              to="/suppliers" 
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/suppliers' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
              }`}
            >
              Fournisseurs
            </Link>
            <Link 
              to="/weather" 
              className={`block px-4 py-2 rounded-md ${
                location.pathname === '/weather' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
              }`}
            >
              Météo
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === '/dashboard' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Tableau de bord
                </Link>
                <Link 
                  to="/projects" 
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === '/projects' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Projets
                </Link>
                <Link 
                  to="/conversations" 
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname.includes('/conversations') ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Messages
                </Link>
                <Link 
                  to="/profile" 
                  className={`block px-4 py-2 rounded-md ${
                    location.pathname === '/profile' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Profil
                </Link>
              </>
            )}
            {isAuthenticated && isAdmin() && (
              <Link 
                to="/admin" 
                className={`block px-4 py-2 rounded-md ${
                  location.pathname === '/admin' ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                }`}
              >
                Administration
              </Link>
            )}
            <div className="pt-2 border-t flex items-center justify-between px-4">
              <span className="text-gray-600">Thème</span>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
