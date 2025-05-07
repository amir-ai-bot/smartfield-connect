
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sprout, BarChart3 } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onExploreProjects: () => void;
  onCreateProject: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onExploreProjects, onCreateProject }) => {
  return (
    <div className="relative bg-white pt-16 pb-32 overflow-hidden">
      <div className="absolute inset-y-0 w-full h-full bg-gradient-to-r from-green-50 to-transparent" aria-hidden="true"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
              <Sprout className="w-4 h-4 mr-2" />
              Agriculture intelligente
            </span>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Gérez vos projets</span>
              <span className="block text-agri-green-600">agricoles intelligemment</span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-500 max-w-3xl">
              Optimisez vos cultures, suivez vos performances et connectez-vous avec les meilleurs fournisseurs. Tout en un seul endroit.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={onCreateProject} className="bg-agri-green-600 hover:bg-agri-green-700">
                Créer un projet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button variant="outline" onClick={onExploreProjects}>
                Explorer des projets
              </Button>
            </div>
            
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                    src={`https://randomuser.me/api/portraits/men/${30 + i}.jpg`}
                    alt=""
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                Rejoint par <span className="font-medium text-gray-900">2,000+</span> agriculteurs
              </span>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80"
              alt="Agriculture Field"
              className="rounded-lg shadow-xl"
            />
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-gray-600">Rendement</span>
                  <BarChart3 className="h-4 w-4 text-agri-green-500" />
                </div>
                <div className="text-2xl font-bold">+23%</div>
                <div className="text-xs text-gray-500">vs dernière saison</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-gray-600">Économies</span>
                  <BarChart3 className="h-4 w-4 text-agri-green-500" />
                </div>
                <div className="text-2xl font-bold">15%</div>
                <div className="text-xs text-gray-500">réduction des coûts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
