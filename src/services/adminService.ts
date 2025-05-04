import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    
    // Transform to match the User interface
    const users = data.map(profile => {
      const user: User = {
        id: profile.id,
        email: profile.email || '',
        email_verified: true, // Default to true since we can't access auth.users
        display_name: profile.display_name || '',
        avatar: profile.avatar || '',
        role: profile.role || 'user',
        created_at: profile.created_at
      };
      return user;
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(*)
      `);
    
    if (error) throw error;
    
    // Transform to match ProjectData interface
    return data.map(project => {
      // Safely get profile data
      const profile = typeof project.profiles === 'object' && project.profiles !== null 
        ? project.profiles 
        : { display_name: 'Unknown', email: '', avatar: '' };
      
      return {
        id: project.id,
        title: project.name || '', // Map name to title for compatibility
        description: project.description || '',
        status: project.status,
        owner_id: project.owner_id || '',
        user_id: project.owner_id || '', // For backward compatibility
        created_at: project.created_at,
        updated_at: project.updated_at,
        // Add additional fields needed for ProjectData
        image: '',
        crop: '',
        location: '',
        progress: 0,
        startDate: '',
        endDate: '',
        // Add creator info for admin view
        creator_name: profile.display_name || '',
        creator_email: profile.email || '',
        creator_avatar: profile.avatar || ''
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getPendingFournisseurRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending_fournisseur');
    
    if (error) throw error;
    
    // Transform to match the User interface
    const users = data.map(profile => {
      const user: User = {
        id: profile.id,
        email: profile.email || '',
        email_verified: true,
        display_name: profile.display_name || '',
        avatar: profile.avatar || '',
        role: profile.role || 'pending_fournisseur',
        created_at: profile.created_at
      };
      return user;
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching pending fournisseur requests:', error);
    return [];
  }
};

export const getVerificationCodes = async () => {
  // This would require a custom table and endpoint
  // Returning empty array for now as a placeholder
  return [];
};

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
    
    // Get supplier count
    const { count: supplierCount, error: supplierError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (supplierError) throw supplierError;
    
    // Calculate user roles
    const { data: roleData, error: roleError } = await supabase
      .from('profiles')
      .select('role');
    
    if (roleError) throw roleError;
    
    const usersByRole = {
      user: roleData.filter(u => u.role === 'user').length,
      admin: roleData.filter(u => u.role === 'admin').length,
      fournisseur: roleData.filter(u => u.role === 'fournisseur').length,
      pending_fournisseur: roleData.filter(u => u.role === 'pending_fournisseur').length
    };
    
    // Calculate project statuses
    const { data: statusData, error: statusError } = await supabase
      .from('projects')
      .select('status');
    
    if (statusError) throw statusError;
    
    const projectsByStatus = {
      active: statusData.filter(p => p.status === 'active').length,
      completed: statusData.filter(p => p.status === 'completed').length,
      planning: statusData.filter(p => p.status === 'planning').length
    };
    
    // Get active projects
    const activeProjects = projectsByStatus.active;
    
    // Calculate new users this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { data: newUsers, error: newUserError } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', oneMonthAgo.toISOString());
    
    if (newUserError) throw newUserError;
    
    const newUsersThisMonth = newUsers.length;
    
    // Messages sent today
    // This would require a messages table
    const messagesSentToday = 0;
    
    // Prepare registrationsByMonth (placeholder data)
    const registrationsByMonth = {
      'Jan': 0,
      'Feb': 0,
      'Mar': 0,
      'Apr': 0,
      'May': 0,
      'Jun': 0,
      'Jul': 0,
      'Aug': 0,
      'Sep': 0,
      'Oct': 0,
      'Nov': 0,
      'Dec': 0
    };
    
    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      supplierCount: supplierCount || 0,
      activeProjects,
      newUsersThisMonth,
      messagesSentToday,
      usersByRole,
      projectsByStatus,
      registrationsByMonth
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      userCount: 0,
      projectCount: 0,
      supplierCount: 0,
      activeProjects: 0,
      newUsersThisMonth: 0,
      messagesSentToday: 0,
      usersByRole: {
        user: 0,
        admin: 0,
        fournisseur: 0,
        pending_fournisseur: 0
      },
      projectsByStatus: {
        active: 0,
        completed: 0,
        planning: 0
      },
      registrationsByMonth: {}
    };
  }
};

export const updateUserRole = async (userId: string, newRole: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    // Admin functions would require a serverless function with admin privileges
    // For now, we'll just delete the profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};

export const approveFournisseurRequest = async (userId: string) => {
  return updateUserRole(userId, 'fournisseur');
};

export const rejectFournisseurRequest = async (userId: string) => {
  return updateUserRole(userId, 'user');
};

export const addFournisseur = async (data: { name: string; category: string; location: string; phone: string; userId: string }) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .insert({
        name: data.name,
        category: data.category,
        location: data.location,
        phone: data.phone,
        user_id: data.userId,
        products: []
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding fournisseur:', error);
    return false;
  }
};

/**
 * Create an admin account (for use in scripts only)
 */
export async function createAdminAccount(email: string, password: string, name: string): Promise<boolean> {
  try {
    // This functionality should be restricted to trusted environments
    // In a real implementation, this would be handled by a secure admin API
    
    // Example implementation (for demonstration only):
    /*
    // 1. Create the user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });
    
    if (authError) {
      console.error('Error creating admin user:', authError);
      return false;
    }
    
    // 2. Update the role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        display_name: name
      })
      .eq('id', authData.user.id);
    
    if (updateError) {
      console.error('Error updating admin role:', updateError);
      return false;
    }
    
    console.log('Admin account created successfully:', email);
    return true;
    */
    
    console.log('Admin account creation is disabled in this environment');
    return false;
  } catch (error) {
    console.error('Error in createAdminAccount:', error);
    return false;
  }
}
