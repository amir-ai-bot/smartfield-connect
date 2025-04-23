
import { supabase } from '@/integrations/supabase/client';
import { Supplier as SupplierType } from '@/types/supabase';

/**
 * Get all suppliers
 */
export const getSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:profiles!user_id(id, name, avatar, email)
      `);
    
    if (error) throw error;
    
    return (data || []).map(item => {
      // Create a default profile object
      const defaultProfile = { id: '', name: '', avatar: '', email: '' };
      
      // Handle potentially null/undefined profiles or SelectQueryError safely
      let profileData = defaultProfile;
      
      if (item.profiles && 
          typeof item.profiles === 'object' && 
          !('code' in item.profiles)) {
        profileData = {
          id: item.profiles?.id || defaultProfile.id,
          name: item.profiles?.name || defaultProfile.name,
          avatar: item.profiles?.avatar || defaultProfile.avatar,
          email: item.profiles?.email || defaultProfile.email
        };
      }
      
      return {
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        category: item.category,
        location: item.location,
        phone: item.phone,
        products: item.products || [],
        rating: item.rating || 0,
        email: profileData.email || '',
        avatar: profileData.avatar || '',
        image: item.image || ''
      };
    });
  } catch (error) {
    console.error('Error getting suppliers:', error);
    return [];
  }
};

// Export an interface for Supplier type
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
        profiles:profiles!user_id(id, name, avatar, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    // Create a default profile object
    const defaultProfile = { id: '', name: '', avatar: '', email: '' };
    
    // Handle potentially null/undefined profiles or SelectQueryError safely
    let profileData = defaultProfile;
    
    if (data.profiles && 
        typeof data.profiles === 'object' && 
        !('code' in data.profiles)) {
      profileData = {
        id: data.profiles?.id || defaultProfile.id,
        name: data.profiles?.name || defaultProfile.name,
        avatar: data.profiles?.avatar || defaultProfile.avatar,
        email: data.profiles?.email || defaultProfile.email
      };
    }
    
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
      email: profileData.email || '',
      avatar: profileData.avatar || '',
      image: data.image || ''
    };
    
    return supplier;
  } catch (error) {
    console.error('Error getting supplier by ID:', error);
    return null;
  }
};

// Alias for compatibility with existing code
export const getSupplier = getSupplierById;

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
        profiles:profiles!user_id(id, name, avatar, email)
      `)
      .or(`name.ilike.%${query}%, category.ilike.%${query}%, location.ilike.%${query}%`);
    
    if (error) throw error;
    
    // Map the data to the correct supplier format with safe access
    return (data || []).map(item => {
      // Create a default profile object
      const defaultProfile = { id: '', name: '', avatar: '', email: '' };
      
      // Handle potentially null/undefined profiles or SelectQueryError safely
      let profileData = defaultProfile;
      
      if (item.profiles && 
          typeof item.profiles === 'object' && 
          !('code' in item.profiles)) {
        profileData = {
          id: item.profiles?.id || defaultProfile.id,
          name: item.profiles?.name || defaultProfile.name,
          avatar: item.profiles?.avatar || defaultProfile.avatar,
          email: item.profiles?.email || defaultProfile.email
        };
      }
      
      return {
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        category: item.category,
        location: item.location,
        phone: item.phone,
        products: item.products || [],
        rating: item.rating || 0,
        email: profileData.email || '',
        avatar: profileData.avatar || '',
        image: item.image || ''
      };
    });
  } catch (error) {
    console.error('Error searching suppliers:', error);
    return [];
  }
};

export const getAllSuppliers = getSuppliers;

// Add example suppliers to the database
export const addExampleSuppliers = async () => {
  try {
    // Check if suppliers already exist to avoid duplicates
    const { data: existingSuppliers, error: countError } = await supabase
      .from('suppliers')
      .select('id');
    
    if (countError) throw countError;
    
    // If we already have suppliers, don't add more
    if (existingSuppliers && existingSuppliers.length > 0) {
      console.log(`Already have ${existingSuppliers.length} suppliers, skipping example suppliers`);
      return;
    }
    
    // Example suppliers data
    const exampleSuppliers = [
      {
        name: 'AgroTech Solutions',
        category: 'Equipment',
        location: 'Tunis',
        phone: '+216 71 234 567',
        products: ['Tractors', 'Harvesters', 'Irrigation Systems'],
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybSUyMGVxdWlwbWVudHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        name: 'SeedMaster',
        category: 'Seeds',
        location: 'Sfax',
        phone: '+216 74 987 654',
        products: ['Wheat Seeds', 'Corn Seeds', 'Vegetable Seeds', 'Organic Seeds'],
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZhcm0lMjBzZWVkc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        name: 'Fertile Earth',
        category: 'Fertilizers',
        location: 'Sousse',
        phone: '+216 73 456 789',
        products: ['Organic Fertilizers', 'Chemical Fertilizers', 'Soil Enhancers'],
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1626017834756-e4d8f61dbd66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFybSUyMGZlcnRpbGl6ZXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        name: 'Irrigation Experts',
        category: 'Equipment',
        location: 'Nabeul',
        phone: '+216 72 345 678',
        products: ['Drip Irrigation', 'Sprinklers', 'Water Pumps', 'Control Systems'],
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1530507629858-e3e1d99e8614?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aXJyaWdhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      },
      {
        name: 'AgriConsult',
        category: 'Consulting',
        location: 'Monastir',
        phone: '+216 73 987 123',
        products: ['Farm Management', 'Crop Analysis', 'Technical Support', 'Market Analysis'],
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWdyaWN1bHR1cmFsJTIwY29uc3VsdGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
      }
    ];
    
    // Insert example suppliers
    const { error: insertError } = await supabase
      .from('suppliers')
      .insert(exampleSuppliers);
    
    if (insertError) throw insertError;
    
    console.log('Added example suppliers successfully');
    return true;
  } catch (error) {
    console.error('Error adding example suppliers:', error);
    return false;
  }
};

// Call the function to add example suppliers when the module loads
addExampleSuppliers();

