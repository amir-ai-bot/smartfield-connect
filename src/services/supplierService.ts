
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/types/auth';

// Get supplier by ID
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
    console.error('Error fetching supplier by ID:', error);
    return null;
  }
};

// Get all ratings for a supplier
export const getRatingsByFournisseurId = async (fournisseurId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        id,
        user_id,
        fournisseur_id,
        rating,
        comment,
        created_at,
        profiles:user_id(id, name, avatar)
      `)
      .eq('fournisseur_id', fournisseurId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }

    return data as unknown as Rating[];
  } catch (error) {
    console.error('Error in getRatingsByFournisseurId:', error);
    return [];
  }
};

// Get all suppliers
export const getAllSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all suppliers:', error);
    return [];
  }
};

// Search suppliers
export const searchSuppliers = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
};

// Toggle favorite supplier
export const toggleFavoriteFournisseur = async (
  userId: string,
  supplierId: string
): Promise<{ isFavorite: boolean }> => {
  try {
    // Check if already a favorite
    const isFav = await isFournisseurFavorite(userId, supplierId);
    
    // Toggle accordingly
    if (isFav) {
      await supabase.rpc('remove_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: supplierId
      });
      return { isFavorite: false };
    } else {
      await supabase.rpc('add_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: supplierId
      });
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite supplier:', error);
    return { isFavorite: false };
  }
};

// Check if supplier is a favorite
export const isFournisseurFavorite = async (
  userId: string,
  supplierId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc(
      'check_favorite_supplier',
      { p_user_id: userId, p_supplier_id: supplierId }
    );
    
    if (error) {
      console.error('Error checking if supplier is favorite:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in isFournisseurFavorite:', error);
    return false;
  }
};

// Get favorite suppliers
export const getFavoriteSuppliers = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_favorite_suppliers',
      { p_user_id: userId }
    );

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching favorite suppliers:', error);
    return [];
  }
};

// For aliasing
export const getSuppliers = getAllSuppliers;
