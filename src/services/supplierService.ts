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
    console.log('Fetching suppliers...');
    
    // Fetch all suppliers directly without profile join first
    let { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    console.log('Raw suppliers data:', data);

    if (!data || data.length === 0) {
      console.log('No suppliers found');
      return [];
    }

    // Now fetch profiles for suppliers that have user_ids
    const userIds = data
      .map(supplier => supplier.user_id)
      .filter(id => id != null);

    let profilesMap = new Map();
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, avatar, name')
        .in('id', userIds);

      if (profiles) {
        profilesMap = new Map(profiles.map(profile => [profile.id, profile]));
      }
    }

    // Map and validate each supplier
    const suppliers = data.map((item: any) => {
      const profile = item.user_id ? profilesMap.get(item.user_id) : null;
      
      const supplier: Supplier = {
        id: item.id || '',
        user_id: item.user_id || '',
        name: (profile?.name || item.name || 'Fournisseur').trim(),
        category: (item.category || 'Divers').trim(),
        rating: typeof item.rating === 'number' ? item.rating : 0,
        location: (item.location || 'Non spécifié').trim(),
        phone: (item.phone || '').trim(),
        email: (profile?.email || item.email || '').trim(),
        products: Array.isArray(item.products) ? item.products.filter(Boolean) : [],
        avatar: (profile?.avatar || '').trim(),
        image: (profile?.avatar || '').trim()
      };
      console.log('Processed supplier:', supplier);
      return supplier;
    });

    console.log('Total suppliers found:', suppliers.length);
    return suppliers;

  } catch (error) {
    console.error('Error in getSuppliers:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return [];
  }
};

export const getAllSuppliers = getSuppliers; // Export alias for getSuppliers

export const initializeDefaultSuppliers = async (): Promise<boolean> => {
  try {
    console.log('Checking for existing suppliers...');
    // Check if there are any existing suppliers
    const { count, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking suppliers:', countError);
      return false;
    }
    
    console.log('Current supplier count:', count);
    
    // If there are already suppliers, no need to initialize
    if (count && count > 0) {
      console.log('Suppliers already exist, skipping initialization');
      return true;
    }
    
    console.log('No suppliers found, creating defaults...');
    
    // Create some default suppliers if none exist
    const defaultSuppliers = [
      {
        name: 'AgriEquipment',
        user_id: null,  // This will be updated when a user claims this supplier
        category: 'Matériel agricole',
        rating: 4.5,
        location: 'Tunis, Tunisia',
        phone: '+216 71 123 456',
        products: ['Tracteurs', 'Moissonneuses', 'Pulvérisateurs'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: 'contact@agriequipment.com'  // Default email
      },
      {
        name: 'BioAgri',
        user_id: null,
        category: 'Agriculture biologique',
        rating: 4.7,
        location: 'Sousse, Tunisia',
        phone: '+216 73 654 321',
        products: ['Fertilisants bio', 'Pesticides naturels', 'Semences bio'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: 'contact@bioagri.com'
      },
      {
        name: 'AgroSolutions',
        user_id: null,
        category: 'Irrigation',
        rating: 4.3,
        location: 'Sfax, Tunisia',
        phone: '+216 74 987 654',
        products: ['Systèmes d\'irrigation', 'Pompes', 'Filtres'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: 'contact@agrosolutions.com'
      }
    ];
    
    // Insert with returning data to verify the insertion
    const { data: insertedData, error: insertError } = await supabase
      .from('suppliers')
      .insert(defaultSuppliers)
      .select('*');
    
    if (insertError) {
      console.error('Error creating default suppliers:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      return false;
    }
    
    if (!insertedData || insertedData.length === 0) {
      console.error('No suppliers were inserted');
      return false;
    }
    
    console.log('Default suppliers created successfully:', insertedData);
    return true;
  } catch (error) {
    console.error('Error in initializeDefaultSuppliers:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    
    // Handle the case where profiles might be null or not an object
    const profileData = data.profiles && typeof data.profiles === 'object' 
      ? data.profiles as Record<string, unknown>
      : null;

    // Safely extract profile data with proper type casting
    const profileName = profileData && typeof profileData.name === 'string' ? profileData.name : '';
    const profileEmail = profileData && typeof profileData.email === 'string' ? profileData.email : '';
    const profileAvatar = profileData && typeof profileData.avatar === 'string' ? profileData.avatar : '';

    return {
      id: data.id,
      user_id: data.user_id,
      name: profileName || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: profileEmail || 'Non spécifié',
      products: data.products || [],
      avatar: profileAvatar || '',
      image: profileAvatar || '', // For backward compatibility
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
      .select('name')
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
    
    // Handle the case where profiles might be null or not an object
    const profileData = data.profiles && typeof data.profiles === 'object' 
      ? data.profiles as Record<string, unknown>
      : null;

    // Safely extract profile data with proper type casting
    const profileName = profileData && typeof profileData.name === 'string' ? profileData.name : '';
    const profileEmail = profileData && typeof profileData.email === 'string' ? profileData.email : '';
    const profileAvatar = profileData && typeof profileData.avatar === 'string' ? profileData.avatar : '';

    return {
      id: data.id,
      user_id: data.user_id,
      name: profileName || 'Fournisseur',
      category: data.category || 'Divers',
      rating: data.rating || 0,
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      email: profileEmail || 'Non spécifié',
      products: data.products || [],
      avatar: profileAvatar || '',
      image: profileAvatar || '', // For backward compatibility
    };
  } catch (error) {
    console.error('Error in getSupplierByUserId:', error);
    return null;
  }
};

export const deleteDefaultSuppliers = async (): Promise<boolean> => {
  try {
    console.log('Starting default suppliers deletion process...');

    // First, check for any default suppliers
    const { data: defaultSuppliers, error: checkError } = await supabase
      .from('suppliers')
      .select('id')
      .is('user_id', null);

    if (checkError) {
      console.error('Error checking for default suppliers:', checkError);
      return false;
    }

    if (!defaultSuppliers || defaultSuppliers.length === 0) {
      console.log('No default suppliers found to delete');
      return true;
    }

    console.log(`Found ${defaultSuppliers.length} default suppliers to delete`);

    // Delete suppliers with null user_id
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .is('user_id', null);

    if (deleteError) {
      console.error('Error deleting default suppliers:', deleteError);
      console.error('Error details:', {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint
      });
      return false;
    }

    // Verify deletion
    const { data: remainingDefaults, error: verifyError } = await supabase
      .from('suppliers')
      .select('id')
      .is('user_id', null);

    if (verifyError) {
      console.error('Error verifying deletion:', verifyError);
      return false;
    }

    if (remainingDefaults && remainingDefaults.length > 0) {
      console.error(`${remainingDefaults.length} default suppliers still remain after deletion attempt`);
      return false;
    }

    console.log('Default suppliers deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteDefaultSuppliers:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
};
