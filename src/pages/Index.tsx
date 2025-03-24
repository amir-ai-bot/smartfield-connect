
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
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'signup'>('login');

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
          <WelcomeSection />
          
          {/* Add mobile-specific auth buttons */}
          {isMobile && (
            <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-4 p-4 z-40">
              <Button 
                onClick={openLoginDialog}
                size="lg"
                className="flex-1 max-w-40 bg-agri-green-500 hover:bg-agri-green-600"
              >
                Connexion
              </Button>
              <Button 
                onClick={openSignupDialog}
                size="lg" 
                variant="outline"
                className="flex-1 max-w-40 border-agri-green-500 text-agri-green-500"
              >
                S'inscrire
              </Button>
            </div>
          )}
          
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
