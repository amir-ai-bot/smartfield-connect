
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectData } from '@/types/auth';

// Get all projects for a user
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_owner_id_fkey (display_name, avatar)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map database fields to the expected ProjectData format
    return data.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: convertStatus(project.status),
      user_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || ''
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Error fetching projects');
    return [];
  }
};

// Get a single project by id
export const getProject = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_owner_id_fkey (display_name, avatar)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      title: data.name,
      description: data.description || '',
      status: convertStatus(data.status),
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      user_name: data.profiles?.display_name || '',
      user_avatar: data.profiles?.avatar || ''
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    toast.error('Error fetching project details');
    return null;
  }
};

// Get public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!projects_owner_id_fkey (display_name, avatar)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: convertStatus(project.status),
      user_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || ''
    }));
  } catch (error) {
    console.error('Error fetching public projects:', error);
    toast.error('Error fetching public projects');
    return [];
  }
};

// Create a new project
export const createProject = async (projectData: Partial<ProjectData>, userId: string): Promise<ProjectData | null> => {
  try {
    // Map ProjectData to database schema
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.title,
        description: projectData.description,
        status: projectData.status === 'planning' ? 'planning' : projectData.status === 'active' ? 'active' : 'completed',
        owner_id: userId,
        image: projectData.image,
        crop: projectData.crop,
        location: projectData.location,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        progress: projectData.progress || 0,
        is_public: projectData.isPublic
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      title: data.name,
      description: data.description || '',
      status: convertStatus(data.status),
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      progress: data.progress || 0,
      isPublic: data.is_public || false
    };
  } catch (error) {
    console.error('Error creating project:', error);
    toast.error('Error creating project');
    return null;
  }
};

// Update a project
export const updateProject = async (projectId: string, projectData: Partial<ProjectData>): Promise<ProjectData | null> => {
  try {
    // Map ProjectData to database schema
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: projectData.title,
        description: projectData.description,
        status: projectData.status === 'planning' ? 'planning' : projectData.status === 'active' ? 'active' : 'completed',
        image: projectData.image,
        crop: projectData.crop,
        location: projectData.location,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        progress: projectData.progress,
        is_public: projectData.isPublic
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      title: data.name,
      description: data.description || '',
      status: convertStatus(data.status),
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      progress: data.progress || 0,
      isPublic: data.is_public || false
    };
  } catch (error) {
    console.error('Error updating project:', error);
    toast.error('Error updating project');
    return null;
  }
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Error deleting project');
    return false;
  }
};

// Helper function to convert project status string to valid ProjectData status
function convertStatus(status: string): 'planning' | 'active' | 'completed' {
  if (status === 'planning' || status === 'active' || status === 'completed') {
    return status;
  }
  return 'planning'; // Default fallback
}
