
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectData } from '@/types/auth';
import { getDefaultProjectImage } from '@/services/storageService';

// Helper function to convert Supabase project data to ProjectData
const mapProjectData = (project: any): ProjectData => ({
  id: project.id,
  title: project.name || '',
  name: project.name || '',
  description: project.description || '',
  status: project.status as 'planning' | 'active' | 'completed',
  user_id: project.owner_id || '',
  owner_id: project.owner_id || '',
  created_at: project.created_at || '',
  updated_at: project.updated_at || '',
  image: project.image || getDefaultProjectImage(),
  crop: project.crop_type || '',
  crop_type: project.crop_type || '',
  location: project.location || '',
  startDate: project.start_date || '',
  start_date: project.start_date || '',
  endDate: project.end_date || '',
  end_date: project.end_date || '',
  progress: project.progress || 0,
  isPublic: project.is_public || false,
  is_public: project.is_public || false,
  user_name: project.profiles?.display_name || '',
  user_avatar: project.profiles?.avatar || null
});

// Get all user's projects
export const getProjects = async (userId: string): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapProjectData);
  } catch (error) {
    console.error('Error fetching projects:', error);
    toast.error('Failed to load projects');
    return [];
  }
};

// Alias for getUserProjects
export const getUserProjects = getProjects;

// Get a single project by ID
export const getProjectById = async (projectId: string): Promise<ProjectData | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) throw error;

    return mapProjectData(data);
  } catch (error) {
    console.error('Error fetching project:', error);
    toast.error('Failed to load project');
    return null;
  }
};

// Alias for getProjectById
export const getProject = getProjectById;

// Create a new project
export const createProject = async (projectData: Partial<ProjectData>, userId: string): Promise<ProjectData | null> => {
  try {
    const newProject = {
      name: projectData.title || '',
      description: projectData.description || '',
      status: projectData.status || 'planning',
      owner_id: userId,
      image: projectData.image || getDefaultProjectImage(),
      crop_type: projectData.crop || '',
      location: projectData.location || '',
      start_date: projectData.startDate || '',
      end_date: projectData.endDate || '',
      progress: projectData.progress || 0,
      is_public: projectData.isPublic || false
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select()
      .single();

    if (error) throw error;

    toast.success('Project created successfully');
    return mapProjectData(data);
  } catch (error) {
    console.error('Error creating project:', error);
    toast.error('Failed to create project');
    return null;
  }
};

// Update an existing project
export const updateProject = async (projectId: string, projectData: Partial<ProjectData>): Promise<ProjectData | null> => {
  try {
    const updates: any = {
      name: projectData.title,
      description: projectData.description,
      status: projectData.status,
      image: projectData.image,
      crop_type: projectData.crop,
      location: projectData.location,
      start_date: projectData.startDate,
      end_date: projectData.endDate,
      progress: projectData.progress,
      is_public: projectData.isPublic,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => 
      updates[key] === undefined && delete updates[key]
    );

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    toast.success('Project updated successfully');
    return mapProjectData(data);
  } catch (error) {
    console.error('Error updating project:', error);
    toast.error('Failed to update project');
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

    if (error) throw error;

    toast.success('Project deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Failed to delete project');
    return false;
  }
};

// Get public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapProjectData);
  } catch (error) {
    console.error('Error fetching public projects:', error);
    toast.error('Failed to load public projects');
    return [];
  }
};
