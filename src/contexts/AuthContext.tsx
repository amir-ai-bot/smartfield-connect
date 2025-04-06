
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/types/supabase';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signUp: (name: string, email: string, password: string, phone_number?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
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
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user);
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
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile data
  const loadProfile = async (user: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
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
    }
  };

  // Derived isAuthenticated value
  const isAuthenticated = !!user;

  const value = {
    user,
    session,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    isAuthenticated,
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
