
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/supabase';

// Get ratings for a specific supplier
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id (id, display_name, avatar)
      `)
      .eq('fournisseur_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supplier ratings:', error);
      return [];
    }

    return data as unknown as Rating[];
  } catch (error) {
    console.error('Error in getRatingsForSupplier:', error);
    return [];
  }
};

// Get a user's rating for a specific supplier
export const getUserRatingForSupplier = async (userId: string, supplierId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplierId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No ratings found is not an error
        return null;
      }
      console.error('Error fetching user rating:', error);
      return null;
    }

    return data as Rating;
  } catch (error) {
    console.error('Error in getUserRatingForSupplier:', error);
    return null;
  }
};

// Check if a user has rated a supplier
export const hasUserRatedSupplier = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const rating = await getUserRatingForSupplier(userId, supplierId);
    return !!rating;
  } catch (error) {
    console.error('Error checking if user rated supplier:', error);
    return false;
  }
};

// Add or update a rating
export const addRating = async (
  userId: string,
  supplierId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  try {
    // Check if rating already exists
    const existingRating = await getUserRatingForSupplier(userId, supplierId);

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({
          rating,
          comment,
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return null;
      }

      return data as Rating;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          fournisseur_id: supplierId,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return null;
      }

      return data as Rating;
    }
  } catch (error) {
    console.error('Error in addRating:', error);
    return null;
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId);

    if (error) {
      console.error('Error deleting rating:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteRating:', error);
    return false;
  }
};
