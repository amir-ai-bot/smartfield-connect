import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectData } from '@/types/auth';

// Create a new project
export const createProject = async (project: Partial<ProjectData>, userId: string) => {
  try {
    // Convert ProjectData format to database format
    const dbProject = {
      name: project.title || '',
      description: project.description,
      status: project.status,
      owner_id: userId,
      image: project.image,
      start_date: project.startDate,
      end_date: project.endDate,
      location: project.location,
      crop_type: project.crop,
      progress: project.progress || 0,
      is_public: project.isPublic || false
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(dbProject)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    // Map from database format back to ProjectData
    const newProject: ProjectData = {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      user_id: data.owner_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image,
      crop: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      start_date: data.start_date,
      end_date: data.end_date,
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public
    };

    return newProject;
  } catch (error) {
    console.error('Error in createProject:', error);
    toast.error('Failed to create project');
    throw error;
  }
};

// Get a specific project
export const getProject = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:profiles!projects_owner_id_fkey (id, display_name, avatar)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting project:', error);
      throw error;
    }

    // Handle potential null relations with default values
    const profileData = data.profiles || {};

    // Map from database format to ProjectData
    const project: ProjectData = {
      id: data.id,
      title: data.name || '',
      name: data.name || '',
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      user_id: data.owner_id || '',
      owner_id: data.owner_id || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      start_date: data.start_date,
      end_date: data.end_date,
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public,
      user_name: typeof profileData === 'object' ? (profileData.display_name || '') : '',
      user_avatar: typeof profileData === 'object' ? (profileData.avatar || '') : ''
    };

    return project;
  } catch (error) {
    console.error('Error in getProject:', error);
    toast.error('Failed to load project');
    return null;
  }
};

// Get projects for the current user
export const getUserProjects = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user projects:', error);
      throw error;
    }

    // Map from database format to ProjectData
    return data.map(project => ({
      id: project.id,
      title: project.name || '',
      name: project.name || '',
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      user_id: project.owner_id || '',
      owner_id: project.owner_id || '',
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      start_date: project.start_date,
      end_date: project.end_date,
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public
    }));
  } catch (error) {
    console.error('Error in getUserProjects:', error);
    toast.error('Failed to load your projects');
    return [];
  }
};

// Get public projects
export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:profiles!projects_owner_id_fkey (id, display_name, avatar)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting public projects:', error);
      throw error;
    }

    // Map from database format to ProjectData, handling potential null relations
    return data.map(project => {
      const profileData = project.profiles || {};
      
      return {
        id: project.id,
        title: project.name || '',
        name: project.name || '',
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        user_id: project.owner_id || '',
        owner_id: project.owner_id || '',
        created_at: project.created_at,
        updated_at: project.updated_at,
        image: project.image || '',
        crop: project.crop_type || '',
        location: project.location || '',
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        start_date: project.start_date,
        end_date: project.end_date,
        progress: project.progress || 0,
        isPublic: project.is_public || false,
        is_public: project.is_public,
        user_name: typeof profileData === 'object' ? (profileData.display_name || '') : '',
        user_avatar: typeof profileData === 'object' ? (profileData.avatar || '') : ''
      };
    });
  } catch (error) {
    console.error('Error in getProjects:', error);
    toast.error('Failed to load public projects');
    return [];
  }
};

// Alias for backward compatibility
export const getPublicProjects = getProjects;

// Update an existing project
export const updateProject = async (projectId: string, updates: Partial<ProjectData>) => {
  try {
    // Convert ProjectData format to database format
    const dbUpdates: any = {};
    
    if (updates.title !== undefined) dbUpdates.name = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.crop !== undefined) dbUpdates.crop_type = updates.crop;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    // Map from database format to ProjectData
    return {
      id: data.id,
      title: data.name || '',
      name: data.name || '',
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      user_id: data.owner_id || '',
      owner_id: data.owner_id || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      start_date: data.start_date,
      end_date: data.end_date,
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public
    };
  } catch (error) {
    console.error('Error in updateProject:', error);
    toast.error('Failed to update project');
    throw error;
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
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    toast.error('Failed to delete project');
    return false;
  }
};
