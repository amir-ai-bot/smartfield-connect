
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
 * Add a new rating
 */
export const addRating = async (ratingData: Rating): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('add_or_update_rating', { 
        p_user_id: ratingData.user_id,
        p_supplier_id: ratingData.fournisseur_id,
        p_rating: ratingData.rating,
        p_comment: ratingData.comment || ''
      });
    
    if (error) {
      console.error('Error adding rating:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addRating:', error);
    return false;
  }
};

/**
 * Update an existing rating
 */
export const updateRating = async (ratingData: Rating): Promise<boolean> => {
  try {
    const { error } = await supabase
      .rpc('add_or_update_rating', { 
        p_user_id: ratingData.user_id,
        p_supplier_id: ratingData.fournisseur_id,
        p_rating: ratingData.rating,
        p_comment: ratingData.comment || ''
      });
    
    if (error) {
      console.error('Error updating rating:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateRating:', error);
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
