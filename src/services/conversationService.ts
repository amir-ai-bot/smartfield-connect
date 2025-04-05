
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to create a conversation with a supplier
export const createConversation = async (userId: string, supplierId: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: supplierId,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Function to toggle a supplier as favorite
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string) => {
  try {
    // Check if the supplier is already a favorite
    const { data, error } = await supabase
      .from('user_fournisseur_favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking favorite status:', error);
      toast.error("Erreur lors de la vérification du statut favori");
      throw error;
    }
    
    // If it is a favorite, remove it
    if (data) {
      const { error: deleteError } = await supabase
        .from('user_fournisseur_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('fournisseur_id', fournisseurId);
      
      if (deleteError) {
        console.error('Error removing from favorites:', deleteError);
        toast.error("Erreur lors du retrait des favoris");
        throw deleteError;
      }
      
      return { isFavorite: false };
    } else {
      // If not a favorite, add it
      const { error: insertError } = await supabase
        .from('user_fournisseur_favorites')
        .insert({
          user_id: userId,
          fournisseur_id: fournisseurId,
        });
      
      if (insertError) {
        console.error('Error adding to favorites:', insertError);
        toast.error("Erreur lors de l'ajout aux favoris");
        throw insertError;
      }
      
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

// Function to check if a supplier is a favorite
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_fournisseur_favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId);
    
    if (error) {
      console.error('Error checking favorite status:', error);
      toast.error("Erreur lors de la vérification du statut favori");
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Function to get all favorite suppliers for a user
export const getFavoriteFournisseurs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });
    
    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      toast.error("Erreur lors de la récupération des fournisseurs favoris");
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite suppliers:', error);
    throw error;
  }
};

// Function to rate a supplier
export const rateFournisseur = async (
  userId: string, 
  fournisseurId: string, 
  rating: number, 
  comment?: string
) => {
  try {
    // Check if user has already rated this supplier
    const { data: existingRating, error: checkError } = await supabase
      .from('fournisseur_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing rating:', checkError);
      toast.error("Erreur lors de la vérification de l'évaluation existante");
      throw checkError;
    }
    
    let result;
    
    if (existingRating) {
      // Update existing rating
      const { data, error } = await supabase
        .from('fournisseur_ratings')
        .update({ 
          rating, 
          comment: comment || existingRating.comment,
          created_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating rating:', error);
        toast.error("Erreur lors de la mise à jour de l'évaluation");
        throw error;
      }
      
      result = data;
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('fournisseur_ratings')
        .insert({
          user_id: userId,
          fournisseur_id: fournisseurId,
          rating,
          comment
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding rating:', error);
        toast.error("Erreur lors de l'ajout de l'évaluation");
        throw error;
      }
      
      result = data;
    }
    
    // Update average rating in suppliers table
    await updateAverageRating(fournisseurId);
    
    return result;
  } catch (error) {
    console.error('Error rating supplier:', error);
    throw error;
  }
};

// Helper function to update the average rating of a supplier
export const updateAverageRating = async (fournisseurId: string) => {
  try {
    // Get all ratings for this supplier
    const { data: ratings, error } = await supabase
      .from('fournisseur_ratings')
      .select('rating')
      .eq('fournisseur_id', fournisseurId);
    
    if (error) {
      console.error('Error fetching ratings:', error);
      throw error;
    }
    
    if (!ratings || ratings.length === 0) return;
    
    // Calculate average
    const average = ratings.reduce((sum, curr) => sum + curr.rating, 0) / ratings.length;
    
    // Update supplier record
    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ rating: parseFloat(average.toFixed(1)) })
      .eq('user_id', fournisseurId);
    
    if (updateError) {
      console.error('Error updating supplier rating:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating average rating:', error);
    toast.error("Erreur lors de la mise à jour de l'évaluation moyenne");
  }
};

// Function to get all ratings for a supplier
export const getFournisseurRatings = async (fournisseurId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_fournisseur_ratings', { fournisseur_id: fournisseurId });
    
    if (error) {
      console.error('Error fetching ratings:', error);
      throw error;
    }
    
    return data ? data.map((rating: any) => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment,
      created_at: rating.created_at,
      user: {
        id: rating.profiles?.id || '',
        name: rating.profiles?.name || 'Utilisateur',
        avatar: rating.profiles?.avatar || ''
      }
    })) : [];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    toast.error("Erreur lors de la récupération des évaluations");
    return [];
  }
};

// Function to delete a rating
export const deleteRating = async (ratingId: string) => {
  try {
    const { error } = await supabase
      .from('fournisseur_ratings')
      .delete()
      .eq('id', ratingId);
    
    if (error) {
      console.error('Error deleting rating:', error);
      toast.error("Erreur lors de la suppression de l'évaluation");
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw error;
  }
};
