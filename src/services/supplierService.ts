
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone?: string;
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
      phone: item.phone,
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

export const getAllSuppliers = getSuppliers; // Export alias for getSuppliers

export const initializeDefaultSuppliers = async (): Promise<boolean> => {
  try {
    // Check if there are any existing suppliers
    const { count, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking suppliers:', countError);
      return false;
    }
    
    // If there are already suppliers, no need to initialize
    if (count && count > 0) {
      return true;
    }
    
    // Create some default suppliers if none exist
    const defaultSuppliers = [
      {
        name: 'AgriEquipment',
        category: 'Matériel agricole',
        rating: 4.5,
        location: 'Tunis, Tunisia',
        phone: '+216 71 123 456',
        user_id: '00000000-0000-0000-0000-000000000001', // Mock user ID
        products: ['Tracteurs', 'Moissonneuses', 'Pulvérisateurs']
      },
      {
        name: 'BioAgri',
        category: 'Agriculture biologique',
        rating: 4.7,
        location: 'Sousse, Tunisia',
        phone: '+216 73 654 321',
        user_id: '00000000-0000-0000-0000-000000000002', // Mock user ID
        products: ['Fertilisants bio', 'Pesticides naturels', 'Semences bio']
      },
      {
        name: 'AgroSolutions',
        category: 'Irrigation',
        rating: 4.3,
        location: 'Sfax, Tunisia',
        phone: '+216 74 987 654',
        user_id: '00000000-0000-0000-0000-000000000003', // Mock user ID
        products: ['Systèmes d\'irrigation', 'Pompes', 'Filtres']
      }
    ];
    
    const { error: insertError } = await supabase
      .from('suppliers')
      .insert(defaultSuppliers);
    
    if (insertError) {
      console.error('Error creating default suppliers:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in initializeDefaultSuppliers:', error);
    return false;
  }
};

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        user_id,
        category,
        rating,
        location,
        phone,
        products,
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
    
    // Handle the case where profiles might be an error or null
    const profileData = data.profiles && typeof data.profiles === 'object' ? data.profiles : null;

    return {
      id: data.id,
      user_id: data.user_id,
      name: profileData?.name ?? 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: profileData?.email ?? 'Non spécifié',
      products: data.products || [],
      avatar: profileData?.avatar ?? '',
      image: profileData?.avatar ?? '', // For backward compatibility
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
    // First, get the user's name to satisfy the name requirement
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('Error getting user data:', userError);
      return null;
    }
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        category,
        location,
        products,
        phone,
        // name is required but we're using profiles for actual names, so use a placeholder
        name: userData.name || 'Supplier'
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
        id,
        user_id,
        category,
        rating,
        location,
        phone,
        products,
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
    
    // Handle the case where profiles might be an error or null
    const profileData = data.profiles && typeof data.profiles === 'object' ? data.profiles : null;

    return {
      id: data.id,
      user_id: data.user_id,
      name: profileData?.name ?? 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: profileData?.email ?? 'Non spécifié',
      products: data.products || [],
      avatar: profileData?.avatar ?? '',
      image: profileData?.avatar ?? '', // For backward compatibility
    };
  } catch (error) {
    console.error('Error in getSupplierByUserId:', error);
    return null;
  }
};
