
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { useAuth } from '@/contexts/AuthContext';
import { addRating, getUserRatingForSupplier, getRatingsForSupplier } from '@/services/ratingService';
import { Rating } from '@/types/auth';
import { toast } from 'sonner';

export interface RatingComponentProps {
  supplierId: string;
  onRatingAdded: (newRating: any) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ supplierId, onRatingAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Load user's existing rating if available
  useEffect(() => {
    const loadUserRating = async () => {
      if (user) {
        const existingRating = await getUserRatingForSupplier(user.id, supplierId);
        if (existingRating) {
          setUserRating(existingRating);
          setRating(existingRating.rating);
          setComment(existingRating.comment || '');
        }
      }
    };
    
    loadUserRating();
  }, [user, supplierId]);
  
  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to leave a rating');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newRating = await addRating(user.id, supplierId, rating, comment);
      if (newRating) {
        setUserRating(newRating);
        // Add the profile information from the current user
        const ratingWithProfile = {
          ...newRating,
          profiles: {
            id: user.id,
            name: user.name || user.display_name || 'Anonymous',
            avatar: user.avatar
          }
        };
        onRatingAdded(ratingWithProfile);
        toast.success(userRating ? 'Rating updated successfully' : 'Rating added successfully');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = (count: number, filled: boolean = false) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <StarFilledIcon
          key={i}
          className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      ));
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-medium text-lg mb-2">Write a Review</h3>
      
      {!user ? (
        <p className="text-gray-500 mb-4">Please log in to leave a review.</p>
      ) : (
        <>
          <div 
            className="flex items-center mb-3" 
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <div 
                key={star}
                className="cursor-pointer"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
              >
                <StarFilledIcon
                  className={`w-6 h-6 ${
                    (hoverRating ? hoverRating >= star : rating >= star)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </div>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `You rated ${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
          
          <Textarea
            placeholder="Write your review here (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3"
            rows={3}
          />
          
          <Button 
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : userRating ? 'Update Review' : 'Submit Review'}
          </Button>
        </>
      )}
    </div>
  );
};

export default RatingComponent;
