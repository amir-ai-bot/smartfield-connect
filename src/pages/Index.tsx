
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Hero from '@/components/landing/Hero';
import Footer from '@/components/Footer';
import AuthDialog from '@/components/auth/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import FeaturesSection from '@/components/landing/Features';
import TestimonialsSection from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTA';

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogView, setAuthDialogView] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email'>('login');

  const handleCreateProjectClick = () => {
    if (isAuthenticated) {
      navigate('/projects/create');
    } else {
      setAuthDialogView('signup');
      setShowAuthDialog(true);
      toast.info('Vous devez être connecté pour créer un projet');
    }
  };

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthDialogView('signup');
      setShowAuthDialog(true);
    }
  };

  const handleExploreProjectsClick = () => {
    navigate('/public-projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Hero 
        onGetStarted={handleGetStartedClick} 
        onExploreProjects={handleExploreProjectsClick}
        onCreateProject={handleCreateProjectClick}
      />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStartedClick} />
      <Footer />
      
      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        initialView={authDialogView}
      />
    </div>
  );
};

export default Index;
