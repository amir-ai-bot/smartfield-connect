
import { Link } from 'react-router-dom';
import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Instagram, MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative h-10 w-10 rounded-full bg-agri-green-400 flex items-center justify-center overflow-hidden">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-agri-green-500 to-agri-blue-500">
                AgriSmart
              </span>
            </Link>
            <p className="text-gray-600 text-sm mt-4 leading-relaxed">
              La plateforme intelligente qui accompagne les agriculteurs de la région de Gafsa dans la gestion complète de leurs projets agricoles.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-agri-green-500 text-sm transition-colors">Accueil</Link></li>
              <li><Link to="/dashboard" className="text-gray-600 hover:text-agri-green-500 text-sm transition-colors">Tableau de bord</Link></li>
              <li><Link to="/projects" className="text-gray-600 hover:text-agri-green-500 text-sm transition-colors">Projets</Link></li>
              <li><Link to="/suppliers" className="text-gray-600 hover:text-agri-green-500 text-sm transition-colors">Fournisseurs</Link></li>
              <li><Link to="/weather" className="text-gray-600 hover:text-agri-green-500 text-sm transition-colors">Météo</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-agri-green-400 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">contact@agrismart.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-agri-green-400 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">+216 99 999 999</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-agri-green-400 mr-2 mt-0.5" />
                <span className="text-gray-600 text-sm">Région de Gafsa, Tunisie</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold mb-4">Nous suivre</h3>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-agri-green-100 transition-colors"
              >
                <Facebook className="h-5 w-5 text-agri-green-500" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-agri-green-100 transition-colors"
              >
                <Twitter className="h-5 w-5 text-agri-green-500" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-agri-green-100 transition-colors"
              >
                <Instagram className="h-5 w-5 text-agri-green-500" />
              </a>
              <a 
                href="#" 
                className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-agri-green-100 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-agri-green-500" />
              </a>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Restez connecté pour les dernières nouvelles et mises à jour.
            </p>
          </div>
        </div>
        
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} AgriSmart. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-agri-green-500 text-sm transition-colors">Confidentialité</Link>
            <Link to="/terms" className="text-gray-500 hover:text-agri-green-500 text-sm transition-colors">Conditions d'utilisation</Link>
            <Link to="/help" className="text-gray-500 hover:text-agri-green-500 text-sm transition-colors">Aide</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
