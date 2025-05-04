
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/auth';

// Get user rating for a supplier
export const getUserRatingForSupplier = async (userId: string, supplierId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();

    if (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }

    return data as Rating;
  } catch (error) {
    console.error('Error in getUserRatingForSupplier:', error);
    return null;
  }
};

// Get ratings for a supplier
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*, profiles:user_id(id, name, avatar)')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supplier ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRatingsForSupplier:', error);
    return [];
  }
};

// Add or update a rating
export const addRating = async (userId: string, supplierId: string, rating: number, comment?: string): Promise<Rating | null> => {
  try {
    // First check if user already rated this supplier
    const existingRating = await getUserRatingForSupplier(userId, supplierId);
    
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', existingRating.id)
        .select('*')
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
          supplier_id: supplierId,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
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

// Add or update a rating (alternative function name)
export const rateFournisseur = addRating;
