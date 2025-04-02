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
      try {
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
      } catch (error) {
        console.error('Error getting auth user:', error);
        // Add the user anyway without email verification status
        const user: User = {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          avatar: profile.avatar,
          role: (profile.role as 'admin' | 'user' | 'fournisseur') || 'user',
          phone_number: profile.phone_number,
          address: profile.address,
          bio: profile.bio,
          email_verified: false,
          preferences: profile.preferences as User['preferences']
        };
        
        users.push(user);
      }
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
      user_avatar: undefined
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

// Delete a user (admin only) - Fixed to ensure it works properly
export const deleteUser = async (userId: string) => {
  try {
    console.log('Deleting user with ID:', userId);
    
    // First check if the user is an admin
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (userProfile?.role === 'admin') {
      toast.error('Impossible de supprimer un administrateur');
      throw new Error('Cannot delete an admin user');
    }
    
    // First remove foreign key constraints by deleting related data
    try {
      // 1. Delete all projects created by the user
      console.log('Deleting user projects...');
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);
        
      if (projectsError) {
        console.error('Error deleting user projects:', projectsError);
      } else {
        console.log('Successfully deleted user projects');
      }
    } catch (e) {
      console.error('Exception when deleting projects:', e);
    }
    
    try {
      // 2. Delete all messages sent by the user
      console.log('Deleting user messages...');
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', userId);
        
      if (messagesError) {
        console.error('Error deleting user messages:', messagesError);
      } else {
        console.log('Successfully deleted user messages');
      }
    } catch (e) {
      console.error('Exception when deleting messages:', e);
    }
    
    try {
      // 3. Delete all conversations where the user is participant
      console.log('Deleting user conversations...');
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
        
      if (conversationsError) {
        console.error('Error deleting user conversations:', conversationsError);
      } else {
        console.log('Successfully deleted user conversations');
      }
    } catch (e) {
      console.error('Exception when deleting conversations:', e);
    }
    
    try {
      // 4. Delete all verification codes related to the user
      console.log('Deleting user verification codes...');
      const { error: codesError } = await supabase
        .from('verification_codes')
        .delete()
        .eq('user_id', userId);
        
      if (codesError) {
        console.error('Error deleting verification codes:', codesError);
      } else {
        console.log('Successfully deleted verification codes');
      }
    } catch (e) {
      console.error('Exception when deleting verification codes:', e);
    }
    
    try {
      // 5. Delete ratings related to the user
      console.log('Deleting user ratings...');
      const { error: ratingsError } = await supabase
        .from('fournisseur_ratings')
        .delete()
        .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
        
      if (ratingsError) {
        console.error('Error deleting user ratings:', ratingsError);
      } else {
        console.log('Successfully deleted user ratings');
      }
    } catch (e) {
      console.error('Exception when deleting ratings:', e);
    }
    
    // Finally, delete the user's profile (which will trigger auth user deletion via RLS)
    console.log('Deleting user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw new Error('Failed to delete user profile');
    }
    
    // If profile deletion works, call the RPC function as a backup
    console.log('Calling admin_delete_user RPC function');
    const { error } = await supabase.rpc('admin_delete_user', { 
      user_id: userId
    });
    
    if (error) {
      console.error('Error from admin_delete_user RPC:', error);
      // Don't throw here as we've already deleted the profile
      toast.success('Utilisateur supprimé avec succès (profil)');
    } else {
      console.log('User successfully deleted via RPC');
      toast.success('Utilisateur supprimé avec succès');
    }
    
    return true;
  } catch (error: any) {
    console.error('Error in deleteUser function:', error);
    toast.error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
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
