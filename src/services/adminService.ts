
import { User, ProjectData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Function to fetch all users (for admin)
export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error(profilesError.message);
    }

    // We need to get the email verification status from auth.users
    // This will be done for each user by checking if email_confirmed_at is not null
    const users: User[] = [];
    
    for (const profile of profiles) {
      // Get auth user to check email verification status
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      
      const user: User = {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        avatar: profile.avatar,
        role: (profile.role as 'admin' | 'user' | 'fournisseur') || 'user',
        phone_number: profile.phone_number,
        address: profile.address,
        bio: profile.bio,
        // Set email_verified based on whether email_confirmed_at is set
        email_verified: authUser?.user?.email_confirmed_at !== null,
        // Convert preferences from Json to the expected type structure
        preferences: profile.preferences as User['preferences']
      };
      
      users.push(user);
    }

    return users;
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    throw error;
  }
};

// Fetch all projects (admin only)
export const fetchAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects_with_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erreur lors du chargement des projets');
      throw new Error(error.message);
    }

    // Transform the data to match the ProjectData type
    const projects = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      crop: item.crop,
      location: item.location,
      startDate: item.start_date,  // Map from start_date to startDate
      endDate: item.end_date,      // Map from end_date to endDate
      progress: item.progress,
      status: item.status as 'active' | 'planning' | 'completed',
      image: item.image,
      description: item.description,
      user_id: item.user_id,
      isPublic: item.is_public,    // Map from is_public to isPublic
      user_name: item.user_name,
      user_avatar: item.user_avatar
    }));

    return projects;
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
      console.error('Error deleting project:', error);
      toast.error('Erreur lors de la suppression du projet');
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
    const { error } = await supabase.rpc('admin_verify_user', { 
      user_id: userId 
    });
    
    if (error) {
      console.error('Error verifying user email:', error);
      toast.error('Erreur lors de la vérification de l\'email');
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
    // Call the RPC function directly to handle user deletion properly
    const { data, error } = await supabase.rpc('admin_delete_user', { 
      user_id: userId
    });
    
    if (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
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
    const { error } = await supabase.rpc('admin_create_user', {
      user_name: name,
      user_email: email,
      user_password: password,
      user_role: role
    });
    
    if (error) {
      console.error('Error creating user:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
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
    const { error } = await supabase.rpc('admin_update_user_password', {
      user_id: userId,
      new_password: newPassword
    });
    
    if (error) {
      console.error('Error updating user password:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user password:', error);
    toast.error('Erreur lors de la mise à jour du mot de passe');
    throw error;
  }
};
