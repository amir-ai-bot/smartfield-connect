
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
    // Define the parameter type explicitly for the RPC call
    interface VerifyUserParams { user_id: string }
    
    const { error } = await supabase.rpc('admin_verify_user', {
      user_id: userId
    } as VerifyUserParams);
    
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
    // Define the parameter type explicitly for the RPC call
    interface DeleteUserParams { user_id: string }
    
    const { error } = await supabase.rpc('admin_delete_user', {
      user_id: userId
    } as DeleteUserParams);
    
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
    // Define the parameter type explicitly for the RPC call
    interface CreateUserParams {
      user_name: string;
      user_email: string;
      user_password: string;
      user_role: string;
    }
    
    const { error } = await supabase.rpc('admin_create_user', {
      user_name: name,
      user_email: email,
      user_password: password,
      user_role: role
    } as CreateUserParams);
    
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
