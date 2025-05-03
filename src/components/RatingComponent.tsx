
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, StarHalf } from 'lucide-react';
import { getRatingsForSupplier, getUserRatingForSupplier, addRating } from '@/services/ratingService';
import { Rating } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

interface RatingComponentProps {
  supplierId: string;
  userRating?: number;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ supplierId, userRating = 0 }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userCurrentRating, setUserCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(userRating || 0);

  useEffect(() => {
    if (open) {
      loadRatings();
    }
  }, [open]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const ratingsData = await getRatingsForSupplier(supplierId);
      setRatings(ratingsData);

      // Calculate average rating
      if (ratingsData.length > 0) {
        const totalRating = ratingsData.reduce((sum, rating) => sum + rating.rating, 0);
        setAverageRating(totalRating / ratingsData.length);
      }

      // Get user's current rating if available
      if (user) {
        const userRating = await getUserRatingForSupplier(user.id, supplierId);
        if (userRating) {
          setUserCurrentRating(userRating.rating);
          setComment(userRating.comment || '');
        } else {
          setUserCurrentRating(0);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (userCurrentRating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setSubmitting(true);
      await addRating(user.id, supplierId, userCurrentRating, comment);
      toast.success('Votre évaluation a été enregistrée');
      await loadRatings();
      setOpen(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStar = (index: number, filled: boolean, half: boolean = false) => {
    return (
      <div
        key={index}
        className="cursor-pointer"
        onClick={() => user && setUserCurrentRating(index + 1)}
        onMouseEnter={() => user && setHoverRating(index + 1)}
        onMouseLeave={() => user && setHoverRating(0)}
      >
        {half ? (
          <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ) : (
          <Star
            className={`h-5 w-5 ${
              filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        )}
      </div>
    );
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(renderStar(i, true));
      } else if (i === fullStars && hasHalfStar) {
        stars.push(renderStar(i, false, true));
      } else {
        stars.push(renderStar(i, false));
      }
    }

    return <div className="flex space-x-1">{stars}</div>;
  };

  const renderUserEditableRating = () => {
    const displayRating = hoverRating || userCurrentRating;
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="cursor-pointer"
            onClick={() => setUserCurrentRating(i + 1)}
            onMouseEnter={() => setHoverRating(i + 1)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              className={`h-5 w-5 ${
                i < displayRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {renderStarRating(averageRating)}
        <span className="text-sm text-gray-500">
          {averageRating.toFixed(1)} ({ratings.length} avis)
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sm">
              Voir les avis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Avis et évaluations</DialogTitle>
            </DialogHeader>
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Votre évaluation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm">Note</p>
                      {renderUserEditableRating()}
                    </div>
                    <div>
                      <p className="mb-2 text-sm">Commentaire</p>
                      <Textarea
                        placeholder="Partagez votre expérience avec ce fournisseur..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleRateClick} disabled={submitting}>
                      {submitting ? 'Envoi...' : 'Envoyer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-4 max-h-[300px] overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">Tous les avis</h3>
              {loading ? (
                <p>Chargement...</p>
              ) : ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {rating.profiles && (
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage
                                src={rating.profiles.avatar || ''}
                                alt={rating.profiles.name}
                              />
                              <AvatarFallback>
                                {(rating.profiles.name || '?').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <p className="font-medium">
                              {rating.profiles ? rating.profiles.name : 'Utilisateur'}
                            </p>
                            <div className="flex items-center">
                              {renderStarRating(rating.rating)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {rating.comment && <p className="mt-2">{rating.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Aucun avis pour ce fournisseur.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RatingComponent;
