
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types/supabase';

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // Get auth users
    const { data: authUsersData, error: authUsersError } = await supabase
      .from('profiles')
      .select('*');

    if (authUsersError) {
      throw authUsersError;
    }

    // Format users with proper types
    const users = authUsersData.map(userData => ({
      id: userData.user_id || '',
      email: userData.email || '',
      name: userData.display_name || '',
      role: (userData.role || 'user') as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur',
      avatar: userData.avatar || '',
      created_at: userData.created_at || '',
      updated_at: userData.updated_at || ''
    }));

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    toast.error('Erreur lors du chargement des utilisateurs');
    return [];
  }
};

// Get all verification codes
export const getAllVerificationCodes = async () => {
  try {
    const { data, error } = await supabase
      .rpc('admin_get_verification_codes');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting verification codes:', error);
    toast.error('Erreur lors du chargement des codes de vérification');
    return [];
  }
};

// Get analytics data
export const getAnalyticsData = async () => {
  try {
    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userCountError) {
      throw userCountError;
    }

    // Get project count
    const { count: projectCount, error: projectCountError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectCountError) {
      throw projectCountError;
    }

    // Get monthly registrations - dummy data for now
    const registrationsByMonth = {
      'Jan': 5,
      'Feb': 8,
      'Mar': 12,
      'Apr': 7,
      'May': 14,
      'Jun': 20
    };

    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      registrationsByMonth
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    toast.error('Erreur lors du chargement des données analytiques');
    return {
      userCount: 0,
      projectCount: 0,
      registrationsByMonth: {}
    };
  }
};

// Get all projects
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (display_name, email, avatar)
      `);

    if (error) {
      throw error;
    }

    // Transform the data to match the expected format
    const projects = data.map(project => ({
      ...project,
      creator_name: project.profiles?.display_name || 'Unknown',
      creator_email: project.profiles?.email || '',
      creator_avatar: project.profiles?.avatar || ''
    }));

    return projects;
  } catch (error) {
    console.error('Error getting projects:', error);
    toast.error('Erreur lors du chargement des projets');
    return [];
  }
};

// Update user role
export const updateUserRole = async (userId: string, newRole: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    toast.success(`Rôle mis à jour avec succès`);
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Erreur lors de la mise à jour du rôle');
  }
};

// Delete user
export const deleteUser = async (userId: string) => {
  try {
    // Delete user from auth (this should cascade to profiles through RLS)
    const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });

    if (error) {
      throw error;
    }

    toast.success('Utilisateur supprimé avec succès');
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Erreur lors de la suppression de l\'utilisateur');
    throw error;
  }
};

// Delete project
export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    toast.success('Projet supprimé avec succès');
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Erreur lors de la suppression du projet');
    throw error;
  }
};

// Approve supplier request
export const approveFournisseurRequest = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'fournisseur' })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    toast.success('Demande approuvée avec succès');
  } catch (error) {
    console.error('Error approving supplier request:', error);
    toast.error('Erreur lors de l\'approbation de la demande');
    throw error;
  }
};

// Reject supplier request
export const rejectFournisseurRequest = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    toast.success('Demande rejetée avec succès');
  } catch (error) {
    console.error('Error rejecting supplier request:', error);
    toast.error('Erreur lors du rejet de la demande');
    throw error;
  }
};

// Add a new supplier
export const addFournisseur = async (supplierData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  category: string;
  products: string[];
}) => {
  try {
    // Create user with admin function
    await supabase.rpc('admin_create_user', {
      user_name: supplierData.name,
      user_email: supplierData.email,
      user_password: supplierData.password,
      user_role: 'fournisseur'
    });

    // Get the user ID we just created
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', supplierData.email)
      .single();

    if (userError || !userData) {
      throw new Error('Failed to get created user');
    }

    // Create supplier record
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userData.user_id,
        name: supplierData.name,
        category: supplierData.category,
        location: supplierData.location,
        phone: supplierData.phone,
        products: supplierData.products,
        email: supplierData.email
      });

    if (supplierError) {
      throw supplierError;
    }

    toast.success('Fournisseur ajouté avec succès');
  } catch (error) {
    console.error('Error adding supplier:', error);
    toast.error('Erreur lors de l\'ajout du fournisseur');
    throw error;
  }
};
