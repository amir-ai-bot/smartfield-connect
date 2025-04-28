import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, AuthState, User } from '@/types/auth';
import * as authService from '@/services/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          // Defer profile fetch to avoid auth deadlock
          setTimeout(async () => {
            try {
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
          }, 0);
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

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const profile = await authService.fetchUserProfile(session.user.id);
          
          if (profile) {
            setState({
              user: profile,
              isAuthenticated: true,
              isLoading: false,
            });
            
            localStorage.setItem('agrismart_user', JSON.stringify(profile));
          } else {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const signup = async (name: string, email: string, password: string, phone_number?: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.signup(name, email, password, phone_number);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Inscription réussie! Un code de vérification a été envoyé à votre email.');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error(error instanceof Error ? error.message : 'Erreur d\'inscription');
      throw error;
    }
  };

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

  const verifyEmail = async (email: string, code: string) => {
    try {
      await authService.verifyEmail(email, code);
      
      if (state.user) {
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user!,
            email_verified: true
          }
        }));
      }
      
      toast.success('Email vérifié avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la vérification de l\'email');
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authService.requestPasswordReset(email);
      toast.success('Un code de réinitialisation a été envoyé à votre email');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la demande de réinitialisation');
      throw error;
    }
  };

  const confirmPasswordReset = async (code: string, password: string) => {
    try {
      await authService.confirmPasswordReset(code, password);
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation du mot de passe');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    return requestPasswordReset(email);
  };

  const becomeFournisseur = async (): Promise<void> => {
    try {
      if (!state.user) throw new Error('Not authenticated');
      
      // Create a pending request instead of immediately becoming a fournisseur
      const updatedUser = await authService.updateUserProfile(state.user.id, { role: 'pending_fournisseur' });
      
      setState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      toast.success('Votre demande a été envoyée! Un administrateur l\'examinera prochainement.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la demande');
      throw error;
    }
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isFournisseur = () => {
    return state.user?.role === 'fournisseur';
  };

  const isPendingFournisseur = () => {
    return state.user?.role === 'pending_fournisseur';
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    isAdmin,
    isFournisseur,
    isPendingFournisseur,
    updateProfile,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    resetPassword,
    becomeFournisseur
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
