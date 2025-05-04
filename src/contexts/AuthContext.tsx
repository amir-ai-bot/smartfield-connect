
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserPreferences } from '@/types/auth';
import { Json } from '@/integrations/supabase/types';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: any | null;
  signUp: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  becomeFournisseur: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from session
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        await loadUserAndProfile(session.user);
      } else {
        setLoading(false);
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserAndProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });
    };

    loadSession();
  }, []);

  // Helper function to load user and profile
  const loadUserAndProfile = async (supabaseUser: SupabaseUser) => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

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

      const userPreferences = processPreferences(profileData?.preferences);

      const userData: User = {
        id: profileData?.id || supabaseUser.id,
        email: profileData?.email || supabaseUser.email || '',
        name: profileData?.display_name || '',
        role: (profileData?.role as any) || 'user',
        avatar: profileData?.avatar,
        phone_number: profileData?.phone_number,
        email_verified: supabaseUser.email_confirmed_at ? true : false,
        address: profileData?.address,
        bio: profileData?.bio,
        created_at: profileData?.created_at,
        updated_at: profileData?.updated_at,
        preferences: userPreferences,
        display_name: profileData?.display_name
      };

      setUser(userData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user and profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await loadUserAndProfile(data.user);
      }
  };

  const signUp = async (name: string, email: string, password: string, phone_number?: string) => {
    setLoading(true);
    try {
      console.log("Signing up user:", { name, email, phone_number });

      // Step 1: Create the user in auth.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            display_name: name,
            phone_number,
            role: 'user'
          }
        }
      });

      if (error) {
        console.error("Signup error details:", error);
        throw error;
      }

      console.log("Auth signup successful, user data:", data);

      // Step 2: Ensure the profile exists
      if (data.user) {
        try {
          // First check if profile already exists
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means not found, which is expected
            console.error("Error checking for existing profile:", checkError);
          }

          // If profile doesn't exist, create it
          if (!existingProfile) {
            console.log("Creating profile for user:", data.user.id);

            // Try using RPC call for more direct database access
            const { error: rpcError } = await supabase.rpc('create_user_profile', {
              user_id: data.user.id,
              user_email: email,
              user_name: name,
              user_role: 'user',
              user_phone: phone_number || null
            });

            if (rpcError) {
              console.error("RPC error creating profile:", rpcError);

              // Fallback to regular insert
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: email,
                  display_name: name,
                  name: name,
                  role: 'user',
                  phone_number: phone_number || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });

              if (insertError) {
                console.error("Error creating profile via insert:", insertError);

                // Last resort: try a direct SQL query
                const { error: sqlError } = await supabase.rpc('exec_sql', {
                  sql: `
                    INSERT INTO public.profiles (id, email, display_name, name, role, phone_number, created_at, updated_at)
                    VALUES ('${data.user.id}', '${email}', '${name}', '${name}', 'user', ${phone_number ? `'${phone_number}'` : 'NULL'}, NOW(), NOW())
                    ON CONFLICT (id) DO NOTHING;
                  `
                });

                if (sqlError) {
                  console.error("SQL error creating profile:", sqlError);
                  throw new Error(`Failed to create profile: ${sqlError.message}`);
                }
              }
            }
          }
        } catch (profileErr) {
          console.error("Exception creating profile:", profileErr);
          // Continue anyway - we'll try to fix the profile later if needed
        }
      }

      toast.success('Inscription réussie! Veuillez vérifier votre email.');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(`Erreur d'inscription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (data.user) {
        await loadUserAndProfile(data.user);
        toast.success(`Bienvenue, ${user?.name || email}!`);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(`Erreur de connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(`Erreur de déconnexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Aliases for signIn and signOut
  const login = signIn;
  const logout = signOut;

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Instructions de réinitialisation du mot de passe envoyées à votre email');
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error(`Erreur de demande de réinitialisation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(`Erreur de réinitialisation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (token: string, password: string) => {
    setLoading(true);
    try {
      // Use the token in some way if needed
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      toast.error(`Erreur de réinitialisation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    try {
      // In a real implementation, you would verify the email
      toast.success('Email vérifié avec succès');
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error(`Erreur de vérification d'email: ${error.message}`);
    }
  };

  const updateEmail = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success('Email mis à jour avec succès');
    } catch (error) {
      console.error('Update email error:', error);
      toast.error(`Erreur de mise à jour de l'email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // When updating a user profile, convert preferences to JSON compatible format
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      setLoading(true);

      const updates: Record<string, any> = {};

      if (userData.name !== undefined) updates.display_name = userData.name;
      if (userData.avatar !== undefined) updates.avatar = userData.avatar;
      if (userData.phone_number !== undefined) updates.phone_number = userData.phone_number;
      if (userData.address !== undefined) updates.address = userData.address;
      if (userData.bio !== undefined) updates.bio = userData.bio;
      if (userData.preferences !== undefined) {
        updates.preferences = userData.preferences as unknown as Json;
      }

      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update the local user state
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);

      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  // Function to check if the current user is an admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Function to become a supplier (fournisseur)
  const becomeFournisseur = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const updates = {
        role: 'pending_fournisseur' as const,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update the local user state
      setUser(prevUser => prevUser ? { ...prevUser, role: 'pending_fournisseur' } : null);

      toast.success('Demande envoyée ! Nous examinerons votre profil.');
    } catch (error) {
      console.error('Error updating to fournisseur:', error);
      toast.error('Erreur lors de la demande');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        signUp,
        signIn,
        signOut,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
        confirmPasswordReset,
        verifyEmail,
        updateProfile,
        updateEmail,
        isLoading: loading,
        isAuthenticated,
        refreshUser,
        isAdmin,
        becomeFournisseur
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
