import { supabase } from '@/integrations/supabase/client';

/**
 * Get all suppliers
 */
export const getSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (name, avatar, email)
      `);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      category: item.category,
      location: item.location,
      phone: item.phone,
      products: item.products || [],
      rating: item.rating || 0,
      email: item.profiles?.email || '',
      avatar: item.profiles?.avatar || '',
      image: item.image || ''
    }));
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return [];
  }
};

// Export the Supplier type so other components can import it
export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating: number;
  avatar?: string;
  email?: string;
  image?: string;
}

/**
 * Get a supplier by ID
 * @param id Supplier ID
 */
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (name, avatar, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Create a supplier object with the correct properties
    const supplier: Supplier = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      category: data.category,
      location: data.location,
      phone: data.phone,
      products: data.products || [],
      rating: data.rating || 0,
      email: data.profiles?.email || '',
      avatar: data.profiles?.avatar || '',
      image: data.image || ''
    };
    
    return supplier;
  } catch (error) {
    console.error('Error getting supplier by ID:', error);
    return null;
  }
};

/**
 * Create a supplier
 * @param supplier Supplier data
 */
export const createSupplier = async (supplier: Omit<Supplier, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

/**
 * Update a supplier
 * @param id Supplier ID
 * @param supplier Supplier data
 */
export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

/**
 * Delete a supplier
 * @param id Supplier ID
 */
export const deleteSupplier = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

/**
 * Create a conversation with a supplier
 * @param userId User ID
 * @param fournisseurId Supplier ID
 */
export const createSupplierConversation = async (userId: string, fournisseurId: string) => {
  try {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('fournisseur_id', fournisseurId)
      .maybeSingle();
    
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating supplier conversation:', error);
    throw error;
  }
};

/**
 * Search suppliers by query
 * @param query Search query
 */
export const searchSuppliers = async (query: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (name, avatar, email)
      `)
      .or(`name.ilike.%${query}%, category.ilike.%${query}%, location.ilike.%${query}%`);
    
    if (error) throw error;
    
    // Map the data to the correct supplier format
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name,
      category: item.category,
      location: item.location,
      phone: item.phone,
      products: item.products || [],
      rating: item.rating || 0,
      email: item.profiles?.email || '',
      avatar: item.profiles?.avatar || '',
      image: item.image || ''
    }));
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
};
