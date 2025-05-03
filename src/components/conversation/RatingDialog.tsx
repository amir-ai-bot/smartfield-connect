
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { rateFournisseur } from '@/services/ratingService';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  fournisseurId: string;
  fournisseurName: string;
  onRatingSubmitted?: () => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onOpenChange,
  userId,
  fournisseurId,
  fournisseurName,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      await rateFournisseur(userId, fournisseurId, rating, comment);
      toast.success('Avis envoyé avec succès!');
      onOpenChange(false);
      if (onRatingSubmitted) onRatingSubmitted();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Évaluer {fournisseurName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-500">Comment évaluez-vous ce fournisseur?</p>
              <span className="text-lg font-semibold">
                {rating > 0 ? `${rating}/5` : 'Choisir une note'}
              </span>
            </div>
            
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={`h-8 w-8 cursor-pointer ${
                    value <= (hoveredRating || rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce fournisseur..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleRatingSubmit} 
              disabled={rating === 0 || isSubmitting}
            >
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
