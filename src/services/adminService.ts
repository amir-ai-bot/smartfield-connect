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
      
      // 4. Delete supplier entry if any
      const { error: supplierError } = await supabase
        .from('suppliers')
        .delete()
        .eq('user_id', userId);
        
      if (supplierError) {
        console.error('Error deleting supplier entry:', supplierError);
      }
      
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
    
    // Finally delete the user from auth.users
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    
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
export const approveFournisseurRequest = async (userId: string): Promise<boolean> => {
  try {
    // First, update the user's role to 'fournisseur'
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'fournisseur' })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user role:', updateError);
      toast.error('Erreur lors de la mise à jour du rôle');
      return false;
    }

    // Get user's profile data to create supplier entry
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      toast.error('Erreur lors de la récupération du profil');
      return false;
    }

    // Create supplier entry
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        name: profile?.name || 'Fournisseur',
        category: 'Autre',
        location: 'Non spécifié',
        products: [],
        rating: 0
      })
      .select()
      .single();

    if (supplierError) {
      console.error('Error creating supplier entry:', supplierError);
      toast.error('Erreur lors de la création du profil fournisseur');
      return false;
    }

    toast.success('Demande de fournisseur approuvée avec succès');
    return true;
  } catch (error) {
    console.error('Error in approveFournisseurRequest:', error);
    toast.error('Erreur lors de l\'approbation de la demande');
    return false;
  }
};

// Reject a fournisseur request
export const rejectFournisseurRequest = async (userId: string) => {
  try {
    // First, update the user's role back to 'user'
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', userId);

    if (roleError) {
      console.error('Error updating user role:', roleError);
      toast.error('Erreur lors de la mise à jour du rôle');
      throw roleError;
    }

    // Then, delete any existing supplier entry for this user
    const { error: deleteError } = await supabase
      .from('suppliers')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting supplier entry:', deleteError);
      // Don't throw here as the role update was successful
    }

    toast.success('Demande de fournisseur rejetée avec succès');
    return true;
  } catch (error) {
    console.error('Error in rejectFournisseurRequest:', error);
    throw error;
  }
};

// Add a new fournisseur
export const addFournisseur = async (fournisseurData: FournisseurData) => {
  try {
    // First create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: fournisseurData.email,
      password: fournisseurData.password,
      options: {
        data: {
          name: fournisseurData.name,
          role: 'fournisseur'
        }
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      toast.error('Erreur lors de la création du compte: ' + authError.message);
      throw authError;
    }

    if (!authData?.user?.id) {
      throw new Error('No user ID returned after creation');
    }

    // Instead of using a non-existent RPC function, directly insert into the suppliers table
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: authData.user.id,
        name: fournisseurData.name, // Required field
        category: fournisseurData.category,
        location: fournisseurData.location,
        products: fournisseurData.products,
        phone: fournisseurData.phone,
        rating: 0 // Default rating
      });

    if (supplierError) {
      console.error('Error creating supplier:', supplierError);
      toast.error('Erreur lors de l\'ajout des informations fournisseur: ' + supplierError.message);
      throw supplierError;
    }

    toast.success('Fournisseur ajouté avec succès');
    return authData.user.id;
  } catch (error) {
    console.error('Error in addFournisseur:', error);
    throw error;
  }
};

// Add a new supplier
export const addSupplier = async (
  userId: string, 
  name: string, 
  category: string, 
  products: string[] = [],
  location: string = 'Non spécifié',
): Promise<string | null> => {
  try {
    // Check if the user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return null;
    }

    // Use the suppliers table directly instead of calling a function that doesn't exist
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: userId,
        category: category,
        location: location,
        products: products,
        rating: 0,
        name: name || userData.name || 'Supplier' // Include the required name field
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding supplier:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in addSupplier:', error);
    return null;
  }
};

// Set a user as admin
export const setUserAsAdmin = async (email: string): Promise<boolean> => {
  try {
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('Failed to get user profile:', profileError);
      return false;
    }

    // Update the user's role to admin in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      return false;
    }

    // Update the user's metadata in auth.users
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      profile.id,
      { user_metadata: { role: 'admin' } }
    );

    if (metadataError) {
      console.error('Failed to update user metadata:', metadataError);
      return false;
    }

    console.log('Successfully set user as admin');
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
};
