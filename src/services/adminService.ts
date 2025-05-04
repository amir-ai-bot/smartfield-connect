
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, UserRole, ProjectData } from '@/types/auth';
import { getDefaultProjectImage } from '@/services/storageService';

// Function to get all pending supplier requests
export const getPendingSupplierRequests = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending_fournisseur');

    if (error) {
      throw new Error(error.message);
    }

    // Map profile data to User type
    return data.map((profile: any) => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone_number: profile.phone_number,
      address: profile.address,
      bio: profile.bio,
      email_verified: true, // Assuming verified from backend
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      display_name: profile.display_name,
      preferences: profile.preferences
    }));
  } catch (error) {
    console.error('Error fetching pending supplier requests:', error);
    toast.error('Failed to load pending supplier requests');
    return [];
  }
};

// Function to approve a supplier request
export const approveSupplierRequest = async (userId: string): Promise<boolean> => {
  try {
    // First update the profile role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'fournisseur',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Notify the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'supplier_approval',
        title: 'Votre demande a été approuvée',
        message: 'Félicitations! Votre demande pour devenir fournisseur a été approuvée.'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }

    toast.success('Supplier request approved');
    return true;
  } catch (error) {
    console.error('Error approving supplier request:', error);
    toast.error('Failed to approve supplier request');
    return false;
  }
};

// Function to reject a supplier request
export const rejectSupplierRequest = async (userId: string): Promise<boolean> => {
  try {
    // Update the profile role back to user
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'user',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Notify the user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'supplier_rejection',
        title: 'Votre demande a été refusée',
        message: 'Votre demande pour devenir fournisseur a été refusée. Veuillez contacter notre support pour plus d\'informations.'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue even if notification fails
    }

    toast.success('Supplier request rejected');
    return true;
  } catch (error) {
    console.error('Error rejecting supplier request:', error);
    toast.error('Failed to reject supplier request');
    return false;
  }
};

// Function to get all projects for admin
export const getAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id(id, display_name, email, avatar)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Map to ProjectData with defaults for missing fields
    return data.map((project: any) => {
      // Use safe access for nested properties
      const profiles = project.profiles || {};
      
      return {
        id: project.id,
        title: project.name,
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        user_id: project.owner_id,
        owner_id: project.owner_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
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
        creator_name: profiles.display_name || 'Unknown',
        creator_email: profiles.email || '',
        creator_avatar: profiles.avatar || ''
      } as ProjectData;
    });
  } catch (error) {
    console.error('Error fetching all projects:', error);
    toast.error('Failed to load projects');
    return [];
  }
};

// Function to delete a project
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw new Error(error.message);
    }

    toast.success('Project deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Failed to delete project');
    return false;
  }
};

// Function to get all users for admin
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    // Map to User type
    return data.map((profile: any) => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone_number: profile.phone_number,
      address: profile.address,
      bio: profile.bio,
      email_verified: true, // Assuming verified by backend
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      display_name: profile.display_name,
      preferences: profile.preferences ? profile.preferences : {
        language: 'fr',
        notifications: {
          email: true,
          app: true
        },
        theme: 'light'
      }
    })) as User[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    toast.error('Failed to load users');
    return [];
  }
};
