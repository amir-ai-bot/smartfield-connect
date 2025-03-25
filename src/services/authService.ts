
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

// Local storage key
const USER_STORAGE_KEY = 'agrismart_user';

// Get user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role as 'admin' | 'user',
    avatar: data.avatar
  };
};

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
  
  // Fetch user profile from 'profiles' table
  const profile = await fetchUserProfile(data.user.id);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  
  return profile;
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

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data) {
    throw new Error('Failed to update profile');
  }
  
  const updatedUser: User = {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role as 'admin' | 'user',
    avatar: data.avatar
  };
  
  // Update local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};
