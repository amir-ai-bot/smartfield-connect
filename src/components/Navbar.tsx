import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Home, 
  Sprout, 
  Users, 
  CloudSun, 
  User,
  ShieldCheck
} from 'lucide-react';
import UserProfileButton from '@/components/auth/UserProfileButton';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', name: 'Accueil', icon: <Home className="h-4 w-4" /> },
    { path: '/projects', name: 'Projets', icon: <Sprout className="h-4 w-4" />, requireAuth: true },
    { path: '/suppliers', name: 'Fournisseurs', icon: <Users className="h-4 w-4" /> },
    { path: '/weather', name: 'Météo', icon: <CloudSun className="h-4 w-4" /> },
    { path: '/admin', name: 'Administration', icon: <ShieldCheck className="h-4 w-4" />, requireAdmin: true },
    { path: '/profile', name: 'Profil', icon: <User className="h-4 w-4" />, requireAuth: true },
  ];

  // Filter nav items based on authentication status and admin status
  const filteredNavItems = navItems.filter(
    item => 
      (!item.requireAuth || (item.requireAuth && isAuthenticated)) && 
      (!item.requireAdmin || (item.requireAdmin && isAdmin()))
  );

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 hidden md:block",
        isScrolled ? "glass py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative h-10 w-10 rounded-full bg-agri-green-400 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
            <Sprout className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
          </div>
          <span className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-agri-green-500 to-agri-blue-500">
            AgriSmart
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex space-x-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all",
                location.pathname === item.path 
                  ? "text-agri-green-600 bg-agri-green-50" 
                  : "text-gray-700 hover:text-agri-green-500 hover:bg-gray-50"
              )}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User profile or login button */}
        <div className="flex items-center">
          <UserProfileButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
