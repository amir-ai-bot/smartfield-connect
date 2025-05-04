import { supabase } from '@/integrations/supabase/client';
import { User, ProjectData } from '@/types/supabase';

// Get admin statistics
export const getAdminStats = async () => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get new users this month
    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setDate(1)).toISOString());

    if (newUsersError) throw newUsersError;

    // Get project count
    const { count: projectCount, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (projectError) throw projectError;

    // Get active projects count
    const { count: activeProjects, error: activeError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) throw activeError;

    // Get supplier count
    const { count: supplierCount, error: supplierError } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (supplierError) throw supplierError;

    // Get messages sent today
    const { count: messagesSentToday, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    if (messagesError) throw messagesError;

    // Get users by role
    const { data: roles, error: rolesError } = await supabase
      .from('profiles')
      .select('role');

    if (rolesError) throw rolesError;

    const usersByRole = {
      user: roles.filter(r => r.role === 'user').length,
      admin: roles.filter(r => r.role === 'admin').length,
      fournisseur: roles.filter(r => r.role === 'fournisseur').length,
      pending_fournisseur: roles.filter(r => r.role === 'pending_fournisseur').length,
    };

    // Get projects by status
    const { data: projectStatuses, error: statusError } = await supabase
      .from('projects')
      .select('status');

    if (statusError) throw statusError;

    const projectsByStatus = {
      planning: projectStatuses.filter(p => p.status === 'planning').length,
      active: projectStatuses.filter(p => p.status === 'active').length,
      completed: projectStatuses.filter(p => p.status === 'completed').length,
    };

    return {
      userCount: userCount || 0,
      projectCount: projectCount || 0,
      supplierCount: supplierCount || 0,
      activeProjects: activeProjects || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      messagesSentToday: messagesSentToday || 0,
      usersByRole,
      projectsByStatus,
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return null;
  }
};

// Get all users for admin
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data as User[];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

// Alias functions to match imports in Admin.tsx
export const getAdminUsers = getAllUsers;

// Get all projects for admin
export const getAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          display_name,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Process the data to match the ProjectData interface
    const projects: ProjectData[] = data.map((project: any) => {
      // Handle the profiles
      let creator_name = null;
      let creator_email = null;
      let creator_avatar = null;

      if (project.profiles && typeof project.profiles === 'object' && !('error' in project.profiles)) {
        creator_name = project.profiles.display_name || project.profiles.name;
        creator_email = project.profiles.email;
        creator_avatar = project.profiles.avatar;
      }

      return {
        id: project.id,
        title: project.name || '',
        name: project.name,
        description: project.description,
        status: project.status as 'planning' | 'active' | 'completed',
        progress: project.progress || 0,
        crop: project.crop || '',
        location: project.location || '',
        image: project.image || '',
        user_name: creator_name || project.profiles?.display_name || '',
        user_email: creator_email || project.profiles?.email || '',
        user_avatar: creator_avatar || project.profiles?.avatar || '',
        owner_id: project.owner_id,
        user_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        is_public: project.is_public || false
      };
    });

    return projects;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return [];
  }
};

// Alias for getAllProjects
export const getAdminProjects = getAllProjects;

// Delete user function for admin
export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Verify user's email for admin
export const verifyUser = async (userId: string) => {
  try {
    const { error } = await supabase.rpc('admin_verify_user', { user_id: userId });

    if (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

// Update user role for admin
export const updateUserRole = async (userId: string, role: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Delete project function for admin
export const deleteProject = async (projectId: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Get all suppliers for admin
export const getAdminSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email,
          avatar
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting admin suppliers:', error);
    return [];
  }
};
