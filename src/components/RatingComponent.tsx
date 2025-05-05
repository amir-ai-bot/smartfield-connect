
import { useState, useEffect } from 'react';
import { Rating } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRatingForFournisseur, rateFournisseur } from '@/services/ratingService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingComponentProps {
  supplierId: string;
  onRatingAdded?: () => void;
}

const RatingComponent = ({ supplierId, onRatingAdded }: RatingComponentProps) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<Partial<Rating>>({});
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [starValue, setStarValue] = useState(0);

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user || !supplierId) return;

      try {
        const rating = await getUserRatingForFournisseur(user.id, supplierId);
        if (rating) {
          setUserRating(rating);
          setStarValue(rating.rating || 0);
          setComment(rating.comment || '');
        }
      } catch (error) {
        console.error('Error fetching user rating:', error);
      }
    };

    fetchUserRating();
  }, [user, supplierId]);

  const handleRatingSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour laisser une évaluation.');
      return;
    }

    if (starValue === 0) {
      toast.error('Veuillez sélectionner une note.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedRating = await rateFournisseur({
        user_id: user.id,
        fournisseur_id: supplierId,
        rating: starValue,
        comment: comment.trim() || undefined,
      });

      setUserRating(updatedRating || {});
      toast.success('Votre évaluation a été enregistrée.');
      
      // Call the callback if provided
      if (onRatingAdded) {
        onRatingAdded();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement de votre évaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Votre évaluation</h3>
      
      {!user ? (
        <p className="text-sm text-gray-500">Connectez-vous pour laisser une évaluation.</p>
      ) : (
        <>
          <div className="flex items-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarValue(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      (hoveredStar !== null ? hoveredStar >= star : starValue >= star)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {starValue > 0 ? `${starValue} sur 5` : 'Cliquez pour noter'}
            </span>
          </div>

          <Textarea
            placeholder="Ajouter un commentaire (optionnel)"
            className="mb-3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button 
            onClick={handleRatingSubmit} 
            disabled={isSubmitting || starValue === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Soumettre l\'évaluation'
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default RatingComponent;
