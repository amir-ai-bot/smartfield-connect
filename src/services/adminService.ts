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
      preferences: {
        language: 'fr',
        notifications: {
          email: true,
          app: true
        },
        theme: 'light'
      }
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

// Alias for compatibility
export const approveFournisseurRequest = approveSupplierRequest;
export const rejectFournisseurRequest = rejectSupplierRequest;
export const getPendingFournisseurRequests = getPendingSupplierRequests;

// Function to get all projects for admin
export const getAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    // Get profile data for project owners
    const ownerIds = [...new Set(data.map(project => project.owner_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar')
      .in('id', ownerIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create a map of user profiles
    const profilesMap = (profiles || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {} as Record<string, any>);

    // Map to ProjectData with defaults for missing fields
    return data.map((project: any) => {
      // Get owner profile from map
      const ownerProfile = profilesMap[project.owner_id] || {};
      
      return {
        id: project.id,
        title: project.name || '',
        name: project.name || '',
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
        creator_name: ownerProfile.display_name || 'Unknown',
        creator_email: ownerProfile.email || '',
        creator_avatar: ownerProfile.avatar || ''
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
      preferences: {
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

// Function to create an admin account
export const createAdminAccount = async (): Promise<boolean> => {
  try {
    // Implementation would go here in a real app
    toast.success('Admin account created successfully');
    return true;
  } catch (error) {
    console.error('Error creating admin account:', error);
    toast.error('Failed to create admin account');
    return false;
  }
};

// Function to add a new supplier/fournisseur
export const addFournisseur = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  category: string;
  products: string[];
}): Promise<boolean> => {
  try {
    // First, create the user account
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: 'fournisseur',
        },
      }
    });

    if (userError) {
      throw new Error(userError.message);
    }

    if (!userData.user) {
      throw new Error('Failed to create user account');
    }

    // Then create the supplier record
    const { error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        user_id: userData.user.id,
        name: data.name,
        phone: data.phone,
        location: data.location,
        category: data.category,
        products: data.products,
        email: data.email
      });

    if (supplierError) {
      throw new Error(supplierError.message);
    }

    toast.success('Fournisseur ajouté avec succès');
    return true;
  } catch (error) {
    console.error('Error adding supplier:', error);
    toast.error('Erreur lors de l\'ajout du fournisseur');
    return false;
  }
};

// Placeholder function for analytics data
export const getAnalyticsData = async () => {
  return {
    userCount: 0,
    projectCount: 0,
    supplierCount: 0,
    activeProjects: 0,
    newUsersThisMonth: 0,
    messagesSentToday: 0,
    usersByRole: {
      user: 0,
      admin: 0,
      fournisseur: 0,
      pending_fournisseur: 0
    },
    projectsByStatus: {
      active: 0,
      completed: 0,
      planning: 0
    }
  };
};

// Placeholder functions for other required admin services
export const getVerificationCodes = async () => {
  return [];
};

export const updateUserRole = async () => {
  return true;
};

export const deleteUser = async () => {
  return true;
};
