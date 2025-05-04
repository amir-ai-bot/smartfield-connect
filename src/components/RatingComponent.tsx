
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { addRating, getUserRatingForSupplier, getRatingsForSupplier } from '@/services/ratingService';
import { Rating } from '@/types/supabase';
import { toast } from 'sonner';

interface RatingComponentProps {
  supplierId: string;
  onRatingAdded?: () => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ supplierId, onRatingAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserRating();
    }
  }, [user, supplierId]);

  const loadUserRating = async () => {
    if (!user) return;
    
    try {
      const ratingData = await getUserRatingForSupplier(user.id, supplierId);
      if (ratingData) {
        setRating(ratingData.rating);
        setComment(ratingData.comment || '');
        setUserRating(ratingData);
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await addRating(user.id, supplierId, rating, comment);
      
      if (result) {
        toast.success(userRating ? 'Avis mis à jour avec succès' : 'Avis ajouté avec succès');
        // Update the userRating state with type safety
        setUserRating(prevRating => ({
          ...result,
          id: result.id || (prevRating?.id || ''),
        }));
        
        if (onRatingAdded) {
          onRatingAdded();
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Votre avis</h3>
      
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 cursor-pointer ${
              (hoverRating || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} étoile${rating > 1 ? 's' : ''}` : 'Aucune note'}
        </span>
      </div>
      
      <div>
        <Textarea
          placeholder="Partagez votre expérience (facultatif)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Envoi en cours...' : userRating ? 'Mettre à jour' : 'Soumettre'}
      </Button>
    </div>
  );
};

export default RatingComponent;
