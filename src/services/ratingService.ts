
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/supabase';

// Create a new rating
export const createRating = async (
  userId: string, 
  supplierId: string, 
  rating: number, 
  comment?: string
): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .insert({
        user_id: userId,
        supplier_id: supplierId,
        rating,
        comment
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rating:', error);
      return null;
    }

    // After rating, update average rating on the supplier
    await updateSupplierAverageRating(supplierId);

    return data as Rating;
  } catch (error) {
    console.error('Error in createRating:', error);
    return null;
  }
};

// Get ratings for a supplier
export const getRatings = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    // Map the response to match our Rating type
    const mappedRatings = data.map(rating => ({
      ...rating,
      user: rating.user ? {
        id: rating.user.id,
        name: rating.user.display_name || '',
        avatar: rating.user.avatar
      } : undefined
    })) as Rating[];

    return mappedRatings;
  } catch (error) {
    console.error('Error in getRatings:', error);
    return [];
  }
};

// Get user rating for a specific supplier
export const getUserRatingForFournisseur = async (
  userId: string,
  supplierId: string
): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 means not found, which is expected
        console.error('Error fetching user rating:', error);
      }
      return null;
    }

    return data as Rating;
  } catch (error) {
    console.error('Error in getUserRatingForFournisseur:', error);
    return null;
  }
};

// Update supplier average rating
const updateSupplierAverageRating = async (supplierId: string): Promise<void> => {
  try {
    // Get all ratings for this supplier
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('rating')
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error fetching ratings for average calculation:', error);
      return;
    }

    // Calculate average rating
    if (data && data.length > 0) {
      const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = totalRating / data.length;

      // Update supplier with new average rating
      await supabase
        .from('suppliers')
        .update({ rating: averageRating })
        .eq('id', supplierId);
    }
  } catch (error) {
    console.error('Error updating supplier average rating:', error);
  }
};

// Function to accept object parameter for backward compatibility
export const rateFournisseur = async (params: {
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
}): Promise<Rating | null> => {
  return createRating(params.user_id, params.fournisseur_id, params.rating, params.comment);
};

// Alias for backward compatibility
export const getFournisseurRatings = getRatings;
