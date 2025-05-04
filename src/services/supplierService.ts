
import { supabase } from '@/integrations/supabase/client';
import { Supplier } from '@/types/supabase';

// Get all suppliers
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }

    return data as Supplier[];
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    return [];
  }
};

// Alias for getAllSuppliers
export const getSuppliers = getAllSuppliers;

// Search suppliers by name, category, or location
export const searchSuppliers = async (searchTerm: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);

    if (error) {
      console.error('Error searching suppliers:', error);
      return [];
    }

    return data as Supplier[];
  } catch (error) {
    console.error('Error in searchSuppliers:', error);
    return [];
  }
};

// Get supplier by ID - now with two function names for compatibility
export const getSupplier = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }

    return data as Supplier;
  } catch (error) {
    console.error('Error in getSupplier:', error);
    return null;
  }
};

// Alias for getSupplier
export const getSupplierById = getSupplier;

// Update supplier
export const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      return null;
    }

    return data as Supplier;
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    return null;
  }
};

// Delete supplier
export const deleteSupplier = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSupplier:', error);
    return false;
  }
};

// Get favorite suppliers
export const getFavoriteSuppliers = async (userId: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { user_id: userId });

    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      return [];
    }

    return data as Supplier[];
  } catch (error) {
    console.error('Error in getFavoriteSuppliers:', error);
    return [];
  }
};

// This is already defined above

// Toggle favorite supplier
export const toggleFavoriteFournisseur = async (userId: string, fournisseurId: string): Promise<{isFavorite: boolean}> => {
  try {
    const isFavorite = await isFournisseurFavorite(userId, fournisseurId);

    if (isFavorite) {
      const { error } = await supabase
        .rpc('remove_favorite_supplier', {
          user_id: userId,
          supplier_id: fournisseurId
        });

      if (error) {
        console.error('Error removing favorite supplier:', error);
        throw error;
      }
      return { isFavorite: false };
    } else {
      const { error } = await supabase
        .rpc('add_favorite_supplier', {
          user_id: userId,
          supplier_id: fournisseurId
        });

      if (error) {
        console.error('Error adding favorite supplier:', error);
        throw error;
      }
      return { isFavorite: true };
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

// Check if supplier is in favorites
export const isFournisseurFavorite = async (userId: string, fournisseurId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', {
        user_id: userId,
        supplier_id: fournisseurId
      });

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking if supplier is favorite:', error);
    return false;
  }
};

// Get ratings for a supplier
export const getRatingsByFournisseurId = async (supplierId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles (id, name, avatar)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching supplier ratings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRatingsByFournisseurId:', error);
    return [];
  }
};

// This function is already defined above
