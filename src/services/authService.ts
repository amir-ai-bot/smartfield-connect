
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { toast } from 'sonner';

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
    avatar: data.avatar,
    phone_number: data.phone_number,
    email_verified: !!data.email_verified
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

// Generate a 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a verification code in the database
const createVerificationCode = async (userId: string, type: string): Promise<string> => {
  // Generate a random 6-digit code
  const code = generateVerificationCode();
  
  // Set expiration to 1 hour from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  // Save to database
  const { error } = await supabase
    .from('verification_codes')
    .insert({
      user_id: userId,
      code: code,
      type: type,
      expires_at: expiresAt.toISOString(),
      used: false
    });
  
  if (error) {
    console.error('Error creating verification code:', error);
    throw new Error('Failed to create verification code');
  }
  
  return code;
};

// Send email verification code
const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  // In a real app, you would call an API endpoint or supabase function to send the email
  // For now, we'll just simulate it with a toast notification
  toast.success(`Verification code sent to ${email}: ${code}`);
  console.log(`Verification code sent to ${email}: ${code}`);
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
export const signup = async (name: string, email: string, password: string, phone_number?: string): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: 'user',
        phone_number
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
    role: 'user',
    phone_number: phone_number
  };
  
  // Store in local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  
  // Create and send verification code
  try {
    const code = await createVerificationCode(user.id, 'email_verification');
    await sendVerificationEmail(email, code);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // We still return the user even if the verification code fails
  }
  
  return user;
};

// Verify Email
export const verifyEmail = async (userId: string, code: string): Promise<void> => {
  // Check if code is valid
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('type', 'email_verification')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    throw new Error('Invalid or expired verification code');
  }
  
  // Mark code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', data.id);
  
  // Update user profile
  await supabase
    .from('profiles')
    .update({ email_verified: true })
    .eq('id', userId);
  
  // Update local storage
  const user = getCurrentUser();
  if (user) {
    user.email_verified = true;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  // Check if email exists
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (userError || !userData) {
    throw new Error('Email not found');
  }
  
  // Create and send reset code
  const code = await createVerificationCode(userData.id, 'password_reset');
  
  // In a real app, send an email with the code
  // For now, we'll just simulate it
  toast.success(`Password reset code sent to ${email}: ${code}`);
  console.log(`Password reset code sent to ${email}: ${code}`);
};

// Confirm password reset
export const confirmPasswordReset = async (email: string, code: string, newPassword: string): Promise<void> => {
  // Find user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (userError || !userData) {
    throw new Error('Email not found');
  }
  
  // Check if code is valid
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_id', userData.id)
    .eq('code', code)
    .eq('type', 'password_reset')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    throw new Error('Invalid or expired reset code');
  }
  
  // Update password
  const { error: resetError } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (resetError) {
    throw new Error(resetError.message);
  }
  
  // Mark code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', data.id);
  
  toast.success('Password has been reset successfully');
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
    avatar: data.avatar,
    phone_number: data.phone_number,
    email_verified: !!data.email_verified
  };
  
  // Update local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  
  return updatedUser;
};
