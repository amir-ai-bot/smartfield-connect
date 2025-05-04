
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/auth';

// Get all projects for a user
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Transform to match ProjectData interface
    const projects: ProjectData[] = data.map(project => ({
      id: project.id,
      title: project.name,
      name: project.name,
      description: project.description || '',
      status: (project.status as 'planning' | 'active' | 'completed') || 'planning',
      owner_id: project.owner_id,
      user_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop || '',
      location: project.location || '',
      progress: project.progress || 0,
      startDate: project.start_date || '',
      start_date: project.start_date || '',
      endDate: project.end_date || '',
      end_date: project.end_date || '',
      is_public: !!project.is_public,
      isPublic: !!project.is_public,
    }));

    return projects;
  } catch (error) {
    console.error('Error in getUserProjects:', error);
    return [];
  }
};

// Get a project by ID
export const getProjectById = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    // Transform to match ProjectData interface
    const project: ProjectData = {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: (data.status as 'planning' | 'active' | 'completed') || 'planning',
      owner_id: data.owner_id,
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      progress: data.progress || 0,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: !!data.is_public,
      isPublic: !!data.is_public,
    };

    return project;
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
};

// Create a new project
export const createProject = async (
  userId: string,
  projectData: Omit<ProjectData, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.title,
        description: projectData.description,
        status: projectData.status || 'planning',
        owner_id: userId,
        image: projectData.image || '',
        crop: projectData.crop || '',
        location: projectData.location || '',
        progress: projectData.progress || 0,
        start_date: projectData.startDate || projectData.start_date || '',
        end_date: projectData.endDate || projectData.end_date || '',
        is_public: projectData.is_public || projectData.isPublic || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    // Transform to match ProjectData interface
    const project: ProjectData = {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: (data.status as 'planning' | 'active' | 'completed') || 'planning',
      owner_id: data.owner_id,
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      progress: data.progress || 0,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: !!data.is_public,
      isPublic: !!data.is_public,
    };

    return project;
  } catch (error) {
    console.error('Error in createProject:', error);
    return null;
  }
};

// Update a project
export const updateProject = async (
  projectId: string,
  projectData: Partial<ProjectData>
): Promise<ProjectData | null> => {
  try {
    // Prepare data for update
    const updateData: any = {};

    if (projectData.title) updateData.name = projectData.title;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.status) updateData.status = projectData.status;
    if (projectData.image !== undefined) updateData.image = projectData.image;
    if (projectData.crop !== undefined) updateData.crop = projectData.crop;
    if (projectData.location !== undefined) updateData.location = projectData.location;
    if (projectData.progress !== undefined) updateData.progress = projectData.progress;
    if (projectData.startDate || projectData.start_date) updateData.start_date = projectData.startDate || projectData.start_date;
    if (projectData.endDate || projectData.end_date) updateData.end_date = projectData.endDate || projectData.end_date;
    if (projectData.is_public !== undefined) updateData.is_public = projectData.is_public;
    if (projectData.isPublic !== undefined && projectData.is_public === undefined) updateData.is_public = projectData.isPublic;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return null;
    }

    // Transform to match ProjectData interface
    const project: ProjectData = {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: (data.status as 'planning' | 'active' | 'completed') || 'planning',
      owner_id: data.owner_id,
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      progress: data.progress || 0,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: !!data.is_public,
      isPublic: !!data.is_public,
    };

    return project;
  } catch (error) {
    console.error('Error in updateProject:', error);
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
      console.error('Error deleting project:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    return false;
  }
};
