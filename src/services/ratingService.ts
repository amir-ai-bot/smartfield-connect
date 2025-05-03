
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Rating, Supplier } from '@/types/supabase';

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
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', fournisseurId)
      .single();

    if (supplierError) {
      throw supplierError;
    }

    // Create a mock rating since we don't have a ratings table yet
    if (supplier && supplier.rating) {
      const mockRating = {
        id: "mock-rating-1",
        user_id: "system",
        supplier_id: fournisseurId,
        rating: supplier.rating,
        comment: "Évaluation moyenne du fournisseur",
        created_at: supplier.updated_at,
        profiles: {
          id: "system",
          name: "Système",
          avatar: null
        }
      };

      return [mockRating];
    }

    return [];
  } catch (error) {
    console.error('Error getting ratings:', error);
    toast.error('Erreur lors de la récupération des avis');
    return [];
  }
};

// Get ratings for a supplier (alias function for compatibility)
export const getRatingsForSupplier = getRatingsByFournisseurId;

// Get a user's rating for a specific supplier
export const getUserRatingForSupplier = async (userId: string, supplierId: string) => {
  try {
    // Since we don't have a ratings table, we'll just return null for now
    // In a real application, you would query the ratings table
    return null;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return null;
  }
};

// Add a rating for a supplier
export const addRating = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
): Promise<Rating | null> => {
  try {
    // Update the supplier's rating directly since we don't have a ratings table
    const { data, error } = await supabase
      .from('suppliers')
      .update({ rating })
      .eq('id', fournisseurId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create a mock rating response
    const mockRating: Rating = {
      id: crypto.randomUUID(),
      user_id: userId,
      supplier_id: fournisseurId,
      rating,
      comment,
      created_at: new Date().toISOString(),
      profiles: {
        id: userId,
        name: "User", // This would normally come from the profiles table
        avatar: null
      }
    };

    return mockRating;
  } catch (error) {
    console.error('Error adding rating:', error);
    toast.error('Erreur lors de l\'ajout de l\'avis');
    return null;
  }
};

// This function is an alias for addRating to maintain compatibility
export const rateFournisseur = addRating;

// Update supplier's average rating
export const updateSupplierAverageRating = async (fournisseurId: string): Promise<boolean> => {
  try {
    // In a real app with a ratings table we would calculate average
    // For now, just return true to simulate success
    return true;
  } catch (error) {
    console.error('Error updating supplier average rating:', error);
    return false;
  }
};
