
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rating } from '@/types/auth';

// Get a supplier by ID
export const getSupplierById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    toast.error('Error fetching supplier details');
    return null;
  }
};

// Get ratings by fournisseur ID
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id(id, display_name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId);

    if (error) throw error;

    // Format ratings to include user profiles
    const ratingsWithProfiles = data.map((rating: any) => ({
      ...rating,
      profiles: {
        id: rating.profiles?.id || rating.user_id,
        name: rating.profiles?.display_name || 'Anonymous',
        avatar: rating.profiles?.avatar || null
      }
    }));

    return ratingsWithProfiles as Rating[];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    toast.error('Error fetching ratings');
    return [];
  }
};

// Get supplier ratings for the current user
export const getUserRatingForSupplier = async (userId: string, supplierId: string): Promise<Rating | null> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplierId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
};

// Add rating for a supplier
export const addRating = async (
  userId: string,
  supplierId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  try {
    // Check if user has already rated this supplier
    const existingRating = await getUserRatingForSupplier(userId, supplierId);
    
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', existingRating.id)
        .select(`
          *,
          profiles:user_id(id, display_name, avatar)
        `)
        .single();
        
      if (error) throw error;
      
      // Update supplier average rating
      await updateSupplierAverageRating(supplierId);
      
      toast.success('Rating updated successfully');
      return data;
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
        .select(`
          *,
          profiles:user_id(id, display_name, avatar)
        `)
        .single();
        
      if (error) throw error;
      
      // Update supplier average rating
      await updateSupplierAverageRating(supplierId);
      
      toast.success('Rating added successfully');
      return data;
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    toast.error('Error adding rating');
    return null;
  }
};

// Function to update the average rating for a supplier
const updateSupplierAverageRating = async (supplierId: string): Promise<void> => {
  try {
    // Get all ratings for the supplier
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('fournisseur_id', supplierId);
      
    if (error) throw error;
    
    if (data?.length > 0) {
      // Calculate average rating
      const totalRating = data.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = totalRating / data.length;
      
      // Update supplier with new average rating
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ rating: averageRating })
        .eq('id', supplierId);
        
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error('Error updating supplier rating:', error);
  }
};

// Get ratings for suppliers
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  return getRatingsByFournisseurId(supplierId);
};
