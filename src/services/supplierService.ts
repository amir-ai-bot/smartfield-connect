import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the Supplier type to match what's returned from the service
export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  products: string[];
  image: string;
  avatar?: string;
}

// Function to fetch all suppliers
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    // Use the get_all_suppliers function which already joins suppliers and profiles
    const { data, error } = await supabase.rpc('get_all_suppliers');

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform the data from jsonb to our Supplier interface
    return data.map((supplier: any) => {
      return {
        id: supplier.id,
        user_id: supplier.user_id,
        name: supplier.name || `Fournisseur ${supplier.id.substring(0, 4)}`,
        category: supplier.category,
        rating: supplier.rating || 0,
        location: supplier.location,
        phone: supplier.phone || '',
        email: supplier.email || '',
        products: supplier.products || [],
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
        avatar: supplier.avatar
      };
    });
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    toast.error('Erreur lors du chargement des fournisseurs');
    return [];
  }
};

// Get a supplier by ID
export const getSupplierById = async (supplierId: string): Promise<Supplier | null> => {
  try {
    console.log('Fetching supplier with ID:', supplierId);
    
    // First get the supplier
    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();

    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      throw supplierError;
    }

    if (!supplierData) {
      console.error('No supplier found with ID:', supplierId);
      return null;
    }

    // Then get the profile for this supplier
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name, email, avatar')
      .eq('id', supplierData.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching supplier profile:', profileError);
      // Continue even if profile fetch fails
    }

    // Transform and combine the data
    return {
      id: supplierData.id,
      user_id: supplierData.user_id,
      name: profileData?.name || `Fournisseur ${supplierData.id.substring(0, 4)}`,
      category: supplierData.category,
      rating: supplierData.rating || 0,
      location: supplierData.location,
      phone: supplierData.phone || '',
      email: profileData?.email || '',
      products: supplierData.products || [],
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80',
      avatar: profileData?.avatar
    };
  } catch (error) {
    console.error('Error in getSupplierById:', error);
    toast.error('Erreur lors du chargement du fournisseur');
    return null;
  }
};

// Fix the conversation creation in SupplierCard
export const createSupplierConversation = async (userId: string, supplierId: string): Promise<string> => {
  try {
    // Get the supplier record to get the user_id (fournisseur_id)
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('user_id')
      .eq('id', supplierId)
      .single();

    if (supplierError) {
      console.error('Error fetching supplier:', supplierError);
      throw new Error('Fournisseur non trouvé');
    }

    const fournisseurId = supplier.user_id;

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .match({ user_id: userId, fournisseur_id: fournisseurId })
      .maybeSingle();
      
    if (existingConversation) {
      return existingConversation.id;
    }
    
    // Create a new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        fournisseur_id: fournisseurId
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Erreur lors de la création de la conversation');
    }
    
    return data.id;
  } catch (error: any) {
    console.error('Error in createSupplierConversation:', error);
    throw error;
  }
};

// Add default suppliers if none exist
export const initializeDefaultSuppliers = async () => {
  try {
    // Check if suppliers exist
    const { count, error: countError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking suppliers count:', countError);
      return;
    }

    // If suppliers already exist, don't add defaults
    if (count && count > 0) {
      return;
    }

    // If no suppliers exist, add default suppliers
    const defaultSuppliers = [
      {
        name: "Ahmed Fertilité",
        category: "Engrais",
        rating: 4.8,
        location: "Gafsa Centre",
        phone: "+216 98 765 432",
        email: "ahmed@fertilite.com",
        products: ["Engrais organique", "NPK", "Engrais foliaire", "Compost"],
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        name: "Samira Semences",
        category: "Semences",
        rating: 4.5,
        location: "El Guettar",
        phone: "+216 91 234 567",
        email: "samira@semences.com",
        products: ["Semences d'oliviers", "Palmiers dattiers", "Pistachiers"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      }
    ];

    // Instead of creating users, just add the suppliers directly
    for (const supplier of defaultSuppliers) {
      try {
        // Create a temporary user ID (this is just for display purposes)
        const tempUserId = crypto.randomUUID();
        
        // Create the supplier entry directly
        const { error: supplierError } = await supabase
          .from('suppliers')
          .insert({
            user_id: tempUserId,
            category: supplier.category,
            location: supplier.location,
            products: supplier.products,
            rating: supplier.rating,
            phone: supplier.phone
          });

        if (supplierError) {
          console.error('Error creating supplier entry:', supplierError);
        }
      } catch (error) {
        console.error('Error creating supplier:', error);
      }
    }
  } catch (error) {
    console.error('Error in initializeDefaultSuppliers:', error);
  }
};
