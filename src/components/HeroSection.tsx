
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      {/* Background gradient circle animation */}
      <div className="absolute -z-10 top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-agri-green-100 to-agri-blue-100 blur-xl opacity-60 animate-float"></div>
      <div className="absolute -z-10 bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-agri-blue-100 to-agri-green-100 blur-xl opacity-50 animate-float animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 py-20 pt-32 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12 animate-slide-up">
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-agri-green-50 border border-agri-green-200">
            <p className="text-xs font-medium text-agri-green-600">Innovation agricole à Gafsa</p>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Agriculture intelligente pour un
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-agri-green-500 to-agri-blue-500 ml-2">futur durable</span>
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 max-w-lg">
            Une plateforme complète qui accompagne les agriculteurs dans la gestion de leurs projets, de la planification à la récolte.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-to-r from-agri-green-500 to-agri-blue-500 hover:from-agri-green-600 hover:to-agri-blue-600 transition-all shadow-md hover:shadow-lg text-white rounded-xl"
            >
              <Link to="/dashboard">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className="border-gray-300 bg-white/90 hover:bg-white rounded-xl"
            >
              <Link to="/about">En savoir plus</Link>
            </Button>
          </div>
          
          <div className="mt-10 flex items-center space-x-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-gray-600">A{id}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Rejoint par +500 agriculteurs</p>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-600 ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2 mt-12 lg:mt-0 animate-slide-up animation-delay-200">
          <div className="relative">
            {/* Main image */}
            <div className="relative z-10 overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80" 
                alt="Agriculture intelligente" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-6 -left-6 z-20 glass p-4 rounded-xl shadow-soft animate-float">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-agri-green-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-agri-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Rendement augmenté</p>
                  <p className="text-agri-green-500 text-xs font-semibold">+30% en moyenne</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-6 -right-6 z-20 glass p-4 rounded-xl shadow-soft animate-float animation-delay-1000">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-agri-blue-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-agri-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Économie d'eau</p>
                  <p className="text-agri-blue-500 text-xs font-semibold">-40% de consommation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
