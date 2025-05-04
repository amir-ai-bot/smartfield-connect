
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FournisseurRequestData {
  name: string;
  category: string;
  location: string;
  phone: string;
  userId: string;
}

export const createFournisseurRequest = async (data: FournisseurRequestData): Promise<boolean> => {
  try {
    // Update the user's role to pending_fournisseur
    const { error: userError } = await supabase
      .from('profiles')
      .update({ role: 'pending_fournisseur' })
      .eq('id', data.userId);

    if (userError) {
      console.error('Error updating user role:', userError);
      return false;
    }

    // Create a supplier record
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        name: data.name,
        category: data.category,
        location: data.location,
        phone: data.phone,
        user_id: data.userId,
      });

    if (supplierError) {
      console.error('Error creating supplier record:', supplierError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createFournisseurRequest:', error);
    return false;
  }
};
