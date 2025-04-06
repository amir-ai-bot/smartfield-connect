import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const deleteDefaultSuppliers = async () => {
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
      toast.error('Erreur lors de la suppression des fournisseurs par défaut');
      return false;
    }
    
    toast.success('Fournisseurs par défaut supprimés avec succès');
    return true;
  } catch (error) {
    console.error('Error in deleteDefaultSuppliers:', error);
    toast.error('Erreur lors de la suppression des fournisseurs par défaut');
    return false;
  }
};

// Run this script directly if needed
if (require.main === module) {
  deleteDefaultSuppliers()
    .then(result => {
      console.log('Operation completed with result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
