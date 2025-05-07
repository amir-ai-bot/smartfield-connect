import { supabase } from '@/integrations/supabase/client';

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
    // Create a function call to get suppliers with user profiles
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (
          display_name,
          email,
          avatar
        )
      `);

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      name: item.name || item.profiles?.display_name || 'Fournisseur',
      category: item.category || 'Divers',
      rating: item.rating || 0,
      location: item.location || 'Non spécifié',
      phone: item.phone,
      email: item.profiles?.email,
      products: item.products || [],
      avatar: item.profiles?.avatar || item.avatar,
      image: item.profiles?.avatar || item.avatar || item.image, // For backward compatibility
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
    
    for (const supplier of defaultSuppliers) {
      const { error: insertError } = await supabase
        .from('suppliers')
        .insert(supplier);
      
      if (insertError) {
        console.error('Error creating default supplier:', insertError);
        return false;
      }
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
        *,
        profiles:user_id (
          display_name,
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
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name || data.profiles?.display_name || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: data.profiles?.email || 'Non spécifié',
      products: data.products || [],
      avatar: data.profiles?.avatar || data.avatar,
      image: data.profiles?.avatar || data.avatar || data.image, // For backward compatibility
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
    // First, check if the user already has a supplier profile
    const existingSupplier = await getSupplierByUserId(userId);
    if (existingSupplier) {
      console.log('User already has a supplier profile:', existingSupplier.id);
      return existingSupplier.id;
    }
    
    // Get the user's name to satisfy the name requirement
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error getting user data:', userError);
      return null;
    }
    
    if (!userData) {
      console.error('No user data found for ID:', userId);
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
        name: userData.display_name || 'Supplier'
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
    // Get supplier user_id
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .single();

    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      throw supplierError;
    }

    const fournisseurId = supplier.user_id;

    // First check if there's already a conversation between these users
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${fournisseurId}),and(participant1_id.eq.${fournisseurId},participant2_id.eq.${userId})`)
      .maybeSingle();

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
        participant1_id: userId,
        participant2_id: fournisseurId
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
          display_name,
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
    
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name || data.profiles?.display_name || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: data.profiles?.email || 'Non spécifié',
      products: data.products || [],
      avatar: data.profiles?.avatar || data.avatar,
      image: data.profiles?.avatar || data.avatar || data.image, // For backward compatibility
    };
  } catch (error) {
    console.error('Error in getSupplierByUserId:', error);
    return null;
  }
};

// Add/check/remove favorite supplier functions
export const addFavoriteSupplier = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('add_favorite_supplier', { 
        p_user_id: userId, 
        p_supplier_id: supplierId 
      });

    if (error) {
      console.error('Error adding favorite supplier:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in addFavoriteSupplier:', error);
    return false;
  }
};

export const removeFavoriteSupplier = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('remove_favorite_supplier', { 
        p_user_id: userId, 
        p_supplier_id: supplierId 
      });

    if (error) {
      console.error('Error removing favorite supplier:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in removeFavoriteSupplier:', error);
    return false;
  }
};

export const checkFavoriteSupplier = async (userId: string, supplierId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_favorite_supplier', { 
        p_user_id: userId, 
        p_supplier_id: supplierId 
      });

    if (error) {
      console.error('Error checking favorite supplier:', error);
      throw error;
    }

    return data || false;
  } catch (error) {
    console.error('Error in checkFavoriteSupplier:', error);
    return false;
  }
};

export const getFavoriteSuppliers = async (userId: string): Promise<Supplier[]> => {
  try {
    const { data, error } = await supabase
      .rpc('get_favorite_suppliers', { p_user_id: userId });

    if (error) {
      console.error('Error getting favorite suppliers:', error);
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
      image: item.image || item.avatar, // For backward compatibility
    }));
  } catch (error) {
    console.error('Error in getFavoriteSuppliers:', error);
    return [];
  }
};
