import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { getSupplier, getRatingsByFournisseurId } from '@/services/supplierService';
import { useAuth } from '@/contexts/AuthContext';
import { createConversation } from '@/services/conversationService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import RatingComponent from '@/components/RatingComponent';
import { Rating } from '@/types/supabase';

interface ExtendedRating extends Rating {
  profiles: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

const SupplierProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<any>(null);
  const [ratings, setRatings] = useState<ExtendedRating[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSupplier = async () => {
      if (id) {
        const supplierData = await getSupplier(id);
        setSupplier(supplierData);
      }
    };
    fetchSupplier();
  }, [id]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (id) {
        const data = await getRatingsByFournisseurId(id);
        // Make sure we have the expected shape with profiles
        const formattedRatings = data.map((rating: any) => ({
          ...rating,
          profiles: rating.profiles || { 
            id: rating.user_id,
            name: 'Anonymous',
          }
        }));
        setRatings(formattedRatings as ExtendedRating[]);
      }
    };
    fetchRatings();
  }, [id]);

  // Make the signature correct for onRatingAdded
  const handleRatingAdded = () => {
    // Refresh ratings after a new one is added
    if (id) {
      const fetchRatings = async () => {
        const data = await getRatingsByFournisseurId(id);
        // Make sure we have the expected shape with profiles
        const formattedRatings = data.map((rating: any) => ({
          ...rating,
          profiles: rating.profiles || { 
            id: rating.user_id,
            name: 'Anonymous',
          }
        }));
        setRatings(formattedRatings as any);
      };
      fetchRatings();
    }
  };

  if (!supplier) {
    return <div>Loading...</div>;
  }

  const handleStartConversation = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour démarrer une conversation.');
      return;
    }

    if (!id) {
      toast.error('Fournisseur ID est manquant.');
      return;
    }

    try {
      const conversationId = await createConversation(user.id, id);
      if (conversationId) {
        // Redirect to the conversation page
        window.location.href = `/conversations/${conversationId}`;
      } else {
        toast.error('Impossible de créer la conversation.');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Erreur lors du démarrage de la conversation.');
    }
  };

  return (
    <div className="container mx-auto mt-8 p-4">
      <Navbar />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Avatar className="w-16 h-16 mr-4">
            {supplier.avatar ? (
              <AvatarImage src={supplier.avatar} alt={supplier.name} />
            ) : (
              <AvatarFallback>{supplier.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-gray-600">{supplier.category}</p>
            <Badge>{supplier.location}</Badge>
          </div>
        </div>
        <Button onClick={handleStartConversation}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Contacter
        </Button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Informations de contact</h2>
        <p>Téléphone: {supplier.phone}</p>
        <p>Email: {supplier.email}</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Produits</h2>
        <ul>
          {supplier.products && supplier.products.map((product: string, index: number) => (
            <li key={index} className="list-disc ml-6">{product}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Avis</h2>
        <RatingComponent 
          supplierId={id || ''} 
          onRatingAdded={handleRatingAdded} 
        />
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="mb-2 p-2 border rounded">
              <div className="flex items-center mb-1">
                <Avatar className="w-6 h-6 mr-2">
                  {rating.profiles?.avatar ? (
                    <AvatarImage src={rating.profiles?.avatar} alt={rating.profiles?.name} />
                  ) : (
                    <AvatarFallback>{(rating.profiles?.name || 'A').substring(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-semibold">{rating.profiles?.name}</span>
              </div>
              <p>Rating: {rating.rating}</p>
              {rating.comment && <p>Commentaire: {rating.comment}</p>}
            </div>
          ))}
        </ScrollArea>
      </div>
      <Footer />
    </div>
  );
};

export default SupplierProfilePage;
