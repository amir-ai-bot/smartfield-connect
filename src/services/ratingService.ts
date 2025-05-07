
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/supabase';

// Function to rate a supplier
export const rateFournisseur = async (userId: string, supplierId: string, rating: number, comment: string = '') => {
  try {
    // Check if user has already rated this supplier
    const { data: existingRating } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();
    
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('supplier_ratings')
        .update({ rating, comment })
        .eq('id', existingRating.id)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('supplier_ratings')
        .insert({
          user_id: userId,
          supplier_id: supplierId,
          rating,
          comment
        })
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error rating supplier:', error);
    throw error;
  }
};

// Get ratings for a supplier
export const getRatingsByFournisseurId = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_supplier_ratings', { p_supplier_id: supplierId });
    
    if (error) throw error;
    
    // Map to the expected Rating format
    const mappedRatings: Rating[] = (data || []).map(rating => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment || '',
      created_at: rating.created_at,
      user: {
        id: rating.user_id,
        display_name: rating.user_name,
        avatar: rating.user_avatar,
      }
    }));
    
    return mappedRatings;
  } catch (error) {
    console.error('Error fetching supplier ratings:', error);
    throw error;
  }
};

// Get user's rating for a specific supplier
export const getUserRatingForFournisseur = async (userId: string, supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    throw error;
  }
};

// Calculate average rating for a supplier
export const getAverageRating = async (supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('rating')
      .eq('supplier_id', supplierId);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }
    
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    return {
      average: sum / data.length,
      count: data.length,
    };
  } catch (error) {
    console.error('Error calculating average rating:', error);
    return { average: 0, count: 0 };
  }
};
