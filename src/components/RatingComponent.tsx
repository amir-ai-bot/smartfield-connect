
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Rating as AuthRating } from '@/types/auth';
import { Star } from 'lucide-react';
import { addRating } from '@/services/ratingService';

interface RatingComponentProps {
  fournisseurId?: string;
  onRatingAdded: (rating: AuthRating) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ fournisseurId, onRatingAdded }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const { user } = useAuth();

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis.');
      return;
    }

    if (!fournisseurId) {
      toast.error('ID du fournisseur manquant.');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note.');
      return;
    }

    try {
      // Check if the supplier exists
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('id', fournisseurId)
        .single();
        
      if (supplierError) {
        throw new Error('Supplier not found');
      }
      
      // Add the rating
      const newRating = await addRating(user.id, fournisseurId, rating, comment);
      
      if (!newRating) {
        throw new Error("Failed to add rating");
      }

      toast.success('Avis ajouté avec succès!');
      // Convert to AuthRating type
      const authRating: AuthRating = {
        id: newRating.id,
        user_id: newRating.user_id,
        supplier_id: newRating.fournisseur_id || '',
        fournisseur_id: newRating.fournisseur_id || '',
        rating: newRating.rating,
        comment: newRating.comment,
        created_at: newRating.created_at || new Date().toISOString(),
        // Fix the type error by providing a proper profiles object
        profiles: {
          id: user.id,
          name: user.name || '',
          avatar: user.avatar || null
        }
      };
      
      onRatingAdded(authRating);
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error adding rating:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis.');
    }
  };

  // Create StarRating component outside the main component to avoid duplicate identifier error
  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`cursor-pointer ${
            i <= (hoveredStar || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredStar(i)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => handleRatingChange(i)}
        />
      );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  if (!user) {
    return <p className="text-sm text-gray-500">Connectez-vous pour laisser un avis.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-1">Votre note</label>
        {renderStarRating()}
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Commentaire (optionnel)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={handleCommentChange}
          placeholder="Partagez votre expérience..."
          rows={3}
        />
      </div>
      <Button type="submit" disabled={rating === 0}>
        Soumettre
      </Button>
    </form>
  );
};

export default RatingComponent;
