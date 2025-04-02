
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import WelcomeSection from '@/components/WelcomeSection';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'signup' | 'verify-email'>('login');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const openLoginDialog = () => {
    setAuthDialogView('login');
    setShowAuthDialog(true);
  };

  const openSignupDialog = () => {
    setAuthDialogView('signup');
    setShowAuthDialog(true);
  };

  // If still loading auth state, show nothing to prevent flashing content
  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {isAuthenticated ? (
        // Authenticated users see the normal homepage (though they should get redirected)
        <>
          <HeroSection />
          <FeaturesSection />
        </>
      ) : (
        // First-time or logged-out users see the welcome section
        <>
          <WelcomeSection id="welcome-section" />
          
          <AuthDialog 
            open={showAuthDialog}
            onOpenChange={setShowAuthDialog}
            initialView={authDialogView}
          />
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
