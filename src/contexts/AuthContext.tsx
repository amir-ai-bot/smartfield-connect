
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthState, User } from '@/types/auth';
import * as authService from '@/services/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Create context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check for existing user session on mount and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Get user profile data from profiles table
            const profile = await authService.fetchUserProfile(session.user.id);
            
            if (profile) {
              setState({
                user: profile,
                isAuthenticated: true,
                isLoading: false,
              });
              
              localStorage.setItem('agrismart_user', JSON.stringify(profile));
              
              if (event === 'SIGNED_IN') {
                toast.success('Connexion réussie');
              }
            } else {
              console.error('Profile not found after sign in');
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('agrismart_user');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          toast.success('Déconnexion réussie');
        }
      }
    );

    // THEN check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get user profile data from profiles table
          const profile = await authService.fetchUserProfile(session.user.id);
          
          if (profile) {
            setState({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
            });
            
            localStorage.setItem('agrismart_user', JSON.stringify(profile));
          } else {
            // No profile found, user might be new
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // No active session
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        setState({ ...initialState, isLoading: false });
      }
    };

    initAuth();

    // Cleanup the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.login(email, password);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error(error instanceof Error ? error.message : 'Erreur de connexion');
      throw error;
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.signup(name, email, password);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Inscription réussie');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error(error instanceof Error ? error.message : 'Erreur d\'inscription');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!state.user) throw new Error('Not authenticated');
      
      const updatedUser = await authService.updateUserProfile(state.user.id, updates);
      
      setState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      toast.success('Profil mis à jour avec succès');
      return updatedUser;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  // Check if user is an admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    isAdmin,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
