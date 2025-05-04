
import { supabase } from '@/integrations/supabase/client';
import { User, ProjectData } from '@/types/auth';

// Get all users
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

    // Transform the data to match User type
    const usersWithEmailVerification = data.map(user => ({
      ...user,
      email_verified: true, // Since we can't easily check email verification from profiles table
      name: user.display_name
    })) as unknown as User[];

    return usersWithEmailVerification;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
};

// Get all projects
export const getAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Transform the data to match ProjectData type
    const projects = data.map(project => {
      // Handle the profiles
      let creator_name = null;
      let creator_email = null;
      let creator_avatar = null;
      
      if (project.profiles && typeof project.profiles === 'object' && !project.profiles.error) {
        creator_name = project.profiles.display_name || project.profiles.name;
        creator_email = project.profiles.email;
        creator_avatar = project.profiles.avatar;
      }

      return {
        ...project,
        title: project.name, // Map name to title
        user_id: project.owner_id, // Map owner_id to user_id
        creator_name,
        creator_email,
        creator_avatar,
        status: project.status || 'planning',
        progress: project.progress || 0,
        image: project.image || null,
      } as ProjectData;
    });

    return projects;
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    return [];
  }
};

// Delete a user (admin only)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return false;
  }
};

// Verify a user's email (admin only)
export const verifyUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('admin_verify_user', { user_id: userId });
    
    if (error) {
      console.error('Error verifying user:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in verifyUser:', error);
    return false;
  }
};

// Update a user's role (admin only)
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};

// Delete a project (admin only)
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) {
      console.error('Error deleting project:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return false;
  }
};

// Get admin stats
export const getAdminStats = async () => {
  try {
    // Stats we want to collect
    const stats = {
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
        pending_fournisseur: 0,
      },
      projectsByStatus: {
        planning: 0,
        active: 0,
        completed: 0,
      },
    };

    // Get user counts
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, role, created_at');
    
    if (userError) {
      console.error('Error fetching users for stats:', userError);
    } else if (users) {
      stats.userCount = users.length;
      
      // Count users by role
      users.forEach(user => {
        const role = user.role as string;
        if (role && stats.usersByRole.hasOwnProperty(role)) {
          stats.usersByRole[role as keyof typeof stats.usersByRole]++;
        } else {
          stats.usersByRole.user++;
        }
      });
      
      // Count new users this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      stats.newUsersThisMonth = users.filter(
        user => new Date(user.created_at) >= firstDayOfMonth
      ).length;
    }

    // Get project counts
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('id, status');
    
    if (projectError) {
      console.error('Error fetching projects for stats:', projectError);
    } else if (projects) {
      stats.projectCount = projects.length;
      
      // Count projects by status
      projects.forEach(project => {
        const status = project.status as string;
        if (status === 'active') {
          stats.activeProjects++;
        }
        
        if (status && stats.projectsByStatus.hasOwnProperty(status)) {
          stats.projectsByStatus[status as keyof typeof stats.projectsByStatus]++;
        } else {
          stats.projectsByStatus.planning++;
        }
      });
    }

    // Get supplier count
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .select('count');
    
    if (supplierError) {
      console.error('Error fetching suppliers for stats:', supplierError);
    } else if (suppliers && suppliers[0]) {
      stats.supplierCount = suppliers[0].count;
    }

    // Get messages sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: messages, error: messageError } = await supabase
      .from('messages')
      .select('count')
      .gte('created_at', today.toISOString());
    
    if (messageError) {
      console.error('Error fetching messages for stats:', messageError);
    } else if (messages && messages[0]) {
      stats.messagesSentToday = messages[0].count;
    }

    return stats;
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return null;
  }
};
