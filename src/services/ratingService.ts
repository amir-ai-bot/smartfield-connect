import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/auth';

/**
 * Get all ratings for a specific supplier
 */
export const getSupplierRatings = async (supplierId: string): Promise<Rating[]> => {
  try {
    // First, check if we need to create the ratings table by attempting to query it
    const { data, error } = await supabase
      .rpc('get_supplier_ratings', { p_supplier_id: supplierId });
    
    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getSupplierRatings:', error);
    return [];
  }
};

/**
 * Get the average rating for a supplier
 */
export const getSupplierAverageRating = async (supplierId: string): Promise<number> => {
  try {
    const ratings = await getSupplierRatings(supplierId);
    
    if (ratings.length === 0) {
      return 0;
    }
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  } catch (error) {
    console.error('Error in getSupplierAverageRating:', error);
    return 0;
  }
};

/**
 * Get a user's rating for a specific supplier
 */
export const getUserRatingForSupplier = async (userId: string, supplierId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_rating_for_supplier', { 
        p_user_id: userId,
        p_supplier_id: supplierId
      });
    
    if (error) {
      console.error('Error fetching user rating for supplier:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] as Rating : null;
  } catch (error) {
    console.error('Error in getUserRatingForSupplier:', error);
    return null;
  }
};

/**
 * Check if a user has already rated a supplier
 */
export const hasUserRatedSupplier = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_user_rated_supplier', { 
        p_user_id: userId,
        p_supplier_id: supplierId
      });
    
    if (error) {
      console.error('Error checking if user rated supplier:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in hasUserRatedSupplier:', error);
    return false;
  }
};

/**
 * Add or update a rating
 */
export const addRating = async (userId: string, supplierId: string, rating: number, comment?: string): Promise<Rating | boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('add_or_update_rating', { 
        p_user_id: userId,
        p_supplier_id: supplierId,
        p_rating: rating,
        p_comment: comment || ''
      });
    
    if (error) {
      console.error('Error adding/updating rating:', error);
      return false;
    }
    
    // If data is returned and has ratings info, return it
    if (data && typeof data === 'object') {
      return {
        user_id: userId,
        fournisseur_id: supplierId,
        rating: rating,
        comment: comment || '',
        id: data.id || '',
        created_at: data.created_at || new Date().toISOString(),
        user: {
          id: userId
        }
      };
    }
    
    // Otherwise just return success boolean
    return true;
  } catch (error) {
    console.error('Error in addRating:', error);
    return false;
  }
};

/**
 * Delete a rating
 */
export const deleteRating = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('delete_rating', { 
        p_user_id: userId,
        p_supplier_id: supplierId
      });
    
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

/**
 * Get all ratings (for admin)
 */
export const getAllRatings = async (): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase.rpc('get_all_ratings');
    
    if (error) {
      console.error('Error fetching all ratings:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllRatings:', error);
    return [];
  }
};

/**
 * Get ratings for a supplier with user details
 */
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_supplier_ratings_with_users', { p_supplier_id: supplierId });
    
    if (error) {
      console.error('Error fetching ratings with users:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getRatingsForSupplier:', error);
    return [];
  }
};
