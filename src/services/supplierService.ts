
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createConversation } from './conversationService';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  rating: number;
  products?: string[];
  email?: string;
  avatar?: string;
}

// Get all suppliers
export const getSuppliers = async (): Promise<Supplier[]> => {
  try {
    const { data: suppliers, error } = await supabase.rpc('get_all_suppliers');
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erreur lors du chargement des fournisseurs');
      return [];
    }
    
    return suppliers || [];
  } catch (error) {
    console.error('Error in getSuppliers:', error);
    toast.error('Erreur lors du chargement des fournisseurs');
    return [];
  }
};

// Alias for getSuppliers to maintain backward compatibility
export const getAllSuppliers = getSuppliers;

// Get supplier by ID
export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching supplier:', error);
      toast.error('Erreur lors du chargement du fournisseur');
      return null;
    }
    
    if (!supplier) {
      toast.error('Aucun fournisseur trouvé');
      return null;
    }
    
    // Get the user profile data for the supplier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supplier.user_id)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching supplier profile:', profileError);
      // Continue anyway, we can use the supplier data without profile
    }
    
    // Safe access to profileData
    const safeProfileData = profileData as Record<string, unknown> | null;
    
    return {
      ...supplier,
      email: safeProfileData?.email as string || '',
      avatar: safeProfileData?.avatar as string || '',
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    toast.error('Erreur lors du chargement du fournisseur');
    return null;
  }
};

// Get supplier by user ID
export const getSupplierByUserId = async (userId: string): Promise<Supplier | null> => {
  try {
    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching supplier by user ID:', error);
      toast.error('Erreur lors du chargement du fournisseur');
      return null;
    }
    
    if (!supplier) {
      return null;
    }
    
    // Get the user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching supplier profile:', profileError);
      // Continue anyway, we can use the supplier data without profile
    }
    
    // Safe access to profileData
    const safeProfileData = profileData as Record<string, unknown> | null;
    
    return {
      ...supplier,
      email: safeProfileData?.email as string || '',
      avatar: safeProfileData?.avatar as string || '',
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error in getSupplierByUserId:', error);
    toast.error('Erreur lors du chargement du fournisseur');
    return null;
  }
};

// Create a supplier
export const createSupplier = async (
  userId: string,
  name: string,
  category: string,
  location: string,
  phone: string,
  products: string[] = []
): Promise<Supplier | null> => {
  try {
    // First, check if this user already has a supplier profile
    const existingSupplier = await getSupplierByUserId(userId);
    if (existingSupplier) {
      toast.error('Vous avez déjà un profil fournisseur');
      return null;
    }
    
    // Check if the user is an admin (admins shouldn't be suppliers)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error checking user profile:', profileError);
      toast.error('Erreur lors de la vérification du profil');
      return null;
    }
    
    if (userProfile.role === 'admin') {
      toast.error('Les administrateurs ne peuvent pas devenir fournisseurs');
      return null;
    }
    
    // Create the supplier
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        name,
        category,
        location,
        phone,
        products,
        rating: 0 // Default rating
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating supplier:', error);
      toast.error('Erreur lors de la création du fournisseur');
      return null;
    }
    
    toast.success('Profil fournisseur créé avec succès');
    return data;
  } catch (error) {
    console.error('Error in createSupplier:', error);
    toast.error('Erreur lors de la création du fournisseur');
    return null;
  }
};

// Update supplier
export const updateSupplier = async (
  id: string,
  updates: {
    name?: string;
    category?: string;
    location?: string;
    phone?: string;
    products?: string[];
  }
): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating supplier:', error);
      toast.error('Erreur lors de la mise à jour du fournisseur');
      return null;
    }
    
    toast.success('Fournisseur mis à jour avec succès');
    return data;
  } catch (error) {
    console.error('Error in updateSupplier:', error);
    toast.error('Erreur lors de la mise à jour du fournisseur');
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
      toast.error('Erreur lors de la suppression du fournisseur');
      return false;
    }
    
    toast.success('Fournisseur supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error in deleteSupplier:', error);
    toast.error('Erreur lors de la suppression du fournisseur');
    return false;
  }
};

// Create a conversation with a supplier
export const createSupplierConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // First, get the supplier to find the user_id of the supplier
    const supplier = await getSupplierById(supplierId);
    
    if (!supplier || !supplier.user_id) {
      toast.error('Fournisseur non trouvé');
      throw new Error('Supplier not found');
    }
    
    // Create a conversation between the current user and the supplier's user
    const conversationId = await createConversation(userId, supplier.user_id);
    return conversationId;
  } catch (error) {
    console.error('Error creating conversation with supplier:', error);
    toast.error('Erreur lors de la création de la conversation');
    throw error;
  }
};

// Search for suppliers by name, category, or location
export const searchSuppliers = async (query: string): Promise<Supplier[]> => {
  try {
    // Get all suppliers then filter client-side
    // This is a simple implementation that could be improved with server-side filtering
    const suppliers = await getSuppliers();
    
    if (!query) {
      return suppliers;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return suppliers.filter(supplier => 
      supplier.name.toLowerCase().includes(lowerQuery) ||
      supplier.category.toLowerCase().includes(lowerQuery) ||
      supplier.location.toLowerCase().includes(lowerQuery) ||
      supplier.products?.some(product => product.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error('Error searching suppliers:', error);
    toast.error('Erreur lors de la recherche de fournisseurs');
    return [];
  }
};
