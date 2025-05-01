import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, UserRole, UserPreferences } from '@/types/auth';

// Authentication functions
export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Email ou mot de passe incorrect');
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de la connexion');
      }
      throw error;
    }

    if (!data.user) {
      toast.error('Utilisateur non trouvé');
      return null;
    }

    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Handle profile data mapping and preferences
    let preferences: UserPreferences = {
      language: 'fr',
      notifications: { email: true, app: true },
      theme: 'light'
    };

    if (profileData?.preferences) {
      const prefs = profileData.preferences as any;
      preferences = {
        language: (prefs.language || 'fr') as 'fr' | 'en' | 'ar',
        notifications: {
          email: prefs.notifications?.email !== undefined ? Boolean(prefs.notifications.email) : true,
          app: prefs.notifications?.app !== undefined ? Boolean(prefs.notifications.app) : true
        },
        theme: (prefs.theme || 'light') as 'light' | 'dark' | 'system'
      };
    }

    // Combine auth user with profile data
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: profileData?.display_name || data.user.user_metadata?.name || '',
      role: (profileData?.role || 'user') as UserRole,
      avatar: profileData?.avatar || undefined,
      phone_number: profileData?.phone_number || undefined,
      email_verified: !!data.user.email_confirmed_at,
      address: profileData?.address || undefined,
      bio: profileData?.bio || undefined,
      preferences
    };

    toast.success('Connexion réussie!');
    return user;
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
};

export const signUp = async (
  name: string,
  email: string,
  password: string,
  phone_number?: string
): Promise<User | null> => {
  try {
    // First check if email already exists
    const { data: existingUsers, error: emailCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (emailCheckError) {
      console.error('Error checking existing email:', emailCheckError);
    }
    
    if (existingUsers) {
      toast.error('Cette adresse email est déjà utilisée');
      return null;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          phone_number: phone_number || '',
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Cette adresse email est déjà utilisée');
      } else {
        toast.error(error.message || 'Une erreur est survenue lors de l\'inscription');
      }
      throw error;
    }

    if (!data.user) {
      toast.error('Erreur lors de la création du compte');
      return null;
    }

    // Create a profile for the user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: email.toLowerCase(),
        name: name,
        phone_number: phone_number || '',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: name,
      role: 'user',
      phone_number: phone_number,
      email_verified: false
    };

    toast.success('Compte créé avec succès!');
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    return null;
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    toast.success('Déconnexion réussie');
    return true;
  } catch (error: any) {
    toast.error(error.message || 'Une erreur est survenue lors de la déconnexion');
    console.error('Sign out error:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      return null;
    }

    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Handle profile data mapping and preferences
    let preferences: UserPreferences = {
      language: 'fr',
      notifications: { email: true, app: true },
      theme: 'light'
    };

    if (profileData?.preferences) {
      const prefs = profileData.preferences as any;
      preferences = {
        language: (prefs.language || 'fr') as 'fr' | 'en' | 'ar',
        notifications: {
          email: prefs.notifications?.email !== undefined ? Boolean(prefs.notifications.email) : true,
          app: prefs.notifications?.app !== undefined ? Boolean(prefs.notifications.app) : true
        },
        theme: (prefs.theme || 'light') as 'light' | 'dark' | 'system'
      };
    }

    // Combine auth user with profile data
    const user: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: profileData?.display_name || authUser.user_metadata?.name || '',
      role: (profileData?.role || 'user') as UserRole,
      avatar: profileData?.avatar || undefined,
      phone_number: profileData?.phone_number || undefined,
      email_verified: !!authUser.email_confirmed_at,
      address: profileData?.address || undefined,
      bio: profileData?.bio || undefined,
      preferences
    };

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone_number: updates.phone_number,
        address: updates.address,
        bio: updates.bio,
        avatar: updates.avatar,
        updated_at: new Date().toISOString(),
        ...(updates.preferences && { preferences: updates.preferences })
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
      throw error;
    }

    // Get updated user data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching updated profile:', profileError);
      toast.error('Erreur lors de la récupération du profil mis à jour');
      throw profileError;
    }

    // Get auth user data
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('Error fetching auth user:', authError);
      toast.error('Erreur lors de la récupération des données d\'authentification');
      throw authError || new Error('User not found');
    }

    // Handle profile data mapping and preferences
    let preferences: UserPreferences = {
      language: 'fr',
      notifications: { email: true, app: true },
      theme: 'light'
    };

    if (profileData?.preferences) {
      const prefs = profileData.preferences as any;
      preferences = {
        language: (prefs.language || 'fr') as 'fr' | 'en' | 'ar',
        notifications: {
          email: prefs.notifications?.email !== undefined ? Boolean(prefs.notifications.email) : true,
          app: prefs.notifications?.app !== undefined ? Boolean(prefs.notifications.app) : true
        },
        theme: (prefs.theme || 'light') as 'light' | 'dark' | 'system'
      };
    }

    // Combine auth user with updated profile data
    const updatedUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: profileData?.display_name || authUser.user_metadata?.name || '',
      role: (profileData?.role || 'user') as UserRole,
      avatar: profileData?.avatar || undefined,
      phone_number: profileData?.phone_number || undefined,
      email_verified: !!authUser.email_confirmed_at,
      address: profileData?.address || undefined,
      bio: profileData?.bio || undefined,
      preferences
    };

    toast.success('Profil mis à jour avec succès');
    return updatedUser;
  } catch (error) {
    console.error('Update user profile error:', error);
    return null;
  }
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Reset password error:', error);
      toast.error('Erreur lors de la demande de réinitialisation');
      throw error;
    }
    
    toast.success('Instructions de réinitialisation envoyées à votre email');
    return true;
  } catch (error) {
    console.error('Request password reset error:', error);
    return false;
  }
};

export const confirmPasswordReset = async (code: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: 'recovery',
    });
    
    if (error) {
      console.error('Verify OTP error:', error);
      toast.error('Code de réinitialisation invalide');
      throw error;
    }
    
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    
    if (updateError) {
      console.error('Update password error:', updateError);
      toast.error('Erreur lors de la mise à jour du mot de passe');
      throw updateError;
    }
    
    toast.success('Mot de passe réinitialisé avec succès');
    return true;
  } catch (error) {
    console.error('Confirm reset error:', error);
    return false;
  }
};

export const verifyEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    
    if (error) {
      console.error('Email verification error:', error);
      toast.error('Erreur lors de la vérification de l\'email');
      throw error;
    }
    
    toast.success('Email vérifié avec succès');
    return true;
  } catch (error) {
    console.error('Email verification error:', error);
    return false;
  }
};

export const becomeFournisseur = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'pending_fournisseur',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error becoming supplier:', error);
      toast.error('Erreur lors de la demande pour devenir fournisseur');
      throw error;
    }
    
    toast.success('Demande pour devenir fournisseur envoyée');
    return true;
  } catch (error) {
    console.error('Error becoming supplier:', error);
    return false;
  }
};

// Backward compatibility aliases
export const login = signIn;
export const logout = signOut;
export const signup = signUp;
export const updateProfile = updateUserProfile;
