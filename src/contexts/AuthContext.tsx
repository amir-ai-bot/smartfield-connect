import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Profile, Role, UserPreferences, AuthContextProps } from '@/types/auth';

// Create the context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          if (currentSession?.user) {
            await loadUserAndProfile(currentSession.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (mounted) {
        setSession(newSession);
        if (newSession?.user) {
          await loadUserAndProfile(newSession.user);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: { user: newUser, session: newSession }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (newUser) {
        await loadUserAndProfile(newUser);
      }
      setSession(newSession);
      
      return;
    } catch (error: any) {
      console.error('Auth context login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Load user profile data with improved error handling
  const loadUserAndProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast.error('Error loading user profile. Some features may be limited.');
        
        // Use basic user data if profile fetch fails
        const basicPrefs: UserPreferences = {
          language: 'fr',
          notifications: { email: true, app: true },
          theme: 'light'
        };

        const basicUser: User = {
          ...supabaseUser,
          name: supabaseUser.user_metadata?.name || '',
          role: validateRole(supabaseUser.user_metadata?.role),
          email_verified: !!supabaseUser.email_confirmed_at,
          preferences: basicPrefs
        };
        
        setUser(() => basicUser);
        setProfile(() => null);
        return;
      }

      // Ensure role is a valid enum value
      const roleValue = profileData?.role || 'user';
      const role = validateRole(roleValue);

      // Update user metadata if role doesn't match
      if (supabaseUser.user_metadata?.role !== role) {
        await supabase.auth.updateUser({
          data: { role: role }
        });
      }

      const userPrefs = processPreferences(profileData?.preferences);

      // Create the user object with profile data
      const updatedUser: User = {
        ...supabaseUser,
        name: profileData?.name || supabaseUser.user_metadata?.name || '',
        role: role,
        avatar: profileData?.avatar,
        phone_number: profileData?.phone_number,
        email_verified: !!supabaseUser.email_confirmed_at,
        address: profileData?.address,
        bio: profileData?.bio,
        preferences: userPrefs
      };

      // Create the profile object
      const updatedProfile: Profile = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: role,
        avatar: profileData.avatar,
        phone_number: profileData.phone_number,
        email_verified: !!supabaseUser.email_confirmed_at,
        address: profileData.address,
        bio: profileData.bio,
        preferences: userPrefs,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at
      };

      setUser(() => updatedUser);
      setProfile(() => updatedProfile);
    } catch (error) {
      console.error('Error in loadUserAndProfile:', error);
      toast.error('Error loading user profile');
    }
  };

  // Helper function to validate and normalize role values
  const validateRole = (role: any): Role => {
    const validRoles: Role[] = ['admin', 'user', 'agriculteur', 'fournisseur'];
    return validRoles.includes(role) ? role : 'user';
  };

  // Helper function to process and normalize user preferences
  const processPreferences = (prefs: any): UserPreferences => {
    const defaultPrefs: UserPreferences = {
      language: 'fr',
      notifications: {
        email: true,
        app: true
      },
      theme: 'light'
    };

    if (!prefs) return defaultPrefs;

    return {
      language: prefs.language || defaultPrefs.language,
      notifications: {
        email: prefs.notifications?.email ?? defaultPrefs.notifications.email,
        app: prefs.notifications?.app ?? defaultPrefs.notifications.app
      },
      theme: prefs.theme || defaultPrefs.theme
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
    
    // Add timeout for the sign-in process
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Délai de connexion dépassé')), 10000);
    });

    try {
      console.log('Attempting to sign in with email:', email);
      
      // Race between auth request and timeout
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('Supabase auth error:', error);
        toast.error('Erreur de connexion: ' + error.message);
        return;
      }

      if (!data?.user || !data?.session) {
        console.error('No user or session data returned');
        toast.error('Erreur de connexion: données utilisateur manquantes');
        return;
      }

      console.log('Sign in successful, setting session');
      setSession(data.session);
      
      console.log('Loading user profile');
      await loadUserAndProfile(data.user);
      
      toast.success('Connexion réussie!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.error('Erreur lors de la connexion: ' + (error.message || 'Erreur inconnue'));
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
  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        phone_number: updates.phone_number,
        address: updates.address,
        bio: updates.bio,
        avatar: updates.avatar,
        preferences: updates.preferences ? JSON.stringify(updates.preferences) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Reload user and profile data
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await loadUserAndProfile(currentUser);
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
        role: 'pending_supplier' as Role
      };
      setUser(() => updatedUser);
      
      toast.success('Demande pour devenir fournisseur envoyée');
    } catch (error) {
      console.error('Error becoming supplier:', error);
      toast.error('Erreur lors de la demande pour devenir fournisseur');
      throw error;
    }
  };

  // Role check functions
  const isAdmin = () => user?.role === 'admin';
  const isAgriculteur = () => user?.role === 'agriculteur';
  const isFournisseur = () => user?.role === 'fournisseur';

  // Derived isAuthenticated value
  const isAuthenticated = !!user && !!session;

  const value: AuthContextProps = {
    user,
    profile,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isAgriculteur,
    isFournisseur
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
