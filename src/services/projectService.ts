
import { ProjectData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Function to create a project
export const createProject = async (
  userId: string,
  name: string,
  crop: string,
  location: string,
  startDate: string,
  endDate: string,
  description?: string,
  image?: string,
  isPublic: boolean = false
): Promise<ProjectData> => {
  try {
    console.log('Creating project with data:', {
      userId, name, crop, location, startDate, endDate, description, image, isPublic
    });

    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: userId,
        name,
        crop,
        location,
        start_date: startDate,
        end_date: endDate,
        description,
        image,
        is_public: isPublic,
        status: 'planning',
        progress: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      throw new Error(error.message);
    }

    // Transform response to match ProjectData type
    return {
      id: data.id,
      name: data.name,
      title: data.name, // For compatibility
      crop: data.crop,
      location: data.location,
      start_date: data.start_date,
      end_date: data.end_date,
      startDate: data.start_date, // For compatibility
      endDate: data.end_date, // For compatibility
      progress: data.progress,
      status: data.status as 'planning' | 'active' | 'completed',
      image: data.image,
      description: data.description,
      owner_id: data.owner_id,
      user_id: data.owner_id, // For compatibility
      is_public: data.is_public
    };
  } catch (error) {
    console.error('Error in createProject:', error);
    throw error;
  }
};

// Function to get a user's projects
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
  console.log('Fetching projects for user:', userId);

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:owner_id (
        display_name,
        avatar
      )
    `)
    .eq('owner_id', userId);

  if (error) {
    console.error('Error fetching user projects:', error);
    throw new Error(error.message);
  }

  console.log('Retrieved projects:', data);

  // Transform data to match ProjectData type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    title: item.name, // For compatibility
    crop: item.crop || '',
    location: item.location || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    startDate: item.start_date || '', // For compatibility
    endDate: item.end_date || '', // For compatibility
    progress: item.progress || 0,
    status: item.status as 'planning' | 'active' | 'completed',
    image: item.image || '',
    description: item.description || '',
    owner_id: item.owner_id,
    user_id: item.owner_id, // For compatibility
    is_public: item.is_public || false,
    user_display_name: item.profiles?.display_name || '',
    user_avatar: item.profiles?.avatar || '',
    user_name: item.profiles?.display_name || '', // For compatibility
    isOwnProject: true // Mark as own project
  }));
};

// Function to get public projects
export const getPublicProjects = async (): Promise<ProjectData[]> => {
  console.log('Fetching public projects');
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:owner_id (
        display_name,
        avatar
      )
    `)
    .eq('is_public', true);

  if (error) {
    console.error('Error fetching public projects:', error);
    throw new Error(error.message);
  }

  console.log('Retrieved public projects:', data);

  // Transform data to match ProjectData type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    title: item.name, // For compatibility
    crop: item.crop || '',
    location: item.location || '',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    startDate: item.start_date || '', // For compatibility
    endDate: item.end_date || '', // For compatibility
    progress: item.progress || 0,
    status: item.status as 'planning' | 'active' | 'completed',
    image: item.image || '',
    description: item.description || '',
    owner_id: item.owner_id,
    user_id: item.owner_id, // For compatibility
    is_public: item.is_public || false,
    user_display_name: item.profiles?.display_name || '',
    user_avatar: item.profiles?.avatar || '',
    user_name: item.profiles?.display_name || '' // For compatibility
  }));
};

// Function to update a project
export const updateProject = async (
  projectId: string,
  updates: Partial<ProjectData>
): Promise<ProjectData> => {
  // Prepare updates with Supabase column names
  const projectUpdates: any = {
    name: updates.name || updates.title, // Support both name and title
    crop: updates.crop,
    location: updates.location,
    start_date: updates.start_date || updates.startDate, // Support both formats
    end_date: updates.end_date || updates.endDate, // Support both formats
    description: updates.description,
    image: updates.image,
    is_public: updates.is_public,
    status: updates.status,
    progress: updates.progress
  };
  
  // Remove undefined values
  Object.keys(projectUpdates).forEach(key => 
    projectUpdates[key] === undefined && delete projectUpdates[key]
  );

  console.log('Updating project with data:', projectUpdates);

  const { data, error } = await supabase
    .from('projects')
    .update(projectUpdates)
    .eq('id', projectId)
    .select(`
      *,
      profiles:owner_id (
        display_name,
        avatar
      )
    `)
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message);
  }

  // Transform to match ProjectData type
  return {
    id: data.id,
    name: data.name,
    title: data.name, // For compatibility
    crop: data.crop || '',
    location: data.location || '',
    start_date: data.start_date || '',
    end_date: data.end_date || '',
    startDate: data.start_date || '', // For compatibility
    endDate: data.end_date || '', // For compatibility
    progress: data.progress || 0,
    status: data.status as 'planning' | 'active' | 'completed',
    image: data.image || '',
    description: data.description || '',
    owner_id: data.owner_id,
    user_id: data.owner_id, // For compatibility
    is_public: data.is_public || false,
    user_display_name: data.profiles?.display_name || '',
    user_avatar: data.profiles?.avatar || '',
    user_name: data.profiles?.display_name || '' // For compatibility
  };
};

// Function to delete a project
export const deleteProject = async (projectId: string): Promise<void> => {
  console.log('Deleting project:', projectId);
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.message);
  }
};

// Function to get a project by ID
export const getProjectById = async (projectId: string, userId?: string): Promise<ProjectData> => {
  console.log('Fetching project by ID:', projectId);
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles:owner_id (
        display_name,
        avatar
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project by ID:', error);
    throw new Error(error.message);
  }

  console.log('Retrieved project:', data);

  // Transform to match ProjectData type
  return {
    id: data.id,
    name: data.name,
    title: data.name, // For compatibility
    crop: data.crop || '',
    location: data.location || '',
    start_date: data.start_date || '',
    end_date: data.end_date || '',
    startDate: data.start_date || '', // For compatibility
    endDate: data.end_date || '', // For compatibility
    progress: data.progress || 0,
    status: data.status as 'planning' | 'active' | 'completed',
    image: data.image || '',
    description: data.description || '',
    owner_id: data.owner_id,
    user_id: data.owner_id, // For compatibility
    is_public: data.is_public || false,
    user_display_name: data.profiles?.display_name || '',
    user_avatar: data.profiles?.avatar || '',
    user_name: data.profiles?.display_name || '', // For compatibility
    isOwnProject: userId && data.owner_id === userId
  };
};
