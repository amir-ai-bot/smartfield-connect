import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the Supplier type to match what's returned from the service
export interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  products: string[];
  image: string;
}

// Define the database supplier type to match the actual schema
interface DbSupplier {
  id: string;
  user_id: string;
  category: string;
  location: string;
  phone: string;
  products: string[];
  rating: number;
  created_at: string;
  updated_at: string;
}

// Function to fetch all suppliers
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    // First get all suppliers
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');

    if (suppliersError) {
      console.error('Error fetching suppliers:', suppliersError);
      throw suppliersError;
    }

    if (!suppliersData || !Array.isArray(suppliersData)) {
      return [];
    }

    // Then get all profiles for these suppliers
    const userIds = suppliersData.map(s => s.user_id);
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continue even if profiles fetch fails
    }

    // Create a map of user profiles for easy lookup
    const profilesMap = new Map(
      (profilesData || []).map(profile => [profile.id, profile])
    );

    // Transform and combine the data
    return suppliersData.map((supplier: any) => {
      const profile = profilesMap.get(supplier.user_id);
      
      // For default suppliers without profiles, use the email as name
      let name = profile?.name;
      let email = profile?.email;
      
      // If no profile found, try to extract name from email
      if (!name && email) {
        const emailParts = email.split('@');
        if (emailParts.length > 0) {
          name = emailParts[0].replace(/\./g, ' ').replace(/([A-Z])/g, ' $1').trim();
        }
      }
      
      // If still no name, use a default
      if (!name) {
        name = 'Fournisseur ' + supplier.id.substring(0, 4);
      }
      
      return {
      id: supplier.id,
        name: name,
      category: supplier.category,
      rating: supplier.rating || 0,
      location: supplier.location,
      phone: supplier.phone,
        email: email || '',
      products: supplier.products || [],
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
      };
    });
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    toast.error('Erreur lors du chargement des fournisseurs');
    return [];
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
