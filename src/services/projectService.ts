import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/auth';

// Add the getPublicProjects function at the top
export const getPublicProjects = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (display_name, avatar, email)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // Map the data to match the expected ProjectData format
    return data.map(project => ({
      id: project.id,
      title: project.name,
      name: project.name,
      description: project.description || '',
      status: project.status,
      user_id: project.owner_id,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop_type || '',
      crop_type: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || new Date().toISOString(),
      endDate: project.end_date || new Date().toISOString(),
      start_date: project.start_date || new Date().toISOString(),
      end_date: project.end_date || new Date().toISOString(),
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || '',
      creator_name: project.profiles?.display_name || '',
      creator_avatar: project.profiles?.avatar || '',
      creator_email: project.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return [];
  }
};

export const getProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (display_name, avatar, email)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    // Map the data to match the expected ProjectData format
    return data.map(project => ({
      id: project.id,
      title: project.name,
      name: project.name,
      description: project.description || '',
      status: project.status,
      user_id: project.owner_id,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || '',
      crop: project.crop_type || '',
      crop_type: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || new Date().toISOString(),
      endDate: project.end_date || new Date().toISOString(),
      start_date: project.start_date || new Date().toISOString(),
      end_date: project.end_date || new Date().toISOString(),
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || '',
      creator_name: project.profiles?.display_name || '',
      creator_avatar: project.profiles?.avatar || '',
      creator_email: project.profiles?.email || ''
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getProjectById = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (display_name, avatar, email)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project by ID:', error);
      return null;
    }

    // Map the data to match the expected ProjectData format
    return {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: data.status,
      user_id: data.owner_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop_type || '',
      crop_type: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || new Date().toISOString(),
      endDate: data.end_date || new Date().toISOString(),
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || new Date().toISOString(),
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public || false,
      user_name: data.profiles?.display_name || '',
      user_avatar: data.profiles?.avatar || '',
      creator_name: data.profiles?.display_name || '',
      creator_avatar: data.profiles?.avatar || '',
      creator_email: data.profiles?.email || ''
    };
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
};

export const createProject = async (project: Omit<ProjectData, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: project.title,
          description: project.description,
          status: project.status,
          owner_id: project.user_id,
          crop_type: project.crop,
          location: project.location,
          start_date: project.startDate,
          end_date: project.endDate,
          progress: project.progress,
          is_public: project.isPublic,
          image: project.image
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.name,
      name: data.name,
      description: data.description || '',
      status: data.status,
      user_id: data.owner_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop_type || '',
      crop_type: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || new Date().toISOString(),
      endDate: data.end_date || new Date().toISOString(),
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || new Date().toISOString(),
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public || false,
      user_name: '',
      user_avatar: '',
      creator_name: '',
      creator_avatar: '',
      creator_email: ''
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

export const updateProject = async (projectId: string, updates: Partial<ProjectData>): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.title,
        description: updates.description,
        status: updates.status,
        crop_type: updates.crop,
        location: updates.location,
        start_date: updates.startDate,
        end_date: updates.endDate,
        progress: updates.progress,
        is_public: updates.isPublic,
        image: updates.image
      })
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
      status: data.status,
      user_id: data.owner_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || '',
      crop: data.crop_type || '',
      crop_type: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || new Date().toISOString(),
      endDate: data.end_date || new Date().toISOString(),
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || new Date().toISOString(),
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public || false,
      user_name: '',
      user_avatar: '',
      creator_name: '',
      creator_avatar: '',
      creator_email: ''
    };
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

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
    console.error('Error deleting project:', error);
    return false;
  }
};
