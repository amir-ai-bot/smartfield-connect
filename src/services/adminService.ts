import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, UserRole, UserPreferences } from '@/types/auth';
import { VerificationCode, ProjectWithUser } from '@/types/supabase';

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
    const users: User[] = authUsersData.map(userData => {
      // Handle preferences to make sure it's correctly typed
      let preferences: UserPreferences = {
        language: 'fr',
        notifications: { email: true, app: true },
        theme: 'light'
      };

      if (userData.preferences) {
        const prefs = userData.preferences as any;
        preferences = {
          language: (prefs.language || 'fr') as 'fr' | 'en' | 'ar',
          notifications: {
            email: prefs.notifications?.email !== undefined ? Boolean(prefs.notifications.email) : true,
            app: prefs.notifications?.app !== undefined ? Boolean(prefs.notifications.app) : true
          },
          theme: (prefs.theme || 'light') as 'light' | 'dark' | 'system'
        };
      }

      return {
        id: userData.id || '',
        email: userData.email || '',
        name: userData.display_name || '',
        role: (userData.role || 'user') as UserRole,
        avatar: userData.avatar || '',
        phone_number: userData.phone_number || '',
        address: userData.address || '',
        bio: userData.bio || '',
        created_at: userData.created_at || '',
        updated_at: userData.updated_at || '',
        preferences
      };
    });

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    toast.error('Erreur lors du chargement des utilisateurs');
    return [];
  }
};

// Get all verification codes
export const getAllVerificationCodes = async (): Promise<VerificationCode[]> => {
  try {
    // For now, return empty array as the RPC function may not exist
    return [];
    
    // When function is created, uncomment this:
    // const { data, error } = await supabase.rpc('admin_get_verification_codes');
    // if (error) throw error;
    // return data || [];
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
        profiles:owner_id (display_name, email, avatar)
      `);

    if (error) {
      throw error;
    }

    // Transform the data to match the expected format
    const projects = data.map(project => {
      // Get user data safely
      const profileData = project.profiles || {};
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        owner_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_name: profileData.display_name || 'Unknown',
        user_email: profileData.email || '',
        user_avatar: profileData.avatar || '',
        creator_name: profileData.display_name || 'Unknown',
        creator_email: profileData.email || '',
        creator_avatar: profileData.avatar || ''
      };
    });

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
      .eq('id', userId);

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
      .eq('id', userId);

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
      .eq('id', userId);

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
      .select('id')
      .eq('email', supplierData.email)
      .single();

    if (userError || !userData) {
      throw new Error('Failed to get created user');
    }

    // Create supplier record
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userData.id,
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

// Add createAdminAccount function (missing in authService)
export const createAdminAccount = async (
  adminName: string,
  adminEmail: string,
  adminPassword: string
) => {
  try {
    // Create user with admin function
    await supabase.rpc('admin_create_user', {
      user_name: adminName,
      user_email: adminEmail,
      user_password: adminPassword,
      user_role: 'admin'
    });
    
    // Get created user
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.display_name,
      email: data.email,
      role: 'admin' as UserRole
    };
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};
