
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/Footer';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup' | 'forgotPassword'>('login');

  const handleCreateProjectClick = () => {
    if (isAuthenticated) {
      navigate('/projects/create');
    } else {
      setAuthModalView('signup');
      setShowAuthModal(true);
      toast.info('Vous devez être connecté pour créer un projet');
    }
  };

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthModalView('signup');
      setShowAuthModal(true);
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
      <Features />
      <Testimonials />
      <CTA onGetStarted={handleGetStartedClick} />
      <Footer />
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authModalView}
      />
    </div>
  );
};

export default Index;
