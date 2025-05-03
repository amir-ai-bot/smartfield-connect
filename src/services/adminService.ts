import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Profile, ProjectData, UserPreferences } from '@/types/auth';
import { timeAgo } from '@/utils/dateUtils';
import { Json } from '@/integrations/supabase/types';

// Interface for verification codes
export interface VerificationCode {
  id: string;
  user_id: string;
  email: string;
  code: string;
  type: string;
  created_at: string;
  expires_at: string;
  used: boolean;
}

// Analytics interface
export interface Analytics {
  userCount: number;
  projectCount: number;
  supplierCount: number;
  activeProjects: number;
  newUsersThisMonth: number;
  messagesSentToday: number;
  usersByRole: {
    user: number;
    admin: number;
    fournisseur: number;
    pending_fournisseur: number;
  };
  projectsByStatus: {
    active: number;
    completed: number;
    planning: number;
  };
  registrationsByMonth: { [key: string]: number };
}

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Map profile data to User type
    return data.map((profile) => {
      // Process preferences
      const userPreferences = processPreferences(profile.preferences);

      return {
        id: profile.id || '',
        email: profile.email || '',
        name: profile.display_name || '',
        role: (profile.role as User['role']) || 'user',
        avatar: profile.avatar || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        bio: profile.bio || '',
        email_verified: true, // Default since we don't have this info
        created_at: profile.created_at || '',
        updated_at: profile.updated_at || '',
        display_name: profile.display_name || '',
        preferences: userPreferences
      };
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    toast.error('Erreur lors de la récupération des utilisateurs');
    return [];
  }
};

// Helper function to process preferences
const processPreferences = (preferences: any): UserPreferences => {
  // Default preferences
  const defaultPreferences: UserPreferences = {
    language: 'fr',
    notifications: {
      email: true,
      app: true
    },
    theme: 'light'
  };
  
  if (!preferences) return defaultPreferences;
  
  try {
    // If it's a string, try to parse it
    if (typeof preferences === 'string') {
      try {
        const parsed = JSON.parse(preferences);
        return {
          language: parsed.language || defaultPreferences.language,
          notifications: {
            email: parsed.notifications?.email ?? defaultPreferences.notifications.email,
            app: parsed.notifications?.app ?? defaultPreferences.notifications.app
          },
          theme: parsed.theme || defaultPreferences.theme
        };
      } catch (e) {
        return defaultPreferences;
      }
    }
    
    // If it's already an object
    return {
      language: (preferences.language as any) || defaultPreferences.language,
      notifications: {
        email: preferences.notifications?.email ?? defaultPreferences.notifications.email,
        app: preferences.notifications?.app ?? defaultPreferences.notifications.app
      },
      theme: (preferences.theme as any) || defaultPreferences.theme
    };
  } catch (error) {
    return defaultPreferences;
  }
};

// Get verification codes (custom function for this example)
export const getVerificationCodes = async (): Promise<VerificationCode[]> => {
  try {
    // This function assumes there's a verification_codes table
    // Mocking a response since we don't have this table
    return [
      {
        id: '1',
        user_id: 'mock-user-1',
        email: 'test@example.com',
        code: '123456',
        type: 'email',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        used: false
      }
    ];
  } catch (error) {
    console.error('Error getting verification codes:', error);
    return [];
  }
};

// Alias for backward compatibility
export const getAllVerificationCodes = getVerificationCodes;

// Get analytics data (mock for this example)
export const getAnalyticsData = async (): Promise<Analytics> => {
  // Mock analytics data
  return {
    userCount: 10,
    projectCount: 5,
    supplierCount: 8,
    activeProjects: 4,
    newUsersThisMonth: 3,
    messagesSentToday: 15,
    usersByRole: {
      user: 7,
      admin: 1,
      fournisseur: 2,
      pending_fournisseur: 0
    },
    projectsByStatus: {
      active: 4,
      completed: 1,
      planning: 0
    },
    registrationsByMonth: {
      '2023-01': 10,
      '2023-02': 15,
      '2023-03': 20
    }
  };
};

// Get all projects with user data
export const getAllProjects = async (): Promise<ProjectData[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:profiles!projects_owner_id_fkey (id, display_name, email, avatar)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Safely handle potential null values in related profile data
    return data.map(project => {
      // Get profile info safely, ensuring it's an object
      const profileData = project.profiles && typeof project.profiles === 'object' ? project.profiles : {};
      
      // Convert to ProjectData format
      return {
        id: project.id,
        title: project.name || '',
        description: project.description || '',
        status: project.status as 'planning' | 'active' | 'completed',
        user_id: project.owner_id || '',
        owner_id: project.owner_id || '',
        created_at: project.created_at,
        updated_at: project.updated_at,
        // Safely add extra fields
        crop: project.crop_type || '',
        location: project.location || '',
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        progress: project.progress || 0,
        isPublic: project.is_public || false,
        // Add user information safely
        creator_name: profileData.display_name || '',
        creator_email: profileData.email || '',
        creator_avatar: profileData.avatar || '',
        timeAgo: timeAgo(project.created_at || '')
      };
    });
  } catch (error) {
    console.error('Error getting all projects:', error);
    toast.error('Erreur lors de la récupération des projets');
    return [];
  }
};

// Get pending supplier requests
export const getPendingFournisseurRequests = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'pending_fournisseur')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Map profile data to User type with default values
    return data.map((profile) => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.display_name || '',
      role: (profile.role as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur') || 'user',
      avatar: profile.avatar || '',
      phone_number: profile.phone_number || '',
      address: profile.address || '',
      bio: profile.bio || '',
      email_verified: true, // Default since we don't have this info
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      display_name: profile.display_name || '',
      preferences: profile.preferences || {
        language: 'fr',
        notifications: { email: true, app: true },
        theme: 'light'
      }
    }));
  } catch (error) {
    console.error('Error getting pending fournisseur requests:', error);
    toast.error('Erreur lors de la récupération des demandes de fournisseurs');
    return [];
  }
};

// Add a new supplier (fournisseur)
export const addFournisseur = async (supplierData: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .insert(supplierData);
    
    if (error) {
      throw error;
    }
    
    toast.success('Fournisseur ajouté avec succès');
    return true;
  } catch (error) {
    console.error('Error adding supplier:', error);
    toast.error('Erreur lors de l\'ajout du fournisseur');
    return false;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    toast.success(`Rôle mis à jour avec succès`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Erreur lors de la mise à jour du rôle');
    return false;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Call admin function to delete user
    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: userId }
    });
    
    if (error) {
      throw error;
    }
    
    toast.success('Utilisateur supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Erreur lors de la suppression de l\'utilisateur');
    return false;
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
    
    toast.success('Projet supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Erreur lors de la suppression du projet');
    return false;
  }
};

// Approve fournisseur request
export const approveFournisseurRequest = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: 'fournisseur',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Demande de fournisseur approuvée');
    return true;
  } catch (error) {
    console.error('Error approving fournisseur request:', error);
    toast.error('Erreur lors de l\'approbation de la demande');
    return false;
  }
};

// Reject fournisseur request
export const rejectFournisseurRequest = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: 'user',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    toast.success('Demande de fournisseur rejetée');
    return true;
  } catch (error) {
    console.error('Error rejecting fournisseur request:', error);
    toast.error('Erreur lors du rejet de la demande');
    return false;
  }
};

// Create admin account
export const createAdminAccount = async (
  name: string,
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'admin'
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    toast.success('Compte administrateur créé avec succès');
    return true;
  } catch (error) {
    console.error('Error creating admin account:', error);
    toast.error('Erreur lors de la création du compte administrateur');
    return false;
  }
};
