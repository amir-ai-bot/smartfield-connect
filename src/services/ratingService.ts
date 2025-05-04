
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rating } from '@/types/auth';

// Get a supplier by ID
export const getSupplierById = async (id: string) => {
  try {
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (supplierError) throw supplierError;
    
    // Get supplier's user profile info if available
    if (supplier.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, avatar, display_name')
        .eq('id', supplier.user_id)
        .single();
        
      if (!profileError && profile) {
        return {
          ...supplier,
          email: profile.email,
          avatar: profile.avatar,
          name: profile.display_name || 'Unnamed Supplier'
        };
      }
    }
    
    return supplier;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    toast.error('Error fetching supplier details');
    return null;
  }
};

// Get ratings by fournisseur ID using raw SQL since the table might not be in the types yet
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
  try {
    // Use raw SQL query instead of relying on the generated types
    const { data, error } = await supabase
      .rpc('get_supplier_ratings', { supplier_id: fournisseurId });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    return (data || []) as Rating[];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    toast.error('Error fetching ratings');
    return [];
  }
};

// Get supplier ratings for the current user using raw SQL
export const getUserRatingForSupplier = async (userId: string, supplierId: string): Promise<Rating | null> => {
  try {
    // Use raw SQL query instead of relying on the generated types
    const { data, error } = await supabase
      .rpc('get_user_rating_for_supplier', { 
        p_user_id: userId,
        p_supplier_id: supplierId
      });

    if (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
    
    return data ? (data as Rating) : null;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return null;
  }
};

// Add rating for a supplier using raw SQL
export const addRating = async (
  userId: string,
  supplierId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  try {
    // Use raw SQL function to handle both insert and update
    const { data, error } = await supabase
      .rpc('add_or_update_rating', { 
        p_user_id: userId,
        p_supplier_id: supplierId,
        p_rating: rating,
        p_comment: comment || ''
      });
        
    if (error) {
      console.error('Error adding/updating rating:', error);
      throw error;
    }
    
    toast.success('Rating submitted successfully');
    
    // Return the rating data
    const newRatingData = {
      id: data.id || '',
      user_id: userId,
      fournisseur_id: supplierId,
      rating: rating,
      comment: comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newRatingData as Rating;
  } catch (error) {
    console.error('Error adding rating:', error);
    toast.error('Error adding rating');
    return null;
  }
};

// Function to get all ratings for supplier - alias
export const getRatingsForSupplier = async (supplierId: string): Promise<Rating[]> => {
  return getRatingsByFournisseurId(supplierId);
};

// Rate a fournisseur - alias for the RatingDialog component
export const rateFournisseur = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  return addRating(userId, fournisseurId, rating, comment);
};
