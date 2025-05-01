
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Supplier } from '@/types/supabase';

// Get a supplier by ID
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting supplier by ID:', error);
    toast.error('Erreur lors de la récupération des données du fournisseur');
    return null;
  }
};

// Get ratings for a supplier
export const getRatingsByFournisseurId = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id (id, name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting ratings:', error);
    toast.error('Erreur lors de la récupération des avis');
    return [];
  }
};

// Add a rating for a supplier
export const addRating = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error adding rating:', error);
    toast.error('Erreur lors de l\'ajout de l\'avis');
    return null;
  }
};

// Update supplier's average rating
export const updateSupplierAverageRating = async (fournisseurId: string) => {
  try {
    // Get all ratings for the supplier
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('fournisseur_id', fournisseurId);

    if (ratingsError) {
      throw ratingsError;
    }

    // Calculate average rating
    const average = ratings.length
      ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length
      : 0;

    // Update supplier's rating
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ rating: parseFloat(average.toFixed(1)) })
      .eq('id', fournisseurId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error updating supplier average rating:', error);
    return false;
  }
};
