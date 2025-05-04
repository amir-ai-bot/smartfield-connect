
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types/auth';

// Get all users
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    toast.error('An error occurred while fetching users');
    return [];
  }
};

// Get all projects
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

    if (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
      return [];
    }

    // Map the returned data to include profile info
    const projectsWithCreators = data.map(project => ({
      ...project,
      owner_id: project.owner_id || project.user_id,
      creator_name: project.profiles?.display_name,
      creator_email: project.profiles?.email,
      creator_avatar: project.profiles?.avatar,
    }));

    return projectsWithCreators;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    toast.error('An error occurred while fetching projects');
    return [];
  }
};

// Get pending fournisseur requests
export const getPendingFournisseurRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending_fournisseur')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to fetch pending supplier requests');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getPendingFournisseurRequests:', error);
    toast.error('An error occurred while fetching pending supplier requests');
    return [];
  }
};

// Get verification codes (for admin management)
export const getVerificationCodes = async () => {
  try {
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching verification codes:', error);
      toast.error('Failed to fetch verification codes');
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getVerificationCodes:', error);
    toast.error('An error occurred while fetching verification codes');
    return [];
  }
};

// Approve a fournisseur request
export const approveFournisseurRequest = async (userId: string) => {
  try {
    // Call the RPC function to approve the request
    const { error } = await supabase.rpc('approve_fournisseur_request', {
      user_id: userId
    });

    if (error) {
      console.error('Error approving supplier request:', error);
      toast.error('Failed to approve supplier request');
      return false;
    }

    toast.success('Supplier request approved successfully');
    return true;
  } catch (error) {
    console.error('Error in approveFournisseurRequest:', error);
    toast.error('An error occurred while approving supplier request');
    return false;
  }
};

// Reject a fournisseur request
export const rejectFournisseurRequest = async (userId: string) => {
  try {
    // Call the RPC function to reject the request
    const { error } = await supabase.rpc('reject_fournisseur_request', {
      user_id: userId
    });

    if (error) {
      console.error('Error rejecting supplier request:', error);
      toast.error('Failed to reject supplier request');
      return false;
    }

    toast.success('Supplier request rejected');
    return true;
  } catch (error) {
    console.error('Error in rejectFournisseurRequest:', error);
    toast.error('An error occurred while rejecting supplier request');
    return false;
  }
};

// Delete a user
export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('admin_delete_user', {
      user_id: userId
    });

    if (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return false;
    }

    toast.success('User deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    toast.error('An error occurred while deleting user');
    return false;
  }
};

// Delete a project
export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }

    toast.success('Project deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    toast.error('An error occurred while deleting project');
    return false;
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
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }

    toast.success('User role updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    toast.error('An error occurred while updating user role');
    return false;
  }
};

// Get analytics data for admin dashboard
export const getAnalyticsData = async () => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get supplier count
    const { count: supplierCount, error: supplierError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    // Get active projects count
    const { count: activeProjects, error: activeError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get users by role
    const { data: roleData, error: roleError } = await supabase
      .from('profiles')
      .select('role');

    // Get projects by status
    const { data: statusData, error: statusError } = await supabase
      .from('projects')
      .select('status');

    if (userError || projectError || supplierError || activeError || roleError || statusError) {
      console.error('Error fetching analytics data');
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
        }
      };
    }

    // Calculate users by role
    const usersByRole = {
      user: 0,
      admin: 0,
      fournisseur: 0,
      pending_fournisseur: 0
    };

    if (roleData) {
      roleData.forEach((item) => {
        const role = item.role as keyof typeof usersByRole;
        if (role in usersByRole) {
          usersByRole[role]++;
        }
      });
    }

    // Calculate projects by status
    const projectsByStatus = {
      active: 0,
      completed: 0,
      planning: 0
    };

    if (statusData) {
      statusData.forEach((item) => {
        const status = item.status as keyof typeof projectsByStatus;
        if (status in projectsByStatus) {
          projectsByStatus[status]++;
        }
      });
    }

    // Calculate new users this month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Calculate messages sent today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const { count: messagesSentToday, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString());

    // Return analytics data
    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      supplierCount: supplierCount || 0,
      activeProjects: activeProjects || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      messagesSentToday: messagesSentToday || 0,
      usersByRole,
      projectsByStatus
    };
  } catch (error) {
    console.error('Error in getAnalyticsData:', error);
    toast.error('An error occurred while fetching analytics data');
    return {
      userCount: 0,
      projectCount: 0,
      supplierCount: 0
    };
  }
};

// Add a new fournisseur
export const addFournisseur = async (userData: Partial<User>, supplierData: any) => {
  try {
    // First create or update user with fournisseur role
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .upsert({
        name: userData.name,
        email: userData.email,
        role: 'fournisseur',
        ...userData
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating fournisseur user:', userError);
      toast.error('Failed to create supplier user account');
      return null;
    }

    // Then create the supplier entry
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: user.id,
        ...supplierData
      })
      .select()
      .single();

    if (supplierError) {
      console.error('Error creating supplier entry:', supplierError);
      toast.error('Failed to create supplier record');
      return null;
    }

    toast.success('Supplier added successfully');
    return { user, supplier };
  } catch (error) {
    console.error('Error in addFournisseur:', error);
    toast.error('An error occurred while adding supplier');
    return null;
  }
};
