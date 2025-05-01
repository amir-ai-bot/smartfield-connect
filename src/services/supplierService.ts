import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Supplier } from '@/types/supabase';

// Types for suppliers
export interface SupplierBasic {
  id: string;
  name: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating?: number;
  avatar?: string;
  user_id?: string;
  email?: string;
}

// Get all suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*, profiles(avatar, name, email)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Transform data to match Supplier interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id || undefined,
      name: item.profiles?.name || item.name || 'Unknown',
      category: item.category || 'Divers',
      location: item.location || 'Non spécifié',
      phone: item.phone || 'Non spécifié',
      products: item.products || [],
      rating: item.rating || 0,
      avatar: item.profiles?.avatar || undefined,
      email: item.profiles?.email || undefined,
      image: item.profiles?.avatar || undefined // Use avatar as image
    }));
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    return [];
  }
}

// Alias for getSuppliers for backward compatibility
export const getAllSuppliers = getSuppliers;

// Get a supplier by ID
export async function getSupplier(id: string): Promise<Supplier | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*, profiles(avatar, name, email)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }

    if (!data) return null;

    // Transform data to match Supplier interface
    return {
      id: data.id,
      user_id: data.user_id || undefined,
      name: data.profiles?.name || data.name || 'Unknown',
      category: data.category || 'Divers',
      location: data.location || 'Non spécifié',
      phone: data.phone || 'Non spécifié',
      products: data.products || [],
      rating: data.rating || 0,
      avatar: data.profiles?.avatar || undefined,
      email: data.profiles?.email || undefined,
      image: data.profiles?.avatar || undefined // Use avatar as image
    };
  } catch (error) {
    console.error('Error in getSupplier:', error);
    return null;
  }
}

// Alias for getSupplier for backward compatibility
export const getSupplierById = getSupplier;

// Create a supplier conversation
export async function createSupplierConversation(userId: string, supplierId: string): Promise<string | null> {
  try {
    // First get the supplier to retrieve the user_id of the supplier
    const supplier = await getSupplier(supplierId);
    if (!supplier || !supplier.user_id) {
      toast.error('Fournisseur non trouvé ou informations manquantes');
      return null;
    }
    
    // Check if conversation already exists
    const { data: existingConversation, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('fournisseur_id', supplier.user_id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing conversation:', checkError);
    }
    
    // Return existing conversation if found
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: supplier.user_id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createSupplierConversation:', error);
    toast.error('Erreur lors de la création de la conversation');
    return null;
  }
}

// Search suppliers by category, name, or products
export async function searchSuppliers(query: string): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*, profiles(avatar, name, email)')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,products.cs.{${query}}`)
      .order('rating', { ascending: false });
    
    if (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }

    // Transform data to match Supplier interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id || undefined,
      name: item.profiles?.name || item.name || 'Unknown',
      category: item.category || 'Divers',
      location: item.location || 'Non spécifié',
      phone: item.phone || 'Non spécifié',
      products: item.products || [],
      rating: item.rating || 0,
      avatar: item.profiles?.avatar || undefined,
      email: item.profiles?.email || undefined,
      image: item.profiles?.avatar || undefined // Use avatar as image
    }));
  } catch (error) {
    console.error('Error in searchSuppliers:', error);
    return [];
  }
}

// Create a new supplier
export async function createSupplier(supplier: Omit<Supplier, 'id'>): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    return null;
  }
}

// Update an existing supplier
export async function updateSupplier(id: string, supplier: Partial<Supplier>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update(supplier)
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
}

// Delete a supplier
export async function deleteSupplier(id: string): Promise<boolean> {
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
}

// Initialize default suppliers if none exist
export async function initializeDefaultSuppliers(): Promise<boolean> {
  try {
    // Check if suppliers exist
    const { count, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking suppliers count:', countError);
      throw countError;
    }
    
    // If suppliers already exist, do nothing
    if (count && count > 0) {
      console.log('Suppliers already exist, skipping initialization');
      return true;
    }
    
    // Add default suppliers
    const defaultSuppliers = [
      {
        name: 'AgriFert SARL',
        category: 'Fertilisants',
        location: 'Tunis',
        phone: '+216 71 123 456',
        products: ['Fertilisant organique', 'Engrais NPK', 'Compost'],
        rating: 4.5
      },
      {
        name: 'MaterielAgri Plus',
        category: 'Équipement',
        location: 'Sfax',
        phone: '+216 74 987 654',
        products: ['Tracteurs', 'Moissonneuses', 'Pièces détachées'],
        rating: 4.2
      },
      {
        name: 'Semences du Sud',
        category: 'Semences',
        location: 'Gabès',
        phone: '+216 75 456 789',
        products: ['Semences de blé', 'Semences de tomates', 'Plants d\'oliviers'],
        rating: 4.7
      }
    ];
    
    const { error: insertError } = await supabase
      .from('suppliers')
      .insert(defaultSuppliers);
    
    if (insertError) {
      console.error('Error adding default suppliers:', insertError);
      throw insertError;
    }
    
    console.log('Default suppliers added successfully');
    return true;
  } catch (error) {
    console.error('Error in initializeDefaultSuppliers:', error);
    return false;
  }
}

// Delete all default suppliers (for testing/reset)
export async function deleteDefaultSuppliers(): Promise<boolean> {
  try {
    const defaultNames = [
      'AgriFert SARL',
      'MaterielAgri Plus',
      'Semences du Sud'
    ];
    
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .in('name', defaultNames);
    
    if (error) {
      console.error('Error deleting default suppliers:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDefaultSuppliers:', error);
    return false;
  }
}
