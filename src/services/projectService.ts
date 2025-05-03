
import { supabase } from '@/integrations/supabase/client';
import { ProjectData } from '@/types/auth';
import { toast } from 'sonner';

// Get all projects (public and those owned by the user)
export const getProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(id, display_name, avatar, email)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) return [];

    // Transform the data to match the ProjectData interface
    return data.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      user_id: project.owner_id,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || undefined,
      crop: project.crop_type || '',
      crop_type: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || ''
    }));
  } catch (error) {
    console.error('Error getting projects:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

// Get projects by user ID
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(id, display_name, avatar, email)
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) return [];

    // Transform the data to match the ProjectData interface
    return data.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      user_id: project.owner_id,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || undefined,
      crop: project.crop_type || '',
      crop_type: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || ''
    }));
  } catch (error) {
    console.error('Error getting user projects:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

// Get public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(id, display_name, avatar, email)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) return [];

    // Transform the data to match the ProjectData interface
    return data.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description || '',
      status: project.status as 'planning' | 'active' | 'completed',
      user_id: project.owner_id,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      image: project.image || undefined,
      crop: project.crop_type || '',
      crop_type: project.crop_type || '',
      location: project.location || '',
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      progress: project.progress || 0,
      isPublic: project.is_public || false,
      is_public: project.is_public || false,
      user_name: project.profiles?.display_name || '',
      user_avatar: project.profiles?.avatar || ''
    }));
  } catch (error) {
    console.error('Error getting public projects:', error);
    toast.error('Erreur lors de la récupération des projets publics');
    return [];
  }
};

// Get a single project by ID
export const getProject = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(id, display_name, avatar, email)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) return null;

    // Transform the data to match the ProjectData interface
    return {
      id: data.id,
      title: data.name,
      description: data.description || '',
      status: data.status as 'planning' | 'active' | 'completed',
      user_id: data.owner_id,
      owner_id: data.owner_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      image: data.image || undefined,
      crop: data.crop_type || '',
      crop_type: data.crop_type || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      progress: data.progress || 0,
      isPublic: data.is_public || false,
      is_public: data.is_public || false,
      user_name: data.profiles?.display_name || '',
      user_avatar: data.profiles?.avatar || ''
    };
  } catch (error) {
    console.error('Error getting project:', error);
    toast.error('Erreur lors de la récupération du projet');
    return null;
  }
};
