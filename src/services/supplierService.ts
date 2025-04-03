
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

// Function to fetch all suppliers
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    // Use RPC call to get suppliers data
    const { data, error } = await supabase.rpc('get_all_suppliers');

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform data to match the expected format
    return data.map(supplier => ({
      id: supplier.id,
      name: supplier.name || 'Fournisseur sans nom',
      category: supplier.category,
      rating: supplier.rating || 0,
      location: supplier.location,
      phone: supplier.phone,
      email: supplier.email || '',
      products: supplier.products || [],
      image: supplier.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80'
    }));
  } catch (error) {
    console.error('Error in getAllSuppliers:', error);
    toast.error('Erreur lors du chargement des fournisseurs');
    // Return an empty array instead of throwing to avoid breaking the UI
    return [];
  }
};

// Add default suppliers if none exist
export const initializeDefaultSuppliers = async () => {
  try {
    // Use a direct SQL query through RPC to check if suppliers exist
    const { data: count, error: countError } = await supabase.rpc('get_suppliers_count');

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
      },
      {
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
    
    // Use RPC to add suppliers safely
    for (const supplier of defaultSuppliers) {
      const { error } = await supabase.rpc('add_default_supplier', {
        supplier_name: supplier.name,
        supplier_email: supplier.email,
        supplier_password: 'Supplier123!',
        supplier_category: supplier.category,
        supplier_rating: supplier.rating,
        supplier_location: supplier.location,
        supplier_phone: supplier.phone,
        supplier_products: supplier.products
      });
      
      if (error) {
        console.error(`Error creating supplier ${supplier.name}:`, error);
      }
    }
    
    console.log('Default suppliers added successfully');
  } catch (error) {
    console.error('Error initializing default suppliers:', error);
  }
};
