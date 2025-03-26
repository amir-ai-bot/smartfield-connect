
// Import only what we need from the existing file, then we'll add our new methods
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { generateRandomCode } from '@/lib/utils';

// Function to login a user
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.user) {
    throw new Error('User not found');
  }

  // Fetch profile data
  const profile = await fetchUserProfile(data.user.id);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
};

// Function to signup a new user
export const signup = async (
  name: string, 
  email: string, 
  password: string,
  phone_number?: string
): Promise<User> => {
  // First register the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone_number
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.user) {
    throw new Error('Failed to create user');
  }

  // Wait for the trigger to create a profile
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Fetch profile data
  const profile = await fetchUserProfile(data.user.id);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Generate and insert verification code
  await generateEmailVerificationCode(data.user.id);

  return profile;
};

// Function to logout a user
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

// Function to fetch a user's profile
export const fetchUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('User profile not found');
  }

  // Convert to our User type - we'll add email_verified later
  const user: User = {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role as 'admin' | 'user' | 'fournisseur',
    phone_number: data.phone_number || undefined,
    email_verified: false, // Default to false
  };

  // Check if email is verified
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      user.email_verified = userData.user.email_confirmed_at !== null;
    }
  } catch (e) {
    console.error('Error checking email verification status:', e);
  }

  return user;
};

// Function to update a user's profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  // Filter out non-profile fields
  const profileUpdates: any = {
    name: updates.name,
    phone_number: updates.phone_number,
    avatar: updates.avatar,
    role: updates.role,
    // Add any other profile fields you want to update
  };
  
  // Remove undefined values
  Object.keys(profileUpdates).forEach(key => 
    profileUpdates[key] === undefined && delete profileUpdates[key]
  );
  
  // Only update if there are valid profile updates
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);
  
    if (error) {
      throw new Error(error.message);
    }
  }
  
  // If email is being updated, update auth credentials
  if (updates.email) {
    const { error } = await supabase.auth.updateUser({
      email: updates.email,
    });
  
    if (error) {
      throw new Error(error.message);
    }
  }
  
  // Return updated profile
  return await fetchUserProfile(userId);
};

// Function to request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  // Check if user exists
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/reset-password',
  });

  if (error) {
    throw new Error(error.message);
  }

  // Generate and store a random code
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  const code = generateRandomCode(6);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Code expires in 1 hour

  const { error: codeError } = await supabase
    .from('verification_codes')
    .insert({
      user_id: userData.id,
      code,
      type: 'password_reset',
      expires_at: expiresAt.toISOString(),
    });

  if (codeError) {
    throw new Error(codeError.message);
  }

  // In a real app, you would send the code via email here
  console.log(`Password reset code for ${email}: ${code}`);
};

// Function to confirm password reset
export const confirmPasswordReset = async (email: string, code: string, newPassword: string): Promise<void> => {
  // Verify the code
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  const { data: codeData, error: codeError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_id', userData.id)
    .eq('code', code)
    .eq('type', 'password_reset')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (codeError || !codeData) {
    throw new Error('Invalid or expired reset code');
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', codeData.id);

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};

// Function to verify email
export const verifyEmail = async (userId: string, code: string): Promise<void> => {
  // Verify the code
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('type', 'email_verification')
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('Invalid or expired verification code');
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', data.id);

  // In a real implementation, you would update a field in your profiles table
  // or call an email verification endpoint in your auth provider

  // For Supabase, email verification is handled automatically when users
  // click the link in their verification email
};

// Helper function to generate and store email verification code
export const generateEmailVerificationCode = async (userId: string): Promise<string> => {
  const code = generateRandomCode(6);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours

  const { error } = await supabase
    .from('verification_codes')
    .insert({
      user_id: userId,
      code,
      type: 'email_verification',
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }

  // In a real app, you would send the code via email here
  console.log(`Email verification code for user ${userId}: ${code}`);
  
  return code;
};

// Function to submit a support message
export const submitSupportMessage = async (userId: string, message: string): Promise<void> => {
  const { error } = await supabase
    .from('support_messages')
    .insert({
      user_id: userId,
      message,
      resolved: false
    });

  if (error) {
    throw new Error(error.message);
  }
};

// Function to rate a fournisseur
export const rateFournisseur = async (
  userId: string, 
  fournisseurId: string, 
  rating: number, 
  comment?: string
): Promise<void> => {
  const { error } = await supabase
    .from('fournisseur_ratings')
    .insert({
      user_id: userId,
      fournisseur_id: fournisseurId,
      rating,
      comment
    });

  if (error) {
    throw new Error(error.message);
  }
};

// Function to get fournisseur ratings
export const getFournisseurRatings = async (fournisseurId: string) => {
  const { data, error } = await supabase
    .from('fournisseur_ratings')
    .select('*')
    .eq('fournisseur_id', fournisseurId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Function to get average fournisseur rating
export const getFournisseurAverageRating = async (fournisseurId: string): Promise<number> => {
  const ratings = await getFournisseurRatings(fournisseurId);
  
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return sum / ratings.length;
};

// Let's add a function to create a project
export const createProject = async (
  userId: string,
  title: string,
  crop: string,
  location: string,
  startDate: string,
  endDate: string,
  description?: string,
  image?: string,
  isPublic: boolean = false
) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      title,
      crop,
      location,
      start_date: startDate,
      end_date: endDate,
      description,
      image,
      is_public: isPublic,
      status: 'planning',
      progress: 0
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Function to get a user's projects
export const getUserProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Function to get public projects
export const getPublicProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_public', true);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Function to update a project
export const updateProject = async (
  projectId: string,
  updates: {
    title?: string;
    crop?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    image?: string;
    isPublic?: boolean;
    status?: 'active' | 'planning' | 'completed';
    progress?: number;
  }
) => {
  // Prepare updates with Supabase column names
  const projectUpdates: any = {
    title: updates.title,
    crop: updates.crop,
    location: updates.location,
    start_date: updates.startDate,
    end_date: updates.endDate,
    description: updates.description,
    image: updates.image,
    is_public: updates.isPublic,
    status: updates.status,
    progress: updates.progress
  };
  
  // Remove undefined values
  Object.keys(projectUpdates).forEach(key => 
    projectUpdates[key] === undefined && delete projectUpdates[key]
  );

  const { data, error } = await supabase
    .from('projects')
    .update(projectUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Function to delete a project
export const deleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }
};
