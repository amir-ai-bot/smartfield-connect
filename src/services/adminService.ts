
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Fetch all users (admin only)
export const fetchAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Erreur lors du chargement des utilisateurs');
    throw error;
  }
};

// Fetch all projects (admin only)
export const fetchAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:user_id (name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Erreur lors du chargement des projets');
    throw error;
  }
};

// Delete a project (admin only)
export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Erreur lors de la suppression du projet');
    throw error;
  }
};

// Verify a user's email (admin only)
export const verifyUserEmail = async (userId: string) => {
  try {
    // Call the RPC function with the proper parameter object
    const { error } = await supabase.rpc('admin_verify_user', { 
      p_user_id: userId  // Changed parameter name to match expected RPC parameter
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying user email:', error);
    toast.error('Erreur lors de la vérification de l\'email');
    throw error;
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId: string) => {
  try {
    // Call the RPC function with the proper parameter object
    const { error } = await supabase.rpc('admin_delete_user', { 
      p_user_id: userId  // Changed parameter name to match expected RPC parameter
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Erreur lors de la suppression de l\'utilisateur');
    throw error;
  }
};

// Create a new user (admin only)
export const createUser = async (name: string, email: string, password: string, role: string = 'user') => {
  try {
    // Call the RPC function with the proper parameter object
    const { error } = await supabase.rpc('admin_create_user', {
      p_name: name,      // Changed parameter names to match expected RPC parameters
      p_email: email,
      p_password: password,
      p_role: role
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    toast.error('Erreur lors de la création de l\'utilisateur');
    throw error;
  }
};

// Set admin user password (admin only)
export const setUserPassword = async (userId: string, newPassword: string) => {
  try {
    // Call the RPC function with the proper parameter object
    const { error } = await supabase.rpc('admin_update_user_password', {
      p_user_id: userId,      // Changed parameter name to match expected RPC parameter
      p_new_password: newPassword
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    toast.error('Erreur lors de la mise à jour du mot de passe');
    throw error;
  }
};
