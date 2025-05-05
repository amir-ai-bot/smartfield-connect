
import { supabase } from '@/integrations/supabase/client';
import { Rating, Supplier } from '@/types/supabase';

// Get all suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase.from('suppliers').select('*');

    if (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    return [];
  }
};

// Get supplier by ID
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

    return data;
  } catch (error) {
    console.error('Error in getSupplier:', error);
    return null;
  }
};

// Create new supplier
export const createSupplier = async (supplierData: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();

    if (error) {
      console.error('Error creating supplier:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    return null;
  }
};

// Update supplier
export const updateSupplier = async (id: string, supplierData: Partial<Supplier>): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplierData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating supplier:', error);
      return null;
    }

    return data;
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

// Get favorite suppliers for a user
export const getFavoriteSuppliers = async (userId: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error fetching favorite suppliers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFavoriteSuppliers:', error);
    return [];
  }
};

// Add a supplier to favorites
export const toggleFavoriteFournisseur = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    // First check if it's already a favorite
    const isFavorite = await isFournisseurFavorite(userId, supplierId);
    
    if (isFavorite) {
      // If already favorite, remove it
      const { error } = await supabase
        .rpc('remove_favorite_supplier', { 
          p_user_id: userId, 
          p_supplier_id: supplierId 
        });
      
      if (error) {
        console.error('Error removing favorite supplier:', error);
        return false;
      }
      
      return false; // Return false to indicate it's no longer a favorite
    } else {
      // If not favorite, add it
      const { error } = await supabase
        .rpc('add_favorite_supplier', { 
          p_user_id: userId, 
          p_supplier_id: supplierId 
        });
      
      if (error) {
        console.error('Error adding favorite supplier:', error);
        return false;
      }
      
      return true; // Return true to indicate it's now a favorite
    }
  } catch (error) {
    console.error('Error in toggleFavoriteFournisseur:', error);
    return false;
  }
};

// Check if a supplier is a favorite for a user
export const isFournisseurFavorite = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', {
        p_user_id: userId,
        p_supplier_id: supplierId
      });
    
    if (error) {
      console.error('Error checking if supplier is favorite:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in isFournisseurFavorite:', error);
    return false;
  }
};

// Get supplier ratings
export const getSupplierRatings = async (supplierId: string): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('supplier_id', supplierId);

    if (error) {
      console.error('Error fetching supplier ratings:', error);
      return [];
    }

    return data as unknown as Rating[];
  } catch (error) {
    console.error('Error in getSupplierRatings:', error);
    return [];
  }
};

// Add aliases for backward compatibility
export const getFournisseurs = getSuppliers;
export const getFournisseur = getSupplier;
export const createFournisseur = createSupplier;
export const updateFournisseur = updateSupplier;
export const deleteFournisseur = deleteSupplier;
export const getFournisseurRatings = getSupplierRatings;
