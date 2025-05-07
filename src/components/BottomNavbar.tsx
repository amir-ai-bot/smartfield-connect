
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Home, 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  Book,
  CloudSun,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavbar = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { logout, isAuthenticated, user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/',
      label: t('home'),
      icon: <Home size={20} />
    },
    {
      path: '/dashboard',
      label: t('dashboard'),
      icon: <LayoutDashboard size={20} />,
      authRequired: true
    },
    {
      path: '/projects',
      label: t('projects'),
      icon: <Book size={20} />
    },
    {
      path: '/suppliers',
      label: t('suppliers'),
      icon: <Users size={20} />
    },
    {
      path: '/weather',
      label: t('weather'),
      icon: <CloudSun size={20} />
    },
    {
      path: '/messages',
      label: t('messages'),
      icon: <MessageSquare size={20} />,
      authRequired: true
    }
  ];

  const handleLogout = () => {
    logout();
  };

  // Filter out items that require authentication if user is not authenticated
  const filteredNavItems = navItems.filter(item => 
    !item.authRequired || (item.authRequired && isAuthenticated)
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              isActive(item.path)
                ? "text-emerald-600"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="text-xs mt-1">{t('logout')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomNavbar;
