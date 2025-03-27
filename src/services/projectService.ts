
import { ProjectData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Function to create a project
export const createProject = async (
  userId: string,
  title: string,
  crop: string,
  location: string,
  startDate: string,
  endDate: string,
  description?: string,
  image?: string,
  isPublic: boolean = false
): Promise<ProjectData> => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title,
      crop,
      location,
      start_date: startDate,
      end_date: endDate,
      description,
      image,
      is_public: isPublic,
      status: 'planning' as 'planning' | 'active' | 'completed',
      progress: 0
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Transform response to match ProjectData type
  return {
    id: data.id,
    title: data.title,
    crop: data.crop,
    location: data.location,
    startDate: data.start_date,
    endDate: data.end_date,
    progress: data.progress,
    status: data.status as 'planning' | 'active' | 'completed',
    image: data.image,
    description: data.description,
    user_id: data.user_id,
    isPublic: data.is_public
  };
};

// Function to get a user's projects
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Transform data to match ProjectData type
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    crop: item.crop,
    location: item.location,
    startDate: item.start_date,
    endDate: item.end_date,
    progress: item.progress,
    status: item.status as 'planning' | 'active' | 'completed',
    image: item.image,
    description: item.description,
    user_id: item.user_id,
    isPublic: item.is_public
  }));
};

// Function to get public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_public', true);

  if (error) {
    throw new Error(error.message);
  }

  // Transform data to match ProjectData type
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    crop: item.crop,
    location: item.location,
    startDate: item.start_date,
    endDate: item.end_date,
    progress: item.progress,
    status: item.status as 'planning' | 'active' | 'completed',
    image: item.image,
    description: item.description,
    user_id: item.user_id,
    isPublic: item.is_public
  }));
};

// Function to update a project
export const updateProject = async (
  projectId: string,
  updates: {
    title?: string;
    crop?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    image?: string;
    isPublic?: boolean;
    status?: 'active' | 'planning' | 'completed';
    progress?: number;
  }
): Promise<ProjectData> => {
  // Prepare updates with Supabase column names
  const projectUpdates: any = {
    title: updates.title,
    crop: updates.crop,
    location: updates.location,
    start_date: updates.startDate,
    end_date: updates.endDate,
    description: updates.description,
    image: updates.image,
    is_public: updates.isPublic,
    status: updates.status,
    progress: updates.progress
  };
  
  // Remove undefined values
  Object.keys(projectUpdates).forEach(key => 
    projectUpdates[key] === undefined && delete projectUpdates[key]
  );

  const { data, error } = await supabase
    .from('projects')
    .update(projectUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Transform to match ProjectData type
  return {
    id: data.id,
    title: data.title,
    crop: data.crop,
    location: data.location,
    startDate: data.start_date,
    endDate: data.end_date,
    progress: data.progress,
    status: data.status as 'planning' | 'active' | 'completed',
    image: data.image,
    description: data.description,
    user_id: data.user_id,
    isPublic: data.is_public
  };
};

// Function to delete a project
export const deleteProject = async (projectId: string): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }
};
