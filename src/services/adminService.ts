
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectWithUser } from '@/types/supabase';

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
export const fetchAllProjects = async (): Promise<ProjectWithUser[]> => {
  try {
    const { data, error } = await supabase
      .from('projects_with_users')
      .select('*')
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
    // Use type assertion to tell TypeScript this is a valid function with parameters
    const { error } = await (supabase.rpc as any)('admin_verify_user', { 
      user_id: userId 
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
    // Use type assertion to tell TypeScript this is a valid function with parameters
    const { error } = await (supabase.rpc as any)('admin_delete_user', { 
      user_id: userId
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
    // Use type assertion to tell TypeScript this is a valid function with parameters
    const { error } = await (supabase.rpc as any)('admin_create_user', {
      name: name,
      email: email,
      password: password,
      role: role
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
    // Use type assertion to tell TypeScript this is a valid function with parameters
    const { error } = await (supabase.rpc as any)('admin_update_user_password', {
      user_id: userId,
      new_password: newPassword
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
