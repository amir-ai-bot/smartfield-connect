
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

// Get ratings by fournisseur ID
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    // Transform the data to match our Rating type
    const formattedRatings: Rating[] = (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      fournisseur_id: item.fournisseur_id, 
      rating: item.rating,
      comment: item.comment,
      created_at: item.created_at,
      updated_at: item.updated_at,
      profiles: {
        id: item.profiles?.id || item.user_id,
        name: item.profiles?.display_name || 'Anonymous',
        avatar: item.profiles?.avatar
      }
    }));

    return formattedRatings;
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
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rating found
        return null;
      }
      console.error('Error fetching user rating:', error);
      return null;
    }
    
    return data as unknown as Rating;
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
    // Insert or update rating
    const { data, error } = await supabase
      .from('ratings')
      .upsert(
        {
          user_id: userId,
          fournisseur_id: supplierId,
          rating: rating,
          comment: comment || null,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,fournisseur_id',
          returning: 'representation'
        }
      );
        
    if (error) {
      console.error('Error adding/updating rating:', error);
      throw error;
    }
    
    toast.success('Rating submitted successfully');
    
    // Return the rating data
    return data?.[0] as unknown as Rating;
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
