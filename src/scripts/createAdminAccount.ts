
import { createAdminAccount } from '@/services/adminService';
import { toast } from 'sonner';

export const setupAdminAccount = async () => {
  try {
    // Use hardcoded values for admin account creation from the Index page
    const user = await createAdminAccount();
    
    toast.success('Compte administrateur créé avec succès!');
    console.log('Admin account created:', user);
    
    return user;
  } catch (error) {
    console.error('Failed to create admin account:', error);
    toast.error('Échec de la création du compte administrateur. Vérifiez la console pour plus de détails.');
    throw error;
  }
};
