
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/auth';

// Get all ratings for a supplier
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        id,
        user_id,
        fournisseur_id,
        rating,
        comment,
        created_at,
        profiles:user_id(id, name, avatar)
      `)
      .eq('fournisseur_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    return data as unknown as Rating[];
  } catch (error) {
    console.error('Error in getRatingsForSupplier:', error);
    return [];
  }
};

// Get a supplier by ID
export const getSupplierById = async (supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();

    if (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    return null;
  }
};

// Add or update a rating
export const addRating = async (
  userId: string,
  supplierId: string,
  rating: number,
  comment: string
): Promise<Rating | boolean> => {
  try {
    // Check if user has already rated this supplier
    const existingRating = await getUserRatingForSupplier(userId, supplierId);

    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, comment })
        .eq('id', existingRating.id)
        .select();

      if (error) {
        console.error('Error updating rating:', error);
        return false;
      }

      return data[0] as Rating;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          fournisseur_id: supplierId,
          rating,
          comment
        })
        .select();

      if (error) {
        console.error('Error adding rating:', error);
        return false;
      }

      return data[0] as Rating;
    }
  } catch (error) {
    console.error('Error in addRating:', error);
    return false;
  }
};

// Get a user's rating for a specific supplier
export const getUserRatingForSupplier = async (
  userId: string,
  supplierId: string
): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplierId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found
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
export const hasUserRatedSupplier = async (
  userId: string,
  supplierId: string
): Promise<boolean> => {
  try {
    const rating = await getUserRatingForSupplier(userId, supplierId);
    return !!rating;
  } catch (error) {
    console.error('Error in hasUserRatedSupplier:', error);
    return false;
  }
};

// Delete a rating
export const deleteRating = async (
  ratingId: string
): Promise<boolean> => {
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

// Rate a supplier (same as addRating but with different name)
export const rateFournisseur = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment: string = ''
): Promise<boolean> => {
  try {
    const result = await addRating(userId, fournisseurId, rating, comment);
    return !!result;
  } catch (error) {
    console.error('Error in rateFournisseur:', error);
    return false;
  }
};

// Get ratings by supplier ID (alias for getRatingsForSupplier)
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
  return getRatingsForSupplier(fournisseurId);
};
