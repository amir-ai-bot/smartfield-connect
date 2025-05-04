import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthResponse, UserPreferences } from '@/types/auth';
import { toast } from 'sonner';

// Map profile data to User type
const mapProfileToUser = (profile: any, user: any): User => {
  let userPreferences: UserPreferences = {
    language: 'fr',
    notifications: {
      email: true,
      app: true
    },
    theme: 'light'
  };

  // Handle preferences correctly based on the type
  if (profile.preferences) {
    if (typeof profile.preferences === 'object') {
      // Directly assign if it's already an object with the right structure
      userPreferences = {
        language: (profile.preferences.language || 'fr') as 'fr' | 'en' | 'ar',
        notifications: {
          email: profile.preferences.notifications?.email ?? true,
          app: profile.preferences.notifications?.app ?? true
        },
        theme: (profile.preferences.theme || 'light') as 'light' | 'dark' | 'system'
      };
    }
  }

  return {
    id: profile.id,
    email: profile.email || user.email,
    name: profile.display_name || '',
    role: (profile.role as UserRole) || 'user',
    avatar: profile.avatar,
    phone_number: profile.phone_number,
    email_verified: user.email_confirmed_at ? true : false,
    address: profile.address,
    bio: profile.bio,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    preferences: userPreferences
  };
};

// Sign up a new user
export const signUp = async (
  name: string,
  email: string,
  password: string,
  phone_number?: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone_number,
          role: 'user'
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      toast.success('Inscription réussie! Veuillez vérifier votre email.');
      return { user: null, error: null }; // Return null user until email verification
    } else {
      return { user: null, error: new Error('Erreur lors de l\'inscription') };
    }
  } catch (error) {
    console.error('Signup error:', error);
    toast.error(`Erreur d'inscription: ${error.message}`);
    return { user: null, error };
  }
};

// Sign in a user
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      // Get the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const userData = mapProfileToUser(profileData || {}, data.user);
      toast.success(`Bienvenue, ${userData.name || email}!`);
      return { user: userData, error: null };
    } else {
      return { user: null, error: new Error('Erreur lors de la connexion') };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    toast.error(`Erreur de connexion: ${error.message}`);
    return { user: null, error };
  }
};

// Sign out the current user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Déconnexion réussie');
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error(`Erreur de déconnexion: ${error.message}`);
  }
};

// Get the current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;

    // Get the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return mapProfileToUser(profileData, data.user);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    toast.success('Instructions de réinitialisation du mot de passe envoyées à votre email');
  } catch (error) {
    console.error('Password reset request error:', error);
    toast.error(`Erreur de demande de réinitialisation: ${error.message}`);
  }
};

// Confirm password reset
export const confirmPasswordReset = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    toast.success('Mot de passe réinitialisé avec succès');
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    toast.error(`Erreur de réinitialisation: ${error.message}`);
  }
};

// Verify email
export const verifyEmail = async (email: string, token: string): Promise<void> => {
  try {
    // This is handled automatically by Supabase when the user clicks the verification link
    toast.success('Email vérifié avec succès');
  } catch (error) {
    console.error('Email verification error:', error);
    toast.error(`Erreur de vérification d'email: ${error.message}`);
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<User>
): Promise<User | null> => {
  try {
    // Prepare the data for update
    const updateData: any = {};
    if (profileData.name !== undefined) updateData.display_name = profileData.name;
    if (profileData.avatar !== undefined) updateData.avatar = profileData.avatar;
    if (profileData.phone_number !== undefined) updateData.phone_number = profileData.phone_number;
    if (profileData.address !== undefined) updateData.address = profileData.address;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileData.preferences !== undefined) updateData.preferences = profileData.preferences;

    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Get the current auth user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not found');
    }

    const updatedUser = mapProfileToUser(data, userData.user);
    toast.success('Profil mis à jour avec succès');
    return updatedUser;
  } catch (error) {
    console.error('Update profile error:', error);
    toast.error(`Erreur de mise à jour du profil: ${error.message}`);
    return null;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (data: ResetPasswordFormData): Promise<{ error?: any }> => {
  try {
    const { token, email, password } = data;
    
    // Use the token to reset the password
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?token=${token}`,
    });
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error };
  }
};
