
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  Home,
  LayoutDashboard, 
  Sprout, 
  Users, 
  CloudSun,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavbar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', name: 'Accueil', icon: <Home className="h-6 w-6" /> },
    { path: '/dashboard', name: 'Tableau de bord', icon: <LayoutDashboard className="h-6 w-6" />, requireAuth: true },
    { path: '/projects', name: 'Projets', icon: <Sprout className="h-6 w-6" />, requireAuth: true },
    { path: '/suppliers', name: 'Fournisseurs', icon: <Users className="h-6 w-6" /> },
    { path: '/weather', name: 'Météo', icon: <CloudSun className="h-6 w-6" /> },
  ];

  // Filter nav items based on authentication status
  const filteredNavItems = navItems.filter(
    item => !item.requireAuth || (item.requireAuth && isAuthenticated)
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-agri-green-500 flex justify-around items-center px-2 py-2 shadow-lg md:hidden">
      {filteredNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isActive 
                ? "bg-white/20 text-white" 
                : "text-white/80 hover:bg-white/10"
            )}>
              {item.icon}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;
