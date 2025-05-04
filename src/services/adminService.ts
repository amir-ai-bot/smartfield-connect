
import { supabase } from '@/integrations/supabase/client';

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
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
};

// Get all projects for admin
export const getAdminProjects = async () => {
  try {
    // Get projects with owner info
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

    // Transform to match expected format
    const transformedProjects = data.map(project => {
      // Safely access nested profile data
      const profile = project.profiles || {};
      
      return {
        id: project.id,
        title: project.name,
        description: project.description || '',
        status: project.status || 'planning',
        owner_id: project.owner_id,
        user_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        image: project.image || '',
        crop: project.crop || '',
        location: project.location || '',
        progress: project.progress || 0,
        user_name: profile.display_name || 'Unknown',
        user_email: profile.email || '',
        user_avatar: profile.avatar || '',
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        is_public: !!project.is_public
      };
    });

    return transformedProjects;
  } catch (error) {
    console.error('Error getting admin projects:', error);
    return [];
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting admin suppliers:', error);
    return [];
  }
};
