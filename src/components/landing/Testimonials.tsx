
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Ahmed Karim',
    role: 'Agriculteur, Sfax',
    content: 'Grâce à AgriSmart, j\'ai optimisé mon utilisation d\'eau et augmenté mes rendements de 20%. Un outil essentiel pour l\'agriculture moderne.',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    name: 'Leila Mansour',
    role: 'Cultivatrice, Gafsa',
    content: 'Je peux désormais suivre mes projets agricoles et mes finances en un seul endroit. Interface simple et intuitive, même pour les débutants.',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'Mohamed Benali',
    role: 'Fournisseur de semences',
    content: 'AgriSmart m\'a permis de me connecter directement avec les agriculteurs de ma région. Mes ventes ont augmenté de 35% depuis mon inscription.',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-gray-600">
            Des agriculteurs et fournisseurs de toute la région ont adopté AgriSmart pour améliorer leur productivité.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 mb-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <blockquote className="mb-4 text-gray-600 italic">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <footer>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </footer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
