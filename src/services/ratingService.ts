
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/auth';

// Get ratings for a supplier
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
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
        profiles:user_id (id, display_name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    // Transform data to match Rating type
    const ratings = data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      fournisseur_id: item.fournisseur_id,
      rating: item.rating,
      comment: item.comment || '',
      created_at: item.created_at,
      user: {
        id: item.profiles?.id || item.user_id,
        name: item.profiles?.display_name || 'Utilisateur',
        avatar: item.profiles?.avatar
      }
    }));

    return ratings;
  } catch (error) {
    console.error('Error in getRatingsByFournisseurId:', error);
    return [];
  }
};

// Alias function for backwards compatibility
export const getRatingsForSupplier = getRatingsByFournisseurId;

// Get a specific supplier
export const getSupplierById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
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

// Check if a user has already rated a supplier
export const getUserRatingForSupplier = async (userId: string, fournisseurId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {  // No rows returned
        return null;
      }
      throw error;
    }

    return data as Rating;
  } catch (error) {
    console.error('Error in getUserRatingForSupplier:', error);
    return null;
  }
};

// Add or update a rating
export const addRating = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  try {
    // Check if user has already rated this supplier
    const existingRating = await getUserRatingForSupplier(userId, fournisseurId);

    let result;
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, comment })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          fournisseur_id: fournisseurId,
          rating,
          comment
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Update supplier average rating
    await updateSupplierAverageRating(fournisseurId);

    return result as Rating;
  } catch (error) {
    console.error('Error in addRating:', error);
    return null;
  }
};

// Alias for backwards compatibility
export const rateFournisseur = addRating;

// Check if user has rated a supplier
export const hasUserRatedSupplier = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId);

    if (error) throw error;
    
    return !!count && count > 0;
  } catch (error) {
    console.error('Error in hasUserRatedSupplier:', error);
    return false;
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId);

    if (error) throw error;

    // Update supplier average rating
    await updateSupplierAverageRating(fournisseurId);

    return true;
  } catch (error) {
    console.error('Error in deleteRating:', error);
    return false;
  }
};

// Update supplier average rating
const updateSupplierAverageRating = async (supplierId: string): Promise<boolean> => {
  try {
    // Get all ratings for this supplier
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('fournisseur_id', supplierId);

    if (error) throw error;

    // Calculate average rating
    const average = ratings.length > 0 
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length 
      : 0;

    // Update supplier
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ rating: parseFloat(average.toFixed(1)) })
      .eq('id', supplierId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error updating supplier average rating:', error);
    return false;
  }
};
