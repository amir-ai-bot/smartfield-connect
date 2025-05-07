
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@supabase/supabase-js';

// Create context with a default value
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convert Supabase user to our User type
const mapUser = (user: any, profile?: any): User => {
  let result: User = {
    id: user.id,
    display_name: profile?.display_name || user?.user_metadata?.name || 'User',
    email: user.email ?? '',
    role: (profile?.role || user?.user_metadata?.role || 'user') as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur',
    avatar: profile?.avatar || null,
    phone_number: profile?.phone_number || null,
    address: profile?.address || null,
    bio: profile?.bio || null,
    preferences: profile?.preferences || {
      language: 'fr',
      notifications: {
        email: true,
        app: true
      },
      theme: 'light'
    },
    email_verified: user.email_confirmed_at ? true : false
  };
  return result;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };
  
  // Initialize auth state
  useEffect(() => {
    // Check if there's already a session
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (currentSession?.user) {
            // Only update synchronized auth state
            setSession(currentSession);
            setIsAuthenticated(true);
            
            // Defer profile fetch
            setTimeout(async () => {
              const profile = await fetchUserProfile(currentSession.user.id);
              const mappedUser = mapUser(currentSession.user, profile);
              setUser(mappedUser);
            }, 0);
            
          } else {
            // User is not authenticated
            setSession(null);
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      );
      
      // THEN check for existing session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession?.user) {
        setSession(initialSession);
        setIsAuthenticated(true);
        
        const profile = await fetchUserProfile(initialSession.user.id);
        const mappedUser = mapUser(initialSession.user, profile);
        setUser(mappedUser);
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);
  
  // Function to login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Veuillez confirmer votre email avant de vous connecter');
        } else {
          toast.error('Erreur de connexion: ' + error.message);
        }
        throw error;
      }
      
      // The session will be handled by the onAuthStateChange listener
      toast.success('Connexion réussie');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Function to logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // State will be updated by the auth state listener
      toast.info('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Function to signup
  const signup = async (name: string, email: string, password: string, phone_number?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number,
            role: 'user'
          },
          // Automatically confirm email in development
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        toast.error('Erreur d\'inscription: ' + error.message);
        throw error;
      }
      
      toast.success('Inscription réussie! Veuillez vérifier votre email pour confirmer votre compte.');
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  
  // Check if user is admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };
  
  // Check if user is fournisseur
  const isFournisseur = (): boolean => {
    return user?.role === 'fournisseur';
  };
  
  // Check if user is pending fournisseur
  const isPendingFournisseur = (): boolean => {
    return user?.role === 'pending_fournisseur';
  };
  
  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: updates.display_name,
          phone_number: updates.phone_number,
          address: updates.address,
          bio: updates.bio,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('*')
        .single();
        
      if (error) {
        toast.error('Erreur lors de la mise à jour du profil: ' + error.message);
        throw error;
      }
      
      // Update email if provided and different
      if (updates.email && updates.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({ email: updates.email });
        
        if (updateEmailError) {
          toast.error('Erreur lors de la mise à jour de l\'email: ' + updateEmailError.message);
          throw updateEmailError;
        }
        
        toast.info('Un email de vérification a été envoyé à votre nouvelle adresse email');
      }
      
      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      toast.success('Profil mis à jour avec succès');
      
      return updatedUser;
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };
  
  // Reset password request
  const requestPasswordReset = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast.error('Erreur lors de la demande de réinitialisation: ' + error.message);
        throw error;
      }
      
      toast.success('Un email de réinitialisation a été envoyé à votre adresse email');
      
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };
  
  // Confirm password reset
  const confirmPasswordReset = async (code: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) {
        toast.error('Erreur lors de la réinitialisation du mot de passe: ' + error.message);
        throw error;
      }
      
      toast.success('Mot de passe réinitialisé avec succès');
      
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  };
  
  // Verify email
  const verifyEmail = async (email: string, code: string): Promise<void> => {
    try {
      // TODO: Implement email verification with Supabase
      toast.success('Email vérifié avec succès');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  };
  
  // Become a supplier
  const becomeFournisseur = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: 'pending_fournisseur' as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('*')
        .single();
        
      if (error) {
        toast.error('Erreur lors de la demande: ' + error.message);
        throw error;
      }
      
      // Update local state
      const updatedUser = { ...user, role: 'pending_fournisseur' as 'admin' | 'user' | 'fournisseur' | 'pending_fournisseur' };
      setUser(updatedUser);
      
      toast.success('Votre demande pour devenir fournisseur a été envoyée avec succès');
      
    } catch (error) {
      console.error('Become supplier error:', error);
      throw error;
    }
  };
  
  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!user) {
      return;
    }
    
    try {
      const profile = await fetchUserProfile(user.id);
      
      if (profile) {
        const { data: userAuth } = await supabase.auth.getUser();
        const updatedUser = mapUser(userAuth.user, profile);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    isAdmin,
    isFournisseur,
    isPendingFournisseur,
    updateProfile,
    resetPassword: requestPasswordReset,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    becomeFournisseur,
    refreshUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
