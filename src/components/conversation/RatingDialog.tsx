
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { rateFournisseur } from '@/services/conversationService';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  fournisseurId: string;
  fournisseurName: string;
  onRatingSubmitted?: () => void;
}

const RatingDialog = ({
  open,
  onOpenChange,
  userId,
  fournisseurId,
  fournisseurName,
  onRatingSubmitted
}: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setRating(0);
      setHoverRating(0);
      setComment('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      await rateFournisseur(userId, fournisseurId, rating, comment);
      toast.success('Évaluation soumise avec succès');
      onOpenChange(false);
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer {fournisseurName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-500 mb-2">Sélectionnez une note</div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-sm font-medium">
              {rating > 0 ? `${rating}/5` : 'Pas encore noté'}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire (optionnel)
            </label>
            <Textarea
              id="comment"
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="bg-agri-green-500 hover:bg-agri-green-600"
          >
            {isSubmitting ? 'Envoi...' : 'Soumettre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
