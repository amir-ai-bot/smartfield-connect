
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/supabase';

// Get a user's rating for a supplier
export const getUserRatingForFournisseur = async (userId: string, supplierId: string): Promise<Partial<Rating> | null> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('supplier_id', supplierId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found, not an error
        return null;
      }
      console.error('Error fetching user rating:', error);
      return null;
    }

    return data as Rating;
  } catch (error) {
    console.error('Error in getUserRatingForFournisseur:', error);
    return null;
  }
};

// Submit or update a rating
export interface RatingInput {
  user_id: string;
  fournisseur_id: string;
  rating: number;
  comment?: string;
}

export const rateFournisseur = async (ratingData: RatingInput): Promise<Partial<Rating> | null> => {
  try {
    const { user_id, fournisseur_id, rating, comment } = ratingData;
    
    // Check if the user has already rated this supplier
    const existingRating = await getUserRatingForFournisseur(user_id, fournisseur_id);
    
    let result;
    
    if (existingRating) {
      // Update the existing rating
      const { data, error } = await supabase
        .from('supplier_ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .eq('supplier_id', fournisseur_id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating rating:', error);
        return null;
      }
      
      result = data;
    } else {
      // Create a new rating
      const { data, error } = await supabase
        .from('supplier_ratings')
        .insert({
          user_id,
          supplier_id: fournisseur_id,
          rating,
          comment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating rating:', error);
        return null;
      }
      
      result = data;
    }
    
    // Update the average rating for the supplier
    await updateSupplierAverageRating(fournisseur_id);
    
    return result as Rating;
  } catch (error) {
    console.error('Error in rateFournisseur:', error);
    return null;
  }
};

// Get all ratings for a supplier
export const getRatingsByFournisseurId = async (supplierId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select(`
        *,
        profiles (id, display_name, avatar)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRatingsByFournisseurId:', error);
    return [];
  }
};

// Update the average rating for a supplier
const updateSupplierAverageRating = async (supplierId: string): Promise<void> => {
  try {
    // Calculate the average rating
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('rating')
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error calculating average rating:', error);
      return;
    }

    if (!data || data.length === 0) {
      return;
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / data.length;

    // Update the supplier's average rating
    await supabase
      .from('suppliers')
      .update({ rating: average })
      .eq('id', supplierId);
  } catch (error) {
    console.error('Error in updateSupplierAverageRating:', error);
  }
};
