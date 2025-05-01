
import { supabase } from '@/integrations/supabase/client';
import { User, VerificationCode, ProjectWithUser } from '@/types/supabase';
import { toast } from 'sonner';

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map profiles to User type
    return data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: profile.role as User['role'] || 'user',
      avatar: profile.avatar || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      bio: profile.bio || '',
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      preferences: typeof profile.preferences === 'object' 
        ? profile.preferences as User['preferences']
        : { language: 'fr', notifications: { email: true, app: true }, theme: 'light' }
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get all verification codes
export const getVerificationCodes = async (): Promise<VerificationCode[]> => {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as VerificationCode[];
  } catch (error) {
    console.error('Error fetching verification codes:', error);
    throw error;
  }
};

// Create alias for backwards compatibility
export const getAllVerificationCodes = getVerificationCodes;

// Delete user
export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Approve fournisseur request
export const approveFournisseurRequest = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'fournisseur' })
      .eq('id', userId)
      .eq('role', 'pending_fournisseur');

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error approving supplier request:', error);
    throw error;
  }
};

// Reject fournisseur request
export const rejectFournisseurRequest = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId)
      .eq('role', 'pending_fournisseur');

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error rejecting supplier request:', error);
    throw error;
  }
};

// Get all projects (with user info)
export const getAllProjects = async (): Promise<ProjectWithUser[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_owner_id_fkey (id, display_name, email, avatar)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map the data to include user information
    return data.map(project => {
      const profile = project.profiles || {};
      
      return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        owner_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        creator_name: profile.display_name || 'Unknown',
        creator_email: profile.email || 'Unknown',
        creator_avatar: profile.avatar,
        user_name: profile.display_name || 'Unknown',
        user_email: profile.email || 'Unknown',
        user_avatar: profile.avatar
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
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

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Get analytics data
export const getAnalyticsData = async () => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectError) throw projectError;

    // Get registration by month (simplified)
    const { data: userData, error: registrationError } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: false });

    if (registrationError) throw registrationError;

    // Group users by month (simplified)
    const registrationsByMonth: { [key: string]: number } = {};
    userData.forEach(user => {
      const date = new Date(user.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      registrationsByMonth[monthYear] = (registrationsByMonth[monthYear] || 0) + 1;
    });

    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      registrationsByMonth
    };
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return { userCount: 0, projectCount: 0, registrationsByMonth: {} };
  }
};

// Add a new supplier
export const addFournisseur = async (
  fournisseur: {
    name: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    category: string;
    products: string[];
  }
) => {
  try {
    // First create the user account with fournisseur role
    const { error: userError } = await supabase.rpc('admin_create_user', {
      user_name: fournisseur.name,
      user_email: fournisseur.email,
      user_password: fournisseur.password,
      user_role: 'fournisseur'
    });

    if (userError) {
      throw userError;
    }

    // Get the user id from the newly created user
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', fournisseur.email)
      .single();

    if (fetchError || !userData) {
      throw fetchError || new Error('User not found after creation');
    }

    // Create supplier profile
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userData.id,
        name: fournisseur.name,
        email: fournisseur.email,
        phone: fournisseur.phone,
        location: fournisseur.location,
        category: fournisseur.category,
        products: fournisseur.products
      });

    if (supplierError) {
      throw supplierError;
    }

    return true;
  } catch (error) {
    console.error('Error adding supplier:', error);
    throw error;
  }
};
