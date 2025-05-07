
import React, { useState, useEffect } from 'react';
import { StarIcon } from 'lucide-react';
import { Rating } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRatingForFournisseur, rateFournisseur } from '@/services/ratingService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RatingComponentProps {
  supplierId: string;
  onRatingSubmitted?: () => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ supplierId, onRatingSubmitted }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch user's existing rating for this supplier
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const rating = await getUserRatingForFournisseur(user.id, supplierId);
        
        if (rating) {
          setUserRating(rating);
          setRating(rating.rating);
          setComment(rating.comment || '');
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };
    
    fetchUserRating();
  }, [isAuthenticated, user, supplierId]);

  const handleRatingSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Veuillez vous connecter pour évaluer ce fournisseur');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      await rateFournisseur(user.id, supplierId, rating, comment);
      
      toast.success('Évaluation soumise avec succès');
      setIsEditing(false);
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erreur lors de la soumission de l\'évaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">Connectez-vous pour évaluer ce fournisseur</p>
      </div>
    );
  }

  if (userRating && !isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-2">Votre évaluation</h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              size={20}
              className={i < userRating.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
        {userRating.comment && <p className="text-gray-600 mb-3">{userRating.comment}</p>}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(true)}
        >
          Modifier
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-3">Évaluez ce fournisseur</h3>
      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, i) => {
          const ratingValue = i + 1;
          return (
            <StarIcon
              key={i}
              size={24}
              className={`cursor-pointer mr-1 ${
                (hover !== null ? hover >= ratingValue : rating >= ratingValue)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </div>
      <Textarea
        className="mb-3"
        placeholder="Partagez votre expérience avec ce fournisseur (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        {userRating && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setRating(userRating.rating);
              setComment(userRating.comment || '');
              setIsEditing(false);
            }}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
        )}
        <Button 
          size="sm"
          onClick={handleRatingSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Envoi...' : userRating ? 'Mettre à jour' : 'Soumettre'}
        </Button>
      </div>
    </div>
  );
};

export default RatingComponent;
