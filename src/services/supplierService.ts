
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to fetch all suppliers
export const getAllSuppliers = async () => {
  try {
    // Join profiles with the suppliers table to get all information
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        id,
        user_id,
        category,
        location,
        products,
        rating,
        phone,
        profiles:user_id (
          name,
          email,
          avatar
        )
      `)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Transform data to match the expected format
    return data.map(supplier => ({
      id: supplier.id,
      name: supplier.profiles?.name || 'Fournisseur sans nom',
      category: supplier.category,
      rating: supplier.rating || 0,
      location: supplier.location,
      phone: supplier.phone,
      email: supplier.profiles?.email || '',
      products: supplier.products || [],
      image: supplier.profiles?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    }));
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    toast.error('Erreur lors du chargement des fournisseurs');
    throw error;
  }
};

// Add default suppliers if none exist
export const initializeDefaultSuppliers = async () => {
  try {
    // Check if suppliers already exist
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
        id: "1",
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
        id: "2",
        name: "Samira Semences",
        category: "Semences",
        rating: 4.5,
        location: "El Guettar",
        phone: "+216 91 234 567",
        email: "samira@semences.com",
        products: ["Semences d'oliviers", "Palmiers dattiers", "Pistachiers"],
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        id: "3",
        name: "Oasis Irrigation",
        category: "Équipement",
        rating: 4.7,
        location: "Gafsa Sud",
        phone: "+216 94 567 890",
        email: "contact@oasis-irrigation.com",
        products: ["Système goutte-à-goutte", "Pompes", "Tuyaux", "Filtres"],
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        id: "4",
        name: "Eco Protect",
        category: "Pesticides",
        rating: 4.3,
        location: "Metlaoui",
        phone: "+216 97 654 321",
        email: "info@ecoprotect.com",
        products: ["Insecticides bio", "Fongicides", "Répulsifs naturels"],
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        id: "5",
        name: "Mecagri Machines",
        category: "Machines",
        rating: 4.9,
        location: "Gafsa Est",
        phone: "+216 99 123 456",
        email: "service@mecagri.com",
        products: ["Tracteurs", "Moissonneuses", "Outils agricoles", "Pièces détachées"],
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      },
      {
        id: "6",
        name: "Sarah Consultante",
        category: "Conseil",
        rating: 5.0,
        location: "Gafsa Nord",
        phone: "+216 92 987 654",
        email: "sarah@agri-conseil.com",
        products: ["Conseil agricole", "Études de sol", "Optimisation de culture"],
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
      }
    ];
    
    // Add these suppliers to the database
    for (const supplier of defaultSuppliers) {
      // Create a user account first
      const { error: userError } = await supabase.rpc('admin_create_user', {
        user_name: supplier.name,
        user_email: supplier.email,
        user_password: 'Supplier123!',  // Default password
        user_role: 'fournisseur'
      });
      
      if (userError) {
        console.error(`Error creating user for ${supplier.name}:`, userError);
        continue;
      }
      
      // Get the user ID
      const { data: userData, error: userDataError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', supplier.email)
        .single();
        
      if (userDataError || !userData) {
        console.error(`Error fetching user ID for ${supplier.name}:`, userDataError);
        continue;
      }
      
      // Create the supplier entry
      const { error: supplierError } = await supabase
        .from('suppliers')
        .insert({
          user_id: userData.id,
          category: supplier.category,
          rating: supplier.rating,
          location: supplier.location,
          phone: supplier.phone,
          products: supplier.products
        });
        
      if (supplierError) {
        console.error(`Error creating supplier ${supplier.name}:`, supplierError);
      }
    }
    
    console.log('Default suppliers added successfully');
  } catch (error) {
    console.error('Error initializing default suppliers:', error);
  }
};
