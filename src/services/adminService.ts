
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { toast } from 'sonner';

// Create an admin account
export const createAdminAccount = async (
  adminName: string,
  adminEmail: string, 
  adminPassword: string
): Promise<User | null> => {
  try {
    // Call the Supabase function to create an admin account
    const { data, error } = await supabase.rpc('admin_create_user', {
      user_name: adminName,
      user_email: adminEmail,
      user_password: adminPassword,
      user_role: 'admin'
    });

    if (error) throw error;

    // Get the user details from auth
    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (userError) throw userError;

    const user = userData.user;
    if (!user) throw new Error('User not created');

    // Convert to our User type
    const adminUser: User = {
      id: user.id,
      email: user.email || adminEmail,
      name: adminName,
      role: 'admin',
      email_verified: user.email_confirmed_at ? true : false,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return adminUser;
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to our User type format
    const users = data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: (profile.role as User['role']) || 'user',
      avatar: profile.avatar || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      bio: profile.bio || '',
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      preferences: profile.preferences as User['preferences']
    }));

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Erreur lors de la récupération des utilisateurs');
    return [];
  }
};

// Get pending fournisseur requests
export const getPendingFournisseurRequests = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending_fournisseur')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert to our User type format
    const users = data.map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: (profile.role as User['role']) || 'pending_fournisseur',
      avatar: profile.avatar || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      bio: profile.bio || '',
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      preferences: profile.preferences as User['preferences']
    }));

    return users;
  } catch (error) {
    console.error('Error fetching pending fournisseur requests:', error);
    toast.error('Erreur lors de la récupération des demandes de fournisseurs');
    return [];
  }
};

// Get verification codes - simplified implementation since we don't have the actual table
export const getVerificationCodes = async () => {
  try {
    // This is a simplified version since we don't have access to the verification_codes table
    return [];
  } catch (error) {
    console.error('Error fetching verification codes:', error);
    toast.error('Erreur lors de la récupération des codes de vérification');
    return [];
  }
};

// Get all projects with user info
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          display_name,
          email,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to include user profile info
    const projectsWithUserInfo = data.map(project => {
      // Handle potential null values or missing profile data
      const profileData = project.profiles || {};
      
      return {
        ...project,
        creator_name: profileData.display_name || 'Unknown',
        creator_email: profileData.email || 'No email',
        creator_avatar: profileData.avatar || null,
        user_name: profileData.display_name || 'Unknown',
        user_email: profileData.email || 'No email',
        user_avatar: profileData.avatar || null
      };
    });

    return projectsWithUserInfo;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Call the Supabase function to delete the user
    const { error } = await supabase.rpc('admin_delete_user', {
      user_id: userId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Erreur lors de la suppression de l\'utilisateur');
    return false;
  }
};

// Change user role
export const changeUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error changing user role:', error);
    toast.error('Erreur lors du changement de rôle de l\'utilisateur');
    return false;
  }
};

// Verify a user's email
export const verifyUserEmail = async (userId: string): Promise<boolean> => {
  try {
    // Call the Supabase function to verify the user's email
    const { error } = await supabase.rpc('admin_verify_user', {
      user_id: userId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error verifying user email:', error);
    toast.error('Erreur lors de la vérification de l\'email de l\'utilisateur');
    return false;
  }
};

// Reset user password
export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    // Call the Supabase function to reset the user's password
    const { error } = await supabase.rpc('admin_update_user_password', {
      user_id: userId,
      new_password: newPassword
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting user password:', error);
    toast.error('Erreur lors de la réinitialisation du mot de passe de l\'utilisateur');
    return false;
  }
};
