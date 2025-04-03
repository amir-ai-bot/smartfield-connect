import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FournisseurData } from '@/types/auth';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    // We need to join the auth.users view with our profiles table to get the roles
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        role,
        avatar,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error retrieving users: ' + error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

// Promote a user to admin (admin only)
export const promoteToAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast.error('Error promoting user: ' + error.message);
      throw error;
    }

    toast.success('User promoted to admin successfully');
    return data;
  } catch (error) {
    console.error('Error in promoteToAdmin:', error);
    throw error;
  }
};

// Demote an admin to regular user (admin only)
export const demoteToUser = async (userId: string) => {
  try {
    // First check that we're not demoting the last admin
    const { data: adminCount, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('role', 'admin');

    if (countError) {
      toast.error('Error checking admin count: ' + countError.message);
      throw countError;
    }

    // Make sure we're not demoting the last admin
    if (adminCount && adminCount.length <= 1) {
      toast.error('Cannot demote the last admin');
      throw new Error('Cannot demote the last admin');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast.error('Error demoting admin: ' + error.message);
      throw error;
    }

    toast.success('Admin demoted to user successfully');
    return data;
  } catch (error) {
    console.error('Error in demoteToUser:', error);
    throw error;
  }
};

// Get all verification codes (admin only)
export const getAllVerificationCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error retrieving verification codes: ' + error.message);
      throw error;
    }

    // Format the data to match the VerificationCode type expected by the UI
    return data.map(code => ({
      ...code,
      email: '' // Adding the missing email property that the UI expects
    }));
  } catch (error) {
    console.error('Error in getAllVerificationCodes:', error);
    throw error;
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId: string, role: string) => {
  try {
    // If we're demoting from admin, ensure it's not the last admin
    if (role !== 'admin') {
      const { data: currentRole } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (currentRole?.role === 'admin') {
        // Check if this is the last admin
        const { data: adminCount, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'admin');

        if (countError) {
          toast.error('Error checking admin count: ' + countError.message);
          throw countError;
        }

        if (adminCount && adminCount.length <= 1) {
          toast.error('Cannot demote the last admin');
          throw new Error('Cannot demote the last admin');
        }
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast.error('Error updating user role: ' + error.message);
      throw error;
    }

    toast.success('User role updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    throw error;
  }
};

// Delete a user (admin only) - Fixed to ensure it works properly and handles protected users
export const deleteUser = async (userId: string) => {
  try {
    console.log('Deleting user with ID:', userId);
    
    // First check if the user is an admin or protected user
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      toast.error('Error fetching user profile');
      throw profileError;
    }
    
    if (userProfile?.role === 'admin') {
      toast.error('Impossible de supprimer un administrateur');
      throw new Error('Cannot delete an admin user');
    }
    
    // List of protected emails that cannot be deleted
    const protectedEmails = ['bahapro30@gmail.com'];
    
    if (userProfile?.email && protectedEmails.includes(userProfile.email)) {
      toast.error('Ce compte est protégé et ne peut pas être supprimé');
      throw new Error('Cannot delete protected user account');
    }
    
    // First remove foreign key constraints by deleting related data
    try {
      // 1. Delete all projects created by the user
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);
        
      if (projectsError) {
        console.error('Error deleting user projects:', projectsError);
      }
      
      // 2. Delete conversations if any
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .or(`user_id.eq.${userId},fournisseur_id.eq.${userId}`);
        
      if (conversationsError) {
        console.error('Error deleting user conversations:', conversationsError);
      }
      
      // 3. Delete messages if any
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', userId);
        
      if (messagesError) {
        console.error('Error deleting user messages:', messagesError);
      }
      
      // 4. Delete other related data (comments, likes, etc.)
      // Add more delete operations for any other tables with foreign keys
      
    } catch (cleanupError) {
      console.error('Error during user data cleanup:', cleanupError);
      // Continue with deletion despite cleanup errors
    }
    
    // Now delete the user's profile
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
      
    if (deleteProfileError) {
      console.error('Error deleting user profile:', deleteProfileError);
      toast.error('Error deleting user profile');
      throw deleteProfileError;
    }
    
    // Finally delete the user from auth.users using admin_delete_user function
    const { error: deleteAuthError } = await supabase.rpc('admin_delete_user', {
      user_id: userId,
    });
    
    if (deleteAuthError) {
      console.error('Error deleting user from auth:', deleteAuthError);
      toast.error('Error deleting user account');
      throw deleteAuthError;
    }
    
    toast.success('User deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

// Get analytics data (admin only)
export const getAnalyticsData = async () => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      throw userError;
    }

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectError) {
      throw projectError;
    }

    // Get user registrations by month
    const { data: registrations, error: regError } = await supabase
      .from('profiles')
      .select('created_at')
      .order('created_at', { ascending: true });

    if (regError) {
      throw regError;
    }

    // Process registration data to count by month
    const registrationsByMonth: Record<string, number> = {};
    registrations?.forEach(reg => {
      const date = new Date(reg.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!registrationsByMonth[monthYear]) {
        registrationsByMonth[monthYear] = 0;
      }
      
      registrationsByMonth[monthYear]++;
    });

    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      registrationsByMonth
    };
  } catch (error) {
    console.error('Error in getAnalyticsData:', error);
    throw error;
  }
};

