
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import AuthDialog from '@/components/auth/AuthDialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tractor, Sprout, Cloud, Users, ArrowRight, Camera, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setIsAuthDialogOpen(false);
    }
  }, [isAuthenticated]);
  
  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      navigate('/projects');
    } else {
      setActiveTab('register');
      setIsAuthDialogOpen(true);
    }
  };

  const handleLoginClick = () => {
    if (!isAuthenticated) {
      setActiveTab('login');
      setIsAuthDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with background */}
      <section className="relative py-32 bg-gradient-to-br from-green-700 to-green-900">
        <div className="absolute inset-0 opacity-10 bg-[url('/src/assets/farming-pattern.svg')] bg-repeat"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4 px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Nouvelle version disponible
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Cultivez votre avenir <span className="text-green-300">intelligemment</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10">
              Planifiez, gérez et optimisez vos projets agricoles avec notre plateforme innovante. Obtenez des conseils adaptés et connectez-vous avec des fournisseurs locaux.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={handleGetStartedClick}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8"
              >
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/projects')}
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              >
                Voir les projets
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos fonctionnalités principales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez comment AgriSmart peut vous aider à améliorer votre exploitation agricole grâce à des outils innovants et une approche data-driven.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Tractor className="h-10 w-10" />}
              title="Gestion de projets agricoles"
              description="Créez et suivez vos projets agricoles avec des indicateurs clairs et une vision d'ensemble de vos cultures."
              color="green"
            />
            <FeatureCard 
              icon={<Cloud className="h-10 w-10" />}
              title="Prévisions météorologiques"
              description="Accédez aux prévisions météo détaillées pour mieux planifier vos activités et protéger vos cultures."
              color="blue"
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10" />}
              title="Réseau de fournisseurs"
              description="Connectez-vous avec des fournisseurs locaux pour obtenir les meilleurs prix et services pour votre exploitation."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                src="/src/assets/dashboard-preview.jpg"
                alt="Dashboard Preview"
                className="w-full max-w-lg mx-auto rounded-lg shadow-xl"
              />
            </div>
            <div className="lg:w-1/2 lg:pl-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Prenez des décisions éclairées grâce à nos analyses
              </h2>
              <div className="space-y-4 mb-8">
                <FeatureItem 
                  icon={<Sprout />} 
                  title="Suivi des cultures" 
                  description="Suivez la croissance et la santé de vos cultures en temps réel"
                />
                <FeatureItem 
                  icon={<LineChart />} 
                  title="Analyses prédictives" 
                  description="Anticipez les rendements et optimisez vos ressources"
                />
                <FeatureItem 
                  icon={<Camera />} 
                  title="Surveillance visuelle" 
                  description="Identifiez les problèmes avant qu'ils ne deviennent critiques"
                />
              </div>
              <Button 
                onClick={handleGetStartedClick} 
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Explorer la plateforme
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ce que nos utilisateurs disent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Cette plateforme a révolutionné ma façon de gérer mon exploitation. Je gagne un temps précieux et mes rendements ont augmenté."
              author="Mohammed A."
              role="Agriculteur, Région de Fez"
            />
            <TestimonialCard 
              quote="Je peux facilement connecter avec des agriculteurs et proposer mes services. Une vraie révolution pour mon commerce d'équipements agricoles."
              author="Samira K."
              role="Fournisseuse agricole, Casablanca"
            />
            <TestimonialCard 
              quote="Les prévisions météo précises et les alertes m'ont sauvé plusieurs récoltes. Un outil indispensable pour tout agriculteur moderne."
              author="Youssef T."
              role="Producteur d'olives, Marrakech"
            />
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        defaultTab={activeTab}
      />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'green' | 'blue' | 'purple';
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      <div className={`inline-block rounded-full p-3 mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => (
  <div className="flex items-start">
    <div className="bg-green-100 rounded-full p-3 text-green-600 mr-4">
      {icon}
    </div>
    <div>
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard = ({ quote, author, role }: TestimonialCardProps) => (
  <Card className="bg-white border-0 shadow-md">
    <CardContent className="p-6">
      <div className="text-green-600 text-4xl font-serif mb-4">"</div>
      <p className="text-gray-700 mb-6">{quote}</p>
      <div>
        <p className="font-medium text-gray-900">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </CardContent>
  </Card>
);

export default Index;
