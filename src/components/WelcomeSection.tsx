import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/auth/AuthDialog';
import { ArrowRight, Award, BadgeCheck, BarChart3, CloudSun } from 'lucide-react';

interface WelcomeSectionProps {
  id?: string;
}

const benefits = [
  {
    icon: <CloudSun className="h-6 w-6" />,
    title: "Prévisions météo précises",
    description: "Accédez aux prévisions météorologiques locales pour optimiser vos activités agricoles."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Gestion efficace des cultures",
    description: "Planifiez et suivez vos cultures avec des outils intelligents et intuitifs."
  },
  {
    icon: <BadgeCheck className="h-6 w-6" />,
    title: "Ressources optimisées",
    description: "Réduisez votre consommation d'eau et d'intrants grâce à nos analyses."
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analyses détaillées",
    description: "Visualisez vos performances et prenez des décisions basées sur les données."
  }
];

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ id }) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'signup'>('login');

  const openLoginDialog = () => {
    setInitialView('login');
    setAuthDialogOpen(true);
  };

  const openSignupDialog = () => {
    setInitialView('signup');
    setAuthDialogOpen(true);
  };

  return (
    <section id={id} className="pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Bienvenue sur <span className="bg-clip-text text-transparent bg-gradient-to-r from-agri-green-500 to-agri-blue-500">AgriSmart</span>
          </h2>
          
          <p className="text-gray-600 text-lg mb-8">
            Découvrez comment AgriSmart peut transformer votre expérience agricole avec des outils innovants et intelligents.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-agri-green-500 to-agri-blue-500 hover:from-agri-green-600 hover:to-agri-blue-600 text-white"
              onClick={openLoginDialog}
            >
              Se connecter
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-300 bg-white"
              onClick={openSignupDialog}
            >
              S'inscrire
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-soft hover:shadow-soft-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-agri-green-400 to-agri-blue-400 flex items-center justify-center mb-5 text-white">
                {benefit.icon}
              </div>
              
              <h3 className="font-display text-lg font-semibold mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
        initialView={initialView}
      />
    </section>
  );
};

export default WelcomeSection;
