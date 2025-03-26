
import { createAdminAccount } from '@/services/authService';
import { toast } from 'sonner';

// Function to create admin account with the provided credentials
export const setupAdminAccount = async () => {
  try {
    const adminEmail = 'yassindhibi100@gmail.com';
    const adminPassword = 'yassin11yassin';
    const adminName = 'Admin Yassin';
    
    await createAdminAccount(adminName, adminEmail, adminPassword);
    toast.success('Compte administrateur créé avec succès');
    console.log('Admin account created successfully');
    
    return true;
  } catch (error) {
    console.error('Error creating admin account:', error);
    toast.error('Erreur lors de la création du compte administrateur');
    return false;
  }
};
