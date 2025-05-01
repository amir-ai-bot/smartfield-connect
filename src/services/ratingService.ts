
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Supplier, Rating } from '@/types/supabase';

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

// Get ratings for a supplier - Since we don't have an actual ratings table,
// we'll simulate ratings based on supplier data
export const getRatingsByFournisseurId = async (fournisseurId: string) => {
  try {
    // Get the supplier to check if they have any rating
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', fournisseurId)
      .single();

    if (error) {
      throw error;
    }

    // Create a mock rating based on the supplier's overall rating
    if (supplier && supplier.rating) {
      // Generate a single mock rating for demonstration
      const mockRating: Rating = {
        id: "mock-rating-1",
        user_id: "system",
        fournisseur_id: fournisseurId,
        rating: supplier.rating,
        comment: "Évaluation moyenne du fournisseur",
        created_at: supplier.updated_at,
        user: {
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

// Add a rating for a supplier
export const addRating = async (
  userId: string,
  fournisseurId: string,
  rating: number,
  comment?: string
) => {
  try {
    // Since we don't have a ratings table, we'll just update the supplier's rating
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
    const mockRating = {
      id: crypto.randomUUID(),
      user_id: userId,
      fournisseur_id: fournisseurId,
      rating,
      comment,
      created_at: new Date().toISOString()
    };

    return mockRating;
  } catch (error) {
    console.error('Error adding rating:', error);
    toast.error('Erreur lors de l\'ajout de l\'avis');
    return null;
  }
};

// Update supplier's average rating
export const updateSupplierAverageRating = async (fournisseurId: string) => {
  try {
    // In a real app with a ratings table we would calculate average
    // For now, just return true to simulate success
    return true;
  } catch (error) {
    console.error('Error updating supplier average rating:', error);
    return false;
  }
};
