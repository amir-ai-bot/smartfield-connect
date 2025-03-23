
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, CloudSun, Sprout, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        
        {/* How it works section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-agri-blue-50 border border-agri-blue-200">
                <p className="text-xs font-medium text-agri-blue-600">Comment ça marche</p>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Une solution complète pour vos projets agricoles
              </h2>
              
              <p className="text-gray-600">
                AgriSmart vous accompagne à chaque étape de votre projet agricole, de la planification à la récolte.
              </p>
            </div>
            
            <div className="relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-agri-green-300 via-agri-blue-300 to-agri-green-300 transform -translate-y-1/2 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {/* Step 1 */}
                <div className="text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
                  <div className="h-20 w-20 rounded-full bg-agri-green-100 flex items-center justify-center mx-auto mb-6 relative">
                    <Sprout className="h-8 w-8 text-agri-green-500" />
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border border-agri-green-300 animate-pulse"></div>
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold mb-3">Créez votre projet</h3>
                  <p className="text-gray-600 text-sm">
                    Définissez votre projet agricole, sélectionnez les cultures et les ressources nécessaires.
                  </p>
                </div>
                
                {/* Step 2 */}
                <div className="text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <div className="h-20 w-20 rounded-full bg-agri-blue-100 flex items-center justify-center mx-auto mb-6 relative">
                    <CloudSun className="h-8 w-8 text-agri-blue-500" />
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border border-agri-blue-300 animate-pulse"></div>
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold mb-3">Suivez son évolution</h3>
                  <p className="text-gray-600 text-sm">
                    Surveillez en temps réel la croissance de vos cultures, la météo et les besoins en irrigation.
                  </p>
                </div>
                
                {/* Step 3 */}
                <div className="text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <div className="h-20 w-20 rounded-full bg-agri-terra-100 flex items-center justify-center mx-auto mb-6 relative">
                    <Users className="h-8 w-8 text-agri-terra-500" />
                    <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border border-agri-terra-300 animate-pulse"></div>
                  </div>
                  
                  <h3 className="font-display text-xl font-semibold mb-3">Connectez-vous</h3>
                  <p className="text-gray-600 text-sm">
                    Entrez en contact avec les fournisseurs locaux et partagez vos connaissances avec d'autres agriculteurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
              <div className="inline-block px-3 py-1 mb-4 rounded-full bg-agri-terra-50 border border-agri-terra-200">
                <p className="text-xs font-medium text-agri-terra-600">Témoignages</p>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Ce que disent nos utilisateurs
              </h2>
              
              <p className="text-gray-600">
                Découvrez comment AgriSmart a transformé l'expérience agricole de nos utilisateurs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-xl shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-medium">Ahmed Belkhir</h4>
                    <p className="text-sm text-gray-600">Agriculteur à Gafsa</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Grâce à AgriSmart, j'ai pu augmenter ma production d'olives de 30% tout en réduisant ma consommation d'eau. L'application me permet de suivre l'état de mes cultures en temps réel."
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-xl shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-medium">Sara Mansouri</h4>
                    <p className="text-sm text-gray-600">Productrice de dates</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Les prévisions météo précises et les alertes m'ont permis de protéger mes palmiers lors des dernières tempêtes de sable. Je recommande vivement cette application à tous les agriculteurs de la région."
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-xl shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4"></div>
                  <div>
                    <h4 className="font-medium">Karim Bouazizi</h4>
                    <p className="text-sm text-gray-600">Fournisseur d'engrais</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "En tant que fournisseur, AgriSmart m'a permis de développer mon réseau de clients et de mieux comprendre leurs besoins. La plateforme est intuitive et très facile à utiliser."
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <svg key={star} className={`w-4 h-4 ${index < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute -z-10 top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-agri-green-500/5 to-agri-blue-500/5"></div>
          <div className="absolute -z-10 top-[20%] right-[20%] h-[300px] w-[300px] rounded-full bg-agri-green-100/40 blur-3xl"></div>
          <div className="absolute -z-10 bottom-[20%] left-[20%] h-[250px] w-[250px] rounded-full bg-agri-blue-100/40 blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center glass rounded-2xl p-10 animate-slide-up">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Prêt à transformer votre exploitation agricole?
              </h2>
              
              <p className="text-gray-600 mb-8">
                Rejoignez des centaines d'agriculteurs qui ont déjà amélioré leur productivité grâce à AgriSmart.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
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
                  className="border-gray-300 bg-white/80 hover:bg-white rounded-xl"
                >
                  <Link to="/contact">Nous contacter</Link>
                </Button>
              </div>
              
              <div className="mt-8 flex flex-col md:flex-row justify-center md:space-x-8 space-y-4 md:space-y-0 text-gray-600">
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-agri-green-500 mr-2" />
                  <span className="text-sm">Inscription gratuite</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-agri-green-500 mr-2" />
                  <span className="text-sm">Support 24/7</span>
                </div>
                <div className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-agri-green-500 mr-2" />
                  <span className="text-sm">Annulation à tout moment</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
