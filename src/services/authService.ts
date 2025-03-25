
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

// Local storage key
const USER_STORAGE_KEY = 'agrismart_user';

// Get user from local storage
export const getCurrentUser = (): User | null => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    return JSON.parse(storedUser) as User;
  }
  return null;
};

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('User not found');
  }
  
  // Create a User object from the Supabase user
  const user: User = {
    id: data.user.id,
    email: data.user.email || '',
    name: data.user.user_metadata?.name || email.split('@')[0],
    role: data.user.user_metadata?.role || 'user',
    avatar: data.user.user_metadata?.avatar_url
  };
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  
  return user;
};

// Signup function
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'user',
      }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error('Failed to create user');
  }
  
  // Create a User object from the Supabase user
  const user: User = {
    id: data.user.id,
    email: data.user.email || '',
    name: name,
    role: 'user'
  };
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  
  return user;
};

// Logout function
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Check if user is an admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return !!user && user.role === 'admin';
};
