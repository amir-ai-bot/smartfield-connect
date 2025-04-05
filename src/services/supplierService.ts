
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string;
  email?: string;
  products?: string[];
  image?: string;
  avatar?: string;
}

export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_all_suppliers');

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name || 'Fournisseur',
      category: item.category || 'Divers',
      rating: item.rating || 0,
      location: item.location || 'Non spécifié',
      phone: item.phone || 'Non spécifié',
      email: item.email,
      products: item.products || [],
      avatar: item.avatar,
      image: item.avatar, // For backward compatibility
    }));
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    return [];
  }
};

// Add alias for getSuppliers to maintain backward compatibility with existing code
export const getAllSuppliers = getSuppliers;

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (
          name,
          email,
          avatar
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }

    if (!data) return null;

    // Use optional chaining to avoid errors when properties don't exist
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.profiles?.name || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: data.profiles?.email || 'Non spécifié',
      products: data.products || [],
      avatar: data.profiles?.avatar || '',
      image: data.profiles?.avatar || '', // For backward compatibility
    };
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    return null;
  }
};

export const addSupplier = async (
  userId: string,
  category: string,
  location: string,
  products: string[] = [],
  phone?: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        category,
        location,
        products,
        phone
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in addSupplier:', error);
    return null;
  }
};

export const updateSupplier = async (
  id: string,
  updates: Partial<Omit<Supplier, 'id' | 'user_id' | 'name' | 'email' | 'avatar' | 'image'>>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    return false;
  }
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSupplier:', error);
    return false;
  }
};

export const createSupplierConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // First check if there's already a conversation between these users
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplierId)
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" - that's expected if there's no existing conversation
      console.error('Error checking existing conversations:', fetchError);
      throw fetchError;
    }

    // If there's an existing conversation, return its ID
    if (existingConversation) {
      return existingConversation.id;
    }

    // Otherwise, create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: supplierId
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Error in createSupplierConversation:', error);
    throw error;
  }
};

export const getSupplierByUserId = async (userId: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (
          name,
          email,
          avatar
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No supplier found for this user
        return null;
      }
      console.error('Error fetching supplier by user ID:', error);
      throw error;
    }

    if (!data) return null;

    // Use optional chaining to avoid errors when properties don't exist
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.profiles?.name || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: data.profiles?.email || 'Non spécifié',
      products: data.products || [],
      avatar: data.profiles?.avatar || '',
      image: data.profiles?.avatar || '', // For backward compatibility
    };
  } catch (error) {
    console.error('Error in getSupplierByUserId:', error);
    return null;
  }
};

// Add mock function for initializing default suppliers
export const initializeDefaultSuppliers = async (): Promise<boolean> => {
  try {
    // Check if we have any suppliers
    const { count, error: countError } = await supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking suppliers:', countError);
      return false;
    }
    
    // If we already have suppliers, don't initialize default ones
    if (count && count > 0) {
      return true;
    }
    
    // In a real implementation, this would add some default suppliers
    console.log('No suppliers found, would initialize defaults in a real implementation');
    return true;
  } catch (error) {
    console.error('Error in initializeDefaultSuppliers:', error);
    return false;
  }
};
