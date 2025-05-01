
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTAProps {
  onGetStarted: () => void;
}

const CTA: React.FC<CTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Prêt à commencer votre voyage vers une agriculture plus intelligente ?
          </h2>
          
          <p className="text-gray-600 text-lg mb-8">
            Rejoignez des milliers d'agriculteurs qui optimisent déjà leurs exploitations avec AgriSmart.
          </p>
          
          <Button 
            onClick={onGetStarted} 
            size="lg"
            className="bg-agri-green-500 hover:bg-agri-green-600 text-white px-8 py-3 text-lg"
          >
            Commencer maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="mt-4 text-gray-500 text-sm">
            Aucune carte de crédit requise. Commencez gratuitement.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
