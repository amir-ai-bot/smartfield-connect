
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/dashboard';

// Get all projects for a user (their own projects only)
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId);

    if (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }

    // Transform database results to match ProjectData type
    return data.map(project => ({
      id: project.id,
      title: project.name || '',
      name: project.name || '',
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      // Properties that might not exist in the database - provide defaults
      image: project.image || '',
      crop: project.crop || '',
      location: project.location || '',
      progress: project.progress || 0,
      startDate: project.start_date || '',
      start_date: project.start_date || '',
      endDate: project.end_date || '',
      end_date: project.end_date || '',
      is_public: project.is_public || false,
      user_id: project.owner_id
    }));
  } catch (error) {
    console.error('Error in getUserProjects:', error);
    return [];
  }
};

// Get all projects visible to a user (their own projects + public projects)
export const getAllVisibleProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    console.log('Fetching all visible projects for user:', userId);

    // First, try to get the user's own projects
    const { data: ownProjects, error: ownProjectsError } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (ownProjectsError) {
      console.error('Error fetching own projects:', ownProjectsError);
    }

    // Then, get public projects not owned by the user
    const { data: publicProjects, error: publicProjectsError } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .neq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (publicProjectsError) {
      console.error('Error fetching public projects:', publicProjectsError);
    }

    // Combine the results
    const allProjects = [
      ...(ownProjects || []).map(project => ({
        ...project,
        isOwnProject: true
      })),
      ...(publicProjects || []).map(project => ({
        ...project,
        isOwnProject: false
      }))
    ];

    console.log('Combined projects:', allProjects.length);

    // Transform database results to match ProjectData type
    return allProjects.map(project => ({
      id: project.id,
      title: project.name || '',
      name: project.name || '',
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      // Properties that might not exist in the database - provide defaults
      image: project.image || '',
      crop: project.crop || '',
      location: project.location || '',
      progress: project.progress || 0,
      startDate: project.start_date || '',
      start_date: project.start_date || '',
      endDate: project.end_date || '',
      end_date: project.end_date || '',
      is_public: project.is_public || false,
      user_id: project.owner_id,
      // Add user information
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || '',
      // Flag to indicate if this is the user's own project
      isOwnProject: project.isOwnProject
    }));
  } catch (error) {
    console.error('Error in getAllVisibleProjects:', error);
    return [];
  }
};

// Get all public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  try {
    console.log('Fetching public projects...');

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (
          id,
          display_name,
          avatar
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public projects:', error);
      return [];
    }

    console.log('Public projects fetched successfully:', data?.length);

    // Transform database results to match ProjectData type
    return data.map(project => {
      const profile = project.profiles as any;

      return {
        id: project.id,
        title: project.name || '',
        name: project.name || '',
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        owner_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
        // Properties that might not exist in the database - provide defaults
        image: project.image || '',
        crop: project.crop || '',
        location: project.location || '',
        progress: project.progress || 0,
        startDate: project.start_date || '',
        start_date: project.start_date || '',
        endDate: project.end_date || '',
        end_date: project.end_date || '',
        is_public: true,
        user_id: project.owner_id,
        // Add user information
        user_name: profile?.display_name || '',
        user_avatar: profile?.avatar || '',
        // This is not the user's own project
        isOwnProject: false
      };
    });
  } catch (error) {
    console.error('Error in getPublicProjects:', error);
    return [];
  }
};

// Get project by ID (renamed to getProjectById to avoid duplication)
export const getProjectById = async (id: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.name || '',
      name: data.name || '',
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Properties that might not exist in the database - provide defaults
      image: data.image || '',
      crop: data.crop || '',
      location: data.location || '',
      progress: data.progress || 0,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: data.is_public || false,
      user_id: data.owner_id
    };
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
};

// Alias for getProjectById for backward compatibility
export const getProject = getProjectById;

// Create a new project
export const createProject = async (userId: string, projectData: Partial<ProjectData>): Promise<ProjectData | null> => {
  try {
    console.log('Creating project with data:', projectData);
    console.log('User ID:', userId);

    // Format dates properly
    let startDate = null;
    let endDate = null;

    if (projectData.startDate) {
      try {
        startDate = new Date(projectData.startDate).toISOString();
      } catch (e) {
        console.error('Invalid start date:', projectData.startDate);
      }
    }

    if (projectData.endDate) {
      try {
        endDate = new Date(projectData.endDate).toISOString();
      } catch (e) {
        console.error('Invalid end date:', projectData.endDate);
      }
    }

    // Ensure the user is the owner
    const project = {
      name: projectData.title || projectData.name || 'Untitled Project',
      description: projectData.description || '',
      status: projectData.status || 'planning',
      owner_id: userId,
      // Optional fields with defaults
      image: projectData.image || 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8',
      crop: projectData.crop || '',
      location: projectData.location || '',
      progress: projectData.progress || 0,
      start_date: startDate,
      end_date: endDate,
      is_public: projectData.is_public || false
    };

    console.log('Formatted project data for Supabase:', project);

    // Skip the RPC call and go directly to insert
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating project with direct insert:', error);
      return null;
    }

    console.log('Project created successfully with direct insert:', data);

    return {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      progress: data.progress || 0,
      crop: data.crop || '',
      location: data.location || '',
      image: data.image || '',
      owner_id: data.owner_id,
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: data.is_public || false,
      isOwnProject: true
    };
  } catch (error) {
    console.error('Error in createProject:', error);
    return null;
  }
};

// Update an existing project
export const updateProject = async (projectId: string, projectData: Partial<ProjectData>): Promise<ProjectData | null> => {
  try {
    // Convert to database format
    const updateData: any = {};

    if (projectData.title || projectData.name) updateData.name = projectData.title || projectData.name;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.status) updateData.status = projectData.status;
    if (projectData.image !== undefined) updateData.image = projectData.image;
    if (projectData.crop !== undefined) updateData.crop = projectData.crop;
    if (projectData.location !== undefined) updateData.location = projectData.location;
    if (projectData.progress !== undefined) updateData.progress = projectData.progress;
    if (projectData.startDate || projectData.start_date) updateData.start_date = projectData.startDate || projectData.start_date;
    if (projectData.endDate || projectData.end_date) updateData.end_date = projectData.endDate || projectData.end_date;
    if (projectData.is_public !== undefined) updateData.is_public = projectData.is_public;

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

    return {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      progress: data.progress || 0,
      crop: data.crop || '',
      location: data.location || '',
      image: data.image || '',
      owner_id: data.owner_id,
      user_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      startDate: data.start_date || '',
      start_date: data.start_date || '',
      endDate: data.end_date || '',
      end_date: data.end_date || '',
      is_public: data.is_public || false
    };
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
