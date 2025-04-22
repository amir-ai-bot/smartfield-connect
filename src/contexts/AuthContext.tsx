import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, Profile } from '@/types/supabase';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean; // Aliased for backward compatibility
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isFournisseur: () => boolean;
  isPendingFournisseur: () => boolean;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  becomeFournisseur: () => Promise<void>;
  
  // Aliases for backward compatibility
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from session
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        setSession(session);
        
        if (session?.user) {
          await loadUserAndProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error loading user session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await loadUserAndProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile data
  const loadUserAndProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        throw error;
      }

      // Ensure role is one of the allowed types
      const safeRole = validateRole(data?.role);
      
      // Process preferences to ensure they match the expected type
      const safePreferences = processPreferences(data?.preferences);

      // Create the profile object with safe types
      const profileData: Profile = {
        ...data,
        role: safeRole,
        preferences: safePreferences
      };

      // Combine Supabase user with profile data
      const enhancedUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: data?.name || supabaseUser.user_metadata?.name || '',
        role: safeRole,
        avatar: data?.avatar || '',
        phone_number: data?.phone_number || '',
        email_verified: !!supabaseUser.email_confirmed_at,
        address: data?.address || '',
        bio: data?.bio || '',
        preferences: safePreferences
      };

      setUser(enhancedUser);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Use basic Supabase user if profile fetch fails
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || '',
        role: 'user', // Default to user role
        avatar: '',
        email_verified: !!supabaseUser.email_confirmed_at
      });
      setProfile(null);
    }
  };

  // Helper to ensure role is one of the allowed values
  const validateRole = (role: any): 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur' => {
    const validRoles = ['admin', 'user', 'fournisseur', 'pending_fournisseur'];
    return validRoles.includes(role) ? (role as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur') : 'user';
  };

  // Helper to process preferences into the expected format
  const processPreferences = (prefs: any) => {
    if (!prefs) return {
      language: 'fr',
      notifications: { email: true, app: true },
      theme: 'light'
    };
    
    if (typeof prefs === 'object') {
      return {
        language: ['fr', 'en', 'ar'].includes(prefs.language) ? prefs.language : 'fr',
        notifications: {
          email: Boolean(prefs.notifications?.email),
          app: Boolean(prefs.notifications?.app)
        },
        theme: ['light', 'dark', 'system'].includes(prefs.theme) ? prefs.theme : 'light'
      };
    }
    
    return {
      language: 'fr',
      notifications: { email: true, app: true },
      theme: 'light'
    };
  };

  // Sign up a new user
  const signUp = async (name: string, email: string, password: string, phone_number?: string) => {
    setLoading(true);
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
        return;
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

      // If signUp is successful, show a toast
      toast.success('Compte créé avec succès!');
    } catch (error: any) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign in a user
  const signIn = async (email: string, password: string) => {
    setLoading(true);
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

      toast.success('Connexion réussie!');
    } catch (error: any) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out a user
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de la déconnexion');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
      setProfile(null);
      setUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) throw new Error('User not authenticated');
    
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
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state with new values
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      toast.success('Profil mis à jour avec succès');
      return updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Instructions de réinitialisation envoyées à votre email');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Erreur lors de la demande de réinitialisation');
      throw error;
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (code: string, password: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'recovery',
      });
      
      if (error) throw error;
      
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      
      if (updateError) throw updateError;
      
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error: any) {
      console.error('Confirm reset error:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (email: string, code: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      
      if (error) throw error;
      
      toast.success('Email vérifié avec succès');
      
      // Refresh user data to update email_verified status
      if (user) {
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        if (refreshedUser) {
          await loadUserAndProfile(refreshedUser);
        }
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast.error('Erreur lors de la vérification de l\'email');
      throw error;
    }
  };

  // Become a supplier
  const becomeFournisseur = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'pending_fournisseur',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      const updatedUser: User = { 
        ...user, 
        role: 'pending_fournisseur' 
      };
      setUser(updatedUser);
      
      toast.success('Demande pour devenir fournisseur envoyée');
    } catch (error) {
      console.error('Error becoming supplier:', error);
      toast.error('Erreur lors de la demande pour devenir fournisseur');
      throw error;
    }
  };

  // Role check helpers
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isFournisseur = () => {
    return user?.role === 'fournisseur';
  };

  const isPendingFournisseur = () => {
    return user?.role === 'pending_fournisseur';
  };

  // Derived isAuthenticated value
  const isAuthenticated = !!user;

  // Backward compatibility aliases
  const login = signIn;
  const logout = signOut;
  const signup = signUp;

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    isLoading: loading, // Alias for backward compatibility
    isAuthenticated,
    isAdmin,
    isFournisseur,
    isPendingFournisseur,
    updateProfile,
    requestPasswordReset,
    confirmPasswordReset,
    verifyEmail,
    becomeFournisseur,
    
    // Aliases for backward compatibility
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