// Add a function to allow admins to delete projects
export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project: ' + error.message);
      throw error;
    }
    
    toast.success('Project deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
};

// Get all projects for admin
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects_with_users')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast.error('Error retrieving projects: ' + error.message);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    throw error;
  }
};

// Approve a fournisseur request
export const approveFournisseurRequest = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'fournisseur' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast.error('Error approving fournisseur request: ' + error.message);
      throw error;
    }

    toast.success('Demande de fournisseur approuvée avec succès');
    return data;
  } catch (error) {
    console.error('Error in approveFournisseurRequest:', error);
    throw error;
  }
};

// Reject a fournisseur request
export const rejectFournisseurRequest = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      toast.error('Error rejecting fournisseur request: ' + error.message);
      throw error;
    }

    toast.success('Demande de fournisseur rejetée');
    return data;
  } catch (error) {
    console.error('Error in rejectFournisseurRequest:', error);
    throw error;
  }
};

// Add a new fournisseur
export const addFournisseur = async (fournisseurData: FournisseurData) => {
  try {
    // First create the user account using the admin_create_user function
    const { error: userError } = await supabase.rpc('admin_create_user', {
      user_name: fournisseurData.name,
      user_email: fournisseurData.email,
      user_password: fournisseurData.password,
      user_role: 'fournisseur'
    });

    if (userError) {
      toast.error('Erreur lors de la création du compte: ' + userError.message);
      throw userError;
    }

    // Fetch the created user to get the ID
    const { data: userData, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', fournisseurData.email)
      .single();

    if (fetchError || !userData) {
      toast.error('Erreur lors de la récupération du compte: ' + (fetchError?.message || 'Utilisateur non trouvé'));
      throw fetchError || new Error('User not found');
    }

    // Update additional profile information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone_number: fournisseurData.phone,
        role: 'fournisseur'
      })
      .eq('id', userData.id);

    if (updateError) {
      toast.error('Erreur lors de la mise à jour du profil: ' + updateError.message);
      throw updateError;
    }

    // Create entry in suppliers table using the RPC function for type safety
    const { error: supplierError } = await supabase.rpc('add_supplier', {
      supplier_user_id: userData.id,
      supplier_category: fournisseurData.category,
      supplier_location: fournisseurData.location,
      supplier_products: fournisseurData.products,
      supplier_rating: 0,
      supplier_phone: fournisseurData.phone
    });

    if (supplierError) {
      toast.error('Erreur lors de l\'ajout des informations fournisseur: ' + supplierError.message);
      throw supplierError;
    }

    toast.success('Fournisseur ajouté avec succès');
    return userData.id;
  } catch (error) {
    console.error('Error in addFournisseur:', error);
    throw error;
  }
};
